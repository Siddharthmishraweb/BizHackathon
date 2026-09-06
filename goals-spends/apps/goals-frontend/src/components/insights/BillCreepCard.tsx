import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { formatINR } from '@/utils/format';
import type { BillCreepItem } from '@/types';
import { ArrowUpRight } from 'lucide-react';

export function BillCreepCard({ items }: { items: BillCreepItem[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-center gap-2 font-semibold text-ink-800">
          <ArrowUpRight size={17} className="text-rose-600" />
          Bill Creep
        </h3>
      </CardHeader>
      <CardBody className="space-y-2.5">
        {items.length === 0 ? (
          <p className="text-sm text-ink-400">No recurring bills have quietly crept up — nice.</p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/40 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-ink-800">{item.description}</p>
                <p className="text-xs text-ink-400">
                  {formatINR(item.first_amount, { compact: true })} &rarr; {formatINR(item.latest_amount, { compact: true })} over{' '}
                  {item.occurrences} charges
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-rose-600">+{item.increase_percentage.toFixed(0)}%</p>
                <p className="text-[11px] text-ink-400">{formatINR(item.annual_impact, { compact: true })}/yr</p>
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
