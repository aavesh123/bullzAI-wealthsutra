import { createSignal, Show, createEffect, onCleanup, createMemo } from 'solid-js';
import { getTransactions, type Transaction } from '../lib/api-client';
import { currentTheme } from '../store/themeStore';
import jsPDF from 'jspdf';

interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionsModal(props: TransactionsModalProps) {
  const [transactions, setTransactions] = createSignal<Transaction[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const theme = createMemo(() => currentTheme());

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

  const handleDownloadPdf = () => {
    const list = transactions();
    if (!list.length) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('WealthSutra - Transactions Report', 14, 20);

    doc.setFontSize(11);
    const generatedAt = new Date().toLocaleString('en-IN');
    doc.text(`Generated at: ${generatedAt}`, 14, 28);

    let y = 38;
    const lineHeight = 7;
    const maxY = 280;

    list.forEach((t, index) => {
      if (y > maxY) {
        doc.addPage();
        y = 20;
      }

      const directionLabel = t.direction === 'credit' ? 'Credit' : 'Debit';
      const sign = t.direction === 'credit' ? '+' : '-';
      const amount = `${sign}${formatAmount(t.amount)}`;
      const dateStr = formatDate(t.timestamp);
      const name = getDisplayName(t);

      doc.text(`${index + 1}. ${dateStr}`, 14, y);
      doc.text(`${directionLabel} • ${amount}`, 14, y + lineHeight);
      doc.text(`Party: ${name}`, 14, y + lineHeight * 2);

      y += lineHeight * 3 + 2;
    });

    doc.save('wealthsutra-transactions.pdf');
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
          class="rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
          classList={{
            'bg-white border border-gray-200 text-gray-900': theme() === 'light',
            'bg-[#020617] border border-white/10 text-slate-100': theme() === 'dark',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            class="flex items-center justify-between p-4 border-b"
            classList={{
              'border-gray-200': theme() === 'light',
              'border-white/10': theme() === 'dark',
            }}
          >
            <h2
              class="text-lg font-semibold"
              classList={{
                'text-gray-900': theme() === 'light',
                'text-slate-50': theme() === 'dark',
              }}
            >
              All Transactions
            </h2>
            <button
              onClick={props.onClose}
              class="transition-colors"
              classList={{
                'text-gray-400 hover:text-gray-600': theme() === 'light',
                'text-slate-400 hover:text-slate-200': theme() === 'dark',
              }}
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
                <p
                  class="mt-3 text-sm"
                  classList={{
                    'text-gray-600': theme() === 'light',
                    'text-slate-400': theme() === 'dark',
                  }}
                >
                  Loading transactions...
                </p>
              </div>
            </Show>

            {/* Error State */}
            <Show when={error()}>
              <div
                class="rounded-lg p-3 mb-4"
                classList={{
                  'bg-red-50 border border-red-200': theme() === 'light',
                  'bg-red-500/10 border border-red-500/60': theme() === 'dark',
                }}
              >
                <div class="flex items-center gap-2">
                  <span
                    class="text-sm"
                    classList={{
                      'text-red-600': theme() === 'light',
                      'text-red-200': theme() === 'dark',
                    }}
                  >
                    ⚠️
                  </span>
                  <span
                    class="text-sm"
                    classList={{
                      'text-red-800': theme() === 'light',
                      'text-red-100': theme() === 'dark',
                    }}
                  >
                    {error()}
                  </span>
                </div>
                <button
                  onClick={loadTransactions}
                  class="mt-2 text-xs underline"
                  classList={{
                    'text-red-600 hover:text-red-800': theme() === 'light',
                    'text-red-300 hover:text-red-100': theme() === 'dark',
                  }}
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
                    <p
                      class="text-sm"
                      classList={{
                        'text-gray-600': theme() === 'light',
                        'text-slate-400': theme() === 'dark',
                      }}
                    >
                      No transactions found.
                    </p>
                  </div>
                }
              >
                <div class="space-y-2">
                  {transactions().map((transaction) => (
                    <div
                      class={`flex items-center justify-between p-3 rounded-lg border ${
                        transaction.direction === 'credit'
                          ? theme() === 'light'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-emerald-500/10 border-emerald-400/60'
                          : theme() === 'light'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-red-500/10 border-red-400/60'
                      }`}
                    >
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <div
                            class={`w-8 h-8 rounded-full flex items-center justify-center ${
                              transaction.direction === 'credit'
                                ? theme() === 'light'
                                  ? 'bg-green-200 text-green-700'
                                  : 'bg-emerald-400/30 text-emerald-200'
                                : theme() === 'light'
                                ? 'bg-red-200 text-red-700'
                                : 'bg-red-400/30 text-red-200'
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
                            <div
                              class="text-sm font-medium"
                              classList={{
                                'text-gray-900': theme() === 'light',
                                'text-slate-50': theme() === 'dark',
                              }}
                            >
                              {getDisplayName(transaction)}
                            </div>
                            <div
                              class="text-xs"
                              classList={{
                                'text-gray-600': theme() === 'light',
                                'text-slate-400': theme() === 'dark',
                              }}
                            >
                              {transaction.category} • {transaction.channel}
                            </div>
                            <div
                              class="text-xs mt-0.5"
                              classList={{
                                'text-gray-500': theme() === 'light',
                                'text-slate-500': theme() === 'dark',
                              }}
                            >
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
                <div
                  class="mt-4 pt-4 border-t"
                  classList={{
                    'border-gray-200': theme() === 'light',
                    'border-white/10': theme() === 'dark',
                  }}
                >
                  <div class="grid grid-cols-2 gap-3">
                    <div
                      class="rounded-lg p-3 border"
                      classList={{
                        'bg-green-50 border-green-200': theme() === 'light',
                        'bg-emerald-500/10 border-emerald-400/60': theme() === 'dark',
                      }}
                    >
                      <div
                        class="text-xs font-medium mb-1"
                        classList={{
                          'text-green-700': theme() === 'light',
                          'text-emerald-200': theme() === 'dark',
                        }}
                      >
                        Total Credits
                      </div>
                      <div
                        class="text-lg font-bold"
                        classList={{
                          'text-green-900': theme() === 'light',
                          'text-emerald-100': theme() === 'dark',
                        }}
                      >
                        {formatAmount(
                          transactions()
                            .filter((t) => t.direction === 'credit')
                            .reduce((sum, t) => sum + t.amount, 0)
                        )}
                      </div>
                    </div>
                    <div
                      class="rounded-lg p-3 border"
                      classList={{
                        'bg-red-50 border-red-200': theme() === 'light',
                        'bg-red-500/10 border-red-400/60': theme() === 'dark',
                      }}
                    >
                      <div
                        class="text-xs font-medium mb-1"
                        classList={{
                          'text-red-700': theme() === 'light',
                          'text-red-200': theme() === 'dark',
                        }}
                      >
                        Total Debits
                      </div>
                      <div
                        class="text-lg font-bold"
                        classList={{
                          'text-red-900': theme() === 'light',
                          'text-red-100': theme() === 'dark',
                        }}
                      >
                        {formatAmount(
                          transactions()
                            .filter((t) => t.direction === 'debit')
                            .reduce((sum, t) => sum + t.amount, 0)
                        )}
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 text-center">
                    <div
                      class="text-xs"
                      classList={{
                        'text-gray-600': theme() === 'light',
                        'text-slate-400': theme() === 'dark',
                      }}
                    >
                      Showing {transactions().length} transaction{transactions().length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </Show>
            </Show>
          </div>

          {/* Footer */}
          <div
            class="p-4 border-t flex justify-between items-center gap-3 sm:justify-end"
            classList={{
              'border-gray-200': theme() === 'light',
              'border-white/10': theme() === 'dark',
            }}
          >
            <Show when={transactions().length > 0 && !loading()}>
              <button
                type="button"
                onClick={handleDownloadPdf}
                class="px-4 py-2 text-sm rounded-lg font-medium transition-colors"
                classList={{
                  'bg-primary-600 text-white hover:bg-primary-700': theme() === 'light',
                  'bg-[#f97316] text-white hover:bg-[#ea580c]': theme() === 'dark',
                }}
              >
                Download PDF
              </button>
            </Show>
            <button
              onClick={props.onClose}
              class="px-4 py-2 text-sm rounded-lg transition-colors"
              classList={{
                'bg-gray-200 text-gray-800 hover:bg-gray-300': theme() === 'light',
                'bg-white/10 text-slate-100 hover:bg-white/20': theme() === 'dark',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}

