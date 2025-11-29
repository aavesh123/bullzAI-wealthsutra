import { JSX, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { currentUser, clearUser } from '../store/userStore';

interface LayoutProps {
  children: JSX.Element;
}

export default function Layout(props: LayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-[#050816] via-[#020617] to-[#020617] text-slate-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-6">
        <header class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">WealthSutra</p>
            <h1 class="mt-1 text-xl sm:text-2xl font-semibold text-slate-50">
              AI Wealth Planner
            </h1>
          </div>
          <Show when={currentUser()}>
            {(user) => (
              <div class="flex items-center gap-3 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.65)]">
                <div class="h-9 w-9 rounded-full bg-gradient-to-tr from-[#f97316] to-[#ec4899] flex items-center justify-center text-xs font-semibold">
                  {user().icon || 'U'}
                </div>
                <div class="hidden sm:flex flex-col items-end mr-1">
                  <span class="text-[13px] font-medium text-slate-50">{user().name}</span>
                  <span class="text-[11px] text-slate-400">{user().occupation}</span>
                </div>
                <button
                  onClick={handleLogout}
                  class="px-3 py-1.5 text-[12px] text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Switch
                </button>
              </div>
            )}
          </Show>
        </header>

        <main class="pb-8">
          {props.children}
        </main>
      </div>
    </div>
  );
}

