import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Wallet, PiggyBank,
  ArrowUpRight, ArrowDownRight, Zap, AlertCircle, CheckCircle,
  Info, Target, ChevronRight, Brain, Activity
} from 'lucide-react';
import { dashboardApi } from '@/utils/api';
import { formatCurrency } from '@/utils/helpers';
import type { NetWorthPoint, CashFlowPoint, AIInsight } from '@/types';

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

// Mirrors PORTFOLIO.allocation on the backend (equity/MF/NPS+PPF/FD/gold+bonds rollup).
const ALLOCATION_DATA = [
  { name: 'Equity Stocks', pct: 20.1, color: '#6366f1' },
  { name: 'Mutual Funds', pct: 29.5, color: '#8b5cf6' },
  { name: 'Fixed Deposits', pct: 21.4, color: '#f59e0b' },
  { name: 'NPS + PPF', pct: 26.8, color: '#10b981' },
  { name: 'Gold & Bonds', pct: 9.2, color: '#06b6d4' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 border border-indigo-500/20 shadow-xl">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-slate-200 font-semibold">{formatCurrency(p.value, true)}</span>
        </div>
      ))}
    </div>
  );
};

const InsightIcon = ({ type }: { type: string }) => {
  const configs = {
    opportunity: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    alert: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
    recommendation: { icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  };
  const c = configs[type as keyof typeof configs] || configs.recommendation;
  const Icon = c.icon;
  return (
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.bg}`}>
      <Icon size={15} className={c.color} />
    </div>
  );
};

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [netWorthHistory, setNetWorthHistory] = useState<NetWorthPoint[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowPoint[]>([]);
  const [spending, setSpending] = useState<any[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, nwRes, cfRes, spRes, aiRes] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getNetWorthHistory(),
          dashboardApi.getCashFlow(),
          dashboardApi.getSpendingBreakdown(),
          dashboardApi.getAIInsights(),
        ]) as any[];
        if (sumRes.success) setSummary(sumRes.data);
        if (nwRes.success) setNetWorthHistory(nwRes.data);
        if (cfRes.success) setCashFlow(cfRes.data);
        if (spRes.success) setSpending(spRes.data.monthly);
        if (aiRes.success) setInsights(aiRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-64 rounded-2xl skeleton" />
          <div className="h-64 rounded-2xl skeleton" />
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      label: 'Net Worth',
      value: summary?.netWorth || 0,
      change: summary?.netWorthChange || 0,
      changePct: parseFloat(summary?.netWorthChangePct || 0),
      icon: TrendingUp,
      color: '#6366f1',
      gradient: 'from-indigo-500/20 to-violet-500/10',
      positive: true,
    },
    {
      label: 'Monthly Income',
      value: summary?.monthlyIncome || 0,
      change: 8000,
      changePct: 5.6,
      icon: DollarSign,
      color: '#10b981',
      gradient: 'from-emerald-500/20 to-teal-500/10',
      positive: true,
    },
    {
      label: 'Monthly Expenses',
      value: summary?.monthlyExpenses || 0,
      change: 1200,
      changePct: 1.2,
      icon: Wallet,
      color: '#ef4444',
      gradient: 'from-red-500/20 to-rose-500/10',
      positive: false,
    },
    {
      label: 'Monthly Savings',
      value: summary?.monthlySavings || 0,
      change: summary?.savingsRate ? null : 0,
      changePct: parseFloat(summary?.savingsRate || 0),
      isRate: true,
      icon: PiggyBank,
      color: '#f59e0b',
      gradient: 'from-amber-500/20 to-yellow-500/10',
      positive: true,
    },
  ];

  const topSpending = spending.slice(0, 5).sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, i) => {
          const Icon = card.icon;
          const isPositive = card.positive ? card.changePct >= 0 : card.changePct <= 0;
          return (
            <motion.div
              key={card.label}
              custom={i}
              variants={CARD_VARIANTS}
              initial="hidden"
              animate="visible"
              className="stat-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {card.isRate ? `${card.changePct}% rate` : `${Math.abs(card.changePct)}%`}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100 animated-number">
                  {formatCurrency(card.value, true)}
                </p>
                <p className="text-xs text-slate-500 mt-1">{card.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Row 2: Net Worth Chart + Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Net Worth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-200">Net Worth Journey</h2>
              <p className="text-xs text-slate-500 mt-0.5">12-month wealth trajectory</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-lg font-bold text-slate-100">{formatCurrency(summary?.netWorth, true)}</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1 justify-end">
                  <TrendingUp size={10} />
                  +{formatCurrency(summary?.netWorthChange, true)} this month
                </p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={netWorthHistory}>
              <defs>
                <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="assetsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#6366f1" strokeWidth={2.5} fill="url(#netWorthGrad)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
              <Area type="monotone" dataKey="assets" name="Total Assets" stroke="#10b981" strokeWidth={1.5} fill="url(#assetsGrad)" strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Asset Allocation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="text-base font-semibold text-slate-200 mb-1">Asset Allocation</h2>
          <p className="text-xs text-slate-500 mb-4">Portfolio breakdown</p>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={ALLOCATION_DATA}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={2}
                  dataKey="pct"
                  nameKey="name"
                >
                  {ALLOCATION_DATA.map(item => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Allocation list */}
          <div className="space-y-2 mt-2">
            {ALLOCATION_DATA.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-xs text-slate-400 flex-1 truncate">{item.name}</span>
                <span className="text-xs font-semibold text-slate-300">{item.pct}%</span>
                <div className="w-16 progress-bar-track h-1.5">
                  <div className="progress-bar-fill h-full" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 3: Cash Flow + Health Score + Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cash Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-6"
        >
          <h2 className="text-base font-semibold text-slate-200 mb-1">Cash Flow</h2>
          <p className="text-xs text-slate-500 mb-4">Income vs Expenses (6M)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cashFlow} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.7} />
              <Bar dataKey="savings" name="Savings" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Financial Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-200">Financial Health</h2>
              <p className="text-xs text-slate-500">AI-assessed score</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold gradient-text">{summary?.healthScore || 72}</div>
              <div className="text-xs text-slate-400">Grade {summary?.healthGrade || 'B+'}</div>
            </div>
          </div>

          {/* Score ring visualization */}
          <div className="flex justify-center mb-4">
            <svg width="120" height="120" viewBox="0 0 120 120" className="score-ring">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(72 / 100) * 314} 314`}
                transform="rotate(-90 60 60)"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <text x="60" y="56" textAnchor="middle" fill="#e2e8f0" fontSize="22" fontWeight="bold">72</text>
              <text x="60" y="72" textAnchor="middle" fill="#64748b" fontSize="10">/ 100</text>
            </svg>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Income Stability', score: 88, color: '#10b981' },
              { label: 'Savings Rate', score: 68, color: '#6366f1' },
              { label: 'Debt Management', score: 62, color: '#f59e0b' },
              { label: 'Emergency Fund', score: 55, color: '#ef4444' },
            ].map(dim => (
              <div key={dim.label} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-32 flex-shrink-0">{dim.label}</span>
                <div className="flex-1 progress-bar-track h-1.5">
                  <motion.div
                    className="progress-bar-fill h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.score}%` }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    style={{ background: dim.color }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-400 w-6 text-right">{dim.score}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Spending */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-200">Top Spending</h2>
              <p className="text-xs text-slate-500">August 2025</p>
            </div>
            <span className="text-xs text-slate-500">This Month</span>
          </div>
          <div className="space-y-3">
            {[
              { category: 'Housing', amount: 38500, pct: 38.7, over: false, color: '#6366f1' },
              { category: 'Investments', amount: 35000, pct: 35.2, over: false, color: '#10b981' },
              { category: 'Education', amount: 18000, pct: 18.1, over: false, color: '#84cc16' },
              { category: 'Groceries', amount: 8400, pct: 8.4, over: true, color: '#f59e0b' },
              { category: 'Food & Dining', amount: 6200, pct: 6.2, over: true, color: '#ef4444' },
            ].map((item, i) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{item.category}</span>
                  <div className="flex items-center gap-2">
                    {item.over && (
                      <span className="text-xs text-red-400 flex items-center gap-0.5">
                        <ArrowUpRight size={10} /> Over
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-300">{formatCurrency(item.amount, true)}</span>
                  </div>
                </div>
                <div className="progress-bar-track h-1.5">
                  <motion.div
                    className="progress-bar-fill h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(item.pct * 2, 100)}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
                    style={{ background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 4: AI Insights + Recent Transactions + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Brain size={14} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">AI Insights</h2>
              <p className="text-xs text-slate-500">{insights.length} active recommendations</p>
            </div>
          </div>
          <div className="space-y-3">
            {insights.slice(0, 4).map((insight) => (
              <motion.div
                key={insight.id}
                whileHover={{ x: 2 }}
                className="flex gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <InsightIcon type={insight.type} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-300 mb-0.5">{insight.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{insight.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <button className="mt-4 w-full text-xs text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 transition-colors">
            View all insights <ChevronRight size={12} />
          </button>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Recent Transactions</h2>
              <p className="text-xs text-slate-500">Last 7 days</p>
            </div>
            <Activity size={14} className="text-slate-500" />
          </div>
          <div className="space-y-2">
            {[
              { desc: 'Infosys Salary Credit', amt: 150000, type: 'credit', cat: 'Income', date: 'Aug 15' },
              { desc: 'Home Loan EMI', amt: -35000, type: 'debit', cat: 'Housing', date: 'Aug 14' },
              { desc: 'Swiggy Order', amt: -850, type: 'debit', cat: 'Food', date: 'Aug 14' },
              { desc: 'BigBasket Grocery', amt: -4200, type: 'debit', cat: 'Groceries', date: 'Aug 13' },
              { desc: 'Amazon Purchase', amt: -3499, type: 'debit', cat: 'Shopping', date: 'Aug 12' },
              { desc: 'Netflix Subscription', amt: -649, type: 'debit', cat: 'Entertainment', date: 'Aug 10' },
            ].map((txn, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/4 last:border-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  txn.type === 'credit' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {txn.cat.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">{txn.desc}</p>
                  <p className="text-xs text-slate-600">{txn.date}</p>
                </div>
                <span className={`text-xs font-semibold ${txn.type === 'credit' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {txn.type === 'credit' ? '+' : ''}{formatCurrency(txn.amt, true)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Goal Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Goal Progress</h2>
              <p className="text-xs text-slate-500">5 active goals</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { name: "Child's Education", icon: '🎓', progress: 13.75, current: 550000, target: 4000000, onTrack: false, color: '#6366f1' },
              { name: 'Retirement', icon: '🏖️', progress: 4.17, current: 1250000, target: 30000000, onTrack: true, color: '#10b981' },
              { name: 'Home Renovation', icon: '🏡', progress: 20, current: 300000, target: 1500000, onTrack: true, color: '#f59e0b' },
              { name: 'Emergency Fund', icon: '🛡️', progress: 50, current: 300000, target: 600000, onTrack: false, color: '#ef4444' },
              { name: 'Europe Vacation', icon: '✈️', progress: 24, current: 120000, target: 500000, onTrack: false, color: '#06b6d4' },
            ].map((goal, i) => (
              <div key={goal.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{goal.icon}</span>
                    <span className="text-xs font-medium text-slate-300 max-w-[110px] truncate">{goal.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${goal.onTrack ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className="text-xs font-semibold text-slate-400">{goal.progress.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="progress-bar-track h-1.5">
                  <motion.div
                    className="progress-bar-fill h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.7 }}
                    style={{ background: goal.color }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">{formatCurrency(goal.current, true)}</span>
                  <span className="text-xs text-slate-600">{formatCurrency(goal.target, true)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
