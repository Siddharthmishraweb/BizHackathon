import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { formatINR } from '@/utils/format';
import type { PaydaySpikeResult } from '@/types';
import { Zap } from 'lucide-react';

export function PaydaySpikeCard({ result }: { result: PaydaySpikeResult }) {
  const entries = Object.entries(result.triggers);
  const worst = entries.sort((a, b) => b[1].average_spending - a[1].average_spending)[0];
  const spikePct =
    worst && result.typical_7day_spending > 0
      ? ((worst[1].average_spending - result.typical_7day_spending) / result.typical_7day_spending) * 100
      : 0;

  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-center gap-2 font-semibold text-ink-800">
          <Zap size={17} className="text-gold-600" />
          Payday Spending Spikes
        </h3>
      </CardHeader>
      <CardBody className="space-y-2.5">
        {entries.length === 0 ? (
          <p className="text-sm text-ink-400">Not enough payday history to detect a pattern yet.</p>
        ) : (
          <>
            <p className="text-sm text-ink-600">
              In the 7 days after payday you spend on average{' '}
              <span className="font-semibold text-ink-800">{formatINR(worst[1].average_spending, { compact: true })}</span>
              {spikePct > 5 && (
                <>
                  {' '}
                  — <span className="font-semibold text-rose-600">{spikePct.toFixed(0)}% more</span> than your typical
                  7-day spend of {formatINR(result.typical_7day_spending, { compact: true })}.
                </>
              )}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {entries.map(([month, stats]) => (
                <div key={month} className="rounded-xl border border-ink-100 p-3">
                  <p className="text-xs text-ink-400">{month}</p>
                  <p className="text-sm font-semibold text-ink-800">{formatINR(stats.average_spending, { compact: true })}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
