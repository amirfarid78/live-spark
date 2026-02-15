import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashtagsController } from './hashtags.controller';
import { HashtagsService } from './hashtags.service';
import { Hashtag, VideoHashtag, Video } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hashtag, VideoHashtag, Video]),
  ],
  controllers: [HashtagsController],
  providers: [HashtagsService],
  exports: [HashtagsService],
})
export class HashtagsModule {}
