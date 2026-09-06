# Investment Analyser

A personal full-stack project that predicts a user's **investment risk profile** using a machine learning model, and generates a deterministic, explainable **investment recommendation** across four product types: **FD, PPF, NPS, and Mutual Funds**.

> ⚠️ **Disclaimer:** This is an educational project built for learning ML + full-stack integration. It is **not** a real financial advisory tool and should not be used to make actual investment decisions.

## Why this project?

- Practice building and serving a real ML model (risk classification).
- Practice integrating an ML microservice with a Node.js backend.
- Practice designing a clean separation between **probabilistic ML predictions** and **deterministic business logic**.

## Architecture

```
Frontend (React/TS)
      │
      ▼
Node.js/TypeScript Backend  ──────►  Python ML Service (FastAPI)
      │                                     (risk prediction)
      ▼
   MongoDB
(profiles, questionnaires, predictions, recommendations)
```

See [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for the full architecture, data flow, and design principles.

Additional docs:

- [docs/API_SPEC.md](docs/API_SPEC.md) — Node.js backend REST API contract
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md) — MongoDB collections/schema
- [docs/RECOMMENDATION_ENGINE.md](docs/RECOMMENDATION_ENGINE.md) — deterministic FD/PPF/NPS/Mutual Fund scoring rules

## How it works

1. User submits financial information, a behavioural risk questionnaire, and their investment goal/horizon/liquidity needs.
2. The Node.js backend validates the input and forwards engineered features to the Python ML service.
3. The ML service predicts a **risk profile** (e.g. Conservative / Moderate / Aggressive) with class probabilities.
4. The backend's deterministic rules engine scores **FD, PPF, NPS, and Mutual Funds** against the predicted risk profile, goal, horizon, and liquidity needs.
5. The backend generates a final recommendation with explanations, and stores everything in MongoDB.
6. The frontend displays the risk profile, per-product scores with reasoning, and the final recommendation.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18.2.0, TypeScript 5.0+, Axios |
| Backend | Node.js 16+, TypeScript, Express.js |
| ML Service | Python 3.8+, FastAPI, scikit-learn |
| Database | In-memory (Phase 8), MongoDB-ready (Phase 7) |

## 🎯 Project Status

All phases completed and integrated:

| Phase | Component | Status | Description |
|-------|-----------|--------|-------------|
| 1-2 | Dataset & EDA | ✅ Complete | 1000 synthetic profiles, exploratory analysis |
| 3 | Model Training | ✅ Complete | Random Forest classifier, 89% accuracy |
| 4 | ML Service | ✅ Complete | FastAPI /predict-risk endpoint |
| 5 | Backend API | ✅ Complete | Express REST API with 6 endpoints |
| 6 | Recommendation Engine | ✅ Complete | Deterministic weighted scoring system |
| 7 | Database | ⏳ Ready | MongoDB integration path planned |
| 8 | Frontend | ✅ Complete | React UI with Axis Bank theme |

**Current**: Production-ready full-stack application with all components working together.

## 🚀 Quick Start

### Prerequisites
```bash
# Check Node.js
node --version  # v16+
npm --version   # 7+

# Check Python
python3 --version  # 3.8+
```

### Installation

```bash
# Terminal 1: ML Service
cd data
pip install -r requirements.txt
python3 -m uvicorn ml_service.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Backend
cd backend
npm install
npm run dev

# Terminal 3: Frontend
cd frontend
npm install
npm start
```

Open **http://localhost:3000** in your browser.

## 📚 Documentation

- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** — Complete setup and troubleshooting
- **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** — Detailed specifications
- **[docs/API_SPEC.md](docs/API_SPEC.md)** — REST API contract
- **[docs/DATA_MODEL.md](docs/DATA_MODEL.md)** — Data structure definitions
- **[docs/RECOMMENDATION_ENGINE.md](docs/RECOMMENDATION_ENGINE.md)** — Scoring algorithm
- **[backend/README.md](backend/README.md)** — Backend implementation
- **[frontend/README.md](frontend/README.md)** — Frontend implementation
- **[frontend/PHASE_8_SUMMARY.md](frontend/PHASE_8_SUMMARY.md)** — React frontend details

## 🎨 Frontend Features (Phase 8)

✅ **Axis Bank Blue Theme** - Professional banking UI
✅ **Multi-step Form** - User registration → Profile → Questionnaire → Results
✅ **Real-time Validation** - Input validation with helpful error messages
✅ **Risk Profile Display** - Visual indicator with probability breakdown
✅ **Product Recommendations** - 4 products (FD, PPF, NPS, Mutual Fund) with scores and reasoning
✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **TypeScript** - Full type safety throughout

## ⚙️ Backend Features (Phase 5-6)

✅ **REST API** - 6 endpoints for users and analysis
✅ **Validation** - Request validation with detailed error messages
✅ **ML Integration** - Calls Python service for risk prediction
✅ **Recommendation Engine** - Deterministic weighted scoring
✅ **Error Handling** - Comprehensive error responses
✅ **Repository Pattern** - MongoDB-ready data access layer

## 🧠 ML Service Features (Phase 4)

✅ **Random Forest Classifier** - 89% accuracy on test data
✅ **Risk Prediction** - 3 classes (LOW, MEDIUM, HIGH)
✅ **Probability Scoring** - All class probabilities returned
✅ **Fast Inference** - ~50ms prediction time
✅ **Health Check** - Service availability monitoring

## 📊 Investment Products

Four core products are analyzed and scored:

1. **FD** (Fixed Deposits)
   - Low risk, guaranteed returns
   - High liquidity
   - Best for: Conservative investors, emergency funds

2. **PPF** (Public Provident Fund)
   - Government-backed, tax benefits
   - 15-year lock-in period
   - Best for: Tax planning, long-term savings

3. **NPS** (National Pension System)
   - Retirement-focused
   - Market-linked returns
   - Best for: Retirement planning, medium-high risk tolerance

4. **Mutual Funds**
   - Diversified portfolio
   - Market returns with professional management
   - Best for: Wealth creation, growth-oriented investors

## 🔄 User Journey

```
1. Open Dashboard → Enter Financial Profile → 2. Answer Questionnaire
         ↓
3. ML Service predicts Risk Profile
         ↓
4. Recommendation Engine scores all products
         ↓
5. Frontend displays results with explanations
```

(A guest user session is silently created in the background on load — no name/email sign-up step.)

**Time taken**: ~1-2 seconds for complete analysis

## 🧪 Example Usage

### Test Scenario: Young Professional

```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "profile": {
    "age": 28,
    "monthly_income": 85000,
    "monthly_expenses": 40000,
    "savings": 300000,
    "existing_investments": 50000,
    "monthly_emi": 10000
  },
  "questionnaire": {
    "investment_horizon": 25,
    "investment_experience": 2,
    "reaction_to_market_loss": 3,
    "investment_frequency": "MONTHLY",
    "liquidity_preference": "MEDIUM",
    "investment_goal": "WEALTH_CREATION",
    "risk_questionnaire_score": 60
  }
}
```

**Expected Results**:
- Risk Profile: MEDIUM
- Top Recommendation: Mutual Fund
- Also Recommended: NPS, PPF, FD

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for complete testing scenarios.

## 🏗️ Project Structure

```
investmentAI/
├── frontend/                    # React UI (Phase 8)
│   ├── src/
│   │   ├── components/         # Form, Questionnaire, Results
│   │   ├── api.ts              # Backend API client
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── styles.css.ts       # Axis Bank theme
│   └── package.json
├── backend/                     # Express API (Phase 5)
│   ├── src/
│   │   ├── controllers/        # HTTP handlers
│   │   ├── services/           # Business logic
│   │   ├── repositories/       # Data access
│   │   ├── config/             # Configuration
│   │   └── clients/            # ML service client
│   └── package.json
├── data/                        # ML Service (Phases 1-4)
│   ├── ml_service/             # FastAPI server
│   ├── raw/                    # Original dataset
│   ├── processed/              # Engineered features
│   └── requirements.txt
├── docs/                        # Documentation
│   ├── API_SPEC.md
│   ├── DATA_MODEL.md
│   └── RECOMMENDATION_ENGINE.md
├── INTEGRATION_GUIDE.md         # Setup & troubleshooting
└── PROJECT_CONTEXT.md          # Detailed specifications
```

## 🔧 Troubleshooting

### Common Issues

**Port 3000 already in use**
```bash
lsof -i :3000
kill -9 [PID]
```

**ML service not responding**
```bash
curl http://localhost:8000/health
# If fails, restart: python3 -m uvicorn ml_service.main:app --host 0.0.0.0 --port 8000
```

**Frontend can't connect to backend**
```bash
curl http://localhost:3000/health
# If fails, check backend is running with: npm run dev
```

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for complete troubleshooting.

## 🎓 Learning Resources

This project demonstrates:
- Full-stack JavaScript/TypeScript development
- ML model serving and integration
- REST API design and Express.js
- React component architecture
- Business logic implementation (deterministic recommendation engine)
- Data validation and error handling
- Type-safe development with TypeScript

## 📝 Next Steps (Future Enhancements)

- [ ] MongoDB integration (Phase 7)
- [ ] User authentication
- [ ] Historical analysis tracking
- [ ] PDF export functionality
- [ ] Real financial data integration
- [ ] Advanced visualizations
- [ ] Mobile app version
- [ ] Deployment to production (AWS/Vercel)

## ⚠️ Important Disclaimer

**This is an educational project** and should not be used for actual investment decisions. Consult a qualified financial advisor before investing.

## Project Structure

Prefer a clean monorepo. Keep it simple — do not over-engineer the folder structure beyond what's actually needed.

```
investment-analyser/
├── frontend/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       ├── models/
│       ├── validators/
│       ├── recommendation/
│       ├── clients/
│       └── utils/
├── ml-service/
│   └── app/
│       ├── api/
│       ├── models/
│       ├── preprocessing/
│       ├── training/
│       └── schemas/
├── data/
│   ├── raw/
│   └── processed/
├── docs/
├── PROJECT_CONTEXT.md
└── README.md
```

> Note: these directories will be scaffolded as implementation progresses.

## Getting Started

Setup instructions will be added once the frontend, backend, and ML service are scaffolded.

## Status

🚧 Planning stage — architecture and context defined, implementation not yet started.

## License

Personal/educational project — no license applied yet.
