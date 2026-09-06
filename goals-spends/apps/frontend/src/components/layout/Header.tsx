import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { dashboardApi } from '@/utils/api';
import type { MarketItem } from '@/types';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Financial Dashboard', subtitle: 'Your complete financial overview' },
  '/portfolio': { title: 'Investment Portfolio', subtitle: 'Track your wealth growth' },
  '/transactions': { title: 'Transactions', subtitle: 'Your spending history' },
  '/goals': { title: 'Financial Goals', subtitle: 'Stay on track toward your dreams' },
  '/investments': { title: 'Investment Recommendations', subtitle: 'AI-curated opportunities' },
  '/tax': { title: 'Tax Optimizer', subtitle: 'Maximize your tax savings' },
  '/insurance': { title: 'Insurance Coverage', subtitle: 'Your protection analysis' },
  '/ai-advisor': { title: 'AI Financial Advisor', subtitle: 'Your personal wealth co-pilot' },
  '/profile': { title: 'Profile & Settings', subtitle: 'Manage your account' },
};

export default function Header() {
  const location = useLocation();
  const { marketData, setMarketData, user } = useStore();
  const [notifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'WealthAI', subtitle: '' };

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await dashboardApi.getMarketData() as any;
        if (res.success) {
          setMarketData(res.data);
          setLastUpdated(new Date());
        }
      } catch { /* ignore */ }
    };
    fetchMarket();
    const interval = setInterval(fetchMarket, 30000);
    return () => clearInterval(interval);
  }, [setMarketData]);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0"
      style={{ background: 'rgba(5,11,23,0.95)', backdropFilter: 'blur(20px)' }}
    >
      {/* Page Title */}
      <div>
        <h1 className="text-base font-semibold text-slate-100">{pageInfo.title}</h1>
        <p className="text-xs text-slate-500">{pageInfo.subtitle}</p>
      </div>

      {/* Market Ticker */}
      <div className="hidden lg:flex items-center gap-2 overflow-hidden max-w-lg">
        {marketData.slice(0, 4).map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="market-pill"
          >
            <span className="text-slate-400 font-medium">{item.name}</span>
            <span className="text-slate-200 font-semibold">
              {item.name === 'USD/INR' ? `₹${item.value.toFixed(2)}` : item.value.toLocaleString('en-IN')}
            </span>
            <span className={`flex items-center gap-0.5 font-medium ${item.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(item.changePct).toFixed(2)}%
            </span>
          </motion.div>
        ))}
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <RefreshCw size={10} className="animate-spin-slow" />
          Live
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
          <Search size={16} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors relative"
          >
            <Bell size={16} />
            {notifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                {notifications}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-10 w-80 rounded-2xl p-4 z-50 shadow-2xl"
                style={{ background: 'rgba(8,13,26,0.98)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-200">Notifications</h3>
                  <span className="badge badge-danger">3 New</span>
                </div>
                {[
                  { title: '80C Limit Alert', desc: '₹18,000 remaining in Section 80C. Invest before March 2026!', color: '#f59e0b', time: '2h ago' },
                  { title: 'SIP Executed', desc: 'Mirae Asset SIP of ₹10,000 processed successfully', color: '#10b981', time: '1d ago' },
                  { title: 'Goal Behind Target', desc: "Child's Education goal needs ₹3,500 more/month", color: '#ef4444', time: '2d ago' },
                ].map((n, i) => (
                  <div key={i} className="flex gap-3 py-2.5 border-b border-white/5 last:border-0">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: n.color }} />
                    <div>
                      <p className="text-xs font-semibold text-slate-300">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                      <p className="text-xs text-slate-600 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {user.avatar}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-300">{user.name.split(' ')[0]}</p>
              <p className="text-xs text-slate-500">{user.kycStatus}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
