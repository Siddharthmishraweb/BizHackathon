import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-8 text-center">
      <span className="rounded-full bg-rose-100 p-3 text-rose-600">
        <AlertTriangle size={24} />
      </span>
      <div>
        <p className="font-semibold text-rose-800">Couldn&apos;t load your financial plan</p>
        <p className="mt-1 text-sm text-rose-600">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-maroon-700 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-maroon-800"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      )}
    </div>
  );
}
