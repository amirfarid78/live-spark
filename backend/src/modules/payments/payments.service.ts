import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus, PaymentGateway, PaymentGatewaySetting } from '../../entities/payment.entity';
import { CoinPackage } from '../../entities/wallet.entity';
import { Profile } from '../../entities/profile.entity';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class PaymentsService {
  private stripeClient: any;

  constructor(
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    @InjectRepository(PaymentGatewaySetting) private settingsRepo: Repository<PaymentGatewaySetting>,
    @InjectRepository(CoinPackage) private packagesRepo: Repository<CoinPackage>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    private configService: ConfigService,
  ) {
    this.initStripe();
  }

  private initStripe() {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (stripeKey) {
      try {
        const Stripe = require('stripe');
        this.stripeClient = new Stripe(stripeKey);
      } catch (e) {
        console.warn('Stripe SDK not configured');
      }
    }
  }

  // ========== STRIPE ==========
  async createStripePaymentIntent(userId: string, packageId: string) {
    const pkg = await this.packagesRepo.findOne({ where: { id: packageId } });
    if (!pkg) throw new NotFoundException('Package not found');

    const payment = await this.paymentsRepo.save({
      user_id: userId,
      gateway: PaymentGateway.STRIPE,
      amount: pkg.price_usd,
      currency: 'USD',
      reference_type: 'coin_purchase',
      reference_id: pkg.id,
      description: `Purchase ${pkg.coins_amount} coins`,
    });

    if (this.stripeClient) {
      const intent = await this.stripeClient.paymentIntents.create({
        amount: Math.round(Number(pkg.price_usd) * 100), // cents
        currency: 'usd',
        metadata: { payment_id: payment.id, user_id: userId, package_id: packageId },
      });

      payment.gateway_payment_id = intent.id;
      payment.status = PaymentStatus.PROCESSING;
      await this.paymentsRepo.save(payment);

      return { payment_id: payment.id, client_secret: intent.client_secret };
    }

    // Dev fallback
    payment.gateway_payment_id = `dev_${payment.id}`;
    payment.status = PaymentStatus.PROCESSING;
    await this.paymentsRepo.save(payment);

    return { payment_id: payment.id, client_secret: `dev_secret_${payment.id}` };
  }

  async handleStripeWebhook(payload: any, signature: string) {
    let event;

    if (this.stripeClient) {
      const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
      try {
        event = this.stripeClient.webhooks.constructEvent(payload, signature, webhookSecret);
      } catch (err) {
        throw new BadRequestException('Invalid webhook signature');
      }
    } else {
      event = payload; // Dev mode
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data?.object;
      const paymentId = paymentIntent?.metadata?.payment_id;
      if (paymentId) {
        await this.completePayment(paymentId);
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data?.object;
      const paymentId = paymentIntent?.metadata?.payment_id;
      if (paymentId) {
        await this.failPayment(paymentId, paymentIntent?.last_payment_error?.message);
      }
    }

    return { received: true };
  }

  // ========== PAYPAL ==========
  async createPayPalOrder(userId: string, packageId: string) {
    const pkg = await this.packagesRepo.findOne({ where: { id: packageId } });
    if (!pkg) throw new NotFoundException('Package not found');

    const payment = await this.paymentsRepo.save({
      user_id: userId,
      gateway: PaymentGateway.PAYPAL,
      amount: pkg.price_usd,
      currency: 'USD',
      reference_type: 'coin_purchase',
      reference_id: pkg.id,
      description: `Purchase ${pkg.coins_amount} coins`,
    });

    // PayPal integration - would use @paypal/checkout-server-sdk in production
    return {
      payment_id: payment.id,
      paypal_order_id: `pp_${payment.id}`,
      approval_url: `https://www.sandbox.paypal.com/checkoutnow?token=pp_${payment.id}`,
    };
  }

  async capturePayPalOrder(paymentId: string, paypalOrderId: string) {
    // In production, verify with PayPal API
    await this.completePayment(paymentId);
    return { message: 'Payment captured' };
  }

  // ========== PAYFAST ==========
  async createPayFastPayment(userId: string, packageId: string) {
    const pkg = await this.packagesRepo.findOne({ where: { id: packageId } });
    if (!pkg) throw new NotFoundException('Package not found');

    const payment = await this.paymentsRepo.save({
      user_id: userId,
      gateway: PaymentGateway.PAYFAST,
      amount: pkg.price_pkr || (Number(pkg.price_usd) * 280), // Approx PKR conversion
      currency: 'PKR',
      reference_type: 'coin_purchase',
      reference_id: pkg.id,
    });

    const merchantId = this.configService.get('PAYFAST_MERCHANT_ID');
    const merchantKey = this.configService.get('PAYFAST_MERCHANT_KEY');
    const mode = this.configService.get('PAYFAST_MODE', 'sandbox');

    return {
      payment_id: payment.id,
      payfast_url: mode === 'sandbox'
        ? 'https://sandbox.payfast.co.za/eng/process'
        : 'https://www.payfast.co.za/eng/process',
      form_data: {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        amount: payment.amount,
        item_name: `${pkg.coins_amount} Coins`,
        custom_str1: payment.id,
        return_url: `${this.configService.get('FRONTEND_URL')}/wallet?success=1`,
        cancel_url: `${this.configService.get('FRONTEND_URL')}/wallet?cancelled=1`,
        notify_url: `${this.configService.get('FRONTEND_URL')}/api/v1/payments/payfast/webhook`,
      },
    };
  }

  async handlePayFastWebhook(body: any) {
    const paymentId = body.custom_str1;
    if (body.payment_status === 'COMPLETE') {
      await this.completePayment(paymentId);
    }
    return { received: true };
  }

  // ========== GOOGLE PAY ==========
  async processGooglePayToken(userId: string, packageId: string, paymentToken: any) {
    const pkg = await this.packagesRepo.findOne({ where: { id: packageId } });
    if (!pkg) throw new NotFoundException('Package not found');

    const payment = await this.paymentsRepo.save({
      user_id: userId,
      gateway: PaymentGateway.GOOGLE_PAY,
      amount: pkg.price_usd,
      currency: 'USD',
      reference_type: 'coin_purchase',
      reference_id: pkg.id,
      gateway_response: paymentToken,
    });

    // Process via Stripe as payment processor for Google Pay
    if (this.stripeClient) {
      try {
        const intent = await this.stripeClient.paymentIntents.create({
          amount: Math.round(Number(pkg.price_usd) * 100),
          currency: 'usd',
          payment_method_data: {
            type: 'card',
            card: { token: paymentToken.id },
          },
          confirm: true,
          metadata: { payment_id: payment.id },
        });

        if (intent.status === 'succeeded') {
          await this.completePayment(payment.id);
        }
      } catch (err) {
        await this.failPayment(payment.id, err.message);
      }
    } else {
      // Dev mode - auto complete
      await this.completePayment(payment.id);
    }

    return { payment_id: payment.id };
  }

  // ========== COMMON ==========
  async completePayment(paymentId: string) {
    const payment = await this.paymentsRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = PaymentStatus.COMPLETED;
    await this.paymentsRepo.save(payment);

    // Credit coins if coin purchase
    if (payment.reference_type === 'coin_purchase') {
      const pkg = await this.packagesRepo.findOne({ where: { id: payment.reference_id } });
      if (pkg) {
        const totalCoins = pkg.coins_amount + pkg.bonus_coins;
        const profile = await this.profilesRepo.findOne({ where: { user_id: payment.user_id } });
        if (profile) {
          profile.coins_balance = Number(profile.coins_balance) + totalCoins;
          await this.profilesRepo.save(profile);
        }
      }
    }

    return payment;
  }

  async failPayment(paymentId: string, reason?: string) {
    await this.paymentsRepo.update(paymentId, {
      status: PaymentStatus.FAILED,
      failure_reason: reason,
    });
  }

  async refundPayment(paymentId: string, reason: string) {
    const payment = await this.paymentsRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException();
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    // Process refund with gateway
    if (payment.gateway === PaymentGateway.STRIPE && this.stripeClient && payment.gateway_payment_id) {
      await this.stripeClient.refunds.create({
        payment_intent: payment.gateway_payment_id,
      });
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.failure_reason = reason;
    payment.refunded_at = new Date();
    await this.paymentsRepo.save(payment);

    // Deduct coins if coin purchase
    if (payment.reference_type === 'coin_purchase') {
      const pkg = await this.packagesRepo.findOne({ where: { id: payment.reference_id } });
      if (pkg) {
        const totalCoins = pkg.coins_amount + pkg.bonus_coins;
        const profile = await this.profilesRepo.findOne({ where: { user_id: payment.user_id } });
        if (profile) {
          profile.coins_balance = Math.max(0, Number(profile.coins_balance) - totalCoins);
          await this.profilesRepo.save(profile);
        }
      }
    }

    return { message: 'Refund processed' };
  }

  async getUserPayments(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.paymentsRepo.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return new PaginatedResult(items, total, page, limit);
  }

  // Admin
  async adminGetPayments(page = 1, limit = 20, gateway?: PaymentGateway, status?: PaymentStatus) {
    const where: any = {};
    if (gateway) where.gateway = gateway;
    if (status) where.status = status;

    const [items, total] = await this.paymentsRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return new PaginatedResult(items, total, page, limit);
  }

  async adminGetGatewaySettings() {
    return this.settingsRepo.find();
  }

  async adminUpdateGatewaySetting(gateway: PaymentGateway, data: Partial<PaymentGatewaySetting>) {
    let setting = await this.settingsRepo.findOne({ where: { gateway } });
    if (!setting) {
      setting = this.settingsRepo.create({ gateway, ...data });
    } else {
      Object.assign(setting, data);
    }
    return this.settingsRepo.save(setting);
  }

  async adminGetSettlementReport(startDate: string, endDate: string) {
    const result = await this.paymentsRepo
      .createQueryBuilder('p')
      .select('p.gateway', 'gateway')
      .addSelect('p.status', 'status')
      .addSelect('p.currency', 'currency')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(p.amount)', 'total')
      .where('p.created_at BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('p.gateway')
      .addGroupBy('p.status')
      .addGroupBy('p.currency')
      .getRawMany();

    return result;
  }
}
