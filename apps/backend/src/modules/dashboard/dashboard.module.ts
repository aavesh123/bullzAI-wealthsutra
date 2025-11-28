import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TransactionsModule } from '../transactions/transactions.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [TransactionsModule, ProfilesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

