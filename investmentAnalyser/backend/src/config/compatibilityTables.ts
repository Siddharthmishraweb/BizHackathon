/**
 * Recommendation engine configuration: compatibility tables and product fit.
 *
 * Scores in these tables are in the range [0, 100] and represent how well
 * a given product matches the user's profile dimension.
 *
 * See RECOMMENDATION_ENGINE.md for full details and reasoning.
 */

import { Product, RiskProfile, InvestmentGoal, LiquidityPreference } from "../types";

/**
 * Risk compatibility table: product × predicted risk profile
 * Scores how well each product suits the user's risk tolerance.
 */
export const RISK_COMPATIBILITY: Record<Product, Record<RiskProfile, number>> = {
  [Product.FD]: {
    [RiskProfile.LOW]: 100,
    [RiskProfile.MEDIUM]: 70,
    [RiskProfile.HIGH]: 30,
  },
  [Product.PPF]: {
    [RiskProfile.LOW]: 100,
    [RiskProfile.MEDIUM]: 75,
    [RiskProfile.HIGH]: 40,
  },
  [Product.NPS]: {
    [RiskProfile.LOW]: 50,
    [RiskProfile.MEDIUM]: 85,
    [RiskProfile.HIGH]: 90,
  },
  [Product.MUTUAL_FUND]: {
    [RiskProfile.LOW]: 20,
    [RiskProfile.MEDIUM]: 70,
    [RiskProfile.HIGH]: 100,
  },
};

/**
 * Horizon compatibility table: product × investment horizon bucket
 * Buckets: short (< 3 yrs), medium (3–7 yrs), long (> 7 yrs)
 * Scores how well each product suits the user's investment timeline.
 */
export type HorizonBucket = "SHORT" | "MEDIUM" | "LONG";

export const HORIZON_COMPATIBILITY: Record<Product, Record<HorizonBucket, number>> = {
  [Product.FD]: {
    SHORT: 100,
    MEDIUM: 60,
    LONG: 30,
  },
  [Product.PPF]: {
    SHORT: 20,
    MEDIUM: 60,
    LONG: 100,
  },
  [Product.NPS]: {
    SHORT: 10,
    MEDIUM: 50,
    LONG: 100,
  },
  [Product.MUTUAL_FUND]: {
    SHORT: 30,
    MEDIUM: 75,
    LONG: 100,
  },
};

/**
 * Convert investment horizon (in years) to a bucket.
 */
export function horizonToBucket(horizonYears: number): HorizonBucket {
  if (horizonYears < 3) return "SHORT";
  if (horizonYears <= 7) return "MEDIUM";
  return "LONG";
}

/**
 * Goal compatibility table: product × investment goal
 * Scores how well each product aligns with the user's financial goal.
 */
export const GOAL_COMPATIBILITY: Record<Product, Record<InvestmentGoal, number>> = {
  [Product.FD]: {
    [InvestmentGoal.WEALTH_CREATION]: 30,
    [InvestmentGoal.RETIREMENT]: 40,
    [InvestmentGoal.TAX_SAVING]: 50,
    [InvestmentGoal.EMERGENCY_FUND]: 100,
    [InvestmentGoal.SHORT_TERM_GOAL]: 90,
  },
  [Product.PPF]: {
    [InvestmentGoal.WEALTH_CREATION]: 50,
    [InvestmentGoal.RETIREMENT]: 70,
    [InvestmentGoal.TAX_SAVING]: 100,
    [InvestmentGoal.EMERGENCY_FUND]: 10,
    [InvestmentGoal.SHORT_TERM_GOAL]: 10,
  },
  [Product.NPS]: {
    [InvestmentGoal.WEALTH_CREATION]: 60,
    [InvestmentGoal.RETIREMENT]: 100,
    [InvestmentGoal.TAX_SAVING]: 90,
    [InvestmentGoal.EMERGENCY_FUND]: 5,
    [InvestmentGoal.SHORT_TERM_GOAL]: 5,
  },
  [Product.MUTUAL_FUND]: {
    [InvestmentGoal.WEALTH_CREATION]: 100,
    [InvestmentGoal.RETIREMENT]: 70,
    [InvestmentGoal.TAX_SAVING]: 80,
    [InvestmentGoal.EMERGENCY_FUND]: 40,
    [InvestmentGoal.SHORT_TERM_GOAL]: 50,
  },
};

/**
 * Liquidity compatibility table: product × user's liquidity preference
 * Scores how well each product matches the user's liquidity needs.
 */
export type LiquidityBucket = "LOW" | "MEDIUM" | "HIGH";

export const LIQUIDITY_COMPATIBILITY: Record<Product, Record<LiquidityBucket, number>> = {
  [Product.FD]: {
    LOW: 70,
    MEDIUM: 90,
    HIGH: 80,
  },
  [Product.PPF]: {
    LOW: 100,
    MEDIUM: 50,
    HIGH: 20,
  },
  [Product.NPS]: {
    LOW: 90,
    MEDIUM: 40,
    HIGH: 10,
  },
  [Product.MUTUAL_FUND]: {
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
export const PRODUCT_FIT: Record<Product, number> = {
  [Product.FD]: 70,      // Accessible for all
  [Product.PPF]: 75,     // Well-suited once monthly_surplus covers annual contribution
  [Product.NPS]: 70,     // Good for consistent long-term contributors
  [Product.MUTUAL_FUND]: 80, // SIP-friendly, scales with existing_investments
};

/**
 * Rules version: bumped whenever weights, tables, or the formula change.
 * Stored in every analysis so recommendations remain interpretable over time.
 */
export const RULES_VERSION = "v3";

/**
 * Threshold for including a reason in the explanation.
 * Compatibility scores >= this threshold are considered "strong" and included.
 * Scores <= inverse_threshold are considered "limiting" and included.
 */
export const REASON_INCLUSION_THRESHOLD = 70;
export const REASON_LIMITING_THRESHOLD = 30;

/**
 * Allocation bounds: no single product may take less than the min or more than
 * the max share of the suggested portfolio split, to keep the output diversified.
 */
export const ALLOCATION_MIN_PERCENT = 5;
export const ALLOCATION_MAX_PERCENT = 60;
