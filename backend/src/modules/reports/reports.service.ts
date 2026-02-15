import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus, ReportType, ReportReason } from '../../entities/report.entity';
import { UserStrike } from '../../entities/report.entity';
import { AuditLog } from '../../entities/report.entity';
import { User } from '../../entities/user.entity';
import { Video } from '../../entities/video.entity';
import { LiveStream } from '../../entities/live-stream.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportRepo: Repository<Report>,
    @InjectRepository(UserStrike) private strikeRepo: Repository<UserStrike>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // --- User reports ---
  async submitReport(userId: string, data: {
    target_type: ReportType;
    target_id: string;
    reason: ReportReason;
    description?: string;
    evidence_urls?: string[];
  }) {
    const existing = await this.reportRepo.findOne({
      where: { reporter_id: userId, target_type: data.target_type, target_id: data.target_id, status: ReportStatus.PENDING },
    });
    if (existing) throw new BadRequestException('You already reported this');

    const report = this.reportRepo.create({
      reporter_id: userId,
      target_type: data.target_type,
      target_id: data.target_id,
      reason: data.reason,
      description: data.description,
      evidence_urls: data.evidence_urls || [],
    });
    return this.reportRepo.save(report);
  }

  async getMyReports(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.reportRepo.findAndCount({
      where: { reporter_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  // --- Moderation ---
  async getReports(page = 1, limit = 20, status?: ReportStatus, targetType?: ReportType) {
    const qb = this.reportRepo.createQueryBuilder('r')
      .orderBy('r.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.andWhere('r.status = :status', { status });
    if (targetType) qb.andWhere('r.target_type = :targetType', { targetType });

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async getReportById(reportId: string) {
    const report = await this.reportRepo.findOne({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async resolveReport(reportId: string, moderatorId: string, data: {
    action: 'dismiss' | 'warn' | 'strike' | 'ban' | 'remove_content';
    moderator_notes?: string;
  }) {
    const report = await this.getReportById(reportId);

    report.status = data.action === 'dismiss' ? ReportStatus.DISMISSED : ReportStatus.RESOLVED;
    report.resolved_by = moderatorId;
    report.resolution_note = data.moderator_notes || '';
    report.resolved_at = new Date();
    await this.reportRepo.save(report);

    // Execute action
    if (data.action === 'strike' || data.action === 'ban') {
      await this.issueStrike(report.target_id, moderatorId, {
        reason: `Report #${report.id}: ${report.reason}`,
        report_id: report.id,
      });
    }

    // Log audit
    await this.logAudit(moderatorId, `report.${data.action}`, 'report', report.id, {
      target_type: report.target_type,
      target_id: report.target_id,
      resolution_note: data.moderator_notes,
    });

    return report;
  }

  // --- Strike system ---
  async issueStrike(userId: string, moderatorId: string, data: {
    reason: string;
    report_id?: string;
    expires_at?: Date;
  }) {
    const strike = this.strikeRepo.create({
      user_id: userId,
      issued_by: moderatorId,
      reason: data.reason,
      report_id: data.report_id,
      expires_at: data.expires_at,
    });
    await this.strikeRepo.save(strike);

    // Auto-ban after 3 strikes
    const activeStrikes = await this.strikeRepo.count({
      where: { user_id: userId, is_active: true },
    });

    if (activeStrikes >= 3) {
      await this.userRepo.update(userId, { is_banned: true });
      await this.logAudit(moderatorId, 'user.auto_ban', 'user', userId, {
        strike_count: activeStrikes,
        trigger: 'auto_3_strikes',
      });
    }

    return strike;
  }

  async getUserStrikes(userId: string) {
    return this.strikeRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async revokeStrike(strikeId: string, moderatorId: string) {
    const strike = await this.strikeRepo.findOne({ where: { id: strikeId } });
    if (!strike) throw new NotFoundException('Strike not found');
    strike.is_active = false;
    await this.strikeRepo.save(strike);
    await this.logAudit(moderatorId, 'strike.revoke', 'strike', strikeId, { user_id: strike.user_id });
    return strike;
  }

  // --- Audit log ---
  async logAudit(actorId: string, action: string, entityType: string, entityId: string, metadata?: any) {
    const log = this.auditRepo.create({
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      new_values: metadata || {},
    });
    return this.auditRepo.save(log);
  }

  async getAuditLogs(page = 1, limit = 50, actorId?: string, action?: string) {
    const qb = this.auditRepo.createQueryBuilder('a')
      .orderBy('a.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (actorId) qb.andWhere('a.actor_id = :actorId', { actorId });
    if (action) qb.andWhere('a.action LIKE :action', { action: `%${action}%` });

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  // --- Stats ---
  async getReportStats() {
    const pending = await this.reportRepo.count({ where: { status: ReportStatus.PENDING } });
    const reviewing = await this.reportRepo.count({ where: { status: ReportStatus.UNDER_REVIEW } });
    const resolved = await this.reportRepo.count({ where: { status: ReportStatus.RESOLVED } });
    const dismissed = await this.reportRepo.count({ where: { status: ReportStatus.DISMISSED } });
    return { pending, reviewing, resolved, dismissed, total: pending + reviewing + resolved + dismissed };
  }
}
