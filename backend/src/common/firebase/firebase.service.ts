import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface FirebaseDecodedToken {
  uid: string;
  email?: string;
  phone_number?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  firebase: {
    sign_in_provider: string;
    identities: Record<string, string[]>;
  };
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App | null = null;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

    if (!projectId || !privateKey || !clientEmail) {
      this.logger.warn('Firebase credentials not configured. Firebase auth will be disabled.');
      return;
    }

    try {
      // Check if Firebase is already initialized
      if (admin.apps.length === 0) {
        this.app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey: privateKey.replace(/\\n/g, '\n'),
            clientEmail,
          }),
        });
        this.logger.log('Firebase Admin SDK initialized successfully');
      } else {
        this.app = admin.apps[0];
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  /**
   * Verify a Firebase ID token
   */
  async verifyIdToken(idToken: string): Promise<FirebaseDecodedToken | null> {
    if (!this.app) {
      this.logger.warn('Firebase not initialized, cannot verify token');
      return null;
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken as FirebaseDecodedToken;
    } catch (error) {
      this.logger.error('Firebase token verification failed:', error);
      return null;
    }
  }

  /**
   * Get Firebase messaging instance
   */
  getMessaging(): admin.messaging.Messaging | null {
    if (!this.app) return null;
    return admin.messaging();
  }

  /**
   * Send push notification via FCM
   */
  async sendPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ successCount: number; failureCount: number; invalidTokens: string[] }> {
    const messaging = this.getMessaging();
    if (!messaging || tokens.length === 0) {
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
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
          fcmOptions: {
            link: '/',
          },
        },
      };

      const response = await messaging.sendEachForMulticast(message);
      
      const invalidTokens: string[] = [];
      response.responses.forEach((res, idx) => {
        if (!res.success && res.error?.code === 'messaging/registration-token-not-registered') {
          invalidTokens.push(tokens[idx]);
        }
      });

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens,
      };
    } catch (error) {
      this.logger.error('FCM send error:', error);
      return { successCount: 0, failureCount: tokens.length, invalidTokens: [] };
    }
  }

  /**
   * Check if Firebase is configured
   */
  isConfigured(): boolean {
    return this.app !== null;
  }
}
