import {
  Controller, Get, Post, Patch, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '../../entities/user-role.entity';
import { TransactionType, CurrencyType } from '../../entities/wallet.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get my wallet balance' })
  async getBalance(@CurrentUser('sub') userId: string) {
    return this.walletService.getBalance(userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactions(
    @CurrentUser('sub') userId: string,
    @Query() dto: PaginationDto,
    @Query('type') type?: TransactionType,
  ) {
    return this.walletService.getTransactionHistory(userId, dto.page, dto.limit, type);
  }

  @Get('earnings')
  @ApiOperation({ summary: 'Get earnings summary' })
  async getEarnings(@CurrentUser('sub') userId: string) {
    return this.walletService.getEarnings(userId);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Request diamond withdrawal' })
  async withdraw(@CurrentUser('sub') userId: string, @Body('amount') amount: number) {
    return this.walletService.withdrawDiamonds(userId, amount);
  }

  @Get('coin-packages')
  @ApiOperation({ summary: 'Get available coin packages' })
  async getCoinPackages() {
    return this.walletService.getCoinPackages();
  }

  // Admin
  @Post('admin/adjust')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  async adminAdjust(
    @Body() body: { user_id: string; currency: CurrencyType; amount: number; reason: string },
  ) {
    return this.walletService.adminAdjustBalance(body.user_id, body.currency, body.amount, body.reason);
  }

  @Get('admin/revenue')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  async adminRevenue(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.walletService.adminGetRevenueReport(start, end);
  }

  @Post('admin/coin-packages')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  async adminCreatePackage(@Body() body: any) {
    return this.walletService.adminCreateCoinPackage(body);
  }

  @Patch('admin/coin-packages/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  async adminUpdatePackage(@Param('id') id: string, @Body() body: any) {
    return this.walletService.adminUpdateCoinPackage(id, body);
  }
}
