import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userLevelEnum = pgEnum("user_level", ["bronze", "silver", "gold", "platinum", "diamond"]);
export const appRoleEnum = pgEnum("app_role", ["admin", "moderator", "user", "creator", "vip"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
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

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;
export type VideoComment = typeof videoComments.$inferSelect;
export type InsertVideoComment = typeof videoComments.$inferInsert;
