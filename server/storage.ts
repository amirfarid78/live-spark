import {
  users, videos, videoLikes, videoSaves, videoComments, followers, userRoles,
  hashtags, liveStreams, partyRooms, pkBattles, conversations, conversationMembers,
  messages, agencies, gifts, giftTransactions, campaigns, walletTransactions,
  type User, type InsertUser, type Video, type InsertVideo, type VideoComment, type InsertVideoComment,
  type Hashtag, type InsertHashtag, type LiveStream, type InsertLiveStream,
  type PartyRoom, type InsertPartyRoom, type PKBattle, type InsertPKBattle,
  type Conversation, type Message, type InsertMessage,
  type Agency, type InsertAgency, type Gift, type Campaign, type InsertCampaign,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, ilike, ne, inArray, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  searchUsers(query: string, limit?: number): Promise<User[]>;
  getSuggestedUsers(userId: number, limit?: number): Promise<User[]>;
  getUserVideos(userId: number, limit?: number, offset?: number): Promise<Video[]>;

  getVideos(limit?: number, offset?: number): Promise<(Video & { user: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "isVerified"> })[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  getTrendingVideos(limit?: number): Promise<(Video & { user: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "isVerified"> })[]>;
  likeVideo(userId: number, videoId: number): Promise<boolean>;
  saveVideo(userId: number, videoId: number): Promise<boolean>;
  isVideoLiked(userId: number, videoId: number): Promise<boolean>;
  isVideoSaved(userId: number, videoId: number): Promise<boolean>;
  getVideoComments(videoId: number): Promise<(VideoComment & { user: Pick<User, "id" | "username" | "displayName" | "avatarUrl"> })[]>;
  createComment(comment: InsertVideoComment): Promise<VideoComment>;

  followUser(followerId: number, followingId: number): Promise<boolean>;
  unfollowUser(followerId: number, followingId: number): Promise<boolean>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  getFollowers(userId: number, limit?: number, offset?: number): Promise<User[]>;
  getFollowing(userId: number, limit?: number, offset?: number): Promise<User[]>;

  getHashtags(limit?: number): Promise<Hashtag[]>;
  getTrendingHashtags(limit?: number): Promise<Hashtag[]>;
  getFeaturedHashtags(limit?: number): Promise<Hashtag[]>;
  getHashtagByName(name: string): Promise<Hashtag | undefined>;
  createHashtag(hashtag: InsertHashtag): Promise<Hashtag>;
  searchHashtags(query: string, limit?: number): Promise<Hashtag[]>;

  getActiveLiveStreams(limit?: number, offset?: number, category?: string): Promise<(LiveStream & { host: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "isVerified"> })[]>;
  getFeaturedLiveStreams(limit?: number): Promise<(LiveStream & { host: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "isVerified"> })[]>;
  createLiveStream(stream: InsertLiveStream): Promise<LiveStream>;
  endLiveStream(id: number, hostId: number): Promise<LiveStream | undefined>;

  getActivePartyRooms(limit?: number, offset?: number, category?: string): Promise<(PartyRoom & { host: Pick<User, "id" | "username" | "displayName" | "avatarUrl"> })[]>;
  createPartyRoom(room: InsertPartyRoom): Promise<PartyRoom>;
  getPartyRoom(id: number): Promise<PartyRoom | undefined>;

  getActivePKBattles(limit?: number): Promise<(PKBattle & { host: Pick<User, "id" | "username" | "displayName" | "avatarUrl">; opponent: Pick<User, "id" | "username" | "displayName" | "avatarUrl"> })[]>;
  createPKBattle(battle: InsertPKBattle): Promise<PKBattle>;

  getConversations(userId: number): Promise<any[]>;
  getOrCreateDirectConversation(userId: number, targetId: number): Promise<Conversation>;
  getMessages(conversationId: number, userId: number, limit?: number, offset?: number): Promise<any[]>;
  sendMessage(conversationId: number, senderId: number, content: string): Promise<Message>;

  createAgency(agency: InsertAgency): Promise<Agency>;
  getMyAgency(ownerId: number): Promise<Agency | undefined>;
  getAgencies(limit?: number, offset?: number): Promise<Agency[]>;
  getAgencyStats(): Promise<{ activeAgencies: number; managedCreators: number; totalPayouts: number }>;

  getGiftCatalog(category?: string): Promise<Gift[]>;

  getUserCampaigns(userId: number): Promise<(Campaign & { video: Pick<Video, "id" | "description" | "thumbnailUrl"> })[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;

  getWalletBalance(userId: number): Promise<{ coins: number; diamonds: number }>;
  getTransactionHistory(userId: number, limit?: number, offset?: number): Promise<any[]>;
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

  async searchUsers(query: string, limit = 20): Promise<User[]> {
    return db.select().from(users)
      .where(ilike(users.username, `%${query}%`))
      .limit(limit);
  }

  async getSuggestedUsers(userId: number, limit = 10): Promise<User[]> {
    return db.select().from(users)
      .where(ne(users.id, userId))
      .orderBy(desc(users.followersCount))
      .limit(limit);
  }

  async getUserVideos(userId: number, limit = 20, offset = 0): Promise<Video[]> {
    return db.select().from(videos)
      .where(and(eq(videos.userId, userId), eq(videos.isPublished, true)))
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getVideos(limit = 20, offset = 0): Promise<(Video & { user: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "isVerified"> })[]> {
    const result = await db
      .select({
        id: videos.id, userId: videos.userId, description: videos.description,
        videoUrl: videos.videoUrl, thumbnailUrl: videos.thumbnailUrl, songName: videos.songName,
        hashtags: videos.hashtags, likesCount: videos.likesCount, commentsCount: videos.commentsCount,
        sharesCount: videos.sharesCount, viewsCount: videos.viewsCount, isPublished: videos.isPublished,
        createdAt: videos.createdAt,
        user: { id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl, isVerified: users.isVerified },
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .where(eq(videos.isPublished, true))
      .orderBy(desc(videos.createdAt))
      .limit(limit).offset(offset);
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

  async getTrendingVideos(limit = 20): Promise<(Video & { user: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "isVerified"> })[]> {
    const result = await db
      .select({
        id: videos.id, userId: videos.userId, description: videos.description,
        videoUrl: videos.videoUrl, thumbnailUrl: videos.thumbnailUrl, songName: videos.songName,
        hashtags: videos.hashtags, likesCount: videos.likesCount, commentsCount: videos.commentsCount,
        sharesCount: videos.sharesCount, viewsCount: videos.viewsCount, isPublished: videos.isPublished,
        createdAt: videos.createdAt,
        user: { id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl, isVerified: users.isVerified },
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .where(eq(videos.isPublished, true))
      .orderBy(desc(videos.viewsCount))
      .limit(limit);
    return result as any;
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
        id: videoComments.id, userId: videoComments.userId, videoId: videoComments.videoId,
        content: videoComments.content, likesCount: videoComments.likesCount, createdAt: videoComments.createdAt,
        user: { id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl },
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

  async getFollowers(userId: number, limit = 20, offset = 0): Promise<User[]> {
    const result = await db.select({ user: users })
      .from(followers)
      .innerJoin(users, eq(followers.followerId, users.id))
      .where(eq(followers.followingId, userId))
      .limit(limit).offset(offset);
    return result.map(r => r.user);
  }

  async getFollowing(userId: number, limit = 20, offset = 0): Promise<User[]> {
    const result = await db.select({ user: users })
      .from(followers)
      .innerJoin(users, eq(followers.followingId, users.id))
      .where(eq(followers.followerId, userId))
      .limit(limit).offset(offset);
    return result.map(r => r.user);
  }

  async getHashtags(limit = 50): Promise<Hashtag[]> {
    return db.select().from(hashtags).orderBy(desc(hashtags.usageCount)).limit(limit);
  }

  async getTrendingHashtags(limit = 20): Promise<Hashtag[]> {
    return db.select().from(hashtags)
      .where(eq(hashtags.status, "active"))
      .orderBy(desc(hashtags.usageCount))
      .limit(limit);
  }

  async getFeaturedHashtags(limit = 10): Promise<Hashtag[]> {
    return db.select().from(hashtags)
      .where(eq(hashtags.isFeatured, true))
      .orderBy(desc(hashtags.usageCount))
      .limit(limit);
  }

  async getHashtagByName(name: string): Promise<Hashtag | undefined> {
    const [tag] = await db.select().from(hashtags).where(eq(hashtags.name, name.toLowerCase()));
    return tag || undefined;
  }

  async createHashtag(hashtag: InsertHashtag): Promise<Hashtag> {
    const [created] = await db.insert(hashtags).values({ ...hashtag, name: hashtag.name.toLowerCase() }).returning();
    return created;
  }

  async searchHashtags(query: string, limit = 20): Promise<Hashtag[]> {
    return db.select().from(hashtags)
      .where(ilike(hashtags.name, `%${query}%`))
      .orderBy(desc(hashtags.usageCount))
      .limit(limit);
  }

  async getActiveLiveStreams(limit = 20, offset = 0, category?: string): Promise<(LiveStream & { host: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "isVerified"> })[]> {
    let query = db
      .select({
        id: liveStreams.id, hostId: liveStreams.hostId, title: liveStreams.title,
        description: liveStreams.description, thumbnailUrl: liveStreams.thumbnailUrl,
        category: liveStreams.category, status: liveStreams.status, viewerCount: liveStreams.viewerCount,
        peakViewers: liveStreams.peakViewers, totalGifts: liveStreams.totalGifts,
        isFeatured: liveStreams.isFeatured, isPK: liveStreams.isPK,
        startedAt: liveStreams.startedAt, endedAt: liveStreams.endedAt,
        host: { id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl, isVerified: users.isVerified },
      })
      .from(liveStreams)
      .innerJoin(users, eq(liveStreams.hostId, users.id))
      .where(category
        ? and(eq(liveStreams.status, "live"), eq(liveStreams.category, category))
        : eq(liveStreams.status, "live")
      )
      .orderBy(desc(liveStreams.viewerCount))
      .limit(limit).offset(offset);
    return (await query) as any;
  }

  async getFeaturedLiveStreams(limit = 5): Promise<(LiveStream & { host: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "isVerified"> })[]> {
    const result = await db
      .select({
        id: liveStreams.id, hostId: liveStreams.hostId, title: liveStreams.title,
        description: liveStreams.description, thumbnailUrl: liveStreams.thumbnailUrl,
        category: liveStreams.category, status: liveStreams.status, viewerCount: liveStreams.viewerCount,
        peakViewers: liveStreams.peakViewers, totalGifts: liveStreams.totalGifts,
        isFeatured: liveStreams.isFeatured, isPK: liveStreams.isPK,
        startedAt: liveStreams.startedAt, endedAt: liveStreams.endedAt,
        host: { id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl, isVerified: users.isVerified },
      })
      .from(liveStreams)
      .innerJoin(users, eq(liveStreams.hostId, users.id))
      .where(and(eq(liveStreams.status, "live"), eq(liveStreams.isFeatured, true)))
      .orderBy(desc(liveStreams.viewerCount))
      .limit(limit);
    return result as any;
  }

  async createLiveStream(stream: InsertLiveStream): Promise<LiveStream> {
    const [created] = await db.insert(liveStreams).values(stream).returning();
    return created;
  }

  async endLiveStream(id: number, hostId: number): Promise<LiveStream | undefined> {
    const [updated] = await db.update(liveStreams)
      .set({ status: "ended", endedAt: new Date() })
      .where(and(eq(liveStreams.id, id), eq(liveStreams.hostId, hostId)))
      .returning();
    return updated || undefined;
  }

  async getActivePartyRooms(limit = 20, offset = 0, category?: string): Promise<(PartyRoom & { host: Pick<User, "id" | "username" | "displayName" | "avatarUrl"> })[]> {
    const result = await db
      .select({
        id: partyRooms.id, hostId: partyRooms.hostId, name: partyRooms.name,
        description: partyRooms.description, category: partyRooms.category,
        status: partyRooms.status, viewerCount: partyRooms.viewerCount,
        speakerCount: partyRooms.speakerCount, maxSpeakers: partyRooms.maxSpeakers,
        isPrivate: partyRooms.isPrivate, tags: partyRooms.tags,
        createdAt: partyRooms.createdAt, endedAt: partyRooms.endedAt,
        host: { id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl },
      })
      .from(partyRooms)
      .innerJoin(users, eq(partyRooms.hostId, users.id))
      .where(category
        ? and(eq(partyRooms.status, "active"), eq(partyRooms.category, category))
        : eq(partyRooms.status, "active")
      )
      .orderBy(desc(partyRooms.viewerCount))
      .limit(limit).offset(offset);
    return result as any;
  }

  async createPartyRoom(room: InsertPartyRoom): Promise<PartyRoom> {
    const [created] = await db.insert(partyRooms).values(room).returning();
    return created;
  }

  async getPartyRoom(id: number): Promise<PartyRoom | undefined> {
    const [room] = await db.select().from(partyRooms).where(eq(partyRooms.id, id));
    return room || undefined;
  }

  async getActivePKBattles(limit = 20): Promise<(PKBattle & { host: Pick<User, "id" | "username" | "displayName" | "avatarUrl">; opponent: Pick<User, "id" | "username" | "displayName" | "avatarUrl"> })[]> {
    const hostAlias = users;
    const result = await db
      .select({
        id: pkBattles.id, hostId: pkBattles.hostId, opponentId: pkBattles.opponentId,
        status: pkBattles.status, hostScore: pkBattles.hostScore, opponentScore: pkBattles.opponentScore,
        duration: pkBattles.duration, winnerId: pkBattles.winnerId, streamId: pkBattles.streamId,
        startedAt: pkBattles.startedAt, endedAt: pkBattles.endedAt, createdAt: pkBattles.createdAt,
        host: { id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl },
      })
      .from(pkBattles)
      .innerJoin(users, eq(pkBattles.hostId, users.id))
      .where(eq(pkBattles.status, "live"))
      .orderBy(desc(pkBattles.createdAt))
      .limit(limit);

    const battlesWithOpponents = await Promise.all(
      result.map(async (battle) => {
        const [opponent] = await db.select({
          id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl,
        }).from(users).where(eq(users.id, battle.opponentId));
        return { ...battle, opponent: opponent || { id: 0, username: "Unknown", displayName: "Unknown", avatarUrl: null } };
      })
    );
    return battlesWithOpponents as any;
  }

  async createPKBattle(battle: InsertPKBattle): Promise<PKBattle> {
    const [created] = await db.insert(pkBattles).values(battle).returning();
    return created;
  }

  async getConversations(userId: number): Promise<any[]> {
    const memberRows = await db.select()
      .from(conversationMembers)
      .where(eq(conversationMembers.userId, userId));

    if (memberRows.length === 0) return [];

    const convoIds = memberRows.map(m => m.conversationId);
    const convos = await db.select().from(conversations)
      .where(inArray(conversations.id, convoIds))
      .orderBy(desc(conversations.lastMessageAt));

    const result = await Promise.all(convos.map(async (convo) => {
      const members = await db.select({
        userId: conversationMembers.userId,
        unreadCount: conversationMembers.unreadCount,
        user: { id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl, isVerified: users.isVerified, isOnline: users.isOnline },
      })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .where(eq(conversationMembers.conversationId, convo.id));

      const otherMembers = members.filter(m => m.userId !== userId);
      const myMembership = members.find(m => m.userId === userId);

      return {
        ...convo,
        unreadCount: myMembership?.unreadCount || 0,
        otherUser: otherMembers[0]?.user || null,
        members: members.map(m => m.user),
      };
    }));

    return result;
  }

  async getOrCreateDirectConversation(userId: number, targetId: number): Promise<Conversation> {
    const myConvos = await db.select({ conversationId: conversationMembers.conversationId })
      .from(conversationMembers)
      .where(eq(conversationMembers.userId, userId));

    for (const { conversationId } of myConvos) {
      const [convo] = await db.select().from(conversations).where(and(eq(conversations.id, conversationId), eq(conversations.isGroup, false)));
      if (!convo) continue;
      const targetMember = await db.select().from(conversationMembers)
        .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, targetId)));
      if (targetMember.length > 0) return convo;
    }

    const [newConvo] = await db.insert(conversations).values({ isGroup: false, lastMessageAt: new Date() }).returning();
    await db.insert(conversationMembers).values([
      { conversationId: newConvo.id, userId },
      { conversationId: newConvo.id, userId: targetId },
    ]);
    return newConvo;
  }

  async getMessages(conversationId: number, userId: number, limit = 50, offset = 0): Promise<any[]> {
    const result = await db
      .select({
        id: messages.id, conversationId: messages.conversationId, senderId: messages.senderId,
        content: messages.content, messageType: messages.messageType, createdAt: messages.createdAt,
        sender: { id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl },
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
      .limit(limit).offset(offset);

    return result.map(msg => ({
      ...msg,
      isMe: msg.senderId === userId,
    }));
  }

  async sendMessage(conversationId: number, senderId: number, content: string): Promise<Message> {
    const [msg] = await db.insert(messages).values({ conversationId, senderId, content }).returning();
    await db.update(conversations).set({ lastMessageText: content, lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));
    await db.update(conversationMembers)
      .set({ unreadCount: sql`${conversationMembers.unreadCount} + 1` })
      .where(and(eq(conversationMembers.conversationId, conversationId), ne(conversationMembers.userId, senderId)));
    return msg;
  }

  async createAgency(agency: InsertAgency): Promise<Agency> {
    const [created] = await db.insert(agencies).values(agency).returning();
    return created;
  }

  async getMyAgency(ownerId: number): Promise<Agency | undefined> {
    const [agency] = await db.select().from(agencies).where(eq(agencies.ownerId, ownerId));
    return agency || undefined;
  }

  async getAgencies(limit = 20, offset = 0): Promise<Agency[]> {
    return db.select().from(agencies).orderBy(desc(agencies.createdAt)).limit(limit).offset(offset);
  }

  async getAgencyStats(): Promise<{ activeAgencies: number; managedCreators: number; totalPayouts: number }> {
    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(agencies).where(eq(agencies.status, "approved"));
    const [creatorsResult] = await db.select({ total: sql<number>`coalesce(sum(${agencies.creatorCount}), 0)` }).from(agencies).where(eq(agencies.status, "approved"));
    const [earningsResult] = await db.select({ total: sql<number>`coalesce(sum(${agencies.totalEarnings}), 0)` }).from(agencies).where(eq(agencies.status, "approved"));
    return {
      activeAgencies: Number(countResult?.count || 0),
      managedCreators: Number(creatorsResult?.total || 0),
      totalPayouts: Number(earningsResult?.total || 0),
    };
  }

  async getGiftCatalog(category?: string): Promise<Gift[]> {
    if (category) {
      return db.select().from(gifts)
        .where(and(eq(gifts.isActive, true), eq(gifts.category, category as any)))
        .orderBy(asc(gifts.sortOrder));
    }
    return db.select().from(gifts).where(eq(gifts.isActive, true)).orderBy(asc(gifts.sortOrder));
  }

  async getUserCampaigns(userId: number): Promise<(Campaign & { video: Pick<Video, "id" | "description" | "thumbnailUrl"> })[]> {
    const result = await db
      .select({
        id: campaigns.id, userId: campaigns.userId, videoId: campaigns.videoId,
        packageName: campaigns.packageName, status: campaigns.status, budget: campaigns.budget,
        spent: campaigns.spent, targetViews: campaigns.targetViews, currentViews: campaigns.currentViews,
        endsAt: campaigns.endsAt, createdAt: campaigns.createdAt,
        video: { id: videos.id, description: videos.description, thumbnailUrl: videos.thumbnailUrl },
      })
      .from(campaigns)
      .innerJoin(videos, eq(campaigns.videoId, videos.id))
      .where(eq(campaigns.userId, userId))
      .orderBy(desc(campaigns.createdAt));
    return result as any;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [created] = await db.insert(campaigns).values(campaign).returning();
    return created;
  }

  async getWalletBalance(userId: number): Promise<{ coins: number; diamonds: number }> {
    const user = await this.getUser(userId);
    return { coins: user?.coinsBalance || 0, diamonds: user?.diamondsBalance || 0 };
  }

  async getTransactionHistory(userId: number, limit = 50, offset = 0): Promise<any[]> {
    return db.select().from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit).offset(offset);
  }
}

export const storage = new DatabaseStorage();
