import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, DeleteDateColumn,
} from 'typeorm';

@Entity('video_likes')
@Index(['user_id', 'video_id'], { unique: true })
export class VideoLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  @Index()
  video_id: string;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('video_comments')
export class VideoComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  video_id: string;

  @Column()
  user_id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  parent_id: string; // for reply threads

  @Column({ type: 'int', default: 0 })
  likes_count: number;

  @Column({ type: 'int', default: 0 })
  replies_count: number;

  @Column({ default: false })
  is_pinned: boolean;

  @CreateDateColumn()
  created_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}

@Entity('video_saves')
@Index(['user_id', 'video_id'], { unique: true })
export class VideoSave {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  video_id: string;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('video_shares')
export class VideoShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  video_id: string;

  @Column({ nullable: true })
  platform: string; // whatsapp, instagram, copy_link, etc.

  @CreateDateColumn()
  created_at: Date;
}

@Entity('video_views')
export class VideoView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  video_id: string;

  @Column({ nullable: true })
  user_id: string;

  @Column({ type: 'int', default: 0 })
  watch_duration: number; // seconds

  @Column({ type: 'int', default: 0 })
  watch_percentage: number;

  @Column({ nullable: true })
  ip_address: string;

  @CreateDateColumn()
  created_at: Date;
}

export enum HashtagStatus {
  ACTIVE = 'active',
  BANNED = 'banned',
  RESTRICTED = 'restricted',
}

@Entity('hashtags')
export class Hashtag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  name: string; // Without # symbol, lowercase

  @Column({ nullable: true })
  display_name: string; // Original casing

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  cover_url: string;

  @Column({ type: 'enum', enum: HashtagStatus, default: HashtagStatus.ACTIVE })
  @Index()
  status: HashtagStatus;

  @Column({ type: 'bigint', default: 0 })
  @Index()
  usage_count: number;

  @Column({ type: 'bigint', default: 0 })
  views_count: number;

  @Column({ type: 'int', default: 0 })
  daily_usage: number;

  @Column({ type: 'int', default: 0 })
  weekly_usage: number;

  @Column({ type: 'float', nullable: true })
  trending_score: number;

  @Column({ default: false })
  is_trending: boolean;

  @Column({ default: false })
  is_banned: boolean;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ default: false })
  is_challenge: boolean;

  @Column({ nullable: true })
  challenge_start_date: Date;

  @Column({ nullable: true })
  challenge_end_date: Date;

  @Column({ nullable: true })
  challenge_prize: string;

  @Column({ nullable: true })
  associated_sound_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export enum SoundCategory {
  ORIGINAL = 'original',
  MUSIC = 'music',
  EFFECT = 'effect',
  VOICE = 'voice',
  TRENDING = 'trending',
}

@Entity('music_tracks')
export class MusicTrack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  title: string;

  @Column()
  artist: string;

  @Column({ nullable: true })
  album: string;

  @Column()
  audio_url: string;

  @Column({ nullable: true })
  cover_url: string;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column({ nullable: true })
  genre: string;

  @Column({ type: 'enum', enum: SoundCategory, default: SoundCategory.MUSIC })
  @Index()
  category: SoundCategory;

  @Column({ nullable: true })
  @Index()
  original_user_id: string;

  @Column({ nullable: true })
  @Index()
  original_video_id: string;

  @Column({ type: 'bigint', default: 0 })
  @Index()
  usage_count: number;

  @Column({ type: 'int', default: 0 })
  favorites_count: number;

  @Column({ type: 'int', default: 0 })
  daily_usage: number;

  @Column({ type: 'int', default: 0 })
  weekly_usage: number;

  @Column({ type: 'float', nullable: true })
  trending_score: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ default: false })
  is_original: boolean;

  @Column({ default: false })
  is_explicit: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

// User favorite sounds junction table
@Entity('user_favorite_sounds')
@Index(['user_id', 'sound_id'], { unique: true })
export class UserFavoriteSound {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column()
  @Index()
  sound_id: string;

  @CreateDateColumn()
  created_at: Date;
}

// Video-Hashtag junction table
@Entity('video_hashtags')
@Index(['video_id', 'hashtag_id'], { unique: true })
export class VideoHashtag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  video_id: string;

  @Column()
  @Index()
  hashtag_id: string;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('playlists')
export class Playlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  cover_url: string;

  @Column({ default: false })
  is_public: boolean;

  @Column({ type: 'int', default: 0 })
  videos_count: number;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('playlist_videos')
@Index(['playlist_id', 'video_id'], { unique: true })
export class PlaylistVideo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  playlist_id: string;

  @Column()
  video_id: string;

  @Column({ type: 'int', default: 0 })
  position: number;

  @CreateDateColumn()
  created_at: Date;
}
