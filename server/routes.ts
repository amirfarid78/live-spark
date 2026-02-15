import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { verifyFirebaseToken } from "./firebase-admin";

const SessionStore = MemoryStore(session);

function requireAuth(req: any, res: any, next: any) {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "snap-live-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({ checkPeriod: 86400000 }),
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    })
  );

  // ==================== AUTH ====================

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, username, displayName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }

      if (username) {
        const existingUsername = await storage.getUserByUsername(username);
        if (existingUsername) {
          return res.status(409).json({ message: "Username already taken" });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        username: username || email.split("@")[0],
        displayName: displayName || email.split("@")[0],
      });

      (req.session as any).userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      (req.session as any).userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.post("/api/auth/firebase", async (req, res) => {
    try {
      const { idToken, displayName: clientDisplayName, username: clientUsername } = req.body;
      if (!idToken) {
        return res.status(400).json({ message: "Firebase ID token is required" });
      }

      const decoded = await verifyFirebaseToken(idToken);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired Firebase token" });
      }

      const firebaseUid = decoded.uid;
      const email = decoded.email || null;
      const phoneNumber = decoded.phone_number || null;

      let user = await storage.getUserByFirebaseUid(firebaseUid);

      if (!user) {
        const userEmail = email || `${phoneNumber?.replace(/\+/g, "")}@phone.snaplive.app`;
        const existing = await storage.getUserByEmail(userEmail);
        if (existing) {
          user = await storage.updateUser(existing.id, { firebaseUid, phoneNumber: phoneNumber || existing.phoneNumber });
          user = user!;
        } else {
          const generatedUsername = clientUsername || (clientDisplayName ? clientDisplayName.toLowerCase().replace(/\s+/g, "_") : `user_${firebaseUid.slice(0, 8)}`);
          try {
            user = await storage.createUser({
              email: userEmail,
              password: "firebase_auth",
              firebaseUid,
              phoneNumber,
              username: generatedUsername,
              displayName: clientDisplayName || generatedUsername,
            });
          } catch (createErr: any) {
            if (createErr?.cause?.code === '23505') {
              user = await storage.getUserByEmail(userEmail) || await storage.getUserByFirebaseUid(firebaseUid);
              if (user && !user.firebaseUid) {
                user = await storage.updateUser(user.id, { firebaseUid }) || user;
              }
            }
            if (!user) throw createErr;
          }
        }
      }

      (req.session as any).userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Firebase auth error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // ==================== VIDEOS ====================

  app.get("/api/videos/feed", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;
      const feedVideos = await storage.getVideos(limit, offset);
      res.json(feedVideos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/videos/trending", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const trendingVideos = await storage.getTrendingVideos(limit);
      res.json(trendingVideos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/videos", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const video = await storage.createVideo({ ...req.body, userId });
      res.status(201).json(video);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/videos/:id/like", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const liked = await storage.likeVideo(userId, parseInt(req.params.id));
      res.json({ liked });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/videos/:id/save", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const saved = await storage.saveVideo(userId, parseInt(req.params.id));
      res.json({ saved });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/videos/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getVideoComments(parseInt(req.params.id));
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/videos/:id/comments", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const comment = await storage.createComment({
        userId,
        videoId: parseInt(req.params.id),
        content: req.body.content,
        parentId: req.body.parentId || null,
      });
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== USERS & PROFILES ====================

  app.get("/api/users/search", async (req, res) => {
    try {
      const query = (req.query.q as string) || "";
      const limit = parseInt(req.query.limit as string) || 20;
      const results = await storage.searchUsers(query, limit);
      const sanitized = results.map(({ password: _, ...u }) => u);
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/suggested", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId || 0;
      const limit = parseInt(req.query.limit as string) || 10;
      const results = await storage.getSuggestedUsers(userId, limit);
      const sanitized = results.map(({ password: _, ...u }) => u);
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _, ...userWithoutPassword } = user;

      const userId = (req.session as any)?.userId;
      let isFollowing = false;
      if (userId && userId !== user.id) {
        isFollowing = await storage.isFollowing(userId, user.id);
      }

      res.json({ ...userWithoutPassword, isFollowing });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/videos", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;
      const userVideos = await storage.getUserVideos(parseInt(req.params.id), limit, offset);
      res.json(userVideos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    try {
      const userFollowers = await storage.getFollowers(parseInt(req.params.id));
      const sanitized = userFollowers.map(({ password: _, ...u }) => u);
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/following", async (req, res) => {
    try {
      const following = await storage.getFollowing(parseInt(req.params.id));
      const sanitized = following.map(({ password: _, ...u }) => u);
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/users/profile", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const user = await storage.updateUser(userId, req.body);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/users/:id/follow", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const followed = await storage.followUser(userId, parseInt(req.params.id));
      res.json({ followed });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/users/:id/follow", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const unfollowed = await storage.unfollowUser(userId, parseInt(req.params.id));
      res.json({ unfollowed });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== HASHTAGS / DISCOVER ====================

  app.get("/api/hashtags", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await storage.getHashtags(limit);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hashtags/trending", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await storage.getTrendingHashtags(limit);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hashtags/featured", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await storage.getFeaturedHashtags(limit);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hashtags/search", async (req, res) => {
    try {
      const query = (req.query.q as string) || "";
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await storage.searchHashtags(query, limit);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hashtags/:name", async (req, res) => {
    try {
      const tag = await storage.getHashtagByName(req.params.name);
      if (!tag) return res.status(404).json({ message: "Hashtag not found" });
      res.json(tag);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/hashtags", requireAuth, async (req, res) => {
    try {
      const hashtag = await storage.createHashtag(req.body);
      res.status(201).json(hashtag);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== LIVE STREAMS ====================

  app.get("/api/live/streams", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const category = req.query.category as string | undefined;
      const streams = await storage.getActiveLiveStreams(limit, offset, category);
      res.json(streams);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/live/featured", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const featured = await storage.getFeaturedLiveStreams(limit);
      res.json(featured);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/live/streams", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const stream = await storage.createLiveStream({ ...req.body, hostId: userId });
      res.status(201).json(stream);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/live/agora-token", requireAuth, async (req, res) => {
    try {
      const { RtcTokenBuilder, RtcRole } = await import("agora-token");
      const appId = process.env.AGORA_APP_ID;
      const appCertificate = process.env.AGORA_APP_CERTIFICATE;
      if (!appId || !appCertificate) {
        return res.status(500).json({ message: "Agora credentials not configured" });
      }
      const { channelName, uid, role } = req.body;
      if (!channelName) {
        return res.status(400).json({ message: "channelName is required" });
      }
      const agoraRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
      const expirationTimeInSeconds = 3600;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
      const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid || 0,
        agoraRole,
        expirationTimeInSeconds,
        privilegeExpiredTs
      );
      res.json({ token, appId, channelName, uid: uid || 0 });
    } catch (error: any) {
      console.error("Agora token error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/live/streams/:id/end", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const stream = await storage.endLiveStream(parseInt(req.params.id), userId);
      if (!stream) return res.status(404).json({ message: "Stream not found" });
      res.json(stream);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== PARTY ROOMS ====================

  app.get("/api/party-rooms", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const category = req.query.category as string | undefined;
      const rooms = await storage.getActivePartyRooms(limit, offset, category);
      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/party-rooms", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const room = await storage.createPartyRoom({ ...req.body, hostId: userId });
      res.status(201).json(room);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/party-rooms/:id", async (req, res) => {
    try {
      const room = await storage.getPartyRoom(parseInt(req.params.id));
      if (!room) return res.status(404).json({ message: "Party room not found" });
      res.json(room);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== PK BATTLES ====================

  app.get("/api/pk-battles", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const battles = await storage.getActivePKBattles(limit);
      res.json(battles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/pk-battles", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const battleData: any = { hostId: userId, status: "pending" };
      if (req.body.opponentId) {
        battleData.opponentId = req.body.opponentId;
        battleData.status = "live";
        battleData.startedAt = new Date();
      }
      if (req.body.duration) battleData.duration = req.body.duration;
      const battle = await storage.createPKBattle(battleData);
      res.status(201).json(battle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/pk-battles/:id/join", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const battleId = parseInt(req.params.id);
      const battle = await storage.joinPKBattle(battleId, userId);
      if (!battle) return res.status(404).json({ message: "Battle not found or already full" });
      res.json(battle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== MESSAGES ====================

  app.get("/api/conversations", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const convos = await storage.getConversations(userId);
      res.json(convos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/conversations/direct", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { targetUserId } = req.body;
      if (!targetUserId) return res.status(400).json({ message: "targetUserId is required" });
      const convo = await storage.getOrCreateDirectConversation(userId, targetUserId);
      res.json(convo);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const msgs = await storage.getMessages(parseInt(req.params.id), userId, limit, offset);
      res.json(msgs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { content } = req.body;
      if (!content) return res.status(400).json({ message: "Content is required" });
      const msg = await storage.sendMessage(parseInt(req.params.id), userId, content);
      res.status(201).json(msg);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== AGENCIES ====================

  app.post("/api/agencies", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const existing = await storage.getMyAgency(userId);
      if (existing) return res.status(409).json({ message: "You already have an agency application" });
      const agency = await storage.createAgency({ ...req.body, ownerId: userId });
      res.status(201).json(agency);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/agencies/mine", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const agency = await storage.getMyAgency(userId);
      res.json(agency || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/agencies/stats", async (req, res) => {
    try {
      const stats = await storage.getAgencyStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/agencies", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { agency_name, description, experience, creator_count, contact_email, contact_phone, instagram, tiktok } = req.body;
      const agency = await storage.createAgency({
        ownerId: userId,
        name: agency_name || "Unnamed Agency",
        description: description || "",
        commissionRate: 10,
        status: "pending",
      });
      res.status(201).json(agency);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/agencies", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const agencyList = await storage.getAgencies(limit, offset);
      res.json(agencyList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== GIFTS ====================

  app.get("/api/gifts", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const giftList = await storage.getGiftCatalog(category);
      res.json(giftList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== CAMPAIGNS (Creator Studio) ====================

  app.get("/api/campaigns", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const campaignList = await storage.getUserCampaigns(userId);
      res.json(campaignList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/campaigns", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const campaign = await storage.createCampaign({ ...req.body, userId });
      res.status(201).json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== WALLET ====================

  app.get("/api/wallet/balance", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const balance = await storage.getWalletBalance(userId);
      res.json(balance);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/wallet/transactions", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const txns = await storage.getTransactionHistory(userId, limit, offset);
      res.json(txns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== CREATOR STUDIO (analytics) ====================

  app.get("/api/creator/stats", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const userVideos = await storage.getUserVideos(userId, 100);
      const totalViews = userVideos.reduce((sum, v) => sum + (v.viewsCount || 0), 0);
      const totalLikes = userVideos.reduce((sum, v) => sum + (v.likesCount || 0), 0);
      const totalComments = userVideos.reduce((sum, v) => sum + (v.commentsCount || 0), 0);
      const totalShares = userVideos.reduce((sum, v) => sum + (v.sharesCount || 0), 0);
      const user = await storage.getUser(userId);

      res.json({
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        followerCount: user?.followersCount || 0,
        diamondsEarned: user?.diamondsBalance || 0,
        videoCount: userVideos.length,
        videos: userVideos.map(v => ({
          id: v.id,
          description: v.description,
          thumbnailUrl: v.thumbnailUrl,
          views: v.viewsCount || 0,
          likes: v.likesCount || 0,
          comments: v.commentsCount || 0,
          shares: v.sharesCount || 0,
          createdAt: v.createdAt,
        })),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== VIDEO VIEWS & SHARES ====================

  app.post("/api/videos/:id/view", async (req, res) => {
    try {
      await storage.incrementVideoViews(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/videos/:id/share", async (req, res) => {
    try {
      await storage.incrementVideoShares(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== USER LIKED & SAVED VIDEOS ====================

  app.get("/api/users/:id/liked-videos", requireAuth, async (req, res) => {
    try {
      const likedVideos = await storage.getUserLikedVideos(parseInt(req.params.id));
      res.json(likedVideos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/saved-videos", requireAuth, async (req, res) => {
    try {
      const savedVideos = await storage.getUserSavedVideos(parseInt(req.params.id));
      res.json(savedVideos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== GIFT SENDING & CATALOG ====================

  app.post("/api/gifts/send", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { receiverId, giftId, quantity, contextType, contextId } = req.body;
      const txn = await storage.sendGift(userId, receiverId, giftId, quantity, contextType, contextId);
      res.json(txn);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/gifts/catalog", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const giftList = await storage.getGiftCatalog(category);
      res.json(giftList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== SETTINGS ====================

  app.get("/api/settings", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      let settings = await storage.getUserSettings(userId);
      if (!settings) {
        settings = await storage.upsertUserSettings(userId, {});
      }
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/settings", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const allowedFields = [
        "privateAccount", "allowComments", "allowDuets", "allowStitch", "allowMessages",
        "suggestToOthers", "allowDownloads", "pushNotifications", "liveNotifications",
        "messageNotifications", "commentNotifications", "followerNotifications",
        "likeNotifications", "mentionNotifications", "videoQuality", "autoplayVideos",
        "dataSaver", "language", "restrictedMode", "screenTimeReminder", "darkMode"
      ];
      const filtered: any = {};
      for (const key of allowedFields) {
        if (key in req.body) filtered[key] = req.body[key];
      }
      const settings = await storage.upsertUserSettings(userId, filtered);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== ADMIN ====================

  function requireAdmin(req: any, res: any, next: any) {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    storage.getUserRoles(userId).then(roles => {
      if (roles.includes("admin") || roles.includes("moderator")) {
        next();
      } else {
        res.status(403).json({ message: "Admin access required" });
      }
    });
  }

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const allUsers = await storage.getAllUsers(limit, offset);
      const sanitized = allUsers.map(({ password: _, ...u }) => u);
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isVerified, level, coinsBalance, diamondsBalance, bio, displayName } = req.body;
      const updates: any = {};
      if (isVerified !== undefined) updates.isVerified = isVerified;
      if (level) updates.level = level;
      if (coinsBalance !== undefined) updates.coinsBalance = coinsBalance;
      if (diamondsBalance !== undefined) updates.diamondsBalance = diamondsBalance;
      if (bio !== undefined) updates.bio = bio;
      if (displayName !== undefined) updates.displayName = displayName;
      const user = await storage.updateUser(userId, updates);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safe } = user;
      res.json(safe);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      if (!role) return res.status(400).json({ message: "role is required" });
      await storage.setUserRole(userId, role);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/videos", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const allVideos = await storage.getAllVideos(limit, offset);
      res.json(allVideos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/videos/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteVideo(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  registerObjectStorageRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
