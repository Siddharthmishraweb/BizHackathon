import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlan } from '@/context/PlanContext';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { SpendingHeatmap } from '@/components/insights/SpendingHeatmap';
import { TopMerchants } from '@/components/insights/TopMerchants';
import { AnomalyAlerts } from '@/components/insights/AnomalyAlerts';
import { SubscriptionKiller } from '@/components/insights/SubscriptionKiller';
import { PaydaySpikeCard } from '@/components/insights/PaydaySpikeCard';
import { LifestyleInflationCard } from '@/components/insights/LifestyleInflationCard';
import { BillCreepCard } from '@/components/insights/BillCreepCard';
import { PeerBenchmarkCard } from '@/components/insights/PeerBenchmarkCard';
import { CategorizeDemo } from '@/components/insights/CategorizeDemo';
import { deriveSubscriptions } from '@/utils/subscriptions';
import {
  extractErrorMessage,
  fetchBillCreep,
  fetchExpenseAnalysis,
  fetchLifestyleInflation,
  fetchPaydaySpikes,
  fetchPeerBenchmark,
} from '@/api/client';
import type {
  BillCreepItem,
  ExpenseAnalysis,
  LifestyleInflationResult,
  PaydaySpikeResult,
  PeerBenchmarkItem,
} from '@/types';

interface InsightsData {
  expenseAnalysis: ExpenseAnalysis;
  paydaySpikes: PaydaySpikeResult;
  lifestyleInflation: LifestyleInflationResult;
  billCreep: BillCreepItem[];
  peerBenchmark: PeerBenchmarkItem[];
}

export function Insights() {
  const { userData, plan } = usePlan();
  const [data, setData] = useState<InsightsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    const monthlyIncome = plan?.situation_analysis.income.monthly_income ?? 0;

    Promise.all([
      fetchExpenseAnalysis(userData.transactions),
      fetchPaydaySpikes(userData.transactions),
      fetchLifestyleInflation(userData.transactions),
      fetchBillCreep(userData.transactions),
      fetchPeerBenchmark(userData.transactions, monthlyIncome),
    ])
      .then(([expenseAnalysis, paydaySpikes, lifestyleInflation, billCreep, peerBenchmark]) => {
        if (cancelled) return;
        setData({ expenseAnalysis, paydaySpikes, lifestyleInflation, billCreep, peerBenchmark });
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [userData, plan]);

  if (error) return <ErrorBanner message={error} />;
  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <LoadingScreen />
      </div>
    );
  }

  const subscriptions = deriveSubscriptions(data.expenseAnalysis.recurring_transactions);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <SpendingHeatmap patterns={data.expenseAnalysis.temporal_patterns} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <TopMerchants merchants={data.expenseAnalysis.spending_by_merchant} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AnomalyAlerts anomalies={data.expenseAnalysis.anomalies} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SubscriptionKiller subscriptions={subscriptions} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <PaydaySpikeCard result={data.paydaySpikes} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <LifestyleInflationCard result={data.lifestyleInflation} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <BillCreepCard items={data.billCreep} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <PeerBenchmarkCard items={data.peerBenchmark} />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <CategorizeDemo historicalTransactions={userData.transactions} />
      </motion.div>
    </div>
  );
}
