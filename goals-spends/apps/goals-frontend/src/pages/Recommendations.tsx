import { motion } from 'framer-motion';
import { CalendarClock, CalendarDays, CalendarRange, IndianRupee } from 'lucide-react';
import { usePlan } from '@/context/PlanContext';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import type { ActionItem } from '@/types';
import { formatINR } from '@/utils/format';

function ActionColumn({ title, icon: Icon, items }: { title: string; icon: typeof CalendarClock; items: ActionItem[] }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800">
          <Icon size={16} className="text-maroon-600" />
          {title}
        </h3>
        <span className="text-xs font-semibold text-ink-400">{items.length}</span>
      </CardHeader>
      <CardBody className="flex-1 space-y-2.5">
        {items.length === 0 ? (
          <p className="text-sm text-ink-400">Nothing scheduled.</p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="rounded-xl border border-ink-100 p-3">
              <p className="text-sm font-semibold text-ink-800">{item.title}</p>
              <p className="mt-0.5 text-xs text-ink-500">{item.description}</p>
              <p className="mt-1.5 text-xs font-semibold text-emerald-600">+{formatINR(item.expected_impact, { compact: true })}</p>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}

export function Recommendations() {
  const { plan } = usePlan();
  if (!plan) return null;

  const { recommendations, action_plan } = plan;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total Actions" value={action_plan.summary.total_actions} icon={CalendarRange} tone="maroon" />
        <StatCard index={1} label="Monthly Impact" value={action_plan.summary.estimated_monthly_impact} prefix="₹" icon={IndianRupee} tone="green" />
        <StatCard index={2} label="Annual Impact" value={action_plan.summary.estimated_annual_impact} prefix="₹" icon={IndianRupee} tone="gold" />
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionColumn title="Today" icon={CalendarClock} items={action_plan.today} />
        <ActionColumn title="This Week" icon={CalendarDays} items={action_plan.this_week} />
        <ActionColumn title="This Month" icon={CalendarRange} items={action_plan.this_month} />
      </motion.div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-ink-900">All Recommendations</h2>
        <div className="space-y-4">
          {recommendations.map((rec, i) => (
            <RecommendationCard key={rec.id} rec={rec} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
