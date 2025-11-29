import type { PlanResponse } from '../lib/api-client';

interface CoachCardProps {
  plan: PlanResponse | null;
}

export default function CoachCard(props: CoachCardProps) {
  const { plan } = props;

  if (!plan) {
    return (
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Coach Messages</h2>
        <p class="text-gray-500">No coach messages yet. Generate a plan to see personalized advice.</p>
      </div>
    );
  }

  const { messages } = plan;

  return (
    <div class="bg-[#020617]/80 border border-white/10 rounded-2xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.75)]">
      <h2 class="text-[18px] font-semibold text-slate-50 mb-4">💬 Your Financial Coach</h2>

      <div class="space-y-4">
        {/* Summary */}
        {messages.summary && (
          <div class="bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm">
            <div class="text-[14px] font-semibold text-slate-50 mb-2">Summary</div>
            <div class="text-[14px] text-slate-200">{messages.summary}</div>
          </div>
        )}

        {/* Risk Explanation */}
        {messages.riskExplanation && (
          <div class="bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm">
            <div class="text-[14px] font-semibold text-slate-50 mb-2">Risk Assessment</div>
            <div class="text-[14px] text-slate-200">{messages.riskExplanation}</div>
          </div>
        )}

        {/* Coach Intro */}
        {messages.coachIntro && (
          <div class="bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm">
            <div class="text-[14px] font-semibold text-slate-50 mb-2">Coach's Message</div>
            <div class="text-[14px] text-slate-200">{messages.coachIntro}</div>
          </div>
        )}

        {/* Nudges */}
        {messages.nudges && messages.nudges.length > 0 && (
          <div class="bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm">
            <div class="text-[14px] font-semibold text-slate-50 mb-3">Action Items</div>
            <ul class="space-y-2">
              {messages.nudges.map((nudge, index) => (
                <li key={index} class="flex items-start gap-2">
                  <span class="text-[#f97316] mt-1">✓</span>
                  <span class="text-[14px] text-slate-200">{nudge}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

