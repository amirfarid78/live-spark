import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoundsController } from './sounds.controller';
import { SoundsService } from './sounds.service';
import { MusicTrack, UserFavoriteSound, Video, User } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([MusicTrack, UserFavoriteSound, Video, User]),
  ],
  controllers: [SoundsController],
  providers: [SoundsService],
  exports: [SoundsService],
})
export class SoundsModule {}
