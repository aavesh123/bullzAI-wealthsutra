import { useNavigate } from '@solidjs/router';

export default function Landing() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="mb-6">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">WealthSutra</h1>
          <p class="text-gray-600">AI-Powered Financial Planner</p>
        </div>

        <div class="mb-8">
          <div class="text-6xl mb-4">🚴</div>
          <p class="text-gray-700 mb-2">Welcome, Ravi!</p>
          <p class="text-sm text-gray-500">Swiggy Delivery Partner</p>
        </div>

        <button
          onClick={handleContinue}
          class="w-full px-6 py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg"
        >
          Continue as Ravi
        </button>

        <p class="mt-6 text-xs text-gray-500">
          Get personalized financial planning for irregular income
        </p>
      </div>
    </div>
  );
}

