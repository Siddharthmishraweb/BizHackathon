// Derives a per-subscription cost breakdown from the engine's recurring-transaction
// detector (same arithmetic as ml/expense_analyzer.py SubscriptionAnalyzer.analyze_subscriptions).
import type { RecurringTransactionItem, SubscriptionItem } from '@/types';

export function deriveSubscriptions(recurring: RecurringTransactionItem[]): SubscriptionItem[] {
  return recurring
    .map((item) => {
      const monthly_cost = item.amount * (30 / item.frequency_days);
      return {
        description: item.description,
        monthly_cost,
        annual_cost: monthly_cost * 12,
        frequency_days: item.frequency_days,
        consistency: item.consistency,
        // consistency alone can never flag anything here (detect_recurring_transactions only
        // returns items with consistency >= 0.8) — Tier_D_Leakage is this app's own category
        // for forgotten subscriptions/unused memberships, so it's the real signal.
        potentially_unused: item.tier === 'Tier_D_Leakage' || item.consistency < 0.5,
      };
    })
    .sort((a, b) => b.annual_cost - a.annual_cost);
}
