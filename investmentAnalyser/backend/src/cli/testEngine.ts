/**
 * CLI test runner for recommendation engine scenarios.
 *
 * Run with: ts-node src/cli/testEngine.ts
 */

import { runAllScenarios } from "../utils/testScenarios";

console.log("Starting Recommendation Engine Tests...\n");
runAllScenarios();
console.log("\n✅ All scenarios completed.\n");
