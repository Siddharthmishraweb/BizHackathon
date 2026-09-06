"""
Synthetic financial data generator for model training
"""
import random
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import numpy as np
from config import config
from utils import DateUtils, FinancialMetrics


class SyntheticUserGenerator:
    """Generate synthetic user profiles"""
    
    CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata"]
    PERSONALITY_TYPES = ["Disciplined", "Impulsive", "Avoidant", "Optimistic", "Risk-sensitive"]
    RISK_PROFILES = ["Conservative", "Moderate", "Aggressive"]
    
    @staticmethod
    def generate_user() -> Dict:
        """Generate a synthetic user profile"""
        return {
            "email": f"user_{random.randint(10000, 99999)}@example.com",
            "name": f"User_{random.randint(1000, 9999)}",
            "country": "IN",
            "currency": "INR",
            "risk_tolerance": random.choice(SyntheticUserGenerator.RISK_PROFILES),
            "financial_literacy": random.choice(["Low", "Medium", "High"]),
            "personality_type": random.choice(SyntheticUserGenerator.PERSONALITY_TYPES),
            "city": random.choice(SyntheticUserGenerator.CITIES),
        }


class SyntheticIncomeGenerator:
    """Generate synthetic income data"""
    
    @staticmethod
    def generate_salary_income(base_salary: float = None) -> Dict:
        """Generate salary income"""
        if base_salary is None:
            base_salary = random.choice([25000, 40000, 60000, 100000, 150000, 250000, 500000])
        
        return {
            "name": "Monthly Salary",
            "income_type": "salary",
            "amount": base_salary,
            "frequency": "monthly",
            "is_recurring": True,
            "start_date": datetime.utcnow() - timedelta(days=365),
            "variability": random.uniform(0.02, 0.08),  # 2-8% variation
            "probability": 0.95,  # 95% reliable
        }
    
    @staticmethod
    def generate_bonus_income(base_salary: float) -> Dict:
        """Generate bonus income"""
        return {
            "name": "Annual Bonus",
            "income_type": "bonuses",
            "amount": base_salary * random.uniform(0.5, 1.5),
            "frequency": "annual",
            "is_recurring": True,
            "variability": 0.3,
            "probability": 0.7,  # 70% chance of bonus
        }
    
    @staticmethod
    def generate_freelance_income() -> Dict:
        """Generate freelance/side income"""
        return {
            "name": "Freelance Income",
            "income_type": "freelance_income",
            "amount": random.uniform(5000, 30000),
            "frequency": "monthly",
            "is_recurring": random.choice([True, False]),
            "variability": 0.4,
            "probability": 0.6,
        }
    
    @staticmethod
    def generate_income_sources(salary_range: Tuple[float, float] = None) -> List[Dict]:
        """Generate multiple income sources for a user"""
        if salary_range is None:
            salary = random.choice([25000, 40000, 60000, 100000, 150000, 250000, 500000])
        else:
            salary = random.uniform(salary_range[0], salary_range[1])
        
        sources = [SyntheticIncomeGenerator.generate_salary_income(salary)]
        
        # 60% chance of bonus
        if random.random() < 0.6:
            sources.append(SyntheticIncomeGenerator.generate_bonus_income(salary))
        
        # 30% chance of freelance income
        if random.random() < 0.3:
            sources.append(SyntheticIncomeGenerator.generate_freelance_income())
        
        return sources


class SyntheticExpenseGenerator:
    """Generate synthetic expense/transaction data"""
    
    EXPENSE_PATTERNS = {
        "Tier_A_NonNegotiable": {
            "subcategories": {
                "home_loan_emi": {"frequency": 1, "amount_range": (30000, 150000), "consistency": 0.99},
                "rent_essential": {"frequency": 1, "amount_range": (15000, 80000), "consistency": 0.99},
                "insurance_required": {"frequency": 1, "amount_range": (2000, 15000), "consistency": 0.95},
                "utilities_essential": {"frequency": 1, "amount_range": (1500, 5000), "consistency": 0.90},
                "debt_payments": {"frequency": 1, "amount_range": (5000, 50000), "consistency": 0.98},
            }
        },
        "Tier_B_Optimizable": {
            "subcategories": {
                "groceries": {"frequency": 7, "amount_range": (2000, 6000), "consistency": 0.70},
                "electricity": {"frequency": 1, "amount_range": (1000, 4000), "consistency": 0.80},
                "internet": {"frequency": 1, "amount_range": (500, 2000), "consistency": 0.99},
                "transportation": {"frequency": 10, "amount_range": (500, 3000), "consistency": 0.65},
            }
        },
        "Tier_C_Flexible": {
            "subcategories": {
                "restaurants": {"frequency": 5, "amount_range": (800, 3000), "consistency": 0.50},
                "shopping": {"frequency": 7, "amount_range": (1000, 5000), "consistency": 0.40},
                "entertainment": {"frequency": 10, "amount_range": (500, 2000), "consistency": 0.45},
                "travel": {"frequency": 30, "amount_range": (2000, 10000), "consistency": 0.30},
                "subscriptions": {"frequency": 1, "amount_range": (500, 2000), "consistency": 0.98},
            }
        },
        "Tier_D_Leakage": {
            "subcategories": {
                "impulse_purchases": {"frequency": 15, "amount_range": (500, 2000), "consistency": 0.20},
                "convenience_fees": {"frequency": 10, "amount_range": (50, 200), "consistency": 0.40},
                "forgotten_subscriptions": {"frequency": 30, "amount_range": (100, 500), "consistency": 0.85},
            }
        }
    }
    
    @staticmethod
    def generate_transaction(
        date: datetime,
        tier: str,
        subcategory: str,
        user_behavior_profile: str = "average"
    ) -> Dict:
        """Generate a single synthetic transaction"""
        
        pattern = SyntheticExpenseGenerator.EXPENSE_PATTERNS[tier]["subcategories"][subcategory]
        amount_range = pattern["amount_range"]
        
        # Add variability based on behavior
        if user_behavior_profile == "high_spender":
            amount_range = (amount_range[0], amount_range[1] * 1.3)
        elif user_behavior_profile == "frugal":
            amount_range = (amount_range[0] * 0.7, amount_range[1])
        
        amount = random.uniform(amount_range[0], amount_range[1])
        
        return {
            "date": date,
            "amount": round(amount, 2),
            "description": f"{subcategory.replace('_', ' ').title()}",
            "merchant": f"Merchant_{random.randint(1000, 9999)}",
            "category": tier,
            "subcategory": subcategory,
            "tier": tier,
            "is_recurring": random.random() < pattern["consistency"],
            "is_anomaly": random.random() < 0.05,  # 5% anomalies
        }
    
    @staticmethod
    def generate_transactions_for_period(
        start_date: datetime,
        end_date: datetime,
        behavior_profile: str = "average"
    ) -> List[Dict]:
        """Generate synthetic transactions for a date range"""
        transactions = []
        current_date = start_date
        
        while current_date <= end_date:
            # Generate expenses for each tier
            for tier in config.EXPENSE_CATEGORIES.keys():
                subcategories = config.EXPENSE_CATEGORIES[tier]["subcategories"]
                
                for subcategory in subcategories:
                    pattern = SyntheticExpenseGenerator.EXPENSE_PATTERNS[tier]["subcategories"][subcategory]
                    frequency = pattern["frequency"]  # days between transactions
                    
                    # Randomly decide if this transaction occurs on this day
                    if random.random() < (1.0 / frequency):
                        txn = SyntheticExpenseGenerator.generate_transaction(
                            current_date,
                            tier,
                            subcategory,
                            behavior_profile
                        )
                        transactions.append(txn)
            
            current_date += timedelta(days=1)
        
        return transactions


class SyntheticAssetGenerator:
    """Generate synthetic asset data"""
    
    @staticmethod
    def generate_savings_account(balance_range: Tuple[float, float] = (50000, 500000)) -> Dict:
        """Generate savings account"""
        return {
            "name": "Savings Account",
            "asset_type": "savings",
            "value": random.uniform(balance_range[0], balance_range[1]),
            "liquidity": "high",
            "accessibility": 1.0,
            "interest_rate": 3.5,
            "expected_return": 0.035,
            "volatility": 0.0,
        }
    
    @staticmethod
    def generate_fd(amount_range: Tuple[float, float] = (100000, 1000000), years: int = 5) -> Dict:
        """Generate Fixed Deposit"""
        return {
            "name": "Fixed Deposit",
            "asset_type": "fd",
            "value": random.uniform(amount_range[0], amount_range[1]),
            "liquidity": "medium",
            "accessibility": 0.5,  # Can access but with penalty
            "interest_rate": 6.5,
            "maturity_date": datetime.utcnow() + timedelta(days=365*years),
            "lock_in_period": f"{years} years",
            "expected_return": 0.065,
            "volatility": 0.0,
        }
    
    @staticmethod
    def generate_mutual_fund() -> Dict:
        """Generate mutual fund investment"""
        return {
            "name": "Mutual Fund",
            "asset_type": "mutual_fund",
            "value": random.uniform(50000, 500000),
            "liquidity": "medium",
            "accessibility": 1.0,
            "expected_return": random.uniform(0.10, 0.15),
            "volatility": random.uniform(0.10, 0.20),
        }
    
    @staticmethod
    def generate_stocks() -> Dict:
        """Generate stock portfolio"""
        return {
            "name": "Stock Portfolio",
            "asset_type": "stock",
            "value": random.uniform(100000, 1000000),
            "cost_basis": random.uniform(80000, 900000),
            "liquidity": "high",
            "accessibility": 1.0,
            "expected_return": random.uniform(0.12, 0.20),
            "volatility": random.uniform(0.15, 0.30),
        }
    
    @staticmethod
    def generate_assets() -> List[Dict]:
        """Generate a portfolio of assets"""
        assets = [
            SyntheticAssetGenerator.generate_savings_account(),
        ]
        
        # 70% have FD
        if random.random() < 0.7:
            assets.append(SyntheticAssetGenerator.generate_fd())
        
        # 50% have mutual funds
        if random.random() < 0.5:
            assets.append(SyntheticAssetGenerator.generate_mutual_fund())
        
        # 40% have stocks
        if random.random() < 0.4:
            assets.append(SyntheticAssetGenerator.generate_stocks())
        
        return assets


class SyntheticLiabilityGenerator:
    """Generate synthetic liability/debt data"""
    
    @staticmethod
    def generate_home_loan() -> Dict:
        """Generate home loan"""
        principal = random.uniform(2000000, 10000000)
        months_elapsed = random.randint(12, 240)
        total_months = 360  # 30 years
        monthly_rate = 0.065 / 12
        
        # Calculate remaining balance
        remaining_months = total_months - months_elapsed
        emi = FinancialMetrics.calculate_emi(principal, 6.5, total_months)
        remaining_balance = emi * (((1 + monthly_rate) ** remaining_months - 1) / (monthly_rate * (1 + monthly_rate) ** remaining_months))
        
        return {
            "name": "Home Loan",
            "liability_type": "home_loan",
            "principal": principal,
            "current_balance": remaining_balance,
            "interest_rate": 6.5,
            "emi_amount": emi,
            "start_date": datetime.utcnow() - timedelta(days=365*months_elapsed//12),
            "end_date": datetime.utcnow() + timedelta(days=365*remaining_months//12),
            "months_remaining": remaining_months,
            "is_priority": True,
        }
    
    @staticmethod
    def generate_car_loan() -> Dict:
        """Generate car loan"""
        principal = random.uniform(500000, 2000000)
        months_elapsed = random.randint(6, 60)
        total_months = 84  # 7 years
        monthly_rate = 0.08 / 12
        
        remaining_months = total_months - months_elapsed
        emi = FinancialMetrics.calculate_emi(principal, 8.0, total_months)
        remaining_balance = emi * (((1 + monthly_rate) ** remaining_months - 1) / (monthly_rate * (1 + monthly_rate) ** remaining_months))
        
        return {
            "name": "Car Loan",
            "liability_type": "car_loan",
            "principal": principal,
            "current_balance": remaining_balance,
            "interest_rate": 8.0,
            "emi_amount": emi,
            "start_date": datetime.utcnow() - timedelta(days=365*months_elapsed//12),
            "end_date": datetime.utcnow() + timedelta(days=365*remaining_months//12),
            "months_remaining": remaining_months,
            "is_priority": True,
        }
    
    @staticmethod
    def generate_credit_card_debt() -> Dict:
        """Generate credit card debt"""
        return {
            "name": "Credit Card",
            "liability_type": "credit_card",
            "principal": random.uniform(50000, 500000),
            "current_balance": random.uniform(10000, 300000),
            "interest_rate": 18.0,  # Higher rate for credit cards
            "is_priority": True,
        }
    
    @staticmethod
    def generate_liabilities() -> List[Dict]:
        """Generate a set of liabilities"""
        liabilities = []
        
        # 50% have home loan
        if random.random() < 0.5:
            liabilities.append(SyntheticLiabilityGenerator.generate_home_loan())
        
        # 30% have car loan
        if random.random() < 0.3:
            liabilities.append(SyntheticLiabilityGenerator.generate_car_loan())
        
        # 40% have credit card debt
        if random.random() < 0.4:
            liabilities.append(SyntheticLiabilityGenerator.generate_credit_card_debt())
        
        return liabilities


class SyntheticGoalGenerator:
    """Generate synthetic financial goals"""
    
    GOAL_TEMPLATES = {
        "car": {
            "name": "Buy a Car",
            "amount_range": (800000, 3000000),
            "deadline_months_range": (12, 36),
            "importance": "high",
        },
        "house": {
            "name": "Buy a House",
            "amount_range": (5000000, 20000000),
            "deadline_months_range": (36, 120),
            "importance": "critical",
        },
        "vacation": {
            "name": "Take a Vacation",
            "amount_range": (100000, 500000),
            "deadline_months_range": (6, 12),
            "importance": "medium",
        },
        "education": {
            "name": "Education Fund",
            "amount_range": (500000, 5000000),
            "deadline_months_range": (36, 180),
            "importance": "critical",
        },
        "emergency": {
            "name": "Emergency Fund",
            "amount_range": (200000, 1000000),
            "deadline_months_range": (12, 12),
            "importance": "critical",
        },
    }
    
    @staticmethod
    def generate_goal(goal_type: str = None) -> Dict:
        """Generate a single goal"""
        if goal_type is None:
            goal_type = random.choice(list(SyntheticGoalGenerator.GOAL_TEMPLATES.keys()))
        
        template = SyntheticGoalGenerator.GOAL_TEMPLATES[goal_type]
        target_amount = random.uniform(template["amount_range"][0], template["amount_range"][1])
        # Rolled fresh per call — GOAL_TEMPLATES used to bake a single random.randint()
        # result in at import time, so every generated goal of a given type shared one deadline.
        deadline_months = random.randint(*template["deadline_months_range"])
        
        return {
            "name": template["name"],
            "goal_category": goal_type,
            "target_amount": target_amount,
            "current_amount": random.uniform(0, target_amount * 0.3),
            "deadline": datetime.utcnow() + timedelta(days=365*deadline_months//12),
            "priority": random.randint(1, 5),
            "importance": template["importance"],
            "is_flexible": goal_type != "emergency",
            "risk_tolerance": random.choice(["Conservative", "Moderate", "Aggressive"]),
            "min_acceptable_outcome": target_amount * random.uniform(0.8, 1.0),
        }
    
    @staticmethod
    def generate_goals(count: int = 3) -> List[Dict]:
        """Generate multiple goals"""
        goals = []
        
        # Always include emergency fund
        goals.append(SyntheticGoalGenerator.generate_goal("emergency"))
        
        # Add other goals
        for _ in range(count - 1):
            goal_type = random.choice([g for g in SyntheticGoalGenerator.GOAL_TEMPLATES.keys() if g != "emergency"])
            goals.append(SyntheticGoalGenerator.generate_goal(goal_type))
        
        return goals


class SyntheticDatasetGenerator:
    """Main generator for complete synthetic datasets"""
    
    @staticmethod
    def generate_complete_user_dataset(num_users: int = 100) -> List[Dict]:
        """Generate complete datasets for multiple users"""
        datasets = []
        
        for _ in range(num_users):
            user = SyntheticUserGenerator.generate_user()
            income_sources = SyntheticIncomeGenerator.generate_income_sources()
            
            # Calculate total monthly income
            monthly_income = sum(
                s["amount"] for s in income_sources 
                if s["frequency"] == "monthly"
            )
            
            # Generate transactions for last 12 months
            transactions = SyntheticExpenseGenerator.generate_transactions_for_period(
                datetime.utcnow() - timedelta(days=365),
                datetime.utcnow(),
                behavior_profile=user["personality_type"].lower()
            )
            
            assets = SyntheticAssetGenerator.generate_assets()
            liabilities = SyntheticLiabilityGenerator.generate_liabilities()
            goals = SyntheticGoalGenerator.generate_goals()
            
            dataset = {
                "user": user,
                "income_sources": income_sources,
                "transactions": transactions,
                "assets": assets,
                "liabilities": liabilities,
                "goals": goals,
                "metadata": {
                    "monthly_income": monthly_income,
                    "dataset_version": "1.0",
                    "generated_at": datetime.utcnow().isoformat(),
                }
            }
            
            datasets.append(dataset)
        
        return datasets


if __name__ == "__main__":
    # Example usage
    print("Generating synthetic dataset for 10 users...")
    dataset = SyntheticDatasetGenerator.generate_complete_user_dataset(num_users=10)
    print(f"Generated {len(dataset)} user datasets")
    print(f"First user: {dataset[0]['user']['email']}")
    print(f"Transactions: {len(dataset[0]['transactions'])}")
