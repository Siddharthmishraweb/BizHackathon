import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, RefreshCw, BarChart2 } from 'lucide-react';
import { portfolioApi } from '@/utils/api';
import { formatCurrency } from '@/utils/helpers';

const ALLOCATION_COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#eab308'];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 border border-indigo-500/20 shadow-xl">
      {payload.map((p: any) => (
        <div key={p.name} className="text-xs">
          <span className="text-slate-400">{p.name}: </span>
          <span className="text-slate-200 font-semibold">{formatCurrency(p.value, true)}</span>
        </div>
      ))}
    </div>
  );
};

// Performance sparkline data
const PERF_DATA = [
  { m: 'M-12', v: 1680000 }, { m: 'M-10', v: 1820000 }, { m: 'M-8', v: 1760000 },
  { m: 'M-6', v: 2010000 }, { m: 'M-4', v: 2280000 }, { m: 'M-2', v: 2520000 }, { m: 'Now', v: 2650000 },
];

export default function Portfolio() {
  const [summary, setSummary] = useState<any>(null);
  const [holdings, setHoldings] = useState<any>(null);
  const [allocation, setAllocation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stocks' | 'mf' | 'fixed'>('stocks');

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, holdRes, allocRes] = await Promise.all([
          portfolioApi.getSummary(),
          portfolioApi.getHoldings(),
          portfolioApi.getAllocation(),
        ]) as any[];
        if (sumRes.success) setSummary(sumRes.data);
        if (holdRes.success) setHoldings(holdRes.data);
        if (allocRes.success) setAllocation(allocRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="h-40 rounded-2xl skeleton" />)}</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Portfolio Value', value: summary?.totalValue, color: '#6366f1', sub: 'Total market value' },
          { label: 'Total Invested', value: summary?.totalInvested, color: '#06b6d4', sub: 'Capital deployed' },
          { label: 'Total Gains', value: summary?.totalGain, color: '#10b981', sub: `+${summary?.totalGainPercent?.toFixed(2)}% overall` },
          { label: "Today's P&L", value: summary?.dayChange, color: summary?.dayChange > 0 ? '#10b981' : '#ef4444', sub: `${summary?.dayChangePercent > 0 ? '+' : ''}${summary?.dayChangePercent?.toFixed(2)}%` },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card p-5"
          >
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p className="text-xl font-bold text-slate-100">{formatCurrency(card.value || 0, true)}</p>
            <p className="text-xs mt-1" style={{ color: card.color }}>{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Growth Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Portfolio Performance</h2>
              <p className="text-xs text-slate-500">12-month growth trajectory</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <TrendingUp size={16} /> +57.7%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={PERF_DATA}>
              <defs>
                <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="m" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="v" name="Value" stroke="#6366f1" strokeWidth={2.5} fill="url(#perfGrad)" dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Allocation Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-1">Allocation</h2>
          <p className="text-xs text-slate-500 mb-2">By asset class</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={allocation} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2} dataKey="value">
                {allocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => formatCurrency(v, true)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {allocation.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-xs text-slate-500 flex-1 truncate">{item.name}</span>
                <span className="text-xs font-semibold text-slate-400">{item.percentage?.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Holdings Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-slate-200">Holdings</h2>
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {[
              { key: 'stocks', label: 'Stocks' },
              { key: 'mf', label: 'Mutual Funds' },
              { key: 'fixed', label: 'Fixed Income' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stocks Tab */}
        {activeTab === 'stocks' && holdings?.stocks && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Avg. Price</th>
                  <th className="text-right">CMP</th>
                  <th className="text-right">Value</th>
                  <th className="text-right">P&L</th>
                  <th className="text-right">Return</th>
                </tr>
              </thead>
              <tbody>
                {holdings.stocks.map((stock: any) => (
                  <tr key={stock.symbol}>
                    <td>
                      <div>
                        <p className="font-semibold text-slate-200">{stock.symbol}</p>
                        <p className="text-xs text-slate-500">{stock.name}</p>
                      </div>
                    </td>
                    <td className="text-right">{stock.qty}</td>
                    <td className="text-right">₹{stock.avgPrice.toLocaleString()}</td>
                    <td className="text-right">₹{stock.cmp.toLocaleString()}</td>
                    <td className="text-right font-semibold">{formatCurrency(stock.value, true)}</td>
                    <td className={`text-right font-medium ${stock.gain > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stock.gain > 0 ? '+' : ''}{formatCurrency(stock.gain, true)}
                    </td>
                    <td className={`text-right font-semibold ${stock.gainPct > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      <span className="flex items-center gap-1 justify-end">
                        {stock.gainPct > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {stock.gainPct.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mutual Funds Tab */}
        {activeTab === 'mf' && holdings?.mutualFunds && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fund Name</th>
                  <th className="text-right">Units</th>
                  <th className="text-right">NAV</th>
                  <th className="text-right">Value</th>
                  <th className="text-right">Gain</th>
                  <th className="text-right">Return</th>
                  <th className="text-center">SIP</th>
                </tr>
              </thead>
              <tbody>
                {holdings.mutualFunds.map((mf: any) => (
                  <tr key={mf.folio}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-200 text-sm">{mf.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="badge badge-info" style={{ fontSize: '10px', padding: '1px 6px' }}>{mf.category}</span>
                          <span className="text-xs text-slate-600">{mf.risk}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-right text-sm">{mf.units.toFixed(2)}</td>
                    <td className="text-right text-sm">₹{mf.nav.toFixed(2)}</td>
                    <td className="text-right font-semibold">{formatCurrency(mf.value, true)}</td>
                    <td className="text-right text-emerald-400 font-medium">+{formatCurrency(mf.gain, true)}</td>
                    <td className="text-right text-emerald-400 font-semibold">+{mf.gainPct.toFixed(2)}%</td>
                    <td className="text-center">
                      {mf.sipAmount > 0 && (
                        <span className="badge badge-purple" style={{ fontSize: '10px' }}>₹{(mf.sipAmount / 1000).toFixed(0)}K</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Fixed Income Tab */}
        {activeTab === 'fixed' && holdings?.fixedIncome && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th className="text-center">Type</th>
                  <th className="text-right">Invested</th>
                  <th className="text-right">Current Value</th>
                  <th className="text-right">Gain</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Maturity</th>
                </tr>
              </thead>
              <tbody>
                {holdings.fixedIncome.map((fi: any) => (
                  <tr key={fi.name}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-200 text-sm">{fi.name}</p>
                        <p className="text-xs text-slate-500">{fi.institution}</p>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${fi.type === 'FD' ? 'badge-warning' : fi.type === 'PPF' ? 'badge-success' : 'badge-info'}`}
                        style={{ fontSize: '10px', padding: '1px 6px' }}>
                        {fi.type}
                      </span>
                    </td>
                    <td className="text-right">{formatCurrency(fi.invested, true)}</td>
                    <td className="text-right font-semibold">{formatCurrency(fi.currentValue, true)}</td>
                    <td className="text-right text-emerald-400 font-medium">
                      +{formatCurrency(fi.currentValue - fi.invested, true)}
                    </td>
                    <td className="text-right text-amber-400">
                      {fi.interestRate ? `${fi.interestRate}%` : '-'}
                    </td>
                    <td className="text-right text-slate-500 text-xs">
                      {fi.maturityDate ? new Date(fi.maturityDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : fi.maturityAge ? `Age ${fi.maturityAge}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
