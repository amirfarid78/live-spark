import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  LiveStream, LiveStreamStatus, LiveStreamType,
  LiveChatMessage, LiveViewer, LiveGift,
} from '../../entities/live-stream.entity';
import { Profile } from '../../entities/profile.entity';
import { Gift, GiftTransaction } from '../../entities/gift.entity';
import { WalletTransaction, TransactionType, TransactionStatus, CurrencyType } from '../../entities/wallet.entity';
import { Follower } from '../../entities/follower.entity';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LiveService {
  constructor(
    @InjectRepository(LiveStream) private streamsRepo: Repository<LiveStream>,
    @InjectRepository(LiveChatMessage) private chatRepo: Repository<LiveChatMessage>,
    @InjectRepository(LiveViewer) private viewersRepo: Repository<LiveViewer>,
    @InjectRepository(LiveGift) private liveGiftsRepo: Repository<LiveGift>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(Gift) private giftsRepo: Repository<Gift>,
    @InjectRepository(GiftTransaction) private giftTxRepo: Repository<GiftTransaction>,
    @InjectRepository(WalletTransaction) private walletTxRepo: Repository<WalletTransaction>,
    @InjectRepository(Follower) private followersRepo: Repository<Follower>,
    private configService: ConfigService,
    private gateway: RealtimeGateway,
  ) {}

  async goLive(userId: string, data: Partial<LiveStream>) {
    // Check if already live
    const existing = await this.streamsRepo.findOne({
      where: { host_id: userId, status: LiveStreamStatus.LIVE },
    });
    if (existing) throw new BadRequestException('Already streaming');

    const channel = `live_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

    // Generate Agora token
    const agoraToken = await this.generateAgoraToken(channel, userId);

    const stream = this.streamsRepo.create({
      host_id: userId,
      title: data.title || 'Live Stream',
      description: data.description,
      thumbnail_url: data.thumbnail_url,
      stream_type: data.stream_type || LiveStreamType.PUBLIC,
      category: data.category,
      tags: data.tags,
      entry_fee: data.entry_fee || 0,
      agora_channel: channel,
      agora_token: agoraToken,
      status: LiveStreamStatus.LIVE,
      started_at: new Date(),
    });

    const saved = await this.streamsRepo.save(stream);

    // Update profile online status
    await this.profilesRepo.update({ user_id: userId }, { is_online: true });

    // Notify followers that user went live
    const followers = await this.followersRepo.find({
      where: { following_id: userId },
      select: ['follower_id'],
    });
    const hostProfile = await this.profilesRepo.findOne({ where: { user_id: userId } });
    for (const f of followers) {
      this.gateway.emitToUser(f.follower_id, 'notification:new', {
        type: 'live_start',
        stream_id: saved.id,
        host: hostProfile ? { id: userId, username: hostProfile.username, avatar_url: hostProfile.avatar_url } : { id: userId },
        title: saved.title,
        message: `${hostProfile?.username || 'Someone you follow'} started a live stream`,
      });
    }

    return saved;
  }

  async endStream(streamId: string, userId: string) {
    const stream = await this.streamsRepo.findOne({ where: { id: streamId } });
    if (!stream) throw new NotFoundException('Stream not found');
    if (stream.host_id !== userId) throw new ForbiddenException('Not your stream');

    stream.status = LiveStreamStatus.ENDED;
    stream.ended_at = new Date();
    stream.duration = Math.floor((stream.ended_at.getTime() - stream.started_at.getTime()) / 1000);

    await this.streamsRepo.save(stream);
    await this.profilesRepo.update({ user_id: userId }, { is_online: false });

    // Notify all viewers that stream ended
    this.gateway.emitToRoom(`live:${streamId}`, 'live:ended', {
      stream_id: streamId,
      duration: stream.duration,
      total_viewers: stream.total_viewers,
      gifts_earned: stream.gifts_earned,
    });

    return stream;
  }

  async getActiveStreams(page = 1, limit = 20, category?: string) {
    const qb = this.streamsRepo.createQueryBuilder('s')
      .where('s.status = :status', { status: LiveStreamStatus.LIVE })
      .andWhere('s.stream_type IN (:...types)', { types: [LiveStreamType.PUBLIC, LiveStreamType.PAID] });

    if (category) {
      qb.andWhere('s.category = :cat', { cat: category });
    }

    const [items, total] = await qb
      .orderBy('s.viewers_count', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Attach host profiles
    const hostIds = [...new Set(items.map(s => s.host_id))];
    const profiles = hostIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(hostIds) } })
      : [];
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));

    const enriched = items.map(s => ({
      ...s,
      host: profileMap.get(s.host_id) || null,
    }));

    return new PaginatedResult(enriched, total, page, limit);
  }

  async getStreamById(streamId: string) {
    const stream = await this.streamsRepo.findOne({ where: { id: streamId } });
    if (!stream) throw new NotFoundException('Stream not found');

    const host = await this.profilesRepo.findOne({ where: { user_id: stream.host_id } });
    return { ...stream, host };
  }

  async joinStream(streamId: string, userId: string) {
    const stream = await this.streamsRepo.findOne({ where: { id: streamId } });
    if (!stream || stream.status !== LiveStreamStatus.LIVE) {
      throw new NotFoundException('Stream not available');
    }

    // Record viewer
    await this.viewersRepo.save({
      stream_id: streamId,
      user_id: userId,
      joined_at: new Date(),
    });

    // Update counts
    await this.streamsRepo.increment({ id: streamId }, 'viewers_count', 1);
    await this.streamsRepo.increment({ id: streamId }, 'total_viewers', 1);

    // Check peak
    const updated = await this.streamsRepo.findOne({ where: { id: streamId } });
    if (updated && updated.viewers_count > updated.peak_viewers) {
      updated.peak_viewers = updated.viewers_count;
      await this.streamsRepo.save(updated);
    }

    // Generate viewer Agora token (only if channel exists)
    const token = stream.agora_channel 
      ? await this.generateAgoraToken(stream.agora_channel, userId)
      : undefined;

    // Emit viewer count update to all watchers
    const updatedStream = await this.streamsRepo.findOne({ where: { id: streamId } });
    this.gateway.emitToRoom(`live:${streamId}`, 'live:viewer_count_update', {
      stream_id: streamId,
      count: updatedStream?.viewers_count || 0,
    });

    return {
      stream,
      agora_token: token,
      agora_channel: stream.agora_channel,
    };
  }

  async leaveStream(streamId: string, userId: string) {
    const viewer = await this.viewersRepo.findOne({
      where: { stream_id: streamId, user_id: userId, left_at: null as any },
    });

    if (viewer) {
      viewer.left_at = new Date();
      viewer.watch_duration = Math.floor(
        (viewer.left_at.getTime() - viewer.joined_at.getTime()) / 1000,
      );
      await this.viewersRepo.save(viewer);
    }

    await this.streamsRepo.decrement({ id: streamId }, 'viewers_count', 1);
    return { message: 'Left stream' };
  }

  async sendChatMessage(streamId: string, userId: string, message: string, type = 'text') {
    const chatMsg = await this.chatRepo.save({
      stream_id: streamId,
      user_id: userId,
      message,
      type,
    });

    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });

    // Emit chat message in real-time
    this.gateway.emitToRoom(`live:${streamId}`, 'live:chat_message', {
      id: chatMsg.id,
      user_id: userId,
      username: profile?.username,
      avatar_url: profile?.avatar_url,
      message,
      type,
      timestamp: chatMsg.created_at,
    });

    return { ...chatMsg, user: profile };
  }

  async sendGift(streamId: string, senderId: string, giftId: string, quantity = 1) {
    const stream = await this.streamsRepo.findOne({ where: { id: streamId } });
    if (!stream || stream.status !== LiveStreamStatus.LIVE) {
      throw new BadRequestException('Stream not active');
    }

    const gift = await this.giftsRepo.findOne({ where: { id: giftId } });
    if (!gift) throw new NotFoundException('Gift not found');

    const totalCoins = Number(gift.coin_price) * quantity;
    const totalDiamonds = Number(gift.diamond_value) * quantity;

    // Check sender balance
    const senderProfile = await this.profilesRepo.findOne({ where: { user_id: senderId } });
    if (!senderProfile || Number(senderProfile.coins_balance) < totalCoins) {
      throw new BadRequestException('Insufficient coins');
    }

    // Platform commission (30%)
    const commissionRate = 0.30;
    const platformCommission = totalDiamonds * commissionRate;
    const receiverDiamonds = totalDiamonds - platformCommission;

    // Deduct from sender
    senderProfile.coins_balance = Number(senderProfile.coins_balance) - totalCoins;
    await this.profilesRepo.save(senderProfile);

    // Credit receiver (host)
    const receiverProfile = await this.profilesRepo.findOne({ where: { user_id: stream.host_id } });
    if (receiverProfile) {
      receiverProfile.diamonds_balance = Number(receiverProfile.diamonds_balance) + receiverDiamonds;
      await this.profilesRepo.save(receiverProfile);
    }

    // Record LiveGift
    await this.liveGiftsRepo.save({
      stream_id: streamId,
      sender_id: senderId,
      receiver_id: stream.host_id,
      gift_id: giftId,
      quantity,
      coin_value: totalCoins,
      diamond_value: receiverDiamonds,
    });

    // Record GiftTransaction
    const giftTx = await this.giftTxRepo.save({
      sender_id: senderId,
      receiver_id: stream.host_id,
      gift_id: giftId,
      quantity,
      total_coins: totalCoins,
      total_diamonds: receiverDiamonds,
      platform_commission: platformCommission,
      context_type: 'live_stream',
      context_id: streamId,
    });

    // Record wallet transactions
    await this.walletTxRepo.save([
      {
        user_id: senderId,
        type: TransactionType.GIFT_SENT,
        status: TransactionStatus.COMPLETED,
        currency: CurrencyType.COINS,
        amount: -totalCoins,
        balance_after: senderProfile.coins_balance,
        description: `Sent ${quantity}x ${gift.name} in live stream`,
        reference_type: 'gift_transaction',
        reference_id: giftTx.id,
      },
      {
        user_id: stream.host_id,
        type: TransactionType.GIFT_RECEIVED,
        status: TransactionStatus.COMPLETED,
        currency: CurrencyType.DIAMONDS,
        amount: receiverDiamonds,
        balance_after: receiverProfile?.diamonds_balance || 0,
        description: `Received ${quantity}x ${gift.name} in live stream`,
        reference_type: 'gift_transaction',
        reference_id: giftTx.id,
      },
    ]);

    // Update stream gifts_earned
    stream.gifts_earned = Number(stream.gifts_earned) + totalCoins;
    await this.streamsRepo.save(stream);

    // Update gift send count
    await this.giftsRepo.increment({ id: giftId }, 'send_count', quantity);

    // Emit gift animation to all viewers in real-time
    this.gateway.emitToRoom(`live:${streamId}`, 'live:gift_received', {
      sender_id: senderId,
      sender_username: senderProfile?.username,
      sender_avatar: senderProfile?.avatar_url,
      gift_id: giftId,
      gift_name: gift.name,
      gift_icon: gift.icon_url,
      gift_animation: gift.animation_url,
      is_animated: gift.is_animated,
      quantity,
      coin_value: totalCoins,
      stream_id: streamId,
      timestamp: new Date().toISOString(),
    });

    return {
      transaction: giftTx,
      sender_balance: senderProfile.coins_balance,
      gift,
    };
  }

  async getChatHistory(streamId: string, limit = 50) {
    const messages = await this.chatRepo.find({
      where: { stream_id: streamId },
      order: { created_at: 'DESC' },
      take: limit,
    });

    const userIds = [...new Set(messages.map(m => m.user_id))];
    const profiles = userIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(userIds) } })
      : [];
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));

    return messages.reverse().map(m => ({
      ...m,
      user: profileMap.get(m.user_id) || null,
    }));
  }

  async getStreamViewers(streamId: string) {
    const viewers = await this.viewersRepo.find({
      where: { stream_id: streamId, left_at: null as any },
      order: { joined_at: 'ASC' },
    });

    const userIds = viewers.map(v => v.user_id);
    const profiles = userIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(userIds) } })
      : [];

    return profiles;
  }

  async getStreamHistory(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.streamsRepo.findAndCount({
      where: { host_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return new PaginatedResult(items, total, page, limit);
  }

  async getFeaturedStreams(limit = 5) {
    return this.streamsRepo.find({
      where: { status: LiveStreamStatus.LIVE },
      order: { viewers_count: 'DESC' },
      take: limit,
    });
  }

  // Admin methods
  async adminForceEndStream(streamId: string) {
    const stream = await this.streamsRepo.findOne({ where: { id: streamId } });
    if (!stream) throw new NotFoundException('Stream not found');

    stream.status = LiveStreamStatus.ENDED;
    stream.ended_at = new Date();
    await this.streamsRepo.save(stream);
    await this.profilesRepo.update({ user_id: stream.host_id }, { is_online: false });

    // Notify all viewers
    this.gateway.emitToRoom(`live:${streamId}`, 'live:force_ended', {
      stream_id: streamId,
      reason: 'Stream was ended by a moderator',
    });

    return { message: 'Stream force-ended' };
  }

  async adminGetAllActiveStreams() {
    return this.streamsRepo.find({
      where: { status: LiveStreamStatus.LIVE },
      order: { viewers_count: 'DESC' },
    });
  }

  private async generateAgoraToken(channel: string, uid: string): Promise<string | undefined> {
    const appId = this.configService.get('AGORA_APP_ID');
    const appCertificate = this.configService.get('AGORA_APP_CERTIFICATE');

    // If no certificate, return undefined - works for Agora projects in testing/no-auth mode
    if (!appId || !appCertificate) {
      console.log('[Agora] No certificate configured, returning undefined token (testing mode)');
      return undefined;
    }

    try {
      const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
      const expirationTimeInSeconds = 3600;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      return RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channel,
        0, // uid as 0 for string UID
        RtcRole.PUBLISHER,
        privilegeExpiredTs,
      );
    } catch (error) {
      console.error('Agora token generation failed:', error);
      return undefined;
    }
  }
}
