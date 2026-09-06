import { describe, expect, it } from 'vitest';
import { formatINR, formatPercent, tierLabel, monthsToYearsMonths } from './format';

describe('formatINR', () => {
  it('formats compact crores', () => {
    expect(formatINR(15000000, { compact: true })).toBe('₹1.50 Cr');
  });

  it('formats compact lakhs', () => {
    expect(formatINR(300000, { compact: true })).toBe('₹3.00 L');
  });

  it('formats compact thousands', () => {
    expect(formatINR(4500, { compact: true })).toBe('₹4.5 K');
  });

  it('preserves the negative sign', () => {
    expect(formatINR(-500, { compact: true })).toBe('-₹500');
  });

  it('falls back to ₹0 for non-finite input', () => {
    expect(formatINR(NaN)).toBe('₹0');
  });
});

describe('formatPercent', () => {
  it('treats values <= 1 as fractions', () => {
    expect(formatPercent(0.856, 1)).toBe('85.6%');
  });

  it('treats values > 1 as already-percentages', () => {
    expect(formatPercent(85.6, 1)).toBe('85.6%');
  });
});

describe('tierLabel', () => {
  it('maps known tier codes to friendly labels', () => {
    expect(tierLabel('Tier_A_NonNegotiable')).toBe('Essential');
    expect(tierLabel('Tier_D_Leakage')).toBe('Leakage');
  });

  it('title-cases unknown tiers instead of crashing', () => {
    expect(tierLabel('some_new_tier')).toBe('Some New Tier');
  });
});

describe('monthsToYearsMonths', () => {
  it('renders whole years with no remainder', () => {
    expect(monthsToYearsMonths(24)).toBe('2 yr');
  });

  it('renders years and months together', () => {
    expect(monthsToYearsMonths(18)).toBe('1 yr 6 mo');
  });

  it('renders sub-year durations in months only', () => {
    expect(monthsToYearsMonths(6)).toBe('6 mo');
  });
});
