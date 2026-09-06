import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, TrendingUp, PiggyBank, ShieldCheck, ShieldAlert, Lightbulb, Repeat, Sparkles } from 'lucide-react';
import { usePlan } from '@/context/PlanContext';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
import { AchievementsCard } from '@/components/dashboard/AchievementsCard';
import { formatINR, formatPercent, tierLabel } from '@/utils/format';

const TIER_COLORS: Record<string, string> = {
  Tier_A_NonNegotiable: '#8a1745',
  Tier_B_Optimizable: '#c6952c',
  Tier_C_Flexible: '#7b7482',
  Tier_D_Leakage: '#e11d48',
};

export function Dashboard() {
  const { plan, userData } = usePlan();
  if (!plan) return null;

  const { situation_analysis: s, key_insights } = plan;
  const tierData = Object.entries(s.expenses.spending_by_tier).map(([tier, v]) => ({
    tier,
    name: tierLabel(tier),
    value: v.total,
    percentage: v.percentage,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Net Worth"
          value={s.financial_health.net_worth}
          prefix="₹"
          icon={Wallet}
          tone={s.financial_health.net_worth >= 0 ? 'maroon' : 'red'}
          hint={`${formatINR(s.financial_health.total_assets, { compact: true })} assets · ${formatINR(
            s.financial_health.total_liabilities,
            { compact: true }
          )} liabilities`}
        />
        <StatCard
          index={1}
          label="Monthly Income"
          value={s.income.monthly_income}
          prefix="₹"
          icon={TrendingUp}
          tone="green"
          hint={`${s.income.income_sources_count} income sources · ${formatPercent(s.income.monthly_income_stability)} stable`}
        />
        <StatCard
          index={2}
          label="Monthly Surplus"
          value={s.expenses.monthly_surplus}
          prefix="₹"
          icon={PiggyBank}
          tone={s.expenses.monthly_surplus >= 0 ? 'gold' : 'red'}
          hint={`${formatINR(s.expenses.monthly_spending, { compact: true })} spent this month`}
        />
        <StatCard
          index={3}
          label="Emergency Fund"
          value={s.emergency_fund.available}
          prefix="₹"
          icon={s.emergency_fund.adequate ? ShieldCheck : ShieldAlert}
          tone={s.emergency_fund.adequate ? 'green' : 'red'}
          hint={`Target ${formatINR(s.emergency_fund.required, { compact: true })} · ${s.emergency_fund.status}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <h3 className="font-semibold text-ink-800">Spending Breakdown</h3>
              <Badge tone="maroon">{formatINR(s.expenses.monthly_spending, { compact: true })}/mo</Badge>
            </CardHeader>
            <CardBody>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tierData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {tierData.map((entry) => (
                        <Cell key={entry.tier} fill={TIER_COLORS[entry.tier] ?? '#a91f52'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, _name, item) => [formatINR(value), item?.payload?.name]}
                      contentStyle={{ borderRadius: 12, border: '1px solid #f3cfdd', fontSize: 13 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-2">
                {tierData.map((t) => (
                  <li key={t.tier} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TIER_COLORS[t.tier] }} />
                      {t.name}
                    </span>
                    <span className="font-semibold text-ink-800">{formatPercent(t.percentage)}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <h3 className="font-semibold text-ink-800">Key Insights</h3>
              <Sparkles size={18} className="text-gold-500" />
            </CardHeader>
            <CardBody className="space-y-3">
              {key_insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-maroon-50/60 p-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-maroon-700 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-ink-700">{insight}</p>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-ink-100 p-3">
                  <p className="text-xs font-medium text-ink-400">Spending Persona</p>
                  <p className="mt-0.5 text-sm font-semibold capitalize text-ink-800">{s.behavioral.spending_persona}</p>
                </div>
                <div className="rounded-xl border border-ink-100 p-3">
                  <p className="text-xs font-medium text-ink-400">Flexible Spending</p>
                  {/* Same field as the "Flexible" slice in Spending Breakdown above, so the two never disagree. */}
                  <p className="mt-0.5 text-sm font-semibold text-ink-800">
                    {formatPercent(s.expenses.spending_by_tier['Tier_C_Flexible']?.percentage ?? 0)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <Card className="h-full">
            <CardHeader>
              <h3 className="font-semibold text-ink-800">Subscriptions</h3>
              <Repeat size={18} className="text-maroon-500" />
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Active" value={s.subscriptions.total_count} />
                <Stat label="Monthly Cost" value={formatINR(s.subscriptions.total_monthly_cost)} />
                <Stat label="Possibly Unused" value={s.subscriptions.potentially_unused_count} tone="red" />
                <Stat label="Potential Savings/yr" value={formatINR(s.subscriptions.potential_savings_annual)} tone="green" />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
          <Card className="h-full">
            <CardHeader>
              <h3 className="font-semibold text-ink-800">Leakage Opportunities</h3>
              <Lightbulb size={18} className="text-gold-500" />
            </CardHeader>
            <CardBody className="space-y-2.5">
              {s.leakage.identified_items.length === 0 ? (
                <p className="text-sm text-ink-400">No significant leakage detected — nice work.</p>
              ) : (
                s.leakage.identified_items.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-ink-100 px-3 py-2">
                    <span className="text-sm text-ink-700">{item.description}</span>
                    <span className="text-sm font-semibold text-rose-600">{formatINR(item.annual_cost, { compact: true })}/yr</span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <HealthScoreCard plan={plan} userData={userData} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="lg:col-span-3">
          <AchievementsCard plan={plan} userData={userData} />
        </motion.div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: 'red' | 'green' }) {
  return (
    <div className="rounded-xl border border-ink-100 p-3">
      <p className="text-xs font-medium text-ink-400">{label}</p>
      <p
        className={`mt-0.5 text-sm font-semibold ${
          tone === 'red' ? 'text-rose-600' : tone === 'green' ? 'text-emerald-600' : 'text-ink-800'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
