import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '../../entities/user-role.entity';
import { ProductStatus, OrderStatus } from '../../entities/shop.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(private shopService: ShopService) {}

  // Products
  @Post('products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product listing' })
  async createProduct(
    @CurrentUser('sub') userId: string,
    @Body() body: {
      name: string; description?: string; price: number; compare_at_price?: number;
      images: string[]; category?: string; tags?: string[]; stock_quantity?: number; sku?: string;
    },
  ) {
    return this.shopService.createProduct(userId, body);
  }

  @Get('products')
  @ApiOperation({ summary: 'Browse products' })
  async listProducts(
    @Query() dto: PaginationDto,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('seller_id') sellerId?: string,
  ) {
    return this.shopService.listProducts(dto.page, dto.limit, category, search, sellerId);
  }

  @Get('products/featured')
  async featured() {
    return this.shopService.getFeaturedProducts();
  }

  @Get('products/mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async myProducts(@CurrentUser('sub') userId: string, @Query() dto: PaginationDto) {
    return this.shopService.getMyProducts(userId, dto.page, dto.limit);
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return this.shopService.getProduct(id);
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateProduct(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() body: any,
  ) {
    return this.shopService.updateProduct(id, userId, body);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteProduct(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.shopService.deleteProduct(id, userId);
  }

  // Live shopping
  @Post('products/:id/link-stream/:streamId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link a product to a live stream for live shopping' })
  async linkToStream(
    @Param('id') productId: string,
    @Param('streamId') streamId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.shopService.linkProductToStream(productId, userId, streamId);
  }

  @Get('live/:streamId/products')
  @ApiOperation({ summary: 'Get products linked to a live stream' })
  async streamProducts(@Param('streamId') streamId: string) {
    return this.shopService.getStreamProducts(streamId);
  }

  // Orders
  @Post('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place an order' })
  async createOrder(
    @CurrentUser('sub') userId: string,
    @Body() body: {
      items: Array<{ product_id: string; quantity: number }>;
      shipping_address?: any;
      notes?: string;
    },
  ) {
    return this.shopService.createOrder(userId, body);
  }

  @Get('orders/mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async myOrders(@CurrentUser('sub') userId: string, @Query() dto: PaginationDto) {
    return this.shopService.getMyOrders(userId, dto.page, dto.limit);
  }

  @Get('orders/selling')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Orders for products I sell' })
  async sellerOrders(@CurrentUser('sub') userId: string, @Query() dto: PaginationDto) {
    return this.shopService.getSellerOrders(userId, dto.page, dto.limit);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getOrder(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.shopService.getOrder(id, userId);
  }

  @Post('orders/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async cancelOrder(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.shopService.cancelOrder(id, userId);
  }

  @Patch('orders/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateOrderStatus(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.shopService.updateOrderStatus(id, status, userId);
  }

  // Admin
  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async adminOrders(@Query() dto: PaginationDto, @Query('status') status?: OrderStatus) {
    return this.shopService.adminGetAllOrders(dto.page, dto.limit, status);
  }

  @Patch('admin/products/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async adminProductStatus(@Param('id') id: string, @Body('status') status: ProductStatus) {
    return this.shopService.adminUpdateProductStatus(id, status);
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async adminStats() {
    return this.shopService.adminGetShopStats();
  }
}
