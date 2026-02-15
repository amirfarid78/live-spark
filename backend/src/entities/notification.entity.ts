import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

export enum NotificationType {
  FOLLOW = 'follow',
  LIKE = 'like',
  COMMENT = 'comment',
  GIFT = 'gift',
  LIVE_START = 'live_start',
  PK_INVITE = 'pk_invite',
  PK_RESULT = 'pk_result',
  MESSAGE = 'message',
  SYSTEM = 'system',
  ADMIN_BROADCAST = 'admin_broadcast',
  ORDER_UPDATE = 'order_update',
  PAYMENT = 'payment',
  MENTION = 'mention',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: true })
  action_url: string;

  @Column({ nullable: true })
  actor_id: string;

  @Column({ nullable: true })
  entity_type: string;

  @Column({ nullable: true })
  entity_id: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ default: false })
  is_read: boolean;

  @Column({ default: false })
  is_push_sent: boolean;

  @CreateDateColumn()
  @Index()
  created_at: Date;
}

@Entity('user_fcm_tokens')
export class UserFcmToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column()
  token: string;

  @Column({ nullable: true })
  device_type: string; // ios, android, web

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  user_id: string;

  @Column({ default: true })
  push_enabled: boolean;

  @Column({ default: true })
  follow_notifications: boolean;

  @Column({ default: true })
  like_notifications: boolean;

  @Column({ default: true })
  comment_notifications: boolean;

  @Column({ default: true })
  gift_notifications: boolean;

  @Column({ default: true })
  live_notifications: boolean;

  @Column({ default: true })
  message_notifications: boolean;

  @Column({ default: true })
  order_notifications: boolean;

  @Column({ default: true })
  system_notifications: boolean;
}
