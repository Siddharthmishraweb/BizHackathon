import clsx from 'clsx';
import type { ReactNode } from 'react';

type BadgeTone = 'maroon' | 'gold' | 'green' | 'red' | 'amber' | 'slate';

const toneClasses: Record<BadgeTone, string> = {
  maroon: 'bg-maroon-50 text-maroon-700 ring-maroon-200',
  gold: 'bg-gold-50 text-gold-800 ring-gold-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  red: 'bg-rose-50 text-rose-700 ring-rose-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export function Badge({ tone = 'slate', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const FEASIBILITY_TONE: Record<string, BadgeTone> = {
  VERY_LIKELY: 'green',
  LIKELY: 'green',
  POSSIBLE: 'amber',
  STRETCHED: 'amber',
  UNLIKELY: 'red',
  CURRENTLY_IMPOSSIBLE: 'red',
  GOAL_OVERDUE: 'slate',
};

export function feasibilityTone(feasibilityClass: string): BadgeTone {
  return FEASIBILITY_TONE[feasibilityClass] ?? 'slate';
}

const RISK_TONE: Record<string, BadgeTone> = {
  LOW_RISK: 'green',
  MEDIUM_RISK: 'amber',
  HIGH_RISK: 'amber',
  CRITICAL_RISK: 'red',
};

export function riskTone(riskClassification: string): BadgeTone {
  return RISK_TONE[riskClassification] ?? 'slate';
}

const PRIORITY_TONE: Record<string, BadgeTone> = {
  HIGH: 'red',
  MEDIUM: 'amber',
  LOW: 'slate',
};

export function priorityTone(priority: string): BadgeTone {
  return PRIORITY_TONE[priority] ?? 'slate';
}
