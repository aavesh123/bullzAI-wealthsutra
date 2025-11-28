import { ApiProperty } from '@nestjs/swagger';

class FixedExpensesDto {
  @ApiProperty()
  rentAmount: number;

  @ApiProperty()
  emiAmount: number;

  @ApiProperty()
  schoolFeesAmount: number;
}

export class ProfileResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  incomeMinPerDay: number;

  @ApiProperty()
  incomeMaxPerDay: number;

  @ApiProperty()
  workDaysPerWeek: number;

  @ApiProperty({ type: FixedExpensesDto })
  fixedExpenses: FixedExpensesDto;
}

