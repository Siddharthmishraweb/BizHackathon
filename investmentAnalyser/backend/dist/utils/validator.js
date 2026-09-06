"use strict";
/**
 * Request validation and error handling.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = exports.ValidationError = void 0;
const types_1 = require("../types");
class ValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.message = message;
    }
}
exports.ValidationError = ValidationError;
class Validator {
    /**
     * Validate an analysis request.
     */
    static validateAnalysisRequest(req) {
        if (typeof req !== "object" || req === null) {
            throw new ValidationError("INVALID_REQUEST", "Request body must be a JSON object");
        }
        const body = req;
        if (!body.profile || typeof body.profile !== "object") {
            throw new ValidationError("MISSING_PROFILE", "Missing required field: profile");
        }
        if (!body.questionnaire || typeof body.questionnaire !== "object") {
            throw new ValidationError("MISSING_QUESTIONNAIRE", "Missing required field: questionnaire");
        }
        const profile = this.validateProfile(body.profile);
        const questionnaire = this.validateQuestionnaire(body.questionnaire);
        return { profile, questionnaire };
    }
    static validateProfile(obj) {
        const errors = [];
        const age = this.validateNumber(obj.age, "age", 1, 120);
        if (age === null)
            errors.push("age must be a number between 1 and 120");
        const monthly_income = this.validateNumber(obj.monthly_income, "monthly_income", 0, Infinity);
        if (monthly_income === null)
            errors.push("monthly_income must be a positive number");
        const monthly_expenses = this.validateNumber(obj.monthly_expenses, "monthly_expenses", 0, Infinity);
        if (monthly_expenses === null)
            errors.push("monthly_expenses must be a non-negative number");
        const savings = this.validateNumber(obj.savings, "savings", 0, Infinity);
        if (savings === null)
            errors.push("savings must be a non-negative number");
        const existing_investments = this.validateNumber(obj.existing_investments, "existing_investments", 0, Infinity);
        if (existing_investments === null)
            errors.push("existing_investments must be a non-negative number");
        const monthly_emi = this.validateNumber(obj.monthly_emi, "monthly_emi", 0, Infinity);
        if (monthly_emi === null)
            errors.push("monthly_emi must be a non-negative number");
        if (errors.length > 0) {
            throw new ValidationError("INVALID_PROFILE", errors.join("; "));
        }
        return {
            age: age,
            monthly_income: monthly_income,
            monthly_expenses: monthly_expenses,
            savings: savings,
            existing_investments: existing_investments,
            monthly_emi: monthly_emi,
        };
    }
    static validateQuestionnaire(obj) {
        const errors = [];
        const investment_horizon = this.validateNumber(obj.investment_horizon, "investment_horizon", 1, 50);
        if (investment_horizon === null)
            errors.push("investment_horizon must be a number between 1 and 50 years");
        // Range must match the ML service's trained scale (1-5, not 0-5).
        const investment_experience = this.validateNumber(obj.investment_experience, "investment_experience", 1, 5);
        if (investment_experience === null)
            errors.push("investment_experience must be a number between 1 and 5");
        const reaction_to_market_loss = this.validateNumber(obj.reaction_to_market_loss, "reaction_to_market_loss", 1, 5);
        if (reaction_to_market_loss === null)
            errors.push("reaction_to_market_loss must be a number between 1 and 5");
        const investment_frequency = this.validateEnum(obj.investment_frequency, "investment_frequency", Object.values(types_1.InvestmentFrequency));
        if (!investment_frequency)
            errors.push(`investment_frequency must be one of: ${Object.values(types_1.InvestmentFrequency).join(", ")}`);
        const liquidity_preference = this.validateEnum(obj.liquidity_preference, "liquidity_preference", Object.values(types_1.LiquidityPreference));
        if (!liquidity_preference)
            errors.push(`liquidity_preference must be one of: ${Object.values(types_1.LiquidityPreference).join(", ")}`);
        const investment_goal = this.validateEnum(obj.investment_goal, "investment_goal", Object.values(types_1.InvestmentGoal));
        if (!investment_goal)
            errors.push(`investment_goal must be one of: ${Object.values(types_1.InvestmentGoal).join(", ")}`);
        if (errors.length > 0) {
            throw new ValidationError("INVALID_QUESTIONNAIRE", errors.join("; "));
        }
        return {
            investment_horizon: investment_horizon,
            investment_experience: investment_experience,
            reaction_to_market_loss: reaction_to_market_loss,
            investment_frequency: investment_frequency,
            liquidity_preference: liquidity_preference,
            investment_goal: investment_goal,
        };
    }
    /**
     * Validate create user request.
     */
    static validateCreateUserRequest(obj) {
        if (typeof obj !== "object" || obj === null) {
            throw new ValidationError("INVALID_REQUEST", "Request body must be a JSON object");
        }
        const body = obj;
        if (typeof body.name !== "string" || body.name.trim().length === 0) {
            throw new ValidationError("INVALID_NAME", "name must be a non-empty string");
        }
        if (typeof body.email !== "string" || !this.isValidEmail(body.email)) {
            throw new ValidationError("INVALID_EMAIL", "email must be a valid email address");
        }
        return {
            name: body.name.trim(),
            email: body.email.trim(),
        };
    }
    static validateNumber(value, fieldName, min, max) {
        if (typeof value !== "number" || isNaN(value)) {
            return null;
        }
        if (value < min || value > max) {
            return null;
        }
        return value;
    }
    static validateEnum(value, fieldName, validValues) {
        if (typeof value !== "string" || !validValues.includes(value)) {
            return null;
        }
        return value;
    }
    static isValidEmail(email) {
        // Simple email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}
exports.Validator = Validator;
