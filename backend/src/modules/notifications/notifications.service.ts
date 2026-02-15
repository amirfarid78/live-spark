import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../entities/notification.entity';
import { UserFcmToken } from '../../entities/notification.entity';
import { NotificationPreference } from '../../entities/notification.entity';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseApp: admin.app.App | null = null;

  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(UserFcmToken) private fcmRepo: Repository<UserFcmToken>,
    @InjectRepository(NotificationPreference) private prefRepo: Repository<NotificationPreference>,
    private config: ConfigService,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.config.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('Firebase credentials not configured. Push notifications will be disabled.');
      return;
    }

    try {
      // Check if already initialized
      if (admin.apps.length === 0) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines from env
          }),
        });
        this.logger.log('Firebase Admin SDK initialized successfully');
      } else {
        this.firebaseApp = admin.apps[0];
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  // --- In-app notifications ---
  async createNotification(data: {
    user_id: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: any;
    actor_id?: string;
    image_url?: string;
  }) {
    const notif = this.notifRepo.create({
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      body: data.body,
      data: data.data || {},
      actor_id: data.actor_id,
      image_url: data.image_url,
    });
    const saved = await this.notifRepo.save(notif);

    // Check user preferences before sending push
    const pref = await this.prefRepo.findOne({ where: { user_id: data.user_id } });
    const shouldPush = this.shouldSendPush(pref, data.type);

    if (shouldPush) {
      await this.sendPushNotification(data.user_id, data.title, data.body, data.data);
    }

    return saved;
  }

  async getNotifications(userId: string, page = 1, limit = 30, unreadOnly = false) {
    const qb = this.notifRepo.createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .orderBy('n.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (unreadOnly) qb.andWhere('n.is_read = false');

    const [items, total] = await qb.getManyAndCount();
    const unread = await this.notifRepo.count({ where: { user_id: userId, is_read: false } });

    return { items, total, unread, page, limit };
  }

  async markAsRead(userId: string, notificationId: string) {
    await this.notifRepo.update({ id: notificationId, user_id: userId }, { is_read: true });
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.notifRepo.update({ user_id: userId, is_read: false }, { is_read: true });
    return { success: true };
  }

  async deleteNotification(userId: string, notificationId: string) {
    await this.notifRepo.delete({ id: notificationId, user_id: userId });
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notifRepo.count({ where: { user_id: userId, is_read: false } });
    return { count };
  }

  // --- FCM Token Management ---
  async registerFcmToken(userId: string, data: { token: string; device_type: string }) {
    // Upsert by token
    let existing = await this.fcmRepo.findOne({ where: { token: data.token } });
    if (existing) {
      existing.user_id = userId;
      existing.device_type = data.device_type;
      existing.is_active = true;
      return this.fcmRepo.save(existing);
    }

    const fcm = this.fcmRepo.create({
      user_id: userId,
      token: data.token,
      device_type: data.device_type,
    });
    return this.fcmRepo.save(fcm);
  }

  async removeFcmToken(token: string) {
    await this.fcmRepo.update({ token }, { is_active: false });
    return { success: true };
  }

  // --- Preferences ---
  async getPreferences(userId: string) {
    let pref = await this.prefRepo.findOne({ where: { user_id: userId } });
    if (!pref) {
      pref = this.prefRepo.create({ user_id: userId });
      pref = await this.prefRepo.save(pref);
    }
    return pref;
  }

  async updatePreferences(userId: string, data: Partial<NotificationPreference>) {
    let pref = await this.prefRepo.findOne({ where: { user_id: userId } });
    if (!pref) {
      pref = this.prefRepo.create({ user_id: userId, ...data });
    } else {
      Object.assign(pref, data);
    }
    return this.prefRepo.save(pref);
  }

  // --- Push notification ---
  private async sendPushNotification(userId: string, title: string, body: string, data?: any) {
    if (!this.firebaseApp) {
      this.logger.debug('Firebase not initialized, skipping push notification');
      return;
    }

    const tokens = await this.fcmRepo.find({ where: { user_id: userId, is_active: true } });
    if (tokens.length === 0) {
      this.logger.debug(`No active FCM tokens for user ${userId}`);
      return;
    }

    const tokenStrings = tokens.map(t => t.token);

    try {
      const message: admin.messaging.MulticastMessage = {
        notification: { title, body },
        data: data ? Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ) : undefined,
        tokens: tokenStrings,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
        webpush: {
          notification: {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.debug(`FCM result: ${response.successCount} success, ${response.failureCount} failures`);

      // Deactivate failed tokens
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (
            errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/invalid-registration-token'
          ) {
            this.fcmRepo.update({ token: tokenStrings[idx] }, { is_active: false });
            this.logger.debug(`Deactivated invalid token: ${tokenStrings[idx].substring(0, 20)}...`);
          }
        }
      });
    } catch (err) {
      this.logger.error('FCM send error:', err);
    }
  }

  private shouldSendPush(pref: NotificationPreference | null, type: NotificationType): boolean {
    if (!pref) return true; // Default: send all
    if (!pref.push_enabled) return false;

    switch (type) {
      case NotificationType.LIKE: return pref.like_notifications;
      case NotificationType.COMMENT: return pref.comment_notifications;
      case NotificationType.FOLLOW: return pref.follow_notifications;
      case NotificationType.GIFT: return pref.gift_notifications;
      case NotificationType.LIVE_START: return pref.live_notifications;
      case NotificationType.MESSAGE: return pref.message_notifications;
      default: return true;
    }
  }

  // --- Bulk notify (internal use) ---
  async notifyFollowers(actorId: string, followerIds: string[], type: NotificationType, title: string, body: string, data?: any) {
    const notifications = followerIds.map(uid =>
      this.notifRepo.create({ user_id: uid, actor_id: actorId, type, title, body, data: data || {} }),
    );
    return this.notifRepo.save(notifications);
  }

  // --- Admin ---
  async adminSendBroadcast(title: string, body: string, data?: any) {
    if (!this.firebaseApp) {
      return { error: 'Firebase not configured', queued: 0 };
    }

    const allTokens = await this.fcmRepo.find({ where: { is_active: true } });
    if (allTokens.length === 0) {
      return { queued: 0, title, body };
    }

    // Send in batches of 500 (FCM limit)
    const tokenStrings = allTokens.map(t => t.token);
    const batchSize = 500;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < tokenStrings.length; i += batchSize) {
      const batch = tokenStrings.slice(i, i + batchSize);
      try {
        const message: admin.messaging.MulticastMessage = {
          notification: { title, body },
          data: data ? Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v)])
          ) : undefined,
          tokens: batch,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        successCount += response.successCount;
        failureCount += response.failureCount;
      } catch (err) {
        this.logger.error('Broadcast batch error:', err);
        failureCount += batch.length;
      }
    }

    return { queued: allTokens.length, sent: successCount, failed: failureCount, title, body };
  }
}
