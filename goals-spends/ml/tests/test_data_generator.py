"""Tests for the synthetic data generator (ml/data_generator.py)."""
from datetime import datetime

from data_generator import SyntheticGoalGenerator


def test_generate_goal_deadlines_vary_across_calls():
    """Regression guard: GOAL_TEMPLATES used to bake a single random.randint() result at
    class-definition time, so every 'car' goal generated in the same process shared the
    exact same deadline instead of a fresh random one per call."""
    deadlines = {SyntheticGoalGenerator.generate_goal("car")["deadline"] for _ in range(30)}
    assert len(deadlines) > 1


def test_generate_goal_deadline_within_documented_range():
    template = SyntheticGoalGenerator.GOAL_TEMPLATES["house"]
    low, high = template["deadline_months_range"]
    now = datetime.utcnow()

    for _ in range(20):
        goal = SyntheticGoalGenerator.generate_goal("house")
        months_out = (goal["deadline"].year - now.year) * 12 + (goal["deadline"].month - now.month)
        assert low - 1 <= months_out <= high + 1  # +/-1 for day-of-month rounding

    # Sanity: the range itself is coherent (low <= high) for every template.
    for tmpl in SyntheticGoalGenerator.GOAL_TEMPLATES.values():
        assert tmpl["deadline_months_range"][0] <= tmpl["deadline_months_range"][1]
