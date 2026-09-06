import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, Sparkles, LineChart, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Financial Overview', subtitle: 'Your complete financial health, at a glance' },
  '/goals': { title: 'Goal Achievement', subtitle: 'Feasibility, risk, and recovery plans for every goal' },
  '/insights': { title: 'Insights', subtitle: 'Spending patterns, anomalies, and behavioral signals from your own data' },
  '/forecast': { title: 'Cash Flow Forecast', subtitle: '12-month projection across best, expected & worst case' },
  '/recommendations': { title: 'Recommendations', subtitle: 'AI-prioritized actions to accelerate your goals' },
  '/simulator': { title: 'Goal Simulator', subtitle: 'Run live Monte Carlo simulations on any target' },
  '/whatif': { title: 'What-If Playground', subtitle: 'See a real recomputed plan for hypothetical changes' },
};

const MOBILE_NAV = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/insights', label: 'Insights', icon: LineChart },
  { to: '/recommendations', label: 'Tips', icon: Sparkles },
  { to: '/whatif', label: 'What-If', icon: SlidersHorizontal },
];

export function Layout() {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] ?? { title: 'Goals AI', subtitle: undefined };

  return (
    <div className="min-h-screen bg-[#faf7f3]">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-ink-100 bg-white/95 py-2 backdrop-blur lg:hidden">
        {MOBILE_NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium',
                isActive ? 'text-maroon-700' : 'text-ink-400'
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
