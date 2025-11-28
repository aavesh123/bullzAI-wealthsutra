import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Goal, GoalDocument } from '../../schemas/goal.schema';
import { CreateGoalDto } from './dto/create-goal.dto';
import { GoalResponseDto } from './dto/goal-response.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectModel(Goal.name) private goalModel: Model<GoalDocument>,
  ) {}

  async create(createGoalDto: CreateGoalDto): Promise<GoalResponseDto> {
    const goal = await this.goalModel.create({
      ...createGoalDto,
      targetDate: new Date(createGoalDto.targetDate),
      status: createGoalDto.status || 'active',
    });

    return {
      _id: goal._id.toString(),
      userId: goal.userId.toString(),
      type: goal.type,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate,
      status: goal.status,
    };
  }

  async findByUserId(userId: string): Promise<GoalResponseDto[]> {
    const goals = await this.goalModel.find({ userId }).sort({ createdAt: -1 });

    return goals.map((goal) => ({
      _id: goal._id.toString(),
      userId: goal.userId.toString(),
      type: goal.type,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate,
      status: goal.status,
    }));
  }
}

