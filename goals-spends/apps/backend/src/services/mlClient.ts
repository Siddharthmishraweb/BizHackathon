import type { CanonicalGoal, CanonicalUserData } from '../data/canonicalUser';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

export interface MlGoalFeasibility {
  goal: CanonicalGoal;
  feasibility_class: string;
  success_probability: number;
  required_monthly: number;
  available_monthly: number;
  recovery_plan: unknown[];
}

/**
 * Asks the ML engine (ml/api.py) — the single source of truth for feasibility
 * maths (Monte Carlo simulation, recovery plans) — to score every goal in
 * userData. Returns null on any failure (ml engine not running yet, network
 * hiccup, timeout, ...) so callers can fall back to a simpler local estimate
 * instead of breaking the dashboard when the ML engine is down.
 */
export async function fetchGoalFeasibility(
  userData: CanonicalUserData
): Promise<Record<string, MlGoalFeasibility> | null> {
  try {
    const res = await fetch(`${ML_API_URL}/api/v1/analyze/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { goals?: Record<string, MlGoalFeasibility> };
    return json.goals ?? null;
  } catch {
    return null;
  }
}

export async function isMlEngineHealthy(): Promise<boolean> {
  try {
    const res = await fetch(`${ML_API_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return false;
    const json = (await res.json()) as { status?: string };
    return json.status === 'healthy';
  } catch {
    return false;
  }
}
