import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    // Convert string userId to ObjectId for proper querying
    const userObjectId = new Types.ObjectId(userId);
    const plan = await this.planModel.findOne({
      userId: userObjectId,
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
    // Convert string userId to ObjectId for proper querying
    const userObjectId = new Types.ObjectId(userId);
    await this.planModel.updateMany(
      { userId: userObjectId, status: 'active' },
      { status: 'inactive' },
    );
  }
}

