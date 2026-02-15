import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, Index,
} from 'typeorm';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SOLD_OUT = 'sold_out',
  INACTIVE = 'inactive',
  REJECTED = 'rejected',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  seller_id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  compare_at_price: number;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  stock_quantity: number;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Column({ type: 'int', default: 0 })
  sales_count: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviews_count: number;

  @Column({ type: 'jsonb', nullable: true })
  variants: Array<{ name: string; options: string[]; prices?: number[] }>;

  @Column({ type: 'jsonb', nullable: true })
  shipping_info: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  buyer_id: string;

  @Column()
  @Index()
  seller_id: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shipping_cost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  payment_id: string;

  @Column({ nullable: true })
  payment_method: string;

  @Column({ type: 'jsonb', nullable: true })
  shipping_address: Record<string, string>;

  @Column({ nullable: true })
  tracking_number: string;

  @Column({ nullable: true })
  tracking_url: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  live_stream_id: string; // if bought during live shopping

  @CreateDateColumn()
  @Index()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  order_id: string;

  @Column()
  product_id: string;

  @Column()
  product_name: string;

  @Column({ nullable: true })
  variant: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_price: number;

  @CreateDateColumn()
  created_at: Date;
}
