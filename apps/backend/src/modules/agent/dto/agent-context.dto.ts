export interface AgentContext {
  userId: string;
  profile: {
    incomeMinPerDay: number;
    incomeMaxPerDay: number;
    workDaysPerWeek: number;
    fixedExpenses: {
      rentAmount: number;
      emiAmount: number;
      schoolFeesAmount: number;
    };
  };
  recentTransactions: {
    incomeTotal: number;
    spendTotal: number;
    categories: Array<{ category: string; amount: number }>;
  };
  goals: Array<{
    _id: string;
    type: string;
    targetAmount: number;
    targetDate: Date;
  }>;
  existingPlan: {
    dailySavingTarget: number;
    spendingCaps: Record<string, number>;
  } | null;
  last7DaysSummary: {
    avgDailyIncome: number;
    avgDailySpend: number;
    projectedShortfall: number;
  };
}

