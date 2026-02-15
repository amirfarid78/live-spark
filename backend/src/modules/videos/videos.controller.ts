import {
  Controller, Get, Post, Delete, Patch, Param, Query, Body, UseGuards,
  UseInterceptors, UploadedFile, UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '../../entities/user-role.entity';
import { VideoStatus } from '../../entities/video.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import * as fs from 'fs';

// Ensure directories exist
['./uploads/videos', './uploads/thumbnails'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const multerStorage = diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'thumbnail' ? './uploads/thumbnails' : './uploads/videos';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${extname(file.originalname)}`);
  },
});

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ], { storage: multerStorage, limits: { fileSize: 100 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a new video' })
  async createVideo(
    @CurrentUser('sub') userId: string,
    @UploadedFiles() files: { video?: Express.Multer.File[], thumbnail?: Express.Multer.File[] },
    @Body() body: any,
  ) {
    const videoFile = files?.video?.[0];
    const thumbnailFile = files?.thumbnail?.[0];
    
    const videoData = {
      video_url: videoFile ? `/uploads/videos/${videoFile.filename}` : body.video_url,
      caption: body.caption,
      hashtags: body.hashtags ? JSON.parse(body.hashtags) : [],
      visibility: body.visibility || 'public',
      music_id: body.music_id,
      music_title: body.music_title,
      music_artist: body.music_artist,
      duration: body.duration ? parseInt(body.duration) : 0,
      allows_duet: body.allows_duet !== 'false',
      location: body.location,
      thumbnail_url: thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : body.thumbnail_url,
    };
    return this.videosService.createVideo(userId, videoData);
  }

  @Get('feed')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get video feed (public, personalized if authenticated)' })
  async getFeed(
    @CurrentUser('sub') userId: string | undefined,
    @Query() dto: PaginationDto,
  ) {
    return this.videosService.getFeed(userId, dto.page, dto.limit);
  }

  @Get('discover')
  @ApiOperation({ summary: 'Discover videos' })
  async discover(
    @Query() dto: PaginationDto,
    @Query('category') category?: string,
  ) {
    return this.videosService.discover(dto.page, dto.limit, category);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending videos' })
  async getTrending(@Query('limit') limit = 20) {
    return this.videosService.getTrending(limit);
  }

  @Get('trending-hashtags')
  @ApiOperation({ summary: 'Get trending hashtags' })
  async getTrendingHashtags(@Query('limit') limit = 20) {
    return this.videosService.getTrendingHashtags(limit);
  }

  @Get('music')
  @ApiOperation({ summary: 'Get music library' })
  async getMusicLibrary(@Query() dto: PaginationDto) {
    return this.videosService.getMusicLibrary(dto.page, dto.limit);
  }

  @Get('saved')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get saved videos for current user' })
  async getSavedVideos(@CurrentUser('sub') userId: string, @Query() dto: PaginationDto) {
    return this.videosService.getSavedVideos(userId, dto.page, dto.limit);
  }

  @Get('liked')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get liked videos for current user' })
  async getLikedVideos(@CurrentUser('sub') userId: string, @Query() dto: PaginationDto) {
    return this.videosService.getLikedVideos(userId, dto.page, dto.limit);
  }

  @Get('user/:userId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  async getUserVideos(
    @Param('userId') userId: string, 
    @Query() dto: PaginationDto,
    @CurrentUser('sub') currentUserId: string | undefined,
  ) {
    return this.videosService.getUserVideos(userId, dto.page, dto.limit, currentUserId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  async getVideo(@Param('id') id: string, @CurrentUser('sub') userId: string | undefined) {
    return this.videosService.getVideoById(id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteVideo(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.videosService.deleteVideo(id, userId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async likeVideo(@CurrentUser('sub') userId: string, @Param('id') videoId: string) {
    return this.videosService.likeVideo(userId, videoId);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async addComment(
    @CurrentUser('sub') userId: string,
    @Param('id') videoId: string,
    @Body('content') content: string,
    @Body('parent_id') parentId?: string,
  ) {
    return this.videosService.addComment(userId, videoId, content, parentId);
  }

  @Get(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getComments(@Param('id') videoId: string, @Query() dto: PaginationDto) {
    return this.videosService.getComments(videoId, dto.page, dto.limit);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.videosService.deleteComment(commentId, userId);
  }

  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async saveVideo(@CurrentUser('sub') userId: string, @Param('id') videoId: string) {
    return this.videosService.saveVideo(userId, videoId);
  }

  @Post(':id/share')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async shareVideo(
    @CurrentUser('sub') userId: string,
    @Param('id') videoId: string,
    @Body('platform') platform?: string,
  ) {
    return this.videosService.shareVideo(userId, videoId, platform);
  }

  @Post(':id/view')
  async recordView(
    @Param('id') videoId: string,
    @Body('user_id') userId?: string,
    @Body('watch_duration') watchDuration?: number,
  ) {
    await this.videosService.recordView(videoId, userId, watchDuration);
    return { message: 'View recorded' };
  }

  @Patch(':id/pin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async pinVideo(@Param('id') videoId: string, @CurrentUser('sub') userId: string) {
    return this.videosService.pinVideo(videoId, userId);
  }

  // Playlists
  @Post('playlists')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createPlaylist(
    @CurrentUser('sub') userId: string,
    @Body('name') name: string,
    @Body('description') description?: string,
  ) {
    return this.videosService.createPlaylist(userId, name, description);
  }

  @Get('playlists/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMyPlaylists(@CurrentUser('sub') userId: string) {
    return this.videosService.getUserPlaylists(userId);
  }

  @Post('playlists/:playlistId/videos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async addToPlaylist(
    @Param('playlistId') playlistId: string,
    @Body('video_id') videoId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.videosService.addToPlaylist(playlistId, videoId, userId);
  }

  // Admin
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiBearerAuth()
  async adminUpdateStatus(
    @Param('id') videoId: string,
    @Body('status') status: VideoStatus,
  ) {
    return this.videosService.adminUpdateVideoStatus(videoId, status);
  }

  @Patch(':id/nsfw')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiBearerAuth()
  async adminFlagNsfw(
    @Param('id') videoId: string,
    @Body('is_nsfw') isNsfw: boolean,
  ) {
    return this.videosService.adminFlagNsfw(videoId, isNsfw);
  }
}
