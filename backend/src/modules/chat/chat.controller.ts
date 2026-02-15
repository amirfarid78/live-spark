import {
  Controller, Get, Post, Delete, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get my conversations' })
  async getConversations(@CurrentUser('sub') userId: string, @Query() dto: PaginationDto) {
    return this.chatService.getConversations(userId, dto.page, dto.limit);
  }

  @Post('conversations/direct/:targetUserId')
  @ApiOperation({ summary: 'Start or get direct conversation' })
  async getOrCreateDirect(
    @CurrentUser('sub') userId: string,
    @Param('targetUserId') targetId: string,
  ) {
    return this.chatService.getOrCreateDirectConversation(userId, targetId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get conversation messages' })
  async getMessages(
    @Param('id') convoId: string,
    @CurrentUser('sub') userId: string,
    @Query() dto: PaginationDto,
  ) {
    return this.chatService.getMessages(convoId, userId, dto.page, dto.limit);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @Param('id') convoId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { content: string; type?: string; media?: any; reply_to_id?: string },
  ) {
    return this.chatService.sendMessage(
      convoId, userId, body.content, body.type, body.media, body.reply_to_id,
    );
  }

  @Delete('messages/:id')
  async deleteMessage(@Param('id') messageId: string, @CurrentUser('sub') userId: string) {
    return this.chatService.deleteMessage(messageId, userId);
  }

  @Post('conversations/:id/read')
  async markRead(@Param('id') convoId: string, @CurrentUser('sub') userId: string) {
    return this.chatService.markRead(convoId, userId);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser('sub') userId: string) {
    return this.chatService.getUnreadCount(userId);
  }
}
