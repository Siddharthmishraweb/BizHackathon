"use strict";
/**
 * Analysis controller — handles HTTP requests for analysis endpoints.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisController = exports.AnalysisController = void 0;
const analysisService_1 = require("../services/analysisService");
const analysisRepository_1 = require("../repositories/analysisRepository");
const validator_1 = require("../utils/validator");
class AnalysisController {
    /**
     * POST /api/v1/analysis
     * Run a full analysis for a user.
     */
    async runAnalysis(req, res) {
        try {
            // Validate request
            const analysisRequest = validator_1.Validator.validateAnalysisRequest(req.body);
            // Get userId from query params or headers (for now, we'll require it in the query)
            const userId = req.query.userId;
            if (!userId) {
                res.status(400).json({
                    error: {
                        code: "MISSING_USER_ID",
                        message: "userId query parameter is required",
                    },
                });
                return;
            }
            // Run analysis
            const analysis = await analysisService_1.analysisService.runAnalysis(userId, analysisRequest);
            // Return response
            res.status(201).json({
                analysisId: analysis.analysisId,
                riskPrediction: {
                    riskProfile: analysis.riskPrediction.riskProfile,
                    probabilities: analysis.riskPrediction.probabilities,
                },
                recommendation: {
                    products: analysis.recommendation.products,
                    topRecommendation: analysis.recommendation.topRecommendation,
                },
                createdAt: analysis.createdAt,
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    /**
     * GET /api/v1/analysis/:analysisId
     * Fetch a specific analysis by ID.
     */
    getAnalysis(req, res) {
        try {
            const { analysisId } = req.params;
            const analysis = analysisRepository_1.analysisRepository.findById(analysisId);
            if (!analysis) {
                res.status(404).json({
                    error: {
                        code: "ANALYSIS_NOT_FOUND",
                        message: `Analysis ${analysisId} not found`,
                    },
                });
                return;
            }
            res.json({
                analysisId: analysis.analysisId,
                riskPrediction: {
                    riskProfile: analysis.riskPrediction.riskProfile,
                    probabilities: analysis.riskPrediction.probabilities,
                },
                recommendation: {
                    products: analysis.recommendation.products,
                    topRecommendation: analysis.recommendation.topRecommendation,
                },
                createdAt: analysis.createdAt,
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    /**
     * GET /api/v1/analysis?userId=:userId
     * List analyses for a user.
     */
    listAnalyses(req, res) {
        try {
            const userId = req.query.userId;
            if (!userId) {
                res.status(400).json({
                    error: {
                        code: "MISSING_USER_ID",
                        message: "userId query parameter is required",
                    },
                });
                return;
            }
            const analyses = analysisRepository_1.analysisRepository.findByUserId(userId);
            const total = analysisRepository_1.analysisRepository.countByUserId(userId);
            const items = analyses.map((analysis) => ({
                analysisId: analysis.analysisId,
                riskProfile: analysis.riskPrediction.riskProfile,
                topRecommendation: analysis.recommendation.topRecommendation,
                createdAt: analysis.createdAt,
            }));
            res.json({ items, total });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    handleError(error, res) {
        if (error instanceof validator_1.ValidationError) {
            res.status(400).json({
                error: {
                    code: error.code,
                    message: error.message,
                },
            });
            return;
        }
        // Check for ML service errors
        if (error instanceof Error) {
            if (error.message.includes("ML service")) {
                res.status(502).json({
                    error: {
                        code: "ML_SERVICE_UNAVAILABLE",
                        message: error.message,
                    },
                });
                return;
            }
        }
        // Generic error
        console.error("Unhandled error in AnalysisController:", error);
        res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                message: "Internal server error",
            },
        });
    }
}
exports.AnalysisController = AnalysisController;
exports.analysisController = new AnalysisController();
