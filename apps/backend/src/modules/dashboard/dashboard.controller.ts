import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard summary' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary',
    type: DashboardResponseDto,
  })
  async getDashboard(
    @Query('userId') userId: string,
  ): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboard(userId);
  }
}

