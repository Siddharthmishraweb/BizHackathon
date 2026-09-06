/**
 * Analysis service — orchestrates the full analysis workflow.
 *
 * Responsibilities:
 * 1. Call the ML service to predict risk profile
 * 2. Compute derived features
 * 3. Run the recommendation engine
 * 4. Persist the analysis
 * 5. Return the result
 */

import {
  Analysis,
  AnalysisRequest,
  DerivedFeatures,
  UserProfile,
  Questionnaire,
} from "../types";
import { mlServiceClient } from "../clients/mlServiceClient";
import { recommendationEngine } from "./recommendationEngine";
import { analysisRepository } from "../repositories/analysisRepository";

export class AnalysisService {
  /**
   * Run a complete analysis: ML prediction + recommendation + persistence.
   */
  async runAnalysis(userId: string, request: AnalysisRequest): Promise<Analysis> {
    const { profile, questionnaire } = request;

    // Compute derived features
    const derivedFeatures = this.computeDerivedFeatures(profile);

    // Call ML service for risk prediction
    const riskPrediction = await mlServiceClient.predictRisk(profile, questionnaire);

    // Run recommendation engine
    const recommendation = recommendationEngine.generateRecommendation(
      riskPrediction.riskProfile,
      profile,
      questionnaire
    );

    // Persist the analysis
    const analysis = analysisRepository.save({
      userId,
      profile,
      questionnaire,
      derivedFeatures,
      riskPrediction,
      recommendation,
      createdAt: new Date(),
    });

    return analysis;
  }

  /**
   * Compute derived financial features.
   */
  private computeDerivedFeatures(profile: UserProfile): DerivedFeatures {
    const annualIncome = profile.monthly_income * 12;
    const annualExpenses = profile.monthly_expenses * 12;

    return {
      savings_ratio: profile.savings / annualIncome,
      expense_ratio: annualExpenses / annualIncome,
      emi_to_income_ratio: profile.monthly_emi / profile.monthly_income,
      investment_to_income_ratio: profile.existing_investments / annualIncome,
    };
  }
}

// Global singleton instance
export const analysisService = new AnalysisService();
