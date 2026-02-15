import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

export enum ReportType {
  USER = 'user',
  VIDEO = 'video',
  LIVE_STREAM = 'live_stream',
  COMMENT = 'comment',
  MESSAGE = 'message',
  PARTY_ROOM = 'party_room',
}

export enum ReportStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  INAPPROPRIATE = 'inappropriate',
  VIOLENCE = 'violence',
  NSFW = 'nsfw',
  HATE_SPEECH = 'hate_speech',
  SCAM = 'scam',
  IMPERSONATION = 'impersonation',
  UNDERAGE = 'underage',
  COPYRIGHT = 'copyright',
  OTHER = 'other',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  reporter_id: string;

  @Column({ type: 'enum', enum: ReportType })
  target_type: ReportType;

  @Column()
  @Index()
  target_id: string;

  @Column({ nullable: true })
  target_user_id: string;

  @Column({ type: 'enum', enum: ReportReason })
  reason: ReportReason;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  evidence_urls: string[];

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Column({ nullable: true })
  resolved_by: string;

  @Column({ nullable: true })
  resolution_note: string;

  @Column({ nullable: true })
  resolved_at: Date;

  @CreateDateColumn()
  @Index()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('user_strikes')
export class UserStrike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column({ nullable: true })
  report_id: string;

  @Column()
  reason: string;

  @Column({ nullable: true })
  issued_by: string;

  @Column({ nullable: true })
  expires_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  actor_id: string;

  @Column()
  action: string;

  @Column()
  entity_type: string;

  @Column({ nullable: true })
  entity_id: string;

  @Column({ type: 'jsonb', nullable: true })
  old_values: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  new_values: Record<string, any>;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  user_agent: string;

  @CreateDateColumn()
  @Index()
  created_at: Date;
}
