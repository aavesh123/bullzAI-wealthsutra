import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Profile, ProfileDocument } from '../schemas/profile.schema';
import { Transaction, TransactionDocument } from '../schemas/transaction.schema';
import { Goal, GoalDocument } from '../schemas/goal.schema';
import { Plan, PlanDocument } from '../schemas/plan.schema';
import { HealthScoreSnapshot, HealthScoreSnapshotDocument } from '../schemas/health-score.schema';
import { RiskEvent, RiskEventDocument } from '../schemas/risk-event.schema';

// Helper function to get a random element from an array
const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get a random number in range
const randomInt = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to get a random date within range
const randomDate = (start: Date, end: Date): Date => 
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Helper function to subtract days from date
const subtractDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

async function seed() {
  console.log('🌱 Starting database seed...');

  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Get models
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const profileModel = app.get<Model<ProfileDocument>>(getModelToken(Profile.name));
  const transactionModel = app.get<Model<TransactionDocument>>(getModelToken(Transaction.name));
  const goalModel = app.get<Model<GoalDocument>>(getModelToken(Goal.name));
  const planModel = app.get<Model<PlanDocument>>(getModelToken(Plan.name));
  const healthScoreModel = app.get<Model<HealthScoreSnapshotDocument>>(getModelToken(HealthScoreSnapshot.name));
  const riskEventModel = app.get<Model<RiskEventDocument>>(getModelToken(RiskEvent.name));

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await userModel.deleteMany({});
    await profileModel.deleteMany({});
    await transactionModel.deleteMany({});
    await goalModel.deleteMany({});
    await planModel.deleteMany({});
    await healthScoreModel.deleteMany({});
    await riskEventModel.deleteMany({});

    // Create users
    console.log('👤 Creating users...');
    const users = [];
    const phoneNumbers = [
      '+919876543210',
      '+919876543211',
      '+919876543212',
      '+919876543213',
      '+919876543214',
    ];
    
    const personaTypes: ('gig_worker' | 'daily_wage')[] = ['gig_worker', 'daily_wage'];

    for (let i = 0; i < phoneNumbers.length; i++) {
      const user = await userModel.create({
        phoneNumber: phoneNumbers[i],
        personaType: random(personaTypes),
      });
      users.push(user);
      console.log(`  ✓ Created user: ${user.phoneNumber} (${user.personaType})`);
    }

    // Create profiles for each user
    console.log('📋 Creating profiles...');
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad'];
    const profiles = [];

    for (const user of users) {
      const isGigWorker = user.personaType === 'gig_worker';
      const profile = await profileModel.create({
        userId: user._id,
        city: random(cities),
        incomeMinPerDay: isGigWorker ? randomInt(500, 800) : randomInt(400, 600),
        incomeMaxPerDay: isGigWorker ? randomInt(1000, 1500) : randomInt(700, 900),
        workDaysPerWeek: randomInt(5, 6),
        fixedExpenses: {
          rentAmount: randomInt(5000, 15000),
          emiAmount: randomInt(0, 8000),
          schoolFeesAmount: randomInt(0, 5000),
        },
      });
      profiles.push(profile);
      console.log(`  ✓ Created profile for user: ${user.phoneNumber}`);
    }

    // Create transactions for each user
    console.log('💳 Creating transactions...');
    const categories = [
      'Food & Dining',
      'Transport',
      'Shopping',
      'Utilities',
      'Healthcare',
      'Entertainment',
      'Education',
      'Insurance',
    ];
    const channels = ['UPI', 'Cash', 'Bank Transfer', 'Card'];
    const merchants = [
      'Swiggy',
      'Zomato',
      'Ola',
      'Uber',
      'Amazon',
      'Flipkart',
      'Reliance Fresh',
      'DMart',
      'Apollo Pharmacy',
      'School Fees',
    ];
    const sources = ['Salary', 'Freelance', 'Rides', 'Delivery', 'Other'];

    const now = new Date();
    let totalTransactions = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const profile = profiles[i];
      const userTransactions = [];

      // Generate transactions for the last 30 days
      for (let day = 0; day < 30; day++) {
        const transactionDate = subtractDays(now, day);
        
        // Income transactions (credits) - 1-3 per day
        const numIncomePerDay = randomInt(1, 3);
        for (let j = 0; j < numIncomePerDay; j++) {
          const incomeAmount = randomInt(
            profile.incomeMinPerDay / numIncomePerDay,
            profile.incomeMaxPerDay / numIncomePerDay,
          );
          
          const dayStart = new Date(transactionDate);
          dayStart.setHours(9, 0, 0, 0);
          const dayEnd = new Date(transactionDate);
          dayEnd.setHours(18, 0, 0, 0);
          
          const incomeTransaction = await transactionModel.create({
            userId: user._id,
            timestamp: randomDate(dayStart, dayEnd),
            amount: incomeAmount,
            direction: 'credit',
            channel: random(channels),
            merchant: null,
            category: 'Income',
            source: random(sources),
            rawText: `Received ${incomeAmount} via ${random(channels)}`,
          });
          userTransactions.push(incomeTransaction);
        }

        // Expense transactions (debits) - 2-5 per day
        const numExpensesPerDay = randomInt(2, 5);
        for (let j = 0; j < numExpensesPerDay; j++) {
          const expenseAmount = randomInt(50, 500);
          
          const expenseDayStart = new Date(transactionDate);
          expenseDayStart.setHours(8, 0, 0, 0);
          const expenseDayEnd = new Date(transactionDate);
          expenseDayEnd.setHours(22, 0, 0, 0);
          
          const expenseTransaction = await transactionModel.create({
            userId: user._id,
            timestamp: randomDate(expenseDayStart, expenseDayEnd),
            amount: expenseAmount,
            direction: 'debit',
            channel: random(channels),
            merchant: random(merchants),
            category: random(categories),
            source: null,
            rawText: `Paid ${expenseAmount} to ${random(merchants)}`,
          });
          userTransactions.push(expenseTransaction);
        }
      }

      totalTransactions += userTransactions.length;
      console.log(`  ✓ Created ${userTransactions.length} transactions for user: ${user.phoneNumber}`);
    }

    // Create goals for each user
    console.log('🎯 Creating goals...');
    const goalTypes: ('emi_payment' | 'rent' | 'emergency_fund' | 'festival_savings')[] = [
      'emi_payment',
      'rent',
      'emergency_fund',
      'festival_savings',
    ];

    for (const user of users) {
      const numGoals = randomInt(1, 3);
      const selectedGoalTypes = [...goalTypes].sort(() => 0.5 - Math.random()).slice(0, numGoals);

      for (const goalType of selectedGoalTypes) {
        const targetAmount = (() => {
          switch (goalType) {
            case 'emi_payment':
              return randomInt(5000, 15000);
            case 'rent':
              return randomInt(5000, 20000);
            case 'emergency_fund':
              return randomInt(10000, 50000);
            case 'festival_savings':
              return randomInt(2000, 10000);
            default:
              return 10000;
          }
        })();

        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + randomInt(1, 6));

        await goalModel.create({
          userId: user._id,
          type: goalType,
          targetAmount,
          targetDate,
          status: random(['active', 'completed', 'paused']),
        });
      }
      console.log(`  ✓ Created goals for user: ${user.phoneNumber}`);
    }

    // Create plans for some users
    console.log('📅 Creating plans...');
    const goals = await goalModel.find({ status: 'active' }).limit(3);

    for (let i = 0; i < Math.min(users.length, 3); i++) {
      const user = users[i];
      const userGoals = await goalModel.find({ userId: user._id, status: 'active' });
      
      if (userGoals.length > 0) {
        const goal = userGoals[0];
        const startDate = new Date();
        const endDate = new Date(goal.targetDate);
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const dailySavingTarget = Math.ceil(goal.targetAmount / daysDiff);

        await planModel.create({
          userId: user._id,
          goalId: goal._id,
          startDate,
          endDate,
          dailySavingTarget,
          spendingCaps: {
            'Food & Dining': randomInt(100, 300),
            'Transport': randomInt(50, 200),
            'Shopping': randomInt(200, 500),
          },
          status: 'active',
        });
        console.log(`  ✓ Created plan for user: ${user.phoneNumber}`);
      }
    }

    // Create health score snapshots for each user (last 7 days)
    console.log('💚 Creating health score snapshots...');
    for (const user of users) {
      for (let day = 0; day < 7; day++) {
        const calculatedAt = subtractDays(now, day);
        const score = randomInt(30, 95);
        let label: 'Unstable' | 'Improving' | 'Stable';
        let context: string;

        if (score < 40) {
          label = 'Unstable';
          context = 'High spending relative to income. Consider reducing expenses.';
        } else if (score < 70) {
          label = 'Improving';
          context = 'Moderate financial health. Focus on building savings.';
        } else {
          label = 'Stable';
          context = 'Good financial health. Maintain current spending patterns.';
        }

        await healthScoreModel.create({
          userId: user._id,
          score,
          label,
          calculatedAt,
          context,
        });
      }
      console.log(`  ✓ Created health score snapshots for user: ${user.phoneNumber}`);
    }

    // Create risk events for some users
    console.log('⚠️  Creating risk events...');
    const riskLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const timeframes = ['next week', 'next month', 'next 2 weeks', 'next 3 weeks'];

    for (let i = 0; i < Math.min(users.length, 2); i++) {
      const user = users[i];
      const numRisks = randomInt(1, 2);

      for (let j = 0; j < numRisks; j++) {
        await riskEventModel.create({
          userId: user._id,
          riskLevel: random(riskLevels),
          shortfallAmount: randomInt(1000, 10000),
          timeframe: random(timeframes),
        });
      }
      console.log(`  ✓ Created risk events for user: ${user.phoneNumber}`);
    }

    // Summary
    const userCount = await userModel.countDocuments();
    const profileCount = await profileModel.countDocuments();
    const transactionCount = await transactionModel.countDocuments();
    const goalCount = await goalModel.countDocuments();
    const planCount = await planModel.countDocuments();
    const healthScoreCount = await healthScoreModel.countDocuments();
    const riskEventCount = await riskEventModel.countDocuments();

    console.log('\n✅ Database seed completed!');
    console.log('📊 Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Profiles: ${profileCount}`);
    console.log(`   Transactions: ${transactionCount}`);
    console.log(`   Goals: ${goalCount}`);
    console.log(`   Plans: ${planCount}`);
    console.log(`   Health Score Snapshots: ${healthScoreCount}`);
    console.log(`   Risk Events: ${riskEventCount}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed()
  .then(() => {
    console.log('\n🎉 Seed script finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed script failed:', error);
    process.exit(1);
  });

