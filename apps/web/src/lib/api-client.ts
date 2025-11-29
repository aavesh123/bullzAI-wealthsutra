const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Get current user ID from store
function getUserId(): string {
  // Try to get from localStorage first (for SSR compatibility)
  const stored = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
  if (stored) {
    try {
      const user = JSON.parse(stored);
      return user.userId;
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
  }
  throw new Error('No user selected. Please select a user first.');
}

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

export interface UserResponse {
  userId: string;
  phoneNumber: string;
  personaType: 'gig_worker' | 'daily_wage';
  createdAt: string;
  updatedAt: string;
}

export async function createOrGetUser(phoneNumber: string, personaType: 'gig_worker' | 'daily_wage'): Promise<UserResponse> {
  return fetchAPI<UserResponse>('/users', {
    method: 'POST',
    body: JSON.stringify({
      phoneNumber,
      personaType,
    }),
  });
}

export async function ingestTransactions(events: TransactionEvent[]): Promise<void> {
  await fetchAPI('/transactions/ingest', {
    method: 'POST',
    body: JSON.stringify({
      userId: getUserId(),
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

  const backendData = await fetchAPI<BackendDashboardResponse>(`/dashboard?userId=${getUserId()}`);

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
      summary: string;
      riskExplanation: string;
      coachIntro: string;
      nudges: string[];
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
        userId: getUserId(),
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

  // Get top categories from spending caps for fallback nudges
  const topCategories = Object.keys(spendingCaps);
  const topCategory1 = topCategories[0];
  const topCategory2 = topCategories[1];
  const topCategory3 = topCategories[2];

  // Build fallback nudges with specific category names
  const buildFallbackNudges = (): string[] => {
    const nudges: string[] = [
      `Save ₹${backendResponse.plan.dailySavingTarget || 0} daily to meet your goals`,
    ];
    
    if (topCategory1) {
      const cap1 = spendingCaps[topCategory1];
      nudges.push(`Keep ${topCategory1} spending under ₹${cap1.toLocaleString('en-IN')}/month`);
    }
    
    if (topCategory2) {
      const cap2 = spendingCaps[topCategory2];
      nudges.push(`Monitor ${topCategory2} expenses (limit: ₹${cap2.toLocaleString('en-IN')}/month)`);
    } else if (topCategory3) {
      const cap3 = spendingCaps[topCategory3];
      nudges.push(`Track ${topCategory3} spending (limit: ₹${cap3.toLocaleString('en-IN')}/month)`);
    } else {
      nudges.push(`Review your spending patterns weekly`);
    }
    
    return nudges;
  };

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
      summary: backendResponse.coach?.summary || `Your financial plan has been created. Daily saving target is ₹${backendResponse.plan.dailySavingTarget || 0}.`,
      riskExplanation: backendResponse.coach?.riskExplanation || `Your risk level is ${backendResponse.risk?.riskLevel || 'unknown'}. Projected shortfall: ₹${(backendResponse.risk?.shortfallAmount || 0).toLocaleString('en-IN')} in the ${backendResponse.risk?.timeframe || 'upcoming period'}.`,
      coachIntro: backendResponse.coach?.coachIntro || backendResponse.coach?.message || 'No message available.',
      nudges: backendResponse.coach?.nudges || buildFallbackNudges(),
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
  const transactions = await fetchAPI<Transaction[]>(`/transactions?userId=${getUserId()}${limitParam}`);
  
  // Ensure timestamp is properly formatted
  return transactions.map(t => ({
    ...t,
    timestamp: typeof t.timestamp === 'string' ? t.timestamp : new Date(t.timestamp).toISOString(),
  }));
}

