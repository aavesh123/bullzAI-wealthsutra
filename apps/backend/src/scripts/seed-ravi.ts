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

async function seedRavi() {
  console.log('👤 Starting Ravi data seeding...');

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
    // Check if Ravi already exists
    let ravi = await userModel.findOne({ phoneNumber: '+919876500001' });
    
    if (ravi) {
      console.log('⚠️  Ravi user already exists. Deleting existing Ravi data...');
      const raviUserId = ravi._id;
      
      // Delete all existing Ravi data
      await profileModel.deleteMany({ userId: raviUserId });
      await transactionModel.deleteMany({ userId: raviUserId });
      await goalModel.deleteMany({ userId: raviUserId });
      await planModel.deleteMany({ userId: raviUserId });
      await healthScoreModel.deleteMany({ userId: raviUserId });
      await riskEventModel.deleteMany({ userId: raviUserId });
      await userModel.deleteOne({ _id: raviUserId });
      console.log('  ✓ Cleared existing Ravi data');
    }

    // Create Ravi user
    console.log('👤 Creating Ravi user...');
    ravi = await userModel.create({
      phoneNumber: '+919876500001',
      personaType: 'gig_worker', // Ravi is a gig worker
    });
    console.log(`  ✓ Created user: Ravi (${ravi.phoneNumber})`);
    console.log(`  📝 User ID (use this for API calls): ${ravi._id.toString()}`);

    // Create Ravi's profile
    console.log('📋 Creating Ravi\'s profile...');
    const profile = await profileModel.create({
      userId: ravi._id,
      city: 'Mumbai',
      incomeMinPerDay: 600,
      incomeMaxPerDay: 1200,
      workDaysPerWeek: 5,
      fixedExpenses: {
        rentAmount: 10000, // Fixed amount: ₹10,000/month
        emiAmount: 5000,   // Fixed amount: ₹5,000/month
        schoolFeesAmount: 3000, // Fixed amount: ₹3,000/month
      },
    });
    console.log('  ✓ Created profile for Ravi');

    // Create transactions for Ravi (last 30 days)
    console.log('💳 Creating transactions for Ravi...');
    const categories = [
      'Food & Dining',
      'Transport',
      'Shopping',
      'Utilities',
      'Healthcare',
      'Entertainment',
      'Education',
    ];
    const channels = ['UPI', 'Cash', 'Bank Transfer'];
    const merchants = [
      'Swiggy',
      'Zomato',
      'Ola',
      'Uber',
      'Amazon',
      'DMart',
      'School Fees',
    ];
    const sources = ['Freelance', 'Rides', 'Delivery'];

    const now = new Date();
    const transactions = [];

    // Generate transactions for the last 30 days
    for (let day = 0; day < 30; day++) {
      const transactionDate = subtractDays(now, day);
      
      // Income transactions (credits) - 1-2 per day
      const numIncomePerDay = randomInt(1, 2);
      for (let j = 0; j < numIncomePerDay; j++) {
        const incomeAmount = randomInt(550, 1100);
        
        const dayStart = new Date(transactionDate);
        dayStart.setHours(9, 0, 0, 0);
        const dayEnd = new Date(transactionDate);
        dayEnd.setHours(18, 0, 0, 0);
        
        transactions.push({
          userId: ravi._id,
          timestamp: randomDate(dayStart, dayEnd),
          amount: incomeAmount,
          direction: 'credit',
          channel: channels[randomInt(0, channels.length - 1)],
          merchant: null,
          category: 'Income',
          source: sources[randomInt(0, sources.length - 1)],
          rawText: `Received ₹${incomeAmount} via ${channels[randomInt(0, channels.length - 1)]}`,
        });
      }

      // Expense transactions (debits) - 2-4 per day
      const numExpensesPerDay = randomInt(2, 4);
      for (let j = 0; j < numExpensesPerDay; j++) {
        const expenseAmount = randomInt(50, 400);
        
        const expenseDayStart = new Date(transactionDate);
        expenseDayStart.setHours(8, 0, 0, 0);
        const expenseDayEnd = new Date(transactionDate);
        expenseDayEnd.setHours(22, 0, 0, 0);
        
        transactions.push({
          userId: ravi._id,
          timestamp: randomDate(expenseDayStart, expenseDayEnd),
          amount: expenseAmount,
          direction: 'debit',
          channel: channels[randomInt(0, channels.length - 1)],
          merchant: merchants[randomInt(0, merchants.length - 1)],
          category: categories[randomInt(0, categories.length - 1)],
          source: null,
          rawText: `Paid ₹${expenseAmount} to ${merchants[randomInt(0, merchants.length - 1)]}`,
        });
      }
    }

    await transactionModel.insertMany(transactions);
    console.log(`  ✓ Created ${transactions.length} transactions for Ravi`);

    // Create goals for Ravi
    console.log('🎯 Creating goals for Ravi...');
    const goals = [];
    
    // EMI Payment goal
    goals.push(await goalModel.create({
      userId: ravi._id,
      type: 'emi_payment',
      targetAmount: 5000,
      targetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'active',
    }));

    // Rent goal
    goals.push(await goalModel.create({
      userId: ravi._id,
      type: 'rent',
      targetAmount: 12000,
      targetDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      status: 'active',
    }));

    // Emergency fund goal
    goals.push(await goalModel.create({
      userId: ravi._id,
      type: 'emergency_fund',
      targetAmount: 25000,
      targetDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      status: 'active',
    }));

    console.log(`  ✓ Created ${goals.length} goals for Ravi`);

    // Create an active plan for Ravi
    console.log('📅 Creating plan for Ravi...');
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const plan = await planModel.create({
      userId: ravi._id,
      goalId: goals[0]._id, // Link to EMI payment goal
      startDate,
      endDate,
      dailySavingTarget: 150,
      spendingCaps: {
        'Food & Dining': 4500,
        'Transport': 3000,
        'Shopping': 2000,
      },
      status: 'active',
    });
    console.log('  ✓ Created active plan for Ravi');

    // Create health score snapshots for Ravi (last 7 days)
    console.log('💚 Creating health score snapshots for Ravi...');
    for (let day = 0; day < 7; day++) {
      const calculatedAt = subtractDays(now, day);
      const score = randomInt(45, 75); // Moderate health score
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
        userId: ravi._id,
        score,
        label,
        calculatedAt,
        context,
      });
    }
    console.log('  ✓ Created 7 health score snapshots for Ravi');

    // Create risk event for Ravi
    console.log('⚠️  Creating risk event for Ravi...');
    await riskEventModel.create({
      userId: ravi._id,
      riskLevel: 'medium',
      shortfallAmount: 3500,
      timeframe: 'next month',
    });
    console.log('  ✓ Created risk event for Ravi');

    // Summary
    const profileCount = await profileModel.countDocuments({ userId: ravi._id });
    const transactionCount = await transactionModel.countDocuments({ userId: ravi._id });
    const goalCount = await goalModel.countDocuments({ userId: ravi._id });
    const planCount = await planModel.countDocuments({ userId: ravi._id });
    const healthScoreCount = await healthScoreModel.countDocuments({ userId: ravi._id });
    const riskEventCount = await riskEventModel.countDocuments({ userId: ravi._id });

    console.log('\n✅ Ravi data seeding completed!');
    console.log('📊 Summary:');
    console.log(`   User ID: ${ravi._id.toString()}`);
    console.log(`   Phone: ${ravi.phoneNumber}`);
    console.log(`   Profile: ${profileCount}`);
    console.log(`   Transactions: ${transactionCount}`);
    console.log(`   Goals: ${goalCount}`);
    console.log(`   Plans: ${planCount}`);
    console.log(`   Health Score Snapshots: ${healthScoreCount}`);
    console.log(`   Risk Events: ${riskEventCount}`);
    console.log('\n🎯 Use this userId for API testing:');
    console.log(`   ${ravi._id.toString()}`);

  } catch (error) {
    console.error('❌ Error seeding Ravi data:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seedRavi()
  .then(() => {
    console.log('\n🎉 Ravi seed script finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Ravi seed script failed:', error);
    process.exit(1);
  });

