"""
Goal Optimization and Monte Carlo Simulation Engine
Calculates goal feasibility and runs probabilistic simulations
"""
from typing import List, Dict, Tuple, Optional
import numpy as np
from datetime import datetime, timedelta
from config import config
from utils import FinancialMetrics, DateUtils, RiskCalculator


class GoalFeasibilityCalculator:
    """Calculates whether a goal is feasible"""
    
    @staticmethod
    def calculate_feasibility(
        target_amount: float,
        current_amount: float,
        deadline: datetime,
        monthly_surplus: float,
        available_assets: float = 0,
        investment_return: float = None,
        volatility: float = 0.1
    ) -> Dict:
        """Calculate goal feasibility"""
        
        investment_return = investment_return or config.DEFAULT_INVESTMENT_RETURN
        
        now = datetime.utcnow()
        if deadline <= now:
            return {
                "feasible": current_amount >= target_amount,
                "feasibility_class": "GOAL_OVERDUE",
                "probability": 1.0 if current_amount >= target_amount else 0.0,
                "required_monthly": 0.0,
                "available_monthly": monthly_surplus,
            }
        
        months_remaining = (deadline.year - now.year) * 12 + (deadline.month - now.month)
        months_remaining = max(1, months_remaining)
        
        # Calculate required monthly contribution
        funding_gap = max(0, target_amount - current_amount)
        
        required_monthly = FinancialMetrics.calculate_required_monthly_savings(
            target_amount,
            current_amount,
            months_remaining,
            investment_return
        )
        
        # Can we use existing assets?
        total_available = monthly_surplus * months_remaining + available_assets
        
        # Feasibility classification
        if total_available >= funding_gap:
            if monthly_surplus >= required_monthly:
                feasibility = "VERY_LIKELY"
                probability = 0.85
            else:
                feasibility = "LIKELY"
                probability = 0.70
        elif total_available >= funding_gap * 0.8:
            feasibility = "POSSIBLE"
            probability = 0.55
        elif total_available >= funding_gap * 0.6:
            feasibility = "STRETCHED"
            probability = 0.35
        elif monthly_surplus > 0:
            feasibility = "UNLIKELY"
            probability = 0.15
        else:
            feasibility = "CURRENTLY_IMPOSSIBLE"
            probability = 0.0
        
        # Adjust probability for volatility
        adjusted_probability = probability * (1 - min(0.3, volatility))
        
        return {
            "feasible": probability > 0.5,
            "feasibility_class": feasibility,
            "success_probability": float(adjusted_probability),
            "confidence": 0.8,  # Will be adjusted by simulations
            "months_remaining": months_remaining,
            "target_amount": float(target_amount),
            "current_amount": float(current_amount),
            "funding_gap": float(funding_gap),
            "required_monthly": float(required_monthly),
            "available_monthly": float(monthly_surplus),
            "available_assets": float(available_assets),
            "projected_value": float(
                FinancialMetrics.calculate_future_value(
                    current_amount,
                    monthly_surplus,
                    investment_return,
                    months_remaining / 12
                )
            ),
        }
    
    @staticmethod
    def calculate_recovery_plan(
        current_situation: Dict,
        deadline_adjustment: int = 0  # months
    ) -> List[Dict]:
        """Generate recovery plans if goal is behind"""
        
        shortfall = current_situation.get('funding_gap', 0)
        if shortfall <= 0:
            return []
        
        available_monthly = current_situation.get('available_monthly', 0)
        months_remaining = current_situation.get('months_remaining', 12)
        current_amount = current_situation.get('current_amount', 0)
        target_amount = current_situation.get('target_amount', 0)
        
        recovery_plans = []
        
        # Plan A: Increase monthly savings
        months_to_recover = months_remaining + deadline_adjustment
        required_monthly = shortfall / months_to_recover if months_to_recover > 0 else 0
        increase_needed = max(0, required_monthly - available_monthly)
        
        recovery_plans.append({
            "strategy": "Increase Monthly Savings",
            "description": f"Save ₹{increase_needed:,.0f} additional per month",
            "monthly_increase": float(increase_needed),
            "timeline_months": months_to_recover,
            "feasibility": "possible" if increase_needed < available_monthly * 2 else "challenging",
            "impact": "Direct increase in goal probability",
        })
        
        # Plan B: Reduce goal amount
        new_target = target_amount * 0.8  # Reduce by 20%
        new_gap = max(0, new_target - current_amount)
        monthly_for_reduced = new_gap / months_remaining if months_remaining > 0 else 0
        
        recovery_plans.append({
            "strategy": "Reduce Goal Amount",
            "description": f"Reduce goal from ₹{target_amount:,.0f} to ₹{new_target:,.0f}",
            "new_target": float(new_target),
            "new_gap": float(new_gap),
            "required_monthly": float(monthly_for_reduced),
            "feasibility": "very_possible" if monthly_for_reduced <= available_monthly else "possible",
            "impact": "Goal becomes more achievable with existing savings rate",
        })
        
        # Plan C: Extend timeline
        new_months = months_remaining + 12  # Extend by 1 year
        monthly_for_extended = shortfall / new_months if new_months > 0 else 0
        new_deadline = DateUtils.add_months(datetime.utcnow(), new_months)
        
        recovery_plans.append({
            "strategy": "Extend Timeline",
            "description": f"Move deadline from {(datetime.utcnow() + timedelta(days=365*months_remaining//12)).strftime('%Y-%m')} to {new_deadline.strftime('%Y-%m')}",
            "new_months": new_months,
            "required_monthly": float(monthly_for_extended),
            "feasibility": "very_possible" if monthly_for_extended <= available_monthly else "possible",
            "impact": "Lower monthly burden, higher success probability",
        })
        
        # Plan D: Hybrid approach
        hybrid_increase = increase_needed * 0.6
        hybrid_reduction = (target_amount - current_amount) * 0.05  # Reduce 5%
        
        recovery_plans.append({
            "strategy": "Hybrid Approach",
            "description": "Combine modest savings increase with small goal reduction and timeline extension",
            "monthly_increase": float(hybrid_increase),
            "goal_reduction": float(hybrid_reduction),
            "months_extension": 6,
            "feasibility": "practical",
            "impact": "Balanced approach distributing effort across multiple levers",
        })
        
        return sorted(recovery_plans, key=lambda x: {"very_possible": 0, "possible": 1, "challenging": 2, "practical": 1}.get(x['feasibility'], 3))


class PortfolioAllocator:
    """Splits ONE shared monthly surplus across multiple competing goals.

    GoalFeasibilityCalculator.calculate_feasibility evaluates each goal in isolation,
    implicitly assuming the full monthly_surplus is available to every goal at once —
    which overstates feasibility the moment a user has more than one active goal. This
    allocates the real, finite surplus across goals (priority first, then soonest
    deadline) and recomputes each goal's feasibility against its actual allocated share.
    """

    @staticmethod
    def optimize_allocation(
        goals: List[Dict],  # each needs: name, target_amount, current_amount, deadline (datetime), priority
        monthly_surplus: float,
        investment_return: float = None,
    ) -> Dict:
        investment_return = investment_return or config.DEFAULT_INVESTMENT_RETURN
        now = datetime.utcnow()

        enriched = []
        for g in goals:
            deadline = g['deadline']
            months_remaining = max(1, (deadline.year - now.year) * 12 + (deadline.month - now.month))
            required_monthly = FinancialMetrics.calculate_required_monthly_savings(
                g['target_amount'], g['current_amount'], months_remaining, investment_return
            )
            enriched.append({**g, "months_remaining": months_remaining, "required_monthly": required_monthly})

        # Lower priority number = funded first; ties broken by the more urgent deadline.
        enriched.sort(key=lambda g: (g.get('priority', 3), g['months_remaining']))

        remaining_surplus = monthly_surplus
        allocations = []
        for g in enriched:
            allocated = min(g['required_monthly'], max(0.0, remaining_surplus))
            remaining_surplus -= allocated

            naive = GoalFeasibilityCalculator.calculate_feasibility(
                g['target_amount'], g['current_amount'], g['deadline'], monthly_surplus
            )
            with_allocation = GoalFeasibilityCalculator.calculate_feasibility(
                g['target_amount'], g['current_amount'], g['deadline'], allocated
            )

            allocations.append({
                "name": g['name'],
                "priority": g.get('priority', 3),
                "months_remaining": g['months_remaining'],
                "required_monthly": float(g['required_monthly']),
                "allocated_monthly": float(allocated),
                "fully_funded": bool(allocated >= g['required_monthly'] - 0.01),
                "naive_feasibility_class": naive['feasibility_class'],
                "allocated_feasibility_class": with_allocation['feasibility_class'],
                "allocated_success_probability": with_allocation['success_probability'],
            })

        return {
            "total_monthly_surplus": float(monthly_surplus),
            "total_required_monthly": float(sum(g['required_monthly'] for g in enriched)),
            "unallocated_surplus": float(max(0.0, remaining_surplus)),
            "fully_covered": bool(remaining_surplus >= -0.01),
            "allocations": allocations,
        }


class MonteCarloSimulator:
    """Monte Carlo simulation for goal achievement probability"""
    
    def __init__(self, iterations: int = None):
        self.iterations = iterations or config.MONTE_CARLO_ITERATIONS
        np.random.seed(42)  # For reproducibility
    
    def simulate_goal_achievement(
        self,
        current_amount: float,
        monthly_contribution: float,
        target_amount: float,
        months: int,
        income_volatility: float = 0.1,
        expense_volatility: float = 0.15,
        investment_return: float = None,
        investment_volatility: float = 0.2,
        emergency_fund_requirement: float = 0,
    ) -> Dict:
        """Run Monte Carlo simulation for goal achievement"""
        
        investment_return = investment_return or config.DEFAULT_INVESTMENT_RETURN
        
        successes = 0
        final_values = []
        month_to_success = []
        emergency_fund_violations = 0
        
        for iteration in range(self.iterations):
            balance = current_amount
            success_month = None
            
            for month in range(1, months + 1):
                # Variable income
                income_variation = np.random.normal(1.0, income_volatility)
                
                # Variable expenses (sometimes higher, sometimes lower) — this used to be
                # computed and then silently discarded, so expense_volatility had NO effect
                # on the simulation despite being a documented parameter. A month with
                # higher-than-usual expenses eats into the contribution actually available
                # to save; net_variation combines both sources of monthly uncertainty.
                expense_variation = np.random.normal(1.0, expense_volatility)
                net_variation = income_variation - (expense_variation - 1)
                monthly_income = monthly_contribution * net_variation
                
                # Investment return (compound)
                annual_return = np.random.normal(investment_return, investment_volatility)
                monthly_return = (1 + annual_return) ** (1/12) - 1
                
                # Update balance
                balance = balance * (1 + monthly_return) + monthly_income
                
                # Check if target reached
                if success_month is None and balance >= target_amount:
                    success_month = month
                    successes += 1
            
            final_values.append(balance)
            if success_month is not None:
                month_to_success.append(success_month)
            
            # Check emergency fund violations
            if balance < emergency_fund_requirement:
                emergency_fund_violations += 1
        
        success_probability = successes / self.iterations
        
        # Calculate percentiles
        final_values_sorted = sorted(final_values)
        p10_idx = int(0.1 * len(final_values_sorted))
        p50_idx = int(0.5 * len(final_values_sorted))
        p90_idx = int(0.9 * len(final_values_sorted))
        
        return {
            "success_probability": float(success_probability),
            "total_iterations": self.iterations,
            "successes": successes,
            "expected_final_value": float(np.mean(final_values)),
            "percentile_10": float(final_values_sorted[p10_idx]),
            "percentile_50": float(final_values_sorted[p50_idx]),
            "percentile_90": float(final_values_sorted[p90_idx]),
            "average_months_to_success": float(np.mean(month_to_success)) if month_to_success else months,
            "min_months_to_success": int(np.min(month_to_success)) if month_to_success else months,
            "max_months_to_success": int(np.max(month_to_success)) if month_to_success else months,
            "emergency_fund_violations": emergency_fund_violations,
            "emergency_fund_safety": float(1 - (emergency_fund_violations / self.iterations)),
            "risk_classification": self._classify_risk(
                success_probability,
                1 - (emergency_fund_violations / self.iterations)
            ),
        }
    
    def simulate_multiple_goals(
        self,
        goals: List[Dict],
        monthly_allocation: float,
        user_data: Dict,
    ) -> Dict:
        """Simulate achievement of multiple goals"""
        
        simulations = {}
        
        for goal in goals:
            goal_name = goal.get('name', 'Goal')
            target = goal.get('target_amount', 0)
            current = goal.get('current_amount', 0)
            deadline = goal.get('deadline')
            
            if deadline:
                months = max(1, (deadline.year - datetime.utcnow().year) * 12 + (deadline.month - datetime.utcnow().month))
            else:
                months = 12
            
            allocation = monthly_allocation * goal.get('priority_weight', 0.5)
            
            sim = self.simulate_goal_achievement(
                current,
                allocation,
                target,
                months,
            )
            
            simulations[goal_name] = sim
        
        # Calculate joint probability (all goals achieved)
            individual_probabilities = [sim['success_probability'] for sim in simulations.values()]
        joint_probability = np.prod(individual_probabilities) if individual_probabilities else 0
        
        return {
            "individual_goals": simulations,
            "joint_probability": float(joint_probability),
            "any_goal_probability": float(1 - np.prod(1 - p for p in individual_probabilities)),
        }
    
    def simulate_financial_shocks(
        self,
        current_situation: Dict,
        possible_shocks: List[Dict],  # [{"name": "Job loss", "probability": 0.05, "amount": 500000}, ...]
        months: int = 12,
    ) -> Dict:
        """Simulate impact of financial shocks"""
        
        shock_scenarios = []
        
        for iteration in range(min(self.iterations // 10, 1000)):  # Fewer iterations for shocks
            starting_savings = current_situation.get('current_savings', 0)
            monthly_surplus = current_situation.get('monthly_surplus', 0)
            emergency_fund = current_situation.get('emergency_fund', starting_savings * 0.3)
            
            balance = starting_savings
            shock_occurred = False
            shock_details = None
            
            # Randomly determine if shock occurs
            for shock in possible_shocks:
                if np.random.random() < shock.get('probability', 0):
                    shock_occurred = True
                    shock_details = shock
                    shock_amount = shock.get('amount', 100000)
                    
                    # Impact of shock
                    if balance >= shock_amount:
                        balance -= shock_amount
                    else:
                        # Need to recover using surplus
                        deficit = shock_amount - balance
                        recovery_months = deficit / monthly_surplus if monthly_surplus > 0 else float('inf')
                        balance = 0
                    break
            
            # Project forward after shock
            for month in range(1, months + 1):
                balance += monthly_surplus
            
            shock_scenarios.append({
                "shock_occurred": shock_occurred,
                "shock_details": shock_details,
                "final_balance": balance,
            })
        
        # Analyze scenarios
        shock_occurrence_rate = sum(1 for s in shock_scenarios if s['shock_occurred']) / len(shock_scenarios)
        avg_final_balance = np.mean([s['final_balance'] for s in shock_scenarios])
        
        return {
            "total_simulations": len(shock_scenarios),
            "shock_probability": float(shock_occurrence_rate),
            "average_final_balance": float(avg_final_balance),
            "resilience_score": float(1.0 if avg_final_balance > 0 else 0.0),
            "scenarios": shock_scenarios[:100],  # Return first 100 for visualization
        }
    
    @staticmethod
    def _classify_risk(success_prob: float, safety: float) -> str:
        """Classify risk level"""
        if success_prob >= 0.8 and safety >= 0.8:
            return "LOW_RISK"
        elif success_prob >= 0.6 and safety >= 0.7:
            return "MEDIUM_RISK"
        elif success_prob >= 0.4:
            return "HIGH_RISK"
        else:
            return "CRITICAL_RISK"


if __name__ == "__main__":
    print("Testing Goal Optimization and Monte Carlo Simulator...")
    
    # Test feasibility
    feasibility = GoalFeasibilityCalculator.calculate_feasibility(
        target_amount=1000000,
        current_amount=200000,
        deadline=datetime.utcnow() + timedelta(days=365),
        monthly_surplus=25000,
        available_assets=100000,
    )
    
    print(f"Goal feasibility: {feasibility['feasibility_class']}")
    print(f"Success probability: {feasibility['success_probability']:.1%}")
    print(f"Required monthly: ₹{feasibility['required_monthly']:,.0f}")
    
    # Test Monte Carlo
    simulator = MonteCarloSimulator(iterations=1000)
    sim_result = simulator.simulate_goal_achievement(
        current_amount=200000,
        monthly_contribution=25000,
        target_amount=1000000,
        months=12,
    )
    
    print(f"\nMonte Carlo (1000 iterations):")
    print(f"Success probability: {sim_result['success_probability']:.1%}")
    print(f"10th percentile: ₹{sim_result['percentile_10']:,.0f}")
    print(f"50th percentile: ₹{sim_result['percentile_50']:,.0f}")
    print(f"90th percentile: ₹{sim_result['percentile_90']:,.0f}")
