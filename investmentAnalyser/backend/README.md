# Investment Analyzer — Node.js Backend

Node.js/TypeScript backend for the Investment Analyzer project.

## Architecture

- **Controllers**: Handle HTTP requests/responses
- **Services**: Orchestrate business logic (ML client, recommendation engine, persistence)
- **Repositories**: In-memory data store (repository interface for future MongoDB migration)
- **Config**: Recommendation engine weights and compatibility tables
- **Schemas**: Request/response types using TypeScript interfaces

## Running

### Development

```bash
npm install
npm run dev
```

The backend starts on `http://localhost:3000` by default.

### Testing the Recommendation Engine

Run test scenarios to see how the engine recommends products for different user profiles:

```bash
npx ts-node src/cli/testEngine.ts
```

This runs 5 test scenarios:
1. Young Professional (high growth potential)
2. Conservative Saver (capital preservation)
3. Aggressive Retirement Planner
4. Emergency Fund Builder (high obligations)
5. Tax-Conscious Investor

### Prerequisites

- Python ML service running on `http://localhost:8000`
- Node.js 16+

## API Endpoints

All endpoints under `/api/v1`:

### Analysis
- `POST /api/v1/analysis` — Run full analysis (risk prediction + recommendation)
- `GET /api/v1/analysis/:analysisId` — Fetch a specific analysis
- `GET /api/v1/analysis?userId=:userId` — List user's analyses

### Users
- `POST /api/v1/users` — Create a user
- `GET /api/v1/users/:userId` — Get user by ID

See [../docs/API_SPEC.md](../docs/API_SPEC.md) for full details.

## Configuration

Edit `src/config/` files to tune the recommendation engine:
- `recommendationWeights.ts` — Weighting for risk/horizon/goal/liquidity/fit
- `compatibilityTables.ts` — Compatibility scores for each product

### Recommendation Engine Tuning

See [RECOMMENDATION_ENGINE_TUNING.md](RECOMMENDATION_ENGINE_TUNING.md) for:
- Detailed explanation of weights and compatibility tables
- How to adjust for different user segments
- Test scenarios and validation
- Best practices for tuning

The engine computes product scores as a weighted combination of:
- **Risk compatibility** (30%): How well product matches user's risk tolerance
- **Investment horizon** (25%): How well product fits the time frame
- **Financial goals** (20%): Alignment with stated investment objectives
- **Liquidity needs** (15%): How well product meets access requirements
- **Practical fit** (10%): General suitability based on surplus, experience, etc.
