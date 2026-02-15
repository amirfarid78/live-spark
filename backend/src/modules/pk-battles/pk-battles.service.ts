import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  PKBattle, PKBattleStatus, PKBattleGift,
} from '../../entities/pk-battle.entity';
import { LiveStream, LiveStreamStatus } from '../../entities/live-stream.entity';
import { Profile } from '../../entities/profile.entity';
import { Gift, GiftTransaction } from '../../entities/gift.entity';
import { WalletTransaction, TransactionType, TransactionStatus, CurrencyType } from '../../entities/wallet.entity';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PkBattlesService {
  constructor(
    @InjectRepository(PKBattle) private battlesRepo: Repository<PKBattle>,
    @InjectRepository(PKBattleGift) private battleGiftsRepo: Repository<PKBattleGift>,
    @InjectRepository(LiveStream) private streamsRepo: Repository<LiveStream>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(Gift) private giftsRepo: Repository<Gift>,
    @InjectRepository(GiftTransaction) private giftTxRepo: Repository<GiftTransaction>,
    @InjectRepository(WalletTransaction) private walletTxRepo: Repository<WalletTransaction>,
    private gateway: RealtimeGateway,
  ) {}

  async inviteToPK(challengerId: string, opponentId: string, duration = 180) {
    if (challengerId === opponentId) {
      throw new BadRequestException('Cannot challenge yourself');
    }

    // Check if challenger is live
    const challengerStream = await this.streamsRepo.findOne({
      where: { host_id: challengerId, status: LiveStreamStatus.LIVE },
    });
    if (!challengerStream) throw new BadRequestException('You must be live to start PK');

    const battle = this.battlesRepo.create({
      challenger_id: challengerId,
      opponent_id: opponentId,
      challenger_stream_id: challengerStream.id,
      duration,
      status: PKBattleStatus.PENDING,
      agora_channel: `pk_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
    });

    const saved = await this.battlesRepo.save(battle);

    // Notify opponent via realtime
    const challengerProfile = await this.profilesRepo.findOne({ where: { user_id: challengerId } });
    this.gateway.emitToUser(opponentId, 'pk:invite', {
      battle_id: saved.id,
      challenger: challengerProfile ? {
        id: challengerId,
        username: challengerProfile.username,
        avatar_url: challengerProfile.avatar_url,
        level: challengerProfile.level,
      } : { id: challengerId },
      duration,
    });

    return saved;
  }

  async respondToPK(battleId: string, userId: string, accept: boolean) {
    const battle = await this.battlesRepo.findOne({ where: { id: battleId } });
    if (!battle) throw new NotFoundException('Battle not found');
    if (battle.opponent_id !== userId) throw new BadRequestException('Not your invitation');
    if (battle.status !== PKBattleStatus.PENDING) throw new BadRequestException('Battle already responded');

    if (!accept) {
      battle.status = PKBattleStatus.DECLINED;
      const saved = await this.battlesRepo.save(battle);
      // Notify challenger of decline
      this.gateway.emitToUser(battle.challenger_id, 'pk:declined', { battle_id: battleId });
      return saved;
    }

    // Check opponent is live
    const opponentStream = await this.streamsRepo.findOne({
      where: { host_id: userId, status: LiveStreamStatus.LIVE },
    });
    if (!opponentStream) throw new BadRequestException('You must be live to accept PK');

    battle.status = PKBattleStatus.ACCEPTED;
    battle.opponent_stream_id = opponentStream.id;
    const saved = await this.battlesRepo.save(battle);

    // Notify challenger that PK was accepted
    this.gateway.emitToUser(battle.challenger_id, 'pk:accepted', {
      battle_id: battleId,
      opponent_stream_id: opponentStream.id,
    });

    return saved;
  }

  async startPK(battleId: string) {
    const battle = await this.battlesRepo.findOne({ where: { id: battleId } });
    if (!battle || battle.status !== PKBattleStatus.ACCEPTED) {
      throw new BadRequestException('Battle not ready');
    }

    battle.status = PKBattleStatus.IN_PROGRESS;
    battle.started_at = new Date();
    const saved = await this.battlesRepo.save(battle);

    // Notify both streamers' audiences
    this.gateway.emitToRoom(`pk:${battleId}`, 'pk:started', {
      battle_id: battleId,
      challenger_id: battle.challenger_id,
      opponent_id: battle.opponent_id,
      duration: battle.duration,
      started_at: battle.started_at,
    });
    if (battle.challenger_stream_id) {
      this.gateway.emitToRoom(`live:${battle.challenger_stream_id}`, 'pk:started', {
        battle_id: battleId, duration: battle.duration,
      });
    }
    if (battle.opponent_stream_id) {
      this.gateway.emitToRoom(`live:${battle.opponent_stream_id}`, 'pk:started', {
        battle_id: battleId, duration: battle.duration,
      });
    }

    return saved;
  }

  async endPK(battleId: string) {
    const battle = await this.battlesRepo.findOne({ where: { id: battleId } });
    if (!battle || battle.status !== PKBattleStatus.IN_PROGRESS) {
      throw new BadRequestException('Battle not in progress');
    }

    battle.status = PKBattleStatus.COMPLETED;
    battle.ended_at = new Date();

    // Determine winner
    if (battle.challenger_score > battle.opponent_score) {
      battle.winner_id = battle.challenger_id;
    } else if (battle.opponent_score > battle.challenger_score) {
      battle.winner_id = battle.opponent_id;
    }
    // null winner_id = draw

    const saved = await this.battlesRepo.save(battle);

    // Fetch profiles for the result
    const [challenger, opponent] = await Promise.all([
      this.profilesRepo.findOne({ where: { user_id: battle.challenger_id } }),
      this.profilesRepo.findOne({ where: { user_id: battle.opponent_id } }),
    ]);

    // Emit PK result to all viewers
    const resultData = {
      battle_id: battleId,
      winner_id: battle.winner_id,
      challenger_score: battle.challenger_score,
      opponent_score: battle.opponent_score,
      challenger: challenger ? { id: battle.challenger_id, username: challenger.username, avatar_url: challenger.avatar_url } : null,
      opponent: opponent ? { id: battle.opponent_id, username: opponent.username, avatar_url: opponent.avatar_url } : null,
      is_draw: !battle.winner_id,
    };
    this.gateway.emitToRoom(`pk:${battleId}`, 'pk:result', resultData);
    if (battle.challenger_stream_id) {
      this.gateway.emitToRoom(`live:${battle.challenger_stream_id}`, 'pk:result', resultData);
    }
    if (battle.opponent_stream_id) {
      this.gateway.emitToRoom(`live:${battle.opponent_stream_id}`, 'pk:result', resultData);
    }

    return { ...saved, challenger, opponent };
  }

  async sendGift(battleId: string, senderId: string, targetId: string, giftId: string, coinValue: number, quantity = 1) {
    const battle = await this.battlesRepo.findOne({ where: { id: battleId } });
    if (!battle || battle.status !== PKBattleStatus.IN_PROGRESS) {
      throw new BadRequestException('Battle not active');
    }

    // Validate target is one of the battlers
    if (targetId !== battle.challenger_id && targetId !== battle.opponent_id) {
      throw new BadRequestException('Invalid target — must be one of the battlers');
    }

    // Fetch the actual gift from DB
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

    // Credit target streamer
    const receiverProfile = await this.profilesRepo.findOne({ where: { user_id: targetId } });
    if (receiverProfile) {
      receiverProfile.diamonds_balance = Number(receiverProfile.diamonds_balance) + receiverDiamonds;
      await this.profilesRepo.save(receiverProfile);
    }

    // Record PK battle gift
    await this.battleGiftsRepo.save({
      battle_id: battleId,
      sender_id: senderId,
      target_id: targetId,
      gift_id: giftId,
      quantity,
      coin_value: totalCoins,
    });

    // Record GiftTransaction
    const giftTx = await this.giftTxRepo.save({
      sender_id: senderId,
      receiver_id: targetId,
      gift_id: giftId,
      quantity,
      total_coins: totalCoins,
      total_diamonds: receiverDiamonds,
      platform_commission: platformCommission,
      context_type: 'pk_battle',
      context_id: battleId,
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
        description: `Sent ${quantity}x ${gift.name} in PK battle`,
        reference_type: 'gift_transaction',
        reference_id: giftTx.id,
      },
      {
        user_id: targetId,
        type: TransactionType.GIFT_RECEIVED,
        status: TransactionStatus.COMPLETED,
        currency: CurrencyType.DIAMONDS,
        amount: receiverDiamonds,
        balance_after: receiverProfile?.diamonds_balance || 0,
        description: `Received ${quantity}x ${gift.name} in PK battle`,
        reference_type: 'gift_transaction',
        reference_id: giftTx.id,
      },
    ]);

    // Update gift send count
    await this.giftsRepo.increment({ id: giftId }, 'send_count', quantity);

    // Update PK scores
    if (targetId === battle.challenger_id) {
      battle.challenger_score = Number(battle.challenger_score) + totalCoins;
    } else {
      battle.opponent_score = Number(battle.opponent_score) + totalCoins;
    }
    await this.battlesRepo.save(battle);

    // Emit score update in real-time to PK room and both live streams
    const scoreData = {
      battle_id: battleId,
      challenger_score: battle.challenger_score,
      opponent_score: battle.opponent_score,
      last_gift: {
        sender_id: senderId,
        sender_username: senderProfile?.username,
        target_id: targetId,
        gift_name: gift.name,
        gift_icon: gift.icon_url,
        gift_animation: gift.animation_url,
        quantity,
        coin_value: totalCoins,
      },
    };
    this.gateway.emitToRoom(`pk:${battleId}`, 'pk:score_changed', scoreData);
    if (battle.challenger_stream_id) {
      this.gateway.emitToRoom(`live:${battle.challenger_stream_id}`, 'pk:score_changed', scoreData);
    }
    if (battle.opponent_stream_id) {
      this.gateway.emitToRoom(`live:${battle.opponent_stream_id}`, 'pk:score_changed', scoreData);
    }

    return {
      challenger_score: battle.challenger_score,
      opponent_score: battle.opponent_score,
      sender_balance: senderProfile.coins_balance,
    };
  }

  async getBattle(battleId: string) {
    const battle = await this.battlesRepo.findOne({ where: { id: battleId } });
    if (!battle) throw new NotFoundException('Battle not found');

    const [challenger, opponent] = await Promise.all([
      this.profilesRepo.findOne({ where: { user_id: battle.challenger_id } }),
      this.profilesRepo.findOne({ where: { user_id: battle.opponent_id } }),
    ]);

    return { ...battle, challenger, opponent };
  }

  async getActiveBattles(page = 1, limit = 20) {
    const [items, total] = await this.battlesRepo.findAndCount({
      where: { status: PKBattleStatus.IN_PROGRESS },
      order: { started_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return new PaginatedResult(items, total, page, limit);
  }

  async getUserBattleHistory(userId: string, page = 1, limit = 20) {
    const qb = this.battlesRepo.createQueryBuilder('b')
      .where('(b.challenger_id = :uid OR b.opponent_id = :uid)', { uid: userId })
      .andWhere('b.status = :status', { status: PKBattleStatus.COMPLETED })
      .orderBy('b.ended_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return new PaginatedResult(items, total, page, limit);
  }
}
