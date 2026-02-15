import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment, PaymentGatewaySetting } from '../../entities/payment.entity';
import { CoinPackage, WalletTransaction } from '../../entities/wallet.entity';
import { Profile } from '../../entities/profile.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Payment,
      PaymentGatewaySetting,
      CoinPackage,
      WalletTransaction,
      Profile,
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
