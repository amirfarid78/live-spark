import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';
import {
  LiveStream, LiveChatMessage, LiveViewer, LiveGift,
} from '../../entities/live-stream.entity';
import { Profile } from '../../entities/profile.entity';
import { Gift, GiftTransaction } from '../../entities/gift.entity';
import { WalletTransaction } from '../../entities/wallet.entity';
import { Follower } from '../../entities/follower.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LiveStream, LiveChatMessage, LiveViewer, LiveGift, Profile,
      Gift, GiftTransaction, WalletTransaction, Follower,
    ]),
    AuthModule,
  ],
  controllers: [LiveController],
  providers: [LiveService],
  exports: [LiveService],
})
export class LiveModule {}
