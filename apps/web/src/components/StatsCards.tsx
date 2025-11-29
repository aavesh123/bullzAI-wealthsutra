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
    if (score >= 70) return 'text-emerald-300 bg-emerald-500/20';
    if (score >= 40) return 'text-amber-300 bg-amber-500/20';
    return 'text-red-300 bg-red-500/20';
  };

  return (
    <Show when={dashboardData()}>
      {(data) => (
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          {/* Total Income (7 days) */}
          <div class="relative overflow-hidden rounded-[18px] px-5 py-4 border border-white/10 bg-gradient-to-br from-[#f97316] via-[#ec4899] to-[#6366f1] shadow-[0_18px_45px_rgba(248,113,113,0.45)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="text-[13px] text-white/80">Total Income (7 days)</div>
            </div>
            <div class="text-[20px] font-semibold text-white">{formatCurrency(data().incomeTotal)}</div>
          </div>

          {/* Projected Monthly Income */}
          <div class="relative overflow-hidden rounded-[18px] px-5 py-4 border border-white/10 bg-gradient-to-br from-[#22c55e] via-[#4ade80] to-[#38bdf8] shadow-[0_18px_45px_rgba(34,197,94,0.35)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="text-[13px] text-white/80">Projected Monthly Income</div>
            </div>
            <div class="text-[20px] font-semibold text-white">
              {formatCurrency((data().incomeTotal / 7) * 30)}
            </div>
          </div>

          {/* Category Spending Total (7 days) */}
          <div class="rounded-[18px] px-5 py-4 border border-white/10 bg-[#020617]/80 shadow-[0_18px_45px_rgba(15,23,42,0.75)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="text-[13px] text-slate-400">Category Spending Total (7 days)</div>
            </div>
            <div class="text-[20px] font-semibold text-slate-50">
              {formatCurrency(data().spendTotal)}
            </div>
          </div>

          {/* Projected Monthly Category Spend */}
          <div class="rounded-[18px] px-5 py-4 border border-white/10 bg-[#020617]/80 shadow-[0_18px_45px_rgba(15,23,42,0.75)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="text-[13px] text-slate-400">Projected Monthly Category Spend</div>
            </div>
            <div class="text-[20px] font-semibold text-slate-50">
              {formatCurrency((data().spendTotal / 7) * 30)}
            </div>
          </div>

          {/* Projected Shortfall (30 days) */}
          <div class="rounded-[18px] px-5 py-4 border border-red-500/50 bg-red-500/10 shadow-[0_18px_45px_rgba(248,113,113,0.65)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="text-[13px] text-red-100/80">Projected Shortfall (30 days)</div>
            </div>
            <div class="text-[20px] font-semibold text-red-100">
              {formatCurrency(Math.abs(data().projectedShortfall))}
            </div>
          </div>

          {/* Monthly Savings (Projected) */}
          <div class="rounded-[18px] px-5 py-4 border border-white/10 bg-[#020617]/80 shadow-[0_18px_45px_rgba(15,23,42,0.75)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="text-[13px] text-slate-400">Monthly Savings (Projected)</div>
            </div>
            <div
              class={`text-[20px] font-semibold ${
                monthlySavings() >= 0 ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {formatCurrency(monthlySavings())}
            </div>
            <div class="text-[11px] text-slate-400 mt-1">
              {monthlySavings() >= 0 ? 'Positive savings' : 'Negative savings (shortfall)'}
            </div>
          </div>

          {/* Wealth Score */}
          <div class="rounded-[18px] px-5 py-4 border border-[#facc15]/60 bg-[#020617]/80 shadow-[0_18px_45px_rgba(250,204,21,0.35)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="text-[13px] text-slate-400">Wealth Score</div>
            </div>
            <div class="flex items-center gap-3">
              <div class={`text-[20px] font-semibold px-3 py-1 rounded-full ${getHealthScoreColor(data().healthScore.score)}`}>
                {data().healthScore.score.toFixed(2)}
              </div>
              <div class="text-[13px] text-slate-200">{data().healthScore.label}</div>
            </div>
          </div>
        </div>
      )}
    </Show>
  );
}

