import express from 'express';
import cors from 'cors';
import { USER, GOALS, findGoal, applyContribution } from './state';
import { isMlEngineHealthy } from './services/mlClient';

const app = express();
app.use(cors());
app.use(express.json());

// USER and GOALS are no longer hardcoded here — they're derived from the single
// canonical dataset in ml/samples/user_data.json (see ./state.ts), so this mock
// API can never drift out of sync with the ML engine / Goals app again.

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// Everything below (net worth history, portfolio holdings, transactions, tax,
// insurance, market data...) has no equivalent in the ML engine — it's UI-only
// demo data for pages the ML engine doesn't model, so it stays hand-authored here.

const NET_WORTH_HISTORY = [
  { month: 'Aug 2024', netWorth: 5120000, assets: 9800000, liabilities: 4680000 },
  { month: 'Sep 2024', netWorth: 5380000, assets: 10050000, liabilities: 4670000 },
  { month: 'Oct 2024', netWorth: 5290000, assets: 9940000, liabilities: 4650000 },
  { month: 'Nov 2024', netWorth: 5610000, assets: 10240000, liabilities: 4630000 },
  { month: 'Dec 2024', netWorth: 5850000, assets: 10470000, liabilities: 4620000 },
  { month: 'Jan 2025', netWorth: 5970000, assets: 10580000, liabilities: 4610000 },
  { month: 'Feb 2025', netWorth: 6120000, assets: 10710000, liabilities: 4590000 },
  { month: 'Mar 2025', netWorth: 6340000, assets: 10920000, liabilities: 4580000 },
  { month: 'Apr 2025', netWorth: 6180000, assets: 10750000, liabilities: 4570000 },
  { month: 'May 2025', netWorth: 6520000, assets: 11080000, liabilities: 4560000 },
  { month: 'Jun 2025', netWorth: 6730000, assets: 11280000, liabilities: 4550000 },
  { month: 'Jul 2025', netWorth: 6890000, assets: 11430000, liabilities: 4540000 },
  { month: 'Aug 2025', netWorth: 7120000, assets: 11650000, liabilities: 4530000 },
];

const CASHFLOW_HISTORY = [
  { month: 'Mar 2025', income: 150000, expenses: 98500, savings: 51500, invested: 35000 },
  { month: 'Apr 2025', income: 150000, expenses: 112000, savings: 38000, invested: 30000 },
  { month: 'May 2025', income: 165000, expenses: 97000, savings: 68000, invested: 50000 },
  { month: 'Jun 2025', income: 150000, expenses: 103000, savings: 47000, invested: 40000 },
  { month: 'Jul 2025', income: 150000, expenses: 94000, savings: 56000, invested: 45000 },
  { month: 'Aug 2025', income: 158000, expenses: 99500, savings: 58500, invested: 48000 },
];

const PORTFOLIO = {
  totalValue: 2650000,
  totalInvested: 2010000,
  totalGain: 640000,
  totalGainPercent: 31.84,
  dayChange: 12450,
  dayChangePercent: 0.47,
  holdings: {
    stocks: [
      { symbol: 'RELIANCE', name: 'Reliance Industries', qty: 25, avgPrice: 2340, cmp: 2892, value: 72300, gain: 13800, gainPct: 23.59, sector: 'Energy', type: 'Large Cap' },
      { symbol: 'INFY', name: 'Infosys Ltd', qty: 60, avgPrice: 1420, cmp: 1687, value: 101220, gain: 16020, gainPct: 18.80, sector: 'IT', type: 'Large Cap' },
      { symbol: 'HDFC', name: 'HDFC Bank Ltd', qty: 40, avgPrice: 1520, cmp: 1712, value: 68480, gain: 7680, gainPct: 12.63, sector: 'Banking', type: 'Large Cap' },
      { symbol: 'TCS', name: 'Tata Consultancy Svc', qty: 15, avgPrice: 3650, cmp: 4121, value: 61815, gain: 7065, gainPct: 12.90, sector: 'IT', type: 'Large Cap' },
      { symbol: 'WIPRO', name: 'Wipro Ltd', qty: 100, avgPrice: 420, cmp: 512, value: 51200, gain: 9200, gainPct: 21.90, sector: 'IT', type: 'Large Cap' },
      { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', qty: 8, avgPrice: 6800, cmp: 7843, value: 62744, gain: 8344, gainPct: 15.35, sector: 'NBFC', type: 'Large Cap' },
      { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', qty: 80, avgPrice: 580, cmp: 834, value: 66720, gain: 20320, gainPct: 43.79, sector: 'Auto', type: 'Large Cap' },
      { symbol: 'ZOMATO', name: 'Zomato Ltd', qty: 200, avgPrice: 102, cmp: 234, value: 46800, gain: 26400, gainPct: 129.41, sector: 'Consumer Tech', type: 'Mid Cap' },
    ],
    mutualFunds: [
      { name: 'Mirae Asset Large Cap Fund', folio: 'MF001', units: 2840.23, nav: 112.45, value: 319388, invested: 250000, gain: 69388, gainPct: 27.76, category: 'Large Cap', risk: 'Moderate', sipAmount: 10000 },
      { name: 'Axis Midcap Fund Direct Growth', folio: 'MF002', units: 1240.56, nav: 98.23, value: 121836, invested: 90000, gain: 31836, gainPct: 35.37, category: 'Mid Cap', risk: 'High', sipAmount: 8000 },
      { name: 'Parag Parikh Flexi Cap Fund', folio: 'MF003', units: 980.34, nav: 76.12, value: 74627, invested: 60000, gain: 14627, gainPct: 24.38, category: 'Flexi Cap', risk: 'Moderate-High', sipAmount: 5000 },
      { name: 'HDFC Balanced Advantage Fund', folio: 'MF004', units: 3450.78, nav: 54.67, value: 188644, invested: 150000, gain: 38644, gainPct: 25.76, category: 'Hybrid', risk: 'Moderate', sipAmount: 7000 },
      { name: 'Nippon India Small Cap Fund', folio: 'MF005', units: 1820.45, nav: 43.28, value: 78748, invested: 55000, gain: 23748, gainPct: 43.18, category: 'Small Cap', risk: 'Very High', sipAmount: 5000 },
    ],
    fixedIncome: [
      { name: 'PPF Account', institution: 'SBI', type: 'PPF', invested: 240000, currentValue: 298400, maturityDate: '2033-04-01', interestRate: 7.1, yearlyContribution: 150000 },
      { name: 'NPS Tier I', institution: 'HDFC Pension', type: 'NPS', invested: 360000, currentValue: 412800, maturityAge: 60, yearlyContribution: 150000, allocation: '75% Equity, 25% Debt' },
      { name: 'SBI Fixed Deposit', institution: 'SBI', type: 'FD', invested: 200000, currentValue: 224800, maturityDate: '2026-03-15', interestRate: 7.4, tenure: '2 Years' },
      { name: 'HDFC Fixed Deposit', institution: 'HDFC Bank', type: 'FD', invested: 300000, currentValue: 341520, maturityDate: '2027-01-10', interestRate: 7.25, tenure: '3 Years' },
      { name: 'Corporate Bond - Tata Capital', institution: 'Tata Capital', type: 'Bond', invested: 150000, currentValue: 163500, maturityDate: '2026-08-20', interestRate: 8.9, rating: 'AAA' },
      { name: 'Digital Gold (SafeGold)', institution: 'SafeGold', type: 'Gold', invested: 48000, currentValue: 79200, units: '12.4 gm', purity: '24K' },
    ],
  },
  allocation: [
    { name: 'Equity Stocks', value: 531279, percentage: 20.05, color: '#6366f1' },
    { name: 'Mutual Funds', value: 782243, percentage: 29.52, color: '#8b5cf6' },
    { name: 'NPS', value: 412800, percentage: 15.58, color: '#06b6d4' },
    { name: 'PPF', value: 298400, percentage: 11.26, color: '#10b981' },
    { name: 'Fixed Deposits', value: 566320, percentage: 21.37, color: '#f59e0b' },
    { name: 'Bonds', value: 163500, percentage: 6.17, color: '#f97316' },
    { name: 'Gold', value: 79200, percentage: 2.99, color: '#eab308' },
  ],
};

const TRANSACTIONS = [
  // August 2025
  { id: 't001', date: '2025-08-15', description: 'Infosys Salary Credit', amount: 150000, type: 'credit', category: 'Income', merchant: 'Infosys Ltd', mode: 'NEFT' },
  { id: 't002', date: '2025-08-14', description: 'Swiggy Order', amount: -850, type: 'debit', category: 'Food & Dining', merchant: 'Swiggy', mode: 'UPI' },
  { id: 't003', date: '2025-08-14', description: 'Home Loan EMI', amount: -35000, type: 'debit', category: 'Housing', merchant: 'HDFC Home Loans', mode: 'Auto Debit' },
  { id: 't004', date: '2025-08-13', description: 'BigBasket Grocery', amount: -4200, type: 'debit', category: 'Groceries', merchant: 'BigBasket', mode: 'UPI' },
  { id: 't005', date: '2025-08-13', description: 'Ola Cab Ride', amount: -340, type: 'debit', category: 'Transport', merchant: 'Ola', mode: 'UPI' },
  { id: 't006', date: '2025-08-12', description: 'Zomato Order', amount: -680, type: 'debit', category: 'Food & Dining', merchant: 'Zomato', mode: 'UPI' },
  { id: 't007', date: '2025-08-12', description: 'Amazon Purchase', amount: -3499, type: 'debit', category: 'Shopping', merchant: 'Amazon', mode: 'Net Banking' },
  { id: 't008', date: '2025-08-11', description: 'Electricity Bill BESCOM', amount: -2840, type: 'debit', category: 'Utilities', merchant: 'BESCOM', mode: 'Bill Pay' },
  { id: 't009', date: '2025-08-10', description: 'Netflix Subscription', amount: -649, type: 'debit', category: 'Entertainment', merchant: 'Netflix', mode: 'Auto Debit' },
  { id: 't010', date: '2025-08-10', description: 'Petrol - HP Fuel Station', amount: -2400, type: 'debit', category: 'Transport', merchant: 'HP Petrol', mode: 'Card' },
  { id: 't011', date: '2025-08-09', description: 'Car Loan EMI', amount: -12500, type: 'debit', category: 'Loan EMI', merchant: 'ICICI Bank', mode: 'Auto Debit' },
  { id: 't012', date: '2025-08-08', description: 'Apollo Pharmacy', amount: -1240, type: 'debit', category: 'Health', merchant: 'Apollo Pharmacy', mode: 'UPI' },
  { id: 't013', date: '2025-08-08', description: 'Mirae Asset MF SIP', amount: -10000, type: 'debit', category: 'Investment', merchant: 'Mirae Asset MF', mode: 'Auto Debit' },
  { id: 't014', date: '2025-08-08', description: 'Axis Midcap SIP', amount: -8000, type: 'debit', category: 'Investment', merchant: 'Axis MF', mode: 'Auto Debit' },
  { id: 't015', date: '2025-08-08', description: 'Nippon Small Cap SIP', amount: -5000, type: 'debit', category: 'Investment', merchant: 'Nippon MF', mode: 'Auto Debit' },
  { id: 't016', date: '2025-08-07', description: 'School Fees - DPS', amount: -18000, type: 'debit', category: 'Education', merchant: "Delhi Public School", mode: 'Cheque' },
  { id: 't017', date: '2025-08-07', description: 'Myntra Shopping', amount: -2890, type: 'debit', category: 'Shopping', merchant: 'Myntra', mode: 'UPI' },
  { id: 't018', date: '2025-08-06', description: 'Airtel Postpaid Bill', amount: -999, type: 'debit', category: 'Utilities', merchant: 'Airtel', mode: 'Auto Pay' },
  { id: 't019', date: '2025-08-05', description: 'Spotify Premium', amount: -119, type: 'debit', category: 'Entertainment', merchant: 'Spotify', mode: 'Auto Debit' },
  { id: 't020', date: '2025-08-05', description: 'Zepto Grocery', amount: -1860, type: 'debit', category: 'Groceries', merchant: 'Zepto', mode: 'UPI' },
  { id: 't021', date: '2025-08-04', description: 'PVR Cinemas', amount: -1400, type: 'debit', category: 'Entertainment', merchant: 'PVR', mode: 'UPI' },
  { id: 't022', date: '2025-08-03', description: 'Parag Parikh MF SIP', amount: -5000, type: 'debit', category: 'Investment', merchant: 'PPFAS MF', mode: 'Auto Debit' },
  { id: 't023', date: '2025-08-03', description: 'HDFC Balanced Fund SIP', amount: -7000, type: 'debit', category: 'Investment', merchant: 'HDFC MF', mode: 'Auto Debit' },
  { id: 't024', date: '2025-08-02', description: 'Swiggy Instamart', amount: -2340, type: 'debit', category: 'Groceries', merchant: 'Swiggy', mode: 'UPI' },
  { id: 't025', date: '2025-08-01', description: 'Society Maintenance', amount: -3500, type: 'debit', category: 'Housing', merchant: 'Prestige Apartments', mode: 'NEFT' },
  // July 2025
  { id: 't026', date: '2025-07-15', description: 'Infosys Salary Credit', amount: 150000, type: 'credit', category: 'Income', merchant: 'Infosys Ltd', mode: 'NEFT' },
  { id: 't027', date: '2025-07-14', description: 'Home Loan EMI', amount: -35000, type: 'debit', category: 'Housing', merchant: 'HDFC Home Loans', mode: 'Auto Debit' },
  { id: 't028', date: '2025-07-13', description: 'BigBasket Monthly', amount: -5800, type: 'debit', category: 'Groceries', merchant: 'BigBasket', mode: 'UPI' },
  { id: 't029', date: '2025-07-12', description: 'Reliance Stock Buy', amount: -28920, type: 'debit', category: 'Investment', merchant: 'Zerodha', mode: 'Net Banking' },
  { id: 't030', date: '2025-07-11', description: 'Zomato Order', amount: -1240, type: 'debit', category: 'Food & Dining', merchant: 'Zomato', mode: 'UPI' },
  { id: 't031', date: '2025-07-10', description: 'Car Loan EMI', amount: -12500, type: 'debit', category: 'Loan EMI', merchant: 'ICICI Bank', mode: 'Auto Debit' },
  { id: 't032', date: '2025-07-09', description: 'BESCOM Electricity', amount: -2640, type: 'debit', category: 'Utilities', merchant: 'BESCOM', mode: 'Bill Pay' },
  { id: 't033', date: '2025-07-08', description: 'All MF SIPs', amount: -35000, type: 'debit', category: 'Investment', merchant: 'Various MFs', mode: 'Auto Debit' },
  { id: 't034', date: '2025-07-07', description: 'Swiggy Food', amount: -780, type: 'debit', category: 'Food & Dining', merchant: 'Swiggy', mode: 'UPI' },
  { id: 't035', date: '2025-07-06', description: 'Amazon Prime Annual', amount: -1499, type: 'debit', category: 'Entertainment', merchant: 'Amazon', mode: 'Auto Debit' },
  { id: 't036', date: '2025-07-05', description: 'Flipkart Sale Purchase', amount: -6799, type: 'debit', category: 'Shopping', merchant: 'Flipkart', mode: 'UPI' },
  { id: 't037', date: '2025-07-04', description: 'Doctor Visit + Medicine', amount: -2400, type: 'debit', category: 'Health', merchant: 'Manipal Hospital', mode: 'Card' },
  { id: 't038', date: '2025-07-03', description: 'Airtel Broadband', amount: -899, type: 'debit', category: 'Utilities', merchant: 'Airtel', mode: 'Auto Pay' },
  { id: 't039', date: '2025-07-02', description: 'Uber Rides', amount: -1240, type: 'debit', category: 'Transport', merchant: 'Uber', mode: 'UPI' },
  { id: 't040', date: '2025-07-01', description: 'Society Maintenance', amount: -3500, type: 'debit', category: 'Housing', merchant: 'Prestige Apartments', mode: 'NEFT' },
  // June 2025
  { id: 't041', date: '2025-06-15', description: 'Infosys Salary Credit', amount: 150000, type: 'credit', category: 'Income', merchant: 'Infosys Ltd', mode: 'NEFT' },
  { id: 't042', date: '2025-06-14', description: 'Home Loan EMI', amount: -35000, type: 'debit', category: 'Housing', merchant: 'HDFC Home Loans', mode: 'Auto Debit' },
  { id: 't043', date: '2025-06-10', description: 'School Annual Fee', amount: -35000, type: 'debit', category: 'Education', merchant: "Delhi Public School", mode: 'Cheque' },
  { id: 't044', date: '2025-06-08', description: 'MF SIPs June', amount: -35000, type: 'debit', category: 'Investment', merchant: 'Various MFs', mode: 'Auto Debit' },
  { id: 't045', date: '2025-06-07', description: 'Restaurant Dinner', amount: -3200, type: 'debit', category: 'Food & Dining', merchant: 'Mainland China', mode: 'Card' },
  { id: 't046', date: '2025-06-05', description: 'Grocery Shopping', amount: -6200, type: 'debit', category: 'Groceries', merchant: 'DMart', mode: 'UPI' },
  { id: 't047', date: '2025-06-04', description: 'Term Insurance Premium', amount: -18000, type: 'debit', category: 'Insurance', merchant: 'HDFC Life', mode: 'Net Banking' },
  { id: 't048', date: '2025-06-03', description: 'Health Insurance Premium', amount: -24000, type: 'debit', category: 'Insurance', merchant: 'Star Health', mode: 'Net Banking' },
  { id: 't049', date: '2025-06-02', description: 'FD Interest Credit', amount: 8500, type: 'credit', category: 'Interest Income', merchant: 'SBI', mode: 'Credit' },
  { id: 't050', date: '2025-06-01', description: 'Dividend - INFY', amount: 2400, type: 'credit', category: 'Dividend', merchant: 'Infosys Ltd', mode: 'Credit' },
  // May 2025
  { id: 't051', date: '2025-05-15', description: 'Infosys Salary + Bonus', amount: 165000, type: 'credit', category: 'Income', merchant: 'Infosys Ltd', mode: 'NEFT' },
  { id: 't052', date: '2025-05-14', description: 'Home Loan EMI', amount: -35000, type: 'debit', category: 'Housing', merchant: 'HDFC Home Loans', mode: 'Auto Debit' },
  { id: 't053', date: '2025-05-13', description: 'Zerodha Stock Purchase', amount: -50000, type: 'debit', category: 'Investment', merchant: 'Zerodha', mode: 'Net Banking' },
  { id: 't054', date: '2025-05-12', description: 'PPF Contribution', amount: -50000, type: 'debit', category: 'Investment', merchant: 'SBI PPF', mode: 'Net Banking' },
  { id: 't055', date: '2025-05-10', description: 'Grocery & Household', amount: -7800, type: 'debit', category: 'Groceries', merchant: 'BigBasket', mode: 'UPI' },
  { id: 't056', date: '2025-05-08', description: 'MF SIPs May', amount: -35000, type: 'debit', category: 'Investment', merchant: 'Various MFs', mode: 'Auto Debit' },
  { id: 't057', date: '2025-05-07', description: 'Makemytrip - Goa Trip', amount: -28000, type: 'debit', category: 'Travel', merchant: 'MakeMyTrip', mode: 'Card' },
  { id: 't058', date: '2025-05-05', description: 'Car Service', amount: -8500, type: 'debit', category: 'Transport', merchant: 'Hyundai Service', mode: 'Card' },
  { id: 't059', date: '2025-05-03', description: 'NPS Contribution', amount: -12500, type: 'debit', category: 'Investment', merchant: 'HDFC Pension', mode: 'Net Banking' },
  // April 2025
  { id: 't060', date: '2025-04-15', description: 'Infosys Salary Credit', amount: 150000, type: 'credit', category: 'Income', merchant: 'Infosys Ltd', mode: 'NEFT' },
  { id: 't061', date: '2025-04-14', description: 'Home Loan EMI', amount: -35000, type: 'debit', category: 'Housing', merchant: 'HDFC Home Loans', mode: 'Auto Debit' },
  { id: 't062', date: '2025-04-12', description: 'Tax Paid Advance', amount: -45000, type: 'debit', category: 'Tax', merchant: 'Income Tax Dept', mode: 'Net Banking' },
  { id: 't063', date: '2025-04-10', description: 'Amazon Shopping', amount: -9800, type: 'debit', category: 'Shopping', merchant: 'Amazon', mode: 'UPI' },
  { id: 't064', date: '2025-04-08', description: 'MF SIPs April', amount: -35000, type: 'debit', category: 'Investment', merchant: 'Various MFs', mode: 'Auto Debit' },
  { id: 't065', date: '2025-04-05', description: 'Restaurant Dining', amount: -4500, type: 'debit', category: 'Food & Dining', merchant: 'The Fat Chef', mode: 'Card' },
  { id: 't066', date: '2025-04-04', description: 'Doctor Consultation', amount: -1500, type: 'debit', category: 'Health', merchant: 'Manipal Hospital', mode: 'Card' },
  { id: 't067', date: '2025-04-03', description: 'Grocery Shopping', amount: -5400, type: 'debit', category: 'Groceries', merchant: 'More Supermarket', mode: 'Card' },
  { id: 't068', date: '2025-04-02', description: 'Car Loan EMI', amount: -12500, type: 'debit', category: 'Loan EMI', merchant: 'ICICI Bank', mode: 'Auto Debit' },
  { id: 't069', date: '2025-04-01', description: 'Society Maintenance', amount: -3500, type: 'debit', category: 'Housing', merchant: 'Prestige Apartments', mode: 'NEFT' },
  // March 2025
  { id: 't070', date: '2025-03-15', description: 'Infosys Salary Credit', amount: 150000, type: 'credit', category: 'Income', merchant: 'Infosys Ltd', mode: 'NEFT' },
  { id: 't071', date: '2025-03-14', description: 'Home Loan EMI', amount: -35000, type: 'debit', category: 'Housing', merchant: 'HDFC Home Loans', mode: 'Auto Debit' },
  { id: 't072', date: '2025-03-10', description: 'Last Year Tax Return', amount: 22000, type: 'credit', category: 'Tax Refund', merchant: 'Income Tax Dept', mode: 'NEFT' },
  { id: 't073', date: '2025-03-09', description: 'Gold Purchase (Digital)', amount: -12000, type: 'debit', category: 'Investment', merchant: 'SafeGold', mode: 'UPI' },
  { id: 't074', date: '2025-03-08', description: 'MF SIPs March', amount: -35000, type: 'debit', category: 'Investment', merchant: 'Various MFs', mode: 'Auto Debit' },
  { id: 't075', date: '2025-03-05', description: 'Electricity & Water Bills', amount: -4200, type: 'debit', category: 'Utilities', merchant: 'BESCOM/BWSSB', mode: 'Bill Pay' },
  { id: 't076', date: '2025-03-03', description: 'Book Store & Stationery', amount: -2800, type: 'debit', category: 'Education', merchant: 'Landmark', mode: 'Card' },
  { id: 't077', date: '2025-03-02', description: 'Car Loan EMI', amount: -12500, type: 'debit', category: 'Loan EMI', merchant: 'ICICI Bank', mode: 'Auto Debit' },
  { id: 't078', date: '2025-03-01', description: 'Grocery Shopping', amount: -6800, type: 'debit', category: 'Groceries', merchant: 'BigBasket', mode: 'UPI' },
];

const SPENDING_BREAKDOWN = {
  monthly: [
    { category: 'Housing', amount: 38500, percentage: 38.7, budget: 40000, color: '#6366f1' },
    { category: 'Investments', amount: 35000, percentage: 35.2, budget: 40000, color: '#10b981' },
    { category: 'Groceries', amount: 8400, percentage: 8.4, budget: 8000, color: '#f59e0b' },
    { category: 'Food & Dining', amount: 6200, percentage: 6.2, budget: 5000, color: '#ef4444' },
    { category: 'Transport', amount: 5200, percentage: 5.2, budget: 5000, color: '#8b5cf6' },
    { category: 'Entertainment', amount: 3200, percentage: 3.2, budget: 3000, color: '#06b6d4' },
    { category: 'Shopping', amount: 5800, percentage: 5.8, budget: 5000, color: '#f97316' },
    { category: 'Health', amount: 2400, percentage: 2.4, budget: 3000, color: '#ec4899' },
    { category: 'Utilities', amount: 4300, percentage: 4.3, budget: 4000, color: '#14b8a6' },
    { category: 'Education', amount: 18000, percentage: 18.1, budget: 20000, color: '#84cc16' },
  ],
};

const TAX_DATA = {
  financialYear: '2025-26',
  incomeDetails: {
    salary: 2400000,
    hraExemption: 180000,
    standardDeduction: 50000,
    grossIncome: 2170000,
  },
  deductions: {
    section80C: {
      limit: 150000,
      utilized: 132000,
      remaining: 18000,
      breakdown: [
        { name: 'EPF (Employer + Employee)', amount: 43200 },
        { name: 'PPF Contribution', amount: 50000 },
        { name: 'ELSS (Axis Tax Saver)', amount: 28800 },
        { name: 'Life Insurance Premium', amount: 10000 },
      ],
    },
    section80D: {
      limit: 50000,
      utilized: 24000,
      remaining: 26000,
      breakdown: [
        { name: 'Self + Family Health Insurance', amount: 24000 },
      ],
    },
    section80CCD: {
      limit: 50000,
      utilized: 50000,
      remaining: 0,
      breakdown: [{ name: 'NPS (Additional 80CCD(1B))', amount: 50000 }],
    },
    section24b: {
      limit: 200000,
      utilized: 165000,
      remaining: 35000,
      breakdown: [{ name: 'Home Loan Interest', amount: 165000 }],
    },
    hraExemption: 180000,
  },
  taxCalculation: {
    taxableIncome: 1593000,
    taxSlab: '30%',
    taxBeforeRebate: 398500,
    tds: 350000,
    advanceTax: 45000,
    balanceTaxPayable: 3500,
    effectiveTaxRate: 17.2,
  },
  potentialSavings: [
    { action: 'Maximize 80C (₹18,000 remaining)', saving: 5400, section: '80C', urgency: 'High' },
    { action: 'Add Family to Health Insurance (80D)', saving: 7800, section: '80D', urgency: 'High' },
    { action: 'Claim LTA for current year travel', saving: 12000, section: 'LTA', urgency: 'Medium' },
    { action: 'Invest in ELSS instead of FD', saving: 8200, section: '80C', urgency: 'Medium' },
    { action: 'Claim HRA properly (rent receipts)', saving: 15600, section: 'HRA', urgency: 'Low' },
  ],
};

const INSURANCE = {
  life: {
    type: 'Term Insurance',
    provider: 'HDFC Life Click2Protect',
    sumAssured: 10000000,
    premium: 18000,
    frequency: 'Annual',
    policyStart: '2020-06-15',
    maturityDate: '2055-06-15',
    nominees: ['Priya Sharma (Spouse)', 'Rohan Sharma (Son)'],
    coverageAdequacy: 'Adequate',
    recommendedCover: 12000000,
  },
  health: {
    type: 'Family Floater',
    provider: 'Star Health Comprehensive',
    sumInsured: 1000000,
    premium: 24000,
    frequency: 'Annual',
    policyStart: '2023-06-01',
    renewalDate: '2026-06-01',
    members: ['Arjun (Self)', 'Priya (Spouse)', 'Rohan (Child)'],
    coverageAdequacy: 'Moderate',
    recommendedCover: 2000000,
    features: ['Cashless at 14,000+ hospitals', 'No co-pay', '100% NCB', 'Day care covered'],
  },
  vehicle: {
    type: 'Comprehensive Car Insurance',
    provider: 'Bajaj Allianz',
    vehicleReg: 'KA 01 XX 1234',
    idv: 850000,
    premium: 28000,
    frequency: 'Annual',
    renewalDate: '2026-03-20',
    addOns: ['Zero Depreciation', 'Roadside Assistance', 'Engine Protect'],
  },
  gaps: [
    { type: 'Critical Illness Cover', status: 'Missing', importance: 'High', recommendation: 'Add ₹25L critical illness rider to existing term plan (Cost: ~₹4,500/year)' },
    { type: 'Personal Accident Cover', status: 'Missing', importance: 'High', recommendation: 'Get personal accident policy of ₹50L (Cost: ~₹3,000/year)' },
    { type: 'Top-up Health Cover', status: 'Missing', importance: 'Medium', recommendation: 'Super top-up of ₹20L over ₹10L deductible (Cost: ~₹8,000/year)' },
    { type: 'Home Insurance', status: 'Missing', importance: 'Medium', recommendation: 'Home structure + contents insurance (Cost: ~₹5,000/year)' },
  ],
  overallScore: 65,
};

const HEALTH_SCORE = {
  overall: 72,
  grade: 'B+',
  dimensions: [
    { name: 'Income Stability', score: 88, description: 'Stable salaried income with good employer', color: '#10b981' },
    { name: 'Savings Rate', score: 68, description: 'Saving 34% of income, target is 40%', color: '#6366f1' },
    { name: 'Investment Diversification', score: 78, description: 'Good mix across equity, debt and gold', color: '#8b5cf6' },
    { name: 'Debt Management', score: 62, description: 'EMI-to-income ratio is 31.7%, slightly high', color: '#f59e0b' },
    { name: 'Insurance Coverage', score: 65, description: 'Life and health covered, gaps in CI and accident', color: '#06b6d4' },
    { name: 'Emergency Fund', score: 55, description: 'Only 2 months coverage, need 6 months', color: '#ef4444' },
    { name: 'Goal Progress', score: 60, description: '2 of 5 goals on track', color: '#f97316' },
    { name: 'Tax Efficiency', score: 72, description: 'Good use of 80C/80D, HRA optimization pending', color: '#ec4899' },
  ],
  insights: [
    { type: 'warning', message: 'Emergency fund covers only 2 months. Build it to 6 months (₹3L more needed).' },
    { type: 'danger', message: "Child's education goal is behind by ₹3,500/month SIP. Consider increasing contributions." },
    { type: 'success', message: 'Retirement corpus is on track! Great SIP discipline.' },
    { type: 'info', message: 'You have ₹18,000 remaining in 80C. Maximize it before March 2026 to save ₹5,400 in taxes.' },
    { type: 'warning', message: 'Health insurance of ₹10L may be insufficient. Super top-up recommended.' },
  ],
};

const AI_INSIGHTS = [
  {
    id: 'ai001',
    type: 'opportunity',
    title: 'Unlock ₹5,400 in Tax Savings',
    description: 'You have ₹18,000 unutilized in Section 80C. Invest in ELSS or top up PPF before March 2026.',
    action: 'Invest Now',
    priority: 'high',
    icon: '💰',
    saving: 5400,
  },
  {
    id: 'ai002',
    type: 'alert',
    title: 'Food & Dining Over Budget',
    description: 'You spent ₹6,200 on dining this month vs. ₹5,000 budget. 24% over-budget for 3 consecutive months.',
    action: 'View Details',
    priority: 'medium',
    icon: '🍽️',
    overspend: 1200,
  },
  {
    id: 'ai003',
    type: 'recommendation',
    title: 'Emergency Fund Needs Attention',
    description: 'Your emergency fund covers only 2 months. Add ₹15,000/month for 20 months to reach 6-month target.',
    action: 'Start SIP',
    priority: 'high',
    icon: '🛡️',
    shortfall: 300000,
  },
  {
    id: 'ai004',
    type: 'opportunity',
    title: 'Portfolio Rebalancing Due',
    description: 'Equity allocation at 72% vs ideal 65%. Consider moving ₹1.85L from equity to debt to rebalance.',
    action: 'Rebalance',
    priority: 'medium',
    icon: '⚖️',
  },
  {
    id: 'ai005',
    type: 'success',
    title: 'SIP Milestone Achieved!',
    description: 'Your mutual fund portfolio crossed ₹7.8L this month. 3 more years at this pace to hit ₹20L.',
    action: 'View Portfolio',
    priority: 'low',
    icon: '🎯',
  },
];

const INVESTMENT_RECOMMENDATIONS = [
  {
    id: 'r001',
    type: 'Mutual Fund',
    name: 'Quant Small Cap Fund Direct Growth',
    rating: 5,
    category: 'Small Cap',
    returns: { '1y': 45.2, '3y': 38.4, '5y': 31.7 },
    nav: 312.45,
    minSIP: 1000,
    risk: 'Very High',
    reason: 'Top-rated small cap fund. Matches your aggressive allocation. SIP recommended.',
    tag: 'Top Pick',
    aum: '₹12,400 Cr',
  },
  {
    id: 'r002',
    type: 'Stock',
    name: 'Eternal (Zomato Parent)',
    ticker: 'ETERNAL',
    sector: 'Consumer Tech',
    cmp: 234,
    target: 290,
    upside: 23.9,
    rating: 'Buy',
    analyst: '12 Analysts',
    reason: 'High growth potential in food-tech & quick commerce. Long-term story intact.',
    tag: 'High Growth',
  },
  {
    id: 'r003',
    type: 'Mutual Fund',
    name: 'ICICI Pru Balanced Advantage Fund',
    rating: 4,
    category: 'Dynamic Asset Allocation',
    returns: { '1y': 18.4, '3y': 16.2, '5y': 14.8 },
    nav: 67.23,
    minSIP: 500,
    risk: 'Moderate',
    reason: 'Reduces equity exposure automatically in market highs. Good for stability.',
    tag: 'Stable',
    aum: '₹45,200 Cr',
  },
  {
    id: 'r004',
    type: 'Bond',
    name: 'REC Limited NCD - 8.85% p.a.',
    issuer: 'REC Limited (PSU)',
    rating: 'AAA',
    couponRate: 8.85,
    tenure: '5 Years',
    minInvestment: 10000,
    maturity: '2030-09-30',
    risk: 'Low',
    reason: 'AAA rated PSU bond. Good for debt allocation with better returns than FD.',
    tag: 'Safe',
  },
  {
    id: 'r005',
    type: 'NPS',
    name: 'NPS - Increase Contribution for 80CCD(2)',
    section: '80CCD(2)',
    currentContribution: 50000,
    maxBenefit: 192000,
    taxSaving: 57600,
    risk: 'Low-Moderate',
    reason: "Employer's NPS contribution up to 10% of salary is tax-free. Highly underutilized.",
    tag: 'Tax Saver',
  },
];

const MARKET_DATA = [
  { name: 'NIFTY 50', value: 24850.35, change: 145.20, changePct: 0.59, trend: 'up' },
  { name: 'SENSEX', value: 81420.12, change: 480.45, changePct: 0.59, trend: 'up' },
  { name: 'NIFTY Bank', value: 52340.80, change: -124.35, changePct: -0.24, trend: 'down' },
  { name: 'NIFTY IT', value: 38920.45, change: 312.80, changePct: 0.81, trend: 'up' },
  { name: 'Gold (MCX)', value: 74820, change: 280, changePct: 0.38, trend: 'up' },
  { name: 'USD/INR', value: 83.45, change: 0.12, changePct: 0.14, trend: 'up' },
];

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Health check (service liveness + whether the ML engine is reachable)
app.get('/health', async (req, res) => {
  const mlHealthy = await isMlEngineHealthy();
  res.json({ status: 'healthy', service: 'wealthai-backend', mlEngine: mlHealthy ? 'connected' : 'unreachable' });
});

// Auth
app.get('/api/auth/user', (req, res) => {
  res.json({ success: true, data: USER });
});

// Dashboard
app.get('/api/dashboard/summary', (req, res) => {
  const latestNetWorth = NET_WORTH_HISTORY[NET_WORTH_HISTORY.length - 1];
  const prevNetWorth = NET_WORTH_HISTORY[NET_WORTH_HISTORY.length - 2];
  const latestCashflow = CASHFLOW_HISTORY[CASHFLOW_HISTORY.length - 1];

  res.json({
    success: true,
    data: {
      netWorth: latestNetWorth.netWorth,
      netWorthChange: latestNetWorth.netWorth - prevNetWorth.netWorth,
      netWorthChangePct: (((latestNetWorth.netWorth - prevNetWorth.netWorth) / prevNetWorth.netWorth) * 100).toFixed(2),
      totalAssets: latestNetWorth.assets,
      totalLiabilities: latestNetWorth.liabilities,
      monthlyIncome: latestCashflow.income,
      monthlyExpenses: latestCashflow.expenses,
      monthlySavings: latestCashflow.savings,
      savingsRate: ((latestCashflow.savings / latestCashflow.income) * 100).toFixed(1),
      monthlyInvested: latestCashflow.invested,
      portfolioValue: PORTFOLIO.totalValue,
      portfolioGain: PORTFOLIO.totalGain,
      portfolioGainPct: PORTFOLIO.totalGainPercent,
      healthScore: HEALTH_SCORE.overall,
      healthGrade: HEALTH_SCORE.grade,
      aiInsights: AI_INSIGHTS.slice(0, 3),
      marketData: MARKET_DATA,
    },
  });
});

app.get('/api/dashboard/networth-history', (req, res) => {
  res.json({ success: true, data: NET_WORTH_HISTORY });
});

app.get('/api/dashboard/cashflow', (req, res) => {
  res.json({ success: true, data: CASHFLOW_HISTORY });
});

app.get('/api/dashboard/spending-breakdown', (req, res) => {
  res.json({ success: true, data: SPENDING_BREAKDOWN });
});

app.get('/api/dashboard/ai-insights', (req, res) => {
  res.json({ success: true, data: AI_INSIGHTS });
});

app.get('/api/dashboard/market', (req, res) => {
  // Add slight random variation to simulate live data
  const liveData = MARKET_DATA.map(item => ({
    ...item,
    value: parseFloat((item.value + (Math.random() - 0.5) * 10).toFixed(2)),
  }));
  res.json({ success: true, data: liveData });
});

// Portfolio
app.get('/api/portfolio/summary', (req, res) => {
  res.json({
    success: true,
    data: {
      totalValue: PORTFOLIO.totalValue,
      totalInvested: PORTFOLIO.totalInvested,
      totalGain: PORTFOLIO.totalGain,
      totalGainPercent: PORTFOLIO.totalGainPercent,
      dayChange: PORTFOLIO.dayChange,
      dayChangePercent: PORTFOLIO.dayChangePercent,
      allocation: PORTFOLIO.allocation,
    },
  });
});

app.get('/api/portfolio/holdings', (req, res) => {
  res.json({ success: true, data: PORTFOLIO.holdings });
});

app.get('/api/portfolio/allocation', (req, res) => {
  res.json({ success: true, data: PORTFOLIO.allocation });
});

// Transactions
app.get('/api/transactions', (req, res) => {
  const { category, type, limit, month } = req.query;
  let txns = [...TRANSACTIONS];

  if (category) txns = txns.filter(t => t.category === category);
  if (type) txns = txns.filter(t => t.type === type);
  if (month) txns = txns.filter(t => t.date.startsWith(month as string));
  if (limit) txns = txns.slice(0, parseInt(limit as string));

  const totalIncome = txns.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(txns.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0));

  res.json({ success: true, data: { transactions: txns, totalIncome, totalExpenses, count: txns.length } });
});

app.get('/api/transactions/categories', (req, res) => {
  const categories = [...new Set(TRANSACTIONS.map(t => t.category))];
  res.json({ success: true, data: categories });
});

// Goals
// GOALS is seeded from ml/samples/user_data.json and, when the ML engine is
// reachable, enriched with its real feasibility/probability numbers — see
// ./state.ts refreshGoalsFromMlEngine(). No goal data is invented here.
app.get('/api/goals', (req, res) => {
  res.json({ success: true, data: GOALS });
});

app.get('/api/goals/:id', (req, res) => {
  const goal = findGoal(req.params.id);
  if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
  res.json({ success: true, data: goal });
});

app.post('/api/goals/:id/contribute', (req, res) => {
  const { amount } = req.body;
  const goal = applyContribution(req.params.id, amount);
  if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
  res.json({ success: true, data: goal, message: `₹${amount.toLocaleString()} added to goal!` });
});

// Tax
app.get('/api/tax/summary', (req, res) => {
  res.json({ success: true, data: TAX_DATA });
});

app.get('/api/tax/recommendations', (req, res) => {
  res.json({ success: true, data: TAX_DATA.potentialSavings });
});

// Insurance
app.get('/api/insurance/coverage', (req, res) => {
  res.json({ success: true, data: INSURANCE });
});

// Financial Health Score
app.get('/api/health-score', (req, res) => {
  res.json({ success: true, data: HEALTH_SCORE });
});

// Investment Recommendations
app.get('/api/investments/recommendations', (req, res) => {
  res.json({ success: true, data: INVESTMENT_RECOMMENDATIONS });
});

// AI Chat
const AI_CONTEXT = {
  user: USER,
  healthScore: HEALTH_SCORE.overall,
  netWorth: 7120000,
  monthlyIncome: 150000,
  monthlySavings: 58500,
  savingsRate: 39,
  portfolioValue: 2650000,
  goals: GOALS,
};

const generateAIResponse = (message: string): string => {
  const msg = message.toLowerCase();

  if (msg.includes('tax') || msg.includes('80c') || msg.includes('save tax')) {
    return `Based on your current financial profile, here's your tax optimization plan:\n\n💰 **Tax Saving Opportunities for FY 2025-26:**\n\n• **Section 80C (₹18,000 remaining):** You've utilized ₹1,32,000 of ₹1,50,000 limit. Invest ₹18,000 more in ELSS or PPF to save **₹5,400** in taxes.\n\n• **Section 80D (₹26,000 remaining):** Upgrade your health insurance to ₹25L sum insured. Additional premium qualifies for deduction — save up to **₹7,800** more.\n\n• **LTA Claim:** You traveled to Goa this year. Claim Leave Travel Allowance for estimated savings of **₹12,000**.\n\n• **NPS 80CCD(2):** Ask your employer to route more salary through NPS. Up to 10% of salary (₹2.4L) is tax-exempt — potentially saving **₹72,000** annually.\n\n**Total potential tax savings: ₹97,200** 🎯`;
  }

  if (msg.includes('portfolio') || msg.includes('investment') || msg.includes('invest')) {
    return `Here's a comprehensive view of your **₹26.5L portfolio** and personalized recommendations:\n\n📊 **Current Status:**\n• Total Gain: ₹6.4L (+31.84%) — Great performance!\n• Today's Change: +₹12,450 (+0.47%)\n\n⚖️ **Rebalancing Alert:**\nYour equity allocation is at 72% vs ideal 65% for your risk profile. Consider moving ₹1.85L from equity to debt instruments.\n\n🎯 **Top Recommendations:**\n1. **Quant Small Cap Fund** — 5★ rated, 45.2% returns in 1Y. SIP ₹3,000/month\n2. **REC NCD @ 8.85%** — AAA rated, better than FD returns\n3. **Increase NPS** — Up to ₹1.92L employer contribution is fully tax-free\n\n💡 Your Zomato stock is up 129.4% — consider booking partial profits (20-25%) and reinvesting in debt to rebalance.`;
  }

  if (msg.includes('goal') || msg.includes('education') || msg.includes('retirement') || msg.includes('target')) {
    const goalLines = GOALS.map((g) => {
      const year = new Date(g.targetDate).getFullYear();
      const status = g.onTrack ? '**ON TRACK** ✅' : '**BEHIND** ⚠️';
      return `${g.icon} **${g.name} (${year}):** Needs ₹${g.targetAmount.toLocaleString('en-IN')}. Currently ₹${g.currentAmount.toLocaleString('en-IN')} (${g.progress.toFixed(1)}%). ${status} — needs ₹${g.requiredMonthly.toLocaleString('en-IN')}/month.`;
    });
    const behindGoals = GOALS.filter((g) => !g.onTrack);
    const priorityLine = behindGoals.length
      ? `**Priority action:** "${behindGoals[0].name}" needs the most attention — aim for ₹${behindGoals[0].requiredMonthly.toLocaleString('en-IN')}/month to get back on track!`
      : `**Great news:** all ${GOALS.length} goals are currently on track! 🎉`;

    return `Let me analyze your **${GOALS.length} financial goals**:\n\n${goalLines.join('\n\n')}\n\n${priorityLine}`;
  }

  if (msg.includes('spend') || msg.includes('expense') || msg.includes('budget')) {
    return `Here's your **spending analysis** for August 2025:\n\n📊 **Total Expenses: ₹99,500**\n\n🔴 **Over Budget:**\n• Food & Dining: ₹6,200 (Budget: ₹5,000) — **24% over**\n• Groceries: ₹8,400 (Budget: ₹8,000) — **5% over**\n• Shopping: ₹5,800 (Budget: ₹5,000) — **16% over**\n\n🟢 **Under Budget:**\n• Health: ₹2,400 (Budget: ₹3,000) — ₹600 saved\n• Entertainment: ₹3,200 (Budget: ₹3,000) — close\n\n💡 **Smart Tips:**\n1. Dining out 3+ times/week costs ₹4,200. Meal prepping saves ₹2,000/month\n2. Amazon/Myntra impulse buys: ₹6,289 this month. Try a 24-hour rule before purchasing\n3. Your savings rate of **39%** is excellent — top 10% of users your age!`;
  }

  if (msg.includes('insurance') || msg.includes('cover') || msg.includes('protect')) {
    return `Here's your **insurance coverage analysis**:\n\n✅ **What you have:**\n• Term Life: ₹1 Cr (HDFC Life) — Adequate for current liabilities\n• Health: ₹10L Family Floater (Star Health) — Moderate\n• Car: Comprehensive (Bajaj Allianz) — Good\n\n⚠️ **Critical Gaps:**\n1. **Critical Illness Cover** — Not covered! Cancer/heart attack treatment costs ₹15-30L. Add ₹25L CI rider to your term plan for just ₹4,500/year.\n2. **Personal Accident** — Missing! Get ₹50L PA cover for only ₹3,000/year.\n3. **Health Super Top-up** — Your ₹10L may not be enough for serious illness. Add ₹20L super top-up (above ₹10L) for only ₹8,000/year.\n\n💰 **Total additional premium: ₹15,500/year** — provides ₹95L extra coverage!\n\nWith your EMIs and dependents, this protection gap is your **biggest financial risk**.`;
  }

  if (msg.includes('net worth') || msg.includes('wealth') || msg.includes('assets')) {
    return `Your **Net Worth Summary** as of August 2025:\n\n💎 **Net Worth: ₹71.2 Lakhs**\n_(Up from ₹66.9L last month — +₹2.3L growth!)_\n\n📈 **Assets: ₹1.16 Crores**\n• Primary Residence: ₹85L (market value)\n• Investment Portfolio: ₹26.5L\n• Emergency + Liquid: ₹3L\n• Other Assets: ₹1.1L\n\n📉 **Liabilities: ₹45.3 Lakhs**\n• Home Loan Outstanding: ₹42.5L\n• Car Loan: ₹2.8L\n\n🚀 **Wealth Growth Rate:** +18.4% YoY — beating inflation!\n\n🎯 **To reach ₹1 Crore Net Worth:**\nAt current savings rate, you'll cross **₹1 Crore net worth by 2028** (3 years). Increasing monthly investments by ₹10,000 accelerates this to **2026**!`;
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Namaste Arjun! 👋 I'm your WealthAI co-pilot.\n\nHere's your **quick snapshot** for today:\n📊 Net Worth: **₹71.2L** (↑₹2.3L this month)\n💰 Portfolio: **₹26.5L** (↑₹12,450 today)\n🎯 Health Score: **72/100** (Grade B+)\n⚡ Active Alerts: **3** items need attention\n\nI can help you with:\n• 📊 Portfolio analysis & recommendations\n• 💸 Tax planning & optimization\n• 🎯 Goal tracking & projections\n• 📈 Spending insights\n• 🛡️ Insurance gap analysis\n• 💡 Investment recommendations\n\nWhat would you like to explore today?`;
  }

  if (msg.includes('sip') || msg.includes('mutual fund') || msg.includes('mf')) {
    return `Your **Mutual Fund Portfolio** is performing excellently:\n\n📊 **Total MF Value: ₹7.82L** (Invested: ₹6.05L)\n**Total Gain: ₹1.77L (+29.3%)** 🎉\n\n**Top Performers:**\n1. Nippon Small Cap: +43.18% 🚀\n2. Axis Midcap: +35.37%\n3. Mirae Large Cap: +27.76%\n\n💰 **Monthly SIP: ₹35,000/month**\n• 5 SIPs running across 5 categories\n• Excellent diversification across cap sizes\n\n📈 **Recommendation:**\nAdd **Quant Small Cap Fund** (₹3,000/month SIP) — 5★ rated with 45% 1-year returns. Your allocation to small cap is still below ideal.\n\n🔄 **Review due:** HDFC Balanced Advantage Fund underperforming category avg by 2%. Consider switching to Kotak Flexi Cap.`;
  }

  return `Great question! Based on your financial profile, here are some insights:\n\n💡 **Your Financial Snapshot:**\n• Monthly Income: ₹1.5L | Savings: ₹58,500 (39% savings rate)\n• Net Worth: ₹71.2L | Growing at 18.4% YoY\n• Portfolio: ₹26.5L | +31.8% overall returns\n• Health Score: 72/100 (Grade B+)\n\n🎯 **Top Priorities I'd Recommend:**\n1. **Build Emergency Fund** — Need ₹3L more for 6-month safety net\n2. **Increase Child Education SIP** by ₹3,500/month\n3. **Maximize 80C** — ₹18K remaining, save ₹5,400 in taxes\n4. **Add Critical Illness Cover** — Major gap in protection\n\nAsk me anything specific — tax planning, investment advice, goal projections, spending analysis, or insurance review!`;
};

app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message required' });

  // Simulate processing delay
  const response = generateAIResponse(message);

  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      context: AI_CONTEXT,
    },
  });
});

app.get('/api/ai/insights', (req, res) => {
  res.json({ success: true, data: AI_INSIGHTS });
});

// FIRE Calculator
app.post('/api/tools/fire', (req, res) => {
  const { monthlyExpenses, currentSavings, monthlyContribution, expectedReturn, inflationRate } = req.body;

  const annualExpenses = monthlyExpenses * 12;
  const fireNumber = annualExpenses * 25; // 4% withdrawal rate
  const realReturn = (expectedReturn - inflationRate) / 100;
  const monthlyReturn = realReturn / 12;
  const months = Math.log((fireNumber * monthlyReturn + monthlyContribution) / (currentSavings * monthlyReturn + monthlyContribution)) / Math.log(1 + monthlyReturn);

  res.json({
    success: true,
    data: {
      fireNumber,
      yearsToFIRE: (months / 12).toFixed(1),
      monthsToFIRE: Math.ceil(months),
      projectedFIREDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currentProgress: ((currentSavings / fireNumber) * 100).toFixed(1),
    },
  });
});

// SIP Calculator
app.post('/api/tools/sip', (req, res) => {
  const { monthlyAmount, years, expectedReturn } = req.body;
  const monthlyRate = expectedReturn / 12 / 100;
  const months = years * 12;
  const futureValue = monthlyAmount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));

  res.json({
    success: true,
    data: {
      futureValue: Math.round(futureValue),
      totalInvested: monthlyAmount * months,
      totalReturns: Math.round(futureValue - monthlyAmount * months),
      returnPercentage: (((futureValue - monthlyAmount * months) / (monthlyAmount * months)) * 100).toFixed(1),
    },
  });
});

// Start Server
export default app;
