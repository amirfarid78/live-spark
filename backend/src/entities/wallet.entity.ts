import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  GIFT_SENT = 'gift_sent',
  GIFT_RECEIVED = 'gift_received',
  PURCHASE = 'purchase',
  REFUND = 'refund',
  COMMISSION = 'commission',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  ENTRY_FEE = 'entry_fee',
  PRODUCT_SALE = 'product_sale',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum CurrencyType {
  COINS = 'coins',
  DIAMONDS = 'diamonds',
  USD = 'usd',
  PKR = 'pkr',
}

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ type: 'enum', enum: CurrencyType })
  currency: CurrencyType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  balance_after: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  reference_type: string; // gift_transaction, payment, order, etc.

  @Column({ nullable: true })
  reference_id: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  @Index()
  created_at: Date;
}

@Entity('coin_packages')
export class CoinPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int' })
  coins_amount: number;

  @Column({ type: 'int', default: 0 })
  bonus_coins: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_usd: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_pkr: number;

  @Column({ nullable: true })
  icon_url: string;

  @Column({ default: false })
  is_popular: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;
}
