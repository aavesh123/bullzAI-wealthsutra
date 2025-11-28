import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createOrGet(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    let user = await this.userModel.findOne({
      phoneNumber: createUserDto.phoneNumber,
    });

    if (!user) {
      user = await this.userModel.create(createUserDto);
    }

    return {
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber,
      personaType: user.personaType,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findOne(userId: string): Promise<UserResponseDto | null> {
    const user = await this.userModel.findById(userId);
    if (!user) return null;

    return {
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber,
      personaType: user.personaType,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findFirst(): Promise<UserResponseDto | null> {
    const user = await this.userModel.findOne().sort({ createdAt: -1 });
    if (!user) return null;

    return {
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber,
      personaType: user.personaType,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

