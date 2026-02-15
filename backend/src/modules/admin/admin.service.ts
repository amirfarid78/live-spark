import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Profile } from '../../entities/profile.entity';
import { Video } from '../../entities/video.entity';
import { LiveStream } from '../../entities/live-stream.entity';
import { GiftTransaction } from '../../entities/gift.entity';
import { Payment } from '../../entities/payment.entity';
import { Order } from '../../entities/shop.entity';
import { Report, ReportStatus } from '../../entities/report.entity';
import { PlatformSetting } from '../../entities/platform-setting.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Video) private videoRepo: Repository<Video>,
    @InjectRepository(LiveStream) private liveRepo: Repository<LiveStream>,
    @InjectRepository(GiftTransaction) private giftTxRepo: Repository<GiftTransaction>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Report) private reportRepo: Repository<Report>,
    @InjectRepository(PlatformSetting) private settingRepo: Repository<PlatformSetting>,
  ) {}

  // --- Dashboard ---
  async getDashboardStats() {
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({ where: { is_banned: false } });
    const bannedUsers = await this.userRepo.count({ where: { is_banned: true } });
    const totalVideos = await this.videoRepo.count();
    const activeStreams = await this.liveRepo.count({ where: { status: 'live' as any } });
    const totalStreams = await this.liveRepo.count();
    const pendingReports = await this.reportRepo.count({ where: { status: ReportStatus.PENDING } });

    // Revenue
    const giftRevenue = await this.giftTxRepo
      .createQueryBuilder('g')
      .select('COALESCE(SUM(g.platform_commission), 0)', 'total')
      .getRawOne();

    const paymentRevenue = await this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount), 0)', 'total')
      .where('p.status = :status', { status: 'completed' })
      .getRawOne();

    const totalOrders = await this.orderRepo.count();

    // Growth (30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers30d = await this.userRepo
      .createQueryBuilder('u')
      .where('u.created_at >= :date', { date: thirtyDaysAgo })
      .getCount();

    const newVideos30d = await this.videoRepo
      .createQueryBuilder('v')
      .where('v.created_at >= :date', { date: thirtyDaysAgo })
      .getCount();

    return {
      users: { total: totalUsers, active: activeUsers, banned: bannedUsers, new_30d: newUsers30d },
      content: { total_videos: totalVideos, new_videos_30d: newVideos30d, active_streams: activeStreams, total_streams: totalStreams },
      revenue: { gift_platform_fees: Number(giftRevenue.total), payment_volume: Number(paymentRevenue.total) },
      moderation: { pending_reports: pendingReports },
      commerce: { total_orders: totalOrders },
    };
  }

  async getUserGrowthChart(days = 30) {
    const result = await this.userRepo
      .createQueryBuilder('u')
      .select("DATE(u.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('u.created_at >= NOW() - make_interval(days => :days)', { days })
      .groupBy("DATE(u.created_at)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return result.map(r => ({ date: r.date, count: Number(r.count) }));
  }

  async getRevenueChart(days = 30) {
    const result = await this.paymentRepo
      .createQueryBuilder('p')
      .select("DATE(p.created_at)", 'date')
      .addSelect('COALESCE(SUM(p.amount), 0)', 'amount')
      .where('p.status = :status', { status: 'completed' })
      .andWhere('p.created_at >= NOW() - make_interval(days => :days)', { days })
      .groupBy("DATE(p.created_at)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return result.map(r => ({ date: r.date, amount: Number(r.amount) }));
  }

  // --- Platform Settings ---
  async getSettings() {
    return this.settingRepo.find({ order: { category: 'ASC', key: 'ASC' } });
  }

  async getSetting(key: string) {
    return this.settingRepo.findOne({ where: { key } });
  }

  async upsertSetting(key: string, value: string, data: { description?: string; category?: string; value_type?: string }) {
    let setting = await this.settingRepo.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
      if (data.description) setting.description = data.description;
      if (data.category) setting.category = data.category;
      return this.settingRepo.save(setting);
    }

    setting = this.settingRepo.create({
      key,
      value,
      description: data.description,
      category: data.category || 'general',
      value_type: data.value_type || 'string',
    });
    return this.settingRepo.save(setting);
  }

  async deleteSetting(key: string) {
    await this.settingRepo.delete({ key });
    return { success: true };
  }

  // --- Common settings helpers ---
  async getSettingValue(key: string, defaultValue?: string): Promise<string | undefined> {
    const setting = await this.settingRepo.findOne({ where: { key } });
    return setting?.value ?? defaultValue;
  }

  async getSettingsByCategory(category: string) {
    return this.settingRepo.find({ where: { category } });
  }

  // --- Top performers ---
  async getTopStreamers(limit = 20) {
    const result = await this.profileRepo
      .createQueryBuilder('p')
      .select(['p.id', 'p.username', 'p.display_name', 'p.avatar_url', 'p.followers_count', 'p.diamonds_balance'])
      .orderBy('p.diamonds_balance', 'DESC')
      .take(limit)
      .getMany();
    return result;
  }

  async getTopGiftSenders(limit = 20) {
    const result = await this.giftTxRepo
      .createQueryBuilder('g')
      .select('g.sender_id', 'user_id')
      .addSelect('SUM(g.total_coins)', 'total_spent')
      .addSelect('COUNT(*)', 'gift_count')
      .groupBy('g.sender_id')
      .orderBy('total_spent', 'DESC')
      .take(limit)
      .getRawMany();
    return result;
  }

  // --- System health ---
  async getSystemHealth() {
    const dbCheck = await this.userRepo.query('SELECT 1 as ok');
    return {
      status: 'healthy',
      database: dbCheck ? 'connected' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
