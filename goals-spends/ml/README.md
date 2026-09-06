# Goal Achievement Intelligence Engine - ML Module Documentation

## Overview

The Goal Achievement Intelligence Engine (GAIE) is a comprehensive AI/ML system that analyzes users' financial situations and provides personalized recommendations to achieve financial goals efficiently.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│         Frontend (React + Tailwind)                      │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         Express.js Backend (TypeScript)                  │
│      + Backend Integration Layer                         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────┐
│   FastAPI ML Service (Port 8000)                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Goal Achievement Intelligence Engine           │    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │ - Expense Intelligence                 │    │    │
│  │  │ - Financial Forecasting                │    │    │
│  │  │ - Goal Optimization                    │    │    │
│  │  │ - Monte Carlo Simulation               │    │    │
│  │  │ - Recommendation Engine                │    │    │
│  │  │ - Safety Validator                     │    │    │
│  │  └─────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Module Structure

### Core Modules

#### 1. **config.py** (~400 lines)
Centralized configuration with environment-based setup.
- Environment support: Development, Production, Testing
- Database configuration (SQLite/PostgreSQL)
- Model parameters and thresholds
- Expense categories (4-tier system)
- Income sources and financial defaults

**Key Classes:**
- `Config`: Base configuration
- `DevelopmentConfig`, `ProductionConfig`, `TestingConfig`: Environment-specific
- `get_config()`: Environment-based loader

#### 2. **models.py** (~550 lines)
SQLAlchemy ORM models for financial data representation.

**Key Models:**
- `User`: Profile with risk tolerance, financial literacy, personality type
- `IncomeSource`: Salary, business, freelance with variability
- `Transaction`: Expenses with 8 financial intelligence scores
- `Asset`: Savings, FDs, mutual funds, stocks
- `Liability`: Loans with EMI calculations
- `Goal`: Financial goals with status and feasibility
- `Recommendation`: AI-generated recommendations

**Helper Functions:**
- `init_db()`: Database initialization
- `get_session_maker()`: SQLAlchemy session factory
- `get_session()`: Context manager for sessions

#### 3. **utils.py** (~400 lines)
Financial calculation utilities and analysis helpers.

**Key Classes:**
- `DateUtils`: Date arithmetic for forecasting
- `FinancialMetrics`: EMI, future value, probability calculations
- `SpendingAnalysis`: Recurring transaction detection, scoring
- `RiskCalculator`: Financial shock impact analysis
- `OptimizationHelpers`: Strategy generation

#### 4. **data_generator.py** (~700 lines)
Synthetic financial data generation for model training.

**Key Classes:**
- `SyntheticUserGenerator`: Creates realistic user profiles
- `SyntheticIncomeGenerator`: Multiple income sources with variability
- `SyntheticExpenseGenerator`: 4-tier expense patterns
- `SyntheticAssetGenerator`: Portfolio creation
- `SyntheticLiabilityGenerator`: Loan scenarios
- `SyntheticGoalGenerator`: Financial goal templates
- `SyntheticDatasetGenerator`: Complete user profiles

### Analysis Modules

#### 5. **expense_analyzer.py** (~600 lines)
Expense intelligence and spending pattern analysis.

**Key Classes:**
- `ExpenseAnalyzer`: Main analysis engine returning 15+ metrics
- `ExpenseNecessityScorer`: Necessity (0-1) and cuttability scoring
- `BehavioralSpendingAnalyzer`: Lifestyle inflation, spending triggers, personas
- `SubscriptionAnalyzer`: Recurring subscription analysis

**Capabilities:**
- Anomaly detection (Z-score, threshold=2.5)
- Leakage detection (small recurring expenses with large annual costs)
- Data quality confidence scoring
- Category and merchant analysis
- Temporal pattern detection

#### 6. **forecaster.py** (~550 lines)
Financial forecasting and scenario generation.

**Key Classes:**
- `ExpenseForecaster`: 12/60-month expense projection with inflation
- `IncomeForecaster`: Salary growth modeling
- `SavingsForecaster`: Cumulative savings projection
- `CashFlowForecaster`: Comprehensive cash flow with mandatory vs discretionary
- `ScenarioForecaster`: Optimistic/Expected/Pessimistic scenarios

**Features:**
- Trend analysis (increasing/decreasing/stable)
- Inflation adjustment (6% default)
- Behavioral adjustment factors
- Investment return modeling (12% default)

#### 7. **goal_optimizer.py** (~600 lines)
Goal feasibility calculation and Monte Carlo simulation.

**Key Classes:**
- `GoalFeasibilityCalculator`: Feasibility classification (6 tiers)
- `GoalFeasibilityCalculator.calculate_recovery_plan()`: 4 strategic options
- `MonteCarloSimulator`: 10,000 iteration probabilistic simulation
- `MonteCarloSimulator.simulate_financial_shocks()`: Scenario modeling

**Feasibility Classes:**
- VERY_LIKELY (85%), LIKELY (70%), POSSIBLE (55%)
- STRETCHED (35%), UNLIKELY (15%), CURRENTLY_IMPOSSIBLE (0%)

**Recovery Strategies:**
1. Increase Monthly Savings
2. Reduce Goal Amount
3. Extend Timeline
4. Hybrid Approach

### Intelligence & Recommendation Modules

#### 8. **recommendation_engine.py** (~700 lines)
Personalized recommendations and safety validation.

**Key Classes:**
- `SafetyChecker`: Validates recommendations against safety constraints
- `RecommendationEngine`: Generates prioritized recommendations
- `RecommendationEngine.generate_action_plan()`: Timeline-based action plan
- `ExplainabilityEngine`: Decision explanation (WHAT/WHY/HOW_MUCH/etc)

**Recommendation Categories:**
- Expense Optimization
- Financial Leakage Elimination
- Income Expansion
- Goal Adjustment
- Asset Allocation

**Safety Checks:**
- Emergency fund preservation
- Debt-to-income ratio
- Liquidity maintenance
- Income stability assessment
- Goal probability feasibility

#### 9. **gaie.py** (~500 lines)
Main orchestrator coordinating all analysis components.

**Key Class:**
- `GoalAchievementIntelligenceEngine`: Central coordinator

**Methods:**
- `analyze_user_financial_situation()`: Comprehensive financial analysis
- `analyze_goals()`: Goal feasibility and planning
- `generate_comprehensive_plan()`: Complete plan with all analyses

**Outputs:**
- Financial situation analysis (15+ metrics)
- Goal analysis (feasibility, probability, recovery plans)
- Cash flow forecasts (12-60 months)
- Scenario analysis (optimistic/expected/pessimistic)
- Recommendations (top 10 prioritized)
- Action plan (today/this week/this month/ongoing)
- Key insights and next steps

### API & Integration Modules

#### 10. **api.py** (~500 lines)
FastAPI endpoints for frontend integration.

**Endpoints:**

**Analysis:**
- `POST /api/v1/analyze/situation` - Current financial analysis
- `POST /api/v1/analyze/goals` - Goal feasibility analysis
- `POST /api/v1/analyze/comprehensive` - Complete financial plan

**Specific Analysis:**
- `POST /api/v1/expense/analyze` - Expense intelligence
- `POST /api/v1/forecast/cashflow` - Cash flow projection
- `POST /api/v1/goal/feasibility` - Single goal analysis
- `POST /api/v1/simulation/monte-carlo` - Probabilistic simulation

**Recommendations:**
- `POST /api/v1/recommendations/generate` - Generate recommendations
- `GET /api/v1/recommendations/{id}/explain` - Explain recommendation
- `POST /api/v1/recommendation/validate` - Safety validation

**Utility:**
- `GET /health` - Health check
- `GET /api/v1/config` - Configuration details
- `POST /api/v1/scenario/what-if` - What-if analysis

#### 11. **backend_integration.py** (~300 lines)
Integration utilities for Express.js backend.

**Key Classes:**
- `BackendBridge`: Data transformation and formatting
- `MLEngineSyncManager`: Data synchronization
- `INTEGRATION_CONFIG`: Configuration constants

**Features:**
- User data transformation (Express ↔ ML format)
- Analysis result formatting for frontend
- ML engine health checks
- Result caching management

## Installation & Setup

### 1. Install Dependencies

```bash
cd /Users/fc470770/Desktop/Hackathon/ml
pip install -r requirements.txt
```

### 2. Initialize Database

```python
from models import init_db
from config import config

# Initialize SQLite (development) or PostgreSQL (production)
init_db()
```

### 3. Start ML API Server

```bash
cd /Users/fc470770/Desktop/Hackathon/ml
python -m uvicorn api:app --reload --port 8000
```

API will be available at: `http://localhost:8000`
API docs: `http://localhost:8000/docs` (Swagger UI)

## Usage Examples

### Example 1: Complete Financial Analysis

```python
from gaie import GoalAchievementIntelligenceEngine
from data_generator import SyntheticDatasetGenerator

# Generate sample user data
datasets = SyntheticDatasetGenerator.generate_complete_user_dataset(num_users=1)
user_data = datasets[0]

# Initialize engine
engine = GoalAchievementIntelligenceEngine()

# Generate comprehensive plan
plan = engine.generate_comprehensive_plan(
    user_data,
    user_data['goals'],
    priority_strategy="balanced"
)

# Access results
print(f"Net Worth: ₹{plan['situation_analysis']['financial_health']['net_worth']:,.0f}")
print(f"Monthly Surplus: ₹{plan['situation_analysis']['expenses']['monthly_surplus']:,.0f}")

for goal_name, analysis in plan['goal_analysis'].items():
    print(f"{goal_name}: {analysis['success_probability']:.0%} success probability")

for rec in plan['recommendations']:
    print(f"- {rec['title']}: ₹{rec['estimated_impact']:,.0f}/month")
```

### Example 2: API Call from Frontend

```javascript
// React component calling ML API
async function analyzeUserGoals(userData) {
  const response = await fetch('http://localhost:8000/api/v1/analyze/comprehensive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  const analysis = await response.json();
  return analysis.plan;
}
```

### Example 3: Monte Carlo Simulation

```python
from goal_optimizer import MonteCarloSimulator

simulator = MonteCarloSimulator(iterations=10000)

result = simulator.simulate_goal_achievement(
    current_amount=200000,
    monthly_contribution=25000,
    target_amount=1000000,
    months=24,
)

print(f"Success Probability: {result['success_probability']:.0%}")
print(f"90th Percentile: ₹{result['percentile_90']:,.0f}")
```

## Data Flow

### 1. User Inputs
- Income sources
- Expenses/transactions
- Assets
- Liabilities
- Financial goals

### 2. Analysis Pipeline
```
User Data
   ↓
Expense Analysis (categorize, detect patterns, identify leakage)
   ↓
Income Analysis (stability, growth potential)
   ↓
Cash Flow Forecasting (12-60 months projection)
   ↓
Goal Feasibility Analysis (classify, probability calculation)
   ↓
Monte Carlo Simulation (10,000 iterations)
   ↓
Recommendation Generation (personalized suggestions)
   ↓
Safety Validation (ensure financial stability)
   ↓
Action Plan Generation (timeline-based execution)
```

### 3. Output to Frontend
- Financial dashboard (net worth, surplus, liquidity)
- Goal tracking (feasibility, probability, timeline)
- Recommendation cards (priority, impact, action)
- What-if simulator (scenario modeling)
- Progress tracking (milestone achievement)

## Configuration

### Environment Variables

```bash
# Database
ML_DATABASE_URL="sqlite:///financial_data.db"  # Development
# ML_DATABASE_URL="postgresql://user:pass@host/db"  # Production

# API
ML_API_HOST="0.0.0.0"
ML_API_PORT="8000"

# Simulation
MONTE_CARLO_ITERATIONS="10000"

# Financial Parameters
DEFAULT_INVESTMENT_RETURN="0.12"  # 12% annual
INFLATION_RATE="0.06"  # 6% annual
MIN_EMERGENCY_FUND_MULTIPLIER="3"  # 3x monthly expenses
```

### Customizing Expense Categories

Edit `config.py`:
```python
EXPENSE_CATEGORIES = {
    "Tier_A_NonNegotiable": ["rent", "utilities", "groceries", ...],
    "Tier_B_Optimizable": ["insurance", "subscriptions", ...],
    "Tier_C_Flexible": ["dining", "shopping", "travel", ...],
    "Tier_D_Leakage": ["coffee", "snacks", "small impulse", ...],
}
```

## Performance Metrics

- **Expense Analysis**: ~50-100ms for 1000 transactions
- **12-month Cash Flow Forecast**: ~10-20ms
- **Monte Carlo (10,000 iterations)**: ~500-1000ms
- **Complete Analysis**: ~2-3 seconds for typical user
- **API Response**: <5 seconds (including DB operations)

## Testing

A real pytest suite lives in `ml/tests/` (unit tests for the goal feasibility
maths + expense analyzer, plus FastAPI `TestClient` tests for every endpoint
used by the frontends). From the repo root:

```bash
# One-time (or whenever requirements change): creates ml/venv and installs
# requirements.txt + requirements-dev.txt into it
bash scripts/setup-ml.sh

# Run the suite
ml/venv/bin/python -m pytest ml/tests -v

# Or via the root package.json:
npm run test:ml
```

```bash
# Test with sample data
python ml/gaie.py
```


## Production Deployment

### Docker Setup

```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY ml/ ./ml/
CMD ["uvicorn", "ml.api:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Configuration

```bash
# Production settings in .env
ENVIRONMENT="production"
ML_DATABASE_URL="postgresql://user:pass@host/db"
ML_API_PORT="8000"
CACHE_BACKEND="redis"
LOG_LEVEL="info"
```

### Monitoring

- Prometheus metrics on `/metrics`
- JSON logging for centralized aggregation
- Error tracking and alerting

## Troubleshooting

### Issue: Low Success Probability
**Cause**: Insufficient monthly surplus or too aggressive goal timeline
**Solution**: Increase savings, extend deadline, or reduce goal amount

### Issue: High Income Volatility
**Cause**: Multiple variable income sources or irregular income
**Solution**: Build larger emergency fund, use conservative projections

### Issue: Recommendation Not Safe
**Cause**: Would reduce emergency fund below threshold
**Solution**: Adjust recommendation parameters or plan longer timeline

## Future Enhancements

1. **Machine Learning Models**
   - Expense categorization with NLP
   - Goal success prediction models
   - Behavioral pattern recognition

2. **Advanced Scenarios**
   - Job loss simulation
   - Market crash scenarios
   - Inflation shock analysis

3. **Integration Features**
   - Bank API integration (Plaid, Open Banking)
   - Investment API integration
   - Tax calculation module

4. **User Learning**
   - Personalized insights over time
   - Behavioral coaching
   - Success rate tracking

## Support

For issues or questions:
1. Check `/memories/repo/` for codebase notes
2. Review test examples in module `if __name__ == "__main__"` sections
3. Check API docs at `http://localhost:8000/docs`

## License

Internal use only - Hackathon Project
