import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty({ enum: ['gig_worker', 'daily_wage'] })
  personaType: 'gig_worker' | 'daily_wage';

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

