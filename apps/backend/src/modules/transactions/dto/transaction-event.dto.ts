import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsDateString, IsOptional } from 'class-validator';

export class TransactionEventDto {
  @ApiProperty()
  @IsDateString()
  timestamp: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: ['credit', 'debit'] })
  @IsEnum(['credit', 'debit'])
  direction: 'credit' | 'debit';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  merchant?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rawText?: string;
}

export class IngestTransactionsDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ type: [TransactionEventDto] })
  events: TransactionEventDto[];
}

