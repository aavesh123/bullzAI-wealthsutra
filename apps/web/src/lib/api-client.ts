const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const USER_ID = '692a5764cde700e6dbd58ebb';

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
  emiAmount: number;
  rentAmount: number;
  schoolFeesAmount: number;
  projectedShortfall: number;
  healthScore: {
    score: number;
    label: string;
    context?: string;
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

export interface Transaction {
  _id: string;
  userId: string;
  timestamp: string | Date;
  amount: number;
  direction: 'credit' | 'debit';
  channel: string;
  merchant: string;
  category: string;
  source: string;
  rawText: string;
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
  interface BackendDashboardResponse {
    incomeTotal: number;
    spendTotal: number;
    categories: Array<{ category: string; amount: number }>;
    emiAmount: number;
    rentAmount: number;
    schoolFeesAmount: number;
    projectedShortfall: number;
    healthScore: {
      score: number;
      label: string;
      context: string;
    };
  }

  const backendData = await fetchAPI<BackendDashboardResponse>(`/dashboard?userId=${USER_ID}`);

  const byCategory = backendData.categories.reduce<Record<string, number>>((acc, item) => {
    if (!item.category) {
      return acc;
    }
    acc[item.category] = item.amount;
    return acc;
  }, {});

  return {
    incomeTotal: backendData.incomeTotal,
    spendTotal: backendData.spendTotal,
    byCategory,
    emiAmount: backendData.emiAmount,
    rentAmount: backendData.rentAmount,
    schoolFeesAmount: backendData.schoolFeesAmount,
    projectedShortfall: backendData.projectedShortfall,
    healthScore: backendData.healthScore,
  };
}

export async function createPlan(
  trigger: 'initial_plan' | 'risk_adjustment'
): Promise<PlanResponse> {
  // Backend response structure
  interface BackendPlanResponse {
    plan: {
      _id: string;
      userId: string;
      goalId: string | null;
      startDate: string | Date;
      endDate: string | Date;
      dailySavingTarget: number;
      spendingCaps: Record<string, number>;
      status: string;
    };
    coach: {
      message: string;
    };
    risk: {
      riskLevel: 'low' | 'medium' | 'high';
      shortfallAmount: number;
      timeframe: string;
    };
  }

  try {
    const backendResponse = await fetchAPI<BackendPlanResponse>('/agent/plan', {
      method: 'POST',
      body: JSON.stringify({
        userId: USER_ID,
        trigger,
      }),
    });

    // Transform backend response to frontend format
  // Handle dates - they might be strings or Date objects
  let startDate: string;
  let endDate: string;
  
  if (typeof backendResponse.plan.startDate === 'string') {
    startDate = backendResponse.plan.startDate;
  } else if (backendResponse.plan.startDate instanceof Date) {
    startDate = backendResponse.plan.startDate.toISOString();
  } else {
    startDate = new Date(backendResponse.plan.startDate).toISOString();
  }

  if (typeof backendResponse.plan.endDate === 'string') {
    endDate = backendResponse.plan.endDate;
  } else if (backendResponse.plan.endDate instanceof Date) {
    endDate = backendResponse.plan.endDate.toISOString();
  } else {
    endDate = new Date(backendResponse.plan.endDate).toISOString();
  }
  
  // Calculate duration in days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  // Ensure IDs are strings
  const planId = typeof backendResponse.plan._id === 'string' 
    ? backendResponse.plan._id 
    : String(backendResponse.plan._id);

  // Ensure spending caps is an object
  const spendingCaps = backendResponse.plan.spendingCaps || {};

  // Transform to frontend format
  const transformedPlan = {
    plan: {
      planId,
      dailySavingTarget: backendResponse.plan.dailySavingTarget || 0,
      durationDays,
      spendingCaps,
      startDate,
      endDate,
    },
    messages: {
      summary: `Your financial plan has been created. Daily saving target is ₹${backendResponse.plan.dailySavingTarget || 0}.`,
      riskExplanation: `Your risk level is ${backendResponse.risk?.riskLevel || 'unknown'}. Projected shortfall: ₹${(backendResponse.risk?.shortfallAmount || 0).toLocaleString('en-IN')} in the ${backendResponse.risk?.timeframe || 'upcoming period'}.`,
      coachIntro: backendResponse.coach?.message || 'No message available.',
      nudges: [
        `Save ₹${backendResponse.plan.dailySavingTarget || 0} daily`,
        `Monitor spending in top categories`,
        `Track progress weekly`,
      ],
    },
    riskLevel: backendResponse.risk?.riskLevel || 'low',
    shortfallAmount: backendResponse.risk?.shortfallAmount || 0,
  };

    return transformedPlan;
  } catch (error) {
    console.error('Error in createPlan:', error);
    throw error;
  }
}

export async function getTransactions(limit?: number): Promise<Transaction[]> {
  const limitParam = limit ? `&limit=${limit}` : '';
  const transactions = await fetchAPI<Transaction[]>(`/transactions?userId=${USER_ID}${limitParam}`);
  
  // Ensure timestamp is properly formatted
  return transactions.map(t => ({
    ...t,
    timestamp: typeof t.timestamp === 'string' ? t.timestamp : new Date(t.timestamp).toISOString(),
  }));
}

