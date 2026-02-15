import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { Video } from '../../entities/video.entity';
import {
  VideoLike, VideoComment, VideoSave, VideoShare, VideoView,
  Hashtag, MusicTrack, Playlist, PlaylistVideo,
} from '../../entities/video-interactions.entity';
import { Profile } from '../../entities/profile.entity';
import { Follower } from '../../entities/follower.entity';
import { AuthModule } from '../auth/auth.module';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import * as fs from 'fs';

// Ensure directories exist
const uploadDirs = ['./uploads/videos', './uploads/thumbnails'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Video, VideoLike, VideoComment, VideoSave, VideoShare, VideoView,
      Hashtag, MusicTrack, Playlist, PlaylistVideo, Profile, Follower,
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Route to appropriate folder based on field name
          const folder = file.fieldname === 'thumbnail' ? './uploads/thumbnails' : './uploads/videos';
          cb(null, folder);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    }),
    AuthModule,
  ],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
