import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { investmentsApi } from '@/utils/api';
import { formatCurrency } from '@/utils/helpers';
import { TrendingUp, Star, Tag, ArrowUpRight, Shield, DollarSign, BarChart2 } from 'lucide-react';
import type { InvestmentRecommendation } from '@/types';

const TYPE_COLORS: Record<string, string> = {
  'Mutual Fund': '#6366f1',
  'Stock': '#10b981',
  'Bond': '#f59e0b',
  'NPS': '#06b6d4',
};

const TAG_STYLES: Record<string, string> = {
  'Top Pick': 'badge-purple',
  'High Growth': 'badge-success',
  'Stable': 'badge-info',
  'Safe': 'badge-warning',
  'Tax Saver': 'badge-danger',
};

const RISK_COLORS: Record<string, string> = {
  'Very High': '#ef4444',
  'High': '#f97316',
  'Moderate-High': '#f59e0b',
  'Moderate': '#06b6d4',
  'Low-Moderate': '#10b981',
  'Low': '#34d399',
};

function StarRating({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array(5).fill(0).map((_, i) => (
        <Star key={i} size={11} className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
      ))}
    </div>
  );
}

export default function Investments() {
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await investmentsApi.getRecommendations() as any;
        if (res.success) setRecommendations(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const types = ['All', 'Mutual Fund', 'Stock', 'Bond', 'NPS'];
  const filtered = selectedType === 'All' ? recommendations : recommendations.filter(r => r.type === selectedType);

  if (loading) return <div className="grid grid-cols-2 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-56 rounded-2xl skeleton" />)}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
            <TrendingUp size={24} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-200">AI Investment Recommendations</h2>
            <p className="text-sm text-slate-400">Personalized picks based on your risk profile, goals and existing portfolio</p>
          </div>
          <div className="hidden lg:flex gap-6">
            {[
              { label: 'Risk Profile', value: 'Mod-Aggressive' },
              { label: 'Investment Horizon', value: '15-20 Years' },
              { label: 'Monthly Budget', value: '₹20,000+' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-sm font-semibold text-indigo-300">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {types.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              selectedType === type
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'glass-card text-slate-500 hover:text-slate-300'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Recommendation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 hover:border-indigo-500/30 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${TYPE_COLORS[rec.type] || '#6366f1'}20` }}>
                  {rec.type === 'Stock' ? <TrendingUp size={18} style={{ color: TYPE_COLORS[rec.type] }} /> :
                   rec.type === 'Bond' ? <Shield size={18} style={{ color: TYPE_COLORS[rec.type] }} /> :
                   rec.type === 'NPS' ? <DollarSign size={18} style={{ color: TYPE_COLORS[rec.type] }} /> :
                   <BarChart2 size={18} style={{ color: TYPE_COLORS[rec.type] }} />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 max-w-[200px] line-clamp-1">{rec.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`badge ${TAG_STYLES[rec.tag] || 'badge-purple'}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                      <Tag size={9} /> {rec.tag}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${TYPE_COLORS[rec.type]}20`, color: TYPE_COLORS[rec.type] }}>
                      {rec.type}
                    </span>
                  </div>
                </div>
              </div>
              {rec.rating && <StarRating rating={rec.rating} />}
              {rec.upside && (
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight size={14} /> +{rec.upside}%
                  </p>
                  <p className="text-xs text-slate-500">Upside</p>
                </div>
              )}
            </div>

            {/* Returns */}
            {rec.returns && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Object.entries(rec.returns).map(([period, ret]) => (
                  <div key={period} className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-sm font-bold text-emerald-400">{ret}%</p>
                    <p className="text-xs text-slate-500">{period} Return</p>
                  </div>
                ))}
              </div>
            )}

            {/* Key Info */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Risk Level</span>
                <span className="font-semibold" style={{ color: RISK_COLORS[rec.risk] || '#64748b' }}>{rec.risk}</span>
              </div>
              {rec.minSIP && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Min SIP</span>
                  <span className="text-slate-300 font-medium">{formatCurrency(rec.minSIP)}/month</span>
                </div>
              )}
              {rec.couponRate && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Coupon Rate</span>
                  <span className="text-amber-400 font-semibold">{rec.couponRate}% p.a.</span>
                </div>
              )}
              {(rec as any).aum && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">AUM</span>
                  <span className="text-slate-300">{(rec as any).aum}</span>
                </div>
              )}
            </div>

            {/* Why Recommended */}
            <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <p className="text-xs text-slate-400 leading-relaxed">{rec.reason}</p>
            </div>

            {/* CTA */}
            <button className="btn-primary w-full justify-center py-2 text-xs">
              {rec.minSIP ? `Start SIP ₹${rec.minSIP.toLocaleString()}/mo` :
               rec.type === 'Stock' ? 'View Analysis' :
               rec.type === 'Bond' ? 'Invest Now' : 'Learn More'}
              <ArrowUpRight size={13} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-xs text-slate-600">
          ⚠️ <strong className="text-slate-500">Disclaimer:</strong> Investment recommendations are AI-generated based on your financial profile and historical data. 
          Past performance does not guarantee future results. Please consult a SEBI-registered financial advisor before making investment decisions. 
          Mutual fund investments are subject to market risks. Read all scheme related documents carefully.
        </p>
      </motion.div>
    </div>
  );
}
