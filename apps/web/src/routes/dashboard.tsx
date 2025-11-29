import { onMount, Show, createSignal, createMemo } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import Layout from '../components/Layout';
import StatsCards from '../components/StatsCards';
import PlanCard from '../components/PlanCard';
import CoachCard from '../components/CoachCard';
import SimulationButtons from '../components/SimulationButtons';
import TransactionsModal from '../components/TransactionsModal';
import { dashboard, plan, error, loading, handleDashboardRefresh, clearError } from '../store/dashboardStore';
import { currentUser, loadUserFromStorage } from '../store/userStore';
import { currentTheme } from '../store/themeStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = createSignal(false);
  const theme = createMemo(() => currentTheme());

  const today = createMemo(
    () =>
      new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
  );

  onMount(async () => {
    // Load user from storage if available
    const user = loadUserFromStorage();
    if (!user) {
      // No user selected, redirect to home
      navigate('/');
      return;
    }

    // Load dashboard data on mount
    handleDashboardRefresh();
  });

  return (
    <Layout>
      <div class="space-y-8">
        {/* Top hero + actions */}
        <section class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p
              class="text-xs uppercase tracking-[0.2em]"
              classList={{
                'text-slate-500': theme() === 'dark',
                'text-gray-500': theme() === 'light',
              }}
            >
              Overview
            </p>
            <h1
              class="mt-2 text-2xl font-semibold"
              classList={{
                'text-slate-50': theme() === 'dark',
                'text-gray-900': theme() === 'light',
              }}
            >
              Hello, {currentUser()?.name ?? 'there'}
            </h1>
            <p
              class="mt-1 text-sm"
              classList={{
                'text-slate-400': theme() === 'dark',
                'text-gray-600': theme() === 'light',
              }}
            >
              {today()}
            </p>
          </div>
          <div class="w-full lg:w-auto lg:justify-end flex">
            <SimulationButtons />
          </div>
        </section>

        {/* Error Message */}
        <Show when={error()}>
          <div class="bg-red-500/10 border border-red-500/50 rounded-xl p-6">
            <div class="flex items-center gap-2">
              <span class="text-red-300">⚠️</span>
              <span class="text-red-100 font-semibold text-[14px]">{error()}</span>
              <button
                onClick={() => clearError()}
                class="ml-auto text-red-300 hover:text-red-100"
              >
                ✕
              </button>
            </div>
          </div>
        </Show>

        {/* Loading State */}
        <Show when={loading() && !dashboard()}>
          <div class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316]"></div>
            <p class="mt-4 text-slate-400 text-[14px]">Loading dashboard...</p>
          </div>
        </Show>

        {/* Dashboard Content */}
        <Show when={dashboard()}>
          <div class="space-y-8">
            <StatsCards dashboard={dashboard} />

            {/* Fixed Expenses */}
            <div class="mt-4 border border-slate-800 rounded-2xl p-6 bg-slate-950/80 shadow-[0_18px_45px_rgba(15,23,42,0.85)]">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-[18px] font-semibold text-slate-50">Fixed Monthly Expenses</h2>
                <span class="text-[16px] font-semibold text-slate-100">
                  Total: ₹
                  {(
                    dashboard()!.rentAmount +
                    dashboard()!.emiAmount +
                    dashboard()!.schoolFeesAmount
                  ).toLocaleString('en-IN')}
                </span>
              </div>
              <div class="grid grid-cols-3 gap-4">
                {dashboard()!.rentAmount > 0 && (
                  <div class="bg-slate-900/80 border border-slate-700 rounded-[12px] p-4">
                    <div class="text-[13px] text-slate-400 mb-1">Rent</div>
                    <div class="text-[16px] font-semibold text-slate-50">
                      ₹{dashboard()!.rentAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
                {dashboard()!.emiAmount > 0 && (
                  <div class="bg-slate-900/80 border border-slate-700 rounded-[12px] p-4">
                    <div class="text-[13px] text-slate-400 mb-1">EMI</div>
                    <div class="text-[16px] font-semibold text-slate-50">
                      ₹{dashboard()!.emiAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
                {dashboard()!.schoolFeesAmount > 0 && (
                  <div class="bg-slate-900/80 border border-slate-700 rounded-[12px] p-4">
                    <div class="text-[13px] text-slate-400 mb-1">School Fees</div>
                    <div class="text-[16px] font-semibold text-slate-50">
                      ₹{dashboard()!.schoolFeesAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
                {dashboard()!.rentAmount === 0 &&
                  dashboard()!.emiAmount === 0 &&
                  dashboard()!.schoolFeesAmount === 0 && (
                    <div class="bg-slate-900/80 border border-slate-700 rounded-[12px] p-4 col-span-3">
                      <div class="text-[13px] text-slate-400">No fixed expenses recorded</div>
                    </div>
                  )}
              </div>
            </div>

            {/* Category Breakdown */}
            <div class="mt-4 border border-slate-800 rounded-2xl p-6 bg-slate-950/80 shadow-[0_18px_45px_rgba(15,23,42,0.85)]">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <h2 class="text-[18px] font-semibold text-slate-50">Spending by Category</h2>
                  {/* View All Button */}
                  <button
                    onClick={() => setIsTransactionsModalOpen(true)}
                    class="px-4 py-2 bg-white/10 text-slate-100 rounded-lg hover:bg-white/20 transition-colors text-[13px] font-medium flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    View All
                  </button>
                </div>
                <span class="text-[16px] font-semibold text-slate-100">
                  Total: ₹
                  {Object.values(dashboard()!.byCategory)
                    .reduce((sum, amount) => sum + amount, 0)
                    .toLocaleString('en-IN')}
                </span>
              </div>
              <div class="grid grid-cols-3 gap-4">
                {Object.entries(dashboard()!.byCategory).map(([category, amount]) => (
                  <div class="bg-slate-900/80 border border-slate-700 rounded-[12px] p-4">
                    <div class="text-[13px] text-slate-400 capitalize mb-1">{category}</div>
                    <div class="text-[16px] font-semibold text-slate-50">
                      ₹{amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Show>

        {/* Plan and Coach - Always show when plan exists */}
        <Show when={plan()}>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <PlanCard plan={plan()!} />
            <CoachCard plan={plan()!} />
          </div>
        </Show>

        {/* Empty State */}
        <Show when={!loading() && !dashboard() && !error()}>
          <div class="text-center py-12 bg-white/5 rounded-xl shadow-[0_18px_45px_rgba(15,23,42,0.65)] border border-white/10">
            <p class="text-slate-300 mb-4 text-[14px]">No data available yet.</p>
            <p class="text-[13px] text-slate-400">
              Click &quot;Simulate last 7 days&quot; to get started.
            </p>
          </div>
        </Show>
      </div>

      {/* Transactions Modal */}
      <TransactionsModal
        isOpen={isTransactionsModalOpen()}
        onClose={() => setIsTransactionsModalOpen(false)}
      />
    </Layout>
  );
}

