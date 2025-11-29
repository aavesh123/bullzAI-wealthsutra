import { ApiProperty } from '@nestjs/swagger';

class CategorySpendingDto {
  @ApiProperty()
  category: string;

  @ApiProperty()
  amount: number;
}

class HealthScoreDto {
  @ApiProperty()
  score: number;

  @ApiProperty({ enum: ['Unstable', 'Improving', 'Stable'] })
  label: 'Unstable' | 'Improving' | 'Stable';

  @ApiProperty()
  context: string;
}

export class DashboardResponseDto {
  @ApiProperty()
  incomeTotal: number;

  @ApiProperty()
  spendTotal: number;

  @ApiProperty({ type: [CategorySpendingDto] })
  categories: CategorySpendingDto[];

  @ApiProperty()
  emiAmount: number;

  @ApiProperty()
  rentAmount: number;

  @ApiProperty()
  schoolFeesAmount: number;

  @ApiProperty()
  projectedShortfall: number;

  @ApiProperty({ type: HealthScoreDto })
  healthScore: HealthScoreDto;
}

