import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '../../entities/user-role.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my notifications' })
  async getNotifications(
    @CurrentUser('sub') userId: string,
    @Query() dto: PaginationDto,
    @Query('unread_only') unreadOnly?: string,
  ) {
    return this.notificationsService.getNotifications(userId, dto.page, dto.limit, unreadOnly === 'true');
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async unreadCount(@CurrentUser('sub') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async markRead(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.notificationsService.markAsRead(userId, id);
  }

  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async markAllRead(@CurrentUser('sub') userId: string) {
    return this.notificationsService.markAllRead(userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteNotification(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.notificationsService.deleteNotification(userId, id);
  }

  // FCM
  @Post('fcm/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register FCM push token' })
  async registerToken(
    @CurrentUser('sub') userId: string,
    @Body() body: { token: string; device_type: string; device_id?: string },
  ) {
    return this.notificationsService.registerFcmToken(userId, body);
  }

  @Post('fcm/unregister')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async unregisterToken(@Body('token') token: string) {
    return this.notificationsService.removeFcmToken(token);
  }

  // Preferences
  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPreferences(@CurrentUser('sub') userId: string) {
    return this.notificationsService.getPreferences(userId);
  }

  @Patch('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updatePreferences(@CurrentUser('sub') userId: string, @Body() body: any) {
    return this.notificationsService.updatePreferences(userId, body);
  }

  // Admin
  @Post('admin/broadcast')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Send broadcast push notification' })
  async broadcast(@Body() body: { title: string; body: string; data?: any }) {
    return this.notificationsService.adminSendBroadcast(body.title, body.body, body.data);
  }
}
