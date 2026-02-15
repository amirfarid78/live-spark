import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Profile } from '../../entities/profile.entity';
import { UserRole, RoleType } from '../../entities/user-role.entity';
import { Follower } from '../../entities/follower.entity';
import { UserBlock } from '../../entities/user-block.entity';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { ListUsersDto, BanUserDto, AssignRoleDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(UserRole) private rolesRepo: Repository<UserRole>,
    @InjectRepository(Follower) private followersRepo: Repository<Follower>,
    @InjectRepository(UserBlock) private blocksRepo: Repository<UserBlock>,
  ) {}

  async listUsers(dto: ListUsersDto) {
    const qb = this.usersRepo.createQueryBuilder('u')
      .leftJoinAndSelect('u.profile', 'p')
      .leftJoinAndSelect('u.roles', 'r');

    if (dto.search) {
      qb.andWhere('(p.username ILIKE :s OR p.display_name ILIKE :s OR u.email ILIKE :s)', { s: `%${dto.search}%` });
    }
    if (dto.is_banned !== undefined) {
      qb.andWhere('u.is_banned = :banned', { banned: dto.is_banned });
    }
    if (dto.role) {
      qb.andWhere('r.role = :role', { role: dto.role });
    }
    if (dto.is_verified !== undefined) {
      qb.andWhere('p.is_verified = :verified', { verified: dto.is_verified });
    }

    qb.orderBy('u.created_at', 'DESC');
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return new PaginatedResult(items, total, page, limit);
  }

  async getUserById(userId: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['profile', 'roles'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new BadRequestException('Cannot follow yourself');

    const existing = await this.followersRepo.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });
    if (existing) throw new ConflictException('Already following');

    // Check if blocked
    const blocked = await this.blocksRepo.findOne({
      where: [
        { blocker_id: followingId, blocked_id: followerId },
      ],
    });
    if (blocked) throw new BadRequestException('Cannot follow this user');

    await this.followersRepo.save({ follower_id: followerId, following_id: followingId });

    // Update counts
    await this.profilesRepo.increment({ user_id: followerId }, 'following_count', 1);
    await this.profilesRepo.increment({ user_id: followingId }, 'followers_count', 1);

    return { message: 'Followed successfully' };
  }

  async unfollow(followerId: string, followingId: string) {
    const result = await this.followersRepo.delete({
      follower_id: followerId,
      following_id: followingId,
    });

    if (result.affected === 0) throw new NotFoundException('Not following this user');

    await this.profilesRepo.decrement({ user_id: followerId }, 'following_count', 1);
    await this.profilesRepo.decrement({ user_id: followingId }, 'followers_count', 1);

    return { message: 'Unfollowed successfully' };
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.followersRepo.findAndCount({
      where: { following_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const followerIds = items.map(f => f.follower_id);
    const profiles = followerIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(followerIds) } })
      : [];

    return new PaginatedResult(profiles, total, page, limit);
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.followersRepo.findAndCount({
      where: { follower_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const followingIds = items.map(f => f.following_id);
    const profiles = followingIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(followingIds) } })
      : [];

    return new PaginatedResult(profiles, total, page, limit);
  }

  async isFollowing(followerId: string, followingId: string) {
    const exists = await this.followersRepo.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });
    return { is_following: !!exists };
  }

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) throw new BadRequestException('Cannot block yourself');

    const existing = await this.blocksRepo.findOne({
      where: { blocker_id: blockerId, blocked_id: blockedId },
    });
    if (existing) throw new ConflictException('Already blocked');

    await this.blocksRepo.save({ blocker_id: blockerId, blocked_id: blockedId });

    // Auto-unfollow both directions
    await this.followersRepo.delete({ follower_id: blockerId, following_id: blockedId });
    await this.followersRepo.delete({ follower_id: blockedId, following_id: blockerId });

    return { message: 'User blocked' };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const result = await this.blocksRepo.delete({
      blocker_id: blockerId,
      blocked_id: blockedId,
    });
    if (result.affected === 0) throw new NotFoundException('User not blocked');
    return { message: 'User unblocked' };
  }

  async getBlockedUsers(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.blocksRepo.findAndCount({
      where: { blocker_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const blockedIds = items.map(b => b.blocked_id);
    const profiles = blockedIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(blockedIds) } })
      : [];

    return new PaginatedResult(profiles, total, page, limit);
  }

  async registerFCMToken(userId: string, fcmToken: string) {
    await this.usersRepo.update(userId, { fcm_token: fcmToken });
    return { message: 'FCM token registered' };
  }

  // Admin methods
  async banUser(userId: string, dto: BanUserDto) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.is_banned = true;
    user.banned_reason = dto.reason || '';
    if (dto.duration_days) {
      const banUntil = new Date();
      banUntil.setDate(banUntil.getDate() + dto.duration_days);
      user.banned_until = banUntil;
    }
    await this.usersRepo.save(user);
    return { message: 'User banned' };
  }

  async unbanUser(userId: string) {
    await this.usersRepo.update(userId, {
      is_banned: false,
      banned_reason: null as any,
      banned_until: null as any,
    });
    return { message: 'User unbanned' };
  }

  async shadowBan(userId: string, shadow: boolean) {
    await this.usersRepo.update(userId, { is_shadow_banned: shadow });
    return { message: shadow ? 'Shadow banned' : 'Shadow ban removed' };
  }

  async assignRole(userId: string, dto: AssignRoleDto) {
    const existing = await this.rolesRepo.findOne({
      where: { user_id: userId, role: dto.role },
    });
    if (existing) throw new ConflictException('Role already assigned');

    await this.rolesRepo.save({ user_id: userId, role: dto.role });
    return { message: `Role ${dto.role} assigned` };
  }

  async removeRole(userId: string, role: RoleType) {
    const result = await this.rolesRepo.delete({ user_id: userId, role });
    if (result.affected === 0) throw new NotFoundException('Role not found');
    return { message: `Role ${role} removed` };
  }

  async verifyCreator(userId: string, verified: boolean) {
    await this.profilesRepo.update({ user_id: userId }, { is_verified: verified });
    return { message: verified ? 'Creator verified' : 'Verification removed' };
  }
}
