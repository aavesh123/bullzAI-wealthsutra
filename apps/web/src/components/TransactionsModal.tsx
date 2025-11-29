import { createSignal, Show, createEffect, onCleanup } from 'solid-js';
import { getTransactions, type Transaction } from '../lib/api-client';

interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionsModal(props: TransactionsModalProps) {
  const [transactions, setTransactions] = createSignal<Transaction[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Prevent background scrolling when modal is open
  createEffect(() => {
    if (props.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  onCleanup(() => {
    document.body.style.overflow = '';
  });

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions(); // Get all transactions (default limit is 100)
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reload when modal opens
  createEffect(() => {
    if (props.isOpen) {
      loadTransactions();
    }
  });

  // Format date for display
  const formatDate = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Format amount with currency
  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Get display name (merchant for debit, source for credit)
  const getDisplayName = (transaction: Transaction) => {
    if (transaction.direction === 'debit') {
      return transaction.merchant || 'Unknown Merchant';
    } else {
      return transaction.source || 'Unknown Source';
    }
  };

  return (
    <Show when={props.isOpen}>
      {/* Backdrop */}
      <div
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={props.onClose}
      >
        {/* Modal */}
        <div
          class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">All Transactions</h2>
            <button
              onClick={props.onClose}
              class="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div class="flex-1 overflow-y-auto p-4">
            {/* Loading State */}
            <Show when={loading()}>
              <div class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p class="mt-3 text-sm text-gray-600">Loading transactions...</p>
              </div>
            </Show>

            {/* Error State */}
            <Show when={error()}>
              <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div class="flex items-center gap-2">
                  <span class="text-red-600 text-sm">⚠️</span>
                  <span class="text-sm text-red-800">{error()}</span>
                </div>
                <button
                  onClick={loadTransactions}
                  class="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </Show>

            {/* Transactions List */}
            <Show when={!loading() && !error()}>
              <Show
                when={transactions().length > 0}
                fallback={
                  <div class="text-center py-8">
                    <p class="text-sm text-gray-600">No transactions found.</p>
                  </div>
                }
              >
                <div class="space-y-2">
                  {transactions().map((transaction) => (
                    <div
                      class={`flex items-center justify-between p-3 rounded-lg border ${
                        transaction.direction === 'credit'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <div
                            class={`w-8 h-8 rounded-full flex items-center justify-center ${
                              transaction.direction === 'credit'
                                ? 'bg-green-200 text-green-700'
                                : 'bg-red-200 text-red-700'
                            }`}
                          >
                            {transaction.direction === 'credit' ? (
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                              </svg>
                            ) : (
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                              </svg>
                            )}
                          </div>
                          <div class="flex-1">
                            <div class="text-sm font-medium text-gray-900">
                              {getDisplayName(transaction)}
                            </div>
                            <div class="text-xs text-gray-600">
                              {transaction.category} • {transaction.channel}
                            </div>
                            <div class="text-xs text-gray-500 mt-0.5">
                              {formatDate(transaction.timestamp)}
                            </div>
                          </div>
                        </div>
                        {transaction.rawText && (
                          <div class="text-xs text-gray-500 mt-1.5 italic pl-10">
                            "{transaction.rawText}"
                          </div>
                        )}
                      </div>
                      <div class="text-right ml-3">
                        <div
                          class={`text-base font-semibold ${
                            transaction.direction === 'credit' ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {transaction.direction === 'credit' ? '+' : '-'}
                          {formatAmount(transaction.amount)}
                        </div>
                        <div class="text-xs text-gray-500 mt-0.5 capitalize">
                          {transaction.direction}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div class="text-xs text-green-700 font-medium mb-1">Total Credits</div>
                      <div class="text-lg font-bold text-green-900">
                        {formatAmount(
                          transactions()
                            .filter((t) => t.direction === 'credit')
                            .reduce((sum, t) => sum + t.amount, 0)
                        )}
                      </div>
                    </div>
                    <div class="bg-red-50 rounded-lg p-3 border border-red-200">
                      <div class="text-xs text-red-700 font-medium mb-1">Total Debits</div>
                      <div class="text-lg font-bold text-red-900">
                        {formatAmount(
                          transactions()
                            .filter((t) => t.direction === 'debit')
                            .reduce((sum, t) => sum + t.amount, 0)
                        )}
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 text-center">
                    <div class="text-xs text-gray-600">
                      Showing {transactions().length} transaction{transactions().length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </Show>
            </Show>
          </div>

          {/* Footer */}
          <div class="p-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={props.onClose}
              class="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}

