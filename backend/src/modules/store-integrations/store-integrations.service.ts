import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserStore, StoreConnection, StoreType, StoreStatus, SyncedProduct, SyncedOrder } from '../../entities/store-integration.entity';
import { Profile } from '../../entities/profile.entity';
import axios from 'axios';

interface WooCommerceProduct {
  id: number;
  name: string;
  price: string;
  description: string;
  images: { src: string }[];
  stock_status: string;
  stock_quantity?: number;
}

interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  product_type: string;
  images: { src: string }[];
  variants: { price: string; inventory_quantity: number }[];
}

@Injectable()
export class StoreIntegrationsService {
  constructor(
    @InjectRepository(UserStore) private storeRepo: Repository<UserStore>,
    @InjectRepository(StoreConnection) private connectionRepo: Repository<StoreConnection>,
    @InjectRepository(SyncedProduct) private syncedProductRepo: Repository<SyncedProduct>,
    @InjectRepository(SyncedOrder) private syncedOrderRepo: Repository<SyncedOrder>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
  ) {}

  // ==================== STORE MANAGEMENT ====================

  async getUserStore(userId: string) {
    let store = await this.storeRepo.findOne({ where: { user_id: userId } });
    if (!store) {
      // Create store for user
      store = this.storeRepo.create({
        user_id: userId,
        name: 'My Store',
        is_active: false,
      });
      store = await this.storeRepo.save(store);
    }
    
    // Get connections
    const connections = await this.connectionRepo.find({ where: { store_id: store.id } });
    
    return { ...store, connections };
  }

  async updateStore(userId: string, data: Partial<UserStore>) {
    const store = await this.storeRepo.findOne({ where: { user_id: userId } });
    if (!store) throw new NotFoundException('Store not found');

    Object.assign(store, data);
    return this.storeRepo.save(store);
  }

  async activateStore(userId: string) {
    const store = await this.storeRepo.findOne({ where: { user_id: userId } });
    if (!store) throw new NotFoundException('Store not found');
    
    store.is_active = true;
    store.status = StoreStatus.ACTIVE;
    return this.storeRepo.save(store);
  }

  // ==================== CONNECTIONS ====================

  async addConnection(userId: string, data: {
    store_type: StoreType;
    store_url: string;
    api_key: string;
    api_secret: string;
  }) {
    const store = await this.storeRepo.findOne({ where: { user_id: userId } });
    if (!store) throw new NotFoundException('Store not found');

    // Validate connection
    const isValid = await this.testConnection(data.store_type, data.store_url, data.api_key, data.api_secret);
    if (!isValid) {
      throw new BadRequestException('Could not connect to store. Please check your credentials.');
    }

    const connection = this.connectionRepo.create({
      store_id: store.id,
      store_type: data.store_type,
      store_url: data.store_url,
      api_key: data.api_key,
      api_secret: data.api_secret,
      is_active: true,
    });

    return this.connectionRepo.save(connection);
  }

  async removeConnection(userId: string, connectionId: string) {
    const store = await this.storeRepo.findOne({ where: { user_id: userId } });
    if (!store) throw new NotFoundException('Store not found');

    const connection = await this.connectionRepo.findOne({
      where: { id: connectionId, store_id: store.id },
    });
    if (!connection) throw new NotFoundException('Connection not found');

    // Remove synced products from this connection
    await this.syncedProductRepo.delete({ connection_id: connectionId });
    await this.connectionRepo.remove(connection);

    return { success: true };
  }

  async testConnection(storeType: StoreType, storeUrl: string, apiKey: string, apiSecret: string): Promise<boolean> {
    try {
      if (storeType === StoreType.WOOCOMMERCE) {
        const response = await axios.get(`${storeUrl}/wp-json/wc/v3/products`, {
          params: { per_page: 1 },
          auth: { username: apiKey, password: apiSecret },
        });
        return response.status === 200;
      } else if (storeType === StoreType.SHOPIFY) {
        const response = await axios.get(`https://${storeUrl}/admin/api/2023-10/products.json`, {
          params: { limit: 1 },
          headers: { 'X-Shopify-Access-Token': apiSecret },
        });
        return response.status === 200;
      }
      return false;
    } catch (error) {
      console.error('Connection test failed:', error.message);
      return false;
    }
  }

  // ==================== PRODUCT SYNC ====================

  async syncProducts(userId: string, connectionId?: string) {
    const store = await this.storeRepo.findOne({ where: { user_id: userId } });
    if (!store) throw new NotFoundException('Store not found');

    const whereClause: any = { store_id: store.id, is_active: true };
    if (connectionId) whereClause.id = connectionId;

    const connections = await this.connectionRepo.find({ where: whereClause });
    const results: Array<{ connection_id: string; store_type?: StoreType; synced?: number; error?: string }> = [];

    for (const connection of connections) {
      try {
        let synced = 0;
        if (connection.store_type === StoreType.WOOCOMMERCE) {
          synced = await this.syncWooCommerceProducts(connection, store.id);
        } else if (connection.store_type === StoreType.SHOPIFY) {
          synced = await this.syncShopifyProducts(connection, store.id);
        }

        connection.last_synced_at = new Date();
        (connection as any).sync_error = undefined;
        await this.connectionRepo.save(connection);

        results.push({ connection_id: connection.id, store_type: connection.store_type, synced });
      } catch (error) {
        connection.sync_error = error.message;
        await this.connectionRepo.save(connection);
        results.push({ connection_id: connection.id, store_type: connection.store_type, error: error.message });
      }
    }

    return results;
  }

  private async syncWooCommerceProducts(connection: StoreConnection, storeId: string): Promise<number> {
    let page = 1;
    let totalSynced = 0;

    while (true) {
      const response = await axios.get<WooCommerceProduct[]>(`${connection.store_url}/wp-json/wc/v3/products`, {
        params: { per_page: 100, page },
        auth: { username: connection.api_key, password: connection.api_secret },
      });

      if (response.data.length === 0) break;

      for (const product of response.data) {
        await this.syncedProductRepo.upsert({
          store_id: storeId,
          connection_id: connection.id,
          external_id: String(product.id),
          name: product.name,
          description: product.description,
          price: parseFloat(product.price) || 0,
          image_url: product.images?.[0]?.src || undefined,
          stock_quantity: product.stock_quantity || 0,
          is_available: product.stock_status === 'instock',
          external_data: product as any,
        }, ['store_id', 'connection_id', 'external_id']);

        totalSynced++;
      }

      page++;
      if (response.data.length < 100) break;
    }

    return totalSynced;
  }

  private async syncShopifyProducts(connection: StoreConnection, storeId: string): Promise<number> {
    let pageInfo: string | null = null;
    let totalSynced = 0;

    while (true) {
      const url = `https://${connection.store_url}/admin/api/2023-10/products.json`;
      const params: any = { limit: 250 };
      if (pageInfo) params.page_info = pageInfo;

      const response = await axios.get<{ products: ShopifyProduct[] }>(url, {
        params,
        headers: { 'X-Shopify-Access-Token': connection.api_secret },
      });

      for (const product of response.data.products) {
        const variant = product.variants?.[0];
        await this.syncedProductRepo.upsert({
          store_id: storeId,
          connection_id: connection.id,
          external_id: String(product.id),
          name: product.title,
          description: product.body_html || '',
          price: variant ? parseFloat(variant.price) : 0,
          image_url: product.images?.[0]?.src || undefined,
          stock_quantity: variant?.inventory_quantity || 0,
          is_available: (variant?.inventory_quantity || 0) > 0,
          external_data: product as any,
        }, ['store_id', 'connection_id', 'external_id']);

        totalSynced++;
      }

      // Check for pagination
      const link = response.headers['link'];
      if (link && link.includes('rel="next"')) {
        const match = link.match(/page_info=([^&>]+).*rel="next"/);
        pageInfo = match ? match[1] : null;
      } else {
        break;
      }

      if (response.data.products.length < 250) break;
    }

    return totalSynced;
  }

  // ==================== SYNCED PRODUCTS ====================

  async getSyncedProducts(userId: string, connectionId?: string, page = 1, limit = 20) {
    const store = await this.storeRepo.findOne({ where: { user_id: userId } });
    if (!store) throw new NotFoundException('Store not found');

    const whereClause: any = { store_id: store.id };
    if (connectionId) whereClause.connection_id = connectionId;

    const [items, total] = await this.syncedProductRepo.findAndCount({
      where: whereClause,
      order: { updated_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async toggleProductVisibility(userId: string, productId: string, show: boolean) {
    const store = await this.storeRepo.findOne({ where: { user_id: userId } });
    if (!store) throw new NotFoundException('Store not found');

    const product = await this.syncedProductRepo.findOne({
      where: { id: productId, store_id: store.id },
    });
    if (!product) throw new NotFoundException('Product not found');

    product.show_in_profile = show;
    return this.syncedProductRepo.save(product);
  }

  async updateProductOverride(userId: string, productId: string, data: {
    override_name?: string;
    override_price?: number;
    override_description?: string;
  }) {
    const store = await this.storeRepo.findOne({ where: { user_id: userId } });
    if (!store) throw new NotFoundException('Store not found');

    const product = await this.syncedProductRepo.findOne({
      where: { id: productId, store_id: store.id },
    });
    if (!product) throw new NotFoundException('Product not found');

    if (data.override_name !== undefined) product.override_name = data.override_name;
    if (data.override_price !== undefined) product.override_price = data.override_price;
    if (data.override_description !== undefined) product.override_description = data.override_description;

    return this.syncedProductRepo.save(product);
  }

  // ==================== ORDERS ====================

  async syncOrders(userId: string, connectionId?: string) {
    const store = await this.storeRepo.findOne({ where: { user_id: userId } });
    if (!store) throw new NotFoundException('Store not found');

    const whereClause: any = { store_id: store.id, is_active: true };
    if (connectionId) whereClause.id = connectionId;

    const connections = await this.connectionRepo.find({ where: whereClause });
    const results: Array<{ connection_id: string; synced?: number; error?: string }> = [];

    for (const connection of connections) {
      try {
        let synced = 0;
        if (connection.store_type === StoreType.WOOCOMMERCE) {
          synced = await this.syncWooCommerceOrders(connection, store.id);
        } else if (connection.store_type === StoreType.SHOPIFY) {
          synced = await this.syncShopifyOrders(connection, store.id);
        }
        results.push({ connection_id: connection.id, synced });
      } catch (error) {
        results.push({ connection_id: connection.id, error: error.message });
      }
    }

    return results;
  }

  private async syncWooCommerceOrders(connection: StoreConnection, storeId: string): Promise<number> {
    const response = await axios.get(`${connection.store_url}/wp-json/wc/v3/orders`, {
      params: { per_page: 100 },
      auth: { username: connection.api_key, password: connection.api_secret },
    });

    let synced = 0;
    for (const order of response.data) {
      await this.syncedOrderRepo.upsert({
        store_id: storeId,
        connection_id: connection.id,
        external_id: String(order.id),
        order_number: order.number,
        status: order.status,
        customer_email: order.billing?.email,
        customer_name: `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.trim(),
        total: parseFloat(order.total) || 0,
        currency: order.currency,
        items_count: order.line_items?.length || 0,
        external_data: order,
        placed_at: new Date(order.date_created),
      }, ['store_id', 'connection_id', 'external_id']);
      synced++;
    }

    return synced;
  }

  private async syncShopifyOrders(connection: StoreConnection, storeId: string): Promise<number> {
    const response = await axios.get(`https://${connection.store_url}/admin/api/2023-10/orders.json`, {
      params: { limit: 250 },
      headers: { 'X-Shopify-Access-Token': connection.api_secret },
    });

    let synced = 0;
    for (const order of response.data.orders) {
      await this.syncedOrderRepo.upsert({
        store_id: storeId,
        connection_id: connection.id,
        external_id: String(order.id),
        order_number: order.name,
        status: order.fulfillment_status || 'unfulfilled',
        customer_email: order.email,
        customer_name: order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : '',
        total: parseFloat(order.total_price) || 0,
        currency: order.currency,
        items_count: order.line_items?.length || 0,
        external_data: order,
        placed_at: new Date(order.created_at),
      }, ['store_id', 'connection_id', 'external_id']);
      synced++;
    }

    return synced;
  }

  async getOrders(userId: string, connectionId?: string, status?: string, page = 1, limit = 20) {
    const store = await this.storeRepo.findOne({ where: { user_id: userId } });
    if (!store) throw new NotFoundException('Store not found');

    const whereClause: any = { store_id: store.id };
    if (connectionId) whereClause.connection_id = connectionId;
    if (status) whereClause.status = status;

    const [items, total] = await this.syncedOrderRepo.findAndCount({
      where: whereClause,
      order: { placed_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async getOrderStats(userId: string) {
    const store = await this.storeRepo.findOne({ where: { user_id: userId } });
    if (!store) return { total_orders: 0, total_revenue: 0, pending_orders: 0 };

    const orders = await this.syncedOrderRepo.find({ where: { store_id: store.id } });

    const total_orders = orders.length;
    const total_revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const pending_orders = orders.filter(o => ['pending', 'processing', 'unfulfilled'].includes(o.status)).length;

    return { total_orders, total_revenue, pending_orders };
  }

  // ==================== PUBLIC STORE VIEW ====================

  async getPublicStore(userId: string) {
    const store = await this.storeRepo.findOne({
      where: { user_id: userId, is_active: true, status: StoreStatus.ACTIVE },
    });
    if (!store) return null;

    const products = await this.syncedProductRepo.find({
      where: { store_id: store.id, is_available: true, show_in_profile: true },
      order: { featured_order: 'ASC', updated_at: 'DESC' },
      take: 50,
    });

    // Use overrides if set
    const displayProducts = products.map(p => ({
      id: p.id,
      name: p.override_name || p.name,
      description: p.override_description || p.description,
      price: p.override_price ?? p.price,
      image_url: p.image_url,
      external_id: p.external_id,
      connection_id: p.connection_id,
    }));

    return {
      store: {
        name: store.name,
        description: store.description,
        logo_url: store.logo_url,
        banner_url: store.banner_url,
      },
      products: displayProducts,
    };
  }

  // Get product purchase URL (redirects to external store)
  async getProductPurchaseUrl(productId: string) {
    const product = await this.syncedProductRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const connection = await this.connectionRepo.findOne({ where: { id: product.connection_id } });
    if (!connection) throw new NotFoundException('Store connection not found');

    if (connection.store_type === StoreType.WOOCOMMERCE) {
      return { url: `${connection.store_url}/?p=${product.external_id}` };
    } else if (connection.store_type === StoreType.SHOPIFY) {
      return { url: `https://${connection.store_url}/products/${product.external_id}` };
    }

    return { url: null };
  }
}
