"use strict";
/**
 * Deterministic recommendation engine.
 *
 * Computes compatibility scores for FD, PPF, NPS, and Mutual Funds based on:
 * - Predicted risk profile (from ML service)
 * - Investment horizon, goal, and liquidity preference (from questionnaire)
 * - Financial metrics (from profile)
 *
 * Fully deterministic and explainable — every score is traceable to rules.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationEngine = exports.RecommendationEngine = void 0;
const types_1 = require("../types");
const compatibilityTables_1 = require("../config/compatibilityTables");
const recommendationWeights_1 = require("../config/recommendationWeights");
class RecommendationEngine {
    /**
     * Generate recommendations for all products given the user's profile and risk.
     */
    generateRecommendation(riskProfile, profile, questionnaire) {
        const allProducts = [types_1.Product.FD, types_1.Product.PPF, types_1.Product.NPS, types_1.Product.MUTUAL_FUND];
        const productScores = [];
        // Compute score for each product
        for (const product of allProducts) {
            const breakdown = this.computeBreakdown(product, riskProfile, profile, questionnaire);
            const score = this.clamp(breakdown.risk * recommendationWeights_1.RECOMMENDATION_WEIGHTS.risk +
                breakdown.horizon * recommendationWeights_1.RECOMMENDATION_WEIGHTS.horizon +
                breakdown.goal * recommendationWeights_1.RECOMMENDATION_WEIGHTS.goal +
                breakdown.liquidity * recommendationWeights_1.RECOMMENDATION_WEIGHTS.liquidity +
                breakdown.fit * recommendationWeights_1.RECOMMENDATION_WEIGHTS.fit, 0, 100);
            const reasons = this.generateReasons(product, breakdown, riskProfile, questionnaire, profile);
            productScores.push({
                product,
                score,
                breakdown,
                reasons,
            });
        }
        // Sort by score descending, with tie-breaking
        productScores.sort((a, b) => {
            if (Math.abs(a.score - b.score) > 0.01) {
                return b.score - a.score;
            }
            // Tie-breaker 1: best liquidity_compatibility
            if (Math.abs(a.breakdown.liquidity - b.breakdown.liquidity) > 0.01) {
                return b.breakdown.liquidity - a.breakdown.liquidity;
            }
            // Tie-breaker 2: alphabetical
            return a.product.localeCompare(b.product);
        });
        const products = productScores.map(({ product, score, reasons }) => ({
            product,
            score: Math.round(score),
            reasons,
        }));
        const topRecommendation = products[0].product;
        return {
            products,
            topRecommendation,
            rulesVersion: compatibilityTables_1.RULES_VERSION,
        };
    }
    /**
     * Compute the breakdown of compatibility scores for a single product.
     */
    computeBreakdown(product, riskProfile, profile, questionnaire) {
        const horizonBucket = (0, compatibilityTables_1.horizonToBucket)(questionnaire.investment_horizon);
        const risk = compatibilityTables_1.RISK_COMPATIBILITY[product][riskProfile];
        const horizon = compatibilityTables_1.HORIZON_COMPATIBILITY[product][horizonBucket];
        const goal = compatibilityTables_1.GOAL_COMPATIBILITY[product][questionnaire.investment_goal];
        const liquidity = compatibilityTables_1.LIQUIDITY_COMPATIBILITY[product][questionnaire.liquidity_preference];
        let fit = compatibilityTables_1.PRODUCT_FIT[product];
        // Optional: adjust fit based on financial metrics
        fit = this.adjustFitByFinancials(product, profile, fit);
        return {
            risk,
            horizon,
            goal,
            liquidity,
            fit,
            total: 0, // will be computed by caller
        };
    }
    /**
     * Adjust product fit based on user's financial metrics.
     *
     * Adjustments consider:
     * - Monthly surplus and its capacity for contributions
     * - Savings ratio (emergency fund adequacy)
     * - EMI burden (debt obligations)
     * - Existing investments (experience level)
     */
    adjustFitByFinancials(product, profile, baseFit) {
        const monthlySurplus = profile.monthly_income - profile.monthly_expenses;
        const annualIncome = profile.monthly_income * 12;
        const savingsRatio = profile.savings / annualIncome;
        const emiRatio = profile.monthly_emi / profile.monthly_income;
        let adjustedFit = baseFit;
        // Emergency fund adequacy: savings >= 6 months of expenses
        const monthsOfExpenses = profile.savings / profile.monthly_expenses;
        const hasAdequateEmergencyFund = monthsOfExpenses >= 6;
        switch (product) {
            case types_1.Product.FD:
                // FD is good for emergency funds and conservative investors
                if (hasAdequateEmergencyFund) {
                    adjustedFit += 3; // Already has emergency fund, less urgent need
                }
                else if (monthsOfExpenses < 3) {
                    adjustedFit += 5; // Urgent need for emergency fund
                }
                // Penalty if very high surplus (better suited for growth)
                if (monthlySurplus > 50000) {
                    adjustedFit -= 5;
                }
                break;
            case types_1.Product.PPF:
                // PPF is good for tax savings and long-term, consistent investors
                // Bonus if can afford regular annual contributions (min ₹500)
                if (monthlySurplus >= 500) {
                    adjustedFit += 5;
                }
                // Extra bonus if can do higher contributions (₹150k annually)
                if (monthlySurplus >= 12500) {
                    adjustedFit += 3;
                }
                // Penalty if very high EMI burden (should focus on debt)
                if (emiRatio > 0.5) {
                    adjustedFit -= 8;
                }
                break;
            case types_1.Product.NPS:
                // NPS is good for retirement and tax planning
                // Bonus if consistent income and moderate-to-high surplus
                if (monthlySurplus >= 5000) {
                    adjustedFit += 4;
                }
                // Bonus if young and long investment horizon
                if (profile.age < 40 && monthlySurplus >= 2000) {
                    adjustedFit += 3;
                }
                // Penalty if high EMI (retirement savings secondary to debt)
                if (emiRatio > 0.4) {
                    adjustedFit -= 5;
                }
                break;
            case types_1.Product.MUTUAL_FUND:
                // MF is good for wealth creation, growth, and experienced investors
                // Bonus for solid surplus (SIP-friendly)
                if (monthlySurplus >= 5000) {
                    adjustedFit += 4;
                }
                // Bonus for existing investment experience
                if (profile.existing_investments >= 100000) {
                    adjustedFit += 3;
                }
                // Extra bonus for substantial existing investments
                if (profile.existing_investments >= 500000) {
                    adjustedFit += 2;
                }
                // Bonus if adequate emergency fund (can take risks)
                if (hasAdequateEmergencyFund) {
                    adjustedFit += 2;
                }
                // Penalty for high EMI burden
                if (emiRatio > 0.3) {
                    adjustedFit -= 4;
                }
                break;
        }
        return this.clamp(adjustedFit, 0, 100);
    }
    /**
     * Generate human-readable reasons for the recommendation.
     *
     * Reasons are contextual and explain:
     * - Why the product scored well/poorly for risk
     * - Why it fits the time horizon
     * - How it aligns with investment goals
     * - Liquidity trade-offs
     */
    generateReasons(product, breakdown, riskProfile, questionnaire, profile) {
        const reasons = [];
        const monthlySurplus = profile.monthly_income - profile.monthly_expenses;
        // Risk alignment (strong reason if score >= threshold)
        if (breakdown.risk >= compatibilityTables_1.REASON_INCLUSION_THRESHOLD) {
            reasons.push(this.riskReason(product, breakdown.risk, riskProfile));
        }
        // Time horizon alignment
        if (breakdown.horizon >= compatibilityTables_1.REASON_INCLUSION_THRESHOLD) {
            reasons.push(this.horizonReason(product, breakdown.horizon, questionnaire.investment_horizon, riskProfile));
        }
        // Goal alignment
        if (breakdown.goal >= compatibilityTables_1.REASON_INCLUSION_THRESHOLD) {
            reasons.push(this.goalReason(product, breakdown.goal, questionnaire.investment_goal));
        }
        // Liquidity considerations
        if (breakdown.liquidity >= compatibilityTables_1.REASON_INCLUSION_THRESHOLD) {
            reasons.push(this.liquidityReason(product, breakdown.liquidity, questionnaire.liquidity_preference));
        }
        // Practical fit reasons (based on financial metrics)
        const monthlySurplusReason = this.monthlySurplusReason(product, monthlySurplus);
        if (monthlySurplusReason) {
            reasons.push(monthlySurplusReason);
        }
        const investmentExperienceReason = this.investmentExperienceReason(product, questionnaire.investment_experience, profile.existing_investments);
        if (investmentExperienceReason) {
            reasons.push(investmentExperienceReason);
        }
        // Risk limiting reasons (if score is low and other reasons exist)
        if (breakdown.risk <= compatibilityTables_1.REASON_LIMITING_THRESHOLD && reasons.length > 0) {
            reasons.push(`Lower suitability due to ${riskProfile} risk profile preference`);
        }
        return reasons.length > 0 ? reasons : ["General fit for investment portfolio"];
    }
    riskReason(product, score, riskProfile) {
        const strength = score >= 85 ? "excellent" : score >= 75 ? "very good" : "good";
        return `${this.productName(product)} is ${strength} for ${riskProfile} risk tolerance`;
    }
    horizonReason(product, score, horizonYears, riskProfile) {
        const horizon = horizonYears < 3 ? "short" : horizonYears <= 7 ? "medium" : "long";
        const strength = score >= 85 ? "excellent" : "suitable";
        return `${strength} match for ${horizon}-term horizon (${horizonYears} years)`;
    }
    goalReason(product, score, goal) {
        const goalDisplay = goal.replace(/_/g, " ").toLowerCase();
        if (score >= 85) {
            return `Strongly aligned with ${goalDisplay}`;
        }
        else if (score >= 70) {
            return `Good alignment with ${goalDisplay}`;
        }
        return `Moderately suited for ${goalDisplay}`;
    }
    liquidityReason(product, score, liquidity) {
        const liquidityDisplay = liquidity.toLowerCase();
        if (score >= 80) {
            return `${this.productName(product)} matches your ${liquidityDisplay} liquidity needs`;
        }
        return `Liquidity characteristics align with ${liquidityDisplay} preference`;
    }
    monthlySurplusReason(product, monthlySurplus) {
        switch (product) {
            case types_1.Product.PPF:
                if (monthlySurplus >= 12500) {
                    return "Monthly surplus sufficient for higher PPF contributions";
                }
                else if (monthlySurplus >= 500) {
                    return "Can comfortably contribute to PPF";
                }
                return null;
            case types_1.Product.MUTUAL_FUND:
                if (monthlySurplus >= 10000) {
                    return "Strong monthly surplus supports regular SIP investments";
                }
                else if (monthlySurplus >= 5000) {
                    return "Monthly surplus supports consistent MF investments";
                }
                return null;
            case types_1.Product.NPS:
                if (monthlySurplus >= 5000) {
                    return "Monthly surplus supports retirement savings";
                }
                return null;
            case types_1.Product.FD:
                if (monthlySurplus < 5000) {
                    return "FD suitable for building savings with moderate surplus";
                }
                return null;
        }
    }
    investmentExperienceReason(product, investmentExperience, existingInvestments) {
        if (product === types_1.Product.MUTUAL_FUND) {
            if (existingInvestments >= 500000 && investmentExperience >= 3) {
                return "Established investment experience and portfolio support MF investments";
            }
            else if (existingInvestments >= 100000) {
                return "Existing investments demonstrate MF familiarity";
            }
        }
        return null;
    }
    productName(product) {
        switch (product) {
            case types_1.Product.FD:
                return "Fixed Deposits";
            case types_1.Product.PPF:
                return "PPF";
            case types_1.Product.NPS:
                return "NPS";
            case types_1.Product.MUTUAL_FUND:
                return "Mutual Funds";
        }
    }
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
}
exports.RecommendationEngine = RecommendationEngine;
// Global singleton instance
exports.recommendationEngine = new RecommendationEngine();
