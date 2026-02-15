import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { RoleType } from '../../entities/user-role.entity';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  async dashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('charts/users')
  @ApiOperation({ summary: 'User growth chart data' })
  async userGrowth(@Query('days') days?: string) {
    return this.adminService.getUserGrowthChart(days ? Number(days) : 30);
  }

  @Get('charts/revenue')
  @ApiOperation({ summary: 'Revenue chart data' })
  async revenueChart(@Query('days') days?: string) {
    return this.adminService.getRevenueChart(days ? Number(days) : 30);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get all platform settings' })
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Get('settings/category/:category')
  async getSettingsByCategory(@Param('category') category: string) {
    return this.adminService.getSettingsByCategory(category);
  }

  @Get('settings/:key')
  async getSetting(@Param('key') key: string) {
    return this.adminService.getSetting(key);
  }

  @Post('settings')
  @ApiOperation({ summary: 'Create or update a platform setting' })
  async upsertSetting(@Body() body: { key: string; value: string; description?: string; category?: string; value_type?: string }) {
    return this.adminService.upsertSetting(body.key, body.value, body);
  }

  @Delete('settings/:key')
  async deleteSetting(@Param('key') key: string) {
    return this.adminService.deleteSetting(key);
  }

  @Get('top/streamers')
  async topStreamers(@Query('limit') limit?: string) {
    return this.adminService.getTopStreamers(limit ? Number(limit) : 20);
  }

  @Get('top/gift-senders')
  async topGiftSenders(@Query('limit') limit?: string) {
    return this.adminService.getTopGiftSenders(limit ? Number(limit) : 20);
  }

  @Get('health')
  @ApiOperation({ summary: 'System health check' })
  async health() {
    return this.adminService.getSystemHealth();
  }
}
