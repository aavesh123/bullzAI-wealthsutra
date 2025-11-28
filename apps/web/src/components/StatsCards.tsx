import type { DashboardResponse } from '../lib/api-client';

interface StatsCardsProps {
  dashboard: DashboardResponse;
}

export default function StatsCards(props: StatsCardsProps) {
  const { dashboard } = props;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Income */}
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm font-medium text-gray-600 mb-2">Total Income (7 days)</div>
        <div class="text-2xl font-bold text-green-600">{formatCurrency(dashboard.incomeTotal)}</div>
      </div>

      {/* Total Spend */}
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm font-medium text-gray-600 mb-2">Total Spend (7 days)</div>
        <div class="text-2xl font-bold text-red-600">{formatCurrency(dashboard.spendTotal)}</div>
      </div>

      {/* Projected Shortfall */}
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm font-medium text-gray-600 mb-2">Projected Shortfall</div>
        <div class={`text-2xl font-bold ${dashboard.projectedShortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatCurrency(Math.abs(dashboard.projectedShortfall))}
        </div>
      </div>

      {/* Health Score */}
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm font-medium text-gray-600 mb-2">Health Score</div>
        <div class="flex items-center gap-2">
          <div class={`text-2xl font-bold ${getHealthScoreColor(dashboard.healthScore.score)} px-3 py-1 rounded`}>
            {dashboard.healthScore.score}
          </div>
          <div class="text-sm text-gray-600">{dashboard.healthScore.label}</div>
        </div>
      </div>
    </div>
  );
}

