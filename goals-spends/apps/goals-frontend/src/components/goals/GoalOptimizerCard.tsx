import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge, feasibilityTone } from '@/components/ui/Badge';
import { optimizeGoalAllocation, extractErrorMessage } from '@/api/client';
import type { ComprehensivePlan, GoalAllocationResult } from '@/types';
import { formatINR } from '@/utils/format';
import { SplitSquareHorizontal, Loader2 } from 'lucide-react';

// "AI Goal Priority Optimizer" — splits ONE shared monthly surplus across all goals
// (priority + deadline aware) instead of naively assuming each goal gets the full surplus.
export function GoalOptimizerCard({ plan }: { plan: ComprehensivePlan }) {
  const [result, setResult] = useState<GoalAllocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goals = Object.values(plan.goal_analysis).map((g) => g.goal);
  const monthlySurplus = plan.situation_analysis.expenses.monthly_surplus;

  const optimize = async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await optimizeGoalAllocation(goals, Math.max(0, monthlySurplus)));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-center gap-2 font-semibold text-ink-800">
          <SplitSquareHorizontal size={17} className="text-maroon-600" />
          Goal Priority Optimizer
        </h3>
        <button
          onClick={optimize}
          disabled={loading || goals.length === 0}
          className="flex items-center gap-1.5 rounded-xl bg-axis-gradient px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <SplitSquareHorizontal size={13} />}
          Optimize
        </button>
      </CardHeader>
      <CardBody className="space-y-2.5">
        <p className="text-xs text-ink-400">
          Splits your {formatINR(Math.max(0, monthlySurplus), { compact: true })}/mo surplus across all goals at once
          (priority + deadline aware) instead of each goal assuming it gets the full amount.
        </p>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {result && (
          <>
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-ink-50 p-3 text-xs">
              <span className="font-semibold text-ink-800">
                {formatINR(result.total_monthly_surplus, { compact: true })} surplus
              </span>
              <span className="text-ink-400">&middot;</span>
              <span className={result.fully_covered ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-600'}>
                {result.fully_covered ? 'All goals fully funded' : `${formatINR(result.unallocated_surplus, { compact: true })} short`}
              </span>
            </div>
            {result.allocations.map((a) => (
              <div key={a.name} className="rounded-xl border border-ink-100 px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-800">{a.name}</span>
                  <span className="text-sm font-semibold text-ink-700">{formatINR(a.allocated_monthly, { compact: true })}/mo</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <Badge tone={feasibilityTone(a.naive_feasibility_class)}>{a.naive_feasibility_class.replace(/_/g, ' ')}</Badge>
                  {a.allocated_feasibility_class !== a.naive_feasibility_class && (
                    <>
                      <span className="text-ink-300">&rarr;</span>
                      <Badge tone={feasibilityTone(a.allocated_feasibility_class)}>
                        {a.allocated_feasibility_class.replace(/_/g, ' ')}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </CardBody>
    </Card>
  );
}
