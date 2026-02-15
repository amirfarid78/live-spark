import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  PartyRoom, PartyRoomStatus, PartySeat, SeatStatus, PartyChatMessage,
} from '../../entities/party-room.entity';
import { Profile } from '../../entities/profile.entity';
import { Gift, GiftTransaction } from '../../entities/gift.entity';
import { WalletTransaction, TransactionType, TransactionStatus, CurrencyType } from '../../entities/wallet.entity';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PartyRoomsService {
  constructor(
    @InjectRepository(PartyRoom) private roomsRepo: Repository<PartyRoom>,
    @InjectRepository(PartySeat) private seatsRepo: Repository<PartySeat>,
    @InjectRepository(PartyChatMessage) private chatRepo: Repository<PartyChatMessage>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(Gift) private giftsRepo: Repository<Gift>,
    @InjectRepository(GiftTransaction) private giftTxRepo: Repository<GiftTransaction>,
    @InjectRepository(WalletTransaction) private walletTxRepo: Repository<WalletTransaction>,
    private configService: ConfigService,
    private gateway: RealtimeGateway,
  ) {}

  async createRoom(hostId: string, data: Partial<PartyRoom>) {
    const channel = `party_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

    const room = this.roomsRepo.create({
      host_id: hostId,
      name: data.name || 'Party Room',
      description: data.description,
      cover_url: data.cover_url,
      category: data.category,
      tags: data.tags,
      max_seats: data.max_seats || 8,
      is_private: data.is_private || false,
      password: data.password,
      agora_channel: channel,
      status: PartyRoomStatus.ACTIVE,
    });

    const saved = await this.roomsRepo.save(room);

    // Generate Agora token for the host
    const agoraToken = await this.generateAgoraToken(channel, hostId);
    saved.agora_token = agoraToken;
    await this.roomsRepo.save(saved);

    // Create seats
    const seats: PartySeat[] = [];
    for (let i = 0; i < saved.max_seats; i++) {
      seats.push(this.seatsRepo.create({
        room_id: saved.id,
        seat_number: i,
        status: i === 0 ? SeatStatus.OCCUPIED : SeatStatus.EMPTY,
        user_id: i === 0 ? hostId : undefined,
      }));
    }
    await this.seatsRepo.save(seats);

    return { ...saved, seats };
  }

  async getActiveRooms(page = 1, limit = 20, category?: string) {
    const qb = this.roomsRepo.createQueryBuilder('r')
      .where('r.status = :status', { status: PartyRoomStatus.ACTIVE })
      .andWhere('r.is_private = false');

    if (category) {
      qb.andWhere('r.category = :cat', { cat: category });
    }

    const [items, total] = await qb
      .orderBy('r.listeners_count', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Attach host profiles
    const hostIds = [...new Set(items.map(r => r.host_id))];
    const profiles = hostIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(hostIds) } })
      : [];
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));

    const enriched = items.map(r => ({
      ...r,
      host: profileMap.get(r.host_id) || null,
    }));

    return new PaginatedResult(enriched, total, page, limit);
  }

  async getRoomById(roomId: string) {
    const room = await this.roomsRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    const seats = await this.seatsRepo.find({
      where: { room_id: roomId },
      order: { seat_number: 'ASC' },
    });

    // Get profiles for seated users
    const seatedUserIds = seats.filter(s => s.user_id).map(s => s.user_id);
    const profiles = seatedUserIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(seatedUserIds) } })
      : [];
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));

    const host = await this.profilesRepo.findOne({ where: { user_id: room.host_id } });

    const enrichedSeats = seats.map(s => ({
      ...s,
      user: s.user_id ? profileMap.get(s.user_id) || null : null,
    }));

    return { ...room, host, seats: enrichedSeats };
  }

  async joinRoom(roomId: string, userId: string) {
    const room = await this.roomsRepo.findOne({ where: { id: roomId } });
    if (!room || room.status !== PartyRoomStatus.ACTIVE) {
      throw new NotFoundException('Room not available');
    }

    await this.roomsRepo.increment({ id: roomId }, 'listeners_count', 1);

    // Generate Agora token for the joiner
    const agoraToken = await this.generateAgoraToken(room.agora_channel, userId);

    // Emit realtime event
    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });
    this.gateway.emitToRoom(`party:${roomId}`, 'party:member_joined', {
      user_id: userId,
      username: profile?.username,
      avatar_url: profile?.avatar_url,
      listeners_count: (room.listeners_count || 0) + 1,
    });

    const roomData = await this.getRoomById(roomId);
    return { ...roomData, agora_token: agoraToken, agora_channel: room.agora_channel };
  }

  async leaveRoom(roomId: string, userId: string) {
    // Remove from seat if seated
    await this.seatsRepo.update(
      { room_id: roomId, user_id: userId },
      { status: SeatStatus.EMPTY, user_id: null as any, is_muted: false },
    );

    await this.roomsRepo.decrement({ id: roomId }, 'listeners_count', 1);

    // Emit realtime event
    this.gateway.emitToRoom(`party:${roomId}`, 'party:member_left', {
      user_id: userId,
    });

    return { message: 'Left room' };
  }

  async takeSeat(roomId: string, seatNumber: number, userId: string) {
    const seat = await this.seatsRepo.findOne({
      where: { room_id: roomId, seat_number: seatNumber },
    });
    if (!seat) throw new NotFoundException('Seat not found');
    if (seat.status === SeatStatus.OCCUPIED) throw new BadRequestException('Seat is taken');
    if (seat.status === SeatStatus.LOCKED) throw new BadRequestException('Seat is locked');

    // Check if user already has a seat
    const existingSeat = await this.seatsRepo.findOne({
      where: { room_id: roomId, user_id: userId },
    });
    if (existingSeat) {
      existingSeat.status = SeatStatus.EMPTY;
      existingSeat.user_id = null as any;
      await this.seatsRepo.save(existingSeat);
    }

    seat.status = SeatStatus.OCCUPIED;
    seat.user_id = userId;
    seat.is_muted = false;
    await this.seatsRepo.save(seat);

    // Emit seat change in realtime
    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });
    this.gateway.emitToRoom(`party:${roomId}`, 'party:seat_changed', {
      room_id: roomId,
      seat_number: seatNumber,
      action: 'take',
      user_id: userId,
      username: profile?.username,
      avatar_url: profile?.avatar_url,
    });

    return this.getRoomById(roomId);
  }

  async leaveSeat(roomId: string, userId: string) {
    const seat = await this.seatsRepo.findOne({
      where: { room_id: roomId, user_id: userId },
    });
    if (!seat) throw new NotFoundException('Not seated');

    seat.status = SeatStatus.EMPTY;
    seat.user_id = null as any;
    seat.is_muted = false;
    await this.seatsRepo.save(seat);

    // Emit seat change in realtime
    this.gateway.emitToRoom(`party:${roomId}`, 'party:seat_changed', {
      room_id: roomId,
      seat_number: seat.seat_number,
      action: 'leave',
      user_id: userId,
    });

    return this.getRoomById(roomId);
  }

  async lockSeat(roomId: string, seatNumber: number, hostId: string) {
    const room = await this.roomsRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.host_id !== hostId) throw new ForbiddenException('Only host can lock seats');

    await this.seatsRepo.update(
      { room_id: roomId, seat_number: seatNumber },
      { status: SeatStatus.LOCKED, user_id: null as any },
    );

    // Emit seat change in realtime
    this.gateway.emitToRoom(`party:${roomId}`, 'party:seat_changed', {
      room_id: roomId,
      seat_number: seatNumber,
      action: 'lock',
    });

    return this.getRoomById(roomId);
  }

  async muteSeat(roomId: string, seatNumber: number, hostId: string, muted: boolean) {
    const room = await this.roomsRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.host_id !== hostId) throw new ForbiddenException('Only host can mute');

    await this.seatsRepo.update(
      { room_id: roomId, seat_number: seatNumber },
      { is_muted: muted },
    );

    // Emit realtime event for mute change
    this.gateway.emitToRoom(`party:${roomId}`, 'party:seat_muted', {
      room_id: roomId,
      seat_number: seatNumber,
      is_muted: muted,
    });

    return this.getRoomById(roomId);
  }

  async unlockSeat(roomId: string, seatNumber: number, hostId: string) {
    const room = await this.roomsRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.host_id !== hostId) throw new ForbiddenException('Only host can unlock seats');

    await this.seatsRepo.update(
      { room_id: roomId, seat_number: seatNumber },
      { status: SeatStatus.EMPTY },
    );

    // Emit seat change in realtime
    this.gateway.emitToRoom(`party:${roomId}`, 'party:seat_changed', {
      room_id: roomId,
      seat_number: seatNumber,
      action: 'unlock',
    });

    return this.getRoomById(roomId);
  }

  async kickFromSeat(roomId: string, seatNumber: number, hostId: string) {
    const room = await this.roomsRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.host_id !== hostId) throw new ForbiddenException('Only host can kick users');

    const seat = await this.seatsRepo.findOne({
      where: { room_id: roomId, seat_number: seatNumber },
    });
    if (!seat || !seat.user_id) throw new BadRequestException('Seat is empty');

    const kickedUserId = seat.user_id;
    seat.status = SeatStatus.EMPTY;
    seat.user_id = null as any;
    seat.is_muted = false;
    await this.seatsRepo.save(seat);

    // Emit kick event in realtime
    this.gateway.emitToRoom(`party:${roomId}`, 'party:user_kicked', {
      room_id: roomId,
      seat_number: seatNumber,
      kicked_user_id: kickedUserId,
    });

    this.gateway.emitToRoom(`party:${roomId}`, 'party:seat_changed', {
      room_id: roomId,
      seat_number: seatNumber,
      action: 'kick',
    });

    return this.getRoomById(roomId);
  }

  async endRoom(roomId: string, hostId: string) {
    const room = await this.roomsRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException();
    if (room.host_id !== hostId) throw new ForbiddenException();

    room.status = PartyRoomStatus.ENDED;
    await this.roomsRepo.save(room);

    // Notify all room members
    this.gateway.emitToRoom(`party:${roomId}`, 'party:ended', {
      room_id: roomId,
      message: 'Room has been ended by the host',
    });

    return { message: 'Room ended' };
  }

  async sendChat(roomId: string, userId: string, message: string) {
    const msg = await this.chatRepo.save({
      room_id: roomId,
      user_id: userId,
      message,
    });

    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });

    // Emit chat message in realtime
    this.gateway.emitToRoom(`party:${roomId}`, 'party:chat_message', {
      id: msg.id,
      user_id: userId,
      username: profile?.username,
      avatar_url: profile?.avatar_url,
      message,
      timestamp: msg.created_at,
    });

    return { ...msg, user: profile };
  }

  async getChatHistory(roomId: string, limit = 50) {
    const messages = await this.chatRepo.find({
      where: { room_id: roomId },
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

  async sendGift(roomId: string, senderId: string, receiverId: string, giftId: string, quantity = 1) {
    const room = await this.roomsRepo.findOne({ where: { id: roomId } });
    if (!room || room.status !== PartyRoomStatus.ACTIVE) {
      throw new BadRequestException('Room not active');
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

    // Credit receiver
    const receiverProfile = await this.profilesRepo.findOne({ where: { user_id: receiverId } });
    if (receiverProfile) {
      receiverProfile.diamonds_balance = Number(receiverProfile.diamonds_balance) + receiverDiamonds;
      await this.profilesRepo.save(receiverProfile);
    }

    // Record GiftTransaction
    const giftTx = await this.giftTxRepo.save({
      sender_id: senderId,
      receiver_id: receiverId,
      gift_id: giftId,
      quantity,
      total_coins: totalCoins,
      total_diamonds: receiverDiamonds,
      platform_commission: platformCommission,
      context_type: 'party_room',
      context_id: roomId,
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
        description: `Sent ${quantity}x ${gift.name} in party room`,
        reference_type: 'gift_transaction',
        reference_id: giftTx.id,
      },
      {
        user_id: receiverId,
        type: TransactionType.GIFT_RECEIVED,
        status: TransactionStatus.COMPLETED,
        currency: CurrencyType.DIAMONDS,
        amount: receiverDiamonds,
        balance_after: receiverProfile?.diamonds_balance || 0,
        description: `Received ${quantity}x ${gift.name} in party room`,
        reference_type: 'gift_transaction',
        reference_id: giftTx.id,
      },
    ]);

    // Update gift send count
    await this.giftsRepo.increment({ id: giftId }, 'send_count', quantity);

    // Emit gift animation to room in realtime
    this.gateway.emitToRoom(`party:${roomId}`, 'party:gift_received', {
      sender_id: senderId,
      sender_username: senderProfile?.username,
      sender_avatar: senderProfile?.avatar_url,
      receiver_id: receiverId,
      gift_id: giftId,
      gift_name: gift.name,
      gift_icon: gift.icon_url,
      gift_animation: gift.animation_url,
      is_animated: gift.is_animated,
      quantity,
      coin_value: totalCoins,
      room_id: roomId,
      timestamp: new Date().toISOString(),
    });

    return {
      transaction: giftTx,
      sender_balance: senderProfile.coins_balance,
      gift,
    };
  }

  private async generateAgoraToken(channel: string, uid: string): Promise<string> {
    const appId = this.configService.get('AGORA_APP_ID');
    const appCertificate = this.configService.get('AGORA_APP_CERTIFICATE');

    if (!appId || !appCertificate) {
      // Return a placeholder — Agora won't work without credentials
      return `agora_placeholder_${channel}`;
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
        0,
        RtcRole.PUBLISHER,
        privilegeExpiredTs,
      );
    } catch (error) {
      console.error('Agora token generation failed for party room:', error);
      return `agora_fallback_${channel}`;
    }
  }
}
