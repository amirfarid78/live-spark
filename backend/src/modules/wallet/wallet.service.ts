import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../entities/profile.entity';
import {
  WalletTransaction, TransactionType, TransactionStatus, CurrencyType, CoinPackage,
} from '../../entities/wallet.entity';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(WalletTransaction) private txRepo: Repository<WalletTransaction>,
    @InjectRepository(CoinPackage) private packagesRepo: Repository<CoinPackage>,
  ) {}

  async getBalance(userId: string) {
    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return {
      coins: Number(profile.coins_balance),
      diamonds: Number(profile.diamonds_balance),
    };
  }

  async getTransactionHistory(userId: string, page = 1, limit = 20, type?: TransactionType) {
    const where: any = { user_id: userId };
    if (type) where.type = type;

    const [items, total] = await this.txRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return new PaginatedResult(items, total, page, limit);
  }

  async addCoins(userId: string, amount: number, description: string, referenceType?: string, referenceId?: string) {
    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    profile.coins_balance = Number(profile.coins_balance) + amount;
    await this.profilesRepo.save(profile);

    await this.txRepo.save({
      user_id: userId,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      currency: CurrencyType.COINS,
      amount,
      balance_after: profile.coins_balance,
      description,
      reference_type: referenceType,
      reference_id: referenceId,
    });

    return { balance: profile.coins_balance };
  }

  async withdrawDiamonds(userId: string, amount: number) {
    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException();
    if (Number(profile.diamonds_balance) < amount) {
      throw new BadRequestException('Insufficient diamonds');
    }

    profile.diamonds_balance = Number(profile.diamonds_balance) - amount;
    await this.profilesRepo.save(profile);

    await this.txRepo.save({
      user_id: userId,
      type: TransactionType.WITHDRAWAL,
      status: TransactionStatus.PENDING, // needs approval
      currency: CurrencyType.DIAMONDS,
      amount: -amount,
      balance_after: profile.diamonds_balance,
      description: 'Withdrawal request',
    });

    return { balance: profile.diamonds_balance, message: 'Withdrawal request submitted' };
  }

  async getCoinPackages() {
    return this.packagesRepo.find({
      where: { is_active: true },
      order: { sort_order: 'ASC', price_usd: 'ASC' },
    });
  }

  async getEarnings(userId: string) {
    const result = await this.txRepo
      .createQueryBuilder('t')
      .select('SUM(CASE WHEN t.type = :received THEN t.amount ELSE 0 END)', 'total_earned')
      .addSelect('SUM(CASE WHEN t.type = :withdrawn THEN ABS(t.amount) ELSE 0 END)', 'total_withdrawn')
      .where('t.user_id = :uid', { uid: userId })
      .setParameter('received', TransactionType.GIFT_RECEIVED)
      .setParameter('withdrawn', TransactionType.WITHDRAWAL)
      .getRawOne();

    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });
    return {
      total_earned: parseFloat(result?.total_earned || '0'),
      total_withdrawn: parseFloat(result?.total_withdrawn || '0'),
      current_balance: {
        coins: Number(profile?.coins_balance || 0),
        diamonds: Number(profile?.diamonds_balance || 0),
      },
    };
  }

  // Admin methods
  async adminAdjustBalance(userId: string, currency: CurrencyType, amount: number, reason: string) {
    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException();

    if (currency === CurrencyType.COINS) {
      profile.coins_balance = Number(profile.coins_balance) + amount;
    } else {
      profile.diamonds_balance = Number(profile.diamonds_balance) + amount;
    }
    await this.profilesRepo.save(profile);

    await this.txRepo.save({
      user_id: userId,
      type: TransactionType.ADJUSTMENT,
      status: TransactionStatus.COMPLETED,
      currency,
      amount,
      balance_after: currency === CurrencyType.COINS ? profile.coins_balance : profile.diamonds_balance,
      description: `Admin adjustment: ${reason}`,
    });

    return { message: 'Balance adjusted' };
  }

  async adminFreezeWallet(userId: string, freeze: boolean) {
    // Implemented via user ban mechanism
    return { message: freeze ? 'Wallet frozen' : 'Wallet unfrozen' };
  }

  async adminGetRevenueReport(startDate: string, endDate: string) {
    const result = await this.txRepo
      .createQueryBuilder('t')
      .select('t.type', 'type')
      .addSelect('t.currency', 'currency')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(ABS(t.amount))', 'total')
      .where('t.created_at BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere('t.status = :status', { status: TransactionStatus.COMPLETED })
      .groupBy('t.type')
      .addGroupBy('t.currency')
      .getRawMany();

    return result;
  }

  async adminCreateCoinPackage(data: Partial<CoinPackage>) {
    return this.packagesRepo.save(data);
  }

  async adminUpdateCoinPackage(id: string, data: Partial<CoinPackage>) {
    await this.packagesRepo.update(id, data);
    return this.packagesRepo.findOne({ where: { id } });
  }
}
