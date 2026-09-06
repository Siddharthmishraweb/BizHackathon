import { describe, expect, it } from 'vitest';
import { parseGoalText } from './goalParser';

/** Mirrors the parser's private addMonths() (day pinned to 1 to avoid month-length overflow). */
function expectedAddMonths(months: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

describe('parseGoalText', () => {
  it('parses amount (lakhs), deadline (in N months) and a car category from "bike"', () => {
    const result = parseGoalText('Buy a bike for 2 lakhs in 18 months');

    expect(result.name).toBe('Buy a Bike');
    expect(result.category).toBe('car');
    expect(result.targetAmount).toBe(200000);
    expect(result.deadline).toBe(expectedAddMonths(18));
  });

  it('parses ₹ amounts with comma separators', () => {
    const result = parseGoalText('Emergency fund of ₹5,00,000');

    expect(result.category).toBe('emergency');
    expect(result.targetAmount).toBe(500000);
  });

  it('parses "by <year>" deadlines as the end of that year', () => {
    const result = parseGoalText('Save for MBA by 2030');

    expect(result.category).toBe('education');
    expect(result.deadline).toBe('2030-12-31');
  });

  it('does not misread a plausible calendar year as a rupee amount', () => {
    const result = parseGoalText('Save for MBA by 2030');
    expect(result.targetAmount).toBeUndefined();
  });

  it('detects urgent priority', () => {
    const result = parseGoalText('Urgent: buy a car for 8 lakhs');

    expect(result.priority).toBe(1);
    expect(result.category).toBe('car');
    expect(result.targetAmount).toBe(800000);
  });

  it('falls back to the category label when nothing meaningful remains in the name', () => {
    const result = parseGoalText('for 2 lakhs in 18 months');
    expect(result.name.length).toBeGreaterThan(0);
  });

  it('returns an empty parse for blank input without throwing', () => {
    const result = parseGoalText('   ');
    expect(result.name).toBe('');
    expect(result.targetAmount).toBeUndefined();
    expect(result.deadline).toBeUndefined();
  });
});
