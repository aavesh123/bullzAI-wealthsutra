import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class FixedExpensesDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  rentAmount?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  emiAmount?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  schoolFeesAmount?: number;
}

export class CreateProfileDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  incomeMinPerDay?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  incomeMaxPerDay?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  workDaysPerWeek?: number;

  @ApiProperty({ type: FixedExpensesDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FixedExpensesDto)
  fixedExpenses?: FixedExpensesDto;
}

