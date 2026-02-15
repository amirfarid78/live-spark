import { users, videos, videoLikes, videoSaves, videoComments, followers, userRoles, type User, type InsertUser, type Video, type InsertVideo, type VideoComment, type InsertVideoComment } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getVideos(limit?: number, offset?: number): Promise<(Video & { user: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "isVerified"> })[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  likeVideo(userId: number, videoId: number): Promise<boolean>;
  saveVideo(userId: number, videoId: number): Promise<boolean>;
  isVideoLiked(userId: number, videoId: number): Promise<boolean>;
  isVideoSaved(userId: number, videoId: number): Promise<boolean>;
  getVideoComments(videoId: number): Promise<(VideoComment & { user: Pick<User, "id" | "username" | "displayName" | "avatarUrl"> })[]>;
  createComment(comment: InsertVideoComment): Promise<VideoComment>;
  followUser(followerId: number, followingId: number): Promise<boolean>;
  unfollowUser(followerId: number, followingId: number): Promise<boolean>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    await db.insert(userRoles).values({ userId: user.id, role: "user" });
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getVideos(limit = 20, offset = 0): Promise<(Video & { user: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "isVerified"> })[]> {
    const result = await db
      .select({
        id: videos.id,
        userId: videos.userId,
        description: videos.description,
        videoUrl: videos.videoUrl,
        thumbnailUrl: videos.thumbnailUrl,
        songName: videos.songName,
        hashtags: videos.hashtags,
        likesCount: videos.likesCount,
        commentsCount: videos.commentsCount,
        sharesCount: videos.sharesCount,
        viewsCount: videos.viewsCount,
        isPublished: videos.isPublished,
        createdAt: videos.createdAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          isVerified: users.isVerified,
        },
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .where(eq(videos.isPublished, true))
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);
    return result as any;
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video || undefined;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [created] = await db.insert(videos).values(video).returning();
    return created;
  }

  async likeVideo(userId: number, videoId: number): Promise<boolean> {
    const existing = await db.select().from(videoLikes).where(and(eq(videoLikes.userId, userId), eq(videoLikes.videoId, videoId)));
    if (existing.length > 0) {
      await db.delete(videoLikes).where(and(eq(videoLikes.userId, userId), eq(videoLikes.videoId, videoId)));
      await db.update(videos).set({ likesCount: sql`${videos.likesCount} - 1` }).where(eq(videos.id, videoId));
      return false;
    }
    await db.insert(videoLikes).values({ userId, videoId });
    await db.update(videos).set({ likesCount: sql`${videos.likesCount} + 1` }).where(eq(videos.id, videoId));
    return true;
  }

  async saveVideo(userId: number, videoId: number): Promise<boolean> {
    const existing = await db.select().from(videoSaves).where(and(eq(videoSaves.userId, userId), eq(videoSaves.videoId, videoId)));
    if (existing.length > 0) {
      await db.delete(videoSaves).where(and(eq(videoSaves.userId, userId), eq(videoSaves.videoId, videoId)));
      return false;
    }
    await db.insert(videoSaves).values({ userId, videoId });
    return true;
  }

  async isVideoLiked(userId: number, videoId: number): Promise<boolean> {
    const result = await db.select().from(videoLikes).where(and(eq(videoLikes.userId, userId), eq(videoLikes.videoId, videoId)));
    return result.length > 0;
  }

  async isVideoSaved(userId: number, videoId: number): Promise<boolean> {
    const result = await db.select().from(videoSaves).where(and(eq(videoSaves.userId, userId), eq(videoSaves.videoId, videoId)));
    return result.length > 0;
  }

  async getVideoComments(videoId: number): Promise<(VideoComment & { user: Pick<User, "id" | "username" | "displayName" | "avatarUrl"> })[]> {
    const result = await db
      .select({
        id: videoComments.id,
        userId: videoComments.userId,
        videoId: videoComments.videoId,
        content: videoComments.content,
        likesCount: videoComments.likesCount,
        createdAt: videoComments.createdAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(videoComments)
      .innerJoin(users, eq(videoComments.userId, users.id))
      .where(eq(videoComments.videoId, videoId))
      .orderBy(desc(videoComments.createdAt));
    return result as any;
  }

  async createComment(comment: InsertVideoComment): Promise<VideoComment> {
    const [created] = await db.insert(videoComments).values(comment).returning();
    await db.update(videos).set({ commentsCount: sql`${videos.commentsCount} + 1` }).where(eq(videos.id, comment.videoId));
    return created;
  }

  async followUser(followerId: number, followingId: number): Promise<boolean> {
    const existing = await db.select().from(followers).where(and(eq(followers.followerId, followerId), eq(followers.followingId, followingId)));
    if (existing.length > 0) return false;
    await db.insert(followers).values({ followerId, followingId });
    await db.update(users).set({ followersCount: sql`${users.followersCount} + 1` }).where(eq(users.id, followingId));
    await db.update(users).set({ followingCount: sql`${users.followingCount} + 1` }).where(eq(users.id, followerId));
    return true;
  }

  async unfollowUser(followerId: number, followingId: number): Promise<boolean> {
    const existing = await db.select().from(followers).where(and(eq(followers.followerId, followerId), eq(followers.followingId, followingId)));
    if (existing.length === 0) return false;
    await db.delete(followers).where(and(eq(followers.followerId, followerId), eq(followers.followingId, followingId)));
    await db.update(users).set({ followersCount: sql`${users.followersCount} - 1` }).where(eq(users.id, followingId));
    await db.update(users).set({ followingCount: sql`${users.followingCount} - 1` }).where(eq(users.id, followerId));
    return true;
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const result = await db.select().from(followers).where(and(eq(followers.followerId, followerId), eq(followers.followingId, followingId)));
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
