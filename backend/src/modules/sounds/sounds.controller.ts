import {
  Controller, Get, Post, Delete, Param, Query, Body, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SoundsService } from './sounds.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SoundCategory } from '../../entities';

@ApiTags('sounds')
@Controller('sounds')
export class SoundsController {
  constructor(private readonly soundsService: SoundsService) {}

  @Get('discover')
  @ApiOperation({ summary: 'Get discover page sounds' })
  async getDiscover() {
    return this.soundsService.getDiscoverSounds();
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending sounds' })
  async getTrending(@Query('limit') limit?: number) {
    return this.soundsService.getTrendingSounds(limit || 20);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured sounds' })
  async getFeatured(@Query('limit') limit?: number) {
    return this.soundsService.getFeaturedSounds(limit || 10);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search sounds' })
  async search(
    @Query('q') query: string,
    @Query('category') category?: SoundCategory,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.soundsService.searchSounds(query, category, page || 1, limit || 20);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get sounds by category' })
  async getByCategory(
    @Param('category') category: SoundCategory,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.soundsService.getSoundsByCategory(category, page || 1, limit || 20);
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user favorite sounds' })
  async getFavorites(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.soundsService.getUserFavorites(req.user.sub, page || 1, limit || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sound details' })
  async getSound(@Param('id') id: string) {
    return this.soundsService.getSound(id);
  }

  @Get(':id/videos')
  @ApiOperation({ summary: 'Get videos using this sound' })
  async getSoundVideos(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.soundsService.getSoundDetails(id, page || 1, limit || 20);
  }

  @Get(':id/favorite-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if sound is favorited' })
  async checkFavorite(@Req() req: any, @Param('id') id: string) {
    const isFavorited = await this.soundsService.isFavorited(req.user.sub, id);
    return { is_favorited: isFavorited };
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add sound to favorites' })
  async addFavorite(@Req() req: any, @Param('id') id: string) {
    return this.soundsService.addToFavorites(req.user.sub, id);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove sound from favorites' })
  async removeFavorite(@Req() req: any, @Param('id') id: string) {
    return this.soundsService.removeFromFavorites(req.user.sub, id);
  }

  @Post('original')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create original sound from video' })
  async createOriginal(
    @Req() req: any,
    @Body() body: {
      video_id: string;
      title: string;
      audio_url: string;
      cover_url?: string;
      duration: number;
    },
  ) {
    return this.soundsService.createOriginalSound(
      body.video_id,
      req.user.sub,
      body,
    );
  }
}
