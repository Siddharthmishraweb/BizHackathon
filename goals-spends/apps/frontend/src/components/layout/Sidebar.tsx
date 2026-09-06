import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, PieChart, CreditCard, Target, Calculator,
  Shield, Bot, TrendingUp, User, ChevronLeft, ChevronRight,
  Zap, Settings, HelpCircle, LogOut
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/portfolio', label: 'Portfolio', icon: PieChart },
  { path: '/transactions', label: 'Transactions', icon: CreditCard },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/investments', label: 'Investments', icon: TrendingUp },
  { path: '/tax', label: 'Tax Optimizer', icon: Calculator },
  { path: '/insurance', label: 'Insurance', icon: Shield },
  { path: '/ai-advisor', label: 'AI Advisor', icon: Bot, highlight: true },
];

const bottomItems = [
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, user, setAuthenticated } = useStore();
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 h-full z-40 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(8,13,26,0.98) 0%, rgba(5,11,23,0.98) 100%)',
        borderRight: '1px solid rgba(99,102,241,0.1)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          W
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="gradient-text font-bold text-base tracking-tight">WealthAI</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Zap size={10} className="text-yellow-400" />
                <span className="text-xs text-slate-500">AI Co-Pilot</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors flex-shrink-0"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: active }) =>
                `sidebar-item ${active ? 'active' : ''} ${item.highlight && !active ? 'relative' : ''}`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              {item.highlight && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                  style={{ background: '#10b981' }}
                />
              )}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : item.highlight
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                <Icon size={16} />
              </div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                    {item.highlight && (
                      <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">NEW</span>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-3 pb-4 space-y-1 border-t border-white/5 pt-3">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-500">
                <Icon size={16} />
              </div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}

        <button
          onClick={() => setAuthenticated(false)}
          className="sidebar-item w-full text-left"
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-red-400/70">
            <LogOut size={16} />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-400/70 text-sm"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* User avatar at bottom */}
        <AnimatePresence>
          {!sidebarCollapsed && user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 p-3 rounded-xl"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  {user.avatar}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-300 truncate">{user.name}</div>
                  <div className="text-xs text-slate-500 truncate">{user.riskProfile}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
