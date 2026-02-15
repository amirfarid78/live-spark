import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { Badge, UserBadge, LevelConfig, UserRanking, XPTransaction } from '../../entities/badge.entity';
import { Profile } from '../../entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Badge,
      UserBadge,
      LevelConfig,
      UserRanking,
      XPTransaction,
      Profile,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '7d') },
      }),
    }),
  ],
  controllers: [BadgesController],
  providers: [BadgesService],
  exports: [BadgesService],
})
export class BadgesModule {}
