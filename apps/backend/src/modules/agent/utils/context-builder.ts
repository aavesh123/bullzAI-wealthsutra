import { AgentContext } from '../dto/agent-context.dto';
import { TransactionsService } from '../../transactions/transactions.service';
import { ProfilesService } from '../../profiles/profiles.service';
import { GoalsService } from '../../goals/goals.service';
import { PlansService } from '../../plans/plans.service';

export class ContextBuilder {
  static async buildContext(
    userId: string,
    transactionsService: TransactionsService,
    profilesService: ProfilesService,
    goalsService: GoalsService,
    plansService: PlansService,
  ): Promise<AgentContext> {
    // Get profile
    const profile = await profilesService.findByUserId(userId);

    // Get recent transactions (last 7 days)
    const transactions = await transactionsService.getRecentTransactions(
      userId,
      7,
    );

    // Calculate summary
    let incomeTotal = 0;
    let spendTotal = 0;
    const categoryMap = new Map<string, number>();

    transactions.forEach((t) => {
      if (t.direction === 'credit') {
        incomeTotal += t.amount;
      } else {
        spendTotal += t.amount;
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      }
    });

    const categories = Array.from(categoryMap.entries()).map(
      ([category, amount]) => ({ category, amount }),
    );

    // Get goals
    const goals = await goalsService.findByUserId(userId);

    // Get existing plan
    const existingPlan = await plansService.findActiveByUserId(userId);

    // Calculate 7-day averages
    const days = 7;
    const avgDailyIncome = incomeTotal / days;
    const avgDailySpend = spendTotal / days;

    // Projected shortfall
    const fixedExpenses =
      (profile?.fixedExpenses?.rentAmount || 0) +
      (profile?.fixedExpenses?.emiAmount || 0);
    const projectedMonthlySpend = avgDailySpend * 30;
    const projectedMonthlyIncome = avgDailyIncome * 30;
    const projectedShortfall = Math.max(
      0,
      projectedMonthlySpend + fixedExpenses - projectedMonthlyIncome,
    );

    return {
      userId,
      profile: {
        incomeMinPerDay: profile?.incomeMinPerDay || 0,
        incomeMaxPerDay: profile?.incomeMaxPerDay || 0,
        workDaysPerWeek: profile?.workDaysPerWeek || 0,
        fixedExpenses: {
          rentAmount: profile?.fixedExpenses?.rentAmount || 0,
          emiAmount: profile?.fixedExpenses?.emiAmount || 0,
          schoolFeesAmount: profile?.fixedExpenses?.schoolFeesAmount || 0,
        },
      },
      recentTransactions: {
        incomeTotal,
        spendTotal,
        categories,
      },
      goals: goals.map((g) => ({
        _id: g._id,
        type: g.type,
        targetAmount: g.targetAmount,
        targetDate: g.targetDate,
      })),
      existingPlan: existingPlan
        ? {
            dailySavingTarget: existingPlan.dailySavingTarget,
            spendingCaps: existingPlan.spendingCaps,
          }
        : null,
      last7DaysSummary: {
        avgDailyIncome,
        avgDailySpend,
        projectedShortfall,
      },
    };
  }
}

