import type { PlanResponse } from '../lib/api-client';
import jsPDF from 'jspdf';

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

  const handleDownloadCoachPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('WealthSutra - Financial Coach', 14, 20);

    doc.setFontSize(11);
    const generatedAt = new Date().toLocaleString('en-IN');
    doc.text(`Generated at: ${generatedAt}`, 14, 28);

    let y = 38;
    const lineHeight = 6;
    const maxY = 280;

    const addSection = (title: string, content: string | string[]) => {
      if (!content || (Array.isArray(content) && content.length === 0)) return;

      const lines = Array.isArray(content)
        ? content.flatMap((item, idx) =>
            doc
              .splitTextToSize(`${idx + 1}. ${item}`, 180)
              .concat(idx === content.length - 1 ? [] : ['']),
          )
        : doc.splitTextToSize(content, 180);

      if (y + lineHeight * (lines.length + 2) > maxY) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(13);
      doc.text(title, 14, y);
      y += lineHeight;

      doc.setFontSize(11);
      lines.forEach((line: string) => {
        doc.text(line, 14, y);
        y += lineHeight;
      });

      y += 2;
    };

    if (messages.summary) {
      addSection('Summary', messages.summary);
    }
    if (messages.riskExplanation) {
      addSection('Risk Assessment', messages.riskExplanation);
    }
    if (messages.coachIntro) {
      addSection("Coach's Message", messages.coachIntro);
    }
    if (messages.nudges && messages.nudges.length > 0) {
      addSection('Action Items', messages.nudges);
    }

    doc.save('wealthsutra-coach.pdf');
  };

  return (
    <div class="bg-[#020617]/80 border border-white/10 rounded-2xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.75)]">
      <div class="flex items-center justify-between mb-4 gap-3">
        <h2 class="text-[18px] font-semibold text-slate-50">💬 Your Financial Coach</h2>
        <button
          type="button"
          onClick={handleDownloadCoachPdf}
          class="px-3 py-1.5 text-[12px] rounded-lg bg-white/10 text-slate-100 hover:bg-white/20 border border-white/15 transition-colors"
        >
          Download PDF
        </button>
      </div>
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
              {messages.nudges.map((nudge) => (
                <li class="flex items-start gap-2">
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

