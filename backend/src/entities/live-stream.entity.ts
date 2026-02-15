import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export enum LiveStreamStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export enum LiveStreamType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PAID = 'paid',
  INVITE_ONLY = 'invite_only',
}

@Entity('live_streams')
export class LiveStream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  host_id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ type: 'enum', enum: LiveStreamStatus, default: LiveStreamStatus.SCHEDULED })
  @Index()
  status: LiveStreamStatus;

  @Column({ type: 'enum', enum: LiveStreamType, default: LiveStreamType.PUBLIC })
  stream_type: LiveStreamType;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // Agora
  @Column({ type: 'varchar', nullable: true })
  agora_channel: string;

  @Column({ type: 'varchar', nullable: true })
  agora_token: string;

  @Column({ nullable: true })
  agora_uid: number;

  // Stats
  @Column({ type: 'int', default: 0 })
  viewers_count: number;

  @Column({ type: 'int', default: 0 })
  peak_viewers: number;

  @Column({ type: 'int', default: 0 })
  total_viewers: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  gifts_earned: number;

  @Column({ type: 'int', default: 0 })
  duration: number; // seconds

  // Paid entry
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  entry_fee: number;

  @Column({ nullable: true })
  started_at: Date;

  @Column({ nullable: true })
  ended_at: Date;

  @Column({ nullable: true })
  scheduled_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('live_chat_messages')
export class LiveChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  stream_id: string;

  @Column()
  user_id: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'text' })
  type: string; // text, gift, system, sticker

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('live_viewers')
export class LiveViewer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  stream_id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  joined_at: Date;

  @Column({ nullable: true })
  left_at: Date;

  @Column({ type: 'int', default: 0 })
  watch_duration: number;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('live_gifts')
export class LiveGift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  stream_id: string;

  @Column()
  sender_id: string;

  @Column()
  receiver_id: string;

  @Column()
  gift_id: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  coin_value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  diamond_value: number;

  @CreateDateColumn()
  created_at: Date;
}
