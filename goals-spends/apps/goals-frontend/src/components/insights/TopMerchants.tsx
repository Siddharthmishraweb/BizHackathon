import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { formatINR } from '@/utils/format';
import type { MerchantBreakdown } from '@/types';
import { Store } from 'lucide-react';

export function TopMerchants({ merchants }: { merchants: Record<string, MerchantBreakdown> }) {
  const entries = Object.entries(merchants)
    .sort((a, b) => b[1].sum - a[1].sum)
    .slice(0, 8);
  const max = entries.length ? entries[0][1].sum : 1;

  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-center gap-2 font-semibold text-ink-800">
          <Store size={17} className="text-maroon-600" />
          Top Merchants
        </h3>
      </CardHeader>
      <CardBody className="space-y-2.5">
        {entries.length === 0 ? (
          <p className="text-sm text-ink-400">No merchant data yet.</p>
        ) : (
          entries.map(([merchant, data]) => (
            <div key={merchant}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink-700">{merchant}</span>
                <span className="font-semibold text-ink-800">{formatINR(data.sum, { compact: true })}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-axis-gradient" style={{ width: `${(data.sum / max) * 100}%` }} />
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
