"""Tests for RecommendationEngine and SafetyChecker (ml/recommendation_engine.py)."""
from recommendation_engine import RecommendationEngine, SafetyChecker


def test_goal_gap_recommendation_interpolates_shortfall_not_a_literal_placeholder():
    """Regression guard: a missing f-string prefix used to leak the literal text
    '{shortfall:,.0f}' into the recommendation instead of the real number."""
    feasibility = {
        "feasibility_class": "STRETCHED",
        "required_monthly": 20000,
        "available_monthly": 12000,
    }

    recs = RecommendationEngine.generate_recommendations(
        user_analysis={"spending_by_tier": {}, "monthly_income": 0},
        goal_analysis={},
        feasibility=feasibility,
    )

    goal_gap = next(r for r in recs if r["id"] == "REC_004_GOAL_GAP")
    assert "{shortfall" not in goal_gap["action"]
    assert "8,000" in goal_gap["action"]  # 20000 - 12000


def test_invest_recommendation_interpolates_projected_return_not_a_literal_placeholder():
    """Regression guard for the same missing-f-string bug in the asset-allocation recommendation."""
    recs = RecommendationEngine.generate_recommendations(
        user_analysis={
            "spending_by_tier": {},
            "monthly_income": 100000,
            "total_assets": 2000000,
            "liquid_savings": 1000000,
        },
        goal_analysis={},
        feasibility={},
    )

    invest_rec = next(r for r in recs if r["id"] == "REC_005_INVEST")
    assert "{investable" not in invest_rec["action"]
    # investable = 1,000,000 * 0.5 = 500,000; annual return shown = investable * 0.10 = 50,000
    assert "50,000" in invest_rec["action"]


def test_safety_check_does_not_crash_when_monthly_income_is_zero():
    """Regression guard: debt_to_income used to only be assigned inside `if monthly_income > 0`,
    raising UnboundLocalError when monthly_income was 0 (e.g. missing income data)."""
    safety = SafetyChecker.check_recommendation_safety(
        recommendation={"estimated_impact": 1000},
        user_situation={
            "current_savings": 100000,
            "mandatory_monthly_debt": 5000,
            "monthly_income": 0,
            "liquid_assets": 100000,
        },
    )

    assert safety["safety_checks"]["debt_ratio_acceptable"] is True
