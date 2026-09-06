"""Tests for ExpenseAnalyzer (ml/expense_analyzer.py) using the canonical demo dataset."""
from expense_analyzer import ExpenseAnalyzer


def test_analyze_transactions_empty_list_returns_zeroed_shape():
    analysis = ExpenseAnalyzer().analyze_transactions([])

    assert analysis["total_transactions"] == 0
    assert analysis["total_spending"] == 0.0
    assert analysis["monthly_average"] == 0.0
    assert analysis["recurring_transactions"] == []


def test_analyze_transactions_on_canonical_data_returns_expected_shape(canonical_user_data):
    transactions = canonical_user_data["transactions"]

    analysis = ExpenseAnalyzer().analyze_transactions(transactions)

    assert analysis["total_transactions"] == len(transactions)
    assert analysis["total_spending"] == sum(t["amount"] for t in transactions)
    assert analysis["monthly_average"] > 0

    # All 4 tiers present in the canonical dataset should show up in the breakdown.
    tiers_in_data = {t["tier"] for t in transactions}
    assert tiers_in_data.issubset(set(analysis["spending_by_tier"].keys()))


def test_analyze_transactions_is_json_serializable(canonical_user_data):
    """Regression guard: numpy scalar dict keys/values previously leaked into this
    response and broke JSON serialization in the API layer (see repo history)."""
    import json

    analysis = ExpenseAnalyzer().analyze_transactions(canonical_user_data["transactions"])

    json.dumps(analysis)  # raises TypeError if anything non-JSON-serializable leaked in


def _monthly_subscription_transactions(num_months: int) -> list:
    """A ₹499/month subscription (identical amount+description every month)."""
    return [
        {
            "amount": 499,
            "category": "Tier_D_Leakage",
            "date": f"2026-{month:02d}-01",
            "description": "Unused fitness app subscription",
            "tier": "Tier_D_Leakage",
            "merchant": "Cult.fit",
        }
        for month in range(1, num_months + 1)
    ]


def test_leakage_monthly_cost_does_not_scale_with_history_length():
    """Regression guard: _detect_leakage used to multiply monthly_cost by the recurring
    item's total occurrence `count`, so a ₹499/month subscription reported an ever-larger
    "monthly cost" the more months of transaction history it was fed (e.g. ~₹6,000/month
    for 12 months of history instead of the real ₹499/month)."""
    analysis_3_months = ExpenseAnalyzer().analyze_transactions(_monthly_subscription_transactions(3))
    analysis_12_months = ExpenseAnalyzer().analyze_transactions(_monthly_subscription_transactions(12))

    leak_3 = next(item for item in analysis_3_months["leakage_opportunities"] if item["description"].startswith("Unused"))
    leak_12 = next(item for item in analysis_12_months["leakage_opportunities"] if item["description"].startswith("Unused"))

    # Both should land close to the real ₹499/month regardless of how many months of
    # history were supplied (small differences remain because frequency_days is an
    # int-truncated average interval, which is noisier with fewer data points — but
    # the old bug scaled monthly_cost by `count`, giving ~₹1,548 for 3 months and
    # ~₹5,988 for 12 months, an order of magnitude off either way).
    assert abs(leak_3["monthly_cost"] - 499) < 25.0
    assert abs(leak_12["monthly_cost"] - 499) < 5.0
    assert abs(leak_12["annual_cost"] - 499 * 12) < 60.0
