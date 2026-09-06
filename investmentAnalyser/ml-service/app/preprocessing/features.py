"""Build the model feature row from a validated API request."""

import pandas as pd

from app.schemas.risk import RiskPredictionRequest


FREQUENCY_SCORES = {"MONTHLY": 6, "QUARTERLY": 3, "LUMP_SUM": 1, "RARELY": -5}
LIQUIDITY_SCORES = {"LOW": 7, "MEDIUM": 0, "HIGH": -8}


def derive_questionnaire_score(request: RiskPredictionRequest) -> float:
    """Approximate the optional score from the submitted behavioural answers."""
    if request.risk_questionnaire_score is not None:
        return request.risk_questionnaire_score
    score = (
        25
        + request.investment_experience * 8
        + request.reaction_to_market_loss * 7
        + FREQUENCY_SCORES[request.investment_frequency]
        + LIQUIDITY_SCORES[request.liquidity_preference]
    )
    return float(max(0, min(score, 100)))


def build_feature_frame(request: RiskPredictionRequest, feature_columns: list[str]) -> pd.DataFrame:
    """Derive financial values and return exactly the model's expected columns."""
    monthly_surplus = max(
        0.0,
        request.monthly_income - request.monthly_expenses - request.monthly_emi,
    )
    annual_income = request.monthly_income * 12
    values = {
        **request.model_dump(exclude={"risk_questionnaire_score"}),
        "monthly_surplus": monthly_surplus,
        "risk_questionnaire_score": derive_questionnaire_score(request),
        "savings_ratio": request.savings / annual_income,
        "expense_ratio": request.monthly_expenses / request.monthly_income,
        "emi_to_income_ratio": request.monthly_emi / request.monthly_income,
        "investment_to_income_ratio": request.existing_investments / annual_income,
    }
    return pd.DataFrame([values], columns=feature_columns)