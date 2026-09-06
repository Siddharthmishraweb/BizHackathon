import { describe, expect, it } from 'vitest';
import { formatCurrency, formatPercent, getInitials, clsx } from './helpers';

describe('formatCurrency', () => {
  it('formats compact crores', () => {
    expect(formatCurrency(12500000, true)).toBe('₹1.25Cr');
  });

  it('formats compact lakhs', () => {
    expect(formatCurrency(250000, true)).toBe('₹2.5L');
  });

  it('formats compact thousands', () => {
    expect(formatCurrency(4500, true)).toBe('₹4.5K');
  });

  it('formats small amounts without a suffix', () => {
    expect(formatCurrency(500, true)).toBe('₹500');
  });

  it('formats full currency with the ₹ symbol', () => {
    expect(formatCurrency(1000)).toContain('1,000');
  });
});

describe('formatPercent', () => {
  it('prefixes positive values with a +', () => {
    expect(formatPercent(12.345)).toBe('+12.35%');
  });

  it('does not prefix negative values with an extra sign', () => {
    expect(formatPercent(-4.2)).toBe('-4.20%');
  });

  it('respects the decimals argument', () => {
    expect(formatPercent(1.999, 0)).toBe('+2%');
  });
});

describe('getInitials', () => {
  it('builds initials from a full name', () => {
    expect(getInitials('Arjun Sharma')).toBe('AS');
  });

  it('caps at two characters for long names', () => {
    expect(getInitials('Arjun Kumar Sharma')).toBe('AK');
  });
});

describe('clsx', () => {
  it('joins truthy class names and drops falsy ones', () => {
    expect(clsx('a', false, undefined, null, 'b')).toBe('a b');
  });
});
