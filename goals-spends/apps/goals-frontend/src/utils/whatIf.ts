// Applies hypothetical "what if" deltas to a cloned UserData object so the What-If
// Playground can recompute a REAL plan via the actual ML engine (POST /analyze/comprehensive)
// instead of faking numbers client-side.
import type { UserData } from '@/types';

export interface WhatIfChanges {
  flexSpendPercent: number; // applied to Tier_C_Flexible / Tier_D_Leakage transactions
  newMonthlyExpense: number; // ₹/month, added as a new recurring Tier_A expense
  incomePercent: number; // applied to every income source
}

export const DEFAULT_WHAT_IF_CHANGES: WhatIfChanges = {
  flexSpendPercent: 0,
  newMonthlyExpense: 0,
  incomePercent: 0,
};

export function applyWhatIfScenario(base: UserData, changes: WhatIfChanges): UserData {
  const flexMultiplier = 1 + changes.flexSpendPercent / 100;
  const incomeMultiplier = 1 + changes.incomePercent / 100;

  const transactions = base.transactions.map((t) => {
    if (t.tier === 'Tier_C_Flexible' || t.tier === 'Tier_D_Leakage') {
      return { ...t, amount: Math.max(0, Math.round(t.amount * flexMultiplier)) };
    }
    return t;
  });

  if (changes.newMonthlyExpense > 0) {
    const months = Array.from(new Set(transactions.map((t) => t.date.slice(0, 7))));
    for (const month of months) {
      transactions.push({
        amount: changes.newMonthlyExpense,
        category: 'Tier_A_NonNegotiable',
        date: `${month}-05`,
        description: 'Hypothetical new monthly expense',
        tier: 'Tier_A_NonNegotiable',
        merchant: 'What-If Scenario',
      });
    }
  }

  const income_sources = base.income_sources.map((s) => ({
    ...s,
    amount: Math.max(0, Math.round(s.amount * incomeMultiplier)),
  }));

  return { ...base, transactions, income_sources };
}

export function hasWhatIfChanges(changes: WhatIfChanges): boolean {
  return changes.flexSpendPercent !== 0 || changes.newMonthlyExpense !== 0 || changes.incomePercent !== 0;
}
