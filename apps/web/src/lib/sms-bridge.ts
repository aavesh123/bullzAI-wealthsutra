import { ingestTransactions, getDashboard, createPlan } from './api-client';
import type { TransactionEvent } from './api-client';

// Declare AndroidInterface type for TypeScript
declare global {
  interface Window {
    AndroidInterface?: {
      requestSimulation: (type: string) => void;
    };
    handleSmsEvents: (payload: TransactionEvent[] | { events: TransactionEvent[] }) => void;
  }
}

/**
 * Normalizes payload into an array of TransactionEvent objects
 */
function normalizeEvents(
  payload: TransactionEvent[] | { events: TransactionEvent[] }
): TransactionEvent[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === 'object' && 'events' in payload) {
    return payload.events;
  }
  return [];
}

/**
 * Global handler for SMS events from Android WebView
 * This function is called by the Android app when SMS events are received
 */
window.handleSmsEvents = async (payload: TransactionEvent[] | { events: TransactionEvent[] }) => {
  try {
    const events = normalizeEvents(payload);
    if (events.length === 0) {
      console.warn('handleSmsEvents: No events in payload');
      return;
    }

    // Ingest transactions
    await ingestTransactions(events);

    // Wait a bit for backend to process the ingested transactions
    await new Promise(resolve => setTimeout(resolve, 500));

    // Refresh dashboard using the shared function - import store dynamically to avoid circular dependency
    const { handleDashboardRefresh } = await import('../store/dashboardStore');
    await handleDashboardRefresh();

    // Optionally trigger plan adjustment if needed
    // This could be enhanced to check if a plan exists first
    // await createPlan('risk_adjustment');
  } catch (error) {
    console.error('Error handling SMS events:', error);
  }
};

/**
 * Requests a simulation from Android WebView
 * Falls back to local mock data if AndroidInterface is not available
 */
export async function requestSimulation(
  type: 'week_history' | 'big_repair',
  onComplete?: () => void
): Promise<void> {
  if (window.AndroidInterface?.requestSimulation) {
    // Use Android bridge
    window.AndroidInterface.requestSimulation(type);
    onComplete?.();
  } else {
    // Fallback to local mock data
    const { WEEK_HISTORY_EVENTS, BIG_REPAIR_EVENT } = await import('./mock-sms');
    const events = type === 'week_history' ? WEEK_HISTORY_EVENTS : BIG_REPAIR_EVENT;

    try {
      await ingestTransactions(events);
      onComplete?.();
    } catch (error) {
      console.error(`Error simulating ${type}:`, error);
      throw error;
    }
  }
}

