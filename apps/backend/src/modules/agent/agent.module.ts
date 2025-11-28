import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { TransactionsModule } from '../transactions/transactions.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { GoalsModule } from '../goals/goals.module';
import { PlansModule } from '../plans/plans.module';
import { OpenAIClient } from '../ai/openai.client';
import { Plan, PlanSchema } from '../../schemas/plan.schema';
import { RiskEvent, RiskEventSchema } from '../../schemas/risk-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Plan.name, schema: PlanSchema },
      { name: RiskEvent.name, schema: RiskEventSchema },
    ]),
    TransactionsModule,
    ProfilesModule,
    GoalsModule,
    PlansModule,
  ],
  controllers: [AgentController],
  providers: [AgentService, OpenAIClient],
  exports: [AgentService],
})
export class AgentModule {}

