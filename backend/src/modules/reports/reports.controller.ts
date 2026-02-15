import {
  Controller, Get, Post, Patch, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '../../entities/user-role.entity';
import { ReportStatus, ReportType, ReportReason } from '../../entities/report.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a report' })
  async submit(
    @CurrentUser('sub') userId: string,
    @Body() body: {
      target_type: ReportType;
      target_id: string;
      reason: ReportReason;
      description?: string;
      evidence_urls?: string[];
    },
  ) {
    return this.reportsService.submitReport(userId, body);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMyReports(@CurrentUser('sub') userId: string, @Query() dto: PaginationDto) {
    return this.reportsService.getMyReports(userId, dto.page, dto.limit);
  }

  // Moderation
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiBearerAuth()
  async adminGetAll(
    @Query() dto: PaginationDto,
    @Query('status') status?: ReportStatus,
    @Query('target_type') targetType?: ReportType,
  ) {
    return this.reportsService.getReports(dto.page, dto.limit, status, targetType);
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiBearerAuth()
  async adminStats() {
    return this.reportsService.getReportStats();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiBearerAuth()
  async adminGetOne(@Param('id') id: string) {
    return this.reportsService.getReportById(id);
  }

  @Post('admin/:id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve a report with action' })
  async resolve(
    @Param('id') reportId: string,
    @CurrentUser('sub') moderatorId: string,
    @Body() body: { action: 'dismiss' | 'warn' | 'strike' | 'ban' | 'remove_content'; moderator_notes?: string },
  ) {
    return this.reportsService.resolveReport(reportId, moderatorId, body);
  }

  // Strikes
  @Post('admin/strikes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Issue a strike to a user' })
  async issueStrike(
    @CurrentUser('sub') moderatorId: string,
    @Body() body: { user_id: string; reason: string; expires_at?: string },
  ) {
    return this.reportsService.issueStrike(body.user_id, moderatorId, {
      reason: body.reason,
      expires_at: body.expires_at ? new Date(body.expires_at) : undefined,
    });
  }

  @Get('admin/strikes/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiBearerAuth()
  async getUserStrikes(@Param('userId') userId: string) {
    return this.reportsService.getUserStrikes(userId);
  }

  @Post('admin/strikes/:id/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async revokeStrike(@Param('id') strikeId: string, @CurrentUser('sub') moderatorId: string) {
    return this.reportsService.revokeStrike(strikeId, moderatorId);
  }

  // Audit logs
  @Get('admin/audit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async auditLogs(
    @Query() dto: PaginationDto,
    @Query('actor_id') actorId?: string,
    @Query('action') action?: string,
  ) {
    return this.reportsService.getAuditLogs(dto.page, dto.limit, actorId, action);
  }
}
