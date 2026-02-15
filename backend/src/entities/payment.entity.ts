import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum PaymentGateway {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  GOOGLE_PAY = 'google_pay',
  PAYFAST = 'payfast',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column({ type: 'enum', enum: PaymentGateway })
  gateway: PaymentGateway;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  gateway_payment_id: string;

  @Column({ nullable: true })
  gateway_session_id: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  reference_type: string; // coin_purchase, product_order, entry_fee

  @Column({ nullable: true })
  reference_id: string;

  @Column({ type: 'jsonb', nullable: true })
  gateway_response: Record<string, any>;

  @Column({ nullable: true })
  failure_reason: string;

  @Column({ nullable: true })
  refunded_at: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  refund_amount: number;

  @CreateDateColumn()
  @Index()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('payment_gateway_settings')
export class PaymentGatewaySetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PaymentGateway, unique: true })
  gateway: PaymentGateway;

  @Column({ default: false })
  is_enabled: boolean;

  @Column({ default: false })
  is_sandbox: boolean;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, string>; // encrypted API keys

  @Column({ type: 'simple-array', nullable: true })
  supported_currencies: string[];

  @UpdateDateColumn()
  updated_at: Date;
}
