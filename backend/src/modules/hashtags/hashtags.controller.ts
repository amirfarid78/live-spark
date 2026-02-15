import {
  Controller, Get, Post, Patch, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HashtagsService } from './hashtags.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HashtagStatus } from '../../entities';

@ApiTags('hashtags')
@Controller('hashtags')
export class HashtagsController {
  constructor(private readonly hashtagsService: HashtagsService) {}

  @Get('discover')
  @ApiOperation({ summary: 'Get discover page hashtags' })
  async getDiscover() {
    return this.hashtagsService.getDiscoverHashtags();
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending hashtags' })
  async getTrending(@Query('limit') limit?: number) {
    return this.hashtagsService.getTrendingHashtags(limit || 20);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured hashtags' })
  async getFeatured(@Query('limit') limit?: number) {
    return this.hashtagsService.getFeaturedHashtags(limit || 10);
  }

  @Get('challenges')
  @ApiOperation({ summary: 'Get challenge hashtags' })
  async getChallenges(@Query('limit') limit?: number) {
    return this.hashtagsService.getChallengeHashtags(limit || 10);
  }

  @Get('challenges/active')
  @ApiOperation({ summary: 'Get active challenge hashtags' })
  async getActiveChallenges() {
    return this.hashtagsService.getActiveChallenge();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search hashtags' })
  async search(
    @Query('q') query: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.hashtagsService.searchHashtags(query, page || 1, limit || 20);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get hashtag by name' })
  async getByName(@Param('name') name: string) {
    return this.hashtagsService.getHashtagByName(name);
  }

  @Get('name/:name/videos')
  @ApiOperation({ summary: 'Get hashtag details with videos by name' })
  async getDetailsByName(
    @Param('name') name: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.hashtagsService.getHashtagDetailsByName(name, page || 1, limit || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hashtag details' })
  async getHashtag(@Param('id') id: string) {
    return this.hashtagsService.getHashtag(id);
  }

  @Get(':id/videos')
  @ApiOperation({ summary: 'Get videos using this hashtag' })
  async getHashtagVideos(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.hashtagsService.getHashtagDetails(id, page || 1, limit || 20);
  }

  @Get('video/:videoId')
  @ApiOperation({ summary: 'Get hashtags for a video' })
  async getVideoHashtags(@Param('videoId') videoId: string) {
    return this.hashtagsService.getVideoHashtags(videoId);
  }

  // Admin endpoints
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create hashtag (admin)' })
  async create(
    @Body() body: {
      name: string;
      display_name?: string;
      description?: string;
      cover_url?: string;
      is_featured?: boolean;
      is_challenge?: boolean;
      challenge_start_date?: Date;
      challenge_end_date?: Date;
      associated_sound_id?: string;
    },
  ) {
    return this.hashtagsService.createHashtag(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hashtag (admin)' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.hashtagsService.updateHashtag(id, body);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set hashtag status (admin)' })
  async setStatus(
    @Param('id') id: string,
    @Body('status') status: HashtagStatus,
  ) {
    return this.hashtagsService.setHashtagStatus(id, status);
  }
}
