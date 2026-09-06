import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { computeRiskRadar, type RiskRadarEntry } from '@/utils/riskRadar';
import type { ComprehensivePlan } from '@/types';
import { Radar, Loader2 } from 'lucide-react';

// "Goal-Risk Early Warning" — flags goals that look fine today but would slip in a
// below-average (pessimistic-scenario) month, before they officially degrade.
export function RiskRadarCard({ plan }: { plan: ComprehensivePlan }) {
  const [entries, setEntries] = useState<RiskRadarEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    computeRiskRadar(plan).then((result) => {
      if (!cancelled) setEntries(result);
    });
    return () => {
      cancelled = true;
    };
  }, [plan]);

  const atRiskCount = entries?.filter((e) => e.atRisk).length ?? 0;

  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-center gap-2 font-semibold text-ink-800">
          <Radar size={17} className="text-maroon-600" />
          Goal Risk Radar
        </h3>
        {entries && atRiskCount > 0 && <Badge tone="amber">{atRiskCount} at risk in a bad month</Badge>}
      </CardHeader>
      <CardBody className="space-y-2.5">
        <p className="text-xs text-ink-400">
          Re-checks every goal against a pessimistic (below-average) surplus month to flag risk before it's official.
        </p>
        {!entries ? (
          <div className="flex items-center gap-2 py-4 text-sm text-ink-400">
            <Loader2 size={15} className="animate-spin" />
            Checking goals against a tougher month…
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-ink-400">No goals to check yet.</p>
        ) : (
          entries.map((e) => (
            <div key={e.name} className="flex items-center justify-between rounded-xl border border-ink-100 px-3 py-2">
              <span className="text-sm font-medium text-ink-700">{e.name}</span>
              {e.atRisk ? (
                <Badge tone="amber">
                  {e.currentClass.replace(/_/g, ' ')} &rarr; {e.pessimisticClass.replace(/_/g, ' ')} in a tough month
                </Badge>
              ) : (
                <Badge tone="green">Resilient</Badge>
              )}
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
