import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { formatDate, formatINR } from '@/utils/format';
import type { AnomalyItem } from '@/types';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export function AnomalyAlerts({ anomalies }: { anomalies: AnomalyItem[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-center gap-2 font-semibold text-ink-800">
          <AlertTriangle size={17} className="text-rose-600" />
          Unusual Transactions
        </h3>
      </CardHeader>
      <CardBody className="space-y-2.5">
        {anomalies.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-ink-400">
            <ShieldCheck size={16} className="text-emerald-500" />
            Nothing unusual detected — your spending has been consistent.
          </div>
        ) : (
          anomalies.slice(0, 6).map((a, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/40 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-ink-800">{a.description}</p>
                <p className="text-xs text-ink-400">
                  {formatDate(a.date)} · {a.category}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-rose-600">{formatINR(a.amount, { compact: true })}</p>
                <p className="text-[11px] text-ink-400">{a.z_score.toFixed(1)}σ</p>
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
