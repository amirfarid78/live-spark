import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gift, GiftCategory, GiftTransaction } from '../../entities/gift.entity';
import { Profile } from '../../entities/profile.entity';
import {
  WalletTransaction, TransactionType, TransactionStatus, CurrencyType,
} from '../../entities/wallet.entity';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class GiftsService {
  constructor(
    @InjectRepository(Gift) private giftsRepo: Repository<Gift>,
    @InjectRepository(GiftTransaction) private txRepo: Repository<GiftTransaction>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(WalletTransaction) private walletTxRepo: Repository<WalletTransaction>,
    private gateway: RealtimeGateway,
  ) {}

  async getGiftCatalog(category?: GiftCategory) {
    const where: any = { is_active: true };
    if (category) where.category = category;

    return this.giftsRepo.find({
      where,
      order: { sort_order: 'ASC', coin_price: 'ASC' },
    });
  }

  async getGiftById(giftId: string) {
    const gift = await this.giftsRepo.findOne({ where: { id: giftId } });
    if (!gift) throw new NotFoundException('Gift not found');
    return gift;
  }

  async sendGift(
    senderId: string,
    receiverId: string,
    giftId: string,
    quantity: number,
    contextType?: string,
    contextId?: string,
  ) {
    const gift = await this.giftsRepo.findOne({ where: { id: giftId } });
    if (!gift) throw new NotFoundException('Gift not found');

    const totalCoins = Number(gift.coin_price) * quantity;
    const totalDiamonds = Number(gift.diamond_value) * quantity;

    // Check balance
    const senderProfile = await this.profilesRepo.findOne({ where: { user_id: senderId } });
    if (!senderProfile || Number(senderProfile.coins_balance) < totalCoins) {
      throw new BadRequestException('Insufficient coins');
    }

    // Platform commission (default 30%)
    const commissionRate = 0.30;
    const platformCommission = totalDiamonds * commissionRate;
    const receiverDiamonds = totalDiamonds - platformCommission;

    // Deduct from sender
    senderProfile.coins_balance = Number(senderProfile.coins_balance) - totalCoins;
    await this.profilesRepo.save(senderProfile);

    // Add to receiver
    const receiverProfile = await this.profilesRepo.findOne({ where: { user_id: receiverId } });
    if (receiverProfile) {
      receiverProfile.diamonds_balance = Number(receiverProfile.diamonds_balance) + receiverDiamonds;
      await this.profilesRepo.save(receiverProfile);
    }

    // Record transaction
    const tx = await this.txRepo.save({
      sender_id: senderId,
      receiver_id: receiverId,
      gift_id: giftId,
      quantity,
      total_coins: totalCoins,
      total_diamonds: receiverDiamonds,
      platform_commission: platformCommission,
      context_type: contextType,
      context_id: contextId,
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
        description: `Sent ${quantity}x ${gift.name}`,
        reference_type: 'gift_transaction',
        reference_id: tx.id,
      },
      {
        user_id: receiverId,
        type: TransactionType.GIFT_RECEIVED,
        status: TransactionStatus.COMPLETED,
        currency: CurrencyType.DIAMONDS,
        amount: receiverDiamonds,
        balance_after: receiverProfile?.diamonds_balance || 0,
        description: `Received ${quantity}x ${gift.name}`,
        reference_type: 'gift_transaction',
        reference_id: tx.id,
      },
    ]);

    // Update gift send count
    await this.giftsRepo.increment({ id: giftId }, 'send_count', quantity);

    // Notify receiver in real-time
    this.gateway.emitToUser(receiverId, 'notification:new', {
      type: 'gift',
      sender: { id: senderId, username: senderProfile?.username, avatar_url: senderProfile?.avatar_url },
      gift: { id: giftId, name: gift.name, icon_url: gift.icon_url },
      quantity,
      diamonds_received: receiverDiamonds,
      message: `${senderProfile?.username || 'Someone'} sent you ${quantity}x ${gift.name}!`,
    });

    return {
      transaction: tx,
      sender_balance: senderProfile.coins_balance,
      gift,
    };
  }

  async getGiftHistory(userId: string, direction: 'sent' | 'received', page = 1, limit = 20) {
    const where = direction === 'sent'
      ? { sender_id: userId }
      : { receiver_id: userId };

    const [items, total] = await this.txRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return new PaginatedResult(items, total, page, limit);
  }

  // Admin methods
  async createGift(data: Partial<Gift>) {
    return this.giftsRepo.save(data);
  }

  async updateGift(giftId: string, data: Partial<Gift>) {
    await this.giftsRepo.update(giftId, data);
    return this.giftsRepo.findOne({ where: { id: giftId } });
  }

  async deleteGift(giftId: string) {
    await this.giftsRepo.update(giftId, { is_active: false });
    return { message: 'Gift deactivated' };
  }
}
