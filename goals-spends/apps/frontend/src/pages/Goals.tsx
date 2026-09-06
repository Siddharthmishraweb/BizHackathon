import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { goalsApi, toolsApi } from '@/utils/api';
import { formatCurrency } from '@/utils/helpers';
import { Target, CheckCircle, AlertCircle, Plus, Calculator, TrendingUp, Calendar } from 'lucide-react';
import type { Goal } from '@/types';

const PRIORITY_STYLES: Record<string, string> = {
  Critical: 'badge-danger',
  High: 'badge-warning',
  Medium: 'badge-info',
  Low: 'badge-purple',
};

function GoalCard({ goal, index, onContribute }: { goal: Goal; index: number; onContribute: (id: string) => void }) {
  const monthsLeft = Math.max(0, Math.round((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card p-6 hover:border-indigo-500/30 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{goal.icon}</div>
          <div>
            <h3 className="font-semibold text-slate-200">{goal.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${PRIORITY_STYLES[goal.priority]}`}>{goal.priority}</span>
              <span className="text-xs text-slate-500">{goal.category}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`flex items-center gap-1 text-sm font-semibold ${goal.onTrack ? 'text-emerald-400' : 'text-red-400'}`}>
            {goal.onTrack ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {goal.onTrack ? 'On Track' : 'Behind'}
          </div>
        </div>
      </div>

      {/* Progress Ring + Amount */}
      <div className="flex items-center gap-6 mb-4">
        <div className="relative">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="45" cy="45" r="38"
              fill="none"
              stroke={goal.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(goal.progress / 100) * 239} 239`}
              transform="rotate(-90 45 45)"
              style={{ filter: `drop-shadow(0 0 6px ${goal.color}60)` }}
            />
            <text x="45" y="41" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="bold">{goal.progress.toFixed(0)}%</text>
            <text x="45" y="55" textAnchor="middle" fill="#64748b" fontSize="9">done</text>
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Saved</span>
            <span className="font-semibold text-slate-300">{formatCurrency(goal.currentAmount, true)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Target</span>
            <span className="font-semibold text-slate-200">{formatCurrency(goal.targetAmount, true)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Monthly SIP</span>
            <span className="font-semibold" style={{ color: goal.color }}>{formatCurrency(goal.monthlyContribution, true)}</span>
          </div>
          {!goal.onTrack && (
            <div className="flex justify-between text-xs">
              <span className="text-red-400">Shortfall/mo</span>
              <span className="text-red-400 font-semibold">
                +{formatCurrency(goal.requiredMonthly - goal.monthlyContribution, true)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar size={12} />
          {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </div>
        <div className="text-xs text-slate-500">{monthsLeft} months left</div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-auto">
          <TrendingUp size={12} />
          {goal.expectedReturn}% p.a.
        </div>
      </div>

      {/* Action */}
      <button
        onClick={() => onContribute(goal.id)}
        className="btn-secondary w-full justify-center py-2 text-xs"
      >
        <Plus size={13} /> Add Contribution
      </button>
    </motion.div>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sipResult, setSipResult] = useState<any>(null);
  const [sipForm, setSipForm] = useState({ monthlyAmount: 10000, years: 10, expectedReturn: 12 });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await goalsApi.getAll() as any;
        if (res.success) setGoals(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleContribute = async (id: string) => {
    const amount = parseInt(prompt('Enter amount to contribute (₹):') || '0');
    if (!amount || amount <= 0) return;
    try {
      const res = await goalsApi.contribute(id, amount) as any;
      if (res.success) {
        setGoals(prev => prev.map(g => g.id === id ? res.data : g));
      }
    } catch (e) { console.error(e); }
  };

  const handleSIPCalc = async () => {
    try {
      const res = await toolsApi.calculateSIP(sipForm) as any;
      if (res.success) setSipResult(res.data);
    } catch (e) { console.error(e); }
  };

  const onTrackCount = goals.filter(g => g.onTrack).length;

  if (loading) return <div className="grid grid-cols-2 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-64 rounded-2xl skeleton" />)}</div>;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Goals', value: goals.length, suffix: '', color: '#6366f1' },
          { label: 'On Track', value: onTrackCount, suffix: ` / ${goals.length}`, color: '#10b981' },
          { label: 'Monthly SIP', value: formatCurrency(goals.reduce((s, g) => s + g.monthlyContribution, 0), true), suffix: '', color: '#f59e0b', isStr: true },
          { label: 'Total Corpus', value: formatCurrency(goals.reduce((s, g) => s + g.currentAmount, 0), true), suffix: '', color: '#06b6d4', isStr: true },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card p-5">
            <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-100">
              {stat.isStr ? stat.value : stat.value}{stat.suffix}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {goals.map((goal, i) => (
          <GoalCard key={goal.id} goal={goal} index={i} onContribute={handleContribute} />
        ))}

        {/* SIP Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: goals.length * 0.08 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Calculator size={16} className="text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 text-sm">SIP Calculator</h3>
              <p className="text-xs text-slate-500">Plan your investments</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {[
              { label: 'Monthly SIP (₹)', key: 'monthlyAmount', min: 500, max: 100000, step: 500 },
              { label: 'Duration (Years)', key: 'years', min: 1, max: 40, step: 1 },
              { label: 'Expected Return (%)', key: 'expectedReturn', min: 6, max: 25, step: 0.5 },
            ].map(f => (
              <div key={f.key}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{f.label}</span>
                  <span className="font-semibold text-slate-300">
                    {f.key === 'monthlyAmount' ? `₹${sipForm.monthlyAmount.toLocaleString()}` :
                     f.key === 'years' ? `${sipForm.years} yrs` : `${sipForm.expectedReturn}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={f.min} max={f.max} step={f.step}
                  value={sipForm[f.key as keyof typeof sipForm]}
                  onChange={e => setSipForm(prev => ({ ...prev, [f.key]: parseFloat(e.target.value) }))}
                  className="w-full accent-indigo-500"
                />
              </div>
            ))}
          </div>

          <button onClick={handleSIPCalc} className="btn-primary w-full justify-center py-2 text-xs mb-4">
            Calculate
          </button>

          {sipResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl space-y-2"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
            >
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Invested Amount</span>
                <span className="text-slate-300 font-semibold">{formatCurrency(sipResult.totalInvested, true)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Wealth Gained</span>
                <span className="text-emerald-400 font-semibold">+{formatCurrency(sipResult.totalReturns, true)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/10 pt-2 mt-2">
                <span className="text-slate-300 font-semibold">Maturity Value</span>
                <span className="gradient-text font-bold text-base">{formatCurrency(sipResult.futureValue, true)}</span>
              </div>
              <p className="text-xs text-center text-slate-500">{sipResult.returnPercentage}% total returns</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
