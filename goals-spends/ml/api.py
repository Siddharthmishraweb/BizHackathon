"""
FastAPI Endpoints for Goal Achievement Intelligence Engine
Exposes ML analysis and recommendations to frontend
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
from datetime import datetime

from gaie import GoalAchievementIntelligenceEngine
from models import Goal as GoalModel, User, Transaction, Asset, Liability
from config import config, get_config

# Initialize FastAPI app
app = FastAPI(
    title="Goal Achievement Intelligence Engine API",
    description="AI-powered financial analysis and goal achievement planning",
    version="1.0.0"
)

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engine
engine = GoalAchievementIntelligenceEngine()


# ==================== Request/Response Models ====================

class TransactionInput(BaseModel):
    amount: float
    category: str
    date: str
    description: str
    tier: Optional[str] = None
    merchant: Optional[str] = None


class IncomeSourceInput(BaseModel):
    name: str
    amount: float
    frequency: str = "monthly"
    variability: float = 0.1
    probability: float = 1.0


class AssetInput(BaseModel):
    name: str
    value: float
    asset_type: str
    liquidity: str = "high"
    returns_percentage: Optional[float] = None


class LiabilityInput(BaseModel):
    name: str
    current_balance: float
    interest_rate: float
    monthly_payment: float
    remaining_months: int


class GoalInput(BaseModel):
    name: str
    target_amount: float
    current_amount: float
    deadline: str  # ISO format date
    category: str
    priority: int = 1


class UserDataInput(BaseModel):
    user_id: str
    email: str
    transactions: List[TransactionInput]
    income_sources: List[IncomeSourceInput]
    assets: List[AssetInput]
    liabilities: List[LiabilityInput]
    goals: List[GoalInput]


class AnalysisResponse(BaseModel):
    status: str
    timestamp: str
    data: Dict


class RecommendationResponse(BaseModel):
    status: str
    recommendations: List[Dict]
    action_plan: Dict


class NewTransactionInput(BaseModel):
    amount: float
    description: str
    merchant: Optional[str] = None
    date: Optional[str] = None


class CategorizeRequest(BaseModel):
    historical_transactions: List[TransactionInput]
    new_transaction: NewTransactionInput


# ==================== Health Check ====================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Goal Achievement Intelligence Engine",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
    }


# ==================== Analysis Endpoints ====================

@app.post("/api/v1/analyze/situation", response_model=AnalysisResponse)
async def analyze_financial_situation(user_data: UserDataInput):
    """Analyze user's current financial situation"""
    
    try:
        # Convert input to internal format
        user_dict = {
            "user": {
                "id": user_data.user_id,
                "email": user_data.email,
                "risk_tolerance": 0.5,
                "financial_literacy": 0.6,
            },
            "transactions": [
                {
                    **t.dict(),
                    "date": datetime.fromisoformat(t.date)
                }
                for t in user_data.transactions
            ],
            "income_sources": [s.dict() for s in user_data.income_sources],
            "assets": [a.dict() for a in user_data.assets],
            "liabilities": [l.dict() for l in user_data.liabilities],
            "goals": [
                {
                    **g.dict(),
                    "deadline": datetime.fromisoformat(g.deadline)
                }
                for g in user_data.goals
            ],
        }
        
        # Analyze situation
        analysis = engine.analyze_user_financial_situation(user_dict)
        
        return AnalysisResponse(
            status="success",
            timestamp=datetime.utcnow().isoformat(),
            data=analysis
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/analyze/goals")
async def analyze_goals(user_data: UserDataInput):
    """Analyze goal feasibility and create achievement plans"""
    
    try:
        user_dict = {
            "user": {
                "id": user_data.user_id,
                "email": user_data.email,
            },
            "transactions": [t.dict() for t in user_data.transactions],
            "income_sources": [s.dict() for s in user_data.income_sources],
            "assets": [a.dict() for a in user_data.assets],
            "liabilities": [l.dict() for l in user_data.liabilities],
            "goals": [g.dict() for g in user_data.goals],
        }
        
        # Calculate surplus
        monthly_income = sum(s.amount for s in user_data.income_sources)
        monthly_expenses = sum(t.amount for t in user_data.transactions) / 12  # Rough estimate
        monthly_surplus = monthly_income - monthly_expenses
        
        # Analyze goals
        goals_with_deadline = [
            {**g.dict(), "deadline": datetime.fromisoformat(g.deadline)}
            for g in user_data.goals
        ]
        goal_analysis = engine.analyze_goals(
            goals_with_deadline,
            {},
            max(0, monthly_surplus),
        )
        
        # Format response
        formatted_goals = {}
        for name, analysis in goal_analysis.items():
            formatted_goals[name] = {
                "goal": analysis['goal'],
                "feasibility_class": analysis['feasibility']['feasibility_class'],
                "success_probability": float(analysis['monte_carlo_simulation']['success_probability']),
                "required_monthly": analysis['feasibility']['required_monthly'],
                "available_monthly": analysis['feasibility']['available_monthly'],
                "recovery_plan": analysis['recovery_plan'],
            }
        
        return {
            "status": "success",
            "timestamp": datetime.utcnow().isoformat(),
            "goals": formatted_goals,
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/analyze/comprehensive")
async def analyze_comprehensive(user_data: UserDataInput):
    """Generate comprehensive financial plan with all analyses"""
    
    try:
        user_dict = {
            "user": {
                "id": user_data.user_id,
                "email": user_data.email,
                "risk_tolerance": 0.5,
                "financial_literacy": 0.6,
            },
            "transactions": [t.dict() for t in user_data.transactions],
            "income_sources": [s.dict() for s in user_data.income_sources],
            "assets": [a.dict() for a in user_data.assets],
            "liabilities": [l.dict() for l in user_data.liabilities],
            "goals": [g.dict() for g in user_data.goals],
        }
        
        # Generate comprehensive plan
        goals_with_deadline = [
            {**g.dict(), "deadline": datetime.fromisoformat(g.deadline)}
            for g in user_data.goals
        ]
        plan = engine.generate_comprehensive_plan(
            user_dict,
            goals_with_deadline,
            priority_strategy="balanced"
        )
        
        return {
            "status": "success",
            "timestamp": datetime.utcnow().isoformat(),
            "plan": plan,
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== Specific Analysis Endpoints ====================

@app.post("/api/v1/expense/analyze")
async def analyze_expenses(transactions: List[TransactionInput]):
    """Analyze expenses and identify optimization opportunities"""
    
    try:
        tx_list = [
            {
                **t.dict(),
                "date": datetime.fromisoformat(t.date)
            }
            for t in transactions
        ]
        
        analysis = engine.expense_analyzer.analyze_transactions(tx_list)
        
        return {
            "status": "success",
            "timestamp": datetime.utcnow().isoformat(),
            "analysis": analysis,
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/forecast/cashflow")
async def forecast_cashflow(
    income_sources: List[IncomeSourceInput],
    monthly_expenses: float,
    current_savings: float,
    months: int = 12
):
    """Forecast cash flow for given period"""
    
    try:
        forecast = engine.forecaster.forecast_cashflow(
            {
                "income_sources": [s.dict() for s in income_sources],
                "transactions": [],
                "current_savings": current_savings,
            },
            months=months
        )
        
        return {
            "status": "success",
            "timestamp": datetime.utcnow().isoformat(),
            "forecast": forecast,
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/goal/feasibility")
async def calculate_goal_feasibility(goal: GoalInput, monthly_surplus: float):
    """Calculate feasibility of a specific goal"""
    
    try:
        from goal_optimizer import GoalFeasibilityCalculator
        
        feasibility = GoalFeasibilityCalculator.calculate_feasibility(
            target_amount=goal.target_amount,
            current_amount=goal.current_amount,
            deadline=datetime.fromisoformat(goal.deadline),
            monthly_surplus=monthly_surplus,
        )
        
        return {
            "status": "success",
            "timestamp": datetime.utcnow().isoformat(),
            "feasibility": feasibility,
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/simulation/monte-carlo")
async def run_monte_carlo_simulation(
    current_amount: float,
    monthly_contribution: float,
    target_amount: float,
    months: int,
    iterations: int = 1000,
    income_volatility: float = 0.1,
    expense_volatility: float = 0.15,
    investment_return: Optional[float] = None,
    investment_volatility: float = 0.2,
    emergency_fund_requirement: float = 0.0,
):
    """Run Monte Carlo simulation for goal. Volatility/emergency-fund params default to the
    same generic constants as before, but callers with real user data (see goals-frontend's
    Simulator page) can pass values derived from that user's actual income stability, spending
    consistency and emergency fund requirement so the simulation reflects their real situation
    instead of a one-size-fits-all guess."""
    
    try:
        simulator = engine.simulator.__class__(iterations=iterations)
        
        result = simulator.simulate_goal_achievement(
            current_amount=current_amount,
            monthly_contribution=monthly_contribution,
            target_amount=target_amount,
            months=months,
            income_volatility=income_volatility,
            expense_volatility=expense_volatility,
            investment_return=investment_return,
            investment_volatility=investment_volatility,
            emergency_fund_requirement=emergency_fund_requirement,
        )
        
        return {
            "status": "success",
            "timestamp": datetime.utcnow().isoformat(),
            "simulation": result,
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== Recommendation Endpoints ====================

@app.post("/api/v1/recommendations/generate", response_model=RecommendationResponse)
async def generate_recommendations(user_data: UserDataInput):
    """Generate personalized recommendations"""
    
    try:
        # First analyze situation
        user_dict = {
            "transactions": [t.dict() for t in user_data.transactions],
            "income_sources": [s.dict() for s in user_data.income_sources],
            "assets": [a.dict() for a in user_data.assets],
            "goals": [g.dict() for g in user_data.goals],
        }
        
        situation = engine.analyze_user_financial_situation(user_dict)
        leakage = situation['leakage'].get('identified_items', [])
        
        # Generate recommendations
        recommendations = engine.recommendation_engine.generate_recommendations(
            situation['expenses'],
            {},
            {},
            leakage
        )
        
        # Create action plan
        action_plan = engine.recommendation_engine.generate_action_plan(
            recommendations,
            priority_strategy="balanced"
        )
        
        return RecommendationResponse(
            status="success",
            recommendations=recommendations,
            action_plan=action_plan,
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/recommendations/{rec_id}/explain")
async def explain_recommendation(rec_id: str, rec_data: Optional[str] = None):
    """Get detailed explanation of a recommendation"""
    
    try:
        if not rec_data:
            raise HTTPException(status_code=400, detail="Recommendation data required")
        
        rec = json.loads(rec_data)
        
        explanation = engine.explainability.explain_recommendation(rec)
        
        return {
            "status": "success",
            "timestamp": datetime.utcnow().isoformat(),
            "recommendation_id": rec_id,
            "explanation": explanation,
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== Safety and Validation ====================

@app.post("/api/v1/recommendation/validate")
async def validate_recommendation(user_data: UserDataInput, recommendation: Dict):
    """Validate that a recommendation is safe"""
    
    try:
        # Calculate user situation
        user_dict = {
            "transactions": [t.dict() for t in user_data.transactions],
            "income_sources": [s.dict() for s in user_data.income_sources],
            "assets": [a.dict() for a in user_data.assets],
        }
        
        situation = engine.analyze_user_financial_situation(user_dict)
        
        mandatory_txns = [t.dict() for t in user_data.transactions if t.tier == 'Tier_A_NonNegotiable']
        mandatory_days = 90  # sane fallback matching our ~3-month demo data windows
        if mandatory_txns:
            mandatory_dates = [datetime.fromisoformat(t['date']) for t in mandatory_txns]
            mandatory_days = max(1, (max(mandatory_dates) - min(mandatory_dates)).days + 1)
        mandatory_monthly_expenses = sum(t['amount'] for t in mandatory_txns) / (mandatory_days / 30)
        
        total_income = sum(s.amount for s in user_data.income_sources)
        income_volatility = (
            sum(s.amount * s.variability for s in user_data.income_sources) / total_income
            if total_income > 0 else 0.1
        )
        
        user_situation = {
            "current_savings": sum(a.value for a in user_data.assets),
            "mandatory_monthly_expenses": mandatory_monthly_expenses,
            "mandatory_monthly_debt": sum(l.monthly_payment for l in user_data.liabilities),
            "monthly_income": total_income,
            "liquid_assets": sum(a.value for a in user_data.assets if a.liquidity == "high"),
            "income_volatility": income_volatility,
        }
        
        # Validate
        safety = engine.safety_checker.check_recommendation_safety(
            recommendation,
            user_situation
        )
        
        return {
            "status": "success",
            "timestamp": datetime.utcnow().isoformat(),
            "safety": safety,
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== Utility Endpoints ====================

@app.get("/api/v1/config")
async def get_configuration():
    """Get current engine configuration"""
    
    cfg = get_config()
    
    return {
        "status": "success",
        "config": {
            "monte_carlo_iterations": cfg.MONTE_CARLO_ITERATIONS,
            "min_emergency_fund_multiplier": cfg.MIN_EMERGENCY_FUND_MULTIPLIER,
            "default_investment_return": cfg.DEFAULT_INVESTMENT_RETURN,
            "inflation_rate": cfg.DEFAULT_INFLATION_RATE,
            "expense_categories": cfg.EXPENSE_CATEGORIES,
        }
    }


@app.post("/api/v1/scenario/what-if")
async def what_if_analysis(
    current_situation: UserDataInput,
    scenario_changes: Dict,
    months: int = 12
):
    """Run what-if analysis: applies the requested deltas to current_situation and compares
    a REAL comprehensive plan for the modified scenario against the real baseline plan.

    scenario_changes supports (all optional, default 0):
      - flexSpendPercent: % applied to Tier_C_Flexible / Tier_D_Leakage transactions
      - incomePercent: % applied to every income source
      - newMonthlyExpense: ₹/month added as a new recurring Tier_A expense
    """

    try:
        def to_user_dict(transactions: List[Dict], income_sources: List[Dict]) -> Dict:
            return {
                "user": {"id": current_situation.user_id, "email": current_situation.email,
                         "risk_tolerance": 0.5, "financial_literacy": 0.6},
                "transactions": transactions,
                "income_sources": income_sources,
                "assets": [a.dict() for a in current_situation.assets],
                "liabilities": [l.dict() for l in current_situation.liabilities],
                "goals": [g.dict() for g in current_situation.goals],
            }

        goals_with_deadline = [
            {**g.dict(), "deadline": datetime.fromisoformat(g.deadline)}
            for g in current_situation.goals
        ]

        baseline_transactions = [t.dict() for t in current_situation.transactions]
        baseline_income = [s.dict() for s in current_situation.income_sources]

        baseline_plan = engine.generate_comprehensive_plan(
            to_user_dict(baseline_transactions, baseline_income),
            goals_with_deadline,
            priority_strategy="balanced",
        )

        flex_multiplier = 1 + float(scenario_changes.get("flexSpendPercent", 0)) / 100
        income_multiplier = 1 + float(scenario_changes.get("incomePercent", 0)) / 100
        new_monthly_expense = float(scenario_changes.get("newMonthlyExpense", 0))

        scenario_transactions = []
        for t in baseline_transactions:
            t = dict(t)
            if t.get("tier") in ("Tier_C_Flexible", "Tier_D_Leakage"):
                t["amount"] = max(0.0, t["amount"] * flex_multiplier)
            scenario_transactions.append(t)

        if new_monthly_expense > 0:
            months_present = sorted({t["date"][:7] for t in baseline_transactions if t.get("date")})
            for year_month in months_present:
                scenario_transactions.append({
                    "amount": new_monthly_expense,
                    "category": "Tier_A_NonNegotiable",
                    "date": f"{year_month}-05",
                    "description": "Hypothetical new monthly expense",
                    "tier": "Tier_A_NonNegotiable",
                    "merchant": "What-If Scenario",
                })

        scenario_income = [
            {**s, "amount": max(0.0, s["amount"] * income_multiplier)}
            for s in baseline_income
        ]

        scenario_plan = engine.generate_comprehensive_plan(
            to_user_dict(scenario_transactions, scenario_income),
            goals_with_deadline,
            priority_strategy="balanced",
        )

        baseline_surplus = baseline_plan["situation_analysis"]["expenses"]["monthly_surplus"]
        scenario_surplus = scenario_plan["situation_analysis"]["expenses"]["monthly_surplus"]

        return {
            "status": "success",
            "timestamp": datetime.utcnow().isoformat(),
            "changes": scenario_changes,
            "baseline": {
                "monthly_surplus": baseline_surplus,
                "goal_analysis": baseline_plan["goal_analysis"],
            },
            "scenario": {
                "monthly_surplus": scenario_surplus,
                "goal_analysis": scenario_plan["goal_analysis"],
            },
            "projected_impact": {
                "monthly_impact": float(scenario_surplus - baseline_surplus),
                "annual_impact": float((scenario_surplus - baseline_surplus) * 12),
            },
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== Advanced Insights & ML Endpoints ====================

@app.post("/api/v1/insights/payday-spikes")
async def payday_spending_spikes(transactions: List[TransactionInput], payday_day: int = 1):
    """Detect spending spikes in the 7 days following each payday (assumed day-of-month)."""
    try:
        from expense_analyzer import BehavioralSpendingAnalyzer

        tx_list = [t.dict() for t in transactions]
        if not tx_list:
            return {"status": "success", "timestamp": datetime.utcnow().isoformat(), "typical_7day_spending": 0.0, "triggers": {}}

        parsed_dates = [datetime.fromisoformat(t['date']) for t in tx_list]
        months = sorted(set((d.year, d.month) for d in parsed_dates))
        trigger_events = [{"date": datetime(y, m, min(payday_day, 28)), "type": "salary"} for y, m in months]

        triggers = BehavioralSpendingAnalyzer.detect_spending_triggers(tx_list, trigger_events)

        total_spend = sum(t['amount'] for t in tx_list)
        date_range_days = max(1, (max(parsed_dates) - min(parsed_dates)).days + 1)
        typical_7day_spending = (total_spend / date_range_days) * 7

        return {
            "status": "success",
            "timestamp": datetime.utcnow().isoformat(),
            "typical_7day_spending": float(typical_7day_spending),
            "triggers": triggers,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/insights/lifestyle-inflation")
async def lifestyle_inflation(transactions: List[TransactionInput]):
    """Compare average monthly spend in the earlier vs. later half of the observed history."""
    try:
        from expense_analyzer import BehavioralSpendingAnalyzer

        tx_list = [t.dict() for t in transactions]
        if len(tx_list) < 4:
            return {
                "status": "success",
                "timestamp": datetime.utcnow().isoformat(),
                "analysis": {"detected": False, "inflation_percentage": 0.0, "reason": "insufficient_data"},
            }

        parsed = sorted(tx_list, key=lambda t: t['date'])
        midpoint = len(parsed) // 2
        before, after = parsed[:midpoint], parsed[midpoint:]

        analysis = BehavioralSpendingAnalyzer.detect_lifestyle_inflation(before, after)

        return {"status": "success", "timestamp": datetime.utcnow().isoformat(), "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/insights/bill-creep")
async def bill_creep(transactions: List[TransactionInput]):
    """Detect recurring bills whose amount has quietly crept up over the observed history."""
    try:
        from expense_analyzer import BillCreepDetector

        tx_list = [t.dict() for t in transactions]
        creeping_bills = BillCreepDetector.detect_creep(tx_list)

        return {"status": "success", "timestamp": datetime.utcnow().isoformat(), "creeping_bills": creeping_bills}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/insights/peer-benchmark")
async def peer_benchmark(transactions: List[TransactionInput], monthly_income: float):
    """Compare the user's spending-by-tier to illustrative reference bands for their income."""
    try:
        from utils import PeerBenchmark

        tx_list = [t.dict() for t in transactions]
        expense_analysis = engine.expense_analyzer.analyze_transactions(tx_list)
        spending_by_tier = expense_analysis.get('spending_by_tier', {})

        comparison = PeerBenchmark.compare_to_reference(spending_by_tier, monthly_income)

        return {"status": "success", "timestamp": datetime.utcnow().isoformat(), "benchmark": comparison}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/expense/categorize")
async def categorize_expense(payload: CategorizeRequest):
    """Predict the tier/category of a new transaction using a model trained live on this
    user's own transaction history (falls back to a rule-based heuristic without enough history)."""
    try:
        historical = [t.dict() for t in payload.historical_transactions]
        new_txn = payload.new_transaction.dict()
        if not new_txn.get('date'):
            new_txn['date'] = datetime.utcnow().isoformat()

        prediction = engine.expense_analyzer.train_and_predict_category(historical, new_txn)

        return {"status": "success", "timestamp": datetime.utcnow().isoformat(), "prediction": prediction}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/goals/optimize-allocation")
async def optimize_goal_allocation(goals: List[GoalInput], monthly_surplus: float):
    """Split ONE shared monthly surplus across multiple competing goals (priority + deadline
    aware), instead of naively assuming each goal gets the full surplus independently."""
    try:
        from goal_optimizer import PortfolioAllocator

        goals_with_deadline = [{**g.dict(), "deadline": datetime.fromisoformat(g.deadline)} for g in goals]
        allocation = PortfolioAllocator.optimize_allocation(goals_with_deadline, monthly_surplus)

        return {"status": "success", "timestamp": datetime.utcnow().isoformat(), "allocation": allocation}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*80)
    print("Starting Goal Achievement Intelligence Engine API")
    print("="*80 + "\n")
    print("Available endpoints:")
    print("  - Health: GET /health")
    print("  - Analysis: POST /api/v1/analyze/*")
    print("  - Recommendations: POST /api/v1/recommendations/*")
    print("  - Validation: POST /api/v1/recommendation/validate")
    print("  - Config: GET /api/v1/config")
    print("\nDocs available at: http://localhost:8000/docs")
    print("\n" + "="*80 + "\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
