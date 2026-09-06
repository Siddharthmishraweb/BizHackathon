"""
SQLAlchemy models for the Goal Achievement Intelligence Engine
"""
from datetime import datetime
from typing import Optional, List
from enum import Enum
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from config import config

Base = declarative_base()


class ExpenseCategory(str, Enum):
    """Expense category enumeration"""
    TIER_A = "Tier_A_NonNegotiable"
    TIER_B = "Tier_B_Optimizable"
    TIER_C = "Tier_C_Flexible"
    TIER_D = "Tier_D_Leakage"
    UNCATEGORIZED = "Uncategorized"


class GoalStatus(str, Enum):
    """Goal status enumeration"""
    PLANNING = "planning"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


class RecommendationStatus(str, Enum):
    """Recommendation status enumeration"""
    GENERATED = "generated"
    VIEWED = "viewed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    IMPLEMENTED = "implemented"


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    phone = Column(String, nullable=True)
    country = Column(String, default="IN")
    currency = Column(String, default="INR")
    
    # Profile
    risk_tolerance = Column(String)  # Conservative, Moderate, Aggressive
    financial_literacy = Column(String)  # Low, Medium, High
    personality_type = Column(String)  # Disciplined, Impulsive, Avoidant, etc.
    
    # Financial health metadata
    last_transaction_sync = Column(DateTime, nullable=True)
    data_quality_confidence = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    income_sources = relationship("IncomeSource", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="user", cascade="all, delete-orphan")
    liabilities = relationship("Liability", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class IncomeSource(Base):
    """Income source model"""
    __tablename__ = "income_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    name = Column(String)  # Salary, Freelance, etc.
    income_type = Column(String)  # salary, business, freelance, bonus, dividends, rental, other
    amount = Column(Float)  # Monthly or periodic amount
    frequency = Column(String, default="monthly")  # daily, weekly, monthly, quarterly, annual
    is_recurring = Column(Boolean, default=True)
    
    # Metadata
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    variability = Column(Float, default=0.0)  # Standard deviation as % of mean
    probability = Column(Float, default=1.0)  # Probability of receiving income
    
    extra_metadata = Column(JSON, default={})  # Additional metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="income_sources")
    
    def __repr__(self):
        return f"<IncomeSource(user_id={self.user_id}, type={self.income_type}, amount={self.amount})>"


class Transaction(Base):
    """Transaction/Expense model"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    # Basic info
    date = Column(DateTime, index=True)
    amount = Column(Float)
    description = Column(String)
    merchant = Column(String, nullable=True)
    
    # Categorization
    category = Column(String)  # Primary category
    subcategory = Column(String)  # Subcategory
    tier = Column(SQLEnum(ExpenseCategory), default=ExpenseCategory.UNCATEGORIZED)
    
    # Analysis scores
    necessity_score = Column(Float, nullable=True)  # 0-1
    cuttable_score = Column(Float, nullable=True)  # 0-1
    goal_impact_score = Column(Float, nullable=True)  # -1 to 1
    behavioral_leakage_score = Column(Float, nullable=True)  # 0-1
    recurring_score = Column(Float, nullable=True)  # 0-1
    emotional_spending_score = Column(Float, nullable=True)  # 0-1
    value_per_rupee_score = Column(Float, nullable=True)  # 0-1
    financial_risk_score = Column(Float, nullable=True)  # 0-1
    
    # Metadata
    is_recurring = Column(Boolean, default=False)
    is_anomaly = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    
    extra_metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="expenses")
    
    def __repr__(self):
        return f"<Transaction(user_id={self.user_id}, amount={self.amount}, tier={self.tier})>"


class Asset(Base):
    """Financial asset model"""
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    # Asset info
    name = Column(String)
    asset_type = Column(String)  # savings, fd, mutual_fund, stock, bond, real_estate, crypto, other
    value = Column(Float)  # Current value
    cost_basis = Column(Float, nullable=True)  # Original investment
    
    # Details
    currency = Column(String, default="INR")
    liquidity = Column(String, default="high")  # high, medium, low
    accessibility = Column(Float, default=1.0)  # 0-1, portion easily accessible
    
    # Terms
    interest_rate = Column(Float, nullable=True)
    maturity_date = Column(DateTime, nullable=True)
    lock_in_period = Column(String, nullable=True)
    
    # Risk & Returns
    volatility = Column(Float, default=0.0)  # Standard deviation of returns
    expected_return = Column(Float, default=0.0)  # Annual expected return %
    
    extra_metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="assets")
    
    def __repr__(self):
        return f"<Asset(user_id={self.user_id}, type={self.asset_type}, value={self.value})>"


class Liability(Base):
    """Debt/Liability model"""
    __tablename__ = "liabilities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    # Liability info
    name = Column(String)
    liability_type = Column(String)  # home_loan, car_loan, personal_loan, credit_card, education_loan, other
    principal = Column(Float)  # Original amount borrowed
    current_balance = Column(Float)  # Current outstanding balance
    
    # Terms
    interest_rate = Column(Float)  # Annual interest rate
    emi_amount = Column(Float, nullable=True)  # Monthly EMI
    start_date = Column(DateTime)
    end_date = Column(DateTime, nullable=True)
    months_remaining = Column(Integer, nullable=True)
    
    # Details
    is_priority = Column(Boolean, default=False)  # Mandatory/priority debt
    currency = Column(String, default="INR")
    
    extra_metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="liabilities")
    
    def __repr__(self):
        return f"<Liability(user_id={self.user_id}, type={self.liability_type}, balance={self.current_balance})>"


class Goal(Base):
    """Financial goal model"""
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    # Goal definition
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    goal_category = Column(String)  # car, house, vacation, education, emergency_fund, retirement, custom
    
    # Target
    target_amount = Column(Float)
    current_amount = Column(Float, default=0.0)
    deadline = Column(DateTime, index=True)
    
    # Priority
    priority = Column(Integer, default=1)  # 1 = highest
    importance = Column(String)  # critical, high, medium, low
    is_flexible = Column(Boolean, default=True)
    
    # Risk & Strategy
    risk_tolerance = Column(String)  # Conservative, Moderate, Aggressive
    preferred_strategy = Column(String, nullable=True)  # Saving, Investing, Financing, Hybrid
    min_acceptable_outcome = Column(Float, nullable=True)  # Minimum acceptable goal amount
    
    # Analysis
    status = Column(SQLEnum(GoalStatus), default=GoalStatus.PLANNING)
    feasibility = Column(String, nullable=True)  # VERY_LIKELY, LIKELY, POSSIBLE, STRETCHED, UNLIKELY, IMPOSSIBLE
    success_probability = Column(Float, default=0.0)
    estimated_completion = Column(DateTime, nullable=True)
    funding_gap = Column(Float, nullable=True)  # Amount still needed
    
    # Metadata
    extra_metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="goals")
    
    def __repr__(self):
        return f"<Goal(user_id={self.user_id}, name={self.name}, target={self.target_amount})>"


class Recommendation(Base):
    """Recommendation model"""
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    # Recommendation details
    title = Column(String)
    description = Column(Text)
    category = Column(String)  # Expense optimization, Income expansion, Investment, Goal adjustment, etc.
    
    # Impact
    expected_impact = Column(Float)  # Amount or % impact
    impact_type = Column(String)  # savings, income_increase, probability_increase, time_reduction
    confidence = Column(Float, default=0.8)  # 0-1
    
    # Strategy
    strategy_id = Column(String, nullable=True)  # Reference to strategy
    is_safe = Column(Boolean, default=True)
    safety_notes = Column(Text, nullable=True)
    
    # Status
    status = Column(SQLEnum(RecommendationStatus), default=RecommendationStatus.GENERATED)
    action_priority = Column(String)  # TODAY, THIS_WEEK, THIS_MONTH, ONGOING
    
    # Details
    details = Column(JSON, default={})  # Structured recommendation details
    alternatives = Column(JSON, default=[])  # Alternative recommendations
    
    created_at = Column(DateTime, default=datetime.utcnow)
    viewed_at = Column(DateTime, nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    implemented_at = Column(DateTime, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="recommendations")
    
    def __repr__(self):
        return f"<Recommendation(user_id={self.user_id}, title={self.title}, status={self.status})>"


# Database setup functions
def init_db(database_url: Optional[str] = None):
    """Initialize database"""
    db_url = database_url or config.DATABASE_URL
    engine = create_engine(db_url, echo=False)
    Base.metadata.create_all(bind=engine)
    return engine


def get_session_maker(database_url: Optional[str] = None):
    """Get SQLAlchemy session maker"""
    engine = init_db(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal


def get_session():
    """Get database session"""
    SessionLocal = get_session_maker()
    return SessionLocal()
