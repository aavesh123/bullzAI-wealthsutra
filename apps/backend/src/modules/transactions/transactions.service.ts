import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from '../../schemas/transaction.schema';
import { IngestTransactionsDto } from './dto/transaction-event.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async ingest(
    ingestDto: IngestTransactionsDto,
  ): Promise<TransactionResponseDto[]> {
    const transactions = ingestDto.events.map((event) => ({
      userId: ingestDto.userId,
      timestamp: new Date(event.timestamp),
      amount: event.amount,
      direction: event.direction,
      channel: event.channel || '',
      merchant: event.merchant || '',
      category: event.category || 'uncategorized',
      source: event.source || 'sms',
      rawText: event.rawText || '',
    }));

    const created = await this.transactionModel.insertMany(transactions);

    return created.map((t) => ({
      _id: t._id.toString(),
      userId: t.userId.toString(),
      timestamp: t.timestamp,
      amount: t.amount,
      direction: t.direction,
      channel: t.channel,
      merchant: t.merchant,
      category: t.category,
      source: t.source,
      rawText: t.rawText,
    }));
  }

  async findByUserId(
    userId: string,
    limit: number = 100,
  ): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);

    return transactions.map((t) => ({
      _id: t._id.toString(),
      userId: t.userId.toString(),
      timestamp: t.timestamp,
      amount: t.amount,
      direction: t.direction,
      channel: t.channel,
      merchant: t.merchant,
      category: t.category,
      source: t.source,
      rawText: t.rawText,
    }));
  }

  async getRecentTransactions(
    userId: string,
    days: number = 7,
  ): Promise<TransactionDocument[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.transactionModel
      .find({
        userId,
        timestamp: { $gte: startDate },
      })
      .sort({ timestamp: -1 });
  }
}

