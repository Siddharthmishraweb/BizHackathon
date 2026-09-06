/**
 * Recommendation engine configuration: weights for the scoring formula.
 *
 * Formula:
 *   product_score =
 *       w_risk      × risk_compatibility(product, riskProfile)
 *     + w_horizon   × horizon_compatibility(product, investment_horizon)
 *     + w_goal      × goal_compatibility(product, investment_goal)
 *     + w_liquidity × liquidity_compatibility(product, liquidity_preference)
 *     + w_fit       × product_fit(product, monthly_surplus, savings, existing_investments)
 *
 * All weights must sum to 1.0, so the final score is normalized to [0, 100].
 */

export const RECOMMENDATION_WEIGHTS = {
  risk: 0.40,
  horizon: 0.20,
  goal: 0.15,
  liquidity: 0.15,
  fit: 0.10,
} as const;

// Validation: ensure weights sum to 1.0
const weightSum =
  RECOMMENDATION_WEIGHTS.risk +
  RECOMMENDATION_WEIGHTS.horizon +
  RECOMMENDATION_WEIGHTS.goal +
  RECOMMENDATION_WEIGHTS.liquidity +
  RECOMMENDATION_WEIGHTS.fit;

if (Math.abs(weightSum - 1.0) > 0.0001) {
  throw new Error(
    `RECOMMENDATION_WEIGHTS must sum to 1.0, but got ${weightSum}`
  );
}
