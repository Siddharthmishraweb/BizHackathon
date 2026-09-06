"""End-to-end tests for the FastAPI app (ml/api.py) using the canonical demo dataset.

These exercise the exact request/response shapes the real frontends depend on,
guarding against the kind of endpoint regressions recorded in repo memory
(e.g. numpy-typed dict keys breaking JSON encoding, goal deadlines not being
parsed from ISO strings, etc).
"""
from fastapi.testclient import TestClient

from api import app

client = TestClient(app)


def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


def test_get_configuration():
    res = client.get("/api/v1/config")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "success"
    assert body["config"]["monte_carlo_iterations"] > 0


def test_analyze_situation(canonical_user_data):
    res = client.post("/api/v1/analyze/situation", json=canonical_user_data)
    assert res.status_code == 200

    data = res.json()["data"]
    assert "net_worth" in data["financial_health"]
    assert "monthly_surplus" in data["expenses"]


def test_analyze_goals_returns_feasibility_for_every_goal(canonical_user_data):
    res = client.post("/api/v1/analyze/goals", json=canonical_user_data)
    assert res.status_code == 200

    goals = res.json()["goals"]
    expected_names = {g["name"] for g in canonical_user_data["goals"]}
    assert set(goals.keys()) == expected_names

    for goal_result in goals.values():
        assert "feasibility_class" in goal_result
        assert 0 <= goal_result["success_probability"] <= 1


def test_analyze_comprehensive_returns_full_plan(canonical_user_data):
    res = client.post("/api/v1/analyze/comprehensive", json=canonical_user_data)
    assert res.status_code == 200

    plan = res.json()["plan"]
    assert "situation_analysis" in plan
    assert "goal_analysis" in plan
    assert "recommendations" in plan


def test_single_goal_feasibility(canonical_user_data):
    goal = canonical_user_data["goals"][0]

    res = client.post(
        "/api/v1/goal/feasibility",
        json=goal,
        params={"monthly_surplus": 50000},
    )
    assert res.status_code == 200
    assert "feasibility_class" in res.json()["feasibility"]


def test_expense_analyze(canonical_user_data):
    res = client.post("/api/v1/expense/analyze", json=canonical_user_data["transactions"])
    assert res.status_code == 200
    assert res.json()["analysis"]["total_transactions"] == len(canonical_user_data["transactions"])


def test_what_if_reflects_the_actual_requested_changes(canonical_user_data):
    """Regression guard: this endpoint used to be a stub returning a hardcoded
    {monthly_impact: 5000, annual_impact: 60000} regardless of scenario_changes or input."""
    res = client.post(
        "/api/v1/scenario/what-if",
        json={
            "current_situation": canonical_user_data,
            "scenario_changes": {"flexSpendPercent": -100, "incomePercent": 0, "newMonthlyExpense": 0},
        },
    )
    assert res.status_code == 200
    body = res.json()

    # Cutting all flexible/leakage spend to zero must increase the monthly surplus.
    assert body["scenario"]["monthly_surplus"] > body["baseline"]["monthly_surplus"]
    assert body["projected_impact"]["monthly_impact"] > 0
    # No longer the old hardcoded stub values.
    assert body["projected_impact"]["monthly_impact"] != 5000
