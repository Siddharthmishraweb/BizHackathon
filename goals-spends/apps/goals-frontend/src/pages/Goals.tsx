import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, RotateCcw, Target } from 'lucide-react';
import { usePlan } from '@/context/PlanContext';
import { useToast } from '@/context/ToastContext';
import { GoalCard } from '@/components/goals/GoalCard';
import { AddGoalModal } from '@/components/goals/AddGoalModal';
import { GoalRaceTrack } from '@/components/goals/GoalRaceTrack';
import { RiskRadarCard } from '@/components/goals/RiskRadarCard';
import { GoalOptimizerCard } from '@/components/goals/GoalOptimizerCard';
import { Card, CardBody } from '@/components/ui/Card';

const DELETE_UNDO_WINDOW_MS = 5000;

export function Goals() {
  const { plan, deleteGoal, resetGoals } = usePlan();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [hiddenNames, setHiddenNames] = useState<Set<string>>(new Set());
  const pendingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Deletion uses a soft-delete + undo pattern: the card hides immediately, but the goal
  // isn't actually removed server-side until the undo window elapses (or this page unmounts).
  useEffect(() => {
    return () => {
      for (const [name, timer] of Object.entries(pendingTimers.current)) {
        clearTimeout(timer);
        deleteGoal(name).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!plan) return null;

  const entries = Object.entries(plan.goal_analysis);
  const visibleEntries = entries.filter(([name]) => !hiddenNames.has(name));
  const achievable = visibleEntries.filter(
    ([, d]) => d.feasibility_class === 'VERY_LIKELY' || d.feasibility_class === 'LIKELY'
  ).length;

  function finalizeDelete(name: string) {
    delete pendingTimers.current[name];
    deleteGoal(name).catch((err) => {
      setHiddenNames((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
      showToast({
        tone: 'error',
        message: `Couldn't delete "${name}"`,
        description: err instanceof Error ? err.message : undefined,
      });
    });
  }

  function handleUndo(name: string) {
    const timer = pendingTimers.current[name];
    if (timer) clearTimeout(timer);
    delete pendingTimers.current[name];
    setHiddenNames((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  }

  function handleRequestDelete(name: string) {
    if (pendingTimers.current[name]) return;
    setHiddenNames((prev) => new Set(prev).add(name));
    pendingTimers.current[name] = setTimeout(() => finalizeDelete(name), DELETE_UNDO_WINDOW_MS);
    showToast({
      tone: 'info',
      message: `"${name}" deleted`,
      duration: DELETE_UNDO_WINDOW_MS,
      action: { label: 'Undo', onClick: () => handleUndo(name) },
    });
  }

  async function handleReset() {
    const confirmed = window.confirm(
      'Reset goals back to the original demo data for this profile? This clears any goals you added or deleted.'
    );
    if (!confirmed) return;
    await resetGoals();
    showToast({ tone: 'info', message: 'Goals reset to demo defaults' });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm text-ink-500">
              <span className="font-semibold text-ink-800">{achievable}</span> of{' '}
              <span className="font-semibold text-ink-800">{visibleEntries.length}</span> goals are on track
            </p>
            <div className="mt-1.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-ink-100 sm:w-64">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                style={{ width: `${visibleEntries.length ? (achievable / visibleEntries.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm font-semibold text-ink-500 transition hover:border-ink-300 hover:text-ink-700"
              title="Reset goals to demo defaults"
            >
              <RotateCcw size={15} />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-axis-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
            >
              <Plus size={16} />
              Add Goal
            </button>
          </div>
        </CardBody>
      </Card>

      {visibleEntries.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-maroon-50 text-maroon-700">
              <Target size={26} />
            </span>
            <div>
              <p className="font-semibold text-ink-800">No goals yet</p>
              <p className="mt-1 text-sm text-ink-400">Add your first goal and see its feasibility instantly.</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 flex items-center gap-1.5 rounded-xl bg-axis-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
            >
              <Plus size={16} />
              Add Goal
            </button>
          </CardBody>
        </Card>
      ) : (
        <>
          <GoalRaceTrack entries={visibleEntries} />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <RiskRadarCard plan={plan} />
            <GoalOptimizerCard plan={plan} />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {visibleEntries.map(([name, data], i) => (
                <GoalCard key={name} name={name} data={data} index={i} onRequestDelete={handleRequestDelete} />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      <AddGoalModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

