import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from './prisma.service';

interface AIResponse {
  message: string;
  confidence: number;
  category: string;
  shouldEscalate: boolean;
  reasoning: string;
  responseTime: number;
}

@Injectable()
export class OnzapAiChatImprovedService {
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  private confidenceThreshold = 0.75;

  constructor(private prisma: PrismaService) {}

  async generateAutoResponse(
    userId: string,
    contactId: string,
    message: string,
    userHistory: any[] = []
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Step 1: Classify the message
      const classification = await this.classifyMessage(message);

      // Step 2: Generate response with confidence
      const response = await this.generateWithConfidence(
        message,
        classification,
        userHistory
      );

      // Step 3: Validate response quality
      const validation = await this.validateResponse(response, message);

      // Step 4: Decide escalation
      const shouldEscalate = validation.confidence < this.confidenceThreshold;

      const responseTime = Date.now() - startTime;

      // Log metrics
      await this.logAIMetrics({
        userId,
        contactId,
        message,
        response: response.text,
        confidence: validation.confidence,
        category: classification.category,
        responseTime,
        escalated: shouldEscalate,
      });

      return {
        message: shouldEscalate
          ? '⏳ Um especialista vai responder em breve...'
          : response.text,
        confidence: validation.confidence,
        category: classification.category,
        shouldEscalate,
        reasoning: validation.reasoning,
        responseTime,
      };
    } catch (error) {
      console.error('AI Chat Error:', error);

      // Always escalate on error
      return {
        message: '⏳ Um especialista vai responder em breve...',
        confidence: 0,
        category: 'error',
        shouldEscalate: true,
        reasoning: 'Erro ao gerar resposta - escalado para humano',
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async classifyMessage(message: string): Promise<{
    category: string;
    confidence: number;
  }> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Classifique esta mensagem em uma de: greeting, question, complaint, order, price, other.

Mensagem: "${message}"

Responda apenas em JSON:
{"category": "...", "confidence": 0.95}`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch {
      return { category: 'other', confidence: 0.5 };
    }
  }

  private async generateWithConfidence(
    message: string,
    classification: any,
    userHistory: any[]
  ): Promise<{ text: string; confidence: number }> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const context = userHistory
      .slice(-5)
      .map((h) => `${h.role}: ${h.content}`)
      .join('\n');

    const prompt = `Você é um atendente de WhatsApp profissional e amigável.

CONTEXTO:
${context || 'Primeira mensagem'}

NOVA MENSAGEM:
${message}

Responda em JSON:
{"response": "...", "confidence": 0.95}`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch {
      return { text: 'Deixe-me verificar isso...', confidence: 0.3 };
    }
  }

  private async validateResponse(
    response: { text: string; confidence: number },
    originalMessage: string
  ): Promise<{ confidence: number; reasoning: string }> {
    let confidence = response.confidence;
    let reasoning = '';

    // Check length
    if (response.text.length < 5) {
      confidence *= 0.8;
      reasoning += 'Resposta muito curta. ';
    }
    if (response.text.length > 200) {
      confidence *= 0.85;
      reasoning += 'Resposta muito longa. ';
    }

    // Check for red flags
    const redFlags = [/sorry|desculpe/i, /don't know|não sei/i, /error|erro/i];

    for (const flag of redFlags) {
      if (flag.test(response.text)) {
        confidence *= 0.7;
        reasoning += 'Contém expressão de erro. ';
      }
    }

    confidence = Math.max(0, Math.min(1, confidence));

    if (!reasoning) {
      reasoning = 'Resposta validada com sucesso.';
    }

    return {
      confidence: Math.round(confidence * 100),
      reasoning,
    };
  }

  private async logAIMetrics(data: any): Promise<void> {
    try {
      await this.prisma.aiChatMetrics.create({
        data: {
          userId: data.userId,
          contactId: data.contactId,
          inputMessage: data.message,
          outputMessage: data.response,
          confidence: data.confidence,
          category: data.category,
          responseTime: data.responseTime,
          escalated: data.escalated,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to log AI metrics:', error);
    }
  }

  async getAIMetrics(userId: string): Promise<{
    totalMessages: number;
    avgConfidence: number;
    escalationRate: number;
    avgResponseTime: number;
  }> {
    const metrics = await this.prisma.aiChatMetrics.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    const totalMessages = metrics.length;
    const avgConfidence = metrics.length > 0
      ? Math.round(
          metrics.reduce((sum, m) => sum + (m.confidence || 0), 0) /
            metrics.length
        )
      : 0;

    const escalations = metrics.filter((m) => m.escalated).length;
    const escalationRate = totalMessages > 0
      ? Math.round((escalations / totalMessages) * 100)
      : 0;

    const avgResponseTime = metrics.length > 0
      ? Math.round(
          metrics.reduce((sum, m) => sum + (m.responseTime || 0), 0) /
            metrics.length
        )
      : 0;

    return {
      totalMessages,
      avgConfidence,
      escalationRate,
      avgResponseTime,
    };
  }
}
