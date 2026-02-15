import {
  Controller, Get, Post, Patch, Param, Query, Body, UseGuards, Req, RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '../../entities/user-role.entity';
import { PaymentGateway, PaymentStatus } from '../../entities/payment.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Request } from 'express';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // Stripe
  @Post('stripe/create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe payment intent for coin purchase' })
  async stripeCreateIntent(
    @CurrentUser('sub') userId: string,
    @Body('package_id') packageId: string,
  ) {
    return this.paymentsService.createStripePaymentIntent(userId, packageId);
  }

  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async stripeWebhook(@Req() req: Request) {
    const signature = req.headers['stripe-signature'] as string;
    return this.paymentsService.handleStripeWebhook(req.body, signature);
  }

  // PayPal
  @Post('paypal/create-order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create PayPal order for coin purchase' })
  async paypalCreateOrder(
    @CurrentUser('sub') userId: string,
    @Body('package_id') packageId: string,
  ) {
    return this.paymentsService.createPayPalOrder(userId, packageId);
  }

  @Post('paypal/capture')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async paypalCapture(
    @Body('payment_id') paymentId: string,
    @Body('paypal_order_id') orderId: string,
  ) {
    return this.paymentsService.capturePayPalOrder(paymentId, orderId);
  }

  // PayFast
  @Post('payfast/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create PayFast payment for Pakistan users' })
  async payfastCreate(
    @CurrentUser('sub') userId: string,
    @Body('package_id') packageId: string,
  ) {
    return this.paymentsService.createPayFastPayment(userId, packageId);
  }

  @Post('payfast/webhook')
  async payfastWebhook(@Body() body: any) {
    return this.paymentsService.handlePayFastWebhook(body);
  }

  // Google Pay
  @Post('google-pay/process')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process Google Pay payment' })
  async googlePayProcess(
    @CurrentUser('sub') userId: string,
    @Body() body: { package_id: string; payment_token: any },
  ) {
    return this.paymentsService.processGooglePayToken(userId, body.package_id, body.payment_token);
  }

  // Common
  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMyPayments(@CurrentUser('sub') userId: string, @Query() dto: PaginationDto) {
    return this.paymentsService.getUserPayments(userId, dto.page, dto.limit);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Refund a payment' })
  async refund(@Param('id') paymentId: string, @Body('reason') reason: string) {
    return this.paymentsService.refundPayment(paymentId, reason);
  }

  // Admin
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async adminGetAll(
    @Query() dto: PaginationDto,
    @Query('gateway') gateway?: PaymentGateway,
    @Query('status') status?: PaymentStatus,
  ) {
    return this.paymentsService.adminGetPayments(dto.page, dto.limit, gateway, status);
  }

  @Get('admin/gateways')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async adminGetGateways() {
    return this.paymentsService.adminGetGatewaySettings();
  }

  @Patch('admin/gateways/:gateway')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async adminUpdateGateway(
    @Param('gateway') gateway: PaymentGateway,
    @Body() body: any,
  ) {
    return this.paymentsService.adminUpdateGatewaySetting(gateway, body);
  }

  @Get('admin/settlement')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async adminSettlement(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.paymentsService.adminGetSettlementReport(start, end);
  }

  // Dev helper - complete payment manually
  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Dev] Manually complete a payment (dev only)' })
  async devComplete(@Param('id') paymentId: string) {
    return this.paymentsService.completePayment(paymentId);
  }
}
