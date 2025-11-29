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
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">WealthSutra</h1>
              <p class="text-sm text-gray-600">AI Financial Planner</p>
            </div>
            <Show when={currentUser()}>
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">
                    {currentUser()?.icon} {currentUser()?.name}
                  </div>
                  <div class="text-xs text-gray-500">{currentUser()?.occupation}</div>
                </div>
                <button
                  onClick={handleLogout}
                  class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Switch User
                </button>
              </div>
            </Show>
          </div>
        </div>
      </header>
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {props.children}
      </main>
    </div>
  );
}

