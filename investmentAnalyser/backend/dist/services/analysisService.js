"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisService = exports.AnalysisService = void 0;
const mlServiceClient_1 = require("../clients/mlServiceClient");
const recommendationEngine_1 = require("./recommendationEngine");
const analysisRepository_1 = require("../repositories/analysisRepository");
class AnalysisService {
    /**
     * Run a complete analysis: ML prediction + recommendation + persistence.
     */
    async runAnalysis(userId, request) {
        const { profile, questionnaire } = request;
        // Compute derived features
        const derivedFeatures = this.computeDerivedFeatures(profile);
        // Call ML service for risk prediction
        const riskPrediction = await mlServiceClient_1.mlServiceClient.predictRisk(profile, questionnaire);
        // Run recommendation engine
        const recommendation = recommendationEngine_1.recommendationEngine.generateRecommendation(riskPrediction.riskProfile, profile, questionnaire);
        // Persist the analysis
        const analysis = analysisRepository_1.analysisRepository.save({
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
    computeDerivedFeatures(profile) {
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
exports.AnalysisService = AnalysisService;
// Global singleton instance
exports.analysisService = new AnalysisService();
