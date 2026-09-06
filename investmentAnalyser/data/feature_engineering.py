"""Reusable feature transformations for risk-profile training and inference."""

from __future__ import annotations

import numpy as np
import pandas as pd


DERIVED_FEATURE_COLUMNS = [
    "savings_ratio",
    "expense_ratio",
    "emi_to_income_ratio",
    "investment_to_income_ratio",
]


def add_derived_features(dataframe: pd.DataFrame) -> pd.DataFrame:
    """Add income-normalized financial features without modifying the source frame."""
    featured = dataframe.copy()
    income = featured["monthly_income"].replace(0, np.nan)
    annual_income = income * 12

    featured["savings_ratio"] = featured["savings"] / annual_income
    featured["expense_ratio"] = featured["monthly_expenses"] / income
    featured["emi_to_income_ratio"] = featured["monthly_emi"] / income
    featured["investment_to_income_ratio"] = featured["existing_investments"] / annual_income

    if not np.isfinite(featured[DERIVED_FEATURE_COLUMNS].to_numpy(dtype=float)).all():
        raise ValueError("derived features contain missing or non-finite values")
    return featured