import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, UserRound } from 'lucide-react';
import clsx from 'clsx';
import { usePlan } from '@/context/PlanContext';

export function ProfileSwitcher() {
  const { profiles, activeProfile, selectProfile, loading, mutating } = usePlan();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative"
      tabIndex={-1}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading || mutating}
        className="flex items-center gap-2 rounded-full border border-ink-100 bg-white py-1 pl-1 pr-2.5 shadow-sm transition hover:border-maroon-200 disabled:opacity-60 sm:pr-3"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-axis-gradient text-xs font-bold text-white">
          {activeProfile.avatarInitials}
        </span>
        <span className="hidden text-sm font-medium text-ink-700 sm:inline">{activeProfile.name}</span>
        <ChevronDown size={14} className={clsx('text-ink-400 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-2xl border border-ink-100 bg-white p-1.5 shadow-card-hover"
          >
            <p className="px-3 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              Switch demo profile
            </p>
            {profiles.map((p) => {
              const isActive = p.id === activeProfile.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    selectProfile(p.id);
                    setOpen(false);
                  }}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition',
                    isActive ? 'bg-maroon-50' : 'hover:bg-ink-50'
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-axis-gradient text-xs font-bold text-white">
                    {p.avatarInitials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-ink-800">{p.name}</span>
                      {isActive && <Check size={14} className="shrink-0 text-maroon-700" />}
                    </span>
                    <span className="block truncate text-xs text-ink-400">{p.title}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-semibold text-gold-800 ring-1 ring-inset ring-gold-200">
                    {p.personaLabel}
                  </span>
                </button>
              );
            })}
            <div className="mt-1 flex items-center gap-2 border-t border-ink-100 px-3 pt-2 text-[11px] text-ink-400">
              <UserRound size={12} />
              Sample profiles showcasing every spending persona the engine detects
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
