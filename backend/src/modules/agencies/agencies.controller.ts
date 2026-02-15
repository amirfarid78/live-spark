import {
  Controller, Get, Post, Patch, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AgenciesService } from './agencies.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '../../entities/user-role.entity';
import { AgencyStatus } from '../../entities/agency.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('agencies')
@Controller('agencies')
export class AgenciesController {
  constructor(private agenciesService: AgenciesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an agency' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() body: { name: string; description?: string; logo_url?: string; commission_rate?: number },
  ) {
    return this.agenciesService.createAgency(userId, body);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMyAgency(@CurrentUser('sub') userId: string) {
    return this.agenciesService.getMyAgency(userId);
  }

  @Get('mine/dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async myDashboard(@CurrentUser('sub') userId: string) {
    const agency = await this.agenciesService.getMyAgency(userId);
    return this.agenciesService.getAgencyDashboard(agency.id);
  }

  @Patch('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateMine(
    @CurrentUser('sub') userId: string,
    @Body() body: { name?: string; description?: string; logo_url?: string; commission_rate?: number },
  ) {
    const agency = await this.agenciesService.getMyAgency(userId);
    return this.agenciesService.updateAgency(agency.id, userId, body);
  }

  @Get(':id')
  async getAgency(@Param('id') id: string) {
    return this.agenciesService.getAgency(id);
  }

  // Streamer management
  @Post(':id/invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite a streamer to agency' })
  async invite(
    @Param('id') agencyId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { streamer_id: string; commission_rate?: number },
  ) {
    return this.agenciesService.inviteStreamer(agencyId, userId, body.streamer_id, body.commission_rate);
  }

  @Post('invites/:id/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async respondInvite(
    @Param('id') inviteId: string,
    @CurrentUser('sub') userId: string,
    @Body('accept') accept: boolean,
  ) {
    return this.agenciesService.respondToInvite(userId, inviteId, accept);
  }

  @Get('invites/pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async myPendingInvites(@CurrentUser('sub') userId: string) {
    return this.agenciesService.getMyPendingInvites(userId);
  }

  @Get('membership/current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async myMembership(@CurrentUser('sub') userId: string) {
    return this.agenciesService.getMyAgencyMembership(userId);
  }

  @Get(':id/streamers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getStreamers(@Param('id') agencyId: string, @Query() dto: PaginationDto) {
    return this.agenciesService.getAgencyStreamers(agencyId, dto.page, dto.limit);
  }

  @Post(':id/streamers/:streamerId/remove')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removeStreamer(
    @Param('id') agencyId: string,
    @Param('streamerId') streamerId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.agenciesService.removeStreamer(agencyId, userId, streamerId);
  }

  // Earnings
  @Get(':id/earnings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getEarnings(
    @Param('id') agencyId: string,
    @Query() dto: PaginationDto,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.agenciesService.getAgencyEarnings(agencyId, dto.page, dto.limit, start, end);
  }

  // Admin
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async adminListAll(@Query() dto: PaginationDto, @Query('status') status?: AgencyStatus) {
    return this.agenciesService.listAgencies(dto.page, dto.limit, status);
  }

  @Post('admin/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async adminApprove(@Param('id') id: string) {
    return this.agenciesService.adminApproveAgency(id);
  }

  @Post('admin/:id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async adminSuspend(@Param('id') id: string) {
    return this.agenciesService.adminSuspendAgency(id);
  }
}
