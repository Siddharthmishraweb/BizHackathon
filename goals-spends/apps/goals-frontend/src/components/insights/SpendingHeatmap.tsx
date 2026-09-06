import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { formatINR } from '@/utils/format';
import type { TemporalPatterns } from '@/types';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function SpendingHeatmap({ patterns }: { patterns: TemporalPatterns }) {
  const dayOfWeekData = DAY_ORDER.map((day) => ({ day: day.slice(0, 3), full: day, amount: patterns.by_day_of_week[day] ?? 0 }));
  const maxDayOfMonth = Math.max(1, ...Object.values(patterns.by_day_of_month));
  const total = patterns.weekend_spending + patterns.weekday_spending;
  const weekendPct = total > 0 ? (patterns.weekend_spending / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="font-semibold text-ink-800">Spending Calendar</h3>
          <p className="text-xs text-ink-400">When in the month (and week) you actually spend</p>
        </div>
      </CardHeader>
      <CardBody className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">By day of month</p>
          <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-10">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const value = patterns.by_day_of_month[String(day)] ?? 0;
              const intensity = value / maxDayOfMonth;
              return (
                <div key={day} className="group relative">
                  <div
                    className="flex aspect-square items-center justify-center rounded-md text-[10px] font-semibold"
                    style={{
                      backgroundColor: value > 0 ? `rgba(169, 31, 82, ${0.12 + intensity * 0.75})` : '#f6f5f7',
                      color: intensity > 0.5 ? '#ffffff' : '#5f5867',
                    }}
                  >
                    {day}
                  </div>
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg border border-maroon-100 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 opacity-0 shadow-card transition-opacity duration-150 group-hover:opacity-100">
                    Day {day}: {formatINR(value, { compact: true })}
                    <div className="absolute left-1/2 top-full h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-maroon-100 bg-white" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">By day of week</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1ede9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#7b7482' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => formatINR(v, { compact: true })} tick={{ fontSize: 11, fill: '#7b7482' }} axisLine={false} tickLine={false} width={56} />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #f3cfdd', fontSize: 13 }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {dayOfWeekData.map((d, i) => (
                    <Cell key={i} fill={d.day === 'Sat' || d.day === 'Sun' ? '#c6952c' : '#a91f52'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3 text-sm">
          <span className="text-ink-600">
            <strong className="text-gold-700">Weekend</strong> spending
          </span>
          <span className="font-semibold text-ink-800">
            {formatINR(patterns.weekend_spending, { compact: true })} ({weekendPct.toFixed(0)}%)
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
