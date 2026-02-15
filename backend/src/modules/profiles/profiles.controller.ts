import {
  Controller, Get, Patch, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my profile' })
  async getMyProfile(@CurrentUser('sub') userId: string) {
    return this.profilesService.getProfile(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my profile' })
  async updateMyProfile(@CurrentUser('sub') userId: string, @Body() data: any) {
    return this.profilesService.updateProfile(userId, data);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async searchProfiles(
    @Query('q') query: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.profilesService.searchProfiles(query, page, limit);
  }

  @Get('top-creators')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getTopCreators(@Query('limit') limit = 20) {
    return this.profilesService.getTopCreators(limit);
  }

  @Get('suggested')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getSuggested(@CurrentUser('sub') userId: string) {
    return this.profilesService.getSuggestedUsers(userId);
  }

  @Get('username/:username')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getProfileByUsername(@Param('username') username: string) {
    return this.profilesService.getProfileByUsername(username);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getProfile(@Param('userId') userId: string) {
    return this.profilesService.getProfile(userId);
  }
}
