import { motion } from 'framer-motion';
import { RefreshCw, Wifi, WifiOff, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { usePlan } from '@/context/PlanContext';
import { ProfileSwitcher } from './ProfileSwitcher';

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { loading, mutating, error, refresh } = usePlan();
  const busy = loading || mutating;

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold tracking-tight text-ink-900 sm:text-xl">{title}</h1>
        {subtitle && <p className="hidden text-sm text-ink-400 sm:block">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className={clsx(
            'flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset',
            error
              ? 'bg-rose-50 text-rose-600 ring-rose-200'
              : busy
              ? 'bg-amber-50 text-amber-600 ring-amber-200'
              : 'bg-emerald-50 text-emerald-600 ring-emerald-200'
          )}
        >
          {error ? <WifiOff size={13} /> : busy ? <Loader2 size={13} className="animate-spin" /> : <Wifi size={13} />}
          <span className="hidden sm:inline">{error ? 'Offline' : mutating ? 'Saving…' : loading ? 'Syncing…' : 'ML Engine Live'}</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => refresh()}
          disabled={busy}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-500 shadow-sm transition hover:border-maroon-200 hover:text-maroon-700 disabled:opacity-50"
          title="Refresh analysis"
        >
          <RefreshCw size={16} className={busy ? 'animate-spin' : ''} />
        </motion.button>

        <div className="flex items-center gap-2">
          <ProfileSwitcher />
        </div>
      </div>
    </header>
  );
}
