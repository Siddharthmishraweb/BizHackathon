/**
 * TypeScript interfaces for the frontend.
 */

export interface UserProfile {
  age: number;
  monthly_income: number;
  monthly_expenses: number;
  savings: number;
  existing_investments: number;
  monthly_emi: number;
}

export interface Questionnaire {
  investment_horizon: number;
  investment_experience: number;
  reaction_to_market_loss: number;
  investment_frequency: string;
  liquidity_preference: string;
  investment_goal: string;
}

export interface RiskPrediction {
  riskProfile: string;
  probabilities: Record<string, number>;
}

export interface ProductRecommendation {
  product: string;
  score: number;
  allocationPercentage: number;
  allocationAmount: number;
  reasons: string[];
}

export interface Recommendation {
  products: ProductRecommendation[];
  topRecommendation: string;
  monthlyInvestableAmount: number;
}

export interface AnalysisResponse {
  analysisId: string;
  riskPrediction: RiskPrediction;
  recommendation: Recommendation;
  createdAt: string;
}

export enum Step {
  PROFILE = 1,
  QUESTIONNAIRE = 2,
  RESULTS = 3,
}
