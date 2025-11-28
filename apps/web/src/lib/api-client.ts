const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const USER_ID = 'ravi';

export interface TransactionEvent {
  timestamp: string;
  amount: number;
  direction: 'credit' | 'debit';
  channel: string;
  merchant: string;
  category: string;
  source: string;
  rawText: string;
}

export interface DashboardResponse {
  incomeTotal: number;
  spendTotal: number;
  byCategory: Record<string, number>;
  upcomingObligations: Array<{
    type: string;
    amount: number;
    dueDate: string;
  }>;
  projectedShortfall: number;
  healthScore: {
    score: number;
    label: string;
  };
}

export interface PlanResponse {
  plan: {
    planId: string;
    dailySavingTarget: number;
    durationDays: number;
    spendingCaps: Record<string, number>;
    startDate: string;
    endDate: string;
  };
  messages: {
    summary: string;
    riskExplanation: string;
    coachIntro: string;
    nudges: string[];
  };
  riskLevel: 'low' | 'medium' | 'high';
  shortfallAmount: number;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function ingestTransactions(events: TransactionEvent[]): Promise<void> {
  await fetchAPI('/transactions/ingest', {
    method: 'POST',
    body: JSON.stringify({
      userId: USER_ID,
      events,
    }),
  });
}

export async function getDashboard(): Promise<DashboardResponse> {
  return fetchAPI<DashboardResponse>(`/dashboard?userId=${USER_ID}`);
}

export async function createPlan(
  trigger: 'initial_plan' | 'risk_adjustment'
): Promise<PlanResponse> {
  return fetchAPI<PlanResponse>('/agent/plan', {
    method: 'POST',
    body: JSON.stringify({
      userId: USER_ID,
      trigger,
    }),
  });
}

