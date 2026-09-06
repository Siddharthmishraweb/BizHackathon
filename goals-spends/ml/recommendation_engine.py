"""
Recommendation Engine and Safety Checker
Generates recommendations and validates safety constraints
"""
from typing import List, Dict, Tuple, Optional
import numpy as np
from datetime import datetime
from config import config
from utils import FinancialMetrics, RiskCalculator


class SafetyChecker:
    """Validates that recommendations are safe and don't harm financial stability"""
    
    @staticmethod
    def check_recommendation_safety(
        recommendation: Dict,
        user_situation: Dict,
        thresholds: Dict = None
    ) -> Dict:
        """Check if a recommendation is safe"""
        
        if thresholds is None:
            thresholds = {
                "min_emergency_fund": user_situation.get('mandatory_monthly_expenses', 10000) * 3,
                "min_liquid_assets": 50000,
                "max_debt_to_income": 0.4,
                "min_safety_buffer": 1000,
            }
        
        safety_checks = {}
        is_safe = True
        safety_concerns = []
        
        # Check 1: Emergency fund preservation
        current_savings = user_situation.get('current_savings', 0)
        recommended_action_cost = recommendation.get('estimated_impact', 0)
        savings_after = current_savings - recommended_action_cost
        min_emergency = thresholds.get('min_emergency_fund', 30000)
        
        if savings_after < min_emergency:
            is_safe = False
            safety_concerns.append(
                f"This action would reduce emergency fund to ₹{savings_after:,.0f}, "
                f"which is below the recommended minimum of ₹{min_emergency:,.0f}"
            )
        
        safety_checks["emergency_fund_preserved"] = savings_after >= min_emergency
        
        # Check 2: Mandatory debt obligations
        monthly_debt = user_situation.get('mandatory_monthly_debt', 0)
        monthly_income = user_situation.get('monthly_income', 0)
        
        # Defined unconditionally (used below outside the if-block too) — previously this was
        # only assigned inside `if monthly_income > 0`, raising UnboundLocalError whenever
        # monthly_income was 0/missing.
        debt_to_income = monthly_debt / monthly_income if monthly_income > 0 else 0.0
        if monthly_income > 0:
            if debt_to_income > thresholds.get('max_debt_to_income', 0.4):
                is_safe = False
                safety_concerns.append(
                    f"High debt-to-income ratio ({debt_to_income:.1%}). "
                    "Recommend paying down debt before aggressive investing"
                )
        
        safety_checks["debt_ratio_acceptable"] = debt_to_income <= thresholds.get('max_debt_to_income', 0.4)
        
        # Check 3: Liquidity after recommendation
        liquid_assets_after = user_situation.get('liquid_assets', 0) - recommended_action_cost
        min_liquid = thresholds.get('min_liquid_assets', 50000)
        
        if liquid_assets_after < min_liquid:
            safety_concerns.append(
                f"Liquid assets would drop to ₹{liquid_assets_after:,.0f}. "
                f"Maintain at least ₹{min_liquid:,.0f} for unexpected needs"
            )
            is_safe = False
        
        safety_checks["sufficient_liquidity"] = liquid_assets_after >= min_liquid
        
        # Check 4: Income stability
        income_stability = user_situation.get('income_volatility', 0.1)
        if income_stability > 0.3:  # High volatility
            safety_concerns.append(
                "Your income has high volatility. Be cautious with aggressive goal targets"
            )
        
        safety_checks["income_stability"] = income_stability <= 0.3
        
        # Check 5: Goal override checks
        goal_data = recommendation.get('goal_data', {})
        goal_probability = goal_data.get('success_probability', 0.5)
        
        if goal_probability < 0.4:
            is_safe = False
            safety_concerns.append(
                f"Goal success probability is only {goal_probability:.0%}. "
                "Consider extending timeline, increasing monthly savings, or reducing goal amount"
            )
        
        safety_checks["goal_probability_acceptable"] = goal_probability >= 0.4
        
        return {
            "is_safe": is_safe,
            "safety_checks": safety_checks,
            "safety_concerns": safety_concerns,
            "safety_score": float(sum(safety_checks.values()) / len(safety_checks)) if safety_checks else 0.5,
        }


class RecommendationEngine:
    """Generates personalized recommendations"""
    
    @staticmethod
    def generate_recommendations(
        user_analysis: Dict,
        goal_analysis: Dict,
        feasibility: Dict,
        leakage: List[Dict] = None,
    ) -> List[Dict]:
        """Generate prioritized recommendations"""
        
        if leakage is None:
            leakage = []
        
        recommendations = []
        
        # Recommendation 1: Address financial leakage
        if leakage:
            total_leakage = sum(item.get('annual_cost', 0) for item in leakage[:5])
            monthly_leakage = total_leakage / 12
            
            recommendations.append({
                "id": "REC_001_LEAKAGE",
                "title": "Eliminate Financial Leakage",
                "category": "Expense Optimization",
                "description": f"You have identified ₹{total_leakage:,.0f} in annual financial leakage "
                              f"through small recurring expenses and forgotten subscriptions.",
                "action": f"Cancel or reduce the following: {', '.join(item['description'] for item in leakage[:3])}",
                "impact_type": "monthly_savings",
                "estimated_impact": float(monthly_leakage),
                "annual_impact": float(total_leakage),
                "priority": "HIGH",
                "implementation_difficulty": "EASY",
                "timeline": "This Week",
                "confidence": 0.85,
                "leakage_items": leakage[:5],
            })
        
        # Recommendation 2: Expense optimization
        expense_analysis = user_analysis.get('spending_by_tier', {})
        
        flexible_spending = expense_analysis.get('Tier_C_Flexible', {}).get('total', 0)
        if flexible_spending > 0:
            recommendations.append({
                "id": "REC_002_OPTIMIZE",
                "title": "Optimize Flexible Spending",
                "category": "Expense Optimization",
                "description": f"Your flexible spending (restaurants, shopping, travel) is ₹{flexible_spending:,.0f}/month. "
                              "There's opportunity to reduce this by 20-30% without major lifestyle changes.",
                "action": "Review and negotiate recurring subscriptions. Use discount apps. Reduce restaurant frequency by 2-3 visits/month.",
                "impact_type": "monthly_savings",
                "estimated_impact": float(flexible_spending * 0.25),
                "annual_impact": float(flexible_spending * 0.25 * 12),
                "priority": "MEDIUM",
                "implementation_difficulty": "MEDIUM",
                "timeline": "This Month",
                "confidence": 0.70,
            })
        
        # Recommendation 3: Income expansion
        monthly_income = user_analysis.get('monthly_income', 0)
        if monthly_income > 0:
            potential_additional_income = monthly_income * 0.15  # 15% additional
            
            recommendations.append({
                "id": "REC_003_INCOME",
                "title": "Explore Income Expansion Opportunities",
                "category": "Income Growth",
                "description": f"Based on your profile, you could potentially earn an additional ₹{potential_additional_income:,.0f}/month "
                              "through freelancing, consulting, or part-time work.",
                "action": "Identify 2-3 income opportunities that match your skills. Start with 1-2 hours/week commitment.",
                "impact_type": "monthly_income",
                "estimated_impact": float(potential_additional_income),
                "annual_impact": float(potential_additional_income * 12),
                "priority": "MEDIUM",
                "implementation_difficulty": "HARD",
                "timeline": "This Month",
                "confidence": 0.60,
            })
        
        # Recommendation 4: Goal-specific recommendations
        if feasibility.get('feasibility_class') in ['STRETCHED', 'UNLIKELY', 'CURRENTLY_IMPOSSIBLE']:
            required_monthly = feasibility.get('required_monthly', 0)
            available_monthly = feasibility.get('available_monthly', 0)
            shortfall = max(0, required_monthly - available_monthly)
            
            if shortfall > 0:
                recommendations.append({
                    "id": "REC_004_GOAL_GAP",
                    "title": "Address Goal Funding Gap",
                    "category": "Goal Adjustment",
                    "description": f"To achieve your goal by the deadline, you need ₹{required_monthly:,.0f}/month "
                                  f"but currently have ₹{available_monthly:,.0f}/month available. "
                                  f"Shortfall: ₹{shortfall:,.0f}/month",
                    "action": f"Choose one: (1) Increase savings by ₹{shortfall:,.0f}/month, (2) Extend deadline by 3-6 months, "
                            "(3) Reduce goal amount, or (4) Combine approaches.",
                    "impact_type": "goal_probability",
                    "estimated_impact": 0.25,  # 25% improvement with action
                    "priority": "HIGH",
                    "implementation_difficulty": "HARD",
                    "timeline": "This Month",
                    "confidence": 0.85,
                    "feasibility": feasibility,
                })
        
        # Recommendation 5: Asset allocation
        current_assets = user_analysis.get('total_assets', 0)
        liquid_in_savings = user_analysis.get('liquid_savings', 0)
        
        if current_assets > 0 and liquid_in_savings > 500000:
            invested_amount = current_assets - liquid_in_savings
            investable = liquid_in_savings * 0.5  # Can invest 50% while keeping 50% liquid
            
            recommendations.append({
                "id": "REC_005_INVEST",
                "title": "Optimize Asset Allocation",
                "category": "Investment",
                "description": f"You have ₹{investable:,.0f} in liquid savings that could be invested "
                              "to accelerate goal achievement while maintaining adequate liquidity.",
                "action": "Allocate: 50% Mutual Funds (medium risk), 30% FDs (low risk), 20% Equity (higher risk). "
                        f"This could generate ₹{investable * 0.10:,.0f}/year in returns.",
                "impact_type": "investment_return",
                "estimated_impact": float(investable * 0.10 / 12),  # Monthly return
                "annual_impact": float(investable * 0.10),
                "priority": "LOW",
                "implementation_difficulty": "MEDIUM",
                "timeline": "This Month",
                "confidence": 0.75,
                "risk_level": "MEDIUM",
            })
        
        # Sort by priority and impact
        priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
        recommendations.sort(key=lambda x: (
            priority_order.get(x.get('priority', 'MEDIUM'), 1),
            -x.get('estimated_impact', 0)
        ))
        
        return recommendations
    
    @staticmethod
    def generate_action_plan(
        recommendations: List[Dict],
        priority_strategy: str = "balanced"  # "aggressive", "balanced", "conservative"
    ) -> Dict:
        """Generate an action plan from recommendations"""
        
        action_plan = {
            "strategy": priority_strategy,
            "today": [],
            "this_week": [],
            "this_month": [],
            "ongoing": [],
        }
        
        # Filter recommendations based on strategy
        if priority_strategy == "aggressive":
            recommendations = [r for r in recommendations if r.get('priority') != 'LOW']
        elif priority_strategy == "conservative":
            recommendations = [r for r in recommendations if r.get('implementation_difficulty') != 'HARD']
        
        # Organize by timeline
        for rec in recommendations:
            timeline = rec.get('timeline', 'This Month').lower()
            
            action = {
                "title": rec.get('title'),
                "description": rec.get('action'),
                "expected_impact": rec.get('estimated_impact', 0),
                "difficulty": rec.get('implementation_difficulty'),
                "confidence": rec.get('confidence'),
            }
            
            if 'today' in timeline:
                action_plan["today"].append(action)
            elif 'week' in timeline:
                action_plan["this_week"].append(action)
            elif 'month' in timeline:
                action_plan["this_month"].append(action)
            else:
                action_plan["ongoing"].append(action)
        
        # Calculate total impact
        total_impact = sum(r.get('estimated_impact', 0) for r in recommendations)
        
        action_plan["summary"] = {
            "total_actions": len(recommendations),
            "estimated_monthly_impact": float(total_impact),
            "estimated_annual_impact": float(total_impact * 12),
            "primary_focus": recommendations[0].get('category') if recommendations else "Goal Planning",
        }
        
        return action_plan


class ExplainabilityEngine:
    """Generates explanations for AI decisions"""
    
    @staticmethod
    def explain_recommendation(
        recommendation: Dict,
        user_profile: Dict = None
    ) -> Dict:
        """Generate detailed explanation of recommendation"""
        
        explanation = {
            "what": recommendation.get('title'),
            "why": ExplainabilityEngine._generate_why(recommendation),
            "how_much": f"₹{recommendation.get('estimated_impact', 0):,.0f}/month",
            "what_will_change": ExplainabilityEngine._generate_impact_statement(recommendation),
            "risks": ExplainabilityEngine._identify_risks(recommendation),
            "alternatives": ExplainabilityEngine._generate_alternatives(recommendation),
        }
        
        return explanation
    
    @staticmethod
    def _generate_why(recommendation: Dict) -> str:
        category = recommendation.get('category', 'Financial')
        impact = recommendation.get('estimated_impact', 0)
        return f"{category}: This action can free up approximately ₹{impact:,.0f}/month for your goals."
    
    @staticmethod
    def _generate_impact_statement(recommendation: Dict) -> str:
        impact = recommendation.get('estimated_impact', 0)
        goal_prob_improvement = recommendation.get('estimated_impact', 0) / 10000  # Rough estimate
        
        return (f"Implementing this recommendation would increase your monthly available funds by ₹{impact:,.0f}, "
                f"which could improve your goal achievement probability by approximately {goal_prob_improvement:.1%}.")
    
    @staticmethod
    def _identify_risks(recommendation: Dict) -> List[str]:
        risks = []
        
        if recommendation.get('implementation_difficulty') == 'HARD':
            risks.append("This requires significant effort or lifestyle changes")
        
        if recommendation.get('confidence', 1.0) < 0.7:
            risks.append("Model confidence is moderate; actual results may vary")
        
        if recommendation.get('risk_level') == 'HIGH':
            risks.append("This involves market or investment risk")
        
        return risks
    
    @staticmethod
    def _generate_alternatives(recommendation: Dict) -> List[Dict]:
        # Simplified - would be expanded with actual alternatives
        return [
            {
                "title": "Alternative approach",
                "description": "Consider a different implementation method",
                "pros": "May be easier to implement",
                "cons": "Could be less effective",
            }
        ]


if __name__ == "__main__":
    print("Testing Recommendation and Safety engines...")
    
    # Test safety checker
    user_situation = {
        "current_savings": 500000,
        "mandatory_monthly_expenses": 30000,
        "mandatory_monthly_debt": 10000,
        "monthly_income": 100000,
        "liquid_assets": 300000,
        "income_volatility": 0.08,
    }
    
    recommendation = {
        "estimated_impact": 50000,
        "goal_data": {"success_probability": 0.75}
    }
    
    safety = SafetyChecker.check_recommendation_safety(recommendation, user_situation)
    print(f"Is safe: {safety['is_safe']}")
    print(f"Safety score: {safety['safety_score']:.2%}")
    print(f"Concerns: {safety['safety_concerns']}")
