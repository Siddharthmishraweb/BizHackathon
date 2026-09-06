"use strict";
/**
 * Common types and enumerations used across the application.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = exports.InvestmentGoal = exports.LiquidityPreference = exports.InvestmentFrequency = exports.RiskProfile = void 0;
var RiskProfile;
(function (RiskProfile) {
    RiskProfile["LOW"] = "LOW";
    RiskProfile["MEDIUM"] = "MEDIUM";
    RiskProfile["HIGH"] = "HIGH";
})(RiskProfile || (exports.RiskProfile = RiskProfile = {}));
var InvestmentFrequency;
(function (InvestmentFrequency) {
    InvestmentFrequency["MONTHLY"] = "MONTHLY";
    InvestmentFrequency["QUARTERLY"] = "QUARTERLY";
    InvestmentFrequency["LUMP_SUM"] = "LUMP_SUM";
    InvestmentFrequency["RARELY"] = "RARELY";
})(InvestmentFrequency || (exports.InvestmentFrequency = InvestmentFrequency = {}));
var LiquidityPreference;
(function (LiquidityPreference) {
    LiquidityPreference["LOW"] = "LOW";
    LiquidityPreference["MEDIUM"] = "MEDIUM";
    LiquidityPreference["HIGH"] = "HIGH";
})(LiquidityPreference || (exports.LiquidityPreference = LiquidityPreference = {}));
var InvestmentGoal;
(function (InvestmentGoal) {
    InvestmentGoal["WEALTH_CREATION"] = "WEALTH_CREATION";
    InvestmentGoal["RETIREMENT"] = "RETIREMENT";
    InvestmentGoal["TAX_SAVING"] = "TAX_SAVING";
    InvestmentGoal["EMERGENCY_FUND"] = "EMERGENCY_FUND";
    InvestmentGoal["SHORT_TERM_GOAL"] = "SHORT_TERM_GOAL";
})(InvestmentGoal || (exports.InvestmentGoal = InvestmentGoal = {}));
var Product;
(function (Product) {
    Product["FD"] = "FD";
    Product["PPF"] = "PPF";
    Product["NPS"] = "NPS";
    Product["MUTUAL_FUND"] = "MUTUAL_FUND";
})(Product || (exports.Product = Product = {}));
