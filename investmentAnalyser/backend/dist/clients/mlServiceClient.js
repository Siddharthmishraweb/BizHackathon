"use strict";
/**
 * HTTP client for the Python ML service.
 *
 * Handles communication with the FastAPI ML service running on localhost:8000.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mlServiceClient = exports.MLServiceClient = void 0;
const axios_1 = __importDefault(require("axios"));
class MLServiceClient {
    constructor(baseUrl = "http://localhost:8000") {
        this.client = axios_1.default.create({
            timeout: 10000,
        });
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
    async predictRisk(profile, questionnaire) {
        try {
            const request = {
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
            const response = await this.client.post(`${this.baseUrl}/predict-risk`, request);
            return {
                riskProfile: response.data.risk_profile,
                probabilities: response.data.probabilities,
                modelVersion: response.data.model_version,
            };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                const mlError = new Error(`ML service error: ${axiosError.message}`);
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
    async healthCheck() {
        try {
            await this.client.get(`${this.baseUrl}/health`);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.MLServiceClient = MLServiceClient;
// Global singleton instance
exports.mlServiceClient = new MLServiceClient();
