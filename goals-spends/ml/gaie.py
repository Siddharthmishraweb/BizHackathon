"""
Main Goal Achievement Intelligence Engine Orchestrator
Coordinates all AI/ML components for comprehensive financial analysis
"""
from typing import List, Dict, Optional
from datetime import datetime
import json

from config import config
from expense_analyzer import ExpenseAnalyzer, BehavioralSpendingAnalyzer, SubscriptionAnalyzer
from forecaster import CashFlowForecaster, ScenarioForecaster
from goal_optimizer import GoalFeasibilityCalculator, MonteCarloSimulator
from recommendation_engine import RecommendationEngine, SafetyChecker, ExplainabilityEngine


class GoalAchievementIntelligenceEngine:
    """Main orchestrator for financial analysis and recommendations"""
    
    def __init__(self):
        self.expense_analyzer = ExpenseAnalyzer()
        self.forecaster = CashFlowForecaster()
        self.simulator = MonteCarloSimulator()
        self.safety_checker = SafetyChecker()
        self.recommendation_engine = RecommendationEngine()
        self.explainability = ExplainabilityEngine()
    
    def analyze_user_financial_situation(self, user_data: Dict) -> Dict:
        """Comprehensive analysis of user's financial situation"""
        
        print(f"[GAIE] Analyzing financial situation...")
        
        # Extract key data
        transactions = user_data.get('transactions', [])
        income_sources = user_data.get('income_sources', [])
        assets = user_data.get('assets', [])
        liabilities = user_data.get('liabilities', [])
        goals = user_data.get('goals', [])
        
        # 1. Analyze current finances
        expense_analysis = self.expense_analyzer.analyze_transactions(transactions)
        print(f"  ✓ Expense analysis completed")
        
        # 2. Behavioral analysis
        behavioral = BehavioralSpendingAnalyzer.identify_spending_personas(transactions)
        print(f"  ✓ Behavioral profiling: {behavioral['persona']}")
        
        # 3. Subscription analysis
        recurring = expense_analysis.get('recurring_transactions', [])
        subscription_analysis = SubscriptionAnalyzer.analyze_subscriptions(recurring)
        print(f"  ✓ Found {subscription_analysis['total_subscriptions']} subscriptions")
        
        # 4. Calculate key metrics
        total_assets = sum(asset.get('value', 0) for asset in assets)
        total_liabilities = sum(liability.get('current_balance', 0) for liability in liabilities)
        net_worth = total_assets - total_liabilities
        
        monthly_income = sum(
            source.get('amount', 0) for source in income_sources
            if source.get('frequency', 'monthly') == 'monthly'
        )
        
        monthly_expenses = expense_analysis.get('monthly_average', 0)
        monthly_surplus = monthly_income - monthly_expenses
        
        # 5. Emergency fund analysis
        mandatory_expenses = [
            t for t in transactions
            if t.get('tier') == 'Tier_A_NonNegotiable'
        ]
        mandatory_monthly = sum(t.get('amount', 0) for t in mandatory_expenses) / max(1, len(set(t.get('date') for t in mandatory_expenses)) / 30)
        required_emergency_fund = mandatory_monthly * config.MIN_EMERGENCY_FUND_MULTIPLIER
        
        liquid_assets = sum(
            asset.get('value', 0) for asset in assets
            if asset.get('asset_type') in ['savings', 'fd']
        )
        emergency_fund_status = {
            "required": required_emergency_fund,
            "available": min(liquid_assets * 0.5, required_emergency_fund),
            "adequate": liquid_assets >= required_emergency_fund,
            "status": "ADEQUATE" if liquid_assets >= required_emergency_fund else "INSUFFICIENT"
        }
        
        analysis = {
            "timestamp": datetime.utcnow().isoformat(),
            "financial_health": {
                "net_worth": net_worth,
                "total_assets": total_assets,
                "total_liabilities": total_liabilities,
                "liquid_assets": liquid_assets,
            },
            "income": {
                "monthly_income": monthly_income,
                "monthly_income_stability": self._calculate_income_stability(income_sources),
                "income_sources_count": len(income_sources),
            },
            "expenses": {
                "monthly_spending": monthly_expenses,
                "monthly_surplus": monthly_surplus,
                "spending_by_tier": expense_analysis.get('spending_by_tier', {}),
                "data_quality_confidence": expense_analysis.get('data_quality_confidence', 0.5),
            },
            "behavioral": {
                "spending_persona": behavioral['persona'],
                "spending_consistency": behavioral.get('metrics', {}).get('consistency', 0.5),
                "flex_spending_percentage": behavioral.get('metrics', {}).get('flex_spending_percentage', 0.3),
            },
            "subscriptions": {
                "total_count": subscription_analysis['total_subscriptions'],
                "total_monthly_cost": subscription_analysis['total_monthly_cost'],
                "total_annual_cost": subscription_analysis['total_annual_cost'],
                "potentially_unused_count": len(subscription_analysis['potentially_unused']),
                "potential_savings_annual": subscription_analysis['potential_savings'],
            },
            "leakage": {
                "identified_items": expense_analysis.get('leakage_opportunities', []),
                "total_monthly_leakage": sum(item.get('monthly_cost', 0) for item in expense_analysis.get('leakage_opportunities', [])),
            },
            "emergency_fund": emergency_fund_status,
            "anomalies": {
                "transaction_anomalies": len(expense_analysis.get('anomalies', [])),
                "top_anomalies": expense_analysis.get('anomalies', [])[:5],
            },
        }
        
        return analysis
    
    def analyze_goals(
        self,
        goals: List[Dict],
        user_situation: Dict,
        monthly_surplus: float,
        available_assets: float = 0
    ) -> Dict:
        """Analyze goal feasibility and create achievement plans"""
        
        print(f"[GAIE] Analyzing {len(goals)} goals...")
        
        goal_analysis = {}
        
        for goal in goals:
            goal_name = goal.get('name', 'Goal')
            
            # Calculate feasibility
            feasibility = GoalFeasibilityCalculator.calculate_feasibility(
                target_amount=goal.get('target_amount', 0),
                current_amount=goal.get('current_amount', 0),
                deadline=goal.get('deadline'),
                monthly_surplus=monthly_surplus,
                available_assets=available_assets,
            )
            
            # Run Monte Carlo simulation
            months = feasibility.get('months_remaining', 12)
            simulation = self.simulator.simulate_goal_achievement(
                current_amount=goal.get('current_amount', 0),
                monthly_contribution=monthly_surplus,
                target_amount=goal.get('target_amount', 0),
                months=months,
            )
            
            # Generate recovery plan if needed
            recovery_plan = []
            if not feasibility['feasible']:
                recovery_plan = GoalFeasibilityCalculator.calculate_recovery_plan(feasibility)
            
            goal_analysis[goal_name] = {
                "goal": goal,
                "feasibility": feasibility,
                "monte_carlo_simulation": simulation,
                "recovery_plan": recovery_plan,
                "final_probability": simulation['success_probability'],
            }
            
            print(f"  ✓ {goal_name}: {simulation['success_probability']:.0%} success probability")
        
        return goal_analysis
    
    def generate_comprehensive_plan(
        self,
        user_data: Dict,
        goals: List[Dict],
        priority_strategy: str = "balanced"
    ) -> Dict:
        """Generate comprehensive financial plan"""
        
        print(f"[GAIE] Generating comprehensive financial plan...")
        
        # 1. Analyze current situation
        situation_analysis = self.analyze_user_financial_situation(user_data)
        
        # 2. Forecast cash flow
        monthly_surplus = situation_analysis['income']['monthly_income'] - situation_analysis['expenses']['monthly_spending']
        
        cashflow_forecast = self.forecaster.forecast_cashflow(
            {
                "income_sources": user_data.get('income_sources', []),
                "transactions": user_data.get('transactions', []),
                "current_savings": sum(
                    asset.get('value', 0) for asset in user_data.get('assets', [])
                    if asset.get('asset_type') == 'savings'
                ),
            },
            months=12
        )
        
        # 3. Analyze goals
        goal_analysis = self.analyze_goals(
            goals,
            situation_analysis,
            monthly_surplus,
            sum(asset.get('value', 0) for asset in user_data.get('assets', []) if asset.get('liquidity') == 'high')
        )
        
        # 4. Generate recommendations
        leakage = situation_analysis['leakage'].get('identified_items', [])
        recommendations = self.recommendation_engine.generate_recommendations(
            situation_analysis['expenses'],
            goal_analysis,
            next(iter(goal_analysis.values()))['feasibility'] if goal_analysis else {},
            leakage
        )
        
        # 5. Create action plan
        action_plan = self.recommendation_engine.generate_action_plan(
            recommendations,
            priority_strategy
        )
        
        # 6. Scenario analysis
        scenario_forecast = ScenarioForecaster.forecast_scenarios(
            cashflow_forecast,
            {
                "income_volatility": situation_analysis['income'].get('monthly_income_stability', 0.1),
                "expense_volatility": 0.15,
                "investment_volatility": 0.2,
            }
        )
        
        # 7. Compile comprehensive plan
        comprehensive_plan = {
            "generated_at": datetime.utcnow().isoformat(),
            "situation_analysis": situation_analysis,
            "goal_analysis": {
                name: {
                    "goal": data['goal'],
                    "feasibility_class": data['feasibility']['feasibility_class'],
                    "success_probability": data['monte_carlo_simulation']['success_probability'],
                    "required_monthly": data['feasibility']['required_monthly'],
                    "available_monthly": data['feasibility']['available_monthly'],
                    "risk_classification": data['monte_carlo_simulation']['risk_classification'],
                    "recovery_plan": data['recovery_plan'],
                }
                for name, data in goal_analysis.items()
            },
            "cashflow_forecast": cashflow_forecast,
            "scenario_forecast": scenario_forecast,
            "recommendations": recommendations[:10],  # Top 10
            "action_plan": action_plan,
            "key_insights": self._generate_key_insights(situation_analysis, goal_analysis),
            "next_steps": self._generate_next_steps(action_plan),
        }
        
        print(f"  ✓ Comprehensive plan generated")
        
        return comprehensive_plan
    
    def _calculate_income_stability(self, income_sources: List[Dict]) -> float:
        """Calculate income stability score"""
        if not income_sources:
            return 0.5
        
        stability_scores = []
        for source in income_sources:
            variability = source.get('variability', 0.0)
            probability = source.get('probability', 1.0)
            stability = (1 - variability) * probability
            stability_scores.append(stability)
        
        return sum(stability_scores) / len(stability_scores) if stability_scores else 0.5
    
    def _generate_key_insights(self, situation: Dict, goals: Dict) -> List[str]:
        """Generate human-readable key insights"""
        insights = []
        
        # Insight 1: Financial health
        net_worth = situation['financial_health']['net_worth']
        if net_worth > 5000000:
            insights.append("Strong financial position with significant net worth")
        elif net_worth < 0:
            insights.append("Net worth is negative; focus on debt reduction")
        
        # Insight 2: Emergency fund
        if not situation['emergency_fund']['adequate']:
            insights.append(
                f"Build emergency fund: need ₹{situation['emergency_fund']['required']:,.0f}, "
                f"currently have ₹{situation['emergency_fund']['available']:,.0f}"
            )
        
        # Insight 3: Leakage opportunities (sum ALL identified items, not just the first)
        leakage_annual = sum(item.get('annual_cost', 0) for item in situation['leakage']['identified_items'])
        if leakage_annual > 50000:
            insights.append(f"Recover ₹{leakage_annual:,.0f}/year through expense optimization")
        
        # Insight 4: Goal achievability
        achievable_goals = sum(1 for g in goals.values() if g['feasibility']['feasible'])
        insights.append(f"{achievable_goals}/{len(goals)} goals are realistically achievable")
        
        # Insight 5: Income vs expenses
        surplus = situation['income']['monthly_income'] - situation['expenses']['monthly_spending']
        if surplus > 0:
            insights.append(f"Monthly surplus of ₹{surplus:,.0f} provides flexibility")
        else:
            insights.append("Monthly expenses exceed income; cost cutting needed")
        
        return insights
    
    def _generate_next_steps(self, action_plan: Dict) -> List[str]:
        """Generate next immediate steps"""
        steps = []
        
        # Add today's actions
        for action in action_plan.get('today', []):
            steps.append(f"TODAY: {action['title']}")
        
        # Add this week's actions
        for action in action_plan.get('this_week', []):
            steps.append(f"THIS WEEK: {action['title']}")
        
        if not steps:
            steps.append("Review and prioritize recommendations from the action plan")
        
        return steps[:5]  # Top 5 next steps


# Export for use in other modules
__all__ = ['GoalAchievementIntelligenceEngine']


if __name__ == "__main__":
    from data_generator import SyntheticDatasetGenerator
    
    print("\n" + "="*80)
    print("GOAL ACHIEVEMENT INTELLIGENCE ENGINE - DEMO")
    print("="*80 + "\n")
    
    # Generate synthetic user data
    print("[SETUP] Generating synthetic user data...")
    datasets = SyntheticDatasetGenerator.generate_complete_user_dataset(num_users=1)
    user_data = datasets[0]
    print(f"  ✓ Generated data for: {user_data['user']['email']}\n")
    
    # Initialize engine
    engine = GoalAchievementIntelligenceEngine()
    
    # Generate comprehensive plan
    plan = engine.generate_comprehensive_plan(
        user_data,
        user_data['goals'],
        priority_strategy="balanced"
    )
    
    # Display results
    print("\n" + "="*80)
    print("FINANCIAL SITUATION ANALYSIS")
    print("="*80)
    
    situation = plan['situation_analysis']
    print(f"Monthly Income: ₹{situation['income']['monthly_income']:,.0f}")
    print(f"Monthly Expenses: ₹{situation['expenses']['monthly_spending']:,.0f}")
    print(f"Monthly Surplus: ₹{situation['income']['monthly_income'] - situation['expenses']['monthly_spending']:,.0f}")
    print(f"Net Worth: ₹{situation['financial_health']['net_worth']:,.0f}")
    print(f"Emergency Fund: {situation['emergency_fund']['status']}")
    print(f"Annual Subscription Cost: ₹{situation['subscriptions']['total_annual_cost']:,.0f}")
    print(f"Annual Leakage: ₹{sum(item['annual_cost'] for item in situation['leakage']['identified_items']):,.0f}")
    
    print("\n" + "="*80)
    print("GOAL ANALYSIS")
    print("="*80)
    
    for goal_name, analysis in plan['goal_analysis'].items():
        print(f"\n{goal_name}:")
        print(f"  Target: ₹{analysis['goal']['target_amount']:,.0f}")
        print(f"  Current: ₹{analysis['goal']['current_amount']:,.0f}")
        print(f"  Feasibility: {analysis['feasibility_class']}")
        print(f"  Success Probability: {analysis['success_probability']:.0%}")
        print(f"  Required Monthly: ₹{analysis['required_monthly']:,.0f}")
    
    print("\n" + "="*80)
    print("KEY INSIGHTS")
    print("="*80)
    for i, insight in enumerate(plan['key_insights'], 1):
        print(f"{i}. {insight}")
    
    print("\n" + "="*80)
    print("RECOMMENDATIONS")
    print("="*80)
    for i, rec in enumerate(plan['recommendations'][:5], 1):
        print(f"\n{i}. {rec['title']}")
        print(f"   Priority: {rec['priority']}")
        print(f"   Impact: ₹{rec['estimated_impact']:,.0f}/month")
    
    print("\n" + "="*80)
    print("NEXT STEPS")
    print("="*80)
    for step in plan['next_steps']:
        print(f"→ {step}")
    
    print("\n" + "="*80)
