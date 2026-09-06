import type { Transaction, UserData } from '@/types';

export interface DemoProfile {
  id: string;
  name: string;
  title: string;
  personaLabel: string;
  avatarInitials: string;
  data: UserData;
}

// 12 months of history (slight month-over-month variance) ending in the current month —
// matches ml/samples/user_data.json's date range and gives the ML engine's trend
// forecaster, behavioral analyzer and anomaly detector substantially more signal to
// work with than a single/few sparse months.
const MONTHS = [
  '2025-09', '2025-10', '2025-11', '2025-12',
  '2026-01', '2026-02', '2026-03', '2026-04',
  '2026-05', '2026-06', '2026-07', '2026-08',
];
const MONTH_VARIANCE = [0.91, 0.93, 0.95, 0.97, 0.94, 0.99, 0.96, 1.02, 0.98, 1.01, 0.97, 1.0];

type BaseTxn = Omit<Transaction, 'date'> & { day: number };

/**
 * variableBase: recurring bills/spending whose amount drifts slightly month to month
 * (so it's NOT detected as a fixed "subscription" by the ML engine).
 * fixedSubs: genuine subscriptions — same exact amount every month, so the engine's
 * recurring-transaction detector correctly flags them.
 */
function buildTransactions(variableBase: BaseTxn[], fixedSubs: BaseTxn[] = []): Transaction[] {
  return MONTHS.flatMap((month, i) => [
    ...variableBase.map(({ day, amount, ...rest }) => ({
      ...rest,
      amount: Math.round(amount * MONTH_VARIANCE[i]),
      date: `${month}-${String(day).padStart(2, '0')}`,
    })),
    ...fixedSubs.map(({ day, ...rest }) => ({
      ...rest,
      date: `${month}-${String(day).padStart(2, '0')}`,
    })),
  ]);
}

// ==================== Arjun Sharma — Balanced ====================
const arjun: UserData = {
  user_id: 'usr_10234',
  email: 'arjun.sharma@gmail.com',
  transactions: buildTransactions([
    { day: 1, amount: 42000, category: 'Tier_A_NonNegotiable', description: 'Home loan EMI', tier: 'Tier_A_NonNegotiable', merchant: 'HDFC Bank' },
    { day: 3, amount: 8500, category: 'Tier_A_NonNegotiable', description: 'LIC premium payment', tier: 'Tier_A_NonNegotiable', merchant: 'LIC of India' },
    { day: 5, amount: 2400, category: 'Tier_A_NonNegotiable', description: 'Water and maintenance charges', tier: 'Tier_A_NonNegotiable', merchant: 'Prestige Society' },
    { day: 6, amount: 5200, category: 'Tier_B_Optimizable', description: 'Monthly grocery shopping', tier: 'Tier_B_Optimizable', merchant: 'BigBasket' },
    { day: 2, amount: 1200, category: 'Tier_B_Optimizable', description: 'Broadband internet bill', tier: 'Tier_B_Optimizable', merchant: 'ACT Fibernet' },
    { day: 8, amount: 2100, category: 'Tier_B_Optimizable', description: 'Electricity bill', tier: 'Tier_B_Optimizable', merchant: 'BESCOM' },
    { day: 10, amount: 3000, category: 'Tier_B_Optimizable', description: 'Fuel and cab rides', tier: 'Tier_B_Optimizable', merchant: 'Uber' },
    { day: 12, amount: 2800, category: 'Tier_C_Flexible', description: 'Dinner with friends', tier: 'Tier_C_Flexible', merchant: 'Barbeque Nation' },
    { day: 14, amount: 6500, category: 'Tier_C_Flexible', description: 'Clothing purchase', tier: 'Tier_C_Flexible', merchant: 'Myntra' },
    { day: 1, amount: 1499, category: 'Tier_C_Flexible', description: 'OTT subscription bundle', tier: 'Tier_C_Flexible', merchant: 'Netflix' },
    { day: 1, amount: 499, category: 'Tier_D_Leakage', description: 'Unused fitness app subscription', tier: 'Tier_D_Leakage', merchant: 'Cult.fit' },
    { day: 16, amount: 2200, category: 'Tier_D_Leakage', description: 'Impulse electronics purchase', tier: 'Tier_D_Leakage', merchant: 'Amazon' },
  ]),
  income_sources: [
    { name: 'Monthly Salary', amount: 145000, frequency: 'monthly', variability: 0.03, probability: 0.98 },
    { name: 'Annual Performance Bonus', amount: 180000, frequency: 'annual', variability: 0.3, probability: 0.7 },
    { name: 'Freelance Consulting', amount: 15000, frequency: 'monthly', variability: 0.4, probability: 0.6 },
  ],
  assets: [
    { name: 'HDFC Savings Account', value: 320000, asset_type: 'savings', liquidity: 'high', returns_percentage: 3.5 },
    { name: 'SBI Fixed Deposit', value: 500000, asset_type: 'fd', liquidity: 'medium', returns_percentage: 6.75 },
    { name: 'Equity Mutual Funds (SIP)', value: 780000, asset_type: 'mutual_fund', liquidity: 'medium', returns_percentage: 12.5 },
    { name: 'Direct Equity Portfolio', value: 450000, asset_type: 'stock', liquidity: 'high', returns_percentage: 15.0 },
    { name: 'EPF Balance', value: 610000, asset_type: 'epf', liquidity: 'low', returns_percentage: 8.15 },
  ],
  liabilities: [
    { name: 'Home Loan - HDFC Bank', current_balance: 5800000, interest_rate: 8.5, monthly_payment: 42000, remaining_months: 204 },
    { name: 'Car Loan - ICICI Bank', current_balance: 420000, interest_rate: 9.25, monthly_payment: 14500, remaining_months: 32 },
    { name: 'Credit Card Outstanding', current_balance: 65000, interest_rate: 36.0, monthly_payment: 15000, remaining_months: 5 },
  ],
  goals: [
    { name: 'Emergency Fund', target_amount: 900000, current_amount: 320000, deadline: '2027-08-24', category: 'emergency', priority: 1 },
    { name: 'Buy a House', target_amount: 12000000, current_amount: 1800000, deadline: '2031-08-24', category: 'house', priority: 2 },
    { name: 'Buy a Car', target_amount: 1500000, current_amount: 300000, deadline: '2028-02-24', category: 'car', priority: 3 },
    { name: 'Child Education Fund', target_amount: 3500000, current_amount: 450000, deadline: '2036-06-01', category: 'education', priority: 1 },
    { name: 'Family Vacation to Europe', target_amount: 400000, current_amount: 80000, deadline: '2027-03-01', category: 'vacation', priority: 4 },
  ],
};

// ==================== Priya Malhotra — Impulsive (many subscriptions + erratic dining/shopping) ====================
const priya: UserData = {
  user_id: 'usr_20441',
  email: 'priya.malhotra@gmail.com',
  transactions: [
    ...buildTransactions(
      [
        { day: 1, amount: 25000, category: 'Tier_A_NonNegotiable', description: 'Apartment rent', tier: 'Tier_A_NonNegotiable', merchant: 'Landlord' },
        { day: 5, amount: 8000, category: 'Tier_B_Optimizable', description: 'Groceries & essentials', tier: 'Tier_B_Optimizable', merchant: 'Zepto' },
        { day: 7, amount: 9500, category: 'Tier_C_Flexible', description: 'Weekend brunch & cafe hopping', tier: 'Tier_C_Flexible', merchant: 'Zomato' },
        { day: 10, amount: 11000, category: 'Tier_C_Flexible', description: 'Fine dining with friends', tier: 'Tier_C_Flexible', merchant: 'Barbeque Nation' },
        { day: 13, amount: 8500, category: 'Tier_C_Flexible', description: 'Spa & salon', tier: 'Tier_C_Flexible', merchant: 'Lakme Salon' },
        { day: 16, amount: 12500, category: 'Tier_C_Flexible', description: 'Designer clothing haul', tier: 'Tier_C_Flexible', merchant: 'Zara' },
        { day: 19, amount: 7000, category: 'Tier_C_Flexible', description: 'Concert & movie tickets', tier: 'Tier_C_Flexible', merchant: 'BookMyShow' },
        { day: 22, amount: 6500, category: 'Tier_C_Flexible', description: 'Weekend getaway', tier: 'Tier_C_Flexible', merchant: 'MakeMyTrip' },
      ],
      [
        // A realistic mix: some subscriptions she actually uses (Tier_C) vs. genuinely
        // forgotten ones (Tier_D_Leakage) — not every recurring payment is "leakage".
        { day: 1, amount: 649, category: 'Tier_C_Flexible', description: 'Netflix subscription', tier: 'Tier_C_Flexible', merchant: 'Netflix' },
        { day: 1, amount: 1499, category: 'Tier_C_Flexible', description: 'Amazon Prime subscription', tier: 'Tier_C_Flexible', merchant: 'Amazon' },
        { day: 1, amount: 2999, category: 'Tier_D_Leakage', description: 'Premium gym membership (rarely visited)', tier: 'Tier_D_Leakage', merchant: 'Cult.fit' },
        { day: 1, amount: 199, category: 'Tier_C_Flexible', description: 'Spotify subscription', tier: 'Tier_C_Flexible', merchant: 'Spotify' },
        { day: 1, amount: 899, category: 'Tier_D_Leakage', description: 'Disney+ Hotstar subscription (forgotten free-trial signup)', tier: 'Tier_D_Leakage', merchant: 'Hotstar' },
      ]
    ),
    // One-off impulse splurges — genuine statistical outliers vs. her own regular spending in the
    // same tier (unlike the templated items above, these deliberately do NOT repeat every month),
    // so the ML engine's z-score anomaly detector surfaces them under "Unusual Transactions".
    { amount: 32000, category: 'Tier_C_Flexible', date: '2025-12-20', description: 'Impulse designer handbag splurge', tier: 'Tier_C_Flexible', merchant: 'Louis Vuitton' },
    { amount: 9500, category: 'Tier_D_Leakage', date: '2026-03-14', description: 'Limited-edition sneaker drop (impulse buy)', tier: 'Tier_D_Leakage', merchant: 'StockX' },
  ],
  income_sources: [
    { name: 'Monthly Salary', amount: 95000, frequency: 'monthly', variability: 0.05, probability: 0.95 },
    { name: 'Freelance Content Gigs', amount: 8000, frequency: 'monthly', variability: 0.6, probability: 0.4 },
  ],
  assets: [{ name: 'Savings Account', value: 45000, asset_type: 'savings', liquidity: 'high', returns_percentage: 3.0 }],
  liabilities: [
    { name: 'Credit Card Outstanding', current_balance: 85000, interest_rate: 39.0, monthly_payment: 8000, remaining_months: 12 },
  ],
  goals: [
    { name: 'Emergency Fund', target_amount: 300000, current_amount: 45000, deadline: '2027-08-24', category: 'emergency', priority: 1 },
    { name: 'Europe Trip', target_amount: 350000, current_amount: 20000, deadline: '2027-06-01', category: 'vacation', priority: 2 },
  ],
};

// ==================== Karan Kapoor — Lifestyle Focused (fewer, bigger-ticket luxury spends) ====================
const karan: UserData = {
  user_id: 'usr_30552',
  email: 'karan.kapoor@gmail.com',
  transactions: buildTransactions(
    [
      { day: 1, amount: 30000, category: 'Tier_A_NonNegotiable', description: 'Apartment rent', tier: 'Tier_A_NonNegotiable', merchant: 'Landlord' },
      { day: 5, amount: 9000, category: 'Tier_B_Optimizable', description: 'Groceries & essentials', tier: 'Tier_B_Optimizable', merchant: 'BigBasket' },
      { day: 8, amount: 14000, category: 'Tier_C_Flexible', description: 'Fine dining & wine', tier: 'Tier_C_Flexible', merchant: 'Taj Restaurants' },
      { day: 14, amount: 18000, category: 'Tier_C_Flexible', description: 'Designer shopping', tier: 'Tier_C_Flexible', merchant: 'DLF Emporio' },
      { day: 20, amount: 16000, category: 'Tier_C_Flexible', description: 'Business class weekend trip', tier: 'Tier_C_Flexible', merchant: 'MakeMyTrip' },
    ],
    [{ day: 1, amount: 12000, category: 'Tier_C_Flexible', description: 'Golf club membership', tier: 'Tier_C_Flexible', merchant: 'DLF Golf Club' }]
  ),
  income_sources: [
    { name: 'Monthly Salary', amount: 280000, frequency: 'monthly', variability: 0.02, probability: 0.98 },
    { name: 'Annual Performance Bonus', amount: 800000, frequency: 'annual', variability: 0.25, probability: 0.85 },
  ],
  assets: [
    { name: 'Savings Account', value: 600000, asset_type: 'savings', liquidity: 'high', returns_percentage: 3.5 },
    { name: 'Equity Mutual Funds', value: 900000, asset_type: 'mutual_fund', liquidity: 'medium', returns_percentage: 12.0 },
    { name: 'Stock Portfolio', value: 500000, asset_type: 'stock', liquidity: 'high', returns_percentage: 14.0 },
  ],
  liabilities: [
    { name: 'Premium Car Loan', current_balance: 1200000, interest_rate: 9.0, monthly_payment: 35000, remaining_months: 40 },
  ],
  goals: [
    { name: 'Luxury Apartment Down Payment', target_amount: 5000000, current_amount: 900000, deadline: '2029-08-24', category: 'house', priority: 1 },
    { name: 'Family Vacation to Maldives', target_amount: 600000, current_amount: 150000, deadline: '2027-01-01', category: 'vacation', priority: 3 },
  ],
};

// ==================== Vikram Nair — Disciplined (tight, consistent spend, minimal flex) ====================
const vikram: UserData = {
  user_id: 'usr_40663',
  email: 'vikram.nair@gmail.com',
  transactions: buildTransactions([
    { day: 1, amount: 13500, category: 'Tier_A_NonNegotiable', description: 'Home loan EMI', tier: 'Tier_A_NonNegotiable', merchant: 'SBI' },
    { day: 3, amount: 12800, category: 'Tier_A_NonNegotiable', description: 'Health insurance premium', tier: 'Tier_A_NonNegotiable', merchant: 'HDFC ERGO' },
    { day: 5, amount: 13200, category: 'Tier_B_Optimizable', description: 'Groceries & household', tier: 'Tier_B_Optimizable', merchant: 'BigBasket' },
    { day: 8, amount: 12500, category: 'Tier_B_Optimizable', description: 'Utilities & internet', tier: 'Tier_B_Optimizable', merchant: 'BESCOM' },
    { day: 11, amount: 13800, category: 'Tier_B_Optimizable', description: 'Fuel & commute', tier: 'Tier_B_Optimizable', merchant: 'Indian Oil' },
    { day: 14, amount: 12900, category: 'Tier_B_Optimizable', description: 'Family essentials', tier: 'Tier_B_Optimizable', merchant: 'DMart' },
    { day: 17, amount: 13400, category: 'Tier_B_Optimizable', description: 'Healthcare & pharmacy', tier: 'Tier_B_Optimizable', merchant: 'Apollo Pharmacy' },
    { day: 20, amount: 12200, category: 'Tier_C_Flexible', description: 'Family outing', tier: 'Tier_C_Flexible', merchant: 'Local Restaurant' },
  ]),
  income_sources: [
    { name: 'Monthly Salary', amount: 120000, frequency: 'monthly', variability: 0.02, probability: 0.99 },
    { name: 'Side Consulting', amount: 10000, frequency: 'monthly', variability: 0.2, probability: 0.8 },
  ],
  assets: [
    { name: 'Savings Account', value: 400000, asset_type: 'savings', liquidity: 'high', returns_percentage: 3.5 },
    { name: 'Fixed Deposit', value: 600000, asset_type: 'fd', liquidity: 'medium', returns_percentage: 7.0 },
    { name: 'Equity Mutual Funds (SIP)', value: 1100000, asset_type: 'mutual_fund', liquidity: 'medium', returns_percentage: 13.0 },
    { name: 'Stock Portfolio', value: 350000, asset_type: 'stock', liquidity: 'high', returns_percentage: 15.0 },
  ],
  liabilities: [
    { name: 'Home Loan - SBI', current_balance: 1800000, interest_rate: 8.2, monthly_payment: 13500, remaining_months: 168 },
  ],
  goals: [
    { name: 'Emergency Fund', target_amount: 500000, current_amount: 400000, deadline: '2027-01-01', category: 'emergency', priority: 1 },
    { name: 'Early Retirement (FIRE)', target_amount: 30000000, current_amount: 2050000, deadline: '2046-01-01', category: 'custom', priority: 1 },
    { name: 'Second Home Down Payment', target_amount: 3000000, current_amount: 500000, deadline: '2030-01-01', category: 'house', priority: 2 },
  ],
};

// ==================== Ramesh Iyer — Frugal (small amounts, minimal discretionary spend) ====================
const ramesh: UserData = {
  user_id: 'usr_50774',
  email: 'ramesh.iyer@gmail.com',
  transactions: buildTransactions([
    { day: 1, amount: 1200, category: 'Tier_A_NonNegotiable', description: 'Maintenance charges', tier: 'Tier_A_NonNegotiable', merchant: 'Society' },
    { day: 3, amount: 600, category: 'Tier_A_NonNegotiable', description: 'Medication', tier: 'Tier_A_NonNegotiable', merchant: 'Apollo Pharmacy' },
    { day: 5, amount: 900, category: 'Tier_B_Optimizable', description: 'Groceries', tier: 'Tier_B_Optimizable', merchant: 'Local Kirana Store' },
    { day: 8, amount: 300, category: 'Tier_B_Optimizable', description: 'Electricity bill', tier: 'Tier_B_Optimizable', merchant: 'BESCOM' },
    { day: 11, amount: 450, category: 'Tier_B_Optimizable', description: 'Mobile recharge', tier: 'Tier_B_Optimizable', merchant: 'Airtel' },
    { day: 14, amount: 250, category: 'Tier_B_Optimizable', description: 'Bus pass top-up', tier: 'Tier_B_Optimizable', merchant: 'BMTC' },
    { day: 18, amount: 150, category: 'Tier_C_Flexible', description: 'Tea with friends', tier: 'Tier_C_Flexible', merchant: 'Local Tea Stall' },
  ]),
  income_sources: [{ name: 'Pension', amount: 35000, frequency: 'monthly', variability: 0.0, probability: 1.0 }],
  assets: [
    { name: 'Fixed Deposit', value: 1500000, asset_type: 'fd', liquidity: 'medium', returns_percentage: 7.0 },
    { name: 'Savings Account', value: 250000, asset_type: 'savings', liquidity: 'high', returns_percentage: 3.0 },
  ],
  liabilities: [],
  goals: [
    { name: 'Healthcare Fund', target_amount: 500000, current_amount: 300000, deadline: '2028-01-01', category: 'custom', priority: 1 },
    { name: "Grandchild's Education Gift", target_amount: 200000, current_amount: 80000, deadline: '2029-06-01', category: 'education', priority: 2 },
  ],
};

export const demoProfiles: DemoProfile[] = [
  { id: 'arjun', name: 'Arjun Sharma', title: 'The Balanced Professional', personaLabel: 'Balanced', avatarInitials: 'AS', data: arjun },
  { id: 'priya', name: 'Priya Malhotra', title: 'The Impulsive Spender', personaLabel: 'Impulsive', avatarInitials: 'PM', data: priya },
  { id: 'karan', name: 'Karan Kapoor', title: 'The Lifestyle Spender', personaLabel: 'Lifestyle Focused', avatarInitials: 'KK', data: karan },
  { id: 'vikram', name: 'Vikram Nair', title: 'The Disciplined Saver', personaLabel: 'Disciplined', avatarInitials: 'VN', data: vikram },
  { id: 'ramesh', name: 'Ramesh Iyer', title: 'The Frugal Minimalist', personaLabel: 'Frugal', avatarInitials: 'RI', data: ramesh },
];

export const defaultProfileId = 'arjun';
