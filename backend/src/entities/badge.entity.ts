import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

export enum BadgeCategory {
  CREATOR = 'creator',
  ENGAGEMENT = 'engagement',
  STREAMER = 'streamer',
  GIFTER = 'gifter',
  COLLECTOR = 'collector',
  ACHIEVEMENT = 'achievement',
  SPECIAL = 'special',
  SEASONAL = 'seasonal',
}

export enum BadgeRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // e.g., 'first_video', 'top_creator', '1k_followers'

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  icon_url: string;

  @Column({ type: 'enum', enum: BadgeCategory })
  category: BadgeCategory;

  @Column({ type: 'enum', enum: BadgeRarity, default: BadgeRarity.COMMON })
  rarity: BadgeRarity;

  @Column({ type: 'int', default: 0 })
  xp_reward: number; // XP given when badge is earned

  @Column({ type: 'int', default: 0 })
  coins_reward: number;

  @Column({ type: 'jsonb', nullable: true })
  requirements: {
    type: string; // 'followers', 'videos', 'likes', 'gifts_sent', 'stream_hours', etc.
    value: number;
    operator?: string; // '>=', '=', etc.
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_hidden: boolean; // Secret badges

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('user_badges')
@Index(['user_id', 'badge_id'], { unique: true })
export class UserBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column()
  @Index()
  badge_id: string;

  @Column({ default: false })
  is_displayed: boolean; // Show on profile

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ nullable: true })
  earned_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  progress: { current: number; target: number }; // For progressive badges

  @CreateDateColumn()
  created_at: Date;
}

// User level progression config
@Entity('level_configs')
export class LevelConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  level: number;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column({ type: 'int' })
  xp_required: number;

  @Column({ type: 'int', default: 0 })
  coins_reward: number;

  @Column({ type: 'int', default: 0 })
  diamonds_reward: number;

  @Column({ type: 'simple-array', nullable: true })
  perks: string[];

  @Column({ nullable: true })
  badge_id: string; // Badge awarded at this level

  @CreateDateColumn()
  created_at: Date;
}

// Daily/weekly/monthly rankings
@Entity('user_rankings')
@Index(['user_id', 'period', 'category'], { unique: true })
export class UserRanking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column()
  @Index()
  period: string; // 'daily', 'weekly', 'monthly', 'all_time'

  @Column()
  @Index()
  category: string; // 'earnings', 'followers', 'gifts', 'streams', 'videos'

  @Column({ type: 'int' })
  rank: number;

  @Column({ type: 'bigint', default: 0 })
  score: number;

  @Column()
  period_start: Date;

  @Column()
  period_end: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

// XP transactions log
@Entity('xp_transactions')
export class XPTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column({ type: 'int' })
  amount: number;

  @Column()
  source: string; // 'video_upload', 'livestream', 'gift_received', 'daily_login', etc.

  @Column({ nullable: true })
  source_id: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;
}
