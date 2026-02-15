import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Conversation, ConversationParticipant, Message,
} from '../../entities/chat.entity';
import { Profile } from '../../entities/profile.entity';
import { UserBlock } from '../../entities/user-block.entity';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../entities/notification.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation) private convoRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant) private participantRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(UserBlock) private blocksRepo: Repository<UserBlock>,
    private realtimeGateway: RealtimeGateway,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async getOrCreateDirectConversation(userId: string, targetUserId: string) {
    // Check if blocked
    const blocked = await this.blocksRepo.findOne({
      where: [
        { blocker_id: targetUserId, blocked_id: userId },
        { blocker_id: userId, blocked_id: targetUserId },
      ],
    });
    if (blocked) throw new ForbiddenException('Cannot message this user');

    // Find existing direct conversation
    const existing = await this.participantRepo
      .createQueryBuilder('p1')
      .innerJoin('conversation_participants', 'p2', 'p1.conversation_id = p2.conversation_id')
      .innerJoin('conversations', 'c', 'c.id = p1.conversation_id')
      .where('p1.user_id = :uid', { uid: userId })
      .andWhere('p2.user_id = :tid', { tid: targetUserId })
      .andWhere('c.type = :type', { type: 'direct' })
      .getOne();

    if (existing) {
      return this.getConversationWithDetails(existing.conversation_id, userId);
    }

    // Create new
    const conversation = await this.convoRepo.save({ type: 'direct' });
    await this.participantRepo.save([
      { conversation_id: conversation.id, user_id: userId },
      { conversation_id: conversation.id, user_id: targetUserId },
    ]);

    return this.getConversationWithDetails(conversation.id, userId);
  }

  async getConversations(userId: string, page = 1, limit = 20) {
    const participantRecords = await this.participantRepo.find({
      where: { user_id: userId },
      order: { joined_at: 'DESC' },
    });

    const convoIds = participantRecords.map(p => p.conversation_id);
    if (convoIds.length === 0) return new PaginatedResult([], 0, page, limit);

    const conversations = await this.convoRepo.find({
      where: { id: In(convoIds) },
      order: { last_message_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Enrich with participants and last message
    const enriched = await Promise.all(
      conversations.map(c => this.getConversationWithDetails(c.id, userId)),
    );

    return new PaginatedResult(enriched, convoIds.length, page, limit);
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type = 'text',
    media?: any,
    replyToId?: string,
  ) {
    // Verify participation
    const participant = await this.participantRepo.findOne({
      where: { conversation_id: conversationId, user_id: senderId },
    });
    if (!participant) throw new ForbiddenException('Not a participant');

    const message = await this.messageRepo.save({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      type,
      media,
      reply_to_id: replyToId,
    });

    // Update conversation
    await this.convoRepo.update(conversationId, {
      last_message_id: message.id,
      last_message_at: new Date(),
    });

    // Increment unread for other participants
    await this.participantRepo
      .createQueryBuilder()
      .update()
      .set({ unread_count: () => 'unread_count + 1' })
      .where('conversation_id = :cid AND user_id != :uid', {
        cid: conversationId,
        uid: senderId,
      })
      .execute();

    const senderProfile = await this.profilesRepo.findOne({ where: { user_id: senderId } });
    const messageWithSender = { ...message, sender: senderProfile };

    // Get all participants to notify
    const allParticipants = await this.participantRepo.find({
      where: { conversation_id: conversationId },
    });

    // Emit real-time event via WebSocket
    this.realtimeGateway.emitToRoom(`chat:${conversationId}`, 'chat:new_message', {
      ...messageWithSender,
      conversation_id: conversationId,
      timestamp: new Date().toISOString(),
    });

    // Send push notification to other participants who are offline
    for (const p of allParticipants) {
      if (p.user_id !== senderId) {
        // Check if user is online - if not, send push
        if (!this.realtimeGateway.isUserOnline(p.user_id)) {
          await this.notificationsService.createNotification({
            user_id: p.user_id,
            type: NotificationType.MESSAGE,
            title: senderProfile?.display_name || senderProfile?.username || 'New message',
            body: type === 'text' ? content.substring(0, 100) : `Sent a ${type}`,
            actor_id: senderId,
            data: {
              conversation_id: conversationId,
              message_id: message.id,
            },
          });
        }
      }
    }

    return messageWithSender;
  }

  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    const participant = await this.participantRepo.findOne({
      where: { conversation_id: conversationId, user_id: userId },
    });
    if (!participant) throw new ForbiddenException('Not a participant');

    const [items, total] = await this.messageRepo.findAndCount({
      where: { conversation_id: conversationId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Attach sender profiles
    const senderIds = [...new Set(items.map(m => m.sender_id))];
    const profiles = senderIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(senderIds) } })
      : [];
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));

    const enriched = items.map(m => ({
      ...m, sender: profileMap.get(m.sender_id) || null,
    }));

    // Mark as read
    await this.participantRepo.update(
      { conversation_id: conversationId, user_id: userId },
      { unread_count: 0, last_read_at: new Date() },
    );

    return new PaginatedResult(enriched.reverse(), total, page, limit);
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException();
    if (message.sender_id !== userId) throw new ForbiddenException();
    await this.messageRepo.softDelete(messageId);
    return { message: 'Message deleted' };
  }

  async markRead(conversationId: string, userId: string) {
    await this.participantRepo.update(
      { conversation_id: conversationId, user_id: userId },
      { unread_count: 0, last_read_at: new Date() },
    );
    return { message: 'Marked as read' };
  }

  async getUnreadCount(userId: string) {
    const result = await this.participantRepo
      .createQueryBuilder('p')
      .select('SUM(p.unread_count)', 'total')
      .where('p.user_id = :uid', { uid: userId })
      .getRawOne();

    return { unread_count: parseInt(result?.total || '0') };
  }

  private async getConversationWithDetails(conversationId: string, userId: string) {
    const conversation = await this.convoRepo.findOne({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const participants = await this.participantRepo.find({
      where: { conversation_id: conversationId },
    });

    const userIds = participants.map(p => p.user_id);
    const profiles = await this.profilesRepo.find({
      where: { user_id: In(userIds) },
    });

    const myParticipant = participants.find(p => p.user_id === userId);
    const otherProfile = profiles.find(p => p.user_id !== userId);

    let lastMessage: Message | null = null;
    if (conversation.last_message_id) {
      lastMessage = await this.messageRepo.findOne({
        where: { id: conversation.last_message_id },
      });
    }

    return {
      ...conversation,
      participants: profiles,
      unread_count: myParticipant?.unread_count || 0,
      other_user: otherProfile,
      last_message: lastMessage,
    };
  }
}
