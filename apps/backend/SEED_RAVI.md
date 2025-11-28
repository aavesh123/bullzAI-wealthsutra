# Adding Ravi's Test Data to Database

This guide explains how to add test data for a user named "Ravi" to test the complete API flow.

## Quick Start

Run this command to create Ravi and all his data:

```bash
cd apps/backend
npm run seed:ravi
```

## What Gets Created

The script creates a complete user profile for **Ravi** with data in all relevant collections:

### 1. **User** 👤
- Phone Number: `+919876500001`
- Persona Type: `gig_worker`
- **Note**: The userId will be a MongoDB ObjectId (displayed at the end)

### 2. **Profile** 📋
- City: Mumbai
- Income Range: ₹600-1200 per day
- Work Days: 5 days per week
- Fixed Expenses:
  - Rent: ₹12,000/month
  - EMI: ₹5,000/month
  - School Fees: ₹3,000/month

### 3. **Transactions** 💳
- **~90+ transactions** over the last 30 days
- Mix of credits (income) and debits (expenses)
- Realistic categories: Food & Dining, Transport, Shopping, etc.
- Various payment channels: UPI, Cash, Bank Transfer

### 4. **Goals** 🎯
- **3 active goals**:
  1. EMI Payment: ₹5,000 (due in 30 days)
  2. Rent: ₹12,000 (due in 15 days)
  3. Emergency Fund: ₹25,000 (due in 90 days)

### 5. **Plan** 📅
- **Active plan** linked to EMI Payment goal
- Daily saving target: ₹150
- Spending caps:
  - Food & Dining: ₹4,500/month
  - Transport: ₹3,000/month
  - Shopping: ₹2,000/month
- Duration: 30 days

### 6. **Health Score Snapshots** 💚
- 7 days of health score history
- Scores range from 45-75 (moderate health)

### 7. **Risk Event** ⚠️
- Risk Level: `medium`
- Shortfall Amount: ₹3,500
- Timeframe: "next month"

## Important: Getting the UserId

After running the script, it will display:

```
✅ Ravi data seeding completed!
📊 Summary:
   User ID: 692a107c0a294445002f0616
   Phone: +919876500001
   ...
   
🎯 Use this userId for API testing:
   692a107c0a294445002f0616
```

**Copy this userId** - you'll need it for all API calls!

## Using Ravi's Data for Testing

### Test Dashboard
```bash
GET /api/dashboard?userId=692a107c0a294445002f0616
```

### Test Goals
```bash
GET /api/goals?userId=692a107c0a294445002f0616
```

### Test Active Plan
```bash
GET /api/plans/active?userId=692a107c0a294445002f0616
```

### Test Transactions
```bash
GET /api/transactions?userId=692a107c0a294445002f0616
```

### Test Agent Plan Generation
```bash
POST /api/agent/plan
{
  "userId": "692a107c0a294445002f0616"
}
```

## Re-running the Script

If you run the script again:
- It will **automatically delete** existing Ravi data first
- Then create fresh data
- This ensures clean, consistent test data

The script checks for Ravi by phone number (`+919876500001`) and removes all related data before creating new data.

## Notes

1. **UserId is an ObjectId**: MongoDB uses ObjectIds, not simple strings like "ravi". The script outputs the actual ObjectId you need to use.

2. **All Collections Populated**: Ravi has data in:
   - ✅ `users`
   - ✅ `profiles`
   - ✅ `transactions`
   - ✅ `goals`
   - ✅ `plans`
   - ✅ `health_score_snapshots`
   - ✅ `risk_events`

3. **Realistic Data**: The data is designed to:
   - Show moderate financial health
   - Have realistic spending patterns
   - Include active goals and plans
   - Work perfectly with the `/api/agent/plan` endpoint

4. **Compatible with Existing Data**: Ravi's data won't interfere with other seeded users (if you ran `npm run seed`). It only removes and recreates Ravi's data.

## Troubleshooting

### Error: Cannot connect to MongoDB
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env` file

### Error: Duplicate key error
- The script should handle this automatically
- If it persists, manually delete Ravi's user first

### Can't find the userId
- Check the console output after running the script
- The userId is displayed at the end of the summary
- You can also query: `GET /api/users` to find Ravi's userId

## Next Steps

After seeding Ravi's data:
1. ✅ Copy the userId from the script output
2. ✅ Test the dashboard endpoint
3. ✅ Test the goals endpoint
4. ✅ Test the agent plan generation
5. ✅ Use Swagger UI for interactive testing

Happy testing! 🚀

