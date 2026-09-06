import fs from 'fs';
import path from 'path';

/**
 * Single source of truth for the demo user's financial facts (income, assets,
 * liabilities, goals). This file lives in ml/samples/user_data.json and is read
 * directly by both this backend AND the ML engine (ml/api.py samples) and the
 * Goals app (apps/goals-frontend/src/data/profiles.ts mirrors it) — so the three
 * apps can never independently invent conflicting numbers for the same user.
 */

export interface CanonicalTransaction {
  amount: number;
  category: string;
  date: string;
  description: string;
  tier?: string;
  merchant?: string;
}

export interface CanonicalIncomeSource {
  name: string;
  amount: number;
  frequency: 'monthly' | 'annual' | string;
  variability: number;
  probability: number;
}

export interface CanonicalAsset {
  name: string;
  value: number;
  asset_type: string;
  liquidity: 'high' | 'medium' | 'low' | string;
  returns_percentage?: number;
}

export interface CanonicalLiability {
  name: string;
  current_balance: number;
  interest_rate: number;
  monthly_payment: number;
  remaining_months: number;
}

export interface CanonicalGoal {
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
  priority: number;
}

export interface CanonicalUserData {
  user_id: string;
  email: string;
  transactions: CanonicalTransaction[];
  income_sources: CanonicalIncomeSource[];
  assets: CanonicalAsset[];
  liabilities: CanonicalLiability[];
  goals: CanonicalGoal[];
}

const CANONICAL_DATA_PATH = path.resolve(__dirname, '../../../../ml/samples/user_data.json');

let cached: CanonicalUserData | null = null;

export function loadCanonicalUserData(): CanonicalUserData {
  if (!cached) {
    const raw = fs.readFileSync(CANONICAL_DATA_PATH, 'utf-8');
    cached = JSON.parse(raw) as CanonicalUserData;
  }
  return cached;
}

/** Total monthly income, prorating annual-frequency sources across 12 months. */
export function estimateMonthlyIncome(data: CanonicalUserData): number {
  return data.income_sources.reduce((sum, s) => {
    if (s.frequency === 'annual') return sum + s.amount / 12;
    return sum + s.amount;
  }, 0);
}

/** Rough monthly surplus used only as a fallback when the ML engine is unreachable.
 * Normalizes the transaction total by the actual date range spanned (NOT a flat sum),
 * since the canonical dataset now covers many months, not just one. */
export function estimateMonthlySurplus(data: CanonicalUserData): number {
  const income = estimateMonthlyIncome(data);
  const expenses = estimateMonthlyExpenses(data);
  return income - expenses;
}

/** Total transaction spend normalized to a per-month rate over the actual date range. */
export function estimateMonthlyExpenses(data: CanonicalUserData): number {
  if (data.transactions.length === 0) return 0;
  const total = data.transactions.reduce((sum, t) => sum + t.amount, 0);
  const dates = data.transactions.map((t) => new Date(t.date).getTime());
  const rangeDays = Math.max(1, (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24));
  return total / (rangeDays / 30);
}
