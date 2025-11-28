import { onMount, Show } from 'solid-js';
import Layout from '../components/Layout';
import StatsCards from '../components/StatsCards';
import PlanCard from '../components/PlanCard';
import CoachCard from '../components/CoachCard';
import SimulationButtons from '../components/SimulationButtons';
import { getDashboard } from '../lib/api-client';
import { dashboard, setDashboard, plan, error, setError, loading, setLoading } from '../store/dashboardStore';

export default function Dashboard() {
  onMount(async () => {
    // Load dashboard data on mount
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
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
                onClick={() => setError(null)}
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
            <StatsCards dashboard={dashboard()!} />

            {/* Category Breakdown */}
            <div class="bg-white rounded-lg shadow p-6 mb-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Spending by Category</h2>
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
    </Layout>
  );
}

