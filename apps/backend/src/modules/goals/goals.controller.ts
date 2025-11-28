import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { GoalResponseDto } from './dto/goal-response.dto';

@ApiTags('Goals')
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new goal' })
  @ApiResponse({
    status: 201,
    description: 'Goal created',
    type: GoalResponseDto,
  })
  async create(@Body() createGoalDto: CreateGoalDto): Promise<GoalResponseDto> {
    return this.goalsService.create(createGoalDto);
  }

  @Get()
  @ApiOperation({ summary: 'List goals' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Goals retrieved',
    type: [GoalResponseDto],
  })
  async findAll(@Query('userId') userId: string): Promise<GoalResponseDto[]> {
    return this.goalsService.findByUserId(userId);
  }
}

