// Goal-Risk Early Warning ("Risk Radar") — re-checks every goal's feasibility against a
// pessimistic monthly surplus (derived from the plan's own pessimistic scenario forecast)
// to flag goals that look fine today but would slip in a below-average month. Reuses the
// real /api/v1/goal/feasibility endpoint per goal — no new backend endpoint needed.
import { fetchGoalFeasibility } from '@/api/client';
import type { ComprehensivePlan } from '@/types';

const FEASIBILITY_ORDER = ['CURRENTLY_IMPOSSIBLE', 'UNLIKELY', 'STRETCHED', 'POSSIBLE', 'LIKELY', 'VERY_LIKELY'];

export interface RiskRadarEntry {
  name: string;
  currentClass: string;
  pessimisticClass: string;
  atRisk: boolean;
}

export async function computeRiskRadar(plan: ComprehensivePlan): Promise<RiskRadarEntry[]> {
  const { scenario_forecast, cashflow_forecast, goal_analysis } = plan;
  const expected = scenario_forecast.expected_final || 1;
  const pessimisticRatio = expected > 0 ? scenario_forecast.pessimistic_final / expected : 1;
  const pessimisticSurplus = Math.max(
    0,
    cashflow_forecast.savings_forecast.average_monthly_surplus * clampRatio(pessimisticRatio)
  );

  const entries = Object.entries(goal_analysis);
  return Promise.all(
    entries.map(async ([name, data]) => {
      try {
        const pessimistic = await fetchGoalFeasibility(data.goal, pessimisticSurplus);
        const currentIdx = FEASIBILITY_ORDER.indexOf(data.feasibility_class);
        const pessimisticIdx = FEASIBILITY_ORDER.indexOf(pessimistic.feasibility_class);
        return {
          name,
          currentClass: data.feasibility_class,
          pessimisticClass: pessimistic.feasibility_class,
          atRisk: currentIdx >= 0 && pessimisticIdx >= 0 && pessimisticIdx < currentIdx,
        };
      } catch {
        return { name, currentClass: data.feasibility_class, pessimisticClass: data.feasibility_class, atRisk: false };
      }
    })
  );
}

function clampRatio(ratio: number): number {
  if (!Number.isFinite(ratio)) return 1;
  return Math.max(0, Math.min(1, ratio));
}
