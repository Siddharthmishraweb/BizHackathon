// All shared TypeScript types for the application

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  location: string;
  occupation: string;
  employer: string;
  annualCTC: number;
  monthlyTakeHome: number;
  riskProfile: string;
  investmentHorizon: string;
  maritalStatus: string;
  dependents: number;
  panNumber: string;
  aadhar?: string;
  avatar: string;
  joinedDate: string;
  kycStatus: string;
  goals: string[];
}

export interface NetWorthPoint {
  month: string;
  netWorth: number;
  assets: number;
  liabilities: number;
}

export interface CashFlowPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  invested: number;
}

export interface AllocationItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface StockHolding {
  symbol: string;
  name: string;
  qty: number;
  avgPrice: number;
  cmp: number;
  value: number;
  gain: number;
  gainPct: number;
  sector: string;
  type: string;
}

export interface MFHolding {
  name: string;
  folio: string;
  units: number;
  nav: number;
  value: number;
  invested: number;
  gain: number;
  gainPct: number;
  category: string;
  risk: string;
  sipAmount: number;
}

export interface FixedIncomeHolding {
  name: string;
  institution: string;
  type: string;
  invested: number;
  currentValue: number;
  maturityDate?: string;
  interestRate?: number;
  tenure?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  merchant: string;
  mode: string;
}

export interface Goal {
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
}

export interface HealthDimension {
  name: string;
  score: number;
  description: string;
  color: string;
}

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'alert' | 'recommendation' | 'success';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  saving?: number;
  overspend?: number;
  shortfall?: number;
}

export interface MarketItem {
  name: string;
  value: number;
  change: number;
  changePct: number;
  trend: 'up' | 'down';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface TaxDeduction {
  limit: number;
  utilized: number;
  remaining: number;
  breakdown: Array<{ name: string; amount: number }>;
}

export interface InvestmentRecommendation {
  id: string;
  type: string;
  name: string;
  rating?: number;
  category?: string;
  returns?: { '1y': number; '3y': number; '5y': number };
  risk: string;
  reason: string;
  tag: string;
  minSIP?: number;
  upside?: number;
  couponRate?: number;
}
