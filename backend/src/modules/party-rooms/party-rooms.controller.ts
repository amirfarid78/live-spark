import {
  Controller, Get, Post, Delete, Param, Query, Body, UseGuards, Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PartyRoomsService } from './party-rooms.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('party-rooms')
@Controller('party-rooms')
export class PartyRoomsController {
  constructor(private partyRoomsService: PartyRoomsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an audio party room' })
  async createRoom(@CurrentUser('sub') userId: string, @Body() body: any) {
    return this.partyRoomsService.createRoom(userId, body);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active party rooms' })
  async getActiveRooms(@Query() dto: PaginationDto, @Query('category') category?: string) {
    return this.partyRoomsService.getActiveRooms(dto.page, dto.limit, category);
  }

  @Get(':id')
  async getRoom(@Param('id') roomId: string) {
    return this.partyRoomsService.getRoomById(roomId);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async joinRoom(@Param('id') roomId: string, @CurrentUser('sub') userId: string) {
    return this.partyRoomsService.joinRoom(roomId, userId);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async leaveRoom(@Param('id') roomId: string, @CurrentUser('sub') userId: string) {
    return this.partyRoomsService.leaveRoom(roomId, userId);
  }

  @Post(':id/seats/:seatNumber/take')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async takeSeat(
    @Param('id') roomId: string,
    @Param('seatNumber') seatNumber: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.partyRoomsService.takeSeat(roomId, seatNumber, userId);
  }

  @Post(':id/seats/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async leaveSeat(@Param('id') roomId: string, @CurrentUser('sub') userId: string) {
    return this.partyRoomsService.leaveSeat(roomId, userId);
  }

  @Patch(':id/seats/:seatNumber/lock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async lockSeat(
    @Param('id') roomId: string,
    @Param('seatNumber') seatNumber: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.partyRoomsService.lockSeat(roomId, seatNumber, userId);
  }

  @Patch(':id/seats/:seatNumber/mute')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async muteSeat(
    @Param('id') roomId: string,
    @Param('seatNumber') seatNumber: number,
    @CurrentUser('sub') userId: string,
    @Body('muted') muted: boolean,
  ) {
    return this.partyRoomsService.muteSeat(roomId, seatNumber, userId, muted);
  }

  @Patch(':id/seats/:seatNumber/unlock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlock a seat (host only)' })
  async unlockSeat(
    @Param('id') roomId: string,
    @Param('seatNumber') seatNumber: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.partyRoomsService.unlockSeat(roomId, seatNumber, userId);
  }

  @Post(':id/seats/:seatNumber/kick')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kick user from seat (host only)' })
  async kickFromSeat(
    @Param('id') roomId: string,
    @Param('seatNumber') seatNumber: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.partyRoomsService.kickFromSeat(roomId, seatNumber, userId);
  }

  @Post(':id/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async endRoom(@Param('id') roomId: string, @CurrentUser('sub') userId: string) {
    return this.partyRoomsService.endRoom(roomId, userId);
  }

  @Post(':id/gift')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a gift in party room' })
  async sendGift(
    @Param('id') roomId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { receiver_id: string; gift_id: string; quantity?: number },
  ) {
    return this.partyRoomsService.sendGift(roomId, userId, body.receiver_id, body.gift_id, body.quantity || 1);
  }

  @Post(':id/chat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async sendChat(
    @Param('id') roomId: string,
    @CurrentUser('sub') userId: string,
    @Body('message') message: string,
  ) {
    return this.partyRoomsService.sendChat(roomId, userId, message);
  }

  @Get(':id/chat')
  async getChatHistory(@Param('id') roomId: string) {
    return this.partyRoomsService.getChatHistory(roomId);
  }
}
