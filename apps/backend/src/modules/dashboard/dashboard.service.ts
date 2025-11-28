import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransactionDocument } from '../../schemas/transaction.schema';
import { ProfileDocument } from '../../schemas/profile.schema';
import { TransactionsService } from '../transactions/transactions.service';
import { ProfilesService } from '../profiles/profiles.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(
    private transactionsService: TransactionsService,
    private profilesService: ProfilesService,
  ) {}

  async getDashboard(userId: string): Promise<DashboardResponseDto> {
    // Get recent transactions (last 7 days)
    const transactions = await this.transactionsService.getRecentTransactions(
      userId,
      7,
    );

    // Get profile for fixed expenses
    const profile = await this.profilesService.findByUserId(userId);

    // Calculate income and spending
    let incomeTotal = 0;
    let spendTotal = 0;
    const categoryMap = new Map<string, number>();

    transactions.forEach((t) => {
      if (t.direction === 'credit') {
        incomeTotal += t.amount;
      } else {
        spendTotal += t.amount;
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      }
    });

    const categories = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));

    // Get fixed expenses
    const emiAmount = profile?.fixedExpenses?.emiAmount || 0;
    const rentAmount = profile?.fixedExpenses?.rentAmount || 0;

    // Calculate projected shortfall (simple: average daily spend * 30 - average daily income * 30)
    const days = 7;
    const avgDailySpend = spendTotal / days;
    const avgDailyIncome = incomeTotal / days;
    const projectedMonthlySpend = avgDailySpend * 30;
    const projectedMonthlyIncome = avgDailyIncome * 30;
    const projectedShortfall = Math.max(
      0,
      projectedMonthlySpend + emiAmount + rentAmount - projectedMonthlyIncome,
    );

    // Calculate health score (simple rule-based)
    const healthScore = this.calculateHealthScore(
      incomeTotal,
      spendTotal,
      projectedShortfall,
    );

    return {
      incomeTotal,
      spendTotal,
      categories,
      emiAmount,
      rentAmount,
      projectedShortfall,
      healthScore,
    };
  }

  private calculateHealthScore(
    income: number,
    spend: number,
    shortfall: number,
  ): { score: number; label: 'Unstable' | 'Improving' | 'Stable'; context: string } {
    if (income === 0) {
      return {
        score: 0,
        label: 'Unstable',
        context: 'No income recorded',
      };
    }

    const savingsRate = (income - spend) / income;
    let score = 50;

    // Adjust based on savings rate
    if (savingsRate > 0.2) {
      score += 30;
    } else if (savingsRate > 0.1) {
      score += 15;
    } else if (savingsRate < 0) {
      score -= 30;
    }

    // Adjust based on shortfall
    if (shortfall > 0) {
      score -= Math.min(30, shortfall / 1000);
    }

    score = Math.max(0, Math.min(100, score));

    let label: 'Unstable' | 'Improving' | 'Stable';
    let context: string;

    if (score < 40) {
      label = 'Unstable';
      context = 'High spending relative to income. Consider reducing expenses.';
    } else if (score < 70) {
      label = 'Improving';
      context = 'Moderate financial health. Focus on building savings.';
    } else {
      label = 'Stable';
      context = 'Good financial health. Maintain current spending patterns.';
    }

    return { score, label, context };
  }
}

