import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

export enum AgencyStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

@Entity('agencies')
export class Agency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  owner_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  contact_email: string;

  @Column({ nullable: true })
  contact_phone: string;

  @Column({ type: 'enum', enum: AgencyStatus, default: AgencyStatus.PENDING })
  status: AgencyStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 20 })
  commission_rate: number; // platform takes this %

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_earnings: number;

  @Column({ type: 'int', default: 0 })
  streamers_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('agency_streamers')
@Index(['agency_id', 'streamer_id'], { unique: true })
export class AgencyStreamer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  agency_id: string;

  @Column()
  @Index()
  streamer_id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 70 })
  streamer_share: number; // % that goes to streamer

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  joined_at: Date;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('agency_earnings')
export class AgencyEarning {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  agency_id: string;

  @Column()
  streamer_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  gross_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  agency_commission: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  streamer_payout: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  platform_commission: number;

  @Column({ nullable: true })
  source_type: string; // live_stream, pk_battle, etc.

  @Column({ nullable: true })
  source_id: string;

  @Column({ default: 'pending' })
  payout_status: string;

  @CreateDateColumn()
  @Index()
  created_at: Date;
}
