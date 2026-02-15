import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

export enum GiftCategory {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  EXCLUSIVE = 'exclusive',
  LIMITED = 'limited',
  EVENT = 'event',
}

@Entity('gifts')
export class Gift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  icon_url: string;

  @Column({ nullable: true })
  animation_url: string;

  @Column({ nullable: true })
  animation_type: string; // lottie, css, 3d

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  coin_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  diamond_value: number; // what the receiver gets

  @Column({ type: 'enum', enum: GiftCategory, default: GiftCategory.STANDARD })
  category: GiftCategory;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_animated: boolean;

  @Column({ type: 'int', default: 0 })
  send_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('gift_transactions')
export class GiftTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  sender_id: string;

  @Column()
  @Index()
  receiver_id: string;

  @Column()
  gift_id: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_coins: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_diamonds: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  platform_commission: number;

  @Column({ nullable: true })
  context_type: string; // live_stream, pk_battle, party_room, video

  @Column({ nullable: true })
  context_id: string;

  @CreateDateColumn()
  @Index()
  created_at: Date;
}
