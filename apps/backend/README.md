# WealthSutra Backend

NestJS backend for WealthSutra financial planning application.

## Features

- Transaction ingestion from SMS/UPI events
- Dashboard summarization with health scores
- Multi-agent orchestration for financial planning
- Goal and plan management
- OpenAI-powered coach messages
- Swagger API documentation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `apps/backend` directory:
```env
MONGODB_URI=mongodb://localhost:27017/wealthsutra
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
NODE_ENV=development
PORT=4000
```

3. Start the development server:
```bash
npm run start:dev
```

The server will start on `http://localhost:4000` and Swagger documentation will be available at `http://localhost:4000/api/docs`.

**Note:** You may see a deprecation warning about shell option in child processes. This is a harmless warning from the NestJS CLI and doesn't affect functionality. To suppress it, you can set:
```bash
NODE_OPTIONS="--no-deprecation" npm run start:dev
```

## API Endpoints

All endpoints are prefixed with `/api`:

- `POST /api/users` - Create or fetch user
- `GET /api/users/me` - Get current user
- `POST /api/profile` - Create/update profile
- `GET /api/profile?userId=...` - Get user profile
- `POST /api/transactions/ingest` - Ingest transaction events
- `GET /api/dashboard?userId=...` - Get dashboard summary
- `POST /api/goals` - Create goal
- `GET /api/goals?userId=...` - List goals
- `GET /api/plans/active?userId=...` - Get active plan
- `POST /api/agent/plan` - Generate plan using multi-agent orchestration

## Architecture

### Modules

- **UsersModule** - User management
- **ProfilesModule** - User profile management
- **TransactionsModule** - Transaction ingestion and retrieval
- **DashboardModule** - Dashboard summarization
- **GoalsModule** - Financial goals management
- **PlansModule** - Financial plans management
- **AgentModule** - Multi-agent orchestration

### Multi-Agent System

The agent system consists of:

1. **AnalystAgent** - Analyzes income, spending, and generates insights
2. **RiskDetectorAgent** - Detects financial risks and shortfalls
3. **PlannerAgent** - Creates savings targets and spending caps
4. **CoachAgent** - Generates natural language guidance using OpenAI

## Testing

Use Swagger UI at `http://localhost:4000/api/docs` to test all endpoints interactively.

