import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge, priorityTone } from '@/components/ui/Badge';
import { usePlan } from '@/context/PlanContext';
import { explainRecommendation, extractErrorMessage, validateRecommendationSafety } from '@/api/client';
import type { RecommendationExplanation } from '@/api/client';
import type { Recommendation, SafetyCheckResult } from '@/types';
import { formatINR, titleCase } from '@/utils/format';

export function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const { userData } = usePlan();
  const [open, setOpen] = useState(false);
  const [explanation, setExplanation] = useState<RecommendationExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [safety, setSafety] = useState<SafetyCheckResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    validateRecommendationSafety(userData, rec)
      .then((result) => {
        if (!cancelled) setSafety(result);
      })
      .catch(() => {
        /* safety badge is a nice-to-have; silently skip on failure */
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.id]);

  const toggle = async () => {
    setOpen((o) => !o);
    if (!explanation && !loading) {
      setLoading(true);
      setError(null);
      try {
        setExplanation(await explainRecommendation(rec));
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
      <Card>
        <CardHeader className="items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-ink-900">{rec.title}</h3>
              <Badge tone={priorityTone(rec.priority)}>{rec.priority}</Badge>
              <Badge tone="slate">{rec.timeline}</Badge>
              {safety && (
                <Badge tone={safety.is_safe ? 'green' : 'red'} className="gap-1">
                  {safety.is_safe ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                  {safety.is_safe ? 'Safe' : 'Risky'}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-maroon-500">{rec.category}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-600">{formatINR(rec.estimated_impact, { compact: true })}</p>
            <p className="text-[11px] text-ink-400">{rec.impact_type.replace(/_/g, ' ')}</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm leading-relaxed text-ink-600">{rec.description}</p>
          <div className="rounded-xl bg-ink-50 p-3 text-sm text-ink-700">
            <span className="font-semibold text-ink-800">Action: </span>
            {rec.action}
          </div>

          <button
            onClick={toggle}
            className="flex w-full items-center justify-between rounded-xl border border-maroon-200 bg-maroon-50/50 px-3 py-2 text-sm font-semibold text-maroon-700 transition hover:bg-maroon-50"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={14} />
              Why this recommendation?
            </span>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />}
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                {error && <p className="text-sm text-rose-600">{error}</p>}
                {safety && !safety.is_safe && safety.safety_concerns.length > 0 && (
                  <div className="mb-2.5 rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-sm">
                    <span className="font-semibold text-rose-700">Safety concerns: </span>
                    <ul className="ml-4 list-disc text-rose-600">
                      {safety.safety_concerns.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {explanation && (
                  <div className="space-y-2.5 rounded-xl border border-gold-200 bg-gold-50/40 p-4 text-sm">
                    <p className="text-ink-700">
                      <span className="font-semibold text-gold-800">Why: </span>
                      {explanation.why}
                    </p>
                    <p className="text-ink-700">
                      <span className="font-semibold text-gold-800">Impact: </span>
                      {explanation.what_will_change}
                    </p>
                    {explanation.risks.length > 0 && (
                      <div>
                        <span className="font-semibold text-gold-800">Risks: </span>
                        <ul className="ml-4 list-disc text-ink-600">
                          {explanation.risks.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {explanation.alternatives.length > 0 && (
                      <p className="text-ink-700">
                        <span className="font-semibold text-gold-800">Alternative: </span>
                        {explanation.alternatives[0].title} &mdash; {explanation.alternatives[0].description}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between text-xs text-ink-400">
            <span>Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
            <span>{titleCase(rec.implementation_difficulty)} to implement</span>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
