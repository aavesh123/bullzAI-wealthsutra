import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TransactionsService } from '../transactions/transactions.service';
import { ProfilesService } from '../profiles/profiles.service';
import { GoalsService } from '../goals/goals.service';
import { PlansService } from '../plans/plans.service';
import { OpenAIClient } from '../ai/openai.client';
import { ContextBuilder } from './utils/context-builder';
import { AnalystAgent } from './agents/analyst.agent';
import { RiskDetectorAgent } from './agents/risk-detector.agent';
import { PlannerAgent } from './agents/planner.agent';
import { CoachAgent } from './agents/coach.agent';
import { Plan, PlanDocument } from '../../schemas/plan.schema';
import { RiskEvent, RiskEventDocument } from '../../schemas/risk-event.schema';
import { PlanResponseDto } from './dto/agent-output.dto';
import { CreatePlanRequestDto } from './dto/create-plan-request.dto';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private coachAgent: CoachAgent;

  constructor(
    private transactionsService: TransactionsService,
    private profilesService: ProfilesService,
    private goalsService: GoalsService,
    private plansService: PlansService,
    private openAIClient: OpenAIClient,
    @InjectModel(Plan.name) private planModel: Model<PlanDocument>,
    @InjectModel(RiskEvent.name)
    private riskEventModel: Model<RiskEventDocument>,
  ) {
    this.coachAgent = new CoachAgent(openAIClient);
  }

  async generatePlan(
    request: CreatePlanRequestDto,
  ): Promise<PlanResponseDto> {
    this.logger.log(`Generating plan for user: ${request.userId}`);

    // 1. Build context
    const context = await ContextBuilder.buildContext(
      request.userId,
      this.transactionsService,
      this.profilesService,
      this.goalsService,
      this.plansService,
    );

    // 2. Run Analyst Agent
    const analystOutput = AnalystAgent.analyze(context);
    this.logger.debug('Analyst output:', analystOutput);

    // 3. Run Risk Detector Agent
    const riskOutput = RiskDetectorAgent.detectRisk(context, analystOutput);
    this.logger.debug('Risk output:', riskOutput);

    // 4. Run Planner Agent
    const plannerOutput = PlannerAgent.createPlan(
      context,
      analystOutput,
      riskOutput,
    );
    this.logger.debug('Planner output:', plannerOutput);

    // 5. Run Coach Agent (OpenAI)
    const coachOutput = await this.coachAgent.generateMessage(
      context,
      analystOutput,
      riskOutput,
      plannerOutput,
    );
    this.logger.debug('Coach output:', coachOutput);

    // 6. Deactivate existing plans
    await this.plansService.deactivateAll(request.userId);

    // 7. Create new plan
    const plan = await this.plansService.create({
      userId: new Types.ObjectId(request.userId),
      goalId: context.goals.length > 0 ? new Types.ObjectId(context.goals[0]._id) : null,
      startDate: plannerOutput.startDate,
      endDate: plannerOutput.endDate,
      dailySavingTarget: plannerOutput.dailySavingTarget,
      spendingCaps: plannerOutput.spendingCaps,
      status: 'active',
    });

    // 8. Create risk event
    await this.riskEventModel.create({
      userId: new Types.ObjectId(request.userId),
      riskLevel: riskOutput.riskLevel,
      shortfallAmount: riskOutput.shortfallAmount,
      timeframe: riskOutput.timeframe,
    });

    return {
      plan: {
        _id: plan._id,
        userId: plan.userId,
        goalId: plan.goalId,
        startDate: plan.startDate,
        endDate: plan.endDate,
        dailySavingTarget: plan.dailySavingTarget,
        spendingCaps: plan.spendingCaps,
        status: plan.status,
      },
      coach: {
        message: coachOutput.message,
      },
      risk: {
        riskLevel: riskOutput.riskLevel,
        shortfallAmount: riskOutput.shortfallAmount,
        timeframe: riskOutput.timeframe,
      },
    };
  }
}

