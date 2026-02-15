import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PkBattlesController } from './pk-battles.controller';
import { PkBattlesService } from './pk-battles.service';
import { PKBattle, PKBattleGift } from '../../entities/pk-battle.entity';
import { LiveStream } from '../../entities/live-stream.entity';
import { Profile } from '../../entities/profile.entity';
import { Gift, GiftTransaction } from '../../entities/gift.entity';
import { WalletTransaction } from '../../entities/wallet.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PKBattle, PKBattleGift, LiveStream, Profile,
      Gift, GiftTransaction, WalletTransaction,
    ]),
    AuthModule,
  ],
  controllers: [PkBattlesController],
  providers: [PkBattlesService],
  exports: [PkBattlesService],
})
export class PkBattlesModule {}
