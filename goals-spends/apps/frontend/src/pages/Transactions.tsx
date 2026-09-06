import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Filter, Search, Download } from 'lucide-react';
import { transactionsApi } from '@/utils/api';
import { formatCurrency, formatDate } from '@/utils/helpers';
import type { Transaction } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  'Income': '#10b981',
  'Housing': '#6366f1',
  'Food & Dining': '#ef4444',
  'Groceries': '#f59e0b',
  'Transport': '#8b5cf6',
  'Entertainment': '#06b6d4',
  'Shopping': '#f97316',
  'Health': '#ec4899',
  'Education': '#84cc16',
  'Investment': '#10b981',
  'Insurance': '#3b82f6',
  'Utilities': '#14b8a6',
  'Loan EMI': '#94a3b8',
  'Tax': '#a855f7',
  'Tax Refund': '#34d399',
  'Interest Income': '#fbbf24',
  'Dividend': '#34d399',
  'Travel': '#60a5fa',
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [txnRes, catRes] = await Promise.all([
          transactionsApi.getAll(),
          transactionsApi.getCategories(),
        ]) as any[];
        if (txnRes.success) {
          setTransactions(txnRes.data.transactions);
          setTotalIncome(txnRes.data.totalIncome);
          setTotalExpenses(txnRes.data.totalExpenses);
        }
        if (catRes.success) setCategories(catRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Most recent 6 distinct year-months actually present in the loaded transactions —
  // previously hardcoded to '2025-08'..'2025-03', which silently went stale (empty charts)
  // once the underlying transaction data no longer covered those exact calendar months.
  const months = useMemo(
    () => Array.from(new Set(transactions.map(t => t.date.slice(0, 7)))).sort().reverse().slice(0, 6),
    [transactions]
  );
  const latestMonth = months[0];

  const filtered = transactions.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchMonth = selectedMonth === 'All' || t.date.startsWith(selectedMonth);
    return matchSearch && matchCat && matchMonth;
  });

  // Category breakdown for the most recent month present in the data
  const categoryData = filtered
    .filter(t => t.type === 'debit' && !!latestMonth && t.date.startsWith(latestMonth))
    .reduce((acc: any[], t) => {
      const existing = acc.find(a => a.name === t.category);
      if (existing) existing.value += Math.abs(t.amount);
      else acc.push({ name: t.category, value: Math.abs(t.amount) });
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Monthly trend
  const monthlyTrend = months.map(m => {
    const monthTxns = transactions.filter(t => t.date.startsWith(m));
    return {
      month: m.slice(5),
      income: monthTxns.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0),
      expenses: Math.abs(monthTxns.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)),
    };
  }).reverse();

  if (loading) return <div className="h-64 rounded-2xl skeleton" />;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Income', value: totalIncome, color: '#10b981', icon: ArrowUpRight },
          { label: 'Total Expenses', value: totalExpenses, color: '#ef4444', icon: ArrowDownRight },
          { label: 'Net Balance', value: totalIncome - totalExpenses, color: '#6366f1', icon: ArrowUpRight },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: card.color }} />
                <span className="text-xs text-slate-500">{card.label}</span>
              </div>
              <p className="text-xl font-bold text-slate-100">{formatCurrency(card.value, true)}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Monthly Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyTrend} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: any) => formatCurrency(v, true)} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Aug Spending by Category</h2>
          <div className="flex gap-4 items-center">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={CATEGORY_COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[item.name] || '#6366f1' }} />
                  <span className="text-xs text-slate-400 flex-1 truncate">{item.name}</span>
                  <span className="text-xs font-medium text-slate-300">{formatCurrency(item.value, true)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters + Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="input-field pl-9 text-sm py-2"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="input-field py-2 text-sm w-auto"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="input-field py-2 text-sm w-auto"
          >
            <option value="All">All Months</option>
            {months.map(m => <option key={m} value={m}>{new Date(m + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</option>)}
          </select>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter size={12} /> {filtered.length} records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Merchant</th>
                <th>Mode</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 30).map((txn) => (
                <tr key={txn.id}>
                  <td className="text-slate-500 text-xs">{formatDate(txn.date)}</td>
                  <td>
                    <p className="font-medium text-slate-200 text-sm">{txn.description}</p>
                  </td>
                  <td>
                    <span className="badge" style={{ background: `${CATEGORY_COLORS[txn.category] || '#6366f1'}20`, color: CATEGORY_COLORS[txn.category] || '#a5b4fc', border: `1px solid ${CATEGORY_COLORS[txn.category] || '#6366f1'}40`, fontSize: '11px', padding: '2px 8px' }}>
                      {txn.category}
                    </span>
                  </td>
                  <td className="text-slate-400 text-xs">{txn.merchant}</td>
                  <td className="text-slate-500 text-xs">{txn.mode}</td>
                  <td className={`text-right font-semibold text-sm ${txn.type === 'credit' ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {txn.type === 'credit' ? '+' : '-'}
                    {formatCurrency(Math.abs(txn.amount), true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
