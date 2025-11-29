import { createSignal } from 'solid-js';
import type { DashboardResponse, PlanResponse } from '../lib/api-client';
import { getDashboard } from '../lib/api-client';

export const [dashboard, setDashboard] = createSignal<DashboardResponse | null>(null);
export const [plan, setPlan] = createSignal<PlanResponse | null>(null);
export const [loading, setLoading] = createSignal(false);
export const [error, setError] = createSignal<string | null>(null);

export function clearError() {
  setError(null);
}

export async function handleDashboardRefresh() {
  setLoading(true);
  setError(null);
  try {
    const data = await getDashboard();
    // Directly set the new data - SolidJS signals will trigger reactivity
    // Create a new object to ensure reference change is detected
    setDashboard({
      incomeTotal: data.incomeTotal,
      spendTotal: data.spendTotal,
      byCategory: { ...data.byCategory },
      emiAmount: data.emiAmount,
      rentAmount: data.rentAmount,
      schoolFeesAmount: data.schoolFeesAmount,
      projectedShortfall: data.projectedShortfall,
      healthScore: { ...data.healthScore },
    });
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    console.error('Error loading dashboard:', err);
  } finally {
    setLoading(false);
  }
}

