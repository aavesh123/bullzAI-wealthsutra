import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

@ApiTags('Profiles')
@Controller('profile')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update profile' })
  @ApiResponse({
    status: 201,
    description: 'Profile created or updated',
    type: ProfileResponseDto,
  })
  async create(
    @Body() createProfileDto: CreateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.createOrUpdate(createProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Profile found',
    type: ProfileResponseDto,
  })
  async findOne(@Query('userId') userId: string): Promise<ProfileResponseDto | null> {
    return this.profilesService.findByUserId(userId);
  }
}

