import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

export enum PKBattleStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DECLINED = 'declined',
}

@Entity('pk_battles')
export class PKBattle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  challenger_id: string;

  @Column()
  @Index()
  opponent_id: string;

  @Column({ nullable: true })
  challenger_stream_id: string;

  @Column({ nullable: true })
  opponent_stream_id: string;

  @Column({ type: 'enum', enum: PKBattleStatus, default: PKBattleStatus.PENDING })
  status: PKBattleStatus;

  @Column({ type: 'int', default: 180 })
  duration: number; // seconds (default 3 min)

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  challenger_score: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  opponent_score: number;

  @Column({ nullable: true })
  winner_id: string;

  @Column({ nullable: true })
  agora_channel: string;

  @Column({ nullable: true })
  started_at: Date;

  @Column({ nullable: true })
  ended_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('pk_battle_gifts')
export class PKBattleGift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  battle_id: string;

  @Column()
  sender_id: string;

  @Column()
  target_id: string; // which side got the gift

  @Column()
  gift_id: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  coin_value: number;

  @CreateDateColumn()
  created_at: Date;
}
