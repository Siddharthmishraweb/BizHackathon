import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Wand2, X, Loader2, Sparkles, Gauge } from 'lucide-react';
import clsx from 'clsx';
import { usePlan } from '@/context/PlanContext';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage, fetchGoalFeasibility } from '@/api/client';
import { celebrateGoalAdded } from '@/utils/celebrate';
import { parseGoalText } from '@/utils/goalParser';
import { CATEGORY_META, CATEGORY_ORDER, type GoalCategory } from '@/utils/goalMeta';
import { formatINR, titleCase } from '@/utils/format';
import { feasibilityTone, Badge } from '@/components/ui/Badge';
import type { Goal, GoalFeasibilityResult } from '@/types';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const PRIORITY_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: 'High' },
  { value: 3, label: 'Medium' },
  { value: 5, label: 'Low' },
];

interface Touched {
  name?: boolean;
  category?: boolean;
  targetAmount?: boolean;
  deadline?: boolean;
  priority?: boolean;
}

const initialState = {
  rawText: '',
  name: '',
  category: 'custom' as GoalCategory,
  targetAmount: 200000,
  currentAmount: 0,
  deadline: '',
  priority: 3,
};

export function AddGoalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { plan, addGoal } = usePlan();
  const { showToast } = useToast();

  const [rawText, setRawText] = useState(initialState.rawText);
  const [name, setName] = useState(initialState.name);
  const [category, setCategory] = useState<GoalCategory>(initialState.category);
  const [targetAmount, setTargetAmount] = useState(initialState.targetAmount);
  const [currentAmount, setCurrentAmount] = useState(initialState.currentAmount);
  const [deadline, setDeadline] = useState(initialState.deadline);
  const [priority, setPriority] = useState(initialState.priority);
  const [touched, setTouched] = useState<Touched>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [preview, setPreview] = useState<GoalFeasibilityResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRawText(initialState.rawText);
    setName(initialState.name);
    setCategory(initialState.category);
    setTargetAmount(initialState.targetAmount);
    setCurrentAmount(initialState.currentAmount);
    setDeadline(initialState.deadline);
    setPriority(initialState.priority);
    setTouched({});
    setFormError(null);
    setPreview(null);
  }, [open]);

  const debouncedRawText = useDebouncedValue(rawText, 350);

  useEffect(() => {
    if (!debouncedRawText.trim()) return;
    const parsed = parseGoalText(debouncedRawText);
    if (!touched.name && parsed.name) setName(parsed.name);
    if (!touched.category && parsed.category) setCategory(parsed.category);
    if (!touched.targetAmount && parsed.targetAmount) setTargetAmount(parsed.targetAmount);
    if (!touched.deadline && parsed.deadline) setDeadline(parsed.deadline);
    if (!touched.priority && parsed.priority) setPriority(parsed.priority);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedRawText]);

  const applyTemplate = (cat: GoalCategory) => {
    setCategory(cat);
    setTouched((t) => ({ ...t, category: true }));
    if (!touched.targetAmount) setTargetAmount(CATEGORY_META[cat].defaultTargetAmount);
    if (!touched.deadline) {
      const d = new Date();
      d.setMonth(d.getMonth() + CATEGORY_META[cat].defaultMonths);
      setDeadline(d.toISOString().slice(0, 10));
    }
    if (!touched.name) setName(CATEGORY_META[cat].label);
  };

  const monthlySurplus = plan?.situation_analysis.expenses.monthly_surplus ?? 0;
  const debouncedInputs = useDebouncedValue({ targetAmount, currentAmount, deadline }, 500);

  useEffect(() => {
    if (!open) return;
    const { targetAmount: t, currentAmount: c, deadline: d } = debouncedInputs;
    if (!t || t <= 0 || !d) {
      setPreview(null);
      return;
    }
    if (new Date(d).getTime() <= Date.now()) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    fetchGoalFeasibility({ name: name || 'Preview', target_amount: t, current_amount: c, deadline: d, category, priority }, monthlySurplus)
      .then((res) => {
        if (!cancelled) setPreview(res);
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputs, open]);

  const previewProbability = useMemo(() => {
    if (!preview) return null;
    const raw = preview.success_probability;
    return raw <= 1 ? raw * 100 : raw;
  }, [preview]);

  function validate(): string | null {
    if (!name.trim() || name.trim().length < 2) return 'Give your goal a name (at least 2 characters).';
    if (!targetAmount || targetAmount <= 0) return 'Target amount must be greater than zero.';
    if (currentAmount < 0) return 'Current savings cannot be negative.';
    if (currentAmount > targetAmount) return 'Current savings cannot exceed the target amount.';
    if (!deadline) return 'Pick a target date.';
    if (new Date(deadline).getTime() <= Date.now()) return 'Target date must be in the future.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    const goal: Goal = { name: name.trim(), target_amount: targetAmount, current_amount: currentAmount, deadline, category, priority };
    try {
      const newPlan = await addGoal(goal);
      const entry = newPlan.goal_analysis[goal.name];
      const isOnTrack = entry && (entry.feasibility_class === 'VERY_LIKELY' || entry.feasibility_class === 'LIKELY');
      if (isOnTrack) celebrateGoalAdded();
      showToast({
        tone: 'success',
        message: `"${goal.name}" added to your goals`,
        description: entry
          ? `${titleCase(entry.feasibility_class)} · ${Math.round(
              entry.success_probability <= 1 ? entry.success_probability * 100 : entry.success_probability
            )}% success odds`
          : undefined,
      });
      onClose();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-card-hover"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
                <h2 className="flex items-center gap-2 font-semibold text-ink-900">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-axis-gradient text-white">
                    <Sparkles size={15} />
                  </span>
                  Add a New Goal
                </h2>
                <button type="button" onClick={onClose} className="text-ink-400 transition hover:text-ink-700">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5 px-5 py-5">
                <div className="rounded-xl border border-gold-200 bg-gold-50/60 p-3.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-800">
                    <Wand2 size={13} />
                    Magic Add — describe it in one line
                  </label>
                  <input
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="e.g. Buy a bike for 2 lakhs in 18 months"
                    className="mt-2 w-full rounded-lg border border-gold-200 bg-white px-3 py-2 text-sm text-ink-800 placeholder:text-ink-300 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                  />
                  <p className="mt-1.5 text-[11px] text-gold-800/70">
                    We&apos;ll auto-fill the amount, category &amp; deadline below — everything stays editable.
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Quick templates</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORY_ORDER.map((cat) => {
                      const meta = CATEGORY_META[cat];
                      const CatIcon = meta.icon;
                      const active = category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => applyTemplate(cat)}
                          className={clsx(
                            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                            active
                              ? 'border-maroon-600 bg-maroon-700 text-white'
                              : 'border-ink-200 bg-white text-ink-600 hover:border-maroon-200 hover:text-maroon-700'
                          )}
                        >
                          <CatIcon size={12} />
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Goal name</label>
                  <input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setTouched((t) => ({ ...t, name: true }));
                    }}
                    placeholder="e.g. Buy a Bike"
                    className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-300 focus:border-maroon-400 focus:outline-none focus:ring-2 focus:ring-maroon-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Target amount (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={targetAmount}
                      onChange={(e) => {
                        setTargetAmount(Number(e.target.value));
                        setTouched((t) => ({ ...t, targetAmount: true }));
                      }}
                      className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 focus:border-maroon-400 focus:outline-none focus:ring-2 focus:ring-maroon-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Already saved (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 focus:border-maroon-400 focus:outline-none focus:ring-2 focus:ring-maroon-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Target date</label>
                    <input
                      type="date"
                      min={tomorrowISO()}
                      value={deadline}
                      onChange={(e) => {
                        setDeadline(e.target.value);
                        setTouched((t) => ({ ...t, deadline: true }));
                      }}
                      className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 focus:border-maroon-400 focus:outline-none focus:ring-2 focus:ring-maroon-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Priority</label>
                    <div className="mt-1.5 flex gap-1.5">
                      {PRIORITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setPriority(opt.value);
                            setTouched((t) => ({ ...t, priority: true }));
                          }}
                          className={clsx(
                            'flex-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition',
                            priority === opt.value
                              ? 'border-maroon-600 bg-maroon-700 text-white'
                              : 'border-ink-200 bg-white text-ink-600 hover:border-maroon-200'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {(previewLoading || preview) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden rounded-xl border border-maroon-100 bg-maroon-50/50 p-3.5"
                    >
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-maroon-700">
                        <Gauge size={13} />
                        Live Feasibility Preview
                      </p>
                      {previewLoading && !preview ? (
                        <div className="flex items-center gap-2 text-sm text-ink-400">
                          <Loader2 size={14} className="animate-spin" /> Crunching the numbers…
                        </div>
                      ) : preview ? (
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge tone={feasibilityTone(preview.feasibility_class)}>{titleCase(preview.feasibility_class)}</Badge>
                          <span className="text-sm text-ink-600">
                            <strong className="text-ink-900">{previewProbability?.toFixed(0)}%</strong> success odds
                          </span>
                          <span className="text-sm text-ink-600">
                            needs <strong className="text-ink-900">{formatINR(preview.required_monthly, { compact: true })}</strong>/mo
                          </span>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>

                {formError && (
                  <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">{formError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-ink-100 px-5 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-500 transition hover:bg-ink-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-axis-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:opacity-95 disabled:opacity-60"
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {submitting ? 'Creating…' : 'Create Goal'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
