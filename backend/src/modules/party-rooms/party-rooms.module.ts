import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyRoomsController } from './party-rooms.controller';
import { PartyRoomsService } from './party-rooms.service';
import { PartyRoom, PartySeat, PartyChatMessage } from '../../entities/party-room.entity';
import { Profile } from '../../entities/profile.entity';
import { Gift, GiftTransaction } from '../../entities/gift.entity';
import { WalletTransaction } from '../../entities/wallet.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PartyRoom, PartySeat, PartyChatMessage, Profile,
      Gift, GiftTransaction, WalletTransaction,
    ]),
    AuthModule,
  ],
  controllers: [PartyRoomsController],
  providers: [PartyRoomsService],
  exports: [PartyRoomsService],
})
export class PartyRoomsModule {}
