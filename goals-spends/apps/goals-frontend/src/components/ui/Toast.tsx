import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from 'lucide-react';
import clsx from 'clsx';
import { useToast, type ToastTone } from '@/context/ToastContext';

const TONE_STYLES: Record<ToastTone, { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  error: { icon: AlertCircle, classes: 'border-rose-200 bg-rose-50 text-rose-800' },
  info: { icon: Info, classes: 'border-maroon-200 bg-white text-ink-800' },
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:pr-6">
      <AnimatePresence>
        {toasts.map((toast) => {
          const tone = TONE_STYLES[toast.tone];
          const Icon = tone.icon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={clsx(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-card-hover backdrop-blur-sm',
                tone.classes
              )}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug">{toast.message}</p>
                {toast.description && <p className="mt-0.5 text-xs opacity-80">{toast.description}</p>}
              </div>
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    dismissToast(toast.id);
                  }}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-white/70 px-2.5 py-1 text-xs font-semibold text-maroon-700 ring-1 ring-inset ring-maroon-200 transition hover:bg-white"
                >
                  <Undo2 size={12} />
                  {toast.action.label}
                </button>
              )}
              <button
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 text-ink-400 transition hover:text-ink-700"
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
