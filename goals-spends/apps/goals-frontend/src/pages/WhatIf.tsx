import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, SlidersHorizontal, TrendingDown, TrendingUp } from 'lucide-react';
import { usePlan } from '@/context/PlanContext';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge, feasibilityTone } from '@/components/ui/Badge';
import { fetchComprehensivePlan, extractErrorMessage } from '@/api/client';
import { applyWhatIfScenario, hasWhatIfChanges, DEFAULT_WHAT_IF_CHANGES, type WhatIfChanges } from '@/utils/whatIf';
import { formatINR, formatPercent } from '@/utils/format';
import type { ComprehensivePlan } from '@/types';

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
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

export function WhatIf() {
  const { plan: basePlan, userData } = usePlan();
  const [changes, setChanges] = useState<WhatIfChanges>(DEFAULT_WHAT_IF_CHANGES);
  const [scenarioPlan, setScenarioPlan] = useState<ComprehensivePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!hasWhatIfChanges(changes)) {
      setScenarioPlan(null);
      setError(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const reqId = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      fetchComprehensivePlan(applyWhatIfScenario(userData, changes))
        .then((result) => {
          if (requestIdRef.current !== reqId) return;
          setScenarioPlan(result);
        })
        .catch((err) => {
          if (requestIdRef.current !== reqId) return;
          setError(extractErrorMessage(err));
        })
        .finally(() => {
          if (requestIdRef.current === reqId) setLoading(false);
        });
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changes, userData]);

  if (!basePlan) return null;

  const active = scenarioPlan ?? basePlan;
  const baseSurplus = basePlan.situation_analysis.expenses.monthly_surplus;
  const scenarioSurplus = active.situation_analysis.expenses.monthly_surplus;
  const surplusDelta = scenarioSurplus - baseSurplus;

  const goalRows = Object.entries(basePlan.goal_analysis).map(([name, baseData]) => {
    const scenarioData = active.goal_analysis[name];
    return { name, base: baseData, scenario: scenarioData };
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold text-ink-800">
              <SlidersHorizontal size={18} className="text-maroon-600" />
              What-If Playground
            </h3>
          </CardHeader>
          <CardBody className="space-y-5">
            <p className="text-xs text-ink-400">
              Drag the sliders to hypothetically change your spending or income, then see a REAL recomputed plan —
              not a guess.
            </p>
            <Slider
              label="Flexible/Leakage spend"
              value={changes.flexSpendPercent}
              min={-50}
              max={100}
              step={5}
              onChange={(v) => setChanges((c) => ({ ...c, flexSpendPercent: v }))}
              format={(v) => `${v > 0 ? '+' : ''}${v}%`}
            />
            <Slider
              label="New monthly expense"
              value={changes.newMonthlyExpense}
              min={0}
              max={50000}
              step={1000}
              onChange={(v) => setChanges((c) => ({ ...c, newMonthlyExpense: v }))}
              format={(v) => formatINR(v, { compact: true })}
            />
            <Slider
              label="Income change"
              value={changes.incomePercent}
              min={-30}
              max={30}
              step={1}
              onChange={(v) => setChanges((c) => ({ ...c, incomePercent: v }))}
              format={(v) => `${v > 0 ? '+' : ''}${v}%`}
            />
            <button
              onClick={() => setChanges(DEFAULT_WHAT_IF_CHANGES)}
              className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-500 transition hover:border-ink-300 hover:text-ink-700"
            >
              Reset scenario
            </button>
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </CardBody>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-ink-800">Monthly Surplus Impact</h3>
            {loading && <Loader2 size={16} className="animate-spin text-maroon-600" />}
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-ink-400">Current</p>
                <p className="text-xl font-bold text-ink-800">{formatINR(baseSurplus, { compact: true })}</p>
              </div>
              <div className="flex items-center gap-1 text-lg font-bold">
                {surplusDelta === 0 ? null : surplusDelta > 0 ? (
                  <TrendingUp size={20} className="text-emerald-600" />
                ) : (
                  <TrendingDown size={20} className="text-rose-600" />
                )}
                <span className={surplusDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {surplusDelta === 0 ? '—' : `${surplusDelta > 0 ? '+' : ''}${formatINR(surplusDelta, { compact: true })}`}
                </span>
              </div>
              <div>
                <p className="text-xs text-ink-400">Scenario</p>
                <p className="text-xl font-bold text-maroon-700">{formatINR(scenarioSurplus, { compact: true })}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-ink-800">Goal Feasibility Impact</h3>
          </CardHeader>
          <CardBody className="space-y-2.5">
            {goalRows.map(({ name, base, scenario }) => (
              <div key={name} className="flex items-center justify-between rounded-xl border border-ink-100 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink-800">{name}</p>
                  <p className="text-xs text-ink-400">
                    {formatPercent(base.success_probability)} &rarr;{' '}
                    {scenario ? formatPercent(scenario.success_probability) : formatPercent(base.success_probability)}{' '}
                    success odds
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge tone={feasibilityTone(base.feasibility_class)}>{base.feasibility_class.replace(/_/g, ' ')}</Badge>
                  {scenario && scenario.feasibility_class !== base.feasibility_class && (
                    <>
                      <span className="text-ink-300">&rarr;</span>
                      <Badge tone={feasibilityTone(scenario.feasibility_class)}>
                        {scenario.feasibility_class.replace(/_/g, ' ')}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
