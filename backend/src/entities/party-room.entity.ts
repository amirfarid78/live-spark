import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

export enum PartyRoomStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  FULL = 'full',
}

export enum SeatStatus {
  EMPTY = 'empty',
  OCCUPIED = 'occupied',
  LOCKED = 'locked',
  REQUESTED = 'requested',
}

@Entity('party_rooms')
export class PartyRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  host_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  cover_url: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'enum', enum: PartyRoomStatus, default: PartyRoomStatus.ACTIVE })
  @Index()
  status: PartyRoomStatus;

  @Column({ type: 'int', default: 8 })
  max_seats: number;

  @Column({ type: 'int', default: 0 })
  listeners_count: number;

  @Column({ default: false })
  is_private: boolean;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  agora_channel: string;

  @Column({ nullable: true })
  agora_token: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('party_seats')
export class PartySeat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  room_id: string;

  @Column({ type: 'int' })
  seat_number: number;

  @Column({ type: 'enum', enum: SeatStatus, default: SeatStatus.EMPTY })
  status: SeatStatus;

  @Column({ nullable: true })
  user_id: string;

  @Column({ default: false })
  is_muted: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('party_chat_messages')
export class PartyChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  room_id: string;

  @Column()
  user_id: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'text' })
  type: string;

  @CreateDateColumn()
  created_at: Date;
}
