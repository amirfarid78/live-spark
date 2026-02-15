import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Video, VideoStatus, VideoVisibility } from '../../entities/video.entity';
import {
  VideoLike, VideoComment, VideoSave, VideoShare, VideoView, Hashtag,
  MusicTrack, Playlist, PlaylistVideo,
} from '../../entities/video-interactions.entity';
import { Profile } from '../../entities/profile.entity';
import { Follower } from '../../entities/follower.entity';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video) private videosRepo: Repository<Video>,
    @InjectRepository(VideoLike) private likesRepo: Repository<VideoLike>,
    @InjectRepository(VideoComment) private commentsRepo: Repository<VideoComment>,
    @InjectRepository(VideoSave) private savesRepo: Repository<VideoSave>,
    @InjectRepository(VideoShare) private sharesRepo: Repository<VideoShare>,
    @InjectRepository(VideoView) private viewsRepo: Repository<VideoView>,
    @InjectRepository(Hashtag) private hashtagsRepo: Repository<Hashtag>,
    @InjectRepository(MusicTrack) private musicRepo: Repository<MusicTrack>,
    @InjectRepository(Playlist) private playlistsRepo: Repository<Playlist>,
    @InjectRepository(PlaylistVideo) private playlistVideosRepo: Repository<PlaylistVideo>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(Follower) private followersRepo: Repository<Follower>,
    private gateway: RealtimeGateway,
  ) {}

  async createVideo(userId: string, data: Partial<Video>) {
    const video = this.videosRepo.create({
      ...data,
      user_id: userId,
      status: VideoStatus.PROCESSING,
      allows_comments: true,
    });
    const saved = await this.videosRepo.save(video);

    // Process hashtags
    if (data.hashtags?.length) {
      for (const tag of data.hashtags) {
        const existing = await this.hashtagsRepo.findOne({ where: { name: tag.toLowerCase() } });
        if (existing) {
          existing.usage_count = Number(existing.usage_count) + 1;
          await this.hashtagsRepo.save(existing);
        } else {
          await this.hashtagsRepo.save({ name: tag.toLowerCase(), usage_count: 1 });
        }
      }
    }

    // Update profile video count
    await this.profilesRepo.increment({ user_id: userId }, 'videos_count', 1);

    // Mark as published (in production, this happens after processing)
    saved.status = VideoStatus.PUBLISHED;
    await this.videosRepo.save(saved);

    return saved;
  }

  async getFeed(userId: string | undefined, page = 1, limit = 10) {
    let followedIds: string[] = [];
    
    // Get IDs of users this person follows (only if authenticated)
    if (userId) {
      const followedUsers = await this.followersRepo.find({
        where: { follower_id: userId },
        select: ['following_id'],
      });
      followedIds = followedUsers.map(f => f.following_id);
    }

    const qb = this.videosRepo.createQueryBuilder('v')
      .where('v.status = :status', { status: VideoStatus.PUBLISHED })
      .andWhere('v.visibility = :vis', { vis: VideoVisibility.PUBLIC });

    // Boost followed users' videos by ordering them first via CASE expression
    if (followedIds.length > 0) {
      qb.addSelect(
        `CASE WHEN v.user_id IN (:...followed) THEN 0 ELSE 1 END`,
        'follow_rank',
      ).setParameter('followed', followedIds);
      qb.orderBy('follow_rank', 'ASC')
        .addOrderBy('v.created_at', 'DESC');
    } else {
      qb.orderBy('v.created_at', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    // Attach user profiles
    const userIds = [...new Set(items.map(v => v.user_id))];
    const profiles = userIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(userIds) } })
      : [];
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));

    // Check if current user liked/saved (only if authenticated)
    const videoIds = items.map(v => v.id);
    let likedSet = new Set<string>();
    let savedSet = new Set<string>();
    
    if (userId && videoIds.length > 0) {
      const likes = await this.likesRepo.find({ where: { user_id: userId, video_id: In(videoIds) } });
      const saves = await this.savesRepo.find({ where: { user_id: userId, video_id: In(videoIds) } });
      likedSet = new Set(likes.map(l => l.video_id));
      savedSet = new Set(saves.map(s => s.video_id));
    }

    const enriched = items.map(v => ({
      ...v,
      user: profileMap.get(v.user_id) || null,
      is_liked: likedSet.has(v.id),
      is_saved: savedSet.has(v.id),
    }));

    return new PaginatedResult(enriched, total, page, limit);
  }

  async getVideoById(videoId: string, userId?: string) {
    const video = await this.videosRepo.findOne({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');

    const profile = await this.profilesRepo.findOne({ where: { user_id: video.user_id } });
    let is_liked = false;
    let is_saved = false;

    if (userId) {
      const like = await this.likesRepo.findOne({ where: { user_id: userId, video_id: videoId } });
      const save = await this.savesRepo.findOne({ where: { user_id: userId, video_id: videoId } });
      is_liked = !!like;
      is_saved = !!save;
    }

    return { ...video, user: profile, is_liked, is_saved };
  }

  async getUserVideos(userId: string, page = 1, limit = 20, currentUserId?: string) {
    const [items, total] = await this.videosRepo.findAndCount({
      where: { user_id: userId, status: VideoStatus.PUBLISHED },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Attach user profile
    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });
    
    // Check if current user liked/saved (only if authenticated)
    const videoIds = items.map(v => v.id);
    let likedSet = new Set<string>();
    let savedSet = new Set<string>();
    
    if (currentUserId && videoIds.length > 0) {
      const likes = await this.likesRepo.find({ where: { user_id: currentUserId, video_id: In(videoIds) } });
      const saves = await this.savesRepo.find({ where: { user_id: currentUserId, video_id: In(videoIds) } });
      likedSet = new Set(likes.map(l => l.video_id));
      savedSet = new Set(saves.map(s => s.video_id));
    }

    const enriched = items.map(v => ({
      ...v,
      user: profile || null,
      is_liked: likedSet.has(v.id),
      is_saved: savedSet.has(v.id),
    }));

    return new PaginatedResult(enriched, total, page, limit);
  }

  async deleteVideo(videoId: string, userId: string) {
    const video = await this.videosRepo.findOne({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');
    if (video.user_id !== userId) throw new ForbiddenException('Not your video');

    await this.videosRepo.softDelete(videoId);
    await this.profilesRepo.decrement({ user_id: userId }, 'videos_count', 1);
    return { message: 'Video deleted' };
  }

  async likeVideo(userId: string, videoId: string) {
    const existing = await this.likesRepo.findOne({ where: { user_id: userId, video_id: videoId } });
    if (existing) {
      // Unlike
      await this.likesRepo.delete(existing.id);
      await this.videosRepo.decrement({ id: videoId }, 'likes_count', 1);
      return { liked: false };
    }

    await this.likesRepo.save({ user_id: userId, video_id: videoId });
    await this.videosRepo.increment({ id: videoId }, 'likes_count', 1);

    const video = await this.videosRepo.findOne({ where: { id: videoId } });
    if (video) {
      await this.profilesRepo.increment({ user_id: video.user_id }, 'likes_count', 1);
      // Notify video owner in real-time
      if (video.user_id !== userId) {
        const senderProfile = await this.profilesRepo.findOne({ where: { user_id: userId } });
        this.gateway.emitToUser(video.user_id, 'notification:new', {
          type: 'like',
          actor: senderProfile ? { id: userId, username: senderProfile.username, avatar_url: senderProfile.avatar_url } : { id: userId },
          video_id: videoId,
          message: `${senderProfile?.username || 'Someone'} liked your video`,
        });
      }
    }

    return { liked: true };
  }

  async addComment(userId: string, videoId: string, content: string, parentId?: string) {
    const video = await this.videosRepo.findOne({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');

    const comment = await this.commentsRepo.save({
      user_id: userId,
      video_id: videoId,
      content,
      parent_id: parentId,
    });

    await this.videosRepo.increment({ id: videoId }, 'comments_count', 1);
    if (parentId) {
      await this.commentsRepo.increment({ id: parentId }, 'replies_count', 1);
    }

    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });

    // Notify video owner in real-time
    if (video.user_id !== userId) {
      this.gateway.emitToUser(video.user_id, 'notification:new', {
        type: 'comment',
        actor: profile ? { id: userId, username: profile.username, avatar_url: profile.avatar_url } : { id: userId },
        video_id: videoId,
        comment_preview: content.substring(0, 100),
      });
    }

    return { ...comment, user: profile };
  }

  async getComments(videoId: string, page = 1, limit = 20) {
    const [items, total] = await this.commentsRepo.findAndCount({
      where: { video_id: videoId, parent_id: null as any },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Attach profiles
    const userIds = [...new Set(items.map(c => c.user_id))];
    const profiles = userIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(userIds) } })
      : [];
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));

    const enriched = items.map(c => ({
      ...c,
      user: profileMap.get(c.user_id) || null,
    }));

    return new PaginatedResult(enriched, total, page, limit);
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentsRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.user_id !== userId) throw new ForbiddenException('Not your comment');

    await this.commentsRepo.softDelete(commentId);
    await this.videosRepo.decrement({ id: comment.video_id }, 'comments_count', 1);
    return { message: 'Comment deleted' };
  }

  async saveVideo(userId: string, videoId: string) {
    const existing = await this.savesRepo.findOne({ where: { user_id: userId, video_id: videoId } });
    if (existing) {
      await this.savesRepo.delete(existing.id);
      await this.videosRepo.decrement({ id: videoId }, 'saves_count', 1);
      return { saved: false };
    }

    await this.savesRepo.save({ user_id: userId, video_id: videoId });
    await this.videosRepo.increment({ id: videoId }, 'saves_count', 1);
    return { saved: true };
  }

  async getSavedVideos(userId: string, page = 1, limit = 20) {
    const saves = await this.savesRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.savesRepo.count({ where: { user_id: userId } });
    const videoIds = saves.map(s => s.video_id);

    if (videoIds.length === 0) {
      return new PaginatedResult([], 0, page, limit);
    }

    const videos = await this.videosRepo.find({
      where: { id: In(videoIds), status: VideoStatus.PUBLISHED },
    });

    // Preserve order from saves
    const videoMap = new Map(videos.map(v => [v.id, v]));
    const orderedVideos = videoIds.map(id => videoMap.get(id)).filter(Boolean);

    // Attach user profiles
    const userIds = [...new Set(orderedVideos.map(v => v!.user_id))];
    const profiles = userIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(userIds) } })
      : [];
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));
    const enriched = orderedVideos.map(v => ({ ...v, user: profileMap.get(v!.user_id) || null }));

    return new PaginatedResult(enriched, total, page, limit);
  }

  async getLikedVideos(userId: string, page = 1, limit = 20) {
    const likes = await this.likesRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.likesRepo.count({ where: { user_id: userId } });
    const videoIds = likes.map(l => l.video_id);

    if (videoIds.length === 0) {
      return new PaginatedResult([], 0, page, limit);
    }

    const videos = await this.videosRepo.find({
      where: { id: In(videoIds), status: VideoStatus.PUBLISHED },
    });

    // Preserve order from likes
    const videoMap = new Map(videos.map(v => [v.id, v]));
    const orderedVideos = videoIds.map(id => videoMap.get(id)).filter(Boolean);

    // Attach user profiles
    const userIds = [...new Set(orderedVideos.map(v => v!.user_id))];
    const profiles = userIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(userIds) } })
      : [];
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));
    const enriched = orderedVideos.map(v => ({ ...v, user: profileMap.get(v!.user_id) || null }));

    return new PaginatedResult(enriched, total, page, limit);
  }

  async shareVideo(userId: string, videoId: string, platform?: string) {
    await this.sharesRepo.save({ user_id: userId, video_id: videoId, platform });
    await this.videosRepo.increment({ id: videoId }, 'shares_count', 1);
    return { message: 'Share recorded' };
  }

  async recordView(videoId: string, userId?: string, watchDuration?: number) {
    await this.viewsRepo.save({
      video_id: videoId,
      user_id: userId,
      watch_duration: watchDuration || 0,
    });
    await this.videosRepo.increment({ id: videoId }, 'views_count', 1);
  }

  async discover(page = 1, limit = 20, category?: string) {
    const qb = this.videosRepo.createQueryBuilder('v')
      .where('v.status = :status', { status: VideoStatus.PUBLISHED })
      .andWhere('v.visibility = :vis', { vis: VideoVisibility.PUBLIC });

    if (category) {
      qb.andWhere(':cat = ANY(v.hashtags)', { cat: category });
    }

    const [items, total] = await qb
      .orderBy('v.views_count', 'DESC')
      .addOrderBy('v.likes_count', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Attach user profiles
    const userIds = [...new Set(items.map(v => v.user_id))];
    const profiles = userIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(userIds) } })
      : [];
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));
    const enriched = items.map(v => ({ ...v, user: profileMap.get(v.user_id) || null }));

    return new PaginatedResult(enriched, total, page, limit);
  }

  async getTrending(limit = 20) {
    const items = await this.videosRepo.find({
      where: { status: VideoStatus.PUBLISHED, visibility: VideoVisibility.PUBLIC },
      order: { views_count: 'DESC' },
      take: limit,
    });

    // Attach user profiles
    const userIds = [...new Set(items.map(v => v.user_id))];
    const profiles = userIds.length > 0
      ? await this.profilesRepo.find({ where: { user_id: In(userIds) } })
      : [];
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));
    return items.map(v => ({ ...v, user: profileMap.get(v.user_id) || null }));
  }

  async getTrendingHashtags(limit = 20) {
    return this.hashtagsRepo.find({
      where: { is_banned: false },
      order: { usage_count: 'DESC' },
      take: limit,
    });
  }

  async getMusicLibrary(page = 1, limit = 20) {
    const [items, total] = await this.musicRepo.findAndCount({
      where: { is_active: true },
      order: { usage_count: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return new PaginatedResult(items, total, page, limit);
  }

  // Playlists
  async createPlaylist(userId: string, name: string, description?: string) {
    return this.playlistsRepo.save({ user_id: userId, name, description });
  }

  async getUserPlaylists(userId: string) {
    return this.playlistsRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async addToPlaylist(playlistId: string, videoId: string, userId: string) {
    const playlist = await this.playlistsRepo.findOne({ where: { id: playlistId } });
    if (!playlist || playlist.user_id !== userId) throw new ForbiddenException();

    await this.playlistVideosRepo.save({
      playlist_id: playlistId,
      video_id: videoId,
      position: playlist.videos_count,
    });
    await this.playlistsRepo.increment({ id: playlistId }, 'videos_count', 1);
    return { message: 'Added to playlist' };
  }

  // Admin methods
  async adminUpdateVideoStatus(videoId: string, status: VideoStatus) {
    await this.videosRepo.update(videoId, { status });
    return { message: `Video status updated to ${status}` };
  }

  async adminFlagNsfw(videoId: string, isNsfw: boolean) {
    await this.videosRepo.update(videoId, { is_nsfw: isNsfw });
    return { message: isNsfw ? 'Flagged as NSFW' : 'NSFW flag removed' };
  }

  async adminDeleteVideo(videoId: string) {
    await this.videosRepo.softDelete(videoId);
    return { message: 'Video removed' };
  }

  async pinVideo(videoId: string, userId: string) {
    // Unpin all other videos
    await this.videosRepo.update({ user_id: userId, is_pinned: true }, { is_pinned: false });
    await this.videosRepo.update(videoId, { is_pinned: true });
    return { message: 'Video pinned' };
  }
}
