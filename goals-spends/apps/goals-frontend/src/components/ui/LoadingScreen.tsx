import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function LoadingScreen({ label = 'Crunching your financial picture…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <motion.div
        className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-axis-gradient shadow-glow"
        animate={{ rotate: [0, 6, -6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Sparkles className="text-gold-200" size={28} />
      </motion.div>
      <div>
        <p className="font-semibold text-ink-800">{label}</p>
        <p className="text-sm text-ink-400">The AI engine is analyzing income, expenses, goals &amp; risk…</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-maroon-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
