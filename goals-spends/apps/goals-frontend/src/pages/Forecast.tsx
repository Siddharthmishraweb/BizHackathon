import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { usePlan } from '@/context/PlanContext';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { formatINR } from '@/utils/format';

export function Forecast() {
  const { plan } = usePlan();
  if (!plan) return null;

  const { cashflow_forecast: cf, scenario_forecast: sf } = plan;

  const chartData = sf.scenarios.expected.map((point, i) => ({
    month: `M${point.month}`,
    expected: point.savings,
    optimistic: sf.scenarios.optimistic[i]?.savings ?? point.savings,
    pessimistic: sf.scenarios.pessimistic[i]?.savings ?? point.savings,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Forecasted Income" value={cf.summary.total_forecasted_income} prefix="₹" icon={TrendingUp} tone="green" hint={`Over ${cf.forecast_period_months} months`} />
        <StatCard index={1} label="Forecasted Expenses" value={cf.summary.total_forecasted_expenses} prefix="₹" icon={TrendingDown} tone="red" hint="Includes mandatory + flexible" />
        <StatCard index={2} label="Forecasted Surplus" value={cf.summary.total_forecasted_surplus} prefix="₹" icon={PiggyBank} tone="gold" hint={`${formatINR(cf.summary.average_monthly_saving, { compact: true })}/mo average`} />
        <StatCard index={3} label="Projected Savings" value={cf.summary.final_projected_savings} prefix="₹" icon={Wallet} tone="maroon" hint={`${cf.savings_forecast.trend} trend`} />
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-ink-800">Savings Trajectory · Best / Expected / Worst Case</h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="optimistic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c6952c" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#c6952c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a91f52" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#a91f52" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pessimistic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7b7482" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#7b7482" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1ede9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#7b7482' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => formatINR(v, { compact: true })}
                    tick={{ fontSize: 12, fill: '#7b7482' }}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                  />
                  <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #f3cfdd', fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Area type="monotone" dataKey="optimistic" name="Optimistic" stroke="#c6952c" fill="url(#optimistic)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expected" name="Expected" stroke="#a91f52" fill="url(#expected)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="pessimistic" name="Pessimistic" stroke="#7b7482" fill="url(#pessimistic)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
