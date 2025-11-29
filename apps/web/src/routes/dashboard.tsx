import { onMount, Show, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import Layout from '../components/Layout';
import StatsCards from '../components/StatsCards';
import PlanCard from '../components/PlanCard';
import CoachCard from '../components/CoachCard';
import SimulationButtons from '../components/SimulationButtons';
import TransactionsModal from '../components/TransactionsModal';
import { dashboard, plan, error, loading, handleDashboardRefresh, clearError } from '../store/dashboardStore';
import { loadUserFromStorage } from '../store/userStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = createSignal(false);

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
      <div class="space-y-6">
        {/* Error Message */}
        <Show when={error()}>
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center gap-2">
              <span class="text-red-600">⚠️</span>
              <span class="text-red-800 font-medium">{error()}</span>
              <button
                onClick={() => clearError()}
                class="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        </Show>

        {/* Loading State */}
        <Show when={loading() && !dashboard()}>
          <div class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p class="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </Show>

        {/* Simulation Buttons */}
        <SimulationButtons />

        {/* Dashboard Content */}
        <Show when={dashboard()}>
          <div>
            <StatsCards dashboard={dashboard} />

            {/* Fixed Expenses */}
            <div class="bg-white rounded-lg shadow p-6 mb-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-900">Fixed Monthly Expenses</h2>
                <div class="text-lg font-bold text-gray-900">
                  Total: ₹{(dashboard()!.rentAmount + dashboard()!.emiAmount + dashboard()!.schoolFeesAmount).toLocaleString('en-IN')}
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dashboard()!.rentAmount > 0 && (
                  <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div class="text-sm font-medium text-blue-700 mb-1">Rent</div>
                    <div class="text-xl font-bold text-blue-900">
                      ₹{dashboard()!.rentAmount.toLocaleString('en-IN')}/month
                    </div>
                  </div>
                )}
                {dashboard()!.emiAmount > 0 && (
                  <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div class="text-sm font-medium text-purple-700 mb-1">EMI</div>
                    <div class="text-xl font-bold text-purple-900">
                      ₹{dashboard()!.emiAmount.toLocaleString('en-IN')}/month
                    </div>
                  </div>
                )}
                {dashboard()!.schoolFeesAmount > 0 && (
                  <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div class="text-sm font-medium text-green-700 mb-1">School Fees</div>
                    <div class="text-xl font-bold text-green-900">
                      ₹{dashboard()!.schoolFeesAmount.toLocaleString('en-IN')}/month
                    </div>
                  </div>
                )}
                {(dashboard()!.rentAmount === 0 && dashboard()!.emiAmount === 0 && dashboard()!.schoolFeesAmount === 0) && (
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="text-sm text-gray-600">No fixed expenses recorded</div>
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown */}
            <div class="bg-white rounded-lg shadow p-6 mb-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <h2 class="text-xl font-semibold text-gray-900">Spending by Category</h2>
                  {/* View All Button */}
                  <button
                    onClick={() => setIsTransactionsModalOpen(true)}
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    View All
                  </button>
                </div>
                <div class="text-lg font-bold text-gray-900">
                  Total: ₹{Object.values(dashboard()!.byCategory).reduce((sum, amount) => sum + amount, 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(dashboard()!.byCategory).map(([category, amount]) => (
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="text-sm text-gray-600 capitalize mb-1">{category}</div>
                    <div class="text-lg font-semibold text-gray-900">
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
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PlanCard plan={plan()!} />
            <CoachCard plan={plan()!} />
          </div>
        </Show>

        {/* Empty State */}
        <Show when={!loading() && !dashboard() && !error()}>
          <div class="text-center py-12 bg-white rounded-lg shadow">
            <p class="text-gray-600 mb-4">No data available yet.</p>
            <p class="text-sm text-gray-500">Click "Simulate last 7 days" to get started.</p>
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

