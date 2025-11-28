import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePlanRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;
}

