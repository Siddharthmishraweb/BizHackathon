"""Pydantic schemas for the risk-prediction API."""

from typing import Literal, Optional

from pydantic import BaseModel, Field


InvestmentFrequency = Literal["MONTHLY", "QUARTERLY", "LUMP_SUM", "RARELY"]
LiquidityPreference = Literal["LOW", "MEDIUM", "HIGH"]
InvestmentGoal = Literal[
    "WEALTH_CREATION",
    "RETIREMENT",
    "TAX_SAVING",
    "EMERGENCY_FUND",
    "SHORT_TERM_GOAL",
]
RiskProfile = Literal["LOW", "MEDIUM", "HIGH"]


class RiskPredictionRequest(BaseModel):
    age: int = Field(ge=18, le=100)
    monthly_income: float = Field(gt=0)
    monthly_expenses: float = Field(ge=0)
    savings: float = Field(ge=0)
    existing_investments: float = Field(ge=0)
    monthly_emi: float = Field(ge=0)
    investment_horizon: int = Field(ge=1, le=50)
    investment_experience: int = Field(ge=1, le=5)
    reaction_to_market_loss: int = Field(ge=1, le=5)
    investment_frequency: InvestmentFrequency
    liquidity_preference: LiquidityPreference
    investment_goal: InvestmentGoal
    risk_questionnaire_score: Optional[float] = Field(default=None, ge=0, le=100)


class RiskPredictionResponse(BaseModel):
    risk_profile: RiskProfile
    probabilities: dict[RiskProfile, float]