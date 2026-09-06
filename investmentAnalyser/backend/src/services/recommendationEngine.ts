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

import {
  Product,
  RiskProfile,
  Recommendation,
  ProductRecommendation,
  UserProfile,
  Questionnaire,
} from "../types";
import {
  RISK_COMPATIBILITY,
  GOAL_COMPATIBILITY,
  LIQUIDITY_COMPATIBILITY,
  PRODUCT_FIT,
  horizonToBucket,
  HORIZON_COMPATIBILITY,
  REASON_INCLUSION_THRESHOLD,
  REASON_LIMITING_THRESHOLD,
  RULES_VERSION,
  ALLOCATION_MIN_PERCENT,
  ALLOCATION_MAX_PERCENT,
} from "../config/compatibilityTables";
import { RECOMMENDATION_WEIGHTS } from "../config/recommendationWeights";

interface ScoringBreakdown {
  risk: number;
  horizon: number;
  goal: number;
  liquidity: number;
  fit: number;
  total: number;
}

export class RecommendationEngine {
  /**
   * Generate recommendations for all products given the user's profile and risk.
   */
  generateRecommendation(
    riskProfile: RiskProfile,
    profile: UserProfile,
    questionnaire: Questionnaire
  ): Recommendation {
    const allProducts = [Product.FD, Product.PPF, Product.NPS, Product.MUTUAL_FUND];

    const productScores: Array<{
      product: Product;
      score: number;
      breakdown: ScoringBreakdown;
      reasons: string[];
    }> = [];

    // Compute score for each product
    for (const product of allProducts) {
      const breakdown = this.computeBreakdown(
        product,
        riskProfile,
        profile,
        questionnaire
      );
      const score = this.clamp(
        breakdown.risk * RECOMMENDATION_WEIGHTS.risk +
          breakdown.horizon * RECOMMENDATION_WEIGHTS.horizon +
          breakdown.goal * RECOMMENDATION_WEIGHTS.goal +
          breakdown.liquidity * RECOMMENDATION_WEIGHTS.liquidity +
          breakdown.fit * RECOMMENDATION_WEIGHTS.fit,
        0,
        100
      );

      const reasons = this.generateReasons(
        product,
        breakdown,
        riskProfile,
        questionnaire,
        profile
      );

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

    const allocations = this.computeAllocations(
      productScores.map(({ product, score }) => ({ product, score }))
    );

    const monthlyInvestableAmount = this.computeMonthlyInvestableAmount(profile);

    const products: ProductRecommendation[] = productScores.map(({ product, score, reasons }) => {
      const allocationPercentage = allocations.get(product)!;
      return {
        product,
        score: Math.round(score),
        allocationPercentage,
        allocationAmount: Math.round((monthlyInvestableAmount * allocationPercentage) / 100),
        reasons,
      };
    });

    const topRecommendation = products[0].product;

    return {
      products,
      topRecommendation,
      monthlyInvestableAmount,
      rulesVersion: RULES_VERSION,
    };
  }

  /**
   * Compute the breakdown of compatibility scores for a single product.
   */
  private computeBreakdown(
    product: Product,
    riskProfile: RiskProfile,
    profile: UserProfile,
    questionnaire: Questionnaire
  ): ScoringBreakdown {
    const horizonBucket = horizonToBucket(questionnaire.investment_horizon);

    const risk = RISK_COMPATIBILITY[product][riskProfile];
    const horizon = HORIZON_COMPATIBILITY[product][horizonBucket];
    const goal = GOAL_COMPATIBILITY[product][questionnaire.investment_goal];
    const liquidity = LIQUIDITY_COMPATIBILITY[product][questionnaire.liquidity_preference];
    let fit = PRODUCT_FIT[product];

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
  private adjustFitByFinancials(
    product: Product,
    profile: UserProfile,
    baseFit: number
  ): number {
    const monthlySurplus = profile.monthly_income - profile.monthly_expenses;
    const annualIncome = profile.monthly_income * 12;
    const savingsRatio = profile.savings / annualIncome;
    const emiRatio = profile.monthly_emi / profile.monthly_income;

    let adjustedFit = baseFit;

    // Emergency fund adequacy: savings >= 6 months of expenses
    const monthsOfExpenses = profile.savings / profile.monthly_expenses;
    const hasAdequateEmergencyFund = monthsOfExpenses >= 6;

    switch (product) {
      case Product.FD:
        // FD is good for emergency funds and conservative investors
        if (hasAdequateEmergencyFund) {
          adjustedFit += 3; // Already has emergency fund, less urgent need
        } else if (monthsOfExpenses < 3) {
          adjustedFit += 5; // Urgent need for emergency fund
        }
        // Penalty if very high surplus (better suited for growth)
        if (monthlySurplus > 50000) {
          adjustedFit -= 5;
        }
        break;

      case Product.PPF:
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

      case Product.NPS:
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

      case Product.MUTUAL_FUND:
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
  private generateReasons(
    product: Product,
    breakdown: ScoringBreakdown,
    riskProfile: RiskProfile,
    questionnaire: Questionnaire,
    profile: UserProfile
  ): string[] {
    const reasons: string[] = [];
    const monthlySurplus = profile.monthly_income - profile.monthly_expenses;

    // Risk alignment (strong reason if score >= threshold)
    if (breakdown.risk >= REASON_INCLUSION_THRESHOLD) {
      reasons.push(this.riskReason(product, breakdown.risk, riskProfile));
    }

    // Time horizon alignment
    if (breakdown.horizon >= REASON_INCLUSION_THRESHOLD) {
      reasons.push(
        this.horizonReason(product, breakdown.horizon, questionnaire.investment_horizon, riskProfile)
      );
    }

    // Goal alignment
    if (breakdown.goal >= REASON_INCLUSION_THRESHOLD) {
      reasons.push(this.goalReason(product, breakdown.goal, questionnaire.investment_goal));
    }

    // Liquidity considerations
    if (breakdown.liquidity >= REASON_INCLUSION_THRESHOLD) {
      reasons.push(
        this.liquidityReason(product, breakdown.liquidity, questionnaire.liquidity_preference)
      );
    }

    // Practical fit reasons (based on financial metrics)
    const monthlySurplusReason = this.monthlySurplusReason(product, monthlySurplus);
    if (monthlySurplusReason) {
      reasons.push(monthlySurplusReason);
    }

    const investmentExperienceReason = this.investmentExperienceReason(
      product,
      questionnaire.investment_experience,
      profile.existing_investments
    );
    if (investmentExperienceReason) {
      reasons.push(investmentExperienceReason);
    }

    // Risk limiting reasons (if score is low and other reasons exist)
    if (breakdown.risk <= REASON_LIMITING_THRESHOLD && reasons.length > 0) {
      reasons.push(`Lower suitability due to ${riskProfile} risk profile preference`);
    }

    return reasons.length > 0 ? reasons : ["General fit for investment portfolio"];
  }

  private riskReason(product: Product, score: number, riskProfile: RiskProfile): string {
    const strength = score >= 85 ? "excellent" : score >= 75 ? "very good" : "good";
    return `${this.productName(product)} is ${strength} for ${riskProfile} risk tolerance`;
  }

  private horizonReason(
    product: Product,
    score: number,
    horizonYears: number,
    riskProfile: RiskProfile
  ): string {
    const horizon = horizonYears < 3 ? "short" : horizonYears <= 7 ? "medium" : "long";
    const strength = score >= 85 ? "excellent" : "suitable";
    return `${strength} match for ${horizon}-term horizon (${horizonYears} years)`;
  }

  private goalReason(product: Product, score: number, goal: string): string {
    const goalDisplay = goal.replace(/_/g, " ").toLowerCase();
    if (score >= 85) {
      return `Strongly aligned with ${goalDisplay}`;
    } else if (score >= 70) {
      return `Good alignment with ${goalDisplay}`;
    }
    return `Moderately suited for ${goalDisplay}`;
  }

  private liquidityReason(product: Product, score: number, liquidity: string): string {
    const liquidityDisplay = liquidity.toLowerCase();
    if (score >= 80) {
      return `${this.productName(product)} matches your ${liquidityDisplay} liquidity needs`;
    }
    return `Liquidity characteristics align with ${liquidityDisplay} preference`;
  }

  private monthlySurplusReason(product: Product, monthlySurplus: number): string | null {
    switch (product) {
      case Product.PPF:
        if (monthlySurplus >= 12500) {
          return "Monthly surplus sufficient for higher PPF contributions";
        } else if (monthlySurplus >= 500) {
          return "Can comfortably contribute to PPF";
        }
        return null;

      case Product.MUTUAL_FUND:
        if (monthlySurplus >= 10000) {
          return "Strong monthly surplus supports regular SIP investments";
        } else if (monthlySurplus >= 5000) {
          return "Monthly surplus supports consistent MF investments";
        }
        return null;

      case Product.NPS:
        if (monthlySurplus >= 5000) {
          return "Monthly surplus supports retirement savings";
        }
        return null;

      case Product.FD:
        if (monthlySurplus < 5000) {
          return "FD suitable for building savings with moderate surplus";
        }
        return null;
    }
  }

  private investmentExperienceReason(
    product: Product,
    investmentExperience: number,
    existingInvestments: number
  ): string | null {
    if (product === Product.MUTUAL_FUND) {
      if (existingInvestments >= 500000 && investmentExperience >= 3) {
        return "Established investment experience and portfolio support MF investments";
      } else if (existingInvestments >= 100000) {
        return "Existing investments demonstrate MF familiarity";
      }
    }
    return null;
  }

  private productName(product: Product): string {
    switch (product) {
      case Product.FD:
        return "Fixed Deposits";
      case Product.PPF:
        return "PPF";
      case Product.NPS:
        return "NPS";
      case Product.MUTUAL_FUND:
        return "Mutual Funds";
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Convert per-product compatibility scores into a suggested allocation split (%),
   * bounded to [ALLOCATION_MIN_PERCENT, ALLOCATION_MAX_PERCENT] per product and
   * summing to 100. Deterministic water-filling: clip out-of-bounds products first,
   * then re-normalize the remainder across unclipped products.
   */
  private computeAllocations(
    productScores: Array<{ product: Product; score: number }>
  ): Map<Product, number> {
    const resolved = new Map<Product, number>();
    let unresolved = productScores.map((p) => ({ ...p }));
    let remainingPercent = 100;

    while (unresolved.length > 0) {
      const scoreSum = unresolved.reduce((sum, item) => sum + item.score, 0);
      if (scoreSum <= 0) {
        // No signal left to distribute — split what remains evenly.
        const evenShare = remainingPercent / unresolved.length;
        for (const item of unresolved) resolved.set(item.product, evenShare);
        break;
      }

      const clippedThisPass: Product[] = [];
      for (const item of unresolved) {
        const raw = (item.score / scoreSum) * remainingPercent;
        if (raw < ALLOCATION_MIN_PERCENT) {
          resolved.set(item.product, ALLOCATION_MIN_PERCENT);
          remainingPercent -= ALLOCATION_MIN_PERCENT;
          clippedThisPass.push(item.product);
        } else if (raw > ALLOCATION_MAX_PERCENT) {
          resolved.set(item.product, ALLOCATION_MAX_PERCENT);
          remainingPercent -= ALLOCATION_MAX_PERCENT;
          clippedThisPass.push(item.product);
        }
      }

      if (clippedThisPass.length === 0) {
        for (const item of unresolved) {
          resolved.set(item.product, (item.score / scoreSum) * remainingPercent);
        }
        break;
      }

      unresolved = unresolved.filter((item) => !clippedThisPass.includes(item.product));
    }

    return this.roundAllocations(resolved);
  }

  /** Round to whole percentages while keeping the total at exactly 100. */
  private roundAllocations(allocations: Map<Product, number>): Map<Product, number> {
    const rounded = new Map<Product, number>();
    let total = 0;
    for (const [product, percent] of allocations) {
      const roundedPercent = Math.round(percent);
      rounded.set(product, roundedPercent);
      total += roundedPercent;
    }

    const drift = 100 - total;
    if (drift !== 0) {
      const [topProduct] = [...rounded.entries()].sort((a, b) => b[1] - a[1])[0];
      rounded.set(topProduct, rounded.get(topProduct)! + drift);
    }
    return rounded;
  }

  /** Monthly amount available to invest: income minus expenses and EMI, never negative. */
  private computeMonthlyInvestableAmount(profile: UserProfile): number {
    const surplus = profile.monthly_income - profile.monthly_expenses - profile.monthly_emi;
    return Math.max(0, Math.round(surplus));
  }
}

// Global singleton instance
export const recommendationEngine = new RecommendationEngine();
