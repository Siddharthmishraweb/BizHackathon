"use strict";
/**
 * In-memory repository for Analysis records.
 *
 * Interface designed to be easily swappable with a MongoDB implementation later.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisRepository = exports.AnalysisRepository = void 0;
const uuid_1 = require("uuid");
class AnalysisRepository {
    constructor() {
        this.analyses = new Map();
        this.userAnalyses = new Map(); // userId -> [analysisIds] (most recent first)
    }
    /**
     * Save a new analysis.
     */
    save(analysis) {
        const analysisId = (0, uuid_1.v4)();
        const fullAnalysis = {
            ...analysis,
            analysisId,
        };
        this.analyses.set(analysisId, fullAnalysis);
        // Add to user's analysis list (prepend for most recent first)
        if (!this.userAnalyses.has(analysis.userId)) {
            this.userAnalyses.set(analysis.userId, []);
        }
        this.userAnalyses.get(analysis.userId).unshift(analysisId);
        return fullAnalysis;
    }
    /**
     * Get analysis by ID.
     */
    findById(analysisId) {
        return this.analyses.get(analysisId) || null;
    }
    /**
     * List analyses for a user, most recent first.
     */
    findByUserId(userId, limit) {
        const analysisIds = this.userAnalyses.get(userId) || [];
        const ids = limit ? analysisIds.slice(0, limit) : analysisIds;
        return ids
            .map((id) => this.analyses.get(id))
            .filter((a) => a !== undefined);
    }
    /**
     * Count analyses for a user.
     */
    countByUserId(userId) {
        return (this.userAnalyses.get(userId) || []).length;
    }
    /**
     * Get a summary of an analysis (for list responses).
     */
    getSummary(analysis) {
        return {
            analysisId: analysis.analysisId,
            riskProfile: analysis.riskPrediction.riskProfile,
            topRecommendation: analysis.recommendation.topRecommendation,
            createdAt: analysis.createdAt,
        };
    }
    /**
     * List all analyses (for debugging).
     */
    listAll() {
        return Array.from(this.analyses.values());
    }
}
exports.AnalysisRepository = AnalysisRepository;
// Global singleton instance
exports.analysisRepository = new AnalysisRepository();
