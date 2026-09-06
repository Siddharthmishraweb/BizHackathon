import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { formatPercent, tierLabel } from '@/utils/format';
import type { PeerBenchmarkItem } from '@/types';
import { Users } from 'lucide-react';

const STATUS_LABEL: Record<PeerBenchmarkItem['status'], string> = {
  above_typical: 'Above typical',
  below_typical: 'Below typical',
  typical: 'Typical',
};

const STATUS_COLOR: Record<PeerBenchmarkItem['status'], string> = {
  above_typical: 'text-rose-600',
  below_typical: 'text-emerald-600',
  typical: 'text-ink-500',
};

export function PeerBenchmarkCard({ items }: { items: PeerBenchmarkItem[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-center gap-2 font-semibold text-ink-800">
          <Users size={17} className="text-maroon-600" />
          Peer Percentile Benchmark
        </h3>
      </CardHeader>
      <CardBody className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-ink-400">No benchmark data yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.tier}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink-700">{tierLabel(item.tier)}</span>
                <span className={`font-semibold ${STATUS_COLOR[item.status]}`}>{STATUS_LABEL[item.status]}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-axis-gradient"
                    style={{ width: `${Math.min(100, item.percentile_vs_reference)}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-xs text-ink-400">
                  {formatPercent(item.actual_percentage)} of spend
                </span>
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
