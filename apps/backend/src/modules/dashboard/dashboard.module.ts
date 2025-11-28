import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TransactionsModule } from '../transactions/transactions.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { HealthScoreSnapshot, HealthScoreSnapshotSchema } from '../../schemas/health-score.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HealthScoreSnapshot.name, schema: HealthScoreSnapshotSchema },
    ]),
    TransactionsModule,
    ProfilesModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

