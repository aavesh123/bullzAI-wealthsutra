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

// User definitions
const USERS = [
  {
    phoneNumber: '+919876500001',
    name: 'Ravi',
    personaType: 'gig_worker' as const,
    city: 'Mumbai',
    occupation: 'Swiggy Delivery Partner',
    incomeMinPerDay: 600,
    incomeMaxPerDay: 1200,
    workDaysPerWeek: 5,
    icon: '🚴',
  },
  {
    phoneNumber: '+919876500002',
    name: 'Ramesh',
    personaType: 'daily_wage' as const,
    city: 'Delhi',
    occupation: 'Construction Worker',
    incomeMinPerDay: 400,
    incomeMaxPerDay: 800,
    workDaysPerWeek: 6,
    icon: '👷',
  },
];

async function seed() {
  console.log('🌱 Starting database seed...');
  console.log('📋 Seeding data for 2 users: Ravi (Gig Worker) and Ramesh (Daily Wage Worker)');

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
    console.log('  ✓ All existing data cleared');

    const users = [];
    const profiles = [];

    // Create users and profiles
    for (const userDef of USERS) {
      console.log(`\n👤 Creating user: ${userDef.name} (${userDef.occupation})...`);
      
      // Create user
      const user = await userModel.create({
        phoneNumber: userDef.phoneNumber,
        personaType: userDef.personaType,
      });
      users.push(user);
      console.log(`  ✓ Created user: ${userDef.name} (${userDef.phoneNumber})`);
      console.log(`  📝 User ID: ${user._id.toString()}`);

      // Create profile
      const profile = await profileModel.create({
        userId: user._id,
        city: userDef.city,
        incomeMinPerDay: userDef.incomeMinPerDay,
        incomeMaxPerDay: userDef.incomeMaxPerDay,
        workDaysPerWeek: userDef.workDaysPerWeek,
        fixedExpenses: {
          rentAmount: 10000, // Fixed amount: ₹10,000/month
          emiAmount: 5000,   // Fixed amount: ₹5,000/month
          schoolFeesAmount: 3000, // Fixed amount: ₹3,000/month
        },
      });
      profiles.push(profile);
      console.log(`  ✓ Created profile for ${userDef.name}`);
    }

    // Create transactions for each user
    console.log('\n💳 Creating transactions...');
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
    
    // Different merchants/sources based on persona type
    const gigWorkerMerchants = ['Swiggy', 'Zomato', 'Ola', 'Uber', 'Amazon', 'DMart'];
    const dailyWageMerchants = ['Local Market', 'Tea Stall', 'Auto Rickshaw', 'Medical Store', 'Kirana Store'];
    const gigWorkerSources = ['Freelance', 'Rides', 'Delivery'];
    const dailyWageSources = ['Daily Wage', 'Construction', 'Labor'];

    const now = new Date();

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const profile = profiles[i];
      const userDef = USERS[i];
      const transactions = [];

      const merchants = userDef.personaType === 'gig_worker' ? gigWorkerMerchants : dailyWageMerchants;
      const sources = userDef.personaType === 'gig_worker' ? gigWorkerSources : dailyWageSources;

      // Generate transactions for the last 30 days
      for (let day = 0; day < 30; day++) {
        const transactionDate = subtractDays(now, day);
        
        // Income transactions (credits) - 1-2 per day
        const numIncomePerDay = randomInt(1, 2);
        for (let j = 0; j < numIncomePerDay; j++) {
          const incomeAmount = randomInt(
            Math.floor(profile.incomeMinPerDay / numIncomePerDay),
            Math.floor(profile.incomeMaxPerDay / numIncomePerDay),
          );
          
          const dayStart = new Date(transactionDate);
          dayStart.setHours(6, 0, 0, 0); // Earlier start for daily wage workers
          const dayEnd = new Date(transactionDate);
          dayEnd.setHours(20, 0, 0, 0);
          
          transactions.push({
            userId: user._id,
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
          expenseDayStart.setHours(6, 0, 0, 0);
          const expenseDayEnd = new Date(transactionDate);
          expenseDayEnd.setHours(22, 0, 0, 0);
          
          transactions.push({
            userId: user._id,
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
      console.log(`  ✓ Created ${transactions.length} transactions for ${userDef.name}`);
    }

    // Create goals for each user
    console.log('\n🎯 Creating goals...');
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userDef = USERS[i];
      const goals = [];
      
      // EMI Payment goal
      goals.push(await goalModel.create({
        userId: user._id,
        type: 'emi_payment',
        targetAmount: 5000,
        targetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active',
      }));

      // Rent goal
      goals.push(await goalModel.create({
        userId: user._id,
        type: 'rent',
        targetAmount: 10000,
        targetDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        status: 'active',
      }));

      // Emergency fund goal
      goals.push(await goalModel.create({
        userId: user._id,
        type: 'emergency_fund',
        targetAmount: 25000,
        targetDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        status: 'active',
      }));

      console.log(`  ✓ Created ${goals.length} goals for ${userDef.name}`);
    }

    // Create plans for each user
    console.log('\n📅 Creating plans...');
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userDef = USERS[i];
      const userGoals = await goalModel.find({ userId: user._id, status: 'active' });
      
      if (userGoals.length > 0) {
        const goal = userGoals[0];
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        await planModel.create({
          userId: user._id,
          goalId: goal._id,
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
        console.log(`  ✓ Created plan for ${userDef.name}`);
      }
    }

    // Create health score snapshots for each user (last 7 days)
    console.log('\n💚 Creating health score snapshots...');
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userDef = USERS[i];
      
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
          userId: user._id,
          score,
          label,
          calculatedAt,
          context,
        });
      }
      console.log(`  ✓ Created 7 health score snapshots for ${userDef.name}`);
    }

    // Create risk events for each user
    console.log('\n⚠️  Creating risk events...');
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userDef = USERS[i];
      
      await riskEventModel.create({
        userId: user._id,
        riskLevel: 'medium',
        shortfallAmount: randomInt(2000, 5000),
        timeframe: 'next month',
      });
      console.log(`  ✓ Created risk event for ${userDef.name}`);
    }

    // Summary
    console.log('\n✅ Database seed completed!');
    console.log('📊 Summary:');
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userDef = USERS[i];
      const profileCount = await profileModel.countDocuments({ userId: user._id });
      const transactionCount = await transactionModel.countDocuments({ userId: user._id });
      const goalCount = await goalModel.countDocuments({ userId: user._id });
      const planCount = await planModel.countDocuments({ userId: user._id });
      
      console.log(`\n   ${userDef.icon} ${userDef.name} (${userDef.occupation}):`);
      console.log(`      Phone: ${userDef.phoneNumber}`);
      console.log(`      User ID: ${user._id.toString()}`);
      console.log(`      Profile: ${profileCount}`);
      console.log(`      Transactions: ${transactionCount}`);
      console.log(`      Goals: ${goalCount}`);
      console.log(`      Plans: ${planCount}`);
    }

    const totalUserCount = await userModel.countDocuments();
    const totalTransactionCount = await transactionModel.countDocuments();
    console.log(`\n   Total Users: ${totalUserCount}`);
    console.log(`   Total Transactions: ${totalTransactionCount}`);

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
