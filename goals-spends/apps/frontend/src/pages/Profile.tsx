import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/utils/helpers';
import { User, Shield, Bell, Activity, TrendingUp, Settings, LogOut, Calculator } from 'lucide-react';
import { toolsApi } from '@/utils/api';

export default function Profile() {
  const { user, setAuthenticated } = useStore();
  const [fireForm, setFireForm] = useState({ monthlyExpenses: 80000, currentSavings: 2650000, monthlyContribution: 58500, expectedReturn: 11, inflationRate: 6 });
  const [fireResult, setFireResult] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const handleFIRECalc = async () => {
    setCalcLoading(true);
    try {
      const res = await toolsApi.calculateFIRE(fireForm) as any;
      if (res.success) setFireResult(res.data);
    } catch (e) { console.error(e); }
    finally { setCalcLoading(false); }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {user.avatar}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-100">{user.name}</h1>
            <p className="text-slate-400">{user.occupation} at {user.employer}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="badge badge-success">KYC Verified</span>
              <span className="badge badge-info">{user.riskProfile}</span>
              <span className="badge badge-purple">{user.investmentHorizon} horizon</span>
            </div>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {[
              { label: 'Annual CTC', value: formatCurrency(user.annualCTC, true) },
              { label: 'Monthly Take-home', value: formatCurrency(user.monthlyTakeHome, true) },
              { label: 'Age', value: `${user.age} years` },
              { label: 'Dependents', value: user.dependents },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-sm font-semibold text-slate-200">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Profile Details + FIRE Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Personal Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <User size={16} className="text-indigo-400" /> Personal Information
          </h2>
          <div className="grid grid-cols-2 gap-y-3">
            {[
              { label: 'Email', value: user.email },
              { label: 'Phone', value: user.phone },
              { label: 'Location', value: user.location },
              { label: 'PAN', value: user.panNumber },
              { label: 'Marital Status', value: user.maritalStatus },
              { label: 'Member Since', value: new Date(user.joinedDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-sm font-medium text-slate-300 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-white/5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Financial Goals</h3>
            <div className="flex flex-wrap gap-2">
              {user.goals.map((g: string) => (
                <span key={g} className="badge badge-purple" style={{ fontSize: '11px' }}>{g}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FIRE Calculator */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
            <Calculator size={16} className="text-amber-400" /> FIRE Calculator
          </h2>
          <p className="text-xs text-slate-500 mb-4">Financial Independence, Retire Early</p>

          <div className="space-y-3 mb-4">
            {[
              { label: 'Monthly Expenses (₹)', key: 'monthlyExpenses', min: 20000, max: 300000, step: 5000 },
              { label: 'Current Savings (₹)', key: 'currentSavings', min: 0, max: 10000000, step: 100000 },
              { label: 'Monthly Savings (₹)', key: 'monthlyContribution', min: 5000, max: 200000, step: 2500 },
              { label: 'Expected Return (%)', key: 'expectedReturn', min: 6, max: 20, step: 0.5 },
              { label: 'Inflation Rate (%)', key: 'inflationRate', min: 3, max: 10, step: 0.5 },
            ].map(f => (
              <div key={f.key}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{f.label}</span>
                  <span className="font-semibold text-slate-300">
                    {f.key.includes('Amount') || f.key === 'monthlyExpenses' || f.key === 'currentSavings' || f.key === 'monthlyContribution'
                      ? `₹${fireForm[f.key as keyof typeof fireForm].toLocaleString()}`
                      : `${fireForm[f.key as keyof typeof fireForm]}%`}
                  </span>
                </div>
                <input
                  type="range" min={f.min} max={f.max} step={f.step}
                  value={fireForm[f.key as keyof typeof fireForm]}
                  onChange={e => setFireForm(prev => ({ ...prev, [f.key]: parseFloat(e.target.value) }))}
                  className="w-full accent-amber-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleFIRECalc}
            disabled={calcLoading}
            className="btn-primary w-full justify-center py-2.5 text-xs mb-4"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            {calcLoading ? 'Calculating...' : 'Calculate FIRE Date 🔥'}
          </button>

          {fireResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <div className="text-center mb-3">
                <p className="text-2xl font-bold text-amber-400">{fireResult.yearsToFIRE} Years</p>
                <p className="text-xs text-slate-400">to Financial Independence</p>
                <p className="text-xs text-slate-500 mt-0.5">Target: {new Date(fireResult.projectedFIREDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <p className="font-bold text-slate-200">{formatCurrency(fireResult.fireNumber, true)}</p>
                  <p className="text-slate-500">FIRE Number</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-emerald-400">{fireResult.currentProgress}%</p>
                  <p className="text-slate-500">Progress</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Settings size={16} className="text-slate-400" /> Account Settings
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[
            { icon: Bell, label: 'Notifications', desc: 'SIP reminders, goal alerts, market insights', enabled: true },
            { icon: Shield, label: 'Two-Factor Authentication', desc: 'Extra security for your account', enabled: true },
            { icon: Activity, label: 'AI Insights', desc: 'Personalized financial recommendations', enabled: true },
            { icon: TrendingUp, label: 'Portfolio Alerts', desc: 'Daily P&L and rebalancing alerts', enabled: false },
          ].map((setting) => {
            const Icon = setting.icon;
            return (
              <div key={setting.label} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                    <Icon size={15} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">{setting.label}</p>
                    <p className="text-xs text-slate-500">{setting.desc}</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${setting.enabled ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${setting.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <button
          onClick={() => setAuthenticated(false)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors text-sm font-medium border border-red-400/20"
        >
          <LogOut size={15} /> Sign Out of WealthAI
        </button>
      </motion.div>
    </div>
  );
}
