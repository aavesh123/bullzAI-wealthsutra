import { ApiProperty } from '@nestjs/swagger';

export class PlanResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ nullable: true })
  goalId: string | null;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  dailySavingTarget: number;

  @ApiProperty({ type: Object })
  spendingCaps: Record<string, number>;

  @ApiProperty()
  status: string;
}

