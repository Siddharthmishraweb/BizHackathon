/**
 * Test scenarios for the recommendation engine.
 *
 * These test cases represent different user profiles and show how
 * the recommendation engine produces different recommendations based on
 * financial situation, risk profile, investment horizon, and goals.
 */

import { RecommendationEngine } from "../services/recommendationEngine";
import {
  RiskProfile,
  InvestmentFrequency,
  LiquidityPreference,
  InvestmentGoal,
  UserProfile,
  Questionnaire,
} from "../types";

const engine = new RecommendationEngine();

/**
 * Scenario 1: Young professional with high surplus and long horizon
 * Expected: Mutual Funds should score highest
 */
export const scenario1_YoungProfessional = {
  name: "Young Professional (High Growth Potential)",
  riskProfile: RiskProfile.MEDIUM,
  profile: {
    age: 28,
    monthly_income: 120000,
    monthly_expenses: 40000,
    savings: 600000,
    existing_investments: 150000,
    monthly_emi: 0,
  } as UserProfile,
  questionnaire: {
    investment_horizon: 25,
    investment_experience: 3,
    reaction_to_market_loss: 4,
    investment_frequency: InvestmentFrequency.MONTHLY,
    liquidity_preference: LiquidityPreference.MEDIUM,
    investment_goal: InvestmentGoal.WEALTH_CREATION,
    risk_questionnaire_score: 65,
  } as Questionnaire,
};

/**
 * Scenario 2: Conservative saver focused on security
 * Expected: PPF and FD should score highest
 */
export const scenario2_ConservativeSaver = {
  name: "Conservative Saver (Capital Preservation)",
  riskProfile: RiskProfile.LOW,
  profile: {
    age: 45,
    monthly_income: 60000,
    monthly_expenses: 35000,
    savings: 800000,
    existing_investments: 50000,
    monthly_emi: 5000,
  } as UserProfile,
  questionnaire: {
    investment_horizon: 8,
    investment_experience: 2,
    reaction_to_market_loss: 1,
    investment_frequency: InvestmentFrequency.QUARTERLY,
    liquidity_preference: LiquidityPreference.HIGH,
    investment_goal: InvestmentGoal.TAX_SAVING,
    risk_questionnaire_score: 30,
  } as Questionnaire,
};

/**
 * Scenario 3: Aggressive investor planning for retirement
 * Expected: NPS and Mutual Funds should score highest
 */
export const scenario3_RetirementPlanner = {
  name: "Aggressive Retirement Planner",
  riskProfile: RiskProfile.HIGH,
  profile: {
    age: 35,
    monthly_income: 100000,
    monthly_expenses: 50000,
    savings: 1000000,
    existing_investments: 300000,
    monthly_emi: 0,
  } as UserProfile,
  questionnaire: {
    investment_horizon: 30,
    investment_experience: 5,
    reaction_to_market_loss: 5,
    investment_frequency: InvestmentFrequency.MONTHLY,
    liquidity_preference: LiquidityPreference.LOW,
    investment_goal: InvestmentGoal.RETIREMENT,
    risk_questionnaire_score: 78,
  } as Questionnaire,
};

/**
 * Scenario 4: Emergency fund builder (low surplus, high EMI)
 * Expected: FD should score highest
 */
export const scenario4_EmergencyFundBuilder = {
  name: "Emergency Fund Builder (High Obligations)",
  riskProfile: RiskProfile.LOW,
  profile: {
    age: 32,
    monthly_income: 70000,
    monthly_expenses: 50000,
    savings: 150000,
    existing_investments: 20000,
    monthly_emi: 15000,
  } as UserProfile,
  questionnaire: {
    investment_horizon: 3,
    investment_experience: 1,
    reaction_to_market_loss: 2,
    investment_frequency: InvestmentFrequency.RARELY,
    liquidity_preference: LiquidityPreference.HIGH,
    investment_goal: InvestmentGoal.EMERGENCY_FUND,
    risk_questionnaire_score: 25,
  } as Questionnaire,
};

/**
 * Scenario 5: Tax-conscious investor with moderate surplus
 * Expected: PPF and NPS should score well
 */
export const scenario5_TaxPlanner = {
  name: "Tax-Conscious Investor",
  riskProfile: RiskProfile.MEDIUM,
  profile: {
    age: 40,
    monthly_income: 150000,
    monthly_expenses: 70000,
    savings: 900000,
    existing_investments: 400000,
    monthly_emi: 10000,
  } as UserProfile,
  questionnaire: {
    investment_horizon: 15,
    investment_experience: 4,
    reaction_to_market_loss: 3,
    investment_frequency: InvestmentFrequency.MONTHLY,
    liquidity_preference: LiquidityPreference.LOW,
    investment_goal: InvestmentGoal.TAX_SAVING,
    risk_questionnaire_score: 55,
  } as Questionnaire,
};

/**
 * Test runner to display recommendations for all scenarios
 */
export function runAllScenarios(): void {
  const scenarios = [
    scenario1_YoungProfessional,
    scenario2_ConservativeSaver,
    scenario3_RetirementPlanner,
    scenario4_EmergencyFundBuilder,
    scenario5_TaxPlanner,
  ];

  console.log("\n");
  console.log("=".repeat(80));
  console.log("RECOMMENDATION ENGINE TEST SCENARIOS");
  console.log("=".repeat(80));
  console.log("\n");

  scenarios.forEach((scenario, index) => {
    console.log(`\nScenario ${index + 1}: ${scenario.name}`);
    console.log("-".repeat(80));

    console.log("\nUser Profile:");
    console.log(`  Age: ${scenario.profile.age}`);
    console.log(`  Monthly Income: ₹${scenario.profile.monthly_income.toLocaleString()}`);
    console.log(`  Monthly Expenses: ₹${scenario.profile.monthly_expenses.toLocaleString()}`);
    console.log(`  Monthly Surplus: ₹${(scenario.profile.monthly_income - scenario.profile.monthly_expenses).toLocaleString()}`);
    console.log(`  Savings: ₹${scenario.profile.savings.toLocaleString()}`);
    console.log(`  Existing Investments: ₹${scenario.profile.existing_investments.toLocaleString()}`);
    console.log(`  Monthly EMI: ₹${scenario.profile.monthly_emi.toLocaleString()}`);

    console.log("\nQuestionnaire:");
    console.log(`  Risk Profile: ${scenario.riskProfile}`);
    console.log(`  Investment Horizon: ${scenario.questionnaire.investment_horizon} years`);
    console.log(`  Investment Experience: ${scenario.questionnaire.investment_experience}/5`);
    console.log(`  Reaction to Market Loss: ${scenario.questionnaire.reaction_to_market_loss}/5`);
    console.log(`  Investment Frequency: ${scenario.questionnaire.investment_frequency}`);
    console.log(`  Liquidity Preference: ${scenario.questionnaire.liquidity_preference}`);
    console.log(`  Investment Goal: ${scenario.questionnaire.investment_goal}`);

    const recommendation = engine.generateRecommendation(
      scenario.riskProfile,
      scenario.profile,
      scenario.questionnaire
    );

    console.log("\nRecommendation Results:");
    console.log(`  Top Recommendation: ${recommendation.topRecommendation}`);
    console.log(`  Rules Version: ${recommendation.rulesVersion}\n`);

    recommendation.products.forEach((product, idx) => {
      console.log(`  ${idx + 1}. ${product.product} - Score: ${product.score}/100`);
      product.reasons.forEach((reason) => {
        console.log(`     • ${reason}`);
      });
      console.log();
    });

    console.log("=".repeat(80));
  });
}

// Uncomment to run scenarios (or call this from a separate test runner):
// runAllScenarios();
