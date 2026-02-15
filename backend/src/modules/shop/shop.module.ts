import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { Product, Order, OrderItem } from '../../entities/shop.entity';
import { Profile } from '../../entities/profile.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Product, Order, OrderItem, Profile])],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
