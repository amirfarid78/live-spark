import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Badge, BadgeCategory, BadgeRarity, UserBadge, LevelConfig, UserRanking, XPTransaction } from '../../entities/badge.entity';
import { Profile, UserLevel } from '../../entities/profile.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge) private badgeRepo: Repository<Badge>,
    @InjectRepository(UserBadge) private userBadgeRepo: Repository<UserBadge>,
    @InjectRepository(LevelConfig) private levelConfigRepo: Repository<LevelConfig>,
    @InjectRepository(UserRanking) private rankingRepo: Repository<UserRanking>,
    @InjectRepository(XPTransaction) private xpTransactionRepo: Repository<XPTransaction>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
  ) {}

  // ==================== BADGES ====================

  async getAllBadges(includeHidden = false) {
    const where: any = { is_active: true };
    if (!includeHidden) where.is_hidden = false;
    
    return this.badgeRepo.find({
      where,
      order: { category: 'ASC', sort_order: 'ASC' },
    });
  }

  async getBadgesByCategory(category: BadgeCategory) {
    return this.badgeRepo.find({
      where: { category, is_active: true, is_hidden: false },
      order: { sort_order: 'ASC' },
    });
  }

  async getBadge(badgeId: string) {
    const badge = await this.badgeRepo.findOne({ where: { id: badgeId } });
    if (!badge) throw new NotFoundException('Badge not found');
    return badge;
  }

  async getUserBadges(userId: string) {
    const userBadges = await this.userBadgeRepo.find({
      where: { user_id: userId },
      order: { earned_at: 'DESC' },
    });

    const badgeIds = userBadges.map(ub => ub.badge_id);
    const badges = badgeIds.length > 0
      ? await this.badgeRepo.find({ where: { id: In(badgeIds) } })
      : [];
    
    const badgeMap = new Map(badges.map(b => [b.id, b]));

    return userBadges.map(ub => ({
      ...ub,
      badge: badgeMap.get(ub.badge_id),
    }));
  }

  async getDisplayedBadges(userId: string) {
    const userBadges = await this.userBadgeRepo.find({
      where: { user_id: userId, is_displayed: true },
      order: { display_order: 'ASC' },
    });

    const badgeIds = userBadges.map(ub => ub.badge_id);
    const badges = badgeIds.length > 0
      ? await this.badgeRepo.find({ where: { id: In(badgeIds) } })
      : [];
    
    const badgeMap = new Map(badges.map(b => [b.id, b]));

    return userBadges.map(ub => ({
      ...ub,
      badge: badgeMap.get(ub.badge_id),
    })).slice(0, 5); // Max 5 displayed badges
  }

  async awardBadge(userId: string, badgeCode: string): Promise<UserBadge | null> {
    const badge = await this.badgeRepo.findOne({ where: { code: badgeCode, is_active: true } });
    if (!badge) return null;

    // Check if already has badge
    const existing = await this.userBadgeRepo.findOne({
      where: { user_id: userId, badge_id: badge.id },
    });
    if (existing) return existing;

    // Award badge
    const userBadge = this.userBadgeRepo.create({
      user_id: userId,
      badge_id: badge.id,
      earned_at: new Date(),
    });
    const saved = await this.userBadgeRepo.save(userBadge);

    // Give rewards
    if (badge.xp_reward > 0) {
      await this.addXP(userId, badge.xp_reward, 'badge_earned', badge.id, `Earned badge: ${badge.name}`);
    }
    if (badge.coins_reward > 0) {
      await this.profileRepo.increment({ user_id: userId }, 'coins_balance', badge.coins_reward);
    }

    return saved;
  }

  async updateDisplayedBadges(userId: string, badgeIds: string[], displayOrder?: number[]) {
    // Clear all displayed
    await this.userBadgeRepo.update(
      { user_id: userId },
      { is_displayed: false, display_order: 0 },
    );

    // Set new displayed badges
    for (let i = 0; i < Math.min(badgeIds.length, 5); i++) {
      await this.userBadgeRepo.update(
        { user_id: userId, badge_id: badgeIds[i] },
        { is_displayed: true, display_order: displayOrder?.[i] ?? i },
      );
    }

    return this.getDisplayedBadges(userId);
  }

  // Check and award badges based on user stats
  async checkAndAwardBadges(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { user_id: userId } });
    if (!profile) return [];

    const badges = await this.badgeRepo.find({
      where: { is_active: true },
    });

    const awarded: UserBadge[] = [];

    for (const badge of badges) {
      if (!badge.requirements) continue;

      const { type, value, operator = '>=' } = badge.requirements;
      let userValue = 0;

      // Get user's stat value based on requirement type
      switch (type) {
        case 'followers':
          userValue = profile.followers_count;
          break;
        case 'videos':
          userValue = profile.videos_count;
          break;
        case 'likes':
          userValue = profile.likes_count;
          break;
        case 'xp':
          userValue = profile.xp;
          break;
        // Add more types as needed
      }

      // Check if requirement is met
      const met = this.checkRequirement(userValue, value, operator);
      if (met) {
        const result = await this.awardBadge(userId, badge.code);
        if (result) awarded.push(result);
      }
    }

    return awarded;
  }

  private checkRequirement(userValue: number, targetValue: number, operator: string): boolean {
    switch (operator) {
      case '>=': return userValue >= targetValue;
      case '>': return userValue > targetValue;
      case '=': return userValue === targetValue;
      case '<=': return userValue <= targetValue;
      case '<': return userValue < targetValue;
      default: return userValue >= targetValue;
    }
  }

  // ==================== XP & LEVELS ====================

  async addXP(userId: string, amount: number, source: string, sourceId?: string, description?: string) {
    // Record transaction
    const transaction = this.xpTransactionRepo.create({
      user_id: userId,
      amount,
      source,
      source_id: sourceId,
      description,
    });
    await this.xpTransactionRepo.save(transaction);

    // Update profile XP
    await this.profileRepo.increment({ user_id: userId }, 'xp', amount);

    // Check for level up
    const profile = await this.profileRepo.findOne({ where: { user_id: userId } });
    if (profile) {
      await this.checkLevelUp(profile);
    }

    return transaction;
  }

  async checkLevelUp(profile: Profile) {
    const levelConfigs = await this.levelConfigRepo.find({
      order: { level: 'ASC' },
    });

    let newLevel: UserLevel | null = null;
    let levelConfig: LevelConfig | null = null;

    for (const config of levelConfigs) {
      if (profile.xp >= config.xp_required) {
        // Determine UserLevel from level number
        if (config.level <= 10) newLevel = UserLevel.BRONZE;
        else if (config.level <= 25) newLevel = UserLevel.SILVER;
        else if (config.level <= 50) newLevel = UserLevel.GOLD;
        else if (config.level <= 75) newLevel = UserLevel.PLATINUM;
        else newLevel = UserLevel.DIAMOND;
        
        levelConfig = config;
      }
    }

    if (newLevel && newLevel !== profile.level) {
      profile.level = newLevel;
      await this.profileRepo.save(profile);

      // Award level rewards
      if (levelConfig) {
        if (levelConfig.coins_reward > 0) {
          await this.profileRepo.increment({ user_id: profile.user_id }, 'coins_balance', levelConfig.coins_reward);
        }
        if (levelConfig.diamonds_reward > 0) {
          await this.profileRepo.increment({ user_id: profile.user_id }, 'diamonds_balance', levelConfig.diamonds_reward);
        }
        if (levelConfig.badge_id) {
          await this.awardBadgeById(profile.user_id, levelConfig.badge_id);
        }
      }
    }
  }

  async awardBadgeById(userId: string, badgeId: string) {
    const badge = await this.badgeRepo.findOne({ where: { id: badgeId } });
    if (badge) {
      await this.awardBadge(userId, badge.code);
    }
  }

  async getLevelProgress(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const levelConfigs = await this.levelConfigRepo.find({
      order: { level: 'ASC' },
    });

    // Find current and next level
    let currentLevel = levelConfigs[0];
    let nextLevel: LevelConfig | null = null;

    for (let i = 0; i < levelConfigs.length; i++) {
      if (profile.xp >= levelConfigs[i].xp_required) {
        currentLevel = levelConfigs[i];
        nextLevel = levelConfigs[i + 1] || null;
      }
    }

    const xpForNext = nextLevel ? nextLevel.xp_required - currentLevel.xp_required : 0;
    const xpProgress = nextLevel ? profile.xp - currentLevel.xp_required : currentLevel.xp_required;

    return {
      currentXP: profile.xp,
      level: profile.level,
      currentLevelConfig: currentLevel,
      nextLevelConfig: nextLevel,
      xpProgress,
      xpForNext,
      progressPercent: xpForNext > 0 ? Math.min((xpProgress / xpForNext) * 100, 100) : 100,
    };
  }

  async getXPHistory(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.xpTransactionRepo.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  // ==================== RANKINGS ====================

  async getLeaderboard(category: string, period: string, page = 1, limit = 50) {
    const [items, total] = await this.rankingRepo.findAndCount({
      where: { category, period },
      order: { rank: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Enrich with profile data
    const userIds = items.map(r => r.user_id);
    const profiles = userIds.length > 0
      ? await this.profileRepo.find({ where: { user_id: In(userIds) } })
      : [];
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));

    const enriched = items.map(r => ({
      ...r,
      profile: profileMap.get(r.user_id),
    }));

    return { items: enriched, total, page, limit };
  }

  async getUserRanking(userId: string, category: string, period: string) {
    return this.rankingRepo.findOne({
      where: { user_id: userId, category, period },
    });
  }

  // Admin: Recalculate rankings
  async recalculateRankings(category: string, period: string) {
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    switch (period) {
      case 'daily':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        const day = now.getDay();
        periodStart = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        periodStart = new Date(0);
        periodEnd = now;
    }

    // Get scores based on category
    let profiles: Profile[];
    switch (category) {
      case 'followers':
        profiles = await this.profileRepo.find({
          order: { followers_count: 'DESC' },
          take: 100,
        });
        break;
      case 'xp':
        profiles = await this.profileRepo.find({
          order: { xp: 'DESC' },
          take: 100,
        });
        break;
      default:
        profiles = [];
    }

    // Update rankings
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      const score = category === 'followers' ? profile.followers_count : profile.xp;

      await this.rankingRepo.upsert({
        user_id: profile.user_id,
        period,
        category,
        rank: i + 1,
        score,
        period_start: periodStart,
        period_end: periodEnd,
      }, ['user_id', 'period', 'category']);
    }

    return { updated: profiles.length };
  }

  // ==================== ADMIN ====================

  async createBadge(data: Partial<Badge>) {
    const badge = this.badgeRepo.create(data);
    return this.badgeRepo.save(badge);
  }

  async updateBadge(badgeId: string, data: Partial<Badge>) {
    await this.badgeRepo.update(badgeId, data);
    return this.getBadge(badgeId);
  }

  async deleteBadge(badgeId: string) {
    await this.badgeRepo.update(badgeId, { is_active: false });
    return { success: true };
  }

  async createLevelConfig(data: Partial<LevelConfig>) {
    const config = this.levelConfigRepo.create(data);
    return this.levelConfigRepo.save(config);
  }

  async getAllLevelConfigs() {
    return this.levelConfigRepo.find({
      order: { level: 'ASC' },
    });
  }

  async updateLevelConfig(configId: string, data: Partial<LevelConfig>) {
    await this.levelConfigRepo.update(configId, data);
    return this.levelConfigRepo.findOne({ where: { id: configId } });
  }

  // Seed default badges
  async seedDefaultBadges() {
    const defaultBadges = [
      // Creator badges
      { code: 'first_video', name: 'First Steps', description: 'Upload your first video', category: BadgeCategory.CREATOR, rarity: BadgeRarity.COMMON, xp_reward: 50, icon_url: '/badges/first-video.png', requirements: { type: 'videos', value: 1 } },
      { code: 'video_master', name: 'Video Master', description: 'Upload 100 videos', category: BadgeCategory.CREATOR, rarity: BadgeRarity.EPIC, xp_reward: 500, icon_url: '/badges/video-master.png', requirements: { type: 'videos', value: 100 } },
      
      // Engagement badges
      { code: 'first_1k_followers', name: 'Rising Star', description: 'Reach 1,000 followers', category: BadgeCategory.ENGAGEMENT, rarity: BadgeRarity.UNCOMMON, xp_reward: 100, icon_url: '/badges/rising-star.png', requirements: { type: 'followers', value: 1000 } },
      { code: 'first_10k_followers', name: 'Influencer', description: 'Reach 10,000 followers', category: BadgeCategory.ENGAGEMENT, rarity: BadgeRarity.RARE, xp_reward: 300, icon_url: '/badges/influencer.png', requirements: { type: 'followers', value: 10000 } },
      { code: 'first_100k_followers', name: 'Celebrity', description: 'Reach 100,000 followers', category: BadgeCategory.ENGAGEMENT, rarity: BadgeRarity.EPIC, xp_reward: 1000, icon_url: '/badges/celebrity.png', requirements: { type: 'followers', value: 100000 } },
      { code: 'first_1m_followers', name: 'Superstar', description: 'Reach 1,000,000 followers', category: BadgeCategory.ENGAGEMENT, rarity: BadgeRarity.LEGENDARY, xp_reward: 5000, icon_url: '/badges/superstar.png', requirements: { type: 'followers', value: 1000000 } },
      
      // Streamer badges
      { code: 'first_stream', name: 'Live Debut', description: 'Complete your first stream', category: BadgeCategory.STREAMER, rarity: BadgeRarity.COMMON, xp_reward: 50, icon_url: '/badges/live-debut.png' },
      { code: 'stream_100h', name: 'Stream Veteran', description: 'Stream for 100 hours', category: BadgeCategory.STREAMER, rarity: BadgeRarity.EPIC, xp_reward: 500, icon_url: '/badges/stream-veteran.png' },
      
      // Gifter badges
      { code: 'first_gift', name: 'Generous Heart', description: 'Send your first gift', category: BadgeCategory.GIFTER, rarity: BadgeRarity.COMMON, xp_reward: 25, icon_url: '/badges/generous-heart.png' },
      { code: 'big_spender', name: 'Big Spender', description: 'Send gifts worth 10,000 coins', category: BadgeCategory.GIFTER, rarity: BadgeRarity.RARE, xp_reward: 200, icon_url: '/badges/big-spender.png' },
      
      // Special badges
      { code: 'verified', name: 'Verified', description: 'Verified account', category: BadgeCategory.SPECIAL, rarity: BadgeRarity.RARE, xp_reward: 0, icon_url: '/badges/verified.png' },
      { code: 'early_adopter', name: 'Early Adopter', description: 'Joined during beta', category: BadgeCategory.SPECIAL, rarity: BadgeRarity.LEGENDARY, xp_reward: 100, icon_url: '/badges/early-adopter.png' },
    ];

    for (const badge of defaultBadges) {
      const exists = await this.badgeRepo.findOne({ where: { code: badge.code } });
      if (!exists) {
        await this.badgeRepo.save(this.badgeRepo.create(badge));
      }
    }

    return { seeded: defaultBadges.length };
  }

  // Seed default level configs
  async seedDefaultLevels() {
    const levels = [
      { level: 1, name: 'Newcomer', icon: '🌱', xp_required: 0, coins_reward: 0, perks: ['Basic profile'] },
      { level: 5, name: 'Explorer', icon: '🔍', xp_required: 500, coins_reward: 50, perks: ['Custom bio'] },
      { level: 10, name: 'Creator', icon: '🎨', xp_required: 1500, coins_reward: 100, perks: ['Upload longer videos'] },
      { level: 20, name: 'Influencer', icon: '⭐', xp_required: 5000, coins_reward: 200, perks: ['Priority support'] },
      { level: 30, name: 'Star', icon: '🌟', xp_required: 15000, coins_reward: 500, perks: ['Custom badges'] },
      { level: 50, name: 'Legend', icon: '👑', xp_required: 50000, coins_reward: 1000, diamonds_reward: 100, perks: ['VIP status'] },
      { level: 75, name: 'Master', icon: '💎', xp_required: 150000, coins_reward: 2500, diamonds_reward: 500, perks: ['Verified badge'] },
      { level: 100, name: 'Grandmaster', icon: '🏆', xp_required: 500000, coins_reward: 5000, diamonds_reward: 1000, perks: ['Exclusive features'] },
    ];

    for (const level of levels) {
      const exists = await this.levelConfigRepo.findOne({ where: { level: level.level } });
      if (!exists) {
        await this.levelConfigRepo.save(this.levelConfigRepo.create(level));
      }
    }

    return { seeded: levels.length };
  }
}
