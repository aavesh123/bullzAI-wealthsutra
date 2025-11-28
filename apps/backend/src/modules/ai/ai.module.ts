import { Module } from '@nestjs/common';
import { OpenAIClient } from './openai.client';

@Module({
  providers: [OpenAIClient],
  exports: [OpenAIClient],
})
export class AIModule {}

