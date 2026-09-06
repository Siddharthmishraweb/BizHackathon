import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { computeHealthScore } from '@/utils/healthScore';
import type { ComprehensivePlan, UserData } from '@/types';
import { HeartPulse } from 'lucide-react';

const BAND_COLOR: Record<string, string> = {
  Excellent: '#16a34a',
  Good: '#c6952c',
  Fair: '#f59e0b',
  'Needs Attention': '#e11d48',
};

export function HealthScoreCard({ plan, userData }: { plan: ComprehensivePlan; userData: UserData }) {
  const result = computeHealthScore(plan, userData);
  const gaugeData = [{ name: 'score', value: result.score, fill: BAND_COLOR[result.band] }];

  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-center gap-2 font-semibold text-ink-800">
          <HeartPulse size={17} className="text-maroon-600" />
          Financial Health Score
        </h3>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative h-36 w-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="72%" outerRadius="100%" data={gaugeData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background={{ fill: '#f6f5f7' }} dataKey="value" cornerRadius={20} angleAxisId={0} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-ink-900">{result.score}</span>
              <span className="text-[11px] font-medium text-ink-400">{result.band}</span>
            </div>
          </div>
          <div className="w-full flex-1 space-y-2">
            {result.components.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-600">{c.label}</span>
                  <span className="font-semibold text-ink-800">
                    {c.points}/{c.maxPoints}
                  </span>
                </div>
                <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-axis-gradient"
                    style={{ width: `${(c.points / c.maxPoints) * 100}%` }}
                  />
                </div>
                <p className="mt-0.5 text-[11px] text-ink-400">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
