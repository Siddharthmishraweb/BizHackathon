// Extraordinary/standalone feature: a playful "race" visualization ranking every goal by
// progress toward its target, instead of yet another plain progress bar list. Fires a
// confetti burst the first time any goal's progress crosses the finish line (100%).
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Flag } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { categoryIcon } from '@/utils/goalMeta';
import { celebrateMilestone } from '@/utils/celebrate';
import type { GoalAnalysisEntry } from '@/types';

const MEDALS = ['🥇', '🥈', '🥉'];

export function GoalRaceTrack({ entries }: { entries: [string, GoalAnalysisEntry][] }) {
  const celebratedRef = useRef<Set<string>>(new Set());

  const ranked = [...entries]
    .map(([name, data]) => ({
      name,
      data,
      progress: Math.min(100, (data.goal.current_amount / data.goal.target_amount) * 100),
    }))
    .sort((a, b) => b.progress - a.progress);

  const fingerprint = ranked.map((g) => `${g.name}:${g.progress.toFixed(1)}`).join('|');

  useEffect(() => {
    for (const goal of ranked) {
      if (goal.progress >= 100 && !celebratedRef.current.has(goal.name)) {
        celebratedRef.current.add(goal.name);
        celebrateMilestone();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint]);

  if (ranked.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="font-semibold text-ink-800">🏁 Goal Race</h3>
          <p className="text-xs text-ink-400">Every goal, ranked by how close it is to the finish line</p>
        </div>
      </CardHeader>
      <CardBody className="space-y-5">
        {ranked.map((goal, i) => {
          const Icon = categoryIcon(goal.data.goal.category);
          return (
            <div key={goal.name}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-ink-700">
                  <span className="w-5 text-center">{MEDALS[i] ?? i + 1}</span>
                  {goal.name}
                </span>
                <span className="font-semibold text-ink-800">{goal.progress.toFixed(0)}%</span>
              </div>
              <div className="relative h-7 w-full rounded-full bg-ink-100">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-maroon-400 to-gold-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
                <Flag size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <motion.span
                  className="absolute top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-axis-gradient text-white shadow-card"
                  initial={{ left: '0%' }}
                  animate={{ left: `${goal.progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                >
                  <Icon size={12} />
                </motion.span>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
