import { createSignal } from 'solid-js';
import type { DashboardResponse, PlanResponse } from '../lib/api-client';

export const [dashboard, setDashboard] = createSignal<DashboardResponse | null>(null);
export const [plan, setPlan] = createSignal<PlanResponse | null>(null);
export const [loading, setLoading] = createSignal(false);
export const [error, setError] = createSignal<string | null>(null);

export function clearError() {
  setError(null);
}

