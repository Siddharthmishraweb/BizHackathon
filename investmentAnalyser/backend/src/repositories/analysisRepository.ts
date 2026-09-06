/**
 * In-memory repository for Analysis records.
 *
 * Interface designed to be easily swappable with a MongoDB implementation later.
 */

import { Analysis, AnalysisSummary } from "../types";
import { v4 as uuidv4 } from "uuid";

export class AnalysisRepository {
  private analyses: Map<string, Analysis> = new Map();
  private userAnalyses: Map<string, string[]> = new Map(); // userId -> [analysisIds] (most recent first)

  /**
   * Save a new analysis.
   */
  save(analysis: Omit<Analysis, "analysisId">): Analysis {
    const analysisId = uuidv4();
    const fullAnalysis: Analysis = {
      ...analysis,
      analysisId,
    };

    this.analyses.set(analysisId, fullAnalysis);

    // Add to user's analysis list (prepend for most recent first)
    if (!this.userAnalyses.has(analysis.userId)) {
      this.userAnalyses.set(analysis.userId, []);
    }
    this.userAnalyses.get(analysis.userId)!.unshift(analysisId);

    return fullAnalysis;
  }

  /**
   * Get analysis by ID.
   */
  findById(analysisId: string): Analysis | null {
    return this.analyses.get(analysisId) || null;
  }

  /**
   * List analyses for a user, most recent first.
   */
  findByUserId(userId: string, limit?: number): Analysis[] {
    const analysisIds = this.userAnalyses.get(userId) || [];
    const ids = limit ? analysisIds.slice(0, limit) : analysisIds;
    return ids
      .map((id) => this.analyses.get(id))
      .filter((a) => a !== undefined) as Analysis[];
  }

  /**
   * Count analyses for a user.
   */
  countByUserId(userId: string): number {
    return (this.userAnalyses.get(userId) || []).length;
  }

  /**
   * Get a summary of an analysis (for list responses).
   */
  getSummary(analysis: Analysis): AnalysisSummary {
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
  listAll(): Analysis[] {
    return Array.from(this.analyses.values());
  }
}

// Global singleton instance
export const analysisRepository = new AnalysisRepository();
