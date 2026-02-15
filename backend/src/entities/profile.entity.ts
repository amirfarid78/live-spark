import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

export enum UserLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  user_id: string;

  @Column({ unique: true })
  @Index()
  username: string;

  @Column({ nullable: true })
  display_name: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  cover_url: string;

  @Column({ type: 'enum', enum: UserLevel, default: UserLevel.BRONZE })
  level: UserLevel;

  @Column({ type: 'int', default: 0 })
  xp: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  coins_balance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  diamonds_balance: number;

  @Column({ type: 'int', default: 0 })
  followers_count: number;

  @Column({ type: 'int', default: 0 })
  following_count: number;

  @Column({ type: 'int', default: 0 })
  likes_count: number;

  @Column({ type: 'int', default: 0 })
  videos_count: number;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: false })
  is_online: boolean;

  @Column({ nullable: true })
  last_seen_at: Date;

  @Column({ nullable: true })
  date_of_birth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'jsonb', nullable: true })
  social_links: Record<string, string>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
