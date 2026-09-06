import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { categorizeExpense, extractErrorMessage } from '@/api/client';
import type { CategorizePrediction, Transaction } from '@/types';
import { tierLabel } from '@/utils/format';
import { Wand2, Loader2 } from 'lucide-react';

// "Quick add expense, no manual tagging" demo — predicts tier/category from the user's own
// transaction history via /api/v1/expense/categorize (RandomForest, falls back to heuristic).
export function CategorizeDemo({ historicalTransactions }: { historicalTransactions: Transaction[] }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [prediction, setPrediction] = useState<CategorizePrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = async () => {
    if (!description.trim() || !amount) return;
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const result = await categorizeExpense(historicalTransactions, {
        amount: Number(amount),
        description: description.trim(),
      });
      setPrediction(result);
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
          <Wand2 size={17} className="text-gold-600" />
          Smart Auto-Categorization
        </h3>
      </CardHeader>
      <CardBody className="space-y-3">
        <p className="text-xs text-ink-400">Type a new expense and see it auto-tagged from your own spending history.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Swiggy order"
            className="flex-1 rounded-xl border border-ink-200 px-3 py-2 text-sm focus:border-maroon-400 focus:outline-none"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="Amount (₹)"
            inputMode="decimal"
            className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm focus:border-maroon-400 focus:outline-none sm:w-32"
          />
          <button
            onClick={predict}
            disabled={loading || !description.trim() || !amount}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-axis-gradient px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            Predict
          </button>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {prediction && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-ink-50 p-3">
            <Badge tone="maroon">{tierLabel(prediction.predicted_tier)}</Badge>
            <Badge tone="gold">{prediction.predicted_category}</Badge>
            <span className="text-xs text-ink-400">
              {(prediction.category_confidence * 100).toFixed(0)}% confidence &middot;{' '}
              {prediction.method === 'random_forest' ? 'trained on your history' : 'heuristic fallback'}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
