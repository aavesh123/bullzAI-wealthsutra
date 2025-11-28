import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ enum: ['gig_worker', 'daily_wage'], example: 'gig_worker' })
  @IsEnum(['gig_worker', 'daily_wage'])
  @IsNotEmpty()
  personaType: 'gig_worker' | 'daily_wage';
}

