import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { PlanResponseDto } from './dto/plan-response.dto';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get active plan' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Active plan found',
    type: PlanResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: 'No active plan found',
    schema: {
      type: 'null',
    },
  })
  async getActive(@Query('userId') userId: string): Promise<PlanResponseDto | null> {
    return this.plansService.findActiveByUserId(userId);
  }
}

