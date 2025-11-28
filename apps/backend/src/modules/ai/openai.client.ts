import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIClient {
  private readonly logger = new Logger(OpenAIClient.name);
  private client: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not set. OpenAI features will be disabled.');
    } else {
      this.client = new OpenAI({ apiKey });
      this.logger.log(`OpenAI client initialized with model: ${model}`);
    }
  }

  async generateCoachMessage(context: string): Promise<string> {
    if (!this.client) {
      return 'Financial planning guidance is currently unavailable. Please check your configuration.';
    }

    try {
      const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
      
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a friendly financial coach for irregular-income workers in India.
            Provide simple, encouraging advice in plain language.
            Focus on practical tips for saving money and managing expenses.
            Keep responses concise (2-3 sentences).
            Never suggest specific investment schemes or products.
            Output only the message text, no JSON or formatting.`,
          },
          {
            role: 'user',
            content: context,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      const message = response.choices[0]?.message?.content?.trim();
      return message || 'Unable to generate guidance at this time.';
    } catch (error) {
      this.logger.error('OpenAI API error:', error);
      return 'I encountered an issue generating guidance. Please try again later.';
    }
  }

  async generateStructuredResponse<T>(
    prompt: string,
    systemPrompt: string,
  ): Promise<T | null> {
    if (!this.client) {
      return null;
    }

    try {
      const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
      
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      return JSON.parse(content) as T;
    } catch (error) {
      this.logger.error('OpenAI structured response error:', error);
      return null;
    }
  }
}

