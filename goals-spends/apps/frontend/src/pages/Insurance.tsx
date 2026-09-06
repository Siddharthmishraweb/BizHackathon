import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { insuranceApi } from '@/utils/api';
import { formatCurrency } from '@/utils/helpers';
import { Shield, AlertTriangle, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const COVERAGE_SCORE_COLOR = (score: number) =>
  score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

export default function Insurance() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await insuranceApi.getCoverage() as any;
        if (res.success) setData(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="h-48 rounded-2xl skeleton" />)}</div>;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke={COVERAGE_SCORE_COLOR(data.overallScore)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(data.overallScore / 100) * 264} 264`}
                transform="rotate(-90 50 50)"
                style={{ filter: `drop-shadow(0 0 8px ${COVERAGE_SCORE_COLOR(data.overallScore)}60)` }}
              />
              <text x="50" y="46" textAnchor="middle" fill="#e2e8f0" fontSize="20" fontWeight="bold">{data.overallScore}</text>
              <text x="50" y="60" textAnchor="middle" fill="#64748b" fontSize="10">/ 100</text>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-200 mb-1">Insurance Coverage Score</h2>
            <p className="text-sm text-slate-400">Your overall protection is <span className="text-amber-400 font-semibold">Moderate</span>. You have critical gaps in accident and illness coverage.</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="badge badge-success">3 Active Policies</span>
              <span className="badge badge-danger">4 Gaps Found</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <p className="text-xs text-slate-500 mb-2">Additional premium needed</p>
            <p className="text-2xl font-bold text-amber-400">₹15,500/yr</p>
            <p className="text-xs text-slate-500 mt-1">For ₹95L more coverage</p>
          </div>
        </div>
      </motion.div>

      {/* Active Policies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Life Insurance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Shield size={18} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Term Life Insurance</h3>
              <span className="badge badge-success" style={{ fontSize: '10px', padding: '1px 6px' }}>Active</span>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Provider', value: data.life.provider },
              { label: 'Sum Assured', value: formatCurrency(data.life.sumAssured, true), highlight: true },
              { label: 'Annual Premium', value: formatCurrency(data.life.premium) },
              { label: 'Recommended Cover', value: formatCurrency(data.life.recommendedCover, true) },
              { label: 'Policy End', value: new Date(data.life.maturityDate).getFullYear() },
            ].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className={`text-xs font-semibold ${item.highlight ? 'text-emerald-400' : 'text-slate-300'}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle size={12} /> Coverage is adequate for current liabilities
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-slate-500 mb-1.5">Nominees</p>
            {data.life.nominees.map((n: string) => (
              <div key={n} className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> {n}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Health Insurance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Shield size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Health Insurance</h3>
              <span className="badge badge-warning" style={{ fontSize: '10px', padding: '1px 6px' }}>Moderate</span>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Provider', value: data.health.provider },
              { label: 'Sum Insured', value: formatCurrency(data.health.sumInsured, true), highlight: false },
              { label: 'Recommended', value: formatCurrency(data.health.recommendedCover, true), highlight: true },
              { label: 'Annual Premium', value: formatCurrency(data.health.premium) },
              { label: 'Renewal Date', value: new Date(data.health.renewalDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
            ].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className={`text-xs font-semibold ${item.highlight ? 'text-amber-400' : 'text-slate-300'}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertTriangle size={12} /> ₹10L may be insufficient. Upgrade recommended
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {data.health.features.slice(0, 3).map((f: string) => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle size={11} className="text-emerald-400" /> {f}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Vehicle Insurance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Shield size={18} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Vehicle Insurance</h3>
              <span className="badge badge-success" style={{ fontSize: '10px', padding: '1px 6px' }}>Active</span>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Provider', value: data.vehicle.provider },
              { label: 'Vehicle Reg.', value: data.vehicle.vehicleReg },
              { label: 'IDV', value: formatCurrency(data.vehicle.idv, true) },
              { label: 'Annual Premium', value: formatCurrency(data.vehicle.premium) },
              { label: 'Renewal Date', value: new Date(data.vehicle.renewalDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
            ].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="text-xs font-semibold text-slate-300">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle size={12} /> Comprehensive coverage with add-ons
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {data.vehicle.addOns.map((addon: string) => (
              <div key={addon} className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> {addon}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Gaps */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Coverage Gaps Detected</h2>
            <p className="text-xs text-slate-500 mt-0.5">Critical insurance you're missing</p>
          </div>
          <span className="badge badge-danger">{data.gaps.length} Gaps</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {data.gaps.map((gap: any, i: number) => (
            <motion.div
              key={gap.type}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-4 rounded-xl flex gap-3"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <XCircle size={18} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-slate-200">{gap.type}</h3>
                  <span className={`badge ${gap.importance === 'High' ? 'badge-danger' : 'badge-warning'}`}
                    style={{ fontSize: '10px', padding: '1px 6px' }}>
                    {gap.importance}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{gap.recommendation}</p>
                <button className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                  Get Quote <ChevronRight size={11} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
