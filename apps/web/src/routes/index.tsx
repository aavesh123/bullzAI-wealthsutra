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
    <div class="min-h-screen bg-gradient-to-br from-[#050816] via-[#020617] to-[#020617] flex items-center justify-center px-4 py-8 text-slate-100">
      <div class="max-w-3xl w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_24px_60px_rgba(15,23,42,0.9)] px-6 py-7 sm:px-10 sm:py-9">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Welcome to</p>
            <h1 class="mt-2 text-3xl sm:text-4xl font-semibold text-slate-50">WealthSutra</h1>
            <p class="mt-2 text-sm text-slate-400 max-w-md">
              Pick a sample profile and see how our AI planner reacts to different income patterns.
            </p>
          </div>
          <div class="hidden sm:flex flex-col items-end text-right text-xs text-slate-500">
            <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-[0.18em]">
              Demo environment
            </span>
          </div>
        </div>

        <div class="mb-6">
          <p class="text-[13px] text-slate-300 mb-4 font-medium text-center sm:text-left">
            Select a persona to continue
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AVAILABLE_USERS.map((userDef) => (
              <button
                onClick={() => handleUserSelect(userDef)}
                disabled={loading() !== null}
                class={`relative overflow-hidden rounded-2xl px-4 py-5 text-left transition-all border bg-white/5 ${
                  loading() === userDef.phoneNumber
                    ? 'border-[#f97316]/70 shadow-[0_18px_45px_rgba(248,113,113,0.55)] cursor-wait'
                    : 'border-white/10 hover:border-white/30 hover:bg-white/10 hover:shadow-[0_18px_45px_rgba(15,23,42,0.75)]'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {loading() === userDef.phoneNumber && (
                  <div class="absolute inset-0 flex items-center justify-center bg-slate-900/70">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316]"></div>
                  </div>
                )}
                <div class="flex items-center gap-4">
                  <div class="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#f97316] to-[#ec4899] flex items-center justify-center text-2xl">
                    {userDef.icon}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <div>
                        <div class="text-[15px] font-semibold text-slate-50">{userDef.name}</div>
                        <div class="text-[12px] text-slate-400">{userDef.occupation}</div>
                      </div>
                      <span class="rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-slate-300">
                        {userDef.personaType === 'gig_worker' ? 'Gig worker' : 'Daily wage'}
                      </span>
                    </div>
                    <p class="mt-3 text-[11px] text-slate-400">
                      See {userDef.name}'s last 7 days of SMS transactions and how the plan adapts.
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p class="text-center text-[11px] text-slate-500 mt-4">
          No real money involved. This is a sandbox to explore WealthSutra&apos;s planning engine.
        </p>
      </div>
    </div>
  );
}

