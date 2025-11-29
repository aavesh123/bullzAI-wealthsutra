import { useNavigate } from '@solidjs/router';
import { createSignal } from 'solid-js';
import { AVAILABLE_USERS, setUser, type User } from '../store/userStore';
import { createOrGetUser } from '../lib/api-client';

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal<string | null>(null);

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

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">WealthSutra</h1>
          <p class="text-gray-600">AI-Powered Financial Planner</p>
        </div>

        <div class="mb-6">
          <p class="text-center text-gray-700 mb-6 font-medium">Select a user to continue</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_USERS.map((userDef) => (
              <button
                onClick={() => handleUserSelect(userDef)}
                disabled={loading() !== null}
                class={`relative p-6 rounded-xl border-2 transition-all ${
                  loading() === userDef.phoneNumber
                    ? 'border-primary-400 bg-primary-50 cursor-wait'
                    : 'border-gray-200 bg-white hover:border-primary-500 hover:shadow-lg'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading() === userDef.phoneNumber && (
                  <div class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-xl">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                )}
                <div class="text-5xl mb-3">{userDef.icon}</div>
                <div class="text-lg font-semibold text-gray-900 mb-1">{userDef.name}</div>
                <div class="text-sm text-gray-600">{userDef.occupation}</div>
              </button>
            ))}
          </div>
        </div>

        <p class="text-center text-xs text-gray-500 mt-6">
          Get personalized financial planning for irregular income
        </p>
      </div>
    </div>
  );
}

