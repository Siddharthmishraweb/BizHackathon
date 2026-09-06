// Achievements/streaks computed from data already fetched (no server-side persistence
// exists in this stateless demo engine, so these are derived fresh from the current
// transaction history + plan each time rather than tracked across real sessions).
import type { ComprehensivePlan, UserData } from '@/types';

export interface Achievement {
  id: string;
  label: string;
  description: string;
  earned: boolean;
  icon: string;
}

export function computeAchievements(plan: ComprehensivePlan, userData: UserData): Achievement[] {
  const { situation_analysis: s, goal_analysis } = plan;
  const goals = Object.values(goal_analysis);

  const monthKey = (d: string) => d.slice(0, 7);
  const months = Array.from(new Set(userData.transactions.map((t) => monthKey(t.date)))).sort();
  const monthlyIncome = s.income.monthly_income;
  const positiveSurplusStreak =
    months.length >= 2 &&
    months.every((m) => {
      const spend = userData.transactions.filter((t) => monthKey(t.date) === m).reduce((sum, t) => sum + t.amount, 0);
      return monthlyIncome - spend > 0;
    });

  const leakagePct = s.expenses.spending_by_tier['Tier_D_Leakage']?.percentage ?? 0;
  const achievableCount = goals.filter((g) => g.feasibility_class === 'VERY_LIKELY' || g.feasibility_class === 'LIKELY').length;

  return [
    {
      id: 'positive_streak',
      label: `${months.length}-Month Positive Surplus Streak`,
      description: 'Every observed month ended with income greater than spending.',
      earned: positiveSurplusStreak,
      icon: '🔥',
    },
    {
      id: 'low_leakage',
      label: 'Leakage Under Control',
      description: 'Less than 5% of spending goes to leakage (Tier D).',
      earned: leakagePct < 5,
      icon: '🛡️',
    },
    {
      id: 'emergency_ready',
      label: 'Emergency Ready',
      description: 'Emergency fund meets the recommended buffer.',
      earned: s.emergency_fund.adequate,
      icon: '⛑️',
    },
    {
      id: 'goal_crusher',
      label: 'Goal Crusher',
      description: 'Every active goal is LIKELY or VERY LIKELY to succeed.',
      earned: goals.length > 0 && achievableCount === goals.length,
      icon: '🏆',
    },
    {
      id: 'goal_finisher',
      label: 'Goal Finisher',
      description: 'At least one goal has reached 100% of its target.',
      earned: goals.some((g) => g.goal.current_amount >= g.goal.target_amount),
      icon: '🎯',
    },
    {
      id: 'diversified_saver',
      label: 'Diversified Saver',
      description: 'Savings are spread across 3+ different asset types.',
      earned: new Set(userData.assets.map((a) => a.asset_type)).size >= 3,
      icon: '📊',
    },
  ];
}
