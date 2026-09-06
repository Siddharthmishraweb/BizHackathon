import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, TrendingUp, Sparkles, Calculator, Wallet, LineChart, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/insights', label: 'Insights', icon: LineChart },
  { to: '/forecast', label: 'Forecast', icon: TrendingUp },
  { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { to: '/simulator', label: 'Simulator', icon: Calculator },
  { to: '/whatif', label: 'What-If', icon: SlidersHorizontal },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-maroon-900/10 bg-axis-gradient lg:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
          <Wallet className="text-gold-200" size={20} />
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-white">Goals AI</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-gold-200/80">Wealth Intelligence</p>
        </div>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white text-maroon-800 shadow-card'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon size={18} strokeWidth={2.25} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="m-3 rounded-xl bg-white/10 p-4 ring-1 ring-white/15">
        <p className="text-xs font-semibold text-gold-200">Powered by</p>
        <p className="mt-0.5 text-sm font-semibold text-white">Goal Achievement Intelligence Engine</p>
        <p className="mt-1 text-[11px] text-white/60">FastAPI · Monte Carlo · ML</p>
      </div>
    </aside>
  );
}
