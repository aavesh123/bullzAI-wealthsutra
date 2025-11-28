# Next Steps for Database Setup and Testing

## ✅ Completed Steps

1. ✅ MongoDB connection configured in `app.module.ts`
2. ✅ MongoDB collections created:
   - `users`
   - `profiles`
   - `transactions`
   - `goals`
   - `plans`
   - `health_score_snapshots`
   - `risk_events`
3. ✅ All schemas registered in their respective modules
4. ✅ Database seeding script created

## 🚀 Immediate Next Steps

### 1. Verify MongoDB Connection

Make sure your MongoDB is running and accessible:

```bash
# If using local MongoDB
mongosh mongodb://localhost:27017/wealthsutra

# Or check if MongoDB is running
brew services list | grep mongodb  # macOS
# or
sudo systemctl status mongod       # Linux
```

### 2. Verify Environment Variables

Ensure your `.env` file in the backend directory contains:

```env
MONGODB_URI=mongodb://localhost:27017/wealthsutra
# Or your MongoDB Atlas connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wealthsutra
```

### 3. Install Dependencies (if not already done)

```bash
cd apps/backend
npm install
```

### 4. Seed the Database with Dummy Data

Run the seeding script to populate your database:

```bash
npm run seed
```

This will:
- Clear all existing data (⚠️ **Warning**: This will delete all data!)
- Create 5 test users with different persona types
- Create profiles for each user
- Generate 30 days of transaction history (credits and debits)
- Create goals for each user
- Create active plans for some users
- Generate health score snapshots (last 7 days)
- Create risk events for some users

### 5. Verify Seeded Data

You can verify the data was created by:

**Option A: Using MongoDB Compass or mongosh**
```bash
mongosh mongodb://localhost:27017/wealthsutra

# Check counts
db.users.countDocuments()
db.profiles.countDocuments()
db.transactions.countDocuments()
db.goals.countDocuments()
db.plans.countDocuments()
db.health_score_snapshots.countDocuments()
db.risk_events.countDocuments()

# View sample data
db.users.find().pretty()
db.transactions.find().limit(5).pretty()
```

**Option B: Using the API endpoints**
```bash
# Start the backend server
npm run start:dev

# Test endpoints (replace userId with actual ID from your database)
curl http://localhost:3000/users
curl http://localhost:3000/dashboard/<userId>
curl http://localhost:3000/transactions?userId=<userId>
```

## 📋 Additional Configuration Steps

### 6. Set Up Indexes (Optional but Recommended)

The seed script creates some indexes, but you may want to add more for performance:

```javascript
// In MongoDB shell or using Mongoose in your app:
db.transactions.createIndex({ userId: 1, timestamp: -1 })
db.plans.createIndex({ userId: 1, status: 1 })
db.goals.createIndex({ userId: 1, status: 1 })
```

### 7. Test API Endpoints

Once seeded, test your API endpoints:

```bash
# Get all users
curl http://localhost:3000/users

# Get user by ID (replace with actual ID)
curl http://localhost:3000/users/<userId>

# Get dashboard data
curl http://localhost:3000/dashboard/<userId>

# Get transactions
curl http://localhost:3000/transactions?userId=<userId>
```

## 🧪 Testing Checklist

- [ ] MongoDB connection successful
- [ ] `.env` file configured correctly
- [ ] Database seeded successfully
- [ ] All collections have data
- [ ] API endpoints return data correctly
- [ ] Relationships between collections work (userId references)

## 🔄 Re-seeding the Database

If you need to re-seed with fresh data:

```bash
npm run seed
```

**Note**: This will delete all existing data and create new dummy data.

## 📊 Seed Data Overview

The seed script creates:

- **5 Users**: Mix of gig workers and daily wage workers
- **5 Profiles**: One for each user with realistic income ranges and fixed expenses
- **~150+ Transactions**: 30 days of transaction history per user (mix of credits and debits)
- **5-15 Goals**: 1-3 goals per user (emi_payment, rent, emergency_fund, festival_savings)
- **3 Plans**: Active plans linked to goals
- **35 Health Score Snapshots**: 7 snapshots per user (last 7 days)
- **2-4 Risk Events**: Risk events for some users

## 🐛 Troubleshooting

### Error: Cannot connect to MongoDB
- Check if MongoDB is running
- Verify MONGODB_URI in `.env` file
- Check network connectivity if using MongoDB Atlas

### Error: Schema not found
- Ensure all schemas are registered in their modules
- Check that all modules are imported in `app.module.ts`

### Error: Duplicate key error
- The seed script clears existing data first, but if it fails midway, you may need to manually clear collections

### Seed script fails
- Check console output for specific errors
- Verify all dependencies are installed
- Ensure MongoDB is accessible

## 🎯 Next Development Steps

After seeding:

1. **Test API Endpoints**: Verify all CRUD operations work
2. **Test Agent Services**: Test the AI agent functionality with real data
3. **Test Dashboard**: Verify dashboard calculations with seeded data
4. **Add Validation**: Ensure DTOs validate input correctly
5. **Add Error Handling**: Improve error messages and handling
6. **Add Logging**: Add proper logging for debugging
7. **Add Tests**: Write unit and integration tests
8. **API Documentation**: Set up Swagger/OpenAPI documentation

## 📝 Notes

- The seed script uses realistic Indian financial data (phone numbers, amounts in INR)
- Transaction dates are spread over the last 30 days
- Health scores are randomly generated but follow realistic patterns
- All relationships (userId references) are properly maintained

