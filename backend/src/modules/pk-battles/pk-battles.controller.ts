import {
  Controller, Get, Post, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PkBattlesService } from './pk-battles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('pk-battles')
@Controller('pk-battles')
export class PkBattlesController {
  constructor(private pkBattlesService: PkBattlesService) {}

  @Post('invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite another streamer to PK battle' })
  async invite(
    @CurrentUser('sub') userId: string,
    @Body('opponent_id') opponentId: string,
    @Body('duration') duration?: number,
  ) {
    return this.pkBattlesService.inviteToPK(userId, opponentId, duration);
  }

  @Post(':id/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept or decline PK battle' })
  async respond(
    @Param('id') battleId: string,
    @CurrentUser('sub') userId: string,
    @Body('accept') accept: boolean,
  ) {
    return this.pkBattlesService.respondToPK(battleId, userId, accept);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async start(@Param('id') battleId: string) {
    return this.pkBattlesService.startPK(battleId);
  }

  @Post(':id/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async end(@Param('id') battleId: string) {
    return this.pkBattlesService.endPK(battleId);
  }

  @Post(':id/gift')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send gift during PK battle' })
  async sendGift(
    @Param('id') battleId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { target_id: string; gift_id: string; coin_value: number; quantity?: number },
  ) {
    return this.pkBattlesService.sendGift(
      battleId, userId, body.target_id, body.gift_id, body.coin_value, body.quantity,
    );
  }

  @Get('active')
  async getActive(@Query() dto: PaginationDto) {
    return this.pkBattlesService.getActiveBattles(dto.page, dto.limit);
  }

  @Get(':id')
  async getBattle(@Param('id') battleId: string) {
    return this.pkBattlesService.getBattle(battleId);
  }

  @Get('history/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getHistory(@Param('userId') userId: string, @Query() dto: PaginationDto) {
    return this.pkBattlesService.getUserBattleHistory(userId, dto.page, dto.limit);
  }
}
