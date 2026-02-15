import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../entities/profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async getProfileByUsername(username: string) {
    const profile = await this.profilesRepo.findOne({ where: { username } });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async updateProfile(userId: string, data: Partial<Profile>) {
    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    Object.assign(profile, data);
    return this.profilesRepo.save(profile);
  }

  async searchProfiles(query: string, page = 1, limit = 20) {
    const [items, total] = await this.profilesRepo
      .createQueryBuilder('p')
      .where('p.username ILIKE :q OR p.display_name ILIKE :q', { q: `%${query}%` })
      .orderBy('p.followers_count', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: items, total, page, limit };
  }

  async getTopCreators(limit = 20) {
    return this.profilesRepo.find({
      where: { is_verified: true },
      order: { followers_count: 'DESC' },
      take: limit,
    });
  }

  async getSuggestedUsers(userId: string, limit = 10) {
    // Get users the current user is NOT following, ordered by popularity
    const profiles = await this.profilesRepo
      .createQueryBuilder('p')
      .where('p.user_id != :userId', { userId })
      .andWhere(`p.user_id NOT IN (
        SELECT following_id FROM followers WHERE follower_id = :userId
      )`)
      .orderBy('p.followers_count', 'DESC')
      .take(limit)
      .getMany();

    return profiles;
  }

  async addXp(userId: string, amount: number) {
    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });
    if (!profile) return;

    profile.xp += amount;

    // Level up logic
    if (profile.xp >= 10000) profile.level = 'diamond' as any;
    else if (profile.xp >= 5000) profile.level = 'platinum' as any;
    else if (profile.xp >= 2000) profile.level = 'gold' as any;
    else if (profile.xp >= 500) profile.level = 'silver' as any;

    await this.profilesRepo.save(profile);
  }
}
