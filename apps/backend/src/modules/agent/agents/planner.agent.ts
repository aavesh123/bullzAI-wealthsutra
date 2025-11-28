import { AgentContext } from '../dto/agent-context.dto';
import { RiskOutput } from './risk-detector.agent';
import { AnalystOutput } from './analyst.agent';

export interface PlannerOutput {
  dailySavingTarget: number;
  spendingCaps: Record<string, number>;
  startDate: Date;
  endDate: Date;
}

export class PlannerAgent {
  static createPlan(
    context: AgentContext,
    analystOutput: AnalystOutput,
    riskOutput: RiskOutput,
  ): PlannerOutput {
    const { last7DaysSummary, profile } = context;

    // Calculate daily saving target
    // Target: cover shortfall + build buffer
    const bufferAmount = 1000; // Monthly buffer
    const totalMonthlyNeed = riskOutput.shortfallAmount + bufferAmount;
    const dailySavingTarget = Math.max(0, totalMonthlyNeed / 30);

    // Set spending caps based on top categories
    const spendingCaps: Record<string, number> = {};
    analystOutput.spendingSummary.topCategories.forEach((cat) => {
      // Reduce by 20% for high risk, 10% for medium
      const reductionFactor =
        riskOutput.riskLevel === 'high' ? 0.8 : riskOutput.riskLevel === 'medium' ? 0.9 : 1.0;
      const monthlySpend = (cat.amount / 7) * 30;
      spendingCaps[cat.category] = monthlySpend * reductionFactor;
    });

    // Plan duration: 30 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    return {
      dailySavingTarget: Math.round(dailySavingTarget),
      spendingCaps,
      startDate,
      endDate,
    };
  }
}

