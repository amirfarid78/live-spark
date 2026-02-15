import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../../entities/user.entity';
import { Profile } from '../../entities/profile.entity';
import { Video } from '../../entities/video.entity';
import { LiveStream } from '../../entities/live-stream.entity';
import { GiftTransaction } from '../../entities/gift.entity';
import { Payment } from '../../entities/payment.entity';
import { Order } from '../../entities/shop.entity';
import { Report } from '../../entities/report.entity';
import { PlatformSetting } from '../../entities/platform-setting.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      User, Profile, Video, LiveStream, GiftTransaction,
      Payment, Order, Report, PlatformSetting,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
