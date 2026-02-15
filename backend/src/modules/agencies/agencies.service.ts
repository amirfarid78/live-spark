import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Agency, AgencyStatus } from '../../entities/agency.entity';
import { AgencyStreamer } from '../../entities/agency.entity';
import { AgencyEarning } from '../../entities/agency.entity';
import { Profile } from '../../entities/profile.entity';

@Injectable()
export class AgenciesService {
  constructor(
    @InjectRepository(Agency) private agencyRepo: Repository<Agency>,
    @InjectRepository(AgencyStreamer) private streamerRepo: Repository<AgencyStreamer>,
    @InjectRepository(AgencyEarning) private earningRepo: Repository<AgencyEarning>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
  ) {}

  // --- Agency CRUD ---
  async createAgency(ownerId: string, data: {
    name: string;
    description?: string;
    logo_url?: string;
    commission_rate?: number;
  }) {
    const existing = await this.agencyRepo.findOne({ where: { owner_id: ownerId, status: AgencyStatus.APPROVED } });
    if (existing) throw new BadRequestException('You already own an active agency');

    const agency = this.agencyRepo.create({
      owner_id: ownerId,
      name: data.name,
      description: data.description,
      logo_url: data.logo_url,
      commission_rate: data.commission_rate || 20,
    });
    return this.agencyRepo.save(agency);
  }

  async getAgency(agencyId: string) {
    const agency = await this.agencyRepo.findOne({ where: { id: agencyId } });
    if (!agency) throw new NotFoundException('Agency not found');
    return agency;
  }

  async getMyAgency(ownerId: string) {
    const agency = await this.agencyRepo.findOne({ where: { owner_id: ownerId } });
    if (!agency) throw new NotFoundException('You have no agency');
    return agency;
  }

  async updateAgency(agencyId: string, ownerId: string, data: Partial<{
    name: string; description: string; logo_url: string; commission_rate: number;
  }>) {
    const agency = await this.getAgency(agencyId);
    if (agency.owner_id !== ownerId) throw new ForbiddenException();
    Object.assign(agency, data);
    return this.agencyRepo.save(agency);
  }

  async listAgencies(page = 1, limit = 20, status?: AgencyStatus) {
    const qb = this.agencyRepo.createQueryBuilder('a')
      .orderBy('a.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (status) qb.andWhere('a.status = :status', { status });
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  // --- Streamer management ---
  async inviteStreamer(agencyId: string, ownerId: string, streamerId: string, commissionRate?: number) {
    const agency = await this.getAgency(agencyId);
    if (agency.owner_id !== ownerId) throw new ForbiddenException();

    const existing = await this.streamerRepo.findOne({
      where: { streamer_id: streamerId, status: 'active' },
    });
    if (existing) throw new BadRequestException('Streamer already in an agency');

    const invite = this.streamerRepo.create({
      agency_id: agencyId,
      streamer_id: streamerId,
      streamer_share: commissionRate || agency.commission_rate,
      status: 'pending',
    });
    return this.streamerRepo.save(invite);
  }

  async respondToInvite(streamerId: string, inviteId: string, accept: boolean) {
    const invite = await this.streamerRepo.findOne({ where: { id: inviteId, streamer_id: streamerId } });
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.status !== 'pending') throw new BadRequestException('Already responded');

    invite.status = accept ? 'active' : 'rejected';
    if (accept) invite.joined_at = new Date();
    return this.streamerRepo.save(invite);
  }

  async removeStreamer(agencyId: string, ownerId: string, streamerId: string) {
    const agency = await this.getAgency(agencyId);
    if (agency.owner_id !== ownerId) throw new ForbiddenException();

    const member = await this.streamerRepo.findOne({
      where: { agency_id: agencyId, streamer_id: streamerId, status: 'active' },
    });
    if (!member) throw new NotFoundException('Streamer not in agency');

    member.status = 'left';
    return this.streamerRepo.save(member);
  }

  async getAgencyStreamers(agencyId: string, page = 1, limit = 20) {
    const [items, total] = await this.streamerRepo.findAndCount({
      where: { agency_id: agencyId, status: 'active' },
      order: { joined_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const enriched = await Promise.all(items.map(async (s) => {
      const profile = await this.profileRepo.findOne({ where: { id: s.streamer_id } });
      return { ...s, profile };
    }));

    return { items: enriched, total, page, limit };
  }

  async getMyAgencyMembership(streamerId: string) {
    return this.streamerRepo.findOne({
      where: { streamer_id: streamerId, status: 'active' },
    });
  }

  async getMyPendingInvites(streamerId: string) {
    return this.streamerRepo.find({
      where: { streamer_id: streamerId, status: 'pending' },
      order: { created_at: 'DESC' },
    });
  }

  // --- Earnings ---
  async recordEarning(agencyId: string, streamerId: string, amount: number, type: string, metadata?: any) {
    const member = await this.streamerRepo.findOne({
      where: { agency_id: agencyId, streamer_id: streamerId, status: 'active' },
    });
    if (!member) return;

    const streamerPayout = Math.round(amount * (member.streamer_share / 100));
    const agencyCommission = amount - streamerPayout;

    const earning = this.earningRepo.create({
      agency_id: agencyId,
      streamer_id: streamerId,
      gross_amount: amount,
      agency_commission: agencyCommission,
      streamer_payout: streamerPayout,
      platform_commission: 0,
      source_type: type,
    });

    // Update totals
    await this.agencyRepo.increment({ id: agencyId }, 'total_earnings', agencyCommission);

    return this.earningRepo.save(earning);
  }

  async getAgencyEarnings(agencyId: string, page = 1, limit = 20, startDate?: string, endDate?: string) {
    const qb = this.earningRepo.createQueryBuilder('e')
      .where('e.agency_id = :agencyId', { agencyId })
      .orderBy('e.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (startDate) qb.andWhere('e.created_at >= :start', { start: new Date(startDate) });
    if (endDate) qb.andWhere('e.created_at <= :end', { end: new Date(endDate) });

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async getAgencyDashboard(agencyId: string) {
    const agency = await this.getAgency(agencyId);
    const streamerCount = await this.streamerRepo.count({
      where: { agency_id: agencyId, status: 'active' },
    });
    const pendingCount = await this.streamerRepo.count({
      where: { agency_id: agencyId, status: 'pending' },
    });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEarnings = await this.earningRepo
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.agency_commission), 0)', 'total')
      .where('e.agency_id = :agencyId', { agencyId })
      .andWhere('e.created_at >= :start', { start: monthStart })
      .getRawOne();

    return {
      agency,
      stats: {
        active_streamers: streamerCount,
        pending_invites: pendingCount,
        total_earnings: agency.total_earnings,
        month_earnings: Number(monthEarnings.total),
      },
    };
  }

  // --- Admin ---
  async adminApproveAgency(agencyId: string) {
    await this.agencyRepo.update(agencyId, { status: AgencyStatus.APPROVED });
  }

  async adminSuspendAgency(agencyId: string) {
    await this.agencyRepo.update(agencyId, { status: AgencyStatus.SUSPENDED });
  }
}
