import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { IngestTransactionsDto } from './dto/transaction-event.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ingest SMS/UPI transaction events' })
  @ApiResponse({
    status: 201,
    description: 'Transactions ingested',
    type: [TransactionResponseDto],
  })
  async ingest(
    @Body() ingestDto: IngestTransactionsDto,
  ): Promise<TransactionResponseDto[]> {
    return this.transactionsService.ingest(ingestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get transactions for user' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved',
    type: [TransactionResponseDto],
  })
  async findAll(
    @Query('userId') userId: string,
    @Query('limit') limit?: number,
  ): Promise<TransactionResponseDto[]> {
    return this.transactionsService.findByUserId(userId, limit ? parseInt(limit.toString()) : 100);
  }
}

