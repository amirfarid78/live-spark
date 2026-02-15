import {
  Controller, Get, Post, Delete, Param, Query, Body, UseGuards, Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LiveService } from './live.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '../../entities/user-role.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('live')
@Controller('live')
export class LiveController {
  constructor(private liveService: LiveService) {}

  @Post('start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a live stream' })
  async goLive(@CurrentUser('sub') userId: string, @Body() body: any) {
    return this.liveService.goLive(userId, body);
  }

  @Post(':id/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End a live stream' })
  async endStream(@Param('id') streamId: string, @CurrentUser('sub') userId: string) {
    return this.liveService.endStream(streamId, userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active live streams' })
  async getActiveStreams(
    @Query() dto: PaginationDto,
    @Query('category') category?: string,
  ) {
    return this.liveService.getActiveStreams(dto.page, dto.limit, category);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured live streams' })
  async getFeatured(@Query('limit') limit = 5) {
    return this.liveService.getFeaturedStreams(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stream details' })
  async getStream(@Param('id') streamId: string) {
    return this.liveService.getStreamById(streamId);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a live stream as viewer' })
  async joinStream(@Param('id') streamId: string, @CurrentUser('sub') userId: string) {
    return this.liveService.joinStream(streamId, userId);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async leaveStream(@Param('id') streamId: string, @CurrentUser('sub') userId: string) {
    return this.liveService.leaveStream(streamId, userId);
  }

  @Post(':id/chat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async sendChat(
    @Param('id') streamId: string,
    @CurrentUser('sub') userId: string,
    @Body('message') message: string,
    @Body('type') type?: string,
  ) {
    return this.liveService.sendChatMessage(streamId, userId, message, type);
  }

  @Get(':id/chat')
  async getChatHistory(@Param('id') streamId: string, @Query('limit') limit = 50) {
    return this.liveService.getChatHistory(streamId, limit);
  }

  @Get(':id/viewers')
  async getViewers(@Param('id') streamId: string) {
    return this.liveService.getStreamViewers(streamId);
  }

  @Post(':id/gift')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a gift during live stream' })
  async sendGift(
    @Param('id') streamId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { gift_id: string; quantity?: number },
  ) {
    return this.liveService.sendGift(streamId, userId, body.gift_id, body.quantity || 1);
  }

  @Get('history/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getStreamHistory(@Param('userId') userId: string, @Query() dto: PaginationDto) {
    return this.liveService.getStreamHistory(userId, dto.page, dto.limit);
  }

  // Admin
  @Post(':id/force-end')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Force end a live stream' })
  async adminForceEnd(@Param('id') streamId: string) {
    return this.liveService.adminForceEndStream(streamId);
  }

  @Get('admin/all-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiBearerAuth()
  async adminGetAllActive() {
    return this.liveService.adminGetAllActiveStreams();
  }
}
