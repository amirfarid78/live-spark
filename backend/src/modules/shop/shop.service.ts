import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../../entities/shop.entity';
import { Order, OrderStatus, OrderItem } from '../../entities/shop.entity';
import { Profile } from '../../entities/profile.entity';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
  ) {}

  // --- Products ---
  async createProduct(sellerId: string, data: {
    name: string;
    description?: string;
    price: number;
    compare_at_price?: number;
    images: string[];
    category?: string;
    tags?: string[];
    stock_quantity?: number;
  }) {
    const product = this.productRepo.create({
      seller_id: sellerId,
      name: data.name,
      description: data.description,
      price: data.price,
      compare_at_price: data.compare_at_price,
      images: data.images,
      category: data.category,
      tags: data.tags || [],
      stock_quantity: data.stock_quantity ?? 0,
    });
    return this.productRepo.save(product);
  }

  async updateProduct(productId: string, sellerId: string, data: Partial<Product>) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.seller_id !== sellerId) throw new ForbiddenException();
    Object.assign(product, data);
    return this.productRepo.save(product);
  }

  async deleteProduct(productId: string, sellerId: string) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.seller_id !== sellerId) throw new ForbiddenException();
    await this.productRepo.softDelete(productId);
    return { success: true };
  }

  async getProduct(productId: string) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const seller = await this.profileRepo.findOne({ where: { id: product.seller_id } });
    return { ...product, seller };
  }

  async listProducts(page = 1, limit = 20, category?: string, search?: string, sellerId?: string) {
    const qb = this.productRepo.createQueryBuilder('p')
      .where('p.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('p.deleted_at IS NULL')
      .orderBy('p.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (category) qb.andWhere('p.category = :category', { category });
    if (search) qb.andWhere('(p.name ILIKE :search OR p.description ILIKE :search)', { search: `%${search}%` });
    if (sellerId) qb.andWhere('p.seller_id = :sellerId', { sellerId });

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async getMyProducts(sellerId: string, page = 1, limit = 20) {
    const [items, total] = await this.productRepo.findAndCount({
      where: { seller_id: sellerId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async getFeaturedProducts(limit = 10) {
    return this.productRepo.find({
      where: { status: ProductStatus.ACTIVE },
      order: { sales_count: 'DESC' },
      take: limit,
    });
  }

  // --- Orders ---
  async createOrder(buyerId: string, data: {
    items: Array<{ product_id: string; quantity: number }>;
    shipping_address?: any;
    notes?: string;
  }) {
    // Validate items and calculate total
    let subtotal = 0;
    let firstSellerId: string | undefined;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of data.items) {
      const product = await this.productRepo.findOne({ where: { id: item.product_id, status: ProductStatus.ACTIVE } });
      if (!product) throw new BadRequestException(`Product ${item.product_id} not found or unavailable`);
      if (product.stock_quantity < item.quantity) throw new BadRequestException(`Insufficient stock for ${product.name}`);

      if (!firstSellerId) firstSellerId = product.seller_id;

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
      });
    }

    const order = this.orderRepo.create({
      buyer_id: buyerId,
      seller_id: firstSellerId!,
      subtotal,
      total: subtotal, // Could add tax/shipping here
      shipping_address: data.shipping_address || {},
      notes: data.notes,
    });
    const savedOrder = await this.orderRepo.save(order);

    // Create order items
    for (const oi of orderItems) {
      const orderItem = this.orderItemRepo.create({ ...oi, order_id: savedOrder.id });
      await this.orderItemRepo.save(orderItem);

      // Decrement stock
      await this.productRepo.decrement({ id: oi.product_id }, 'stock_quantity', oi.quantity!);
    }

    return this.getOrder(savedOrder.id, buyerId);
  }

  async getOrder(orderId: string, userId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyer_id !== userId) throw new ForbiddenException();

    const items = await this.orderItemRepo.find({ where: { order_id: orderId } });
    return { ...order, items };
  }

  async getMyOrders(buyerId: string, page = 1, limit = 20) {
    const [items, total] = await this.orderRepo.findAndCount({
      where: { buyer_id: buyerId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async getSellerOrders(sellerId: string, page = 1, limit = 20) {
    const qb = this.orderRepo.createQueryBuilder('o')
      .innerJoin('order_items', 'oi', 'oi.order_id = o.id')
      .where('oi.seller_id = :sellerId', { sellerId })
      .orderBy('o.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, userId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = status;
    return this.orderRepo.save(order);
  }

  async cancelOrder(orderId: string, buyerId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId, buyer_id: buyerId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PAID) {
      throw new BadRequestException('Cannot cancel order in current status');
    }

    order.status = OrderStatus.CANCELLED;

    // Restore stock
    const items = await this.orderItemRepo.find({ where: { order_id: orderId } });
    for (const item of items) {
      await this.productRepo.increment({ id: item.product_id }, 'stock_quantity', item.quantity);
    }

    return this.orderRepo.save(order);
  }

  // --- Live shopping link ---
  async linkProductToStream(productId: string, sellerId: string, streamId: string) {
    const product = await this.productRepo.findOne({ where: { id: productId, seller_id: sellerId } });
    if (!product) throw new NotFoundException('Product not found');
    // Product entity does not have live_stream_id; linking is tracked on the Order
    return product;
  }

  async getStreamProducts(streamId: string) {
    // Products are not directly linked to streams; return empty
    return [] as Product[];
  }

  // --- Admin ---
  async adminUpdateProductStatus(productId: string, status: ProductStatus) {
    await this.productRepo.update(productId, { status });
  }

  async adminGetAllOrders(page = 1, limit = 20, status?: OrderStatus) {
    const qb = this.orderRepo.createQueryBuilder('o')
      .orderBy('o.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (status) qb.andWhere('o.status = :status', { status });
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async adminGetShopStats() {
    const totalProducts = await this.productRepo.count({ where: { status: ProductStatus.ACTIVE } });
    const totalOrders = await this.orderRepo.count();
    const revenue = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'total')
      .where('o.status IN (:...statuses)', { statuses: [OrderStatus.DELIVERED, OrderStatus.SHIPPED] })
      .getRawOne();

    return { totalProducts, totalOrders, revenue: Number(revenue.total) };
  }
}
