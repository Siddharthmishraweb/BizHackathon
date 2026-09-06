"""
Financial Forecasting Models
Predicts future financial scenarios using time-series analysis
"""
from typing import List, Dict, Tuple, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

from config import config
from utils import FinancialMetrics, DateUtils


class ExpenseForecaster:
    """Forecasts future expense patterns"""
    
    def __init__(self, months_to_forecast: int = 12):
        self.months_to_forecast = months_to_forecast
        self.scaler = StandardScaler()
        self.models = {}
    
    def forecast_expenses(
        self,
        transactions: List[Dict],
        inflation_rate: float = None,
        behavior_adjustment: float = 1.0
    ) -> Dict:
        """Forecast future expenses"""
        
        inflation_rate = inflation_rate or config.DEFAULT_INFLATION_RATE
        df = pd.DataFrame(transactions)
        
        if len(df) == 0:
            return {
                "forecast": [],
                "monthly_averages": [],
                "trend": "insufficient_data",
                "confidence": 0.0,
            }
        
        df['date'] = pd.to_datetime(df['date'])
        
        # Group by month and sum
        df['year_month'] = df['date'].dt.to_period('M')
        monthly_spending = df.groupby('year_month')['amount'].sum()
        
        if len(monthly_spending) < 2:
            return {
                "forecast": [],
                "monthly_averages": [],
                "trend": "insufficient_data",
                "confidence": 0.0,
            }
        
        # Forecast using simple trend + seasonal adjustment
        forecast = self._forecast_with_trend(
            monthly_spending,
            inflation_rate,
            behavior_adjustment
        )
        
        return forecast
    
    def _forecast_with_trend(
        self,
        monthly_data: pd.Series,
        inflation_rate: float,
        behavior_adjustment: float
    ) -> Dict:
        """Forecast using trend analysis"""
        
        # Prepare data
        X = np.arange(len(monthly_data)).reshape(-1, 1)
        y = monthly_data.values
        
        # Fit linear regression to trend
        model = LinearRegression()
        model.fit(X, y)
        
        # Calculate trend
        trend_slope = model.coef_[0]
        
        # Determine trend direction
        if abs(trend_slope) < np.std(y) * 0.01:
            trend = "stable"
        elif trend_slope > 0:
            trend = "increasing"
        else:
            trend = "decreasing"
        
        # Generate forecast
        current_month = monthly_data.index[-1]
        base_value = monthly_data.iloc[-1]
        
        forecast = []
        for i in range(1, self.months_to_forecast + 1):
            # Base trend projection
            projected = base_value + (trend_slope * i)
            
            # Add inflation
            inflation_multiplier = (1 + inflation_rate) ** (i / 12)
            projected *= inflation_multiplier
            
            # Apply behavior adjustment
            projected *= behavior_adjustment
            
            forecast_month = DateUtils.add_months(current_month.to_timestamp(), i)
            
            forecast.append({
                "month": forecast_month.isoformat(),
                "projected_spending": float(max(0, projected)),
            })
        
        # Calculate monthly averages and confidence
        monthly_averages = [float(v) for v in monthly_data.values[-12:]]
        
        # Confidence based on data consistency
        data_std = np.std(y)
        data_mean = np.mean(y)
        cv = (data_std / (data_mean + 0.01)) if data_mean > 0 else 1.0
        confidence = max(0.3, 1.0 - min(0.7, cv))
        
        return {
            "forecast": forecast,
            "monthly_averages": monthly_averages,
            "base_value": float(base_value),
            "trend": trend,
            "trend_slope": float(trend_slope),
            "confidence": float(confidence),
            "months_of_data": len(monthly_data),
        }


class IncomeForecaster:
    """Forecasts future income"""
    
    @staticmethod
    def forecast_income(
        income_sources: List[Dict],
        months: int = 12,
        salary_growth_rate: float = None
    ) -> Dict:
        """Forecast future income"""
        
        salary_growth_rate = salary_growth_rate or config.DEFAULT_SALARY_INCREASE_RATE
        
        forecasts = []
        total_monthly_income = 0
        confidence_scores = []
        
        for source in income_sources:
            income_type = source.get('income_type')
            amount = source.get('amount', 0)
            frequency = source.get('frequency', 'monthly')
            probability = source.get('probability', 1.0)
            variability = source.get('variability', 0.0)
            
            # Calculate monthly equivalent
            if frequency == 'monthly':
                monthly_amount = amount * probability
            elif frequency == 'annual':
                monthly_amount = (amount / 12) * probability
            elif frequency == 'quarterly':
                monthly_amount = (amount / 3) * probability
            else:
                monthly_amount = amount * probability
            
            # Generate forecast
            source_forecast = []
            for month in range(1, months + 1):
                # Apply growth rate for salary
                if income_type == 'salary':
                    growth_multiplier = (1 + salary_growth_rate) ** (month / 12)
                else:
                    growth_multiplier = 1.0
                
                # Add variability
                variance = np.random.normal(0, monthly_amount * variability)
                forecasted = max(0, monthly_amount * growth_multiplier + variance)
                
                source_forecast.append({
                    "month": month,
                    "amount": float(forecasted),
                    "type": income_type,
                })
            
            forecasts.extend(source_forecast)
            total_monthly_income += monthly_amount
            confidence_scores.append(probability * (1 - min(0.5, variability)))
        
        # Aggregate by month
        monthly_totals = {}
        for forecast in forecasts:
            month = forecast['month']
            if month not in monthly_totals:
                monthly_totals[month] = 0
            monthly_totals[month] += forecast['amount']
        
        return {
            "total_monthly_income": float(total_monthly_income),
            "monthly_forecast": [
                {
                    "month": month,
                    "forecasted_income": float(amount)
                }
                for month, amount in sorted(monthly_totals.items())
            ],
            "income_sources": forecasts,
            "average_confidence": float(np.mean(confidence_scores)) if confidence_scores else 0.5,
            "months_forecasted": months,
        }


class SavingsForecaster:
    """Forecasts future savings based on income and expenses"""
    
    @staticmethod
    def forecast_savings(
        income_forecast: Dict,
        expense_forecast: Dict,
        current_savings: float = 0,
        months: int = 12,
        investment_return: float = None
    ) -> Dict:
        """Forecast future savings trajectory"""
        
        investment_return = investment_return or config.DEFAULT_INVESTMENT_RETURN
        
        monthly_income_forecast = income_forecast.get('monthly_forecast', [])
        expense_forecast_data = expense_forecast.get('forecast', [])
        
        savings_trajectory = []
        cumulative_savings = current_savings
        
        for month in range(1, months + 1):
            # Get income for this month
            month_income = next(
                (f['forecasted_income'] for f in monthly_income_forecast if f['month'] == month),
                income_forecast.get('total_monthly_income', 0)
            )
            
            # Get expense for this month. expense_forecast_data is a sequential list (index 0
            # = 1 month out, index 1 = 2 months out, ...) with an ISO calendar-date "month"
            # field — comparing that calendar date's .month to the sequential loop counter
            # only coincidentally matched, so this now indexes by position instead.
            month_expense = (
                expense_forecast_data[month - 1]['projected_spending']
                if month - 1 < len(expense_forecast_data)
                else expense_forecast.get('base_value', 0)
            )
            
            # Calculate monthly surplus
            monthly_surplus = month_income - month_expense
            
            # Apply investment returns
            investment_gain = cumulative_savings * (investment_return / 12)
            
            # Update cumulative savings
            cumulative_savings = cumulative_savings + monthly_surplus + investment_gain
            
            savings_trajectory.append({
                "month": month,
                "income": float(month_income),
                "expenses": float(month_expense),
                "surplus": float(monthly_surplus),
                "investment_gain": float(investment_gain),
                "cumulative_savings": float(max(0, cumulative_savings)),
            })
        
        # Calculate trend
        first_savings = savings_trajectory[0]['cumulative_savings']
        last_savings = savings_trajectory[-1]['cumulative_savings']
        
        if last_savings > first_savings:
            trend = "positive"
        elif last_savings < first_savings:
            trend = "negative"
        else:
            trend = "stable"
        
        return {
            "current_savings": float(current_savings),
            "projected_savings": float(cumulative_savings),
            "monthly_trajectory": savings_trajectory,
            "total_savings_increase": float(cumulative_savings - current_savings),
            "trend": trend,
            "average_monthly_surplus": float(np.mean([s['surplus'] for s in savings_trajectory])),
            "months_forecasted": months,
        }


class CashFlowForecaster:
    """Comprehensive cash flow forecasting"""
    
    @staticmethod
    def forecast_cashflow(
        user_data: Dict,
        months: int = 12
    ) -> Dict:
        """Generate comprehensive cash flow forecast"""
        
        # Extract components
        income_sources = user_data.get('income_sources', [])
        transactions = user_data.get('transactions', [])
        mandatory_expenses = [
            t for t in transactions
            if t.get('tier') == 'Tier_A_NonNegotiable'
        ]
        current_savings = user_data.get('current_savings', 0)
        
        # Forecast income
        income_forecast = IncomeForecaster.forecast_income(income_sources, months)
        
        # Forecast expenses
        expense_forecaster = ExpenseForecaster(months)
        expense_forecast = expense_forecaster.forecast_expenses(transactions)
        
        # Forecast mandatory expenses separately
        mandatory_forecast = expense_forecaster.forecast_expenses(mandatory_expenses)
        
        # Forecast savings
        savings_forecast = SavingsForecaster.forecast_savings(
            income_forecast,
            expense_forecast,
            current_savings,
            months
        )
        
        # Calculate key metrics
        total_income = sum(f['income'] for f in savings_forecast['monthly_trajectory'])
        total_expenses = sum(f['expenses'] for f in savings_forecast['monthly_trajectory'])
        total_surplus = total_income - total_expenses
        
        return {
            "forecast_period_months": months,
            "income_forecast": income_forecast,
            "total_expense_forecast": expense_forecast,
            "mandatory_expense_forecast": mandatory_forecast,
            "savings_forecast": savings_forecast,
            "summary": {
                "total_forecasted_income": float(total_income),
                "total_forecasted_expenses": float(total_expenses),
                "total_forecasted_surplus": float(total_surplus),
                "final_projected_savings": float(savings_forecast['projected_savings']),
                "average_monthly_saving": float(total_surplus / months) if months > 0 else 0,
            },
            "confidence": float(
                (expense_forecast.get('confidence', 0.5) +
                 income_forecast.get('average_confidence', 0.5)) / 2
            ),
        }


class ScenarioForecaster:
    """Generates multiple scenarios (optimistic, expected, pessimistic)"""
    
    @staticmethod
    def forecast_scenarios(
        base_forecast: Dict,
        volatility: Dict = None
    ) -> Dict:
        """Generate best/expected/worst case scenarios"""
        
        if volatility is None:
            volatility = {
                "income_volatility": 0.1,  # 10%
                "expense_volatility": 0.15,  # 15%
                "investment_volatility": 0.2,  # 20%
            }
        
        trajectory = base_forecast['savings_forecast']['monthly_trajectory']
        
        # Generate scenarios
        scenarios = {
            "optimistic": [],
            "expected": [],
            "pessimistic": []
        }
        
        for month_data in trajectory:
            month = month_data['month']
            
            # Expected case (no change)
            scenarios["expected"].append({
                "month": month,
                "savings": float(month_data['cumulative_savings']),
            })
            
            # Optimistic case (higher income, lower expenses, better returns)
            optimistic_savings = month_data['cumulative_savings'] * (1 + volatility['income_volatility']) * (1 - volatility['expense_volatility'] * 0.5)
            scenarios["optimistic"].append({
                "month": month,
                "savings": float(max(0, optimistic_savings)),
            })
            
            # Pessimistic case (lower income, higher expenses, lower returns)
            pessimistic_savings = month_data['cumulative_savings'] * (1 - volatility['income_volatility']) * (1 + volatility['expense_volatility'])
            scenarios["pessimistic"].append({
                "month": month,
                "savings": float(max(0, pessimistic_savings)),
            })
        
        return {
            "scenarios": scenarios,
            "expected_final": float(scenarios["expected"][-1]['savings']) if scenarios["expected"] else 0,
            "optimistic_final": float(scenarios["optimistic"][-1]['savings']) if scenarios["optimistic"] else 0,
            "pessimistic_final": float(scenarios["pessimistic"][-1]['savings']) if scenarios["pessimistic"] else 0,
        }


if __name__ == "__main__":
    from data_generator import SyntheticDatasetGenerator
    
    print("Testing Forecasting Models...")
    
    # Generate test data
    datasets = SyntheticDatasetGenerator.generate_complete_user_dataset(1)
    user_data = datasets[0]
    
    # Test cash flow forecast
    cashflow = CashFlowForecaster.forecast_cashflow(
        {
            "income_sources": user_data['income_sources'],
            "transactions": user_data['transactions'],
            "current_savings": user_data['assets'][0]['value'] if user_data['assets'] else 100000,
        },
        months=12
    )
    
    print(f"Average monthly saving: ₹{cashflow['summary']['average_monthly_saving']:,.2f}")
    print(f"Projected savings: ₹{cashflow['summary']['final_projected_savings']:,.2f}")
    print(f"Confidence: {cashflow['confidence']:.2%}")
