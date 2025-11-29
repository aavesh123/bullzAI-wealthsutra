import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile, ProfileDocument } from '../../schemas/profile.schema';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
  ) {}

  async createOrUpdate(
    createProfileDto: CreateProfileDto,
  ): Promise<ProfileResponseDto> {
    // Convert string userId to ObjectId for proper querying
    const userObjectId = new Types.ObjectId(createProfileDto.userId);
    const profile = await this.profileModel.findOneAndUpdate(
      { userId: userObjectId },
      {
        ...createProfileDto,
        fixedExpenses: {
          rentAmount: 0,
          emiAmount: 0,
          schoolFeesAmount: 0,
          ...createProfileDto.fixedExpenses,
        },
      },
      { upsert: true, new: true },
    );

    return {
      _id: profile._id.toString(),
      userId: profile.userId.toString(),
      city: profile.city,
      incomeMinPerDay: profile.incomeMinPerDay,
      incomeMaxPerDay: profile.incomeMaxPerDay,
      workDaysPerWeek: profile.workDaysPerWeek,
      fixedExpenses: profile.fixedExpenses,
    };
  }

  async findByUserId(userId: string): Promise<ProfileResponseDto | null> {
    // Convert string userId to ObjectId for proper querying
    const userObjectId = new Types.ObjectId(userId);
    const profile = await this.profileModel.findOne({ userId: userObjectId });
    if (!profile) return null;

    return {
      _id: profile._id.toString(),
      userId: profile.userId.toString(),
      city: profile.city,
      incomeMinPerDay: profile.incomeMinPerDay,
      incomeMaxPerDay: profile.incomeMaxPerDay,
      workDaysPerWeek: profile.workDaysPerWeek,
      fixedExpenses: profile.fixedExpenses,
    };
  }
}

