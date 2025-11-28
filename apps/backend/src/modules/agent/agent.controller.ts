import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { CreatePlanRequestDto } from './dto/create-plan-request.dto';
import { PlanResponseDto } from './dto/agent-output.dto';

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('plan')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate plan using multi-agent orchestration' })
  @ApiResponse({
    status: 201,
    description: 'Plan generated successfully',
    type: PlanResponseDto,
  })
  async generatePlan(
    @Body() request: CreatePlanRequestDto,
  ): Promise<PlanResponseDto> {
    return this.agentService.generatePlan(request);
  }
}

