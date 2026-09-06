/**
 * Common types and enumerations used across the application.
 */

export enum RiskProfile {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum InvestmentFrequency {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  LUMP_SUM = "LUMP_SUM",
  RARELY = "RARELY",
}

export enum LiquidityPreference {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum InvestmentGoal {
  WEALTH_CREATION = "WEALTH_CREATION",
  RETIREMENT = "RETIREMENT",
  TAX_SAVING = "TAX_SAVING",
  EMERGENCY_FUND = "EMERGENCY_FUND",
  SHORT_TERM_GOAL = "SHORT_TERM_GOAL",
}

export enum Product {
  FD = "FD",
  PPF = "PPF",
  NPS = "NPS",
  MUTUAL_FUND = "MUTUAL_FUND",
}

/**
 * User profile — financial information.
 */
export interface UserProfile {
  age: number;
  monthly_income: number;
  monthly_expenses: number;
  savings: number;
  existing_investments: number;
  monthly_emi: number;
}

/**
 * Questionnaire — behavioural and goal information.
 */
export interface Questionnaire {
  investment_horizon: number; // years
  investment_experience: number; // 1-5 scale
  reaction_to_market_loss: number; // 1-5 scale
  investment_frequency: InvestmentFrequency;
  liquidity_preference: LiquidityPreference;
  investment_goal: InvestmentGoal;
}

/**
 * Derived financial features computed by the backend.
 */
export interface DerivedFeatures {
  savings_ratio: number; // savings / annual_income
  expense_ratio: number; // annual_expenses / annual_income
  emi_to_income_ratio: number; // monthly_emi / monthly_income
  investment_to_income_ratio: number; // existing_investments / annual_income
}

/**
 * Risk prediction result from the ML service.
 */
export interface RiskPrediction {
  riskProfile: RiskProfile;
  probabilities: Record<RiskProfile, number>;
  modelVersion: string;
}

/**
 * Product recommendation with score, suggested allocation, and reasoning.
 */
export interface ProductRecommendation {
  product: Product;
  score: number; // 0-100
  allocationPercentage: number; // suggested % of portfolio, all products sum to 100
  allocationAmount: number; // suggested monthly amount (currency units), based on monthlyInvestableAmount
  reasons: string[];
}

/**
 * Full recommendation output with all products and top pick.
 */
export interface Recommendation {
  products: ProductRecommendation[];
  topRecommendation: Product;
  monthlyInvestableAmount: number; // monthly_income - monthly_expenses - monthly_emi, floored at 0
  rulesVersion: string;
}

/**
 * Complete analysis document.
 */
export interface Analysis {
  analysisId: string;
  userId: string;
  profile: UserProfile;
  questionnaire: Questionnaire;
  derivedFeatures: DerivedFeatures;
  riskPrediction: RiskPrediction;
  recommendation: Recommendation;
  createdAt: Date;
}

/**
 * User record.
 */
export interface User {
  userId: string;
  name: string;
  email: string;
  createdAt: Date;
}

/**
 * API request shape for analysis.
 */
export interface AnalysisRequest {
  profile: UserProfile;
  questionnaire: Questionnaire;
}

/**
 * Simplified analysis summary for list responses.
 */
export interface AnalysisSummary {
  analysisId: string;
  riskProfile: RiskProfile;
  topRecommendation: Product;
  createdAt: Date;
}
