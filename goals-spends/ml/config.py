"""
Configuration management for the Goal Achievement Intelligence Engine
"""
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration"""
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///wealth_ai.db"
    )
    
    # Model paths
    MODEL_DIR: str = os.path.join(os.path.dirname(__file__), "models")
    DATA_DIR: str = os.path.join(os.path.dirname(__file__), "data")
    
    # Simulation parameters
    MONTE_CARLO_ITERATIONS: int = 10000
    FORECAST_MONTHS: int = 60
    
    # Thresholds
    MIN_EMERGENCY_FUND_MULTIPLIER: float = 3.0  # 3x monthly mandatory expenses
    MAX_EMERGENCY_FUND_MULTIPLIER: float = 6.0  # 6x monthly mandatory expenses
    MIN_GOAL_PROBABILITY_THRESHOLD: float = 0.5  # 50%
    MIN_SAFETY_CONFIDENCE: float = 0.8  # 80%
    
    # Expense categories and thresholds
    EXPENSE_CATEGORIES = {
        "Tier_A_NonNegotiable": {
            "subcategories": [
                "home_loan_emi",
                "rent_essential",
                "insurance_required",
                "debt_payments",
                "utilities_essential",
                "medication",
            ]
        },
        "Tier_B_Optimizable": {
            "subcategories": [
                "groceries",
                "electricity",
                "internet",
                "transportation",
                "insurance_optional",
            ]
        },
        "Tier_C_Flexible": {
            "subcategories": [
                "restaurants",
                "shopping",
                "entertainment",
                "travel",
                "subscriptions",
            ]
        },
        "Tier_D_Leakage": {
            "subcategories": [
                "forgotten_subscriptions",
                "impulse_purchases",
                "unused_memberships",
                "convenience_fees",
            ]
        },
    }
    
    # Income sources
    INCOME_SOURCES = [
        "salary",
        "business_income",
        "freelance_income",
        "bonuses",
        "dividends",
        "rental_income",
        "other_income",
    ]
    
    # Financial metrics defaults
    DEFAULT_INFLATION_RATE: float = 0.06  # 6% annual inflation
    DEFAULT_INVESTMENT_RETURN: float = 0.12  # 12% expected annual return
    DEFAULT_SALARY_INCREASE_RATE: float = 0.05  # 5% annual increase
    
    # LLM/API settings
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"


class DevelopmentConfig(Config):
    """Development configuration"""
    DATABASE_URL = "sqlite:///wealth_ai_dev.db"
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False


class TestingConfig(Config):
    """Testing configuration"""
    DATABASE_URL = "sqlite:///:memory:"
    TESTING = True
    MONTE_CARLO_ITERATIONS = 100  # Reduce for faster tests


def get_config(env: Optional[str] = None) -> Config:
    """Get appropriate config based on environment"""
    env = env or os.getenv("ENV", "development").lower()
    
    configs = {
        "development": DevelopmentConfig,
        "production": ProductionConfig,
        "testing": TestingConfig,
    }
    
    return configs.get(env, DevelopmentConfig)()


# Active configuration
config = get_config()
