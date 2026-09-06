// Types mirroring the Goal Achievement Intelligence Engine (ml/api.py) request/response shapes.

export interface Transaction {
  amount: number;
  category: string;
  date: string;
  description: string;
  tier?: string;
  merchant?: string;
}

export interface IncomeSource {
  name: string;
  amount: number;
  frequency: string;
  variability: number;
  probability: number;
}

export interface Asset {
  name: string;
  value: number;
  asset_type: string;
  liquidity: string;
  returns_percentage?: number | null;
}

export interface Liability {
  name: string;
  current_balance: number;
  interest_rate: number;
  monthly_payment: number;
  remaining_months: number;
}

export interface Goal {
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
  priority: number;
}

export interface UserData {
  user_id: string;
  email: string;
  transactions: Transaction[];
  income_sources: IncomeSource[];
  assets: Asset[];
  liabilities: Liability[];
  goals: Goal[];
}

export interface TierBreakdown {
  total: number;
  count: number;
  average: number;
  percentage: number;
}

export interface LeakageItem {
  description: string;
  individual_amount: number;
  monthly_cost: number;
  annual_cost: number;
  frequency_days: number | string;
  impact_percentage: number;
}

export interface AnomalyItem {
  date: string;
  amount: number;
  category: string;
  description: string;
  z_score: number;
}

export interface SituationAnalysis {
  timestamp: string;
  financial_health: {
    net_worth: number;
    total_assets: number;
    total_liabilities: number;
    liquid_assets: number;
  };
  income: {
    monthly_income: number;
    monthly_income_stability: number;
    income_sources_count: number;
  };
  expenses: {
    monthly_spending: number;
    monthly_surplus: number;
    spending_by_tier: Record<string, TierBreakdown>;
    data_quality_confidence: number;
  };
  behavioral: {
    spending_persona: string;
    spending_consistency: number;
    flex_spending_percentage: number;
  };
  subscriptions: {
    total_count: number;
    total_monthly_cost: number;
    total_annual_cost: number;
    potentially_unused_count: number;
    potential_savings_annual: number;
  };
  leakage: {
    identified_items: LeakageItem[];
    total_monthly_leakage: number;
  };
  emergency_fund: {
    required: number;
    available: number;
    adequate: boolean;
    status: string;
  };
  anomalies: {
    transaction_anomalies: number;
    top_anomalies: AnomalyItem[];
  };
}

export interface RecoveryPlanItem {
  strategy: string;
  description: string;
  new_target?: number;
  new_gap?: number;
  new_deadline?: string;
  required_monthly?: number;
  monthly_increase?: number;
  timeline_months?: number;
  feasibility?: string;
  impact: string;
}

export interface GoalAnalysisEntry {
  goal: Goal;
  feasibility_class: string;
  success_probability: number;
  required_monthly: number;
  available_monthly: number;
  risk_classification: string;
  recovery_plan: RecoveryPlanItem[];
}

export interface SavingsTrajectoryPoint {
  month: number;
  income: number;
  expenses: number;
  surplus: number;
  investment_gain: number;
  cumulative_savings: number;
}

export interface CashflowForecast {
  forecast_period_months: number;
  income_forecast: {
    total_monthly_income: number;
    monthly_forecast: { month: number; forecasted_income: number }[];
    average_confidence: number;
    months_forecasted: number;
  };
  total_expense_forecast: {
    forecast: { month: string; projected_spending: number }[];
    trend: string;
    confidence: number;
  };
  savings_forecast: {
    current_savings: number;
    projected_savings: number;
    monthly_trajectory: SavingsTrajectoryPoint[];
    total_savings_increase: number;
    trend: string;
    average_monthly_surplus: number;
  };
  summary: {
    total_forecasted_income: number;
    total_forecasted_expenses: number;
    total_forecasted_surplus: number;
    final_projected_savings: number;
    average_monthly_saving: number;
  };
  confidence: number;
}

export interface ScenarioPoint {
  month: number;
  savings: number;
}

export interface ScenarioForecast {
  scenarios: {
    optimistic: ScenarioPoint[];
    expected: ScenarioPoint[];
    pessimistic: ScenarioPoint[];
  };
  expected_final: number;
  optimistic_final: number;
  pessimistic_final: number;
}

export interface Recommendation {
  id: string;
  title: string;
  category: string;
  description: string;
  action: string;
  impact_type: string;
  estimated_impact: number;
  annual_impact?: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  implementation_difficulty: 'EASY' | 'MEDIUM' | 'HARD' | string;
  timeline: string;
  confidence: number;
  leakage_items?: LeakageItem[];
  goal_data?: Record<string, unknown>;
}

export interface ActionItem {
  title: string;
  description: string;
  expected_impact: number;
  difficulty: string;
  confidence: number;
}

export interface ActionPlan {
  strategy: string;
  today: ActionItem[];
  this_week: ActionItem[];
  this_month: ActionItem[];
  ongoing: ActionItem[];
  summary: {
    total_actions: number;
    estimated_monthly_impact: number;
    estimated_annual_impact: number;
    primary_focus: string;
  };
}

export interface ComprehensivePlan {
  generated_at: string;
  situation_analysis: SituationAnalysis;
  goal_analysis: Record<string, GoalAnalysisEntry>;
  cashflow_forecast: CashflowForecast;
  scenario_forecast: ScenarioForecast;
  recommendations: Recommendation[];
  action_plan: ActionPlan;
  key_insights: string[];
  next_steps: string[];
}

export interface MonteCarloResult {
  success_probability: number;
  total_iterations: number;
  successes: number;
  expected_final_value: number;
  percentile_10: number;
  percentile_50: number;
  percentile_90: number;
  average_months_to_success: number;
  min_months_to_success: number;
  max_months_to_success: number;
  emergency_fund_violations: number;
  emergency_fund_safety: number;
  risk_classification: string;
}

export interface GoalFeasibilityResult {
  feasible: boolean;
  feasibility_class: string;
  success_probability: number;
  confidence: number;
  months_remaining: number;
  target_amount: number;
  current_amount: number;
  funding_gap: number;
  required_monthly: number;
  available_monthly: number;
  available_assets: number;
}

// ==================== New Insights / ML features ====================

export interface MerchantBreakdown {
  sum: number;
  count: number;
  mean: number;
}

export interface TemporalPatterns {
  by_day_of_week: Record<string, number>;
  by_week_of_year: Record<string, number>;
  by_day_of_month: Record<string, number>;
  weekend_spending: number;
  weekday_spending: number;
}

export interface RecurringTransactionItem {
  amount: number;
  description: string;
  frequency_days: number;
  count: number;
  consistency: number;
  tier?: string | null;
}

export interface ExpenseAnalysis {
  total_transactions: number;
  total_spending: number;
  average_transaction: number;
  median_transaction: number;
  max_transaction: number;
  min_transaction: number;
  std_transaction: number;
  daily_average: number;
  monthly_average: number;
  spending_by_tier: Record<string, TierBreakdown>;
  spending_by_category: Record<string, TierBreakdown>;
  spending_by_merchant: Record<string, MerchantBreakdown>;
  temporal_patterns: TemporalPatterns;
  recurring_transactions: RecurringTransactionItem[];
  anomalies: AnomalyItem[];
  leakage_opportunities: LeakageItem[];
  data_quality_confidence: number;
}

export interface SubscriptionItem {
  description: string;
  monthly_cost: number;
  annual_cost: number;
  frequency_days: number;
  consistency: number;
  potentially_unused: boolean;
}

export interface TriggerStats {
  average_spending: number;
  max_spending: number;
  min_spending: number;
  std_spending: number;
  occurrences: number;
}

export interface PaydaySpikeResult {
  typical_7day_spending: number;
  triggers: Record<string, TriggerStats>;
}

export interface LifestyleInflationResult {
  detected: boolean;
  inflation_percentage: number;
  monthly_before?: number;
  monthly_after?: number;
  absolute_increase?: number;
  reason?: string;
}

export interface BillCreepItem {
  description: string;
  merchant: string | null;
  first_amount: number;
  latest_amount: number;
  increase_percentage: number;
  monthly_impact: number;
  annual_impact: number;
  occurrences: number;
}

export interface PeerBenchmarkItem {
  tier: string;
  actual_percentage: number;
  reference_percentage: number;
  percentile_vs_reference: number;
  status: 'above_typical' | 'below_typical' | 'typical';
}

export interface CategorizePrediction {
  predicted_tier: string;
  tier_confidence: number;
  predicted_category: string;
  category_confidence: number;
  method: 'random_forest' | 'heuristic_fallback';
  trained_on_transactions: number;
}

export interface GoalAllocationItem {
  name: string;
  priority: number;
  months_remaining: number;
  required_monthly: number;
  allocated_monthly: number;
  fully_funded: boolean;
  naive_feasibility_class: string;
  allocated_feasibility_class: string;
  allocated_success_probability: number;
}

export interface GoalAllocationResult {
  total_monthly_surplus: number;
  total_required_monthly: number;
  unallocated_surplus: number;
  fully_covered: boolean;
  allocations: GoalAllocationItem[];
}

export interface SafetyCheckResult {
  is_safe: boolean;
  safety_checks: Record<string, boolean>;
  safety_concerns: string[];
  safety_score: number;
}
