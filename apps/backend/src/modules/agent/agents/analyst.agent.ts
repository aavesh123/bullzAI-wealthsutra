import { AgentContext } from '../dto/agent-context.dto';

export interface AnalystOutput {
  incomeSummary: {
    total: number;
    avgDaily: number;
    volatility: 'low' | 'medium' | 'high';
  };
  spendingSummary: {
    total: number;
    avgDaily: number;
    topCategories: Array<{ category: string; amount: number }>;
  };
  savingsRate: number;
  insights: string[];
}

export class AnalystAgent {
  static analyze(context: AgentContext): AnalystOutput {
    const { recentTransactions, last7DaysSummary } = context;

    // Calculate volatility (simple: based on income range)
    const incomeRange =
      context.profile.incomeMaxPerDay - context.profile.incomeMinPerDay;
    const avgIncome = context.profile.incomeMinPerDay + incomeRange / 2;
    const volatility =
      incomeRange / avgIncome > 0.5
        ? 'high'
        : incomeRange / avgIncome > 0.2
        ? 'medium'
        : 'low';

    // Top categories
    const topCategories = recentTransactions.categories
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    // Savings rate
    const savingsRate =
      recentTransactions.incomeTotal > 0
        ? (recentTransactions.incomeTotal - recentTransactions.spendTotal) /
          recentTransactions.incomeTotal
        : 0;

    // Generate insights
    const insights: string[] = [];
    if (savingsRate < 0) {
      insights.push('Spending exceeds income. Immediate action needed.');
    } else if (savingsRate < 0.1) {
      insights.push('Low savings rate. Consider reducing discretionary spending.');
    } else if (savingsRate > 0.2) {
      insights.push('Good savings rate. Keep up the discipline!');
    }

    if (volatility === 'high') {
      insights.push('High income volatility detected. Build emergency buffer.');
    }

    return {
      incomeSummary: {
        total: recentTransactions.incomeTotal,
        avgDaily: last7DaysSummary.avgDailyIncome,
        volatility,
      },
      spendingSummary: {
        total: recentTransactions.spendTotal,
        avgDaily: last7DaysSummary.avgDailySpend,
        topCategories,
      },
      savingsRate,
      insights,
    };
  }
}

