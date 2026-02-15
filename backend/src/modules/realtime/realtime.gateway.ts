import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('RealtimeGateway');
  private onlineUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>

  constructor(private jwtService: JwtService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (token) {
        const payload = this.jwtService.verify(token as string);
        const userId = payload.sub;
        client.userId = userId;
        client.username = payload.username;

        // Track online status
        if (!this.onlineUsers.has(userId)) {
          this.onlineUsers.set(userId, new Set());
        }
        this.onlineUsers.get(userId)!.add(client.id);

        // Broadcast online status
        this.server.emit('user:online', { user_id: userId });
        this.logger.log(`User ${userId} connected (${client.id})`);
      }
    } catch {
      // Anonymous connection allowed for public streams
      this.logger.log(`Anonymous connection: ${client.id}`);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const sockets = this.onlineUsers.get(client.userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.onlineUsers.delete(client.userId);
          this.server.emit('user:offline', { user_id: client.userId });
        }
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // === Live Stream Events ===

  @SubscribeMessage('live:join')
  handleLiveJoin(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { stream_id: string }) {
    const room = `live:${data.stream_id}`;
    client.join(room);
    this.server.to(room).emit('live:viewer_joined', {
      user_id: client.userId,
      username: client.username,
      stream_id: data.stream_id,
    });
    this.logger.log(`${client.userId} joined live room ${data.stream_id}`);
  }

  @SubscribeMessage('live:leave')
  handleLiveLeave(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { stream_id: string }) {
    const room = `live:${data.stream_id}`;
    client.leave(room);
    this.server.to(room).emit('live:viewer_left', {
      user_id: client.userId,
      stream_id: data.stream_id,
    });
  }

  @SubscribeMessage('live:chat')
  handleLiveChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { stream_id: string; message: string }) {
    if (!client.userId) return;
    const room = `live:${data.stream_id}`;
    this.server.to(room).emit('live:chat_message', {
      stream_id: data.stream_id,
      user_id: client.userId,
      username: client.username,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('live:gift')
  handleLiveGift(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: {
    stream_id: string; gift_id: string; gift_name: string; gift_icon: string; coins: number; quantity: number;
  }) {
    if (!client.userId) return;
    const room = `live:${data.stream_id}`;
    this.server.to(room).emit('live:gift_received', {
      sender_id: client.userId,
      sender_username: client.username,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Streamer pushes viewer count updates
  @SubscribeMessage('live:viewer_count')
  handleViewerCount(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { stream_id: string; count: number }) {
    const room = `live:${data.stream_id}`;
    this.server.to(room).emit('live:viewer_count_update', { stream_id: data.stream_id, count: data.count });
  }

  // === PK Battle Events ===

  @SubscribeMessage('pk:join')
  handlePKJoin(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { battle_id: string }) {
    client.join(`pk:${data.battle_id}`);
  }

  @SubscribeMessage('pk:score_update')
  handlePKScore(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: {
    battle_id: string; streamer1_score: number; streamer2_score: number;
  }) {
    this.server.to(`pk:${data.battle_id}`).emit('pk:score_changed', data);
  }

  @SubscribeMessage('pk:gift')
  handlePKGift(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: {
    battle_id: string; target_streamer_id: string; gift_name: string; coins: number;
  }) {
    if (!client.userId) return;
    this.server.to(`pk:${data.battle_id}`).emit('pk:gift_received', {
      sender_id: client.userId,
      sender_username: client.username,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('pk:ended')
  handlePKEnd(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: {
    battle_id: string; winner_id: string; final_scores: any;
  }) {
    this.server.to(`pk:${data.battle_id}`).emit('pk:result', data);
  }

  // === Party Room Events ===

  @SubscribeMessage('party:join')
  handlePartyJoin(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { room_id: string }) {
    client.join(`party:${data.room_id}`);
    this.server.to(`party:${data.room_id}`).emit('party:member_joined', {
      user_id: client.userId,
      username: client.username,
    });
  }

  @SubscribeMessage('party:leave')
  handlePartyLeave(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { room_id: string }) {
    client.leave(`party:${data.room_id}`);
    this.server.to(`party:${data.room_id}`).emit('party:member_left', {
      user_id: client.userId,
    });
  }

  @SubscribeMessage('party:chat')
  handlePartyChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { room_id: string; message: string }) {
    if (!client.userId) return;
    this.server.to(`party:${data.room_id}`).emit('party:chat_message', {
      user_id: client.userId,
      username: client.username,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('party:seat_update')
  handlePartySeatUpdate(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: {
    room_id: string; seat_number: number; user_id?: string; action: 'take' | 'leave' | 'lock' | 'mute';
  }) {
    this.server.to(`party:${data.room_id}`).emit('party:seat_changed', data);
  }

  // === Direct Messaging ===

  @SubscribeMessage('chat:join')
  handleChatJoin(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { conversation_id: string }) {
    client.join(`chat:${data.conversation_id}`);
  }

  @SubscribeMessage('chat:message')
  handleChatMessage(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: {
    conversation_id: string; message: string; type?: string;
  }) {
    if (!client.userId) return;
    this.server.to(`chat:${data.conversation_id}`).emit('chat:new_message', {
      sender_id: client.userId,
      sender_username: client.username,
      conversation_id: data.conversation_id,
      message: data.message,
      type: data.type || 'text',
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('chat:typing')
  handleTyping(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { conversation_id: string; is_typing: boolean }) {
    if (!client.userId) return;
    client.to(`chat:${data.conversation_id}`).emit('chat:typing', {
      user_id: client.userId,
      is_typing: data.is_typing,
    });
  }

  @SubscribeMessage('chat:read')
  handleRead(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { conversation_id: string }) {
    if (!client.userId) return;
    client.to(`chat:${data.conversation_id}`).emit('chat:read', {
      user_id: client.userId,
      conversation_id: data.conversation_id,
    });
  }

  // === Utility ===

  @SubscribeMessage('online:check')
  handleOnlineCheck(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { user_ids: string[] }) {
    const result = data.user_ids.map(uid => ({
      user_id: uid,
      is_online: this.onlineUsers.has(uid),
    }));
    client.emit('online:status', result);
  }

  // === Server-side emit helpers (called by services) ===

  emitToUser(userId: string, event: string, data: any) {
    const sockets = this.onlineUsers.get(userId);
    if (sockets) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit(event, data);
      }
    }
  }

  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  getOnlineCount(): number {
    return this.onlineUsers.size;
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}
