import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { RoleType } from '../../entities/user-role.entity';
import { BadgeCategory } from '../../entities/badge.entity';

@Controller('badges')
export class BadgesController {
  constructor(private badgesService: BadgesService) {}

  // ==================== PUBLIC ====================

  @Get()
  async getAllBadges(@Query('category') category?: BadgeCategory) {
    if (category) {
      return this.badgesService.getBadgesByCategory(category);
    }
    return this.badgesService.getAllBadges();
  }

  @Get(':id')
  async getBadge(@Param('id') id: string) {
    return this.badgesService.getBadge(id);
  }

  // ==================== USER ====================

  @Get('user/:userId')
  async getUserBadges(@Param('userId') userId: string) {
    return this.badgesService.getUserBadges(userId);
  }

  @Get('user/:userId/displayed')
  async getDisplayedBadges(@Param('userId') userId: string) {
    return this.badgesService.getDisplayedBadges(userId);
  }

  @Put('me/displayed')
  @UseGuards(JwtAuthGuard)
  async updateMyDisplayedBadges(@Req() req, @Body() body: { badge_ids: string[] }) {
    return this.badgesService.updateDisplayedBadges(req.user.id, body.badge_ids);
  }

  @Get('me/all')
  @UseGuards(JwtAuthGuard)
  async getMyBadges(@Req() req) {
    return this.badgesService.getUserBadges(req.user.id);
  }

  @Post('me/check')
  @UseGuards(JwtAuthGuard)
  async checkMyBadges(@Req() req) {
    return this.badgesService.checkAndAwardBadges(req.user.id);
  }

  // ==================== LEVELS ====================

  @Get('levels/config')
  async getLevelConfigs() {
    return this.badgesService.getAllLevelConfigs();
  }

  @Get('levels/me')
  @UseGuards(JwtAuthGuard)
  async getMyLevelProgress(@Req() req) {
    return this.badgesService.getLevelProgress(req.user.id);
  }

  @Get('levels/:userId')
  async getUserLevelProgress(@Param('userId') userId: string) {
    return this.badgesService.getLevelProgress(userId);
  }

  // ==================== XP ====================

  @Get('xp/history')
  @UseGuards(JwtAuthGuard)
  async getMyXPHistory(@Req() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.badgesService.getXPHistory(req.user.id, +page, +limit);
  }

  // ==================== RANKINGS ====================

  @Get('rankings/:category')
  async getLeaderboard(
    @Param('category') category: string,
    @Query('period') period = 'all',
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.badgesService.getLeaderboard(category, period, +page, +limit);
  }

  @Get('rankings/:category/me')
  @UseGuards(JwtAuthGuard)
  async getMyRanking(@Req() req, @Param('category') category: string, @Query('period') period = 'all') {
    return this.badgesService.getUserRanking(req.user.id, category, period);
  }

  // ==================== ADMIN ====================

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async createBadge(@Body() data: any) {
    return this.badgesService.createBadge(data);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async updateBadge(@Param('id') id: string, @Body() data: any) {
    return this.badgesService.updateBadge(id, data);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async deleteBadge(@Param('id') id: string) {
    return this.badgesService.deleteBadge(id);
  }

  @Post('admin/levels')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async createLevelConfig(@Body() data: any) {
    return this.badgesService.createLevelConfig(data);
  }

  @Put('admin/levels/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async updateLevelConfig(@Param('id') id: string, @Body() data: any) {
    return this.badgesService.updateLevelConfig(id, data);
  }

  @Post('admin/rankings/recalculate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async recalculateRankings(@Body() body: { category: string; period: string }) {
    return this.badgesService.recalculateRankings(body.category, body.period);
  }

  @Post('admin/seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async seedDefaults() {
    const badges = await this.badgesService.seedDefaultBadges();
    const levels = await this.badgesService.seedDefaultLevels();
    return { badges, levels };
  }

  @Post('admin/award')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async adminAwardBadge(@Body() body: { user_id: string; badge_code: string }) {
    return this.badgesService.awardBadge(body.user_id, body.badge_code);
  }

  @Post('admin/xp')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async adminAddXP(@Body() body: { user_id: string; amount: number; description: string }) {
    return this.badgesService.addXP(body.user_id, body.amount, 'admin', undefined, body.description);
  }
}
