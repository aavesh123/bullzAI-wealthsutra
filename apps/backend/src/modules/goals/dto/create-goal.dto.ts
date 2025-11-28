import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateGoalDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    enum: ['emi_payment', 'rent', 'emergency_fund', 'festival_savings'],
  })
  @IsEnum(['emi_payment', 'rent', 'emergency_fund', 'festival_savings'])
  @IsNotEmpty()
  type: 'emi_payment' | 'rent' | 'emergency_fund' | 'festival_savings';

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  targetAmount: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  targetDate: string;

  @ApiProperty({ required: false })
  @IsString()
  status?: string;
}

