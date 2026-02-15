import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userLevelEnum = pgEnum("user_level", ["bronze", "silver", "gold", "platinum", "diamond"]);
export const appRoleEnum = pgEnum("app_role", ["admin", "moderator", "user", "creator", "vip"]);
export const streamStatusEnum = pgEnum("stream_status", ["live", "ended", "scheduled"]);
export const partyRoomStatusEnum = pgEnum("party_room_status", ["active", "ended"]);
export const battleStatusEnum = pgEnum("battle_status", ["pending", "accepted", "live", "ended", "declined"]);
export const agencyStatusEnum = pgEnum("agency_status", ["pending", "approved", "suspended", "rejected"]);
export const hashtagStatusEnum = pgEnum("hashtag_status", ["active", "banned", "featured"]);
export const giftCategoryEnum = pgEnum("gift_category", ["standard", "premium", "luxury", "animated", "special"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["active", "paused", "completed", "cancelled"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["purchase", "gift_sent", "gift_received", "withdrawal", "refund", "promotion", "reward"]);
export const currencyTypeEnum = pgEnum("currency_type", ["coins", "diamonds"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phoneNumber: text("phone_number"),
  username: text("username").unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  level: userLevelEnum("level").default("bronze"),
  coinsBalance: integer("coins_balance").default(0),
  diamondsBalance: integer("diamonds_balance").default(0),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  likesCount: integer("likes_count").default(0),
  isVerified: boolean("is_verified").default(false),
  isOnline: boolean("is_online").default(false),
  lastSeenAt: timestamp("last_seen_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  followers: many(followers, { relationName: "following" }),
  following: many(followers, { relationName: "follower" }),
  videos: many(videos),
}));

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: appRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
}));

export const followers = pgTable("followers", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: integer("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const followersRelations = relations(followers, ({ one }) => ({
  follower: one(users, { fields: [followers.followerId], references: [users.id], relationName: "follower" }),
  following: one(users, { fields: [followers.followingId], references: [users.id], relationName: "following" }),
}));

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  description: text("description"),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  songName: text("song_name"),
  hashtags: text("hashtags").array(),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  viewsCount: integer("views_count").default(0),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, { fields: [videos.userId], references: [users.id] }),
  likes: many(videoLikes),
  comments: many(videoComments),
}));

export const videoLikes = pgTable("video_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: integer("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videoLikesRelations = relations(videoLikes, ({ one }) => ({
  user: one(users, { fields: [videoLikes.userId], references: [users.id] }),
  video: one(videos, { fields: [videoLikes.videoId], references: [videos.id] }),
}));

export const videoComments = pgTable("video_comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: integer("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videoCommentsRelations = relations(videoComments, ({ one }) => ({
  user: one(users, { fields: [videoComments.userId], references: [users.id] }),
  video: one(videos, { fields: [videoComments.videoId], references: [videos.id] }),
}));

export const videoSaves = pgTable("video_saves", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: integer("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hashtags = pgTable("hashtags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name"),
  description: text("description"),
  coverUrl: text("cover_url"),
  usageCount: integer("usage_count").default(0),
  viewCount: integer("view_count").default(0),
  status: hashtagStatusEnum("status").default("active"),
  isFeatured: boolean("is_featured").default(false),
  isChallenge: boolean("is_challenge").default(false),
  challengeStartDate: timestamp("challenge_start_date"),
  challengeEndDate: timestamp("challenge_end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const liveStreams = pgTable("live_streams", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  category: text("category"),
  status: streamStatusEnum("status").default("live"),
  viewerCount: integer("viewer_count").default(0),
  peakViewers: integer("peak_viewers").default(0),
  totalGifts: integer("total_gifts").default(0),
  isFeatured: boolean("is_featured").default(false),
  isPK: boolean("is_pk").default(false),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const liveStreamsRelations = relations(liveStreams, ({ one }) => ({
  host: one(users, { fields: [liveStreams.hostId], references: [users.id] }),
}));

export const partyRooms = pgTable("party_rooms", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  status: partyRoomStatusEnum("status").default("active"),
  viewerCount: integer("viewer_count").default(0),
  speakerCount: integer("speaker_count").default(0),
  maxSpeakers: integer("max_speakers").default(8),
  isPrivate: boolean("is_private").default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const partyRoomsRelations = relations(partyRooms, ({ one }) => ({
  host: one(users, { fields: [partyRooms.hostId], references: [users.id] }),
}));

export const pkBattles = pgTable("pk_battles", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  opponentId: integer("opponent_id").references(() => users.id, { onDelete: "cascade" }),
  status: battleStatusEnum("status").default("pending"),
  hostScore: integer("host_score").default(0),
  opponentScore: integer("opponent_score").default(0),
  duration: integer("duration").default(300),
  winnerId: integer("winner_id").references(() => users.id),
  streamId: integer("stream_id").references(() => liveStreams.id),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pkBattlesRelations = relations(pkBattles, ({ one }) => ({
  host: one(users, { fields: [pkBattles.hostId], references: [users.id] }),
  opponent: one(users, { fields: [pkBattles.opponentId], references: [users.id] }),
}));

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  isGroup: boolean("is_group").default(false),
  groupName: text("group_name"),
  groupAvatar: text("group_avatar"),
  lastMessageText: text("last_message_text"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationMembers = pgTable("conversation_members", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  unreadCount: integer("unread_count").default(0),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const conversationMembersRelations = relations(conversationMembers, ({ one }) => ({
  conversation: one(conversations, { fields: [conversationMembers.conversationId], references: [conversations.id] }),
  user: one(users, { fields: [conversationMembers.userId], references: [users.id] }),
}));

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  messageType: text("message_type").default("text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export const agencies = pgTable("agencies", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  status: agencyStatusEnum("status").default("pending"),
  commissionRate: integer("commission_rate").default(10),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  experience: text("experience"),
  creatorCount: integer("creator_count").default(0),
  totalEarnings: integer("total_earnings").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const agenciesRelations = relations(agencies, ({ one }) => ({
  owner: one(users, { fields: [agencies.ownerId], references: [users.id] }),
}));

export const gifts = pgTable("gifts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  iconUrl: text("icon_url"),
  coinValue: integer("coin_value").notNull().default(1),
  category: giftCategoryEnum("category").default("standard"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const giftTransactions = pgTable("gift_transactions", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: integer("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  giftId: integer("gift_id").notNull().references(() => gifts.id),
  quantity: integer("quantity").default(1),
  totalCoins: integer("total_coins").notNull(),
  contextType: text("context_type"),
  contextId: integer("context_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: integer("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  packageName: text("package_name").notNull(),
  status: campaignStatusEnum("status").default("active"),
  budget: integer("budget").notNull(),
  spent: integer("spent").default(0),
  targetViews: integer("target_views").notNull(),
  currentViews: integer("current_views").default(0),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  user: one(users, { fields: [campaigns.userId], references: [users.id] }),
  video: one(videos, { fields: [campaigns.videoId], references: [videos.id] }),
}));

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  currency: currencyTypeEnum("currency").notNull().default("coins"),
  description: text("description"),
  referenceId: integer("reference_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;
export type VideoComment = typeof videoComments.$inferSelect;
export type InsertVideoComment = typeof videoComments.$inferInsert;
export type Hashtag = typeof hashtags.$inferSelect;
export type InsertHashtag = typeof hashtags.$inferInsert;
export type LiveStream = typeof liveStreams.$inferSelect;
export type InsertLiveStream = typeof liveStreams.$inferInsert;
export type PartyRoom = typeof partyRooms.$inferSelect;
export type InsertPartyRoom = typeof partyRooms.$inferInsert;
export type PKBattle = typeof pkBattles.$inferSelect;
export type InsertPKBattle = typeof pkBattles.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type Agency = typeof agencies.$inferSelect;
export type InsertAgency = typeof agencies.$inferInsert;
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  privateAccount: boolean("private_account").default(false),
  allowComments: text("allow_comments").default("everyone"),
  allowDuets: text("allow_duets").default("everyone"),
  allowStitch: text("allow_stitch").default("everyone"),
  allowMessages: text("allow_messages").default("everyone"),
  suggestToOthers: boolean("suggest_to_others").default(true),
  allowDownloads: boolean("allow_downloads").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  liveNotifications: boolean("live_notifications").default(true),
  messageNotifications: boolean("message_notifications").default(true),
  commentNotifications: boolean("comment_notifications").default(true),
  followerNotifications: boolean("follower_notifications").default(true),
  likeNotifications: boolean("like_notifications").default(true),
  mentionNotifications: boolean("mention_notifications").default(true),
  videoQuality: text("video_quality").default("auto"),
  autoplayVideos: boolean("autoplay_videos").default(true),
  dataSaver: boolean("data_saver").default(false),
  language: text("language").default("en"),
  contentLanguages: text("content_languages").array().default(["en"]),
  restrictedMode: boolean("restricted_mode").default(false),
  screenTimeReminder: boolean("screen_time_reminder").default(false),
  darkMode: text("dark_mode").default("system"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, { fields: [userSettings.userId], references: [users.id] }),
}));

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

export type Gift = typeof gifts.$inferSelect;
export type InsertGift = typeof gifts.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
