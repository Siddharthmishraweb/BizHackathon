// Formatting helpers for Indian currency/number conventions.

export function formatINR(amount: number, options: { compact?: boolean } = {}): string {
  if (!Number.isFinite(amount)) return '₹0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (options.compact) {
    if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
    if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
    if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)} K`;
    return `${sign}₹${abs.toFixed(0)}`;
  }

  return `${sign}₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(abs)}`;
}

export function formatPercent(value: number, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return '0%';
  // Values in the API are sometimes 0-1 fractions, sometimes already percentages.
  const pct = value <= 1 ? value * 100 : value;
  return `${pct.toFixed(fractionDigits)}%`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function titleCase(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function tierLabel(tier: string): string {
  const map: Record<string, string> = {
    Tier_A_NonNegotiable: 'Essential',
    Tier_B_Optimizable: 'Optimizable',
    Tier_C_Flexible: 'Flexible',
    Tier_D_Leakage: 'Leakage',
  };
  return map[tier] ?? titleCase(tier);
}

export function monthsToYearsMonths(months: number): string {
  const y = Math.floor(months / 12);
  const m = Math.round(months % 12);
  if (y <= 0) return `${m} mo`;
  if (m === 0) return `${y} yr`;
  return `${y} yr ${m} mo`;
}
