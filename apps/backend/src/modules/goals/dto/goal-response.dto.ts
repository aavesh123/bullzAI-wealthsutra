import { ApiProperty } from '@nestjs/swagger';

export class GoalResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ['emi_payment', 'rent', 'emergency_fund', 'festival_savings'] })
  type: 'emi_payment' | 'rent' | 'emergency_fund' | 'festival_savings';

  @ApiProperty()
  targetAmount: number;

  @ApiProperty()
  targetDate: Date;

  @ApiProperty()
  status: string;
}

