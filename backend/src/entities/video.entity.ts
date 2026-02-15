import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, Index, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';

export enum VideoStatus {
  PROCESSING = 'processing',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export enum VideoVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FOLLOWERS_ONLY = 'followers_only',
}

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column({ nullable: true })
  caption: string;

  @Column()
  video_url: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ type: 'int', default: 0 })
  duration: number; // seconds

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column({ type: 'enum', enum: VideoStatus, default: VideoStatus.PROCESSING })
  status: VideoStatus;

  @Column({ type: 'enum', enum: VideoVisibility, default: VideoVisibility.PUBLIC })
  visibility: VideoVisibility;

  @Column({ type: 'int', default: 0 })
  views_count: number;

  @Column({ type: 'int', default: 0 })
  likes_count: number;

  @Column({ type: 'int', default: 0 })
  comments_count: number;

  @Column({ type: 'int', default: 0 })
  shares_count: number;

  @Column({ type: 'int', default: 0 })
  saves_count: number;

  @Column({ type: 'simple-array', nullable: true })
  hashtags: string[];

  @Column({ nullable: true })
  music_id: string;

  @Column({ nullable: true })
  music_title: string;

  @Column({ nullable: true })
  music_artist: string;

  @Column({ default: false })
  is_pinned: boolean;

  @Column({ default: false })
  is_duet: boolean;

  @Column({ nullable: true })
  duet_video_id: string;

  @Column({ default: false })
  allows_comments: boolean;

  @Column({ default: true })
  allows_duet: boolean;

  @Column({ default: false })
  is_nsfw: boolean;

  @Column({ default: false })
  is_ad: boolean;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'jsonb', nullable: true })
  filters_applied: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  product_tags: Array<{ product_id: string; timestamp: number }>;

  @CreateDateColumn()
  @Index()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
