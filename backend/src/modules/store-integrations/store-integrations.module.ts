import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StoreIntegrationsController } from './store-integrations.controller';
import { StoreIntegrationsService } from './store-integrations.service';
import { UserStore, StoreConnection, SyncedProduct, SyncedOrder } from '../../entities/store-integration.entity';
import { Profile } from '../../entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserStore,
      StoreConnection,
      SyncedProduct,
      SyncedOrder,
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
  controllers: [StoreIntegrationsController],
  providers: [StoreIntegrationsService],
  exports: [StoreIntegrationsService],
})
export class StoreIntegrationsModule {}
