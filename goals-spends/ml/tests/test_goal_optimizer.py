"""Tests for GoalFeasibilityCalculator (ml/goal_optimizer.py)."""
from datetime import datetime

from goal_optimizer import GoalFeasibilityCalculator, MonteCarloSimulator, PortfolioAllocator


def _next_year_same_month(now: datetime) -> datetime:
    """A deadline exactly 12 calendar months away, independent of leap years/day-of-month."""
    return datetime(now.year + 1, now.month, 1)


def test_overdue_goal_already_met_is_feasible():
    now = datetime.utcnow()
    past_deadline = datetime(now.year - 1, now.month, 1)

    result = GoalFeasibilityCalculator.calculate_feasibility(
        target_amount=100000,
        current_amount=150000,
        deadline=past_deadline,
        monthly_surplus=0,
    )

    assert result["feasibility_class"] == "GOAL_OVERDUE"
    assert result["feasible"] is True
    assert result["probability"] == 1.0


def test_overdue_goal_not_met_is_infeasible():
    now = datetime.utcnow()
    past_deadline = datetime(now.year - 1, now.month, 1)

    result = GoalFeasibilityCalculator.calculate_feasibility(
        target_amount=100000,
        current_amount=50000,
        deadline=past_deadline,
        monthly_surplus=0,
    )

    assert result["feasibility_class"] == "GOAL_OVERDUE"
    assert result["feasible"] is False
    assert result["probability"] == 0.0


def test_ample_surplus_is_very_likely():
    deadline = _next_year_same_month(datetime.utcnow())

    result = GoalFeasibilityCalculator.calculate_feasibility(
        target_amount=120000,
        current_amount=0,
        deadline=deadline,
        monthly_surplus=50000,  # far more than the ~10k/mo required
    )

    assert result["feasibility_class"] == "VERY_LIKELY"
    assert result["feasible"] is True
    assert result["success_probability"] > 0.5


def test_zero_surplus_large_gap_is_currently_impossible():
    deadline = _next_year_same_month(datetime.utcnow())

    result = GoalFeasibilityCalculator.calculate_feasibility(
        target_amount=5000000,
        current_amount=0,
        deadline=deadline,
        monthly_surplus=0,
    )

    assert result["feasibility_class"] == "CURRENTLY_IMPOSSIBLE"
    assert result["success_probability"] == 0.0
    assert result["feasible"] is False


def test_required_monthly_matches_compound_interest_formula():
    """Cross-checks calculate_feasibility's required_monthly against the same
    compounding formula used internally (FinancialMetrics.calculate_required_monthly_savings),
    guarding against a regression in either implementation drifting apart."""
    now = datetime.utcnow()
    deadline = _next_year_same_month(now)
    target, current = 120000, 20000

    result = GoalFeasibilityCalculator.calculate_feasibility(
        target_amount=target,
        current_amount=current,
        deadline=deadline,
        monthly_surplus=10000,
    )

    assert result["months_remaining"] == 12

    annual_return = 0.12  # config.DEFAULT_INVESTMENT_RETURN
    monthly_return = (1 + annual_return) ** (1 / 12) - 1
    fv_current = current * (1 + monthly_return) ** 12
    needed = target - fv_current
    expected_required_monthly = needed / (((1 + monthly_return) ** 12 - 1) / monthly_return)

    assert abs(result["required_monthly"] - expected_required_monthly) < 0.01


def test_recovery_plan_offers_four_strategies_when_behind():
    situation = {
        "funding_gap": 100000,
        "available_monthly": 2000,
        "months_remaining": 10,
        "current_amount": 20000,
        "target_amount": 120000,
    }

    plans = GoalFeasibilityCalculator.calculate_recovery_plan(situation)

    strategies = {p["strategy"] for p in plans}
    assert strategies == {
        "Increase Monthly Savings",
        "Reduce Goal Amount",
        "Extend Timeline",
        "Hybrid Approach",
    }


def test_recovery_plan_empty_when_no_shortfall():
    plans = GoalFeasibilityCalculator.calculate_recovery_plan({"funding_gap": 0})
    assert plans == []


def test_portfolio_allocator_prioritizes_lower_priority_number_first():
    now = datetime.utcnow()
    deadline = _next_year_same_month(now)

    goals = [
        {"name": "Low priority goal", "target_amount": 200000, "current_amount": 0, "deadline": deadline, "priority": 3},
        {"name": "Urgent goal", "target_amount": 60000, "current_amount": 0, "deadline": deadline, "priority": 1},
    ]

    # Surplus only covers the urgent (priority 1) goal's requirement, not both.
    result = PortfolioAllocator.optimize_allocation(goals, monthly_surplus=6000)

    by_name = {a["name"]: a for a in result["allocations"]}
    assert by_name["Urgent goal"]["fully_funded"] is True
    assert by_name["Low priority goal"]["fully_funded"] is False
    assert by_name["Low priority goal"]["allocated_monthly"] < by_name["Low priority goal"]["required_monthly"]
    # Total required across both goals genuinely exceeds what's available.
    assert result["total_required_monthly"] > result["total_monthly_surplus"]


def test_monte_carlo_expense_volatility_widens_the_outcome_spread():
    """Regression guard: expense_variation used to be computed and then silently discarded,
    so the documented expense_volatility parameter had zero effect on the simulation. With
    the fix, a higher expense_volatility should produce a wider spread of outcomes (larger
    gap between the 10th and 90th percentile) for identical inputs otherwise."""
    kwargs = dict(
        current_amount=100000,
        monthly_contribution=20000,
        target_amount=500000,
        months=24,
        income_volatility=0.05,
        investment_volatility=0.05,
    )

    low_expense_vol = MonteCarloSimulator(iterations=500).simulate_goal_achievement(expense_volatility=0.0, **kwargs)
    high_expense_vol = MonteCarloSimulator(iterations=500).simulate_goal_achievement(expense_volatility=0.6, **kwargs)

    low_spread = low_expense_vol["percentile_90"] - low_expense_vol["percentile_10"]
    high_spread = high_expense_vol["percentile_90"] - high_expense_vol["percentile_10"]

    assert high_spread > low_spread
