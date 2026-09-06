"use strict";
/**
 * CLI test runner for recommendation engine scenarios.
 *
 * Run with: ts-node src/cli/testEngine.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const testScenarios_1 = require("../utils/testScenarios");
console.log("Starting Recommendation Engine Tests...\n");
(0, testScenarios_1.runAllScenarios)();
console.log("\n✅ All scenarios completed.\n");
