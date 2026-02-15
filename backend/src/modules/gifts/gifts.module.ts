import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftsController } from './gifts.controller';
import { GiftsService } from './gifts.service';
import { Gift, GiftTransaction } from '../../entities/gift.entity';
import { Profile } from '../../entities/profile.entity';
import { WalletTransaction } from '../../entities/wallet.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gift, GiftTransaction, Profile, WalletTransaction]),
    AuthModule,
  ],
  controllers: [GiftsController],
  providers: [GiftsService],
  exports: [GiftsService],
})
export class GiftsModule {}
