import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { FirebaseModule } from './common/firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { VideosModule } from './modules/videos/videos.module';
import { LiveModule } from './modules/live/live.module';
import { PkBattlesModule } from './modules/pk-battles/pk-battles.module';
import { ChatModule } from './modules/chat/chat.module';
import { PartyRoomsModule } from './modules/party-rooms/party-rooms.module';
import { GiftsModule } from './modules/gifts/gifts.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AgenciesModule } from './modules/agencies/agencies.module';
import { ShopModule } from './modules/shop/shop.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { StorageModule } from './modules/storage/storage.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { BadgesModule } from './modules/badges/badges.module';
import { StoreIntegrationsModule } from './modules/store-integrations/store-integrations.module';
import { SoundsModule } from './modules/sounds/sounds.module';
import { HashtagsModule } from './modules/hashtags/hashtags.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Serve uploaded files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_NAME', 'postgres'),
        ssl: config.get('DB_SSL', 'false') === 'true' ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') === 'development',
        logging: config.get('NODE_ENV') === 'development' ? ['error', 'warn'] : ['error'],
        extra: {
          // Force IPv4 to avoid ENETUNREACH on IPv6-only DNS results
          family: 4,
        },
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Queue (Redis/BullMQ)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD', '') || undefined,
        },
      }),
    }),

    // Feature modules
    FirebaseModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    VideosModule,
    LiveModule,
    PkBattlesModule,
    ChatModule,
    PartyRoomsModule,
    GiftsModule,
    WalletModule,
    PaymentsModule,
    ReportsModule,
    AgenciesModule,
    ShopModule,
    NotificationsModule,
    AdminModule,
    StorageModule,
    RealtimeModule,
    BadgesModule,
    StoreIntegrationsModule,
    SoundsModule,
    HashtagsModule,
  ],
})
export class AppModule {}
