import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, Index,
} from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'direct' })
  type: string; // direct, group

  @Column({ nullable: true })
  name: string; // for group chats

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  last_message_id: string;

  @Column({ nullable: true })
  last_message_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('conversation_participants')
@Index(['conversation_id', 'user_id'], { unique: true })
export class ConversationParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  conversation_id: string;

  @Column()
  @Index()
  user_id: string;

  @Column({ default: 'member' })
  role: string; // admin, member

  @Column({ default: false })
  is_muted: boolean;

  @Column({ type: 'int', default: 0 })
  unread_count: number;

  @Column({ nullable: true })
  last_read_at: Date;

  @CreateDateColumn()
  joined_at: Date;
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  conversation_id: string;

  @Column()
  sender_id: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ default: 'text' })
  type: string; // text, image, video, audio, voice, sticker, gift, system

  @Column({ type: 'jsonb', nullable: true })
  media: { url: string; thumbnail_url?: string; duration?: number; size?: number };

  @Column({ nullable: true })
  reply_to_id: string;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  @Index()
  created_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
