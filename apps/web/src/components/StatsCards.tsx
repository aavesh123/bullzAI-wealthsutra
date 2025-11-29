import { createMemo, Show } from 'solid-js';
import type { DashboardResponse } from '../lib/api-client';
import type { Accessor } from 'solid-js';

interface StatsCardsProps {
  dashboard: Accessor<DashboardResponse | null>;
}

export default function StatsCards(props: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Use createMemo to make dashboardData reactive
  const dashboardData = createMemo(() => props.dashboard());
  
  // Calculate monthly savings - make it reactive with createMemo
  const monthlySavings = createMemo(() => {
    const data = dashboardData();
    if (!data) return 0;
    const days = 7;
    const avgDailyIncome = data.incomeTotal / days;
    const avgDailySpend = data.spendTotal / days;
    const projectedMonthlyIncome = avgDailyIncome * 30;
    const projectedMonthlySpend = avgDailySpend * 30;
    const fixedMonthlyExpenses = data.emiAmount + data.rentAmount + data.schoolFeesAmount;
    
    return projectedMonthlyIncome - projectedMonthlySpend - fixedMonthlyExpenses;
  });

  const getHealthScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <Show when={dashboardData()}>
      {(data) => (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Income */}
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm font-medium text-gray-600 mb-2">Total Income (7 days)</div>
            <div class="text-2xl font-bold text-green-600">{formatCurrency(data().incomeTotal)}</div>
          </div>
          {/* Projected Monthly Income */}
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm font-medium text-gray-600 mb-2">Projected Monthly Income</div>
            <div class="text-2xl font-bold text-green-600">{formatCurrency((data().incomeTotal/7) * 30)}</div>
          </div>

          {/* Total Spend */}
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm font-medium text-gray-600 mb-2">Category Spending Total (7 days)</div>
            <div class="text-2xl font-bold text-red-600">{formatCurrency(data().spendTotal)}</div>
          </div>
          {/* Projected Monthly Category Spend */}
          <div class="bg-white rounded-lg shadow p-6">        
            <div class="text-sm font-medium text-gray-600 mb-2">Projected Monthly Category Spend</div>
            <div class="text-2xl font-bold text-red-600">{formatCurrency(data().spendTotal/7 * 30)}</div>
          </div>

          {/* Projected Shortfall */}
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm font-medium text-gray-600 mb-2">Projected Shortfall (30 days)</div>
            <div class={`text-2xl font-bold ${data().projectedShortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(Math.abs(data().projectedShortfall))}
            </div>
          </div>

          {/* Monthly Savings */}
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm font-medium text-gray-600 mb-2">Monthly Savings (Projected)</div>
            <div class={`text-2xl font-bold ${monthlySavings() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(monthlySavings())}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {monthlySavings() >= 0 ? 'Positive savings' : 'Negative savings (shortfall)'}
            </div>
          </div>

          {/* Health Score */}
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm font-medium text-gray-600 mb-2">Wealth Score</div>
            <div class="flex items-center gap-2">
              <div class={`text-2xl font-bold ${getHealthScoreColor(data().healthScore.score)} px-3 py-1 rounded`}>
                {data().healthScore.score}
              </div>
              <div class="text-sm text-gray-600">{data().healthScore.label}</div>
            </div>
          </div>
        </div>
      )}
    </Show>
  );
}

