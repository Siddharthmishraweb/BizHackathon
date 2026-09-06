import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Trash2, Check, X } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge, feasibilityTone } from '@/components/ui/Badge';
import { categoryIcon } from '@/utils/goalMeta';
import type { GoalAnalysisEntry } from '@/types';
import { formatDate, formatINR, monthsToYearsMonths, titleCase } from '@/utils/format';

interface GoalCardProps {
  name: string;
  data: GoalAnalysisEntry;
  index: number;
  onRequestDelete?: (name: string) => void;
}

// forwardRef because this is used as a direct child of AnimatePresence in Goals.tsx, which
// needs a ref on the component itself to manage exit animations.
export const GoalCard = forwardRef<HTMLDivElement, GoalCardProps>(function GoalCard(
  { name, data, index, onRequestDelete },
  ref
) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const Icon = categoryIcon(data.goal.category);
  const progress = Math.min(100, (data.goal.current_amount / data.goal.target_amount) * 100);
  const probability = data.success_probability <= 1 ? data.success_probability * 100 : data.success_probability;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -8, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon-50 text-maroon-700">
              <Icon size={19} />
            </span>
            <div>
              <h3 className="font-semibold text-ink-900">{name}</h3>
              <p className="text-xs text-ink-400">Target by {formatDate(data.goal.deadline)}</p>
            </div>
          </div>

          {confirmingDelete ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden text-xs font-medium text-ink-400 sm:inline">Delete?</span>
              <button
                onClick={() => {
                  setConfirmingDelete(false);
                  onRequestDelete?.(name);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white transition hover:bg-rose-700"
                title="Confirm delete"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-100 text-ink-600 transition hover:bg-ink-200"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Badge tone={feasibilityTone(data.feasibility_class)}>{titleCase(data.feasibility_class)}</Badge>
              {onRequestDelete && (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-300 transition hover:bg-rose-50 hover:text-rose-600"
                  title="Delete goal"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </CardHeader>

        <CardBody className="space-y-4">
          <div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold text-ink-800">{formatINR(data.goal.current_amount, { compact: true })}</span>
              <span className="text-ink-400">of {formatINR(data.goal.target_amount, { compact: true })}</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink-100">
              <motion.div
                className="h-full rounded-full bg-axis-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-ink-50 py-2.5">
              <p className="text-[11px] font-medium text-ink-400">Success Odds</p>
              <p className="text-sm font-bold text-ink-800">{probability.toFixed(0)}%</p>
            </div>
            <div className="rounded-xl bg-ink-50 py-2.5">
              <p className="text-[11px] font-medium text-ink-400">Needed/mo</p>
              <p className="text-sm font-bold text-ink-800">{formatINR(data.required_monthly, { compact: true })}</p>
            </div>
            <div className="rounded-xl bg-ink-50 py-2.5">
              <p className="text-[11px] font-medium text-ink-400">Time Left</p>
              <p className="text-sm font-bold text-ink-800">{monthsToYearsMonths(monthsUntil(data.goal.deadline))}</p>
            </div>
          </div>

          {data.recovery_plan.length > 0 && (
            <div className="space-y-2 rounded-xl border border-gold-200 bg-gold-50/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-800">Recovery Options</p>
              {data.recovery_plan.slice(0, 2).map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-ink-700">
                  <ArrowRight size={14} className="mt-0.5 shrink-0 text-gold-600" />
                  <span>
                    <strong className="text-ink-800">{r.strategy}:</strong> {r.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
});

function monthsUntil(deadline: string): number {
  const target = new Date(deadline);
  const now = new Date();
  return Math.max(0, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
}
