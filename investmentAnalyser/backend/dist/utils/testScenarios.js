"use strict";
/**
 * Test scenarios for the recommendation engine.
 *
 * These test cases represent different user profiles and show how
 * the recommendation engine produces different recommendations based on
 * financial situation, risk profile, investment horizon, and goals.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scenario5_TaxPlanner = exports.scenario4_EmergencyFundBuilder = exports.scenario3_RetirementPlanner = exports.scenario2_ConservativeSaver = exports.scenario1_YoungProfessional = void 0;
exports.runAllScenarios = runAllScenarios;
const recommendationEngine_1 = require("../services/recommendationEngine");
const types_1 = require("../types");
const engine = new recommendationEngine_1.RecommendationEngine();
/**
 * Scenario 1: Young professional with high surplus and long horizon
 * Expected: Mutual Funds should score highest
 */
exports.scenario1_YoungProfessional = {
    name: "Young Professional (High Growth Potential)",
    riskProfile: types_1.RiskProfile.MEDIUM,
    profile: {
        age: 28,
        monthly_income: 120000,
        monthly_expenses: 40000,
        savings: 600000,
        existing_investments: 150000,
        monthly_emi: 0,
    },
    questionnaire: {
        investment_horizon: 25,
        investment_experience: 3,
        reaction_to_market_loss: 4,
        investment_frequency: types_1.InvestmentFrequency.MONTHLY,
        liquidity_preference: types_1.LiquidityPreference.MEDIUM,
        investment_goal: types_1.InvestmentGoal.WEALTH_CREATION,
        risk_questionnaire_score: 65,
    },
};
/**
 * Scenario 2: Conservative saver focused on security
 * Expected: PPF and FD should score highest
 */
exports.scenario2_ConservativeSaver = {
    name: "Conservative Saver (Capital Preservation)",
    riskProfile: types_1.RiskProfile.LOW,
    profile: {
        age: 45,
        monthly_income: 60000,
        monthly_expenses: 35000,
        savings: 800000,
        existing_investments: 50000,
        monthly_emi: 5000,
    },
    questionnaire: {
        investment_horizon: 8,
        investment_experience: 2,
        reaction_to_market_loss: 1,
        investment_frequency: types_1.InvestmentFrequency.QUARTERLY,
        liquidity_preference: types_1.LiquidityPreference.HIGH,
        investment_goal: types_1.InvestmentGoal.TAX_SAVING,
        risk_questionnaire_score: 30,
    },
};
/**
 * Scenario 3: Aggressive investor planning for retirement
 * Expected: NPS and Mutual Funds should score highest
 */
exports.scenario3_RetirementPlanner = {
    name: "Aggressive Retirement Planner",
    riskProfile: types_1.RiskProfile.HIGH,
    profile: {
        age: 35,
        monthly_income: 100000,
        monthly_expenses: 50000,
        savings: 1000000,
        existing_investments: 300000,
        monthly_emi: 0,
    },
    questionnaire: {
        investment_horizon: 30,
        investment_experience: 5,
        reaction_to_market_loss: 5,
        investment_frequency: types_1.InvestmentFrequency.MONTHLY,
        liquidity_preference: types_1.LiquidityPreference.LOW,
        investment_goal: types_1.InvestmentGoal.RETIREMENT,
        risk_questionnaire_score: 78,
    },
};
/**
 * Scenario 4: Emergency fund builder (low surplus, high EMI)
 * Expected: FD should score highest
 */
exports.scenario4_EmergencyFundBuilder = {
    name: "Emergency Fund Builder (High Obligations)",
    riskProfile: types_1.RiskProfile.LOW,
    profile: {
        age: 32,
        monthly_income: 70000,
        monthly_expenses: 50000,
        savings: 150000,
        existing_investments: 20000,
        monthly_emi: 15000,
    },
    questionnaire: {
        investment_horizon: 3,
        investment_experience: 1,
        reaction_to_market_loss: 2,
        investment_frequency: types_1.InvestmentFrequency.RARELY,
        liquidity_preference: types_1.LiquidityPreference.HIGH,
        investment_goal: types_1.InvestmentGoal.EMERGENCY_FUND,
        risk_questionnaire_score: 25,
    },
};
/**
 * Scenario 5: Tax-conscious investor with moderate surplus
 * Expected: PPF and NPS should score well
 */
exports.scenario5_TaxPlanner = {
    name: "Tax-Conscious Investor",
    riskProfile: types_1.RiskProfile.MEDIUM,
    profile: {
        age: 40,
        monthly_income: 150000,
        monthly_expenses: 70000,
        savings: 900000,
        existing_investments: 400000,
        monthly_emi: 10000,
    },
    questionnaire: {
        investment_horizon: 15,
        investment_experience: 4,
        reaction_to_market_loss: 3,
        investment_frequency: types_1.InvestmentFrequency.MONTHLY,
        liquidity_preference: types_1.LiquidityPreference.LOW,
        investment_goal: types_1.InvestmentGoal.TAX_SAVING,
        risk_questionnaire_score: 55,
    },
};
/**
 * Test runner to display recommendations for all scenarios
 */
function runAllScenarios() {
    const scenarios = [
        exports.scenario1_YoungProfessional,
        exports.scenario2_ConservativeSaver,
        exports.scenario3_RetirementPlanner,
        exports.scenario4_EmergencyFundBuilder,
        exports.scenario5_TaxPlanner,
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
        const recommendation = engine.generateRecommendation(scenario.riskProfile, scenario.profile, scenario.questionnaire);
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
