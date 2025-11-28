import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: ['credit', 'debit'] })
  direction: 'credit' | 'debit';

  @ApiProperty()
  channel: string;

  @ApiProperty()
  merchant: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  source: string;

  @ApiProperty()
  rawText: string;
}

