"""
Utility functions for the Goal Achievement Intelligence Engine
"""
import random
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
import numpy as np
from config import config


class DateUtils:
    """Date and time utilities"""
    
    @staticmethod
    def get_month_start(date: datetime) -> datetime:
        """Get first day of month"""
        return date.replace(day=1)
    
    @staticmethod
    def get_month_end(date: datetime) -> datetime:
        """Get last day of month"""
        if date.month == 12:
            return date.replace(year=date.year + 1, month=1, day=1) - timedelta(days=1)
        return date.replace(month=date.month + 1, day=1) - timedelta(days=1)
    
    @staticmethod
    def add_months(date: datetime, months: int) -> datetime:
        """Add months to a date"""
        month = date.month - 1 + months
        year = date.year + month // 12
        month = month % 12 + 1
        day = min(date.day, [31, 29 if year % 4 == 0 else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
        return date.replace(year=year, month=month, day=day)


class FinancialMetrics:
    """Financial calculation utilities"""
    
    @staticmethod
    def calculate_emi(principal: float, annual_rate: float, months: int) -> float:
        """Calculate monthly EMI (Equated Monthly Installment)"""
        if annual_rate == 0:
            return principal / months
        
        monthly_rate = annual_rate / 12 / 100
        emi = principal * (monthly_rate * (1 + monthly_rate) ** months) / ((1 + monthly_rate) ** months - 1)
        return emi
    
    @staticmethod
    def calculate_compound_interest(principal: float, rate: float, years: int, compounds_per_year: int = 12) -> float:
        """Calculate compound interest"""
        return principal * (1 + rate / 100 / compounds_per_year) ** (compounds_per_year * years)
    
    @staticmethod
    def calculate_future_value(current_amount: float, monthly_investment: float, annual_return: float, years: int) -> float:
        """Calculate future value with regular investments"""
        months = years * 12
        monthly_return = (1 + annual_return) ** (1/12) - 1
        
        # FV of current amount
        fv_current = current_amount * ((1 + monthly_return) ** months)
        
        # FV of annuity (monthly investments)
        fv_annuity = monthly_investment * (((1 + monthly_return) ** months - 1) / monthly_return)
        
        return fv_current + fv_annuity
    
    @staticmethod
    def calculate_required_monthly_savings(target: float, current: float, months: int, annual_return: float = 0.12) -> float:
        """Calculate required monthly savings to reach target"""
        monthly_return = (1 + annual_return) ** (1/12) - 1
        
        # Future value of current amount
        fv_current = current * ((1 + monthly_return) ** months)
        
        # Required additional amount
        needed = target - fv_current
        
        if needed <= 0:
            return 0
        
        # Required monthly investment to reach target
        if monthly_return == 0:
            return needed / months
        
        monthly_savings = needed / (((1 + monthly_return) ** months - 1) / monthly_return)
        return max(0, monthly_savings)
    
    @staticmethod
    def calculate_achievement_probability(required_monthly: float, available_monthly: float, volatility: float = 0.1) -> float:
        """
        Calculate probability of achieving goal based on available savings and volatility.
        Uses normal distribution approximation.
        """
        if available_monthly <= 0:
            return 0.0
        
        # Ratio of available to required
        ratio = available_monthly / required_monthly
        
        # Account for volatility
        # Using normal distribution CDF approximation
        from scipy.stats import norm
        probability = norm.cdf(ratio / (1 + volatility))
        
        return max(0.0, min(1.0, probability))
    
    @staticmethod
    def calculate_emergency_fund_requirement(monthly_mandatory_expenses: float, multiplier: float = 3.0) -> float:
        """Calculate emergency fund requirement"""
        return monthly_mandatory_expenses * multiplier


class SpendingAnalysis:
    """Spending pattern analysis utilities"""
    
    @staticmethod
    def detect_recurring_transactions(transactions: List[Dict], threshold_consistency: float = 0.8) -> List[Dict]:
        """Detect recurring transactions"""
        recurring = {}
        
        # Group by amount and description
        for txn in transactions:
            key = (txn.get("amount"), txn.get("description"))
            if key not in recurring:
                recurring[key] = []
            recurring[key].append(txn)
        
        # Filter for consistent patterns
        result = []
        for (amount, desc), txns in recurring.items():
            if len(txns) >= 2:
                # Check consistency (dates should be roughly regular intervals)
                raw_dates = [t.get("date") for t in txns if t.get("date")]
                dates = sorted(
                    datetime.fromisoformat(d) if isinstance(d, str) else d
                    for d in raw_dates
                )
                if len(dates) >= 2:
                    intervals = [
                        (dates[i+1] - dates[i]).days 
                        for i in range(len(dates)-1)
                    ]
                    
                    # Check if intervals are consistent (within 20% variation)
                    if intervals:
                        mean_interval = np.mean(intervals)
                        std_interval = np.std(intervals)
                        consistency = 1.0 - (std_interval / mean_interval if mean_interval > 0 else 1.0)
                        
                        if consistency >= threshold_consistency:
                            result.append({
                                "amount": amount,
                                "description": desc,
                                "frequency_days": int(np.mean(intervals)),
                                "count": len(txns),
                                "consistency": consistency,
                                "tier": txns[0].get("tier"),
                                "transactions": txns
                            })
        
        return result
    
    @staticmethod
    def calculate_spending_scores(transaction: Dict, category_tier: str) -> Dict[str, float]:
        """Calculate spending intelligence scores for a transaction"""
        amount = transaction.get("amount", 0)
        
        scores = {
            "necessity_score": 0.0,
            "cuttable_score": 0.0,
            "goal_impact_score": 0.0,
            "behavioral_leakage_score": 0.0,
            "recurring_score": 0.0,
            "emotional_spending_score": 0.0,
            "value_per_rupee_score": 0.0,
            "financial_risk_score": 0.0,
        }
        
        # Tier-based scoring
        if category_tier == "Tier_A_NonNegotiable":
            scores["necessity_score"] = 0.9
            scores["cuttable_score"] = 0.1
            scores["goal_impact_score"] = -0.5
        elif category_tier == "Tier_B_Optimizable":
            scores["necessity_score"] = 0.6
            scores["cuttable_score"] = 0.4
            scores["goal_impact_score"] = -0.3
        elif category_tier == "Tier_C_Flexible":
            scores["necessity_score"] = 0.2
            scores["cuttable_score"] = 0.8
            scores["goal_impact_score"] = -0.7
        elif category_tier == "Tier_D_Leakage":
            scores["necessity_score"] = 0.0
            scores["cuttable_score"] = 1.0
            scores["goal_impact_score"] = -1.0
            scores["behavioral_leakage_score"] = 0.9
        
        return scores


class PeerBenchmark:
    """Illustrative reference bands for spending-by-tier as a percentage of income.

    NOTE: these are heuristic reference bands based on common budgeting guidance
    (roughly a 50/30/20-style split), NOT real aggregated data from other customers —
    presented to users as an illustrative comparison, not a claim about actual peers.
    """

    REFERENCE_BANDS = {
        "Tier_A_NonNegotiable": (0.40, 0.10),
        "Tier_B_Optimizable": (0.15, 0.05),
        "Tier_C_Flexible": (0.15, 0.08),
        "Tier_D_Leakage": (0.03, 0.02),
    }

    @staticmethod
    def compare_to_reference(spending_by_tier: Dict[str, Dict], monthly_income: float) -> List[Dict]:
        """Percentile-rank the user's actual spend-per-tier against the reference band."""
        from scipy.stats import norm

        results = []
        if monthly_income <= 0:
            return results

        for tier, (ref_mean, ref_std) in PeerBenchmark.REFERENCE_BANDS.items():
            tier_data = spending_by_tier.get(tier) or {}
            actual_amount = tier_data.get('total', 0)
            actual_pct = actual_amount / monthly_income

            z_score = (actual_pct - ref_mean) / ref_std if ref_std > 0 else 0
            percentile = float(norm.cdf(z_score) * 100)

            results.append({
                "tier": tier,
                "actual_percentage": float(actual_pct * 100),
                "reference_percentage": float(ref_mean * 100),
                "percentile_vs_reference": max(1.0, min(99.0, percentile)),
                "status": "above_typical" if percentile > 65 else "below_typical" if percentile < 35 else "typical",
            })
        return results


class RiskCalculator:
    """Risk assessment utilities"""
    
    @staticmethod
    def assess_financial_shock_impact(
        current_savings: float,
        monthly_surplus: float,
        emergency_fund: float,
        shock_amount: float
    ) -> Dict[str, Any]:
        """Assess impact of financial shock"""
        available_for_shock = current_savings - emergency_fund
        
        if shock_amount <= emergency_fund:
            return {
                "impact_severity": "low",
                "emergency_fund_after": emergency_fund - shock_amount,
                "months_delayed": 0,
                "recovery_time_months": 0 if monthly_surplus > 0 else None,
            }
        elif shock_amount <= available_for_shock:
            # Fully absorbed by non-emergency savings — emergency fund itself is untouched
            # and there's nothing to "recover" from (previously wrongly zeroed the emergency
            # fund and computed a negative recovery time here).
            return {
                "impact_severity": "medium",
                "emergency_fund_after": emergency_fund,
                "months_delayed": 0,
                "recovery_time_months": 0,
            }
        else:
            remaining_shock = shock_amount - available_for_shock
            recovery_months = remaining_shock / monthly_surplus if monthly_surplus > 0 else None
            return {
                "impact_severity": "high",
                "emergency_fund_after": 0,
                "months_delayed": recovery_months,
                "recovery_time_months": recovery_months,
            }
    
    @staticmethod
    def calculate_goal_at_risk(goal_probability: float, confidence: float) -> str:
        """Classify goal risk level"""
        if goal_probability >= 0.8 and confidence >= 0.8:
            return "LOW_RISK"
        elif goal_probability >= 0.6 and confidence >= 0.7:
            return "MEDIUM_RISK"
        elif goal_probability >= 0.4:
            return "HIGH_RISK"
        else:
            return "CRITICAL_RISK"


class OptimizationHelpers:
    """Optimization algorithm helpers"""
    
    @staticmethod
    def generate_strategy_permutations(
        expense_cut_levels: List[float],  # [0.0, 0.1, 0.2, ...]
        income_increase_levels: List[float],  # [0.0, 0.05, 0.1, ...]
        asset_allocation_options: List[Dict],
        financing_options: List[Dict],
        deadline_adjustments: List[int],  # months
    ) -> List[Dict]:
        """Generate strategy combinations for optimization"""
        strategies = []
        
        for expense_cut in expense_cut_levels:
            for income_inc in income_increase_levels:
                for asset_alloc in asset_allocation_options:
                    for financing in financing_options:
                        for deadline_adj in deadline_adjustments:
                            strategy = {
                                "expense_reduction_ratio": expense_cut,
                                "income_increase_ratio": income_inc,
                                "asset_allocation": asset_alloc,
                                "financing_option": financing,
                                "deadline_adjustment_months": deadline_adj,
                            }
                            strategies.append(strategy)
        
        return strategies


# Validation utilities
def validate_positive(value: float, name: str) -> float:
    """Validate positive number"""
    if value < 0:
        raise ValueError(f"{name} must be positive, got {value}")
    return value


def validate_probability(value: float, name: str) -> float:
    """Validate probability value (0-1)"""
    if not (0 <= value <= 1):
        raise ValueError(f"{name} must be between 0 and 1, got {value}")
    return value
