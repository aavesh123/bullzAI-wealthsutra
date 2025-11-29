import type { PlanResponse } from '../lib/api-client';

interface PlanCardProps {
  plan: PlanResponse | null;
}

export default function PlanCard(props: PlanCardProps) {
  const { plan } = props;

  if (!plan) {
    return (
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Your Plan</h2>
        <p class="text-gray-500">No plan generated yet. Click "Build my plan" to get started.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-emerald-300 bg-emerald-500/20';
      case 'medium':
        return 'text-amber-300 bg-amber-500/20';
      case 'high':
        return 'text-red-300 bg-red-500/20';
      default:
        return 'text-slate-300 bg-slate-500/20';
    }
  };

  return (
    <div class="bg-[#020617]/80 border border-white/10 rounded-2xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.75)]">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-[18px] font-semibold text-slate-50">Your Plan</h2>
        <span class={`px-3 py-1 rounded-full text-[12px] font-semibold ${getRiskColor(plan.riskLevel)}`}>
          {plan.riskLevel.toUpperCase()} RISK
        </span>
      </div>

      <div class="space-y-6">
        {/* Daily Saving Target */}
        <div class="border-l-4 border-[#f97316] pl-4">
          <div class="text-[13px] text-slate-400 mb-1">Daily Saving Target</div>
          <div class="text-[22px] font-semibold text-slate-50">
            {formatCurrency(plan.plan.dailySavingTarget)}
          </div>
        </div>

        {/* Duration */}
        <div>
          <div class="text-[13px] text-slate-400 mb-1">Duration</div>
          <div class="text-[16px] font-semibold text-slate-50">
            {plan.plan.durationDays} days ({formatDate(plan.plan.startDate)} - {formatDate(plan.plan.endDate)})
          </div>
        </div>

        {/* Spending Caps */}
        {Object.keys(plan.plan.spendingCaps).length > 0 && (
          <div>
            <div class="text-[13px] text-slate-400 mb-2">Spending Caps (per day)</div>
            <div class="grid grid-cols-2 gap-4">
              {Object.entries(plan.plan.spendingCaps).map(([category, cap]) => (
                <div class="bg-white/5 border border-white/10 rounded-[12px] p-4">
                  <div class="text-[13px] text-slate-400 capitalize mb-1">{category}</div>
                  <div class="text-[16px] font-semibold text-slate-50">
                    {formatCurrency(cap)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shortfall Amount */}
        {plan.shortfallAmount > 0 && (
          <div class="bg-red-500/10 border border-red-500/60 rounded-xl p-4">
            <div class="text-[13px] text-red-100 font-semibold mb-1">Shortfall Amount</div>
            <div class="text-[18px] font-semibold text-red-100">
              {formatCurrency(plan.shortfallAmount)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

