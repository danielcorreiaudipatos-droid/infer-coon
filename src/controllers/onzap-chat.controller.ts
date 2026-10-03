/**
 * ONZAP Chat Controller
 * Endpoints for AI Chat Assistant
 */

import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { OnzapAiChatService } from '../services/onzap-ai-chat.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/onzap/chat')
@UseGuards(AuthGuard('jwt'))
export class OnzapChatController {
  constructor(private chatService: OnzapAiChatService) {}

  /**
   * POST /api/onzap/chat/message
   * Send a message and get AI response
   * Target response time: <2s
   */
  @Post('message')
  async sendMessage(
    @Body() dto: { userId: string; contactId: string; message: string },
  ) {
    const startTime = Date.now();

    const response = await this.chatService.generateAutoResponse(
      dto.userId,
      dto.contactId,
      dto.message,
    );

    const responseTime = Date.now() - startTime;

    return {
      success: !!response,
      message: response,
      responseTime,
      timestamp: new Date(),
    };
  }

  /**
   * GET /api/onzap/chat/history/:contactId
   * Get chat history with a contact
   */
  @Get('history/:contactId')
  async getHistory(
    @Param('contactId') contactId: string,
    @Body() dto: { userId: string },
  ) {
    const history = await this.chatService.getChatHistory(
      dto.userId,
      contactId,
    );

    return {
      contactId,
      messages: history,
      count: history.length,
    };
  }

  /**
   * GET /api/onzap/chat/metrics
   * Get AI Chat performance metrics
   */
  @Get('metrics')
  async getMetrics(@Body() dto: { userId: string }) {
    const metrics = await this.chatService.getPerformanceMetrics(
      dto.userId,
    );

    return {
      userId: dto.userId,
      ...metrics,
      status: metrics.avgAccuracy > 0.7 ? 'healthy' : 'needs_training',
    };
  }
}
