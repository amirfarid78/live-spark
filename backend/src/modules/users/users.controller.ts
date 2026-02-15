import {
  Controller, Get, Post, Delete, Param, Query, Body, UseGuards, Patch, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '../../entities/user-role.entity';
import { ListUsersDto, BanUserDto, AssignRoleDto, RegisterFCMTokenDto } from './dto/users.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List/search users' })
  async listUsers(@Query() dto: ListUsersDto) {
    return this.usersService.listUsers(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a user' })
  async follow(@CurrentUser('sub') userId: string, @Param('id') targetId: string) {
    return this.usersService.follow(userId, targetId);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow a user' })
  async unfollow(@CurrentUser('sub') userId: string, @Param('id') targetId: string) {
    return this.usersService.unfollow(userId, targetId);
  }

  @Get(':id/followers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getFollowers(@Param('id') userId: string, @Query() dto: PaginationDto) {
    return this.usersService.getFollowers(userId, dto.page, dto.limit);
  }

  @Get(':id/following')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getFollowing(@Param('id') userId: string, @Query() dto: PaginationDto) {
    return this.usersService.getFollowing(userId, dto.page, dto.limit);
  }

  @Get(':id/is-following')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async isFollowing(@CurrentUser('sub') userId: string, @Param('id') targetId: string) {
    return this.usersService.isFollowing(userId, targetId);
  }

  @Post(':id/block')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async blockUser(@CurrentUser('sub') userId: string, @Param('id') targetId: string) {
    return this.usersService.blockUser(userId, targetId);
  }

  @Delete(':id/block')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async unblockUser(@CurrentUser('sub') userId: string, @Param('id') targetId: string) {
    return this.usersService.unblockUser(userId, targetId);
  }

  @Get('me/blocked')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of blocked users' })
  async getBlockedUsers(@CurrentUser('sub') userId: string, @Query() dto: PaginationDto) {
    return this.usersService.getBlockedUsers(userId, dto.page, dto.limit);
  }

  @Post('me/fcm-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register FCM token for push notifications' })
  async registerFCMToken(
    @CurrentUser('sub') userId: string,
    @Body() dto: RegisterFCMTokenDto,
  ) {
    return this.usersService.registerFCMToken(userId, dto.fcm_token);
  }

  // Admin endpoints
  @Post(':id/ban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Ban user' })
  async banUser(@Param('id') userId: string, @Body() dto: BanUserDto) {
    return this.usersService.banUser(userId, dto);
  }

  @Delete(':id/ban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async unbanUser(@Param('id') userId: string) {
    return this.usersService.unbanUser(userId);
  }

  @Patch(':id/shadow-ban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async shadowBan(@Param('id') userId: string, @Body('shadow') shadow: boolean) {
    return this.usersService.shadowBan(userId, shadow);
  }

  @Post(':id/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async assignRole(@Param('id') userId: string, @Body() dto: AssignRoleDto) {
    return this.usersService.assignRole(userId, dto);
  }

  @Delete(':id/roles/:role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async removeRole(@Param('id') userId: string, @Param('role') role: RoleType) {
    return this.usersService.removeRole(userId, role);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async verifyCreator(@Param('id') userId: string, @Body('verified') verified: boolean) {
    return this.usersService.verifyCreator(userId, verified);
  }
}
