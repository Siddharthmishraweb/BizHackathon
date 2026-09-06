import {
  loadCanonicalUserData,
  estimateMonthlyIncome,
  estimateMonthlySurplus,
  type CanonicalGoal,
} from './data/canonicalUser';
import { fetchGoalFeasibility } from './services/mlClient';

const canonical = loadCanonicalUserData();

const PRIORITY_LABEL: Record<number, string> = { 1: 'Critical', 2: 'High', 3: 'Medium', 4: 'Low' };
const CATEGORY_ICON: Record<string, string> = {
  emergency: '🛡️',
  house: '🏡',
  car: '🚗',
  education: '🎓',
  vacation: '✈️',
  custom: '🎯',
};
const CATEGORY_COLOR: Record<string, string> = {
  emergency: '#ef4444',
  house: '#6366f1',
  car: '#f59e0b',
  education: '#8b5cf6',
  vacation: '#06b6d4',
  custom: '#10b981',
};
const CATEGORY_EXPECTED_RETURN: Record<string, number> = {
  emergency: 6.5,
  house: 9,
  car: 7,
  education: 12,
  vacation: 7,
  custom: 11,
};

function monthsRemaining(deadlineIso: string): number {
  const deadline = new Date(deadlineIso);
  const now = new Date();
  const months = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());
  return Math.max(0, months);
}

export interface ApiGoal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  requiredMonthly: number;
  priority: string;
  category: string;
  progress: number;
  yearsLeft: number;
  expectedReturn: number;
  onTrack: boolean;
  color: string;
  feasibilityClass: string | null;
  successProbability: number | null;
  dataSource: 'ml-engine' | 'baseline-estimate';
}

/** Builds a goal using only arithmetic available locally — used until the ML engine enriches it. */
function baseGoalFromCanonical(g: CanonicalGoal, index: number, monthlySurplus: number): ApiGoal {
  const months = monthsRemaining(g.deadline);
  const progress = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
  const requiredMonthly = months > 0 ? Math.max(0, (g.target_amount - g.current_amount) / months) : 0;
  const onTrack = requiredMonthly <= Math.max(0, monthlySurplus);

  return {
    id: `g${String(index + 1).padStart(3, '0')}`,
    name: g.name,
    icon: CATEGORY_ICON[g.category] || '🎯',
    targetAmount: g.target_amount,
    currentAmount: g.current_amount,
    targetDate: g.deadline,
    monthlyContribution: Math.round(requiredMonthly * (onTrack ? 1 : 0.75)),
    requiredMonthly: Math.round(requiredMonthly),
    priority: PRIORITY_LABEL[g.priority] || 'Medium',
    category: g.category,
    progress: parseFloat(progress.toFixed(2)),
    yearsLeft: parseFloat((months / 12).toFixed(1)),
    expectedReturn: CATEGORY_EXPECTED_RETURN[g.category] ?? 8,
    onTrack,
    color: CATEGORY_COLOR[g.category] || '#6366f1',
    feasibilityClass: null,
    successProbability: null,
    dataSource: 'baseline-estimate',
  };
}

function buildBaselineGoals(): ApiGoal[] {
  const monthlySurplus = estimateMonthlySurplus(canonical);
  return canonical.goals.map((g, i) => baseGoalFromCanonical(g, i, monthlySurplus));
}

export const USER = {
  id: canonical.user_id,
  name: 'Arjun Sharma',
  email: canonical.email,
  phone: '+91-9876543210',
  age: 35,
  location: 'Bangalore, Karnataka',
  occupation: 'Senior Software Engineer',
  employer: 'Infosys Limited',
  annualCTC: Math.round(estimateMonthlyIncome(canonical) * 12),
  monthlyTakeHome: Math.round(estimateMonthlyIncome(canonical)),
  riskProfile: 'Moderate-Aggressive',
  investmentHorizon: '15-20 years',
  maritalStatus: 'Married',
  dependents: 2,
  panNumber: 'ABCDE1234F',
  aadhar: 'XXXX XXXX 1234',
  avatar: 'AS',
  joinedDate: '2024-01-15',
  kycStatus: 'Verified',
  goals: canonical.goals.map((g) => g.name),
};

/** Mutable cache so route handlers always read the latest goal data without blocking on network calls. */
export let GOALS: ApiGoal[] = buildBaselineGoals();
export let goalsDataSource: 'ml-engine' | 'baseline-estimate' = 'baseline-estimate';

/** Best-effort: ask the ML engine for real feasibility numbers and merge them in. No-op if it's unreachable. */
export async function refreshGoalsFromMlEngine(): Promise<void> {
  const mlFeasibility = await fetchGoalFeasibility(canonical);
  if (!mlFeasibility) return;

  GOALS = GOALS.map((goal) => {
    const f = mlFeasibility[goal.name];
    if (!f) return goal;
    const requiredMonthly = Math.round(f.required_monthly);
    const onTrack = f.success_probability >= 0.7;
    return {
      ...goal,
      requiredMonthly,
      monthlyContribution: Math.round(requiredMonthly * (onTrack ? 1 : 0.75)),
      onTrack,
      feasibilityClass: f.feasibility_class,
      successProbability: f.success_probability,
      dataSource: 'ml-engine',
    };
  });
  goalsDataSource = 'ml-engine';
}

export function findGoal(id: string): ApiGoal | undefined {
  return GOALS.find((g) => g.id === id);
}

export function applyContribution(id: string, amount: number): ApiGoal | undefined {
  const goal = findGoal(id);
  if (!goal) return undefined;
  goal.currentAmount += amount;
  goal.progress = parseFloat(((goal.currentAmount / goal.targetAmount) * 100).toFixed(2));
  return goal;
}
