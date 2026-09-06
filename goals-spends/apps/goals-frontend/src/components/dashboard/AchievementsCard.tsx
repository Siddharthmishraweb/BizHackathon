import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { computeAchievements } from '@/utils/achievements';
import type { ComprehensivePlan, UserData } from '@/types';
import { Award } from 'lucide-react';

export function AchievementsCard({ plan, userData }: { plan: ComprehensivePlan; userData: UserData }) {
  const achievements = computeAchievements(plan, userData);
  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-center gap-2 font-semibold text-ink-800">
          <Award size={17} className="text-gold-600" />
          Streaks &amp; Badges
        </h3>
        <span className="text-xs font-semibold text-ink-400">
          {earnedCount}/{achievements.length}
        </span>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              title={a.description}
              className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition ${
                a.earned ? 'border-gold-200 bg-gold-50/50' : 'border-ink-100 opacity-40 grayscale'
              }`}
            >
              <span className="text-2xl">{a.icon}</span>
              <p className="text-[11px] font-semibold leading-tight text-ink-700">{a.label}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
