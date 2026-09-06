import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/utils/format';
import type { LifestyleInflationResult } from '@/types';
import { TrendingUp } from 'lucide-react';

export function LifestyleInflationCard({ result }: { result: LifestyleInflationResult }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-center gap-2 font-semibold text-ink-800">
          <TrendingUp size={17} className="text-maroon-600" />
          Lifestyle Inflation
        </h3>
        {result.detected ? <Badge tone="amber">Detected</Badge> : <Badge tone="green">Under control</Badge>}
      </CardHeader>
      <CardBody>
        {!result.detected ? (
          <p className="text-sm text-ink-400">
            {result.reason === 'insufficient_data'
              ? 'Not enough transaction history yet to compare early vs. recent spending.'
              : 'Spending in the recent half of your history is in line with earlier months.'}
          </p>
        ) : (
          <p className="text-sm text-ink-600">
            Your spending has crept up{' '}
            <span className="font-semibold text-rose-600">{result.inflation_percentage.toFixed(0)}%</span>
            {result.monthly_before != null && result.monthly_after != null && (
              <>
                {' '}
                — from {formatINR(result.monthly_before, { compact: true })}/mo to{' '}
                {formatINR(result.monthly_after, { compact: true })}/mo
              </>
            )}
            . Worth checking what's driving the increase before it becomes the new normal.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
