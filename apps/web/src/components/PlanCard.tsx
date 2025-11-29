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
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Your Plan</h2>
        <span class={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(plan.riskLevel)}`}>
          {plan.riskLevel.toUpperCase()} RISK
        </span>
      </div>

      <div class="space-y-4">
        {/* Daily Saving Target */}
        <div class="border-l-4 border-primary-500 pl-4">
          <div class="text-sm text-gray-600">Daily Saving Target</div>
          <div class="text-2xl font-bold text-primary-600">{formatCurrency(plan.plan.dailySavingTarget)}</div>
        </div>

        {/* Duration */}
        <div>
          <div class="text-sm text-gray-600 mb-1">Duration</div>
          <div class="text-lg font-medium text-gray-900">
            {plan.plan.durationDays} days ({formatDate(plan.plan.startDate)} - {formatDate(plan.plan.endDate)})
          </div>
        </div>

        {/* Spending Caps */}
        {Object.keys(plan.plan.spendingCaps).length > 0 && (
          <div>
            <div class="text-sm text-gray-600 mb-2">Spending Caps (per day)</div>
            <div class="grid grid-cols-2 gap-2">
              {Object.entries(plan.plan.spendingCaps).map(([category, cap]) => (
                <div class="bg-gray-50 rounded p-2">
                  <div class="text-xs text-gray-500 capitalize">{category}</div>
                  <div class="text-sm font-semibold text-gray-900">{formatCurrency(cap)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shortfall Amount */}
        {plan.shortfallAmount > 0 && (
          <div class="bg-red-50 border border-red-200 rounded p-3">
            <div class="text-sm text-red-600 font-medium">Shortfall Amount</div>
            <div class="text-lg font-bold text-red-700">{formatCurrency(plan.shortfallAmount)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

