import { ApiProperty } from '@nestjs/swagger';

class CoachMessageDto {
  @ApiProperty()
  message: string;
}

class RiskEventDto {
  @ApiProperty({ enum: ['low', 'medium', 'high'] })
  riskLevel: 'low' | 'medium' | 'high';

  @ApiProperty()
  shortfallAmount: number;

  @ApiProperty()
  timeframe: string;
}

export class PlanResponseDto {
  @ApiProperty()
  plan: {
    _id: string;
    userId: string;
    goalId: string | null;
    startDate: Date;
    endDate: Date;
    dailySavingTarget: number;
    spendingCaps: Record<string, number>;
    status: string;
  };

  @ApiProperty({ type: CoachMessageDto })
  coach: CoachMessageDto;

  @ApiProperty({ type: RiskEventDto })
  risk: RiskEventDto;
}

