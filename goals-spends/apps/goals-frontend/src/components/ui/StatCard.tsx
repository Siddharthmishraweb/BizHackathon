import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  tone?: 'maroon' | 'gold' | 'green' | 'red';
  hint?: string;
  index?: number;
}

const toneStyles = {
  maroon: 'bg-maroon-50 text-maroon-700',
  gold: 'bg-gold-50 text-gold-700',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-rose-50 text-rose-700',
};

export function StatCard({ label, value, icon: Icon, prefix = '', suffix = '', decimals = 0, tone = 'maroon', hint, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <span className={clsx('rounded-xl p-2', toneStyles[tone])}>
            <Icon size={18} strokeWidth={2.25} />
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight text-ink-900">
          {prefix}
          <CountUp end={value} duration={1.1} separator="," decimals={decimals} />
          {suffix}
        </p>
        {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
      </Card>
    </motion.div>
  );
}
