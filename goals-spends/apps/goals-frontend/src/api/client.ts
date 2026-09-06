import axios from 'axios';
import type {
  BillCreepItem,
  CategorizePrediction,
  ComprehensivePlan,
  ExpenseAnalysis,
  Goal,
  GoalAllocationResult,
  GoalFeasibilityResult,
  LifestyleInflationResult,
  MonteCarloResult,
  PaydaySpikeResult,
  PeerBenchmarkItem,
  Recommendation,
  SafetyCheckResult,
  Transaction,
  UserData,
} from '@/types';

export const ML_API_BASE_URL = (import.meta.env.VITE_ML_API_URL as string | undefined) || 'http://localhost:8000';

const client = axios.create({
  baseURL: ML_API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

export async function checkHealth(): Promise<boolean> {
  const res = await client.get('/health');
  return res.data?.status === 'healthy';
}

export async function fetchComprehensivePlan(userData: UserData): Promise<ComprehensivePlan> {
  const res = await client.post('/api/v1/analyze/comprehensive', userData);
  return res.data.plan as ComprehensivePlan;
}

export async function fetchGoalFeasibility(goal: Goal, monthlySurplus: number): Promise<GoalFeasibilityResult> {
  const res = await client.post('/api/v1/goal/feasibility', goal, {
    params: { monthly_surplus: monthlySurplus },
  });
  return res.data.feasibility as GoalFeasibilityResult;
}

export async function runMonteCarloSimulation(params: {
  currentAmount: number;
  monthlyContribution: number;
  targetAmount: number;
  months: number;
  iterations?: number;
  // When available, pass the real user's own income/expense volatility and emergency fund
  // target (derived from their situation_analysis) instead of relying on the endpoint's
  // generic defaults — keeps the simulation grounded in that person's real data.
  incomeVolatility?: number;
  expenseVolatility?: number;
  emergencyFundRequirement?: number;
}): Promise<MonteCarloResult> {
  const res = await client.post('/api/v1/simulation/monte-carlo', null, {
    params: {
      current_amount: params.currentAmount,
      monthly_contribution: params.monthlyContribution,
      target_amount: params.targetAmount,
      months: params.months,
      iterations: params.iterations ?? 1000,
      ...(params.incomeVolatility !== undefined && { income_volatility: params.incomeVolatility }),
      ...(params.expenseVolatility !== undefined && { expense_volatility: params.expenseVolatility }),
      ...(params.emergencyFundRequirement !== undefined && { emergency_fund_requirement: params.emergencyFundRequirement }),
    },
  });
  return res.data.simulation as MonteCarloResult;
}

export async function fetchExpenseAnalysis(transactions: Transaction[]): Promise<ExpenseAnalysis> {
  const res = await client.post('/api/v1/expense/analyze', transactions);
  return res.data.analysis as ExpenseAnalysis;
}

export async function fetchPaydaySpikes(transactions: Transaction[], paydayDay = 1): Promise<PaydaySpikeResult> {
  const res = await client.post('/api/v1/insights/payday-spikes', transactions, { params: { payday_day: paydayDay } });
  return { typical_7day_spending: res.data.typical_7day_spending, triggers: res.data.triggers } as PaydaySpikeResult;
}

export async function fetchLifestyleInflation(transactions: Transaction[]): Promise<LifestyleInflationResult> {
  const res = await client.post('/api/v1/insights/lifestyle-inflation', transactions);
  return res.data.analysis as LifestyleInflationResult;
}

export async function fetchBillCreep(transactions: Transaction[]): Promise<BillCreepItem[]> {
  const res = await client.post('/api/v1/insights/bill-creep', transactions);
  return res.data.creeping_bills as BillCreepItem[];
}

export async function fetchPeerBenchmark(transactions: Transaction[], monthlyIncome: number): Promise<PeerBenchmarkItem[]> {
  const res = await client.post('/api/v1/insights/peer-benchmark', transactions, { params: { monthly_income: monthlyIncome } });
  return res.data.benchmark as PeerBenchmarkItem[];
}

export async function categorizeExpense(
  historicalTransactions: Transaction[],
  newTransaction: { amount: number; description: string; merchant?: string; date?: string }
): Promise<CategorizePrediction> {
  const res = await client.post('/api/v1/expense/categorize', {
    historical_transactions: historicalTransactions,
    new_transaction: newTransaction,
  });
  return res.data.prediction as CategorizePrediction;
}

export async function optimizeGoalAllocation(goals: Goal[], monthlySurplus: number): Promise<GoalAllocationResult> {
  const res = await client.post('/api/v1/goals/optimize-allocation', goals, { params: { monthly_surplus: monthlySurplus } });
  return res.data.allocation as GoalAllocationResult;
}

export async function validateRecommendationSafety(
  userData: UserData,
  recommendation: Recommendation
): Promise<SafetyCheckResult> {
  const res = await client.post('/api/v1/recommendation/validate', { user_data: userData, recommendation });
  return res.data.safety as SafetyCheckResult;
}

export interface RecommendationExplanation {
  what: string;
  why: string;
  how_much: string;
  what_will_change: string;
  risks: string[];
  alternatives: { title: string; description: string; pros: string; cons: string }[];
}

export async function explainRecommendation(recommendation: Recommendation): Promise<RecommendationExplanation> {
  const res = await client.get(`/api/v1/recommendations/${encodeURIComponent(recommendation.id)}/explain`, {
    params: { rec_data: JSON.stringify(recommendation) },
  });
  return res.data.explanation as RecommendationExplanation;
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
    if (error.code === 'ECONNABORTED') return 'The request timed out. Is the ML engine still starting up?';
    if (!error.response) return `Cannot reach the ML API at ${ML_API_BASE_URL}. Is start_ml_engine.sh running?`;
    return error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}
