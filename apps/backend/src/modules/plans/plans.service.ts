import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, PlanDocument } from '../../schemas/plan.schema';
import { PlanResponseDto } from './dto/plan-response.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plan.name) private planModel: Model<PlanDocument>,
  ) {}

  async create(planData: Partial<Plan>): Promise<PlanResponseDto> {
    const plan = await this.planModel.create(planData);

    return {
      _id: plan._id.toString(),
      userId: plan.userId.toString(),
      goalId: plan.goalId ? plan.goalId.toString() : null,
      startDate: plan.startDate,
      endDate: plan.endDate,
      dailySavingTarget: plan.dailySavingTarget,
      spendingCaps: plan.spendingCaps,
      status: plan.status,
    };
  }

  async findActiveByUserId(userId: string): Promise<PlanResponseDto | null> {
    const plan = await this.planModel.findOne({
      userId,
      status: 'active',
    });

    if (!plan) return null;

    return {
      _id: plan._id.toString(),
      userId: plan.userId.toString(),
      goalId: plan.goalId ? plan.goalId.toString() : null,
      startDate: plan.startDate,
      endDate: plan.endDate,
      dailySavingTarget: plan.dailySavingTarget,
      spendingCaps: plan.spendingCaps,
      status: plan.status,
    };
  }

  async deactivateAll(userId: string): Promise<void> {
    await this.planModel.updateMany(
      { userId, status: 'active' },
      { status: 'inactive' },
    );
  }
}

