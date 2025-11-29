import { JSX, Show, onMount, createMemo } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { currentUser, clearUser } from '../store/userStore';
import { currentTheme, toggleTheme, loadThemeFromStorage } from '../store/themeStore';

interface LayoutProps {
  children: JSX.Element;
}

export default function Layout(props: LayoutProps) {
  const navigate = useNavigate();
  const theme = createMemo(() => currentTheme());

  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  onMount(() => {
    loadThemeFromStorage();
  });

  return (
    <div
      class="min-h-screen"
      classList={{
        'bg-gradient-to-br from-[#050816] via-[#020617] to-[#020617] text-slate-100':
          theme() === 'dark',
        'bg-gray-50 text-slate-900': theme() === 'light',
      }}
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-6">
        <header class="flex items-center justify-between gap-4">
          <div>
            <p
              class="text-xs uppercase tracking-[0.2em]"
              classList={{
                'text-slate-500': theme() === 'dark',
                'text-gray-500': theme() === 'light',
              }}
            >
              WealthSutra
            </p>
            <h1
              class="mt-1 text-xl sm:text-2xl font-semibold"
              classList={{
                'text-slate-50': theme() === 'dark',
                'text-gray-900': theme() === 'light',
              }}
            >
              AI Wealth Planner
            </h1>
          </div>
          <div class="flex items-center gap-3">
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
            <Show when={currentUser()}>
              {(user) => (
                <div
                  class="flex items-center gap-3 rounded-full px-3 py-1.5"
                  classList={{
                    'bg-white/5 border border-white/10 shadow-[0_12px_30px_rgba(15,23,42,0.65)]':
                      theme() === 'dark',
                    'bg-white border border-gray-200 shadow-sm': theme() === 'light',
                  }}
                >
                  <div class="h-9 w-9 rounded-full bg-gradient-to-tr from-[#f97316] to-[#ec4899] flex items-center justify-center text-xs font-semibold">
                    {user().icon || 'U'}
                  </div>
                  <div class="hidden sm:flex flex-col items-end mr-1">
                    <span
                      class="text-[13px] font-medium"
                      classList={{
                        'text-slate-50': theme() === 'dark',
                        'text-gray-900': theme() === 'light',
                      }}
                    >
                      {user().name}
                    </span>
                    <span
                      class="text-[11px]"
                      classList={{
                        'text-slate-400': theme() === 'dark',
                        'text-gray-500': theme() === 'light',
                      }}
                    >
                      {user().occupation}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    class="px-3 py-1.5 text-[12px] rounded-lg transition-colors"
                    classList={{
                      'text-slate-200 hover:text-white hover:bg-white/10': theme() === 'dark',
                      'text-gray-600 hover:text-gray-900 hover:bg-gray-100': theme() === 'light',
                    }}
                  >
                    Switch
                  </button>
                </div>
              )}
            </Show>
          </div>
        </header>

        <main class="pb-8">
          {props.children}
        </main>
      </div>
    </div>
  );
}

