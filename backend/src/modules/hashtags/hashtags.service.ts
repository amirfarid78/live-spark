import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Hashtag, HashtagStatus, VideoHashtag, Video } from '../../entities';

@Injectable()
export class HashtagsService {
  constructor(
    @InjectRepository(Hashtag)
    private hashtagRepo: Repository<Hashtag>,
    @InjectRepository(VideoHashtag)
    private videoHashtagRepo: Repository<VideoHashtag>,
    @InjectRepository(Video)
    private videoRepo: Repository<Video>,
  ) {}

  async getHashtag(id: string): Promise<Hashtag> {
    const hashtag = await this.hashtagRepo.findOne({ where: { id } });
    if (!hashtag) throw new NotFoundException('Hashtag not found');
    return hashtag;
  }

  async getHashtagByName(name: string): Promise<Hashtag> {
    const normalizedName = name.toLowerCase().replace(/^#/, '');
    const hashtag = await this.hashtagRepo.findOne({
      where: { name: normalizedName },
    });
    if (!hashtag) throw new NotFoundException('Hashtag not found');
    return hashtag;
  }

  async getHashtagDetails(
    id: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    hashtag: Hashtag;
    videos: Video[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const hashtag = await this.getHashtag(id);

    // Get video IDs for this hashtag
    const videoHashtags = await this.videoHashtagRepo.find({
      where: { hashtag_id: id },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const videoIds = videoHashtags.map(vh => vh.video_id);

    const videos = videoIds.length
      ? await this.videoRepo.find({
          where: { id: In(videoIds) },
          relations: ['user'],
        })
      : [];

    const total = await this.videoHashtagRepo.count({
      where: { hashtag_id: id },
    });

    // Increment views
    await this.hashtagRepo.increment({ id }, 'views_count', 1);

    return {
      hashtag,
      videos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getHashtagDetailsByName(
    name: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const hashtag = await this.getHashtagByName(name);
    return this.getHashtagDetails(hashtag.id, page, limit);
  }

  async searchHashtags(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    hashtags: Hashtag[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [hashtags, total] = await this.hashtagRepo.findAndCount({
      where: [
        { name: Like(`%${query}%`), status: HashtagStatus.ACTIVE },
        { display_name: Like(`%${query}%`), status: HashtagStatus.ACTIVE },
      ],
      order: { usage_count: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      hashtags,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTrendingHashtags(limit: number = 20): Promise<Hashtag[]> {
    return this.hashtagRepo.find({
      where: { status: HashtagStatus.ACTIVE },
      order: { trending_score: 'DESC', daily_usage: 'DESC' },
      take: limit,
    });
  }

  async getFeaturedHashtags(limit: number = 10): Promise<Hashtag[]> {
    return this.hashtagRepo.find({
      where: { is_featured: true, status: HashtagStatus.ACTIVE },
      order: { trending_score: 'DESC' },
      take: limit,
    });
  }

  async getChallengeHashtags(limit: number = 10): Promise<Hashtag[]> {
    return this.hashtagRepo.find({
      where: { is_challenge: true, status: HashtagStatus.ACTIVE },
      order: { trending_score: 'DESC' },
      take: limit,
    });
  }

  async getActiveChallenge(): Promise<Hashtag[]> {
    const now = new Date();
    const challenges = await this.hashtagRepo
      .createQueryBuilder('h')
      .where('h.is_challenge = true')
      .andWhere('h.status = :status', { status: HashtagStatus.ACTIVE })
      .andWhere('(h.challenge_start_date IS NULL OR h.challenge_start_date <= :now)', { now })
      .andWhere('(h.challenge_end_date IS NULL OR h.challenge_end_date >= :now)', { now })
      .orderBy('h.trending_score', 'DESC')
      .getMany();

    return challenges;
  }

  async findOrCreate(name: string): Promise<Hashtag> {
    const normalizedName = name.toLowerCase().replace(/^#/, '').trim();

    let hashtag = await this.hashtagRepo.findOne({
      where: { name: normalizedName },
    });

    if (!hashtag) {
      hashtag = this.hashtagRepo.create({
        name: normalizedName,
        display_name: `#${normalizedName}`,
        usage_count: 0,
        status: HashtagStatus.ACTIVE,
      });
      await this.hashtagRepo.save(hashtag);
    }

    return hashtag;
  }

  async addHashtagsToVideo(videoId: string, hashtags: string[]): Promise<void> {
    for (const tagName of hashtags) {
      const hashtag = await this.findOrCreate(tagName);

      // Check if already linked
      const existing = await this.videoHashtagRepo.findOne({
        where: { video_id: videoId, hashtag_id: hashtag.id },
      });

      if (!existing) {
        const videoHashtag = this.videoHashtagRepo.create({
          video_id: videoId,
          hashtag_id: hashtag.id,
        });
        await this.videoHashtagRepo.save(videoHashtag);

        // Increment usage
        await this.hashtagRepo.increment({ id: hashtag.id }, 'usage_count', 1);
        await this.hashtagRepo.increment({ id: hashtag.id }, 'daily_usage', 1);
        await this.hashtagRepo.increment({ id: hashtag.id }, 'weekly_usage', 1);
      }
    }
  }

  async removeHashtagsFromVideo(videoId: string): Promise<void> {
    const videoHashtags = await this.videoHashtagRepo.find({
      where: { video_id: videoId },
    });

    for (const vh of videoHashtags) {
      await this.hashtagRepo.decrement({ id: vh.hashtag_id }, 'usage_count', 1);
      await this.videoHashtagRepo.remove(vh);
    }
  }

  async getVideoHashtags(videoId: string): Promise<Hashtag[]> {
    const videoHashtags = await this.videoHashtagRepo.find({
      where: { video_id: videoId },
    });

    if (!videoHashtags.length) return [];

    const hashtagIds = videoHashtags.map(vh => vh.hashtag_id);
    return this.hashtagRepo.findByIds(hashtagIds);
  }

  // Admin methods
  async createHashtag(data: {
    name: string;
    display_name?: string;
    description?: string;
    cover_url?: string;
    is_featured?: boolean;
    is_challenge?: boolean;
    challenge_start_date?: Date;
    challenge_end_date?: Date;
    associated_sound_id?: string;
  }): Promise<Hashtag> {
    const normalizedName = data.name.toLowerCase().replace(/^#/, '').trim();

    const existing = await this.hashtagRepo.findOne({
      where: { name: normalizedName },
    });
    if (existing) return existing;

    const hashtag = this.hashtagRepo.create({
      ...data,
      name: normalizedName,
      display_name: data.display_name || `#${normalizedName}`,
      status: HashtagStatus.ACTIVE,
    });

    return this.hashtagRepo.save(hashtag);
  }

  async updateHashtag(id: string, data: Partial<Hashtag>): Promise<Hashtag> {
    const hashtag = await this.getHashtag(id);
    Object.assign(hashtag, data);
    return this.hashtagRepo.save(hashtag);
  }

  async setHashtagStatus(id: string, status: HashtagStatus): Promise<Hashtag> {
    const hashtag = await this.getHashtag(id);
    hashtag.status = status;
    return this.hashtagRepo.save(hashtag);
  }

  // Cron methods
  async updateTrendingScores(): Promise<void> {
    // Trending score = daily_usage * 3 + weekly_usage * 1 + sqrt(usage_count) * 0.5
    await this.hashtagRepo
      .createQueryBuilder()
      .update(Hashtag)
      .set({
        trending_score: () =>
          '(daily_usage * 3 + weekly_usage * 1 + SQRT(usage_count) * 0.5)',
      })
      .execute();
  }

  async resetDailyUsage(): Promise<void> {
    await this.hashtagRepo.update({}, { daily_usage: 0 });
  }

  async resetWeeklyUsage(): Promise<void> {
    await this.hashtagRepo.update({}, { weekly_usage: 0 });
  }

  async getDiscoverHashtags(): Promise<{
    trending: Hashtag[];
    featured: Hashtag[];
    challenges: Hashtag[];
  }> {
    const [trending, featured, challenges] = await Promise.all([
      this.getTrendingHashtags(10),
      this.getFeaturedHashtags(5),
      this.getActiveChallenge(),
    ]);

    return { trending, featured, challenges };
  }

  // Parse hashtags from text
  parseHashtags(text: string): string[] {
    const regex = /#(\w+)/g;
    const matches = text.match(regex) || [];
    return matches.map(m => m.slice(1).toLowerCase());
  }
}
