// Financial Health Score — a single, transparent 0-100 composite so the breakdown is always
// shown alongside the number (no black-box score), computed entirely client-side from data
// already in the fetched ComprehensivePlan + UserData (no extra API calls).
import type { ComprehensivePlan, UserData } from '@/types';

export interface HealthScoreComponent {
  label: string;
  points: number;
  maxPoints: number;
  detail: string;
}

export interface HealthScoreResult {
  score: number;
  band: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  components: HealthScoreComponent[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeHealthScore(plan: ComprehensivePlan, userData: UserData): HealthScoreResult {
  const s = plan.situation_analysis;
  const monthlyIncome = s.income.monthly_income || 1;
  const annualIncome = monthlyIncome * 12;

  const surplusRatio = s.expenses.monthly_surplus / monthlyIncome;
  const surplusPoints = clamp(surplusRatio / 0.4, 0, 1) * 20;

  const emergencyRatio = s.emergency_fund.required > 0 ? s.emergency_fund.available / s.emergency_fund.required : 1;
  const emergencyPoints = clamp(emergencyRatio, 0, 1) * 20;

  const monthlyDebtPayments = userData.liabilities.reduce((sum, l) => sum + l.monthly_payment, 0);
  const debtRatio = monthlyDebtPayments / monthlyIncome;
  const debtPoints = clamp(1 - debtRatio / 0.5, 0, 1) * 20;

  const netWorthRatio = annualIncome > 0 ? s.financial_health.net_worth / annualIncome : 0;
  const netWorthPoints = s.financial_health.net_worth >= 0 ? 20 : clamp(1 + netWorthRatio, 0, 1) * 20;

  const goals = Object.values(plan.goal_analysis);
  const achievable = goals.filter((g) => g.feasibility_class === 'VERY_LIKELY' || g.feasibility_class === 'LIKELY').length;
  const goalPoints = goals.length > 0 ? (achievable / goals.length) * 20 : 20;

  const components: HealthScoreComponent[] = [
    {
      label: 'Savings Rate',
      points: Math.round(surplusPoints),
      maxPoints: 20,
      detail: `Saving ${(surplusRatio * 100).toFixed(0)}% of income`,
    },
    {
      label: 'Emergency Fund',
      points: Math.round(emergencyPoints),
      maxPoints: 20,
      detail: `${(emergencyRatio * 100).toFixed(0)}% of the recommended buffer`,
    },
    {
      label: 'Debt Load',
      points: Math.round(debtPoints),
      maxPoints: 20,
      detail: `${(debtRatio * 100).toFixed(0)}% of income goes to debt payments`,
    },
    {
      label: 'Net Worth',
      points: Math.round(netWorthPoints),
      maxPoints: 20,
      detail: s.financial_health.net_worth >= 0 ? 'Positive net worth' : 'Net worth is negative',
    },
    {
      label: 'Goal Readiness',
      points: Math.round(goalPoints),
      maxPoints: 20,
      detail: `${achievable} of ${goals.length} goals on track`,
    },
  ];

  const score = Math.round(components.reduce((sum, c) => sum + c.points, 0));
  const band: HealthScoreResult['band'] = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Attention';

  return { score, band, components };
}
