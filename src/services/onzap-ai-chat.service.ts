/**
 * ONZAP Mobile - AI Chat Assistant Service
 * Feature: Auto-respond to customer messages using AI
 * Timeline: Week 1-2 (2 weeks)
 * Revenue Impact: +R$ 500k MRR
 */

import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from './prisma.service';

interface ChatMessage {
  id: string;
  userId: string;
  contactId: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatHistory {
  messages: ChatMessage[];
  context: string;
}

interface TrainingData {
  userId: string;
  conversations: ChatMessage[];
  successMetrics: {
    responseTime: number;
    accuracy: number;
    escalationRate: number;
  };
}

@Injectable()
export class OnzapAiChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private prisma: PrismaService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * FEATURE #1: Award points to users for actions
   * Week 1-2 Implementation
   */
  async generateAutoResponse(
    userId: string,
    contactId: string,
    message: string,
  ): Promise<string> {
    try {
      // Get user's training data (previous conversations)
      const trainingData = await this.getTrainingData(userId);
      const context = this.buildContext(trainingData);

      // Create prompt for AI
      const prompt = this.createPrompt(message, context);

      // Call Gemini API
      const startTime = Date.now();
      const response = await this.model.generateContent(prompt);
      const responseTime = Date.now() - startTime;

      // Extract response text
      const aiResponse = response.response.text();

      // Check if response is good (>70% accuracy target)
      const accuracy = await this.evaluateResponse(message, aiResponse);

      if (accuracy < 0.7) {
        // Low accuracy - escalate to human
        await this.escalateToHuman(userId, contactId, message);
        return null;
      }

      // Store conversation for future training
      await this.storeConversation(userId, contactId, message, aiResponse);

      // Log metrics
      await this.logMetrics(userId, {
        responseTime,
        accuracy,
        escalationRate: 0,
      });

      return aiResponse;
    } catch (error) {
      console.error('AI Chat error:', error);
      // Fallback to human escalation on error
      await this.escalateToHuman(userId, contactId, message);
      return null;
    }
  }

  /**
   * Get user's chat history for training
   */
  private async getTrainingData(userId: string): Promise<TrainingData> {
    const conversations = await this.prisma.chatMessage.findMany({
      where: {
        userId,
        sender: { in: ['user', 'ai'] },
      },
      orderBy: { timestamp: 'desc' },
      take: 100, // Last 100 messages for context
    });

    return {
      userId,
      conversations,
      successMetrics: {
        responseTime: 0,
        accuracy: 0,
        escalationRate: 0,
      },
    };
  }

  /**
   * Build context from training data
   */
  private buildContext(trainingData: TrainingData): string {
    const recentConversations = trainingData.conversations
      .slice(0, 10)
      .map(msg => `${msg.sender}: ${msg.message}`)
      .join('\n');

    return `
Previous conversations with this customer:
${recentConversations}

Respond naturally and helpfully.
Keep responses short (under 200 chars).
If you don't know, offer to escalate to human.
    `.trim();
  }

  /**
   * Create prompt for AI model
   */
  private createPrompt(message: string, context: string): string {
    return `
Context:
${context}

Customer message: "${message}"

Respond as a helpful customer service representative. Keep it under 200 characters.
    `.trim();
  }

  /**
   * Evaluate response accuracy
   * Target: >70% accuracy
   */
  private async evaluateResponse(
    userMessage: string,
    aiResponse: string,
  ): Promise<number> {
    // Simple heuristics for now (can be improved with ML model)
    let score = 0.8; // Start at 80%

    // Penalize empty responses
    if (!aiResponse || aiResponse.length === 0) {
      return 0;
    }

    // Penalize very short responses
    if (aiResponse.length < 10) {
      score -= 0.1;
    }

    // Penalize responses that don't relate to question
    const userWords = userMessage.toLowerCase().split(' ');
    const responseWords = aiResponse.toLowerCase().split(' ');
    const commonWords = userWords.filter(w => responseWords.includes(w));

    if (commonWords.length === 0) {
      score -= 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Store conversation for training
   */
  private async storeConversation(
    userId: string,
    contactId: string,
    userMessage: string,
    aiResponse: string,
  ): Promise<void> {
    // Store user message
    await this.prisma.chatMessage.create({
      data: {
        userId,
        contactId,
        message: userMessage,
        sender: 'user',
        timestamp: new Date(),
      },
    });

    // Store AI response
    await this.prisma.chatMessage.create({
      data: {
        userId,
        contactId,
        message: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      },
    });
  }

  /**
   * Escalate to human agent
   */
  private async escalateToHuman(
    userId: string,
    contactId: string,
    message: string,
  ): Promise<void> {
    await this.prisma.escalationQueue.create({
      data: {
        userId,
        contactId,
        message,
        reason: 'ai_low_confidence',
        status: 'pending',
        createdAt: new Date(),
      },
    });
  }

  /**
   * Log performance metrics
   */
  private async logMetrics(
    userId: string,
    metrics: any,
  ): Promise<void> {
    await this.prisma.aiChatMetrics.create({
      data: {
        userId,
        ...metrics,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Get chat history for user
   */
  async getChatHistory(
    userId: string,
    contactId: string,
    limit = 50,
  ): Promise<ChatMessage[]> {
    return this.prisma.chatMessage.findMany({
      where: {
        userId,
        contactId,
      },
      orderBy: { timestamp: 'asc' },
      take: limit,
    });
  }

  /**
   * Get AI performance metrics
   */
  async getPerformanceMetrics(userId: string): Promise<any> {
    const metrics = await this.prisma.aiChatMetrics.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    // Calculate averages
    const avgResponseTime =
      metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
    const avgAccuracy =
      metrics.reduce((sum, m) => sum + m.accuracy, 0) / metrics.length;

    return {
      avgResponseTime,
      avgAccuracy,
      totalMessages: metrics.length,
      lastUpdate: metrics[0]?.timestamp,
    };
  }
}
