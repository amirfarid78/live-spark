import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

export enum StoreType {
  INTERNAL = 'internal', // Our built-in store
  WOOCOMMERCE = 'woocommerce',
  SHOPIFY = 'shopify',
}

export enum StoreStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ERROR = 'error',
}

@Entity('user_stores')
export class UserStore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  user_id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  banner_url: string;

  @Column({ type: 'enum', enum: StoreStatus, default: StoreStatus.PENDING })
  status: StoreStatus;

  @Column({ default: false })
  is_active: boolean;

  @Column({ default: false })
  is_pro: boolean; // Pro seller features

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviews_count: number;

  @Column({ type: 'int', default: 0 })
  products_count: number;

  @Column({ type: 'int', default: 0 })
  orders_count: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_sales: number;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    currency?: string;
    shipping_countries?: string[];
    return_policy?: string;
    contact_email?: string;
    social_links?: Record<string, string>;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('store_connections')
@Index(['store_id', 'store_type'], { unique: true })
export class StoreConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  store_id: string;

  @Column({ type: 'enum', enum: StoreType })
  store_type: StoreType;

  @Column({ nullable: true })
  store_url: string;

  @Column({ type: 'text', nullable: true })
  api_key: string;

  @Column({ type: 'text', nullable: true })
  api_secret: string;

  @Column({ type: 'text', nullable: true })
  access_token: string;

  @Column({ nullable: true })
  webhook_secret: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  last_synced_at: Date;

  @Column({ type: 'text', nullable: true })
  sync_error: string;

  @Column({ type: 'jsonb', nullable: true })
  sync_settings: {
    auto_sync: boolean;
    sync_products: boolean;
    sync_orders: boolean;
    sync_inventory: boolean;
    sync_interval_minutes: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('synced_products')
@Index(['store_id', 'connection_id', 'external_id'], { unique: true })
export class SyncedProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  store_id: string;

  @Column()
  @Index()
  connection_id: string;

  @Column()
  external_id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ nullable: true })
  image_url: string;

  @Column({ type: 'int', default: 0 })
  stock_quantity: number;

  @Column({ default: true })
  is_available: boolean;

  @Column({ default: true })
  show_in_profile: boolean;

  @Column({ nullable: true })
  override_name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  override_price: number;

  @Column({ type: 'text', nullable: true })
  override_description: string;

  @Column({ type: 'int', default: 0 })
  featured_order: number;

  @Column({ type: 'jsonb', nullable: true })
  external_data: Record<string, any>;

  @Column({ nullable: true })
  external_sku: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('synced_orders')
@Index(['store_id', 'connection_id', 'external_id'], { unique: true })
export class SyncedOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  store_id: string;

  @Column()
  @Index()
  connection_id: string;

  @Column()
  external_id: string;

  @Column({ nullable: true })
  order_number: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  customer_name: string;

  @Column({ nullable: true })
  customer_email: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'int', default: 0 })
  items_count: number;

  @Column({ type: 'jsonb', nullable: true })
  external_data: Record<string, any>;

  @Column({ nullable: true })
  placed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
