import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { taxApi } from '@/utils/api';
import { formatCurrency } from '@/utils/helpers';
import { AlertCircle, CheckCircle, TrendingDown, Zap, ArrowRight } from 'lucide-react';

export default function TaxOptimizer() {
  const [taxData, setTaxData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await taxApi.getSummary() as any;
        if (res.success) setTaxData(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="h-48 rounded-2xl skeleton" />)}</div>;

  const { incomeDetails, deductions, taxCalculation, potentialSavings } = taxData;

  const deductionData = [
    { subject: '80C', A: (deductions.section80C.utilized / deductions.section80C.limit) * 100, fullMark: 100 },
    { subject: '80D', A: (deductions.section80D.utilized / deductions.section80D.limit) * 100, fullMark: 100 },
    { subject: '80CCD', A: (deductions.section80CCD.utilized / deductions.section80CCD.limit) * 100, fullMark: 100 },
    { subject: '24(b)', A: (deductions.section24b.utilized / deductions.section24b.limit) * 100, fullMark: 100 },
    { subject: 'HRA', A: 75, fullMark: 100 },
    { subject: 'LTA', A: 0, fullMark: 100 },
  ];

  const taxPieData = [
    { name: 'Tax Paid', value: taxCalculation.taxBeforeRebate, color: '#ef4444' },
    { name: 'Net Income', value: incomeDetails.grossIncome - taxCalculation.taxBeforeRebate, color: '#10b981' },
  ];

  const totalPotentialSaving = potentialSavings.reduce((s: number, p: any) => s + p.saving, 0);

  const deductionSections = [
    { key: 'section80C', label: 'Section 80C', desc: 'ELSS, PPF, LIC, EPF', color: '#6366f1', data: deductions.section80C },
    { key: 'section80D', label: 'Section 80D', desc: 'Health Insurance Premiums', color: '#10b981', data: deductions.section80D },
    { key: 'section80CCD', label: 'Section 80CCD(1B)', desc: 'NPS Additional Contribution', color: '#06b6d4', data: deductions.section80CCD },
    { key: 'section24b', label: 'Section 24(b)', desc: 'Home Loan Interest', color: '#f59e0b', data: deductions.section24b },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gross Income', value: incomeDetails.grossIncome, color: '#10b981' },
          { label: 'Taxable Income', value: taxCalculation.taxableIncome, color: '#f59e0b' },
          { label: 'Total Tax', value: taxCalculation.taxBeforeRebate, color: '#ef4444' },
          { label: 'Effective Tax Rate', value: `${taxCalculation.effectiveTaxRate}%`, color: '#6366f1', isStr: true },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card p-5">
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p className="text-xl font-bold text-slate-100">
              {card.isStr ? card.value : formatCurrency(card.value as number, true)}
            </p>
            <p className="text-xs mt-1" style={{ color: card.color }}>FY {taxData.financialYear}</p>
          </motion.div>
        ))}
      </div>

      {/* Tax Savings Opportunity Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="p-5 rounded-2xl flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)', border: '1px solid rgba(99,102,241,0.3)' }}
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <Zap size={24} className="text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-200">You can save ₹{totalPotentialSaving.toLocaleString()} more in taxes!</h3>
          <p className="text-sm text-slate-400 mt-0.5">Act on {potentialSavings.length} optimization opportunities before March 2026</p>
        </div>
        <button className="btn-primary flex-shrink-0">
          Optimize Now <ArrowRight size={14} />
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Deduction Tracker */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2 glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-5">Deduction Utilization Tracker</h2>
          <div className="space-y-5">
            {deductionSections.map((section) => {
              const pct = (section.data.utilized / section.data.limit) * 100;
              return (
                <div key={section.key}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-semibold text-slate-200">{section.label}</span>
                      <span className="text-xs text-slate-500 ml-2">{section.desc}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-200">{formatCurrency(section.data.utilized, true)}</span>
                      <span className="text-xs text-slate-500"> / {formatCurrency(section.data.limit, true)}</span>
                    </div>
                  </div>
                  <div className="progress-bar-track h-2.5 mb-1">
                    <motion.div
                      className="progress-bar-fill h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                      style={{ background: section.color }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      {section.data.breakdown.slice(0, 2).map((b: any) => (
                        <div key={b.name} className="flex items-center gap-1 text-xs text-slate-500">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: section.color }} />
                          {b.name.split('(')[0].trim()}: {formatCurrency(b.amount, true)}
                        </div>
                      ))}
                    </div>
                    {section.data.remaining > 0 ? (
                      <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                        <AlertCircle size={11} /> ₹{(section.data.remaining / 1000).toFixed(0)}K remaining
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle size={11} /> Fully utilized
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Income Breakdown */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Income Breakdown</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Gross Salary', value: incomeDetails.salary },
                { label: 'HRA Exemption', value: -incomeDetails.hraExemption, neg: true },
                { label: 'Standard Deduction', value: -incomeDetails.standardDeduction, neg: true },
                { label: 'Net Taxable Income', value: incomeDetails.grossIncome, highlight: true },
              ].map(item => (
                <div key={item.label} className={`flex justify-between p-3 rounded-xl ${item.highlight ? '' : ''}`}
                  style={{ background: item.highlight ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)' }}>
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className={`text-xs font-semibold ${item.neg ? 'text-emerald-400' : item.highlight ? 'text-indigo-300' : 'text-slate-300'}`}>
                    {item.neg ? '-' : ''}{formatCurrency(Math.abs(item.value), true)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Radar Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <h2 className="text-sm font-semibold text-slate-200 mb-2">Deduction Coverage</h2>
            <p className="text-xs text-slate-500 mb-2">% of limit utilized</p>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={deductionData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Radar name="Utilized" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Tax Breakdown Pie */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-6">
            <h2 className="text-sm font-semibold text-slate-200 mb-3">Tax vs Net Income</h2>
            <div className="flex justify-center mb-3">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={taxPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                    {taxPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {taxPieData.map(item => (
              <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs text-slate-400">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-300">{formatCurrency(item.value, true)}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Tax Saving Recommendations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-200">Tax Optimization Actions</h2>
          <span className="badge badge-success">Save ₹{totalPotentialSaving.toLocaleString()}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {potentialSavings.map((item: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              className="p-4 rounded-xl flex gap-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                item.urgency === 'High' ? 'bg-red-500/15' : item.urgency === 'Medium' ? 'bg-amber-500/15' : 'bg-slate-500/15'
              }`}>
                <TrendingDown size={14} className={item.urgency === 'High' ? 'text-red-400' : item.urgency === 'Medium' ? 'text-amber-400' : 'text-slate-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-indigo-300">{item.section}</span>
                  <span className={`badge ${item.urgency === 'High' ? 'badge-danger' : item.urgency === 'Medium' ? 'badge-warning' : 'badge-purple'}`}
                    style={{ fontSize: '10px', padding: '1px 6px' }}>
                    {item.urgency}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">{item.action}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Potential Saving</span>
                  <span className="text-sm font-bold text-emerald-400">₹{item.saving.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
