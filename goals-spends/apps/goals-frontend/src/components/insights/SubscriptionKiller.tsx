import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/utils/format';
import type { SubscriptionItem } from '@/types';
import { Repeat, XCircle } from 'lucide-react';

export function SubscriptionKiller({ subscriptions }: { subscriptions: SubscriptionItem[] }) {
  const [killed, setKilled] = useState<Set<string>>(new Set());

  const projectedAnnualSavings = subscriptions
    .filter((s) => killed.has(s.description))
    .reduce((sum, s) => sum + s.annual_cost, 0);

  const toggle = (description: string) => {
    setKilled((prev) => {
      const next = new Set(prev);
      if (next.has(description)) next.delete(description);
      else next.add(description);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-center gap-2 font-semibold text-ink-800">
          <Repeat size={17} className="text-maroon-600" />
          Subscription Killer
        </h3>
        {projectedAnnualSavings > 0 && <Badge tone="green">+{formatINR(projectedAnnualSavings, { compact: true })}/yr</Badge>}
      </CardHeader>
      <CardBody className="space-y-2.5">
        <p className="text-xs text-ink-400">Simulate cancelling a subscription to see your projected savings.</p>
        {subscriptions.length === 0 ? (
          <p className="text-sm text-ink-400">No recurring subscriptions detected.</p>
        ) : (
          subscriptions.map((sub) => {
            const isKilled = killed.has(sub.description);
            return (
              <div
                key={sub.description}
                className={`flex items-center justify-between rounded-xl border px-3 py-2.5 transition ${
                  isKilled ? 'border-ink-100 bg-ink-50 opacity-60' : sub.potentially_unused ? 'border-amber-200 bg-amber-50/40' : 'border-ink-100'
                }`}
              >
                <div>
                  <p className={`text-sm font-medium ${isKilled ? 'text-ink-400 line-through' : 'text-ink-800'}`}>{sub.description}</p>
                  <p className="text-xs text-ink-400">
                    {formatINR(sub.monthly_cost, { compact: true })}/mo · {formatINR(sub.annual_cost, { compact: true })}/yr
                    {sub.potentially_unused && !isKilled && ' · looks unused'}
                  </p>
                </div>
                <button
                  onClick={() => toggle(sub.description)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                    isKilled ? 'bg-ink-100 text-ink-500' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  <XCircle size={13} />
                  {isKilled ? 'Undo' : 'Cancel'}
                </button>
              </div>
            );
          })
        )}
      </CardBody>
    </Card>
  );
}
