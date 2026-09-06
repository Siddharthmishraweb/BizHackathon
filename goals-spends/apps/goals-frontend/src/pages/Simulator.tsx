import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Play, Loader2, Gauge, ShieldCheck, CalendarCheck2 } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge, riskTone } from '@/components/ui/Badge';
import { usePlan } from '@/context/PlanContext';
import { extractErrorMessage, runMonteCarloSimulation } from '@/api/client';
import type { GoalAnalysisEntry, MonteCarloResult } from '@/types';
import { formatINR, monthsToYearsMonths } from '@/utils/format';

interface FormState {
  currentAmount: number;
  monthlyContribution: number;
  targetAmount: number;
  months: number;
}

// Only used as a last-resort fallback if a profile somehow has zero goals to simulate.
const DEFAULT_FORM: FormState = {
  currentAmount: 300000,
  monthlyContribution: 15000,
  targetAmount: 1500000,
  months: 18,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function monthsUntil(deadline: string): number {
  const target = new Date(deadline);
  const now = new Date();
  return Math.max(1, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
}

// Seeds the simulator's sliders from a REAL goal + the surplus actually available to it
// (the same inputs the backend already used to compute that goal's success_probability on
// the Goals page), so opening the simulator starts from a grounded baseline instead of
// generic placeholder numbers unrelated to the signed-in profile.
function buildFormFromGoal(entry: GoalAnalysisEntry): FormState {
  return {
    currentAmount: Math.max(0, Math.round(entry.goal.current_amount)),
    targetAmount: Math.max(1, Math.round(entry.goal.target_amount)),
    months: monthsUntil(entry.goal.deadline),
    monthlyContribution: Math.max(1000, Math.round(entry.available_monthly / 1000) * 1000),
  };
}

function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink-600">{label}</span>
        <span className="font-bold text-maroon-700">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink-100 accent-maroon-700"
      />
    </div>
  );
}

export function Simulator() {
  const { plan } = usePlan();
  const goalEntries = plan ? Object.entries(plan.goal_analysis) : [];

  const [selectedGoal, setSelectedGoal] = useState<string>(() => goalEntries[0]?.[0] ?? '');
  const [form, setForm] = useState<FormState>(() => (goalEntries[0] ? buildFormFromGoal(goalEntries[0][1]) : DEFAULT_FORM));
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runId, setRunId] = useState(0);
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null);

  const runSimulation = async (formOverride?: FormState) => {
    const activeForm = formOverride ?? form;
    setLoading(true);
    setError(null);
    const startedAt = Date.now();
    try {
      // Derive volatility from this profile's OWN analyzed income stability/spending
      // consistency (already computed by the ML engine from real transaction history)
      // instead of always simulating with the same generic constants for everyone.
      const s = plan?.situation_analysis;
      const sim = await runMonteCarloSimulation({
        currentAmount: activeForm.currentAmount,
        monthlyContribution: activeForm.monthlyContribution,
        targetAmount: activeForm.targetAmount,
        months: activeForm.months,
        iterations: 2000,
        incomeVolatility: s ? clamp(1 - s.income.monthly_income_stability, 0.05, 0.5) : undefined,
        expenseVolatility: s ? clamp(1 - s.behavioral.spending_consistency, 0.05, 0.5) : undefined,
        emergencyFundRequirement: s?.emergency_fund.required,
      });
      // Keep the loading state visible for a moment so fast (seeded, so often
      // identical-looking) responses still feel like a fresh run happened.
      const remaining = 450 - (Date.now() - startedAt);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      setResult(sim);
      setRunId((id) => id + 1);
      setLastRunAt(new Date());
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Re-baseline on mount AND whenever the active profile/goal set changes (e.g. switching
  // personas via the Topbar), so the simulator never keeps simulating a stale profile's data.
  useEffect(() => {
    if (!plan) return;
    const entries = Object.entries(plan.goal_analysis);
    const first = entries[0];
    const nextForm = first ? buildFormFromGoal(first[1]) : DEFAULT_FORM;
    setSelectedGoal(first?.[0] ?? '');
    setForm(nextForm);
    runSimulation(nextForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  function handleGoalChange(name: string) {
    setSelectedGoal(name);
    const entry = plan?.goal_analysis[name];
    if (!entry) return;
    const nextForm = buildFormFromGoal(entry);
    setForm(nextForm);
    runSimulation(nextForm);
  }

  const probabilityPct = result ? result.success_probability * 100 : 0;
  const gaugeData = [{ name: 'probability', value: probabilityPct, fill: probabilityColor(probabilityPct) }];

  const percentileData = result
    ? [
        { name: 'Cautious (P10)', value: result.percentile_10 },
        { name: 'Likely (P50)', value: result.percentile_50 },
        { name: 'Optimistic (P90)', value: result.percentile_90 },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-ink-800">Simulate a Goal</h3>
          </CardHeader>
          <CardBody className="space-y-5">
            {goalEntries.length > 0 && (
              <div>
                <label htmlFor="simulator-goal-select" className="text-sm font-medium text-ink-600">
                  Real Goal
                </label>
                <select
                  id="simulator-goal-select"
                  value={selectedGoal}
                  onChange={(e) => handleGoalChange(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 focus:border-maroon-400 focus:outline-none"
                >
                  {goalEntries.map(([name]) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-ink-400">
                  Sliders start from this goal's real numbers — adjust them to explore "what if" scenarios.
                </p>
              </div>
            )}
            <Slider label="Current Savings" value={form.currentAmount} min={0} max={5000000} step={10000} onChange={(v) => setForm((f) => ({ ...f, currentAmount: v }))} format={(v) => formatINR(v, { compact: true })} />
            <Slider label="Monthly Contribution" value={form.monthlyContribution} min={1000} max={200000} step={1000} onChange={(v) => setForm((f) => ({ ...f, monthlyContribution: v }))} format={(v) => formatINR(v, { compact: true })} />
            <Slider label="Target Amount" value={form.targetAmount} min={100000} max={20000000} step={50000} onChange={(v) => setForm((f) => ({ ...f, targetAmount: v }))} format={(v) => formatINR(v, { compact: true })} />
            <Slider label="Time Horizon" value={form.months} min={1} max={240} step={1} onChange={(v) => setForm((f) => ({ ...f, months: v }))} format={(v) => monthsToYearsMonths(v)} />

            <button
              onClick={() => runSimulation()}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-axis-gradient px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? <Loader2 size={17} className="animate-spin" /> : <Play size={17} />}
              {loading ? 'Simulating…' : 'Run 2,000-Path Simulation'}
            </button>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            {lastRunAt && !loading && !error && (
              <p className="text-center text-xs text-ink-400">
                Last run at {lastRunAt.toLocaleTimeString()} &middot; same inputs always reproduce the same simulated
                outcome (fixed random seed)
              </p>
            )}
          </CardBody>
        </Card>
      </motion.div>

      <motion.div
        key={runId}
        initial={{ opacity: 0.4, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="lg:col-span-3 space-y-6"
      >
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold text-ink-800">
              <Gauge size={18} className="text-maroon-600" />
              Success Probability
            </h3>
            {result && <Badge tone={riskTone(result.risk_classification)}>{result.risk_classification.replace(/_/g, ' ')}</Badge>}
          </CardHeader>
          <CardBody>
            <div className="relative mx-auto h-52 w-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="72%" outerRadius="100%" data={gaugeData} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: '#f6f5f7' }} dataKey="value" cornerRadius={20} angleAxisId={0} isAnimationActive animationDuration={700} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-ink-900">{probabilityPct.toFixed(0)}%</span>
                <span className="text-xs font-medium text-ink-400">chance of success</span>
              </div>
            </div>

            {result && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <MiniStat icon={ShieldCheck} label="Fund Safety" value={`${(result.emergency_fund_safety * 100).toFixed(0)}%`} />
                <MiniStat icon={CalendarCheck2} label="Avg. Months to Goal" value={result.average_months_to_success.toFixed(0)} />
                <MiniStat icon={Gauge} label="Simulations Run" value={result.total_iterations.toLocaleString()} />
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-ink-800">Projected Outcome Range</h3>
          </CardHeader>
          <CardBody>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={percentileData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1ede9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#7b7482' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatINR(v, { compact: true })} tick={{ fontSize: 12, fill: '#7b7482' }} axisLine={false} tickLine={false} width={64} />
                  <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #f3cfdd', fontSize: 13 }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {percentileData.map((_, i) => (
                      <Cell key={i} fill={['#c6952c', '#a91f52', '#8a1745'][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 p-3">
      <Icon size={16} className="mx-auto text-maroon-600" />
      <p className="mt-1 text-sm font-bold text-ink-800">{value}</p>
      <p className="text-[11px] text-ink-400">{label}</p>
    </div>
  );
}

function probabilityColor(pct: number): string {
  if (pct >= 70) return '#059669';
  if (pct >= 45) return '#c6952c';
  return '#e11d48';
}
