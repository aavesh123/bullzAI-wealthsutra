import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreatePlanRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ required: false, enum: ['initial_plan', 'risk_adjustment'] })
  @IsOptional()
  @IsEnum(['initial_plan', 'risk_adjustment'])
  trigger?: 'initial_plan' | 'risk_adjustment';
}

