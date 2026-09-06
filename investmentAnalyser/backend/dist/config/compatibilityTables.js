"use strict";
/**
 * Recommendation engine configuration: compatibility tables and product fit.
 *
 * Scores in these tables are in the range [0, 100] and represent how well
 * a given product matches the user's profile dimension.
 *
 * See RECOMMENDATION_ENGINE.md for full details and reasoning.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REASON_LIMITING_THRESHOLD = exports.REASON_INCLUSION_THRESHOLD = exports.RULES_VERSION = exports.PRODUCT_FIT = exports.LIQUIDITY_COMPATIBILITY = exports.GOAL_COMPATIBILITY = exports.HORIZON_COMPATIBILITY = exports.RISK_COMPATIBILITY = void 0;
exports.horizonToBucket = horizonToBucket;
const types_1 = require("../types");
/**
 * Risk compatibility table: product × predicted risk profile
 * Scores how well each product suits the user's risk tolerance.
 */
exports.RISK_COMPATIBILITY = {
    [types_1.Product.FD]: {
        [types_1.RiskProfile.LOW]: 100,
        [types_1.RiskProfile.MEDIUM]: 70,
        [types_1.RiskProfile.HIGH]: 30,
    },
    [types_1.Product.PPF]: {
        [types_1.RiskProfile.LOW]: 100,
        [types_1.RiskProfile.MEDIUM]: 75,
        [types_1.RiskProfile.HIGH]: 40,
    },
    [types_1.Product.NPS]: {
        [types_1.RiskProfile.LOW]: 50,
        [types_1.RiskProfile.MEDIUM]: 85,
        [types_1.RiskProfile.HIGH]: 90,
    },
    [types_1.Product.MUTUAL_FUND]: {
        [types_1.RiskProfile.LOW]: 20,
        [types_1.RiskProfile.MEDIUM]: 70,
        [types_1.RiskProfile.HIGH]: 100,
    },
};
exports.HORIZON_COMPATIBILITY = {
    [types_1.Product.FD]: {
        SHORT: 100,
        MEDIUM: 60,
        LONG: 30,
    },
    [types_1.Product.PPF]: {
        SHORT: 20,
        MEDIUM: 60,
        LONG: 100,
    },
    [types_1.Product.NPS]: {
        SHORT: 10,
        MEDIUM: 50,
        LONG: 100,
    },
    [types_1.Product.MUTUAL_FUND]: {
        SHORT: 30,
        MEDIUM: 75,
        LONG: 100,
    },
};
/**
 * Convert investment horizon (in years) to a bucket.
 */
function horizonToBucket(horizonYears) {
    if (horizonYears < 3)
        return "SHORT";
    if (horizonYears <= 7)
        return "MEDIUM";
    return "LONG";
}
/**
 * Goal compatibility table: product × investment goal
 * Scores how well each product aligns with the user's financial goal.
 */
exports.GOAL_COMPATIBILITY = {
    [types_1.Product.FD]: {
        [types_1.InvestmentGoal.WEALTH_CREATION]: 30,
        [types_1.InvestmentGoal.RETIREMENT]: 40,
        [types_1.InvestmentGoal.TAX_SAVING]: 50,
        [types_1.InvestmentGoal.EMERGENCY_FUND]: 100,
        [types_1.InvestmentGoal.SHORT_TERM_GOAL]: 90,
    },
    [types_1.Product.PPF]: {
        [types_1.InvestmentGoal.WEALTH_CREATION]: 50,
        [types_1.InvestmentGoal.RETIREMENT]: 70,
        [types_1.InvestmentGoal.TAX_SAVING]: 100,
        [types_1.InvestmentGoal.EMERGENCY_FUND]: 10,
        [types_1.InvestmentGoal.SHORT_TERM_GOAL]: 10,
    },
    [types_1.Product.NPS]: {
        [types_1.InvestmentGoal.WEALTH_CREATION]: 60,
        [types_1.InvestmentGoal.RETIREMENT]: 100,
        [types_1.InvestmentGoal.TAX_SAVING]: 90,
        [types_1.InvestmentGoal.EMERGENCY_FUND]: 5,
        [types_1.InvestmentGoal.SHORT_TERM_GOAL]: 5,
    },
    [types_1.Product.MUTUAL_FUND]: {
        [types_1.InvestmentGoal.WEALTH_CREATION]: 100,
        [types_1.InvestmentGoal.RETIREMENT]: 70,
        [types_1.InvestmentGoal.TAX_SAVING]: 80,
        [types_1.InvestmentGoal.EMERGENCY_FUND]: 40,
        [types_1.InvestmentGoal.SHORT_TERM_GOAL]: 50,
    },
};
exports.LIQUIDITY_COMPATIBILITY = {
    [types_1.Product.FD]: {
        LOW: 70,
        MEDIUM: 90,
        HIGH: 80,
    },
    [types_1.Product.PPF]: {
        LOW: 100,
        MEDIUM: 50,
        HIGH: 20,
    },
    [types_1.Product.NPS]: {
        LOW: 90,
        MEDIUM: 40,
        HIGH: 10,
    },
    [types_1.Product.MUTUAL_FUND]: {
        LOW: 70,
        MEDIUM: 85,
        HIGH: 90,
    },
};
/**
 * Product fit table: general practical fit adjustments
 * Reflects overall suitability independent of risk/horizon/goal/liquidity.
 *
 * Baseline scores may be further adjusted by financial metrics (e.g. bonus for high surplus),
 * but must remain rule-based and auditable.
 */
exports.PRODUCT_FIT = {
    [types_1.Product.FD]: 70, // Accessible for all
    [types_1.Product.PPF]: 75, // Well-suited once monthly_surplus covers annual contribution
    [types_1.Product.NPS]: 70, // Good for consistent long-term contributors
    [types_1.Product.MUTUAL_FUND]: 80, // SIP-friendly, scales with existing_investments
};
/**
 * Rules version: bumped whenever weights, tables, or the formula change.
 * Stored in every analysis so recommendations remain interpretable over time.
 */
exports.RULES_VERSION = "v2";
/**
 * Threshold for including a reason in the explanation.
 * Compatibility scores >= this threshold are considered "strong" and included.
 * Scores <= inverse_threshold are considered "limiting" and included.
 */
exports.REASON_INCLUSION_THRESHOLD = 70;
exports.REASON_LIMITING_THRESHOLD = 30;
