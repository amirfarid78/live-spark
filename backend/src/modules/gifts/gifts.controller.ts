import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GiftsService } from './gifts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '../../entities/user-role.entity';
import { GiftCategory } from '../../entities/gift.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('gifts')
@Controller('gifts')
export class GiftsController {
  constructor(private giftsService: GiftsService) {}

  @Get()
  @ApiOperation({ summary: 'Get gift catalog' })
  async getCatalog(@Query('category') category?: GiftCategory) {
    return this.giftsService.getGiftCatalog(category);
  }

  @Get(':id')
  async getGift(@Param('id') giftId: string) {
    return this.giftsService.getGiftById(giftId);
  }

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a gift to another user' })
  async sendGift(
    @CurrentUser('sub') userId: string,
    @Body() body: {
      receiver_id: string;
      gift_id: string;
      quantity: number;
      context_type?: string;
      context_id?: string;
    },
  ) {
    return this.giftsService.sendGift(
      userId, body.receiver_id, body.gift_id, body.quantity,
      body.context_type, body.context_id,
    );
  }

  @Get('history/sent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getSentHistory(@CurrentUser('sub') userId: string, @Query() dto: PaginationDto) {
    return this.giftsService.getGiftHistory(userId, 'sent', dto.page, dto.limit);
  }

  @Get('history/received')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getReceivedHistory(@CurrentUser('sub') userId: string, @Query() dto: PaginationDto) {
    return this.giftsService.getGiftHistory(userId, 'received', dto.page, dto.limit);
  }

  // Admin
  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create a gift' })
  async createGift(@Body() body: any) {
    return this.giftsService.createGift(body);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async updateGift(@Param('id') giftId: string, @Body() body: any) {
    return this.giftsService.updateGift(giftId, body);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async deleteGift(@Param('id') giftId: string) {
    return this.giftsService.deleteGift(giftId);
  }
}
