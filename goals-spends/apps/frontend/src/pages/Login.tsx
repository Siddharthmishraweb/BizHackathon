import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Target, Brain, ArrowRight, Eye, EyeOff, CheckCircle, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';

const features = [
  { icon: Brain, color: '#6366f1', title: 'AI-Powered Insights', desc: 'Personalized financial advice driven by machine learning' },
  { icon: TrendingUp, color: '#10b981', title: 'Smart Portfolio', desc: 'Real-time tracking across stocks, MFs, NPS and more' },
  { icon: Target, color: '#f59e0b', title: 'Goal Planning', desc: 'Visual progress tracking for all your financial goals' },
  { icon: Shield, color: '#06b6d4', title: '360° Protection', desc: 'Insurance gap analysis and risk coverage reports' },
];

const DEMO_USER = { email: 'arjun.sharma@gmail.com', password: 'Demo@1234' };

export default function Login() {
  const { setAuthenticated } = useStore();
  const [email, setEmail] = useState('arjun.sharma@gmail.com');
  const [password, setPassword] = useState('Demo@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'login' | 'success'>('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      setStep('success');
      await new Promise(r => setTimeout(r, 800));
      setAuthenticated(true);
    } else {
      setError('Invalid credentials. Use the demo account shown.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Background effects */}
      <div className="bg-orb w-[600px] h-[600px] -top-32 -left-32" style={{ background: '#6366f1', opacity: 0.06 }} />
      <div className="bg-orb w-[400px] h-[400px] bottom-0 right-0" style={{ background: '#8b5cf6', opacity: 0.06 }} />

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col flex-1 justify-between p-16 relative overflow-hidden">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              W
            </div>
            <div>
              <span className="gradient-text font-bold text-xl tracking-tight">WealthAI</span>
              <div className="text-xs text-slate-500">AI Financial Co-Pilot</div>
            </div>
          </div>

          {/* Hero text */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-5xl font-bold text-slate-100 leading-tight mb-6">
              Your AI-Powered<br />
              <span className="gradient-text">Financial Co-Pilot</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Transform complex financial data into simple, actionable insights. Plan smarter, invest wiser, and achieve financial freedom.
            </p>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="glass-card p-4"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${f.color}20` }}>
                  <Icon size={18} style={{ color: f.color }} />
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex items-center gap-8"
        >
          {[
            { label: 'Active Users', value: '2.4L+' },
            { label: 'AUM Managed', value: '₹840 Cr' },
            { label: 'Goals Achieved', value: '18,500+' },
            { label: 'Tax Saved', value: '₹42 Cr' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-slate-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-[480px] flex items-center justify-center p-8 relative">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>W</div>
            <span className="gradient-text font-bold text-xl">WealthAI</span>
          </div>

          <div className="glass-card p-8">
            {step === 'success' ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-100 mb-2">Welcome back, Arjun!</h2>
                <p className="text-slate-400 text-sm">Loading your financial dashboard...</p>
                <div className="mt-4 flex justify-center gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }}
                      className="w-2 h-2 rounded-full bg-indigo-400"
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-100 mb-1">Welcome back</h2>
                  <p className="text-slate-500 text-sm">Sign in to your WealthAI account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-field"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="input-field pr-10"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3 mt-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>Sign In <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-6 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap size={12} className="text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-400">Demo Credentials</span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-0.5">
                    <div><span className="text-slate-500">Email:</span> arjun.sharma@gmail.com</div>
                    <div><span className="text-slate-500">Password:</span> Demo@1234</div>
                  </div>
                </div>

                <p className="text-center text-xs text-slate-600 mt-4">
                  By signing in, you agree to our{' '}
                  <span className="text-indigo-400 cursor-pointer hover:underline">Terms</span> and{' '}
                  <span className="text-indigo-400 cursor-pointer hover:underline">Privacy Policy</span>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
