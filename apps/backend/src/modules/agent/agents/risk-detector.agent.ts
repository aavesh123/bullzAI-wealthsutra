import { AgentContext } from '../dto/agent-context.dto';
import { AnalystOutput } from './analyst.agent';

export interface RiskOutput {
  riskLevel: 'low' | 'medium' | 'high';
  shortfallAmount: number;
  timeframe: string;
  reasons: string[];
}

export class RiskDetectorAgent {
  static detectRisk(
    context: AgentContext,
    analystOutput: AnalystOutput,
  ): RiskOutput {
    const { last7DaysSummary, profile } = context;
    const { projectedShortfall } = last7DaysSummary;

    const fixedExpenses =
      profile.fixedExpenses.rentAmount + profile.fixedExpenses.emiAmount;

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const reasons: string[] = [];

    // Check shortfall
    if (projectedShortfall > 5000) {
      riskLevel = 'high';
      reasons.push(`Projected monthly shortfall of ₹${projectedShortfall.toFixed(0)}`);
    } else if (projectedShortfall > 2000) {
      riskLevel = 'medium';
      reasons.push(`Projected monthly shortfall of ₹${projectedShortfall.toFixed(0)}`);
    }

    // Check savings rate
    if (analystOutput.savingsRate < 0) {
      riskLevel = 'high';
      reasons.push('Negative savings rate');
    } else if (analystOutput.savingsRate < 0.05) {
      if (riskLevel === 'low') riskLevel = 'medium';
      reasons.push('Very low savings rate');
    }

    // Check fixed expenses vs income
    const monthlyIncome = last7DaysSummary.avgDailyIncome * 30;
    if (fixedExpenses > monthlyIncome * 0.5) {
      if (riskLevel !== 'high') riskLevel = 'medium';
      reasons.push('Fixed expenses exceed 50% of projected income');
    }

    // Check volatility
    if (analystOutput.incomeSummary.volatility === 'high') {
      if (riskLevel === 'low') riskLevel = 'medium';
      reasons.push('High income volatility');
    }

    return {
      riskLevel,
      shortfallAmount: projectedShortfall,
      timeframe: '30 days',
      reasons,
    };
  }
}

