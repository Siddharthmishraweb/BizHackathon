/**
 * HTTP client for the Python ML service.
 *
 * Handles communication with the FastAPI ML service running on localhost:8000.
 */

import axios, { AxiosError } from "axios";
import { RiskPrediction, RiskProfile, UserProfile, Questionnaire } from "../types";

export interface MLServiceError extends Error {
  isNetworkError: boolean;
  statusCode?: number;
}

/**
 * Request shape for the ML service prediction endpoint.
 */
interface MLPredictRequest {
  age: number;
  monthly_income: number;
  monthly_expenses: number;
  savings: number;
  existing_investments: number;
  monthly_emi: number;
  investment_horizon: number;
  investment_experience: number;
  reaction_to_market_loss: number;
  investment_frequency: string;
  liquidity_preference: string;
  investment_goal: string;
}

/**
 * Response shape from the ML service.
 */
interface MLPredictResponse {
  risk_profile: RiskProfile;
  probabilities: Record<RiskProfile, number>;
  model_version: string;
}

export class MLServiceClient {
  private baseUrl: string;
  private client = axios.create({
    timeout: 10000,
  });

  constructor(baseUrl: string = "http://localhost:8000") {
    this.baseUrl = baseUrl;
  }

  /**
   * Call the ML service to predict risk profile.
   *
   * @param profile User's financial profile
   * @param questionnaire User's behavioural questionnaire
   * @returns Risk prediction with probabilities
   * @throws MLServiceError if the ML service is unavailable or returns an error
   */
  async predictRisk(
    profile: UserProfile,
    questionnaire: Questionnaire
  ): Promise<RiskPrediction> {
    try {
      const request: MLPredictRequest = {
        age: profile.age,
        monthly_income: profile.monthly_income,
        monthly_expenses: profile.monthly_expenses,
        savings: profile.savings,
        existing_investments: profile.existing_investments,
        monthly_emi: profile.monthly_emi,
        investment_horizon: questionnaire.investment_horizon,
        investment_experience: questionnaire.investment_experience,
        reaction_to_market_loss: questionnaire.reaction_to_market_loss,
        investment_frequency: questionnaire.investment_frequency,
        liquidity_preference: questionnaire.liquidity_preference,
        investment_goal: questionnaire.investment_goal,
      };

      const response = await this.client.post<MLPredictResponse>(
        `${this.baseUrl}/predict-risk`,
        request
      );

      return {
        riskProfile: response.data.risk_profile,
        probabilities: response.data.probabilities,
        modelVersion: response.data.model_version,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const mlError: MLServiceError = new Error(
          `ML service error: ${axiosError.message}`
        ) as MLServiceError;
        mlError.isNetworkError = !axiosError.response;
        mlError.statusCode = axiosError.response?.status;
        throw mlError;
      }
      throw error;
    }
  }

  /**
   * Health check for the ML service.
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get(`${this.baseUrl}/health`);
      return true;
    } catch {
      return false;
    }
  }
}

// Global singleton instance
export const mlServiceClient = new MLServiceClient();
