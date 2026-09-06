// Lightweight global toast system — used for add/delete confirmations and (crucially)
// the "Undo" affordance on goal deletion. Kept dependency-free (no external toast lib).
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  message: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
  action?: ToastAction;
}

export interface ToastItem extends Required<Pick<ToastOptions, 'message' | 'tone' | 'duration'>> {
  id: string;
  description?: string;
  action?: ToastAction;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const item: ToastItem = {
        id,
        message: options.message,
        description: options.description,
        tone: options.tone ?? 'info',
        duration: options.duration ?? 4500,
        action: options.action,
      };
      setToasts((prev) => [...prev, item]);
      timers.current[id] = setTimeout(() => dismissToast(id), item.duration);
      return id;
    },
    [dismissToast]
  );

  const value = useMemo(() => ({ toasts, showToast, dismissToast }), [toasts, showToast, dismissToast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
