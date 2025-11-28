import { OpenAIClient } from '../../ai/openai.client';
import { AgentContext } from '../dto/agent-context.dto';
import { AnalystOutput } from './analyst.agent';
import { RiskOutput } from './risk-detector.agent';
import { PlannerOutput } from './planner.agent';

export interface CoachOutput {
  message: string;
}

export class CoachAgent {
  constructor(private openAIClient: OpenAIClient) {}

  async generateMessage(
    context: AgentContext,
    analystOutput: AnalystOutput,
    riskOutput: RiskOutput,
    plannerOutput: PlannerOutput,
  ): Promise<CoachOutput> {
    // Build context string for OpenAI
    const contextString = this.buildContextString(
      context,
      analystOutput,
      riskOutput,
      plannerOutput,
    );

    const message = await this.openAIClient.generateCoachMessage(contextString);

    return { message };
  }

  private buildContextString(
    context: AgentContext,
    analystOutput: AnalystOutput,
    riskOutput: RiskOutput,
    plannerOutput: PlannerOutput,
  ): string {
    return `User financial situation:
- Income: ₹${analystOutput.incomeSummary.avgDaily.toFixed(0)}/day average
- Spending: ₹${analystOutput.spendingSummary.avgDaily.toFixed(0)}/day average
- Savings rate: ${(analystOutput.savingsRate * 100).toFixed(1)}%
- Risk level: ${riskOutput.riskLevel}
- Projected shortfall: ₹${riskOutput.shortfallAmount.toFixed(0)}/month
- Top spending categories: ${analystOutput.spendingSummary.topCategories.map(c => c.category).join(', ')}
- New daily saving target: ₹${plannerOutput.dailySavingTarget}
- Fixed expenses: Rent ₹${context.profile.fixedExpenses.rentAmount}, EMI ₹${context.profile.fixedExpenses.emiAmount}

Provide encouraging, practical advice to help the user meet their saving target and manage their finances better.`;
  }
}

