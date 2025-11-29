import { useNavigate } from '@solidjs/router';
import { createSignal, onMount, createMemo } from 'solid-js';
import { AVAILABLE_USERS, setUser, type User } from '../store/userStore';
import { createOrGetUser } from '../lib/api-client';
import { currentTheme, toggleTheme, loadThemeFromStorage } from '../store/themeStore';

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal<string | null>(null);
  const theme = createMemo(() => currentTheme());

  const handleUserSelect = async (userDef: typeof AVAILABLE_USERS[0]) => {
    setLoading(userDef.phoneNumber);
    try {
      // Get or create user from backend
      const userResponse = await createOrGetUser(userDef.phoneNumber, userDef.personaType);
      
      // Create user object with all info
      const user: User = {
        userId: userResponse.userId,
        phoneNumber: userDef.phoneNumber,
        name: userDef.name,
        occupation: userDef.occupation,
        icon: userDef.icon,
        personaType: userDef.personaType,
      };
      
      // Store user and navigate
      setUser(user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error selecting user:', error);
      alert('Failed to load user. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  onMount(() => {
    loadThemeFromStorage();
  });

  return (
    <div
      class="min-h-screen flex items-center justify-center px-4 py-8"
      classList={{
        'bg-gradient-to-br from-[#050816] via-[#020617] to-[#020617] text-slate-100':
          theme() === 'dark',
        'bg-gray-50 text-slate-900': theme() === 'light',
      }}
    >
      <div
        class="max-w-3xl w-full rounded-3xl px-6 py-7 sm:px-10 sm:py-9"
        classList={{
          'border border-white/10 bg-white/5 backdrop-blur shadow-[0_24px_60px_rgba(15,23,42,0.9)]':
            theme() === 'dark',
          'bg-white shadow-xl border border-gray-200': theme() === 'light',
        }}
      >
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <p
              class="text-xs uppercase tracking-[0.25em]"
              classList={{
                'text-slate-500': theme() === 'dark',
                'text-gray-500': theme() === 'light',
              }}
            >
              Welcome to
            </p>
            <h1
              class="mt-2 text-3xl sm:text-4xl font-semibold"
              classList={{
                'text-slate-50': theme() === 'dark',
                'text-gray-900': theme() === 'light',
              }}
            >
              WealthSutra
            </h1>
            <p
              class="mt-2 text-sm max-w-md"
              classList={{
                'text-slate-400': theme() === 'dark',
                'text-gray-600': theme() === 'light',
              }}
            >
              Pick a sample profile and see how our AI planner reacts to different income patterns.
            </p>
          </div>
          <div class="hidden sm:flex flex-col items-end text-right text-xs gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              class={
                theme() === 'dark'
                  ? 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 transition-colors'
                  : 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition-colors shadow-sm'
              }
            >
              {theme() === 'dark' ? '☀️' : '🌙'}
            </button>
            <span
              class="px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.18em]"
              classList={{
                'bg-white/5 border border-white/10 text-slate-500': theme() === 'dark',
                'bg-gray-100 border border-gray-200 text-gray-500': theme() === 'light',
              }}
            >
              Demo environment
            </span>
          </div>
        </div>

        <div class="mb-6">
          <p
            class="text-[13px] mb-4 font-medium text-center sm:text-left"
            classList={{
              'text-slate-300': theme() === 'dark',
              'text-gray-800': theme() === 'light',
            }}
          >
            Select a persona to continue
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AVAILABLE_USERS.map((userDef) => (
              <button
                onClick={() => handleUserSelect(userDef)}
                disabled={loading() !== null}
                class={`relative overflow-hidden rounded-2xl px-4 py-5 text-left transition-all border ${
                  loading() === userDef.phoneNumber
                    ? theme() === 'dark'
                      ? 'border-[#f97316]/70 bg-white/5 shadow-[0_18px_45px_rgba(248,113,113,0.55)] cursor-wait'
                      : 'border-[#f97316]/70 bg-orange-50 shadow-md cursor-wait'
                    : theme() === 'dark'
                    ? 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 hover:shadow-[0_18px_45px_rgba(15,23,42,0.75)]'
                    : 'border-gray-200 bg-white hover:border-primary-500 hover:shadow-lg'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {loading() === userDef.phoneNumber && (
                  <div
                    class="absolute inset-0 flex items-center justify-center"
                    classList={{
                      'bg-slate-900/70': theme() === 'dark',
                      'bg-white/80': theme() === 'light',
                    }}
                  >
                    <div
                      class="animate-spin rounded-full h-8 w-8 border-b-2"
                      classList={{
                        'border-[#f97316]': theme() === 'dark',
                        'border-primary-600': theme() === 'light',
                      }}
                    ></div>
                  </div>
                )}
                <div class="flex items-center gap-4">
                  <div class="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#f97316] to-[#ec4899] flex items-center justify-center text-2xl">
                    {userDef.icon}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <div>
                        <div
                          class="text-[15px] font-semibold"
                          classList={{
                            'text-slate-50': theme() === 'dark',
                            'text-gray-900': theme() === 'light',
                          }}
                        >
                          {userDef.name}
                        </div>
                        <div
                          class="text-[12px]"
                          classList={{
                            'text-slate-400': theme() === 'dark',
                            'text-gray-600': theme() === 'light',
                          }}
                        >
                          {userDef.occupation}
                        </div>
                      </div>
                      <span
                        class="rounded-full px-2 py-0.5 text-[11px]"
                        classList={{
                          'border border-white/15 text-slate-300 bg-white/5': theme() === 'dark',
                          'border border-gray-300 text-gray-700 bg-gray-50': theme() === 'light',
                        }}
                      >
                        {userDef.personaType === 'gig_worker' ? 'Gig worker' : 'Daily wage'}
                      </span>
                    </div>
                    <p
                      class="mt-3 text-[11px]"
                      classList={{
                        'text-slate-400': theme() === 'dark',
                        'text-gray-500': theme() === 'light',
                      }}
                    >
                      See {userDef.name}'s last 7 days of SMS transactions and how the plan adapts.
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p
          class="text-center text-[11px] mt-4"
          classList={{
            'text-slate-500': theme() === 'dark',
            'text-gray-500': theme() === 'light',
          }}
        >
          No real money involved. This is a sandbox to explore WealthSutra&apos;s planning engine.
        </p>
      </div>
    </div>
  );
}

