import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, MoreThan } from 'typeorm';
import { MusicTrack, SoundCategory, UserFavoriteSound, Video } from '../../entities';

@Injectable()
export class SoundsService {
  constructor(
    @InjectRepository(MusicTrack)
    private soundsRepo: Repository<MusicTrack>,
    @InjectRepository(UserFavoriteSound)
    private favoritesRepo: Repository<UserFavoriteSound>,
    @InjectRepository(Video)
    private videosRepo: Repository<Video>,
  ) {}

  // Get sound by ID with stats
  async getSound(id: string) {
    const sound = await this.soundsRepo.findOne({ where: { id } });
    if (!sound) throw new NotFoundException('Sound not found');
    return sound;
  }

  // Get sound details with videos using it
  async getSoundDetails(id: string, page = 1, limit = 20) {
    const sound = await this.getSound(id);

    // Get videos using this sound
    const [videos, total] = await this.videosRepo.findAndCount({
      where: { music_id: id },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      sound,
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Search sounds
  async searchSounds(query: string, category?: SoundCategory, page = 1, limit = 20) {
    const where: any = { is_active: true };
    
    if (query) {
      where.title = Like(`%${query}%`);
    }
    if (category) {
      where.category = category;
    }

    const [sounds, total] = await this.soundsRepo.findAndCount({
      where,
      order: { usage_count: 'DESC', created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      sounds,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Get trending sounds
  async getTrendingSounds(limit = 20) {
    return this.soundsRepo.find({
      where: { is_active: true },
      order: { trending_score: 'DESC', weekly_usage: 'DESC' },
      take: limit,
    });
  }

  // Get featured sounds
  async getFeaturedSounds(limit = 10) {
    return this.soundsRepo.find({
      where: { is_active: true, is_featured: true },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  // Get sounds by category
  async getSoundsByCategory(category: SoundCategory, page = 1, limit = 20) {
    const [sounds, total] = await this.soundsRepo.findAndCount({
      where: { category, is_active: true },
      order: { usage_count: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      sounds,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Create original sound from video
  async createOriginalSound(videoId: string, userId: string, data: {
    title: string;
    audio_url: string;
    cover_url?: string;
    duration: number;
  }) {
    const sound = this.soundsRepo.create({
      title: data.title,
      artist: 'Original Sound',
      audio_url: data.audio_url,
      cover_url: data.cover_url,
      duration: data.duration,
      category: SoundCategory.ORIGINAL,
      original_user_id: userId,
      original_video_id: videoId,
      is_original: true,
      usage_count: 1,
    });

    return this.soundsRepo.save(sound);
  }

  // Add music track (admin)
  async addMusicTrack(data: Partial<MusicTrack>) {
    const sound = this.soundsRepo.create({
      ...data,
      category: data.category || SoundCategory.MUSIC,
    });
    return this.soundsRepo.save(sound);
  }

  // Update sound usage count
  async incrementUsage(soundId: string) {
    await this.soundsRepo.increment({ id: soundId }, 'usage_count', 1);
    await this.soundsRepo.increment({ id: soundId }, 'daily_usage', 1);
    await this.soundsRepo.increment({ id: soundId }, 'weekly_usage', 1);
  }

  // Add to favorites
  async addToFavorites(userId: string, soundId: string) {
    const sound = await this.getSound(soundId);
    
    const existing = await this.favoritesRepo.findOne({
      where: { user_id: userId, sound_id: soundId },
    });
    if (existing) throw new BadRequestException('Already in favorites');

    await this.favoritesRepo.save({
      user_id: userId,
      sound_id: soundId,
    });

    await this.soundsRepo.increment({ id: soundId }, 'favorites_count', 1);
    return { message: 'Added to favorites' };
  }

  // Remove from favorites
  async removeFromFavorites(userId: string, soundId: string) {
    const result = await this.favoritesRepo.delete({
      user_id: userId,
      sound_id: soundId,
    });
    
    if (result.affected) {
      await this.soundsRepo.decrement({ id: soundId }, 'favorites_count', 1);
    }
    return { message: 'Removed from favorites' };
  }

  // Get user favorite sounds
  async getUserFavorites(userId: string, page = 1, limit = 20) {
    const favorites = await this.favoritesRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (favorites.length === 0) {
      return { sounds: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }

    const soundIds = favorites.map(f => f.sound_id);
    const sounds = await this.soundsRepo.find({
      where: { id: In(soundIds) },
    });

    const total = await this.favoritesRepo.count({ where: { user_id: userId } });

    return {
      sounds,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Check if sound is favorited
  async isFavorited(userId: string, soundId: string): Promise<boolean> {
    const exists = await this.favoritesRepo.findOne({
      where: { user_id: userId, sound_id: soundId },
    });
    return !!exists;
  }

  // Update trending scores (cron job)
  async updateTrendingScores() {
    const sounds = await this.soundsRepo.find({ where: { is_active: true } });
    
    for (const sound of sounds) {
      // Simple trending formula: daily * 3 + weekly * 0.5 + favorites * 0.2
      const score = (sound.daily_usage * 3) + (sound.weekly_usage * 0.5) + (sound.favorites_count * 0.2);
      await this.soundsRepo.update(sound.id, { trending_score: score });
    }
  }

  // Reset daily usage (cron job)
  async resetDailyUsage() {
    await this.soundsRepo.update({}, { daily_usage: 0 });
  }

  // Reset weekly usage (cron job)
  async resetWeeklyUsage() {
    await this.soundsRepo.update({}, { weekly_usage: 0 });
  }

  // Get discover page data
  async getDiscoverSounds() {
    const [trending, featured, original, music] = await Promise.all([
      this.getTrendingSounds(10),
      this.getFeaturedSounds(10),
      this.soundsRepo.find({
        where: { category: SoundCategory.ORIGINAL, is_active: true },
        order: { usage_count: 'DESC' },
        take: 10,
      }),
      this.soundsRepo.find({
        where: { category: SoundCategory.MUSIC, is_active: true },
        order: { usage_count: 'DESC' },
        take: 10,
      }),
    ]);

    return { trending, featured, original, music };
  }
}
