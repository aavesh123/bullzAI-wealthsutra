import { OpenAIClient } from '../../ai/openai.client';
import { AgentContext } from '../dto/agent-context.dto';
import { AnalystOutput } from './analyst.agent';
import { RiskOutput } from './risk-detector.agent';
import { PlannerOutput } from './planner.agent';

export interface CoachOutput {
  message: string;
  summary: string;
  riskExplanation: string;
  coachIntro: string;
  nudges: string[];
}

interface StructuredCoachResponse {
  summary: string;
  riskExplanation: string;
  coachIntro: string;
  nudges: string[];
}

export class CoachAgent {
  constructor(private openAIClient: OpenAIClient) {}

  async generateMessage(
    context: AgentContext,
    analystOutput: AnalystOutput,
    riskOutput: RiskOutput,
    plannerOutput: PlannerOutput,
  ): Promise<CoachOutput> {
    // Build context string for OpenAI
    const contextString = this.buildContextString(
      context,
      analystOutput,
      riskOutput,
      plannerOutput,
    );

    // Calculate monthly savings
    const avgDailyIncome = analystOutput.incomeSummary.avgDaily;
    const avgDailySpend = analystOutput.spendingSummary.avgDaily;
    const fixedMonthlyExpenses = context.profile.fixedExpenses.rentAmount + 
                                 context.profile.fixedExpenses.emiAmount + 
                                 context.profile.fixedExpenses.schoolFeesAmount;
    const projectedMonthlyIncome = avgDailyIncome * 30;
    const projectedMonthlySpend = avgDailySpend * 30;
    const monthlySavings = projectedMonthlyIncome - projectedMonthlySpend - fixedMonthlyExpenses;

    // Generate structured response
    const investmentGuidance = monthlySavings > 0 
      ? `IMPORTANT: The user has positive monthly savings of approximately ₹${Math.round(monthlySavings).toLocaleString('en-IN')}. 
      You MUST include investment suggestions in your nudges, such as:
      - SIP (Systematic Investment Plan) recommendations based on savings amount
      - Mutual fund suggestions (₹${Math.round(monthlySavings * 0.3).toLocaleString('en-IN')}-${Math.round(monthlySavings * 0.5).toLocaleString('en-IN')} per month)
      - Emergency fund building
      - Long-term wealth creation strategies
      Mention specific amounts based on their savings.`
      : `The user has negative or zero savings. Focus on expense reduction and building emergency fund first.`;

    const systemPrompt = `You are a friendly financial coach for workers in India (including irregular-income workers and salaried professionals).
Provide simple, encouraging advice in plain language.
Focus on practical tips for saving money and managing expenses.
Always mention specific spending categories by name when giving advice.
${investmentGuidance}
Output a JSON object with the following structure:
{
  "summary": "A brief 1-2 sentence summary of the financial plan",
  "riskExplanation": "Explain the risk level and shortfall in simple terms, mentioning specific amounts",
  "coachIntro": "A personalized 2-3 sentence introduction message as a financial coach",
  "nudges": ["First actionable nudge mentioning specific categories", "Second nudge", "Third nudge"]
}
Each nudge should be specific and mention the actual top spending categories by name.
${monthlySavings > 0 ? 'Include at least one investment/SIP suggestion in the nudges with specific amounts.' : ''}`;

    const structuredResponse = await this.openAIClient.generateStructuredResponse<StructuredCoachResponse>(
      contextString,
      systemPrompt,
    );

    // Fallback to simple message if structured response fails
    if (!structuredResponse) {
      const message = await this.openAIClient.generateCoachMessage(contextString);
      
      // Calculate monthly savings for fallback
      const avgDailyIncome = analystOutput.incomeSummary.avgDaily;
      const avgDailySpend = analystOutput.spendingSummary.avgDaily;
      const fixedMonthlyExpenses = context.profile.fixedExpenses.rentAmount + 
                                   context.profile.fixedExpenses.emiAmount + 
                                   context.profile.fixedExpenses.schoolFeesAmount;
      const projectedMonthlyIncome = avgDailyIncome * 30;
      const projectedMonthlySpend = avgDailySpend * 30;
      const monthlySavings = projectedMonthlyIncome - projectedMonthlySpend - fixedMonthlyExpenses;

      // Get top categories for fallback nudges
      const topCategories = analystOutput.spendingSummary.topCategories;
      const topCategory1 = topCategories[0]?.category || 'your top spending category';
      const topCategory2 = topCategories[1]?.category;
      const topCategory3 = topCategories[2]?.category;
      
      // Build specific nudges based on actual top categories
      const nudges: string[] = [
        `Save ₹${plannerOutput.dailySavingTarget} daily to meet your goals`,
      ];
      
      if (topCategory1) {
        const category1Amount = topCategories[0].amount;
        const category1Cap = plannerOutput.spendingCaps[topCategory1];
        if (category1Cap) {
          nudges.push(`Keep ${topCategory1} spending under ₹${category1Cap.toLocaleString('en-IN')}/month (currently ₹${category1Amount.toLocaleString('en-IN')} in last 7 days)`);
        } else {
          nudges.push(`Monitor your ${topCategory1} spending (₹${category1Amount.toLocaleString('en-IN')} in last 7 days)`);
        }
      }
      
      // Add investment suggestions if there are savings
      if (monthlySavings > 0) {
        const sipAmount = Math.round(monthlySavings * 0.4); // 40% of savings for SIP
        nudges.push(`Start a SIP of ₹${sipAmount.toLocaleString('en-IN')}/month in equity mutual funds to grow your savings`);
      } else if (topCategory2) {
        const category2Amount = topCategories[1].amount;
        nudges.push(`Track ${topCategory2} expenses (₹${category2Amount.toLocaleString('en-IN')} recently)`);
      } else if (topCategory3) {
        const category3Amount = topCategories[2].amount;
        nudges.push(`Watch ${topCategory3} spending (₹${category3Amount.toLocaleString('en-IN')} recently)`);
      } else {
        nudges.push(`Review your spending patterns weekly`);
      }
      
      return {
        message,
        summary: `Your financial plan has been created. Daily saving target is ₹${plannerOutput.dailySavingTarget}.`,
        riskExplanation: `Your risk level is ${riskOutput.riskLevel}. Projected shortfall: ₹${riskOutput.shortfallAmount.toLocaleString('en-IN')} in the ${riskOutput.timeframe}.`,
        coachIntro: message,
        nudges,
      };
    }

    return {
      message: structuredResponse.coachIntro,
      summary: structuredResponse.summary,
      riskExplanation: structuredResponse.riskExplanation,
      coachIntro: structuredResponse.coachIntro,
      nudges: structuredResponse.nudges,
    };
  }

  private buildContextString(
    context: AgentContext,
    analystOutput: AnalystOutput,
    riskOutput: RiskOutput,
    plannerOutput: PlannerOutput,
  ): string {
    // Build detailed top categories list with amounts
    const topCategoriesDetails = analystOutput.spendingSummary.topCategories
      .map((cat, index) => {
        const percentage = analystOutput.spendingSummary.total > 0
          ? ((cat.amount / analystOutput.spendingSummary.total) * 100).toFixed(1)
          : '0';
        return `${index + 1}. ${cat.category}: ₹${cat.amount.toLocaleString('en-IN')} (${percentage}% of total spending)`;
      })
      .join('\n');

    // Build spending caps details
    const spendingCapsDetails = Object.entries(plannerOutput.spendingCaps)
      .map(([category, cap]) => `- ${category}: ₹${cap.toLocaleString('en-IN')}/month limit`)
      .join('\n');

    // Calculate monthly savings
    const avgDailyIncome = analystOutput.incomeSummary.avgDaily;
    const avgDailySpend = analystOutput.spendingSummary.avgDaily;
    const fixedMonthlyExpenses = context.profile.fixedExpenses.rentAmount + 
                                 context.profile.fixedExpenses.emiAmount + 
                                 context.profile.fixedExpenses.schoolFeesAmount;
    const projectedMonthlyIncome = avgDailyIncome * 30;
    const projectedMonthlySpend = avgDailySpend * 30;
    const monthlySavings = projectedMonthlyIncome - projectedMonthlySpend - fixedMonthlyExpenses;

    return `User Financial Situation:

INCOME:
- Average daily income: ₹${analystOutput.incomeSummary.avgDaily.toFixed(0)}/day
- Income volatility: ${analystOutput.incomeSummary.volatility}
- Total income (last 7 days): ₹${analystOutput.incomeSummary.total.toLocaleString('en-IN')}

SPENDING:
- Average daily spending: ₹${analystOutput.spendingSummary.avgDaily.toFixed(0)}/day
- Total spending (last 7 days): ₹${analystOutput.spendingSummary.total.toLocaleString('en-IN')}
- Savings rate: ${(analystOutput.savingsRate * 100).toFixed(1)}%

TOP SPENDING CATEGORIES (with amounts):
${topCategoriesDetails}

FIXED EXPENSES:
- Rent: ₹${context.profile.fixedExpenses.rentAmount.toLocaleString('en-IN')}/month
- EMI: ₹${context.profile.fixedExpenses.emiAmount.toLocaleString('en-IN')}/month
- School Fees: ₹${context.profile.fixedExpenses.schoolFeesAmount.toLocaleString('en-IN')}/month

RISK ASSESSMENT:
- Risk level: ${riskOutput.riskLevel}
- Projected shortfall: ₹${riskOutput.shortfallAmount.toLocaleString('en-IN')}
- Timeframe: ${riskOutput.timeframe}

NEW PLAN:
- Daily saving target: ₹${plannerOutput.dailySavingTarget}
- Spending caps set:
${spendingCapsDetails}

MONTHLY SAVINGS ANALYSIS:
- Projected monthly income: ₹${projectedMonthlyIncome.toLocaleString('en-IN')}
- Projected monthly spending: ₹${projectedMonthlySpend.toLocaleString('en-IN')}
- Fixed monthly expenses: ₹${fixedMonthlyExpenses.toLocaleString('en-IN')}
- Estimated monthly savings: ₹${Math.round(monthlySavings).toLocaleString('en-IN')}
${monthlySavings > 0 ? `- Savings available for investment: ₹${Math.round(monthlySavings).toLocaleString('en-IN')}/month` : '- No savings available (focus on expense reduction)'}

INSTRUCTIONS:
Generate personalized financial coaching messages that:
1. Mention the specific top spending categories by name (${analystOutput.spendingSummary.topCategories.map(c => c.category).join(', ')})
2. Reference actual amounts where relevant
3. Provide actionable, specific advice
4. Be encouraging and supportive
5. Focus on the categories where they spend the most
${monthlySavings > 0 ? `6. CRITICAL: Since they have ₹${Math.round(monthlySavings).toLocaleString('en-IN')}/month in savings, you MUST suggest:
   - SIP (Systematic Investment Plan) of ₹${Math.round(monthlySavings * 0.3).toLocaleString('en-IN')}-${Math.round(monthlySavings * 0.5).toLocaleString('en-IN')}/month in mutual funds
   - Building emergency fund with remaining savings
   - Long-term wealth creation strategies
   Include specific investment amounts in your nudges.` : '6. Focus on expense reduction and building emergency fund first.'}`;
  }
}

