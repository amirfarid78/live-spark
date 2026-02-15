import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { StoreIntegrationsService } from './store-integrations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreType } from '../../entities/store-integration.entity';

@Controller('store')
export class StoreIntegrationsController {
  constructor(private storeService: StoreIntegrationsService) {}

  // ==================== STORE MANAGEMENT ====================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyStore(@Req() req) {
    return this.storeService.getUserStore(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMyStore(@Req() req, @Body() data: any) {
    return this.storeService.updateStore(req.user.id, data);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateMyStorePut(@Req() req, @Body() data: any) {
    return this.storeService.updateStore(req.user.id, data);
  }

  @Post('me/activate')
  @UseGuards(JwtAuthGuard)
  async activateMyStore(@Req() req) {
    return this.storeService.activateStore(req.user.id);
  }

  // ==================== CONNECTIONS ====================

  @Post('me/connections')
  @UseGuards(JwtAuthGuard)
  async addConnection(@Req() req, @Body() data: {
    store_type: StoreType;
    store_url: string;
    api_key: string;
    api_secret: string;
  }) {
    return this.storeService.addConnection(req.user.id, data);
  }

  @Delete('me/connections/:id')
  @UseGuards(JwtAuthGuard)
  async removeConnection(@Req() req, @Param('id') id: string) {
    return this.storeService.removeConnection(req.user.id, id);
  }

  @Post('me/connections/test')
  @UseGuards(JwtAuthGuard)
  async testConnection(@Body() data: {
    store_type: StoreType;
    store_url: string;
    api_key: string;
    api_secret: string;
  }) {
    const isValid = await this.storeService.testConnection(data.store_type, data.store_url, data.api_key, data.api_secret);
    return { success: isValid };
  }

  // ==================== PRODUCTS ====================

  @Post('me/sync/products')
  @UseGuards(JwtAuthGuard)
  async syncProducts(@Req() req, @Query('connection_id') connectionId?: string) {
    return this.storeService.syncProducts(req.user.id, connectionId);
  }

  @Get('me/products')
  @UseGuards(JwtAuthGuard)
  async getMyProducts(
    @Req() req,
    @Query('connection_id') connectionId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.storeService.getSyncedProducts(req.user.id, connectionId, +page, +limit);
  }

  @Put('me/products/:id/visibility')
  @UseGuards(JwtAuthGuard)
  async toggleProductVisibility(@Req() req, @Param('id') id: string, @Body() body: { show: boolean }) {
    return this.storeService.toggleProductVisibility(req.user.id, id, body.show);
  }

  @Put('me/products/:id')
  @UseGuards(JwtAuthGuard)
  async updateProduct(@Req() req, @Param('id') id: string, @Body() data: any) {
    return this.storeService.updateProductOverride(req.user.id, id, data);
  }

  // ==================== ORDERS ====================

  @Post('me/sync/orders')
  @UseGuards(JwtAuthGuard)
  async syncOrders(@Req() req, @Query('connection_id') connectionId?: string) {
    return this.storeService.syncOrders(req.user.id, connectionId);
  }

  @Get('me/orders')
  @UseGuards(JwtAuthGuard)
  async getMyOrders(
    @Req() req,
    @Query('connection_id') connectionId?: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.storeService.getOrders(req.user.id, connectionId, status, +page, +limit);
  }

  @Get('me/orders/stats')
  @UseGuards(JwtAuthGuard)
  async getOrderStats(@Req() req) {
    return this.storeService.getOrderStats(req.user.id);
  }

  // ==================== PUBLIC STORE ====================

  @Get('user/:userId')
  async getPublicStore(@Param('userId') userId: string) {
    return this.storeService.getPublicStore(userId);
  }

  @Get('products/:id/purchase')
  async getProductPurchaseUrl(@Param('id') id: string) {
    return this.storeService.getProductPurchaseUrl(id);
  }
}
