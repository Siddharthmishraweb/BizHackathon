// "Magic Add" — a small, deterministic natural-language parser that turns a sentence like
// "Buy a bike for 2 lakhs in 18 months" into structured goal fields. It never blocks the
// user: every field it fills stays fully editable, and anything it can't confidently
// detect is simply left blank rather than guessed.
import { CATEGORY_META, detectCategory, type GoalCategory } from './goalMeta';

export interface ParsedGoal {
  name: string;
  category: GoalCategory;
  targetAmount?: number;
  deadline?: string; // ISO yyyy-mm-dd
  priority?: number;
}

const AMOUNT_SUFFIX_MULTIPLIERS: Record<string, number> = {
  lakh: 1e5,
  lakhs: 1e5,
  lac: 1e5,
  lacs: 1e5,
  crore: 1e7,
  crores: 1e7,
  cr: 1e7,
  k: 1e3,
  thousand: 1e3,
};

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

const FILLER_PREFIX_RE =
  /^(i want to|i would like to|i'd like to|i wanna|i need to|i plan to|planning to|save (up )?for|saving (up )?for|to save (up )?for)\s*/i;

const AMOUNT_CONNECTOR_RE = /\b(for|of|worth|costing|around|approx\.?|about)\s*$/i;

const MINOR_WORDS = new Set(['a', 'an', 'the', 'to', 'for', 'of', 'in', 'on', 'and', 'or', 'with', 'by']);

interface Span {
  start: number;
  end: number;
}

function formatDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addMonths(months: number): string {
  const d = new Date();
  d.setDate(1); // avoid month-length overflow (e.g. Jan 31 + 1mo skipping to Mar)
  d.setMonth(d.getMonth() + months);
  return formatDateLocal(d);
}

function endOfYear(year: number): string {
  return `${year}-12-31`;
}

function extractDeadline(text: string): { iso: string; span: Span } | null {
  let match =
    /\bin\s+(\d+(?:\.\d+)?)\s*(year|years|yr|yrs)\b/i.exec(text);
  if (match) {
    return { iso: addMonths(Math.round(parseFloat(match[1]) * 12)), span: { start: match.index, end: match.index + match[0].length } };
  }

  match = /\bin\s+(\d+(?:\.\d+)?)\s*(month|months|mo|mos)\b/i.exec(text);
  if (match) {
    return { iso: addMonths(Math.round(parseFloat(match[1]))), span: { start: match.index, end: match.index + match[0].length } };
  }

  match = new RegExp(`\\bby\\s+(${MONTH_NAMES.join('|')})\\s+(\\d{4})\\b`, 'i').exec(text);
  if (match) {
    const monthIndex = MONTH_NAMES.indexOf(match[1].toLowerCase());
    const year = parseInt(match[2], 10);
    const d = new Date(year, monthIndex + 1, 0); // last day of that month
    return { iso: formatDateLocal(d), span: { start: match.index, end: match.index + match[0].length } };
  }

  match = /\bby\s+(\d{4})\b/i.exec(text);
  if (match) {
    return { iso: endOfYear(parseInt(match[1], 10)), span: { start: match.index, end: match.index + match[0].length } };
  }

  match = /\bin\s+a\s+year\b/i.exec(text);
  if (match) {
    return { iso: addMonths(12), span: { start: match.index, end: match.index + match[0].length } };
  }

  match = /\bnext\s+year\b/i.exec(text);
  if (match) {
    return { iso: addMonths(12), span: { start: match.index, end: match.index + match[0].length } };
  }

  match = /\bin\s+a\s+month\b/i.exec(text);
  if (match) {
    return { iso: addMonths(1), span: { start: match.index, end: match.index + match[0].length } };
  }

  return null;
}

function extractAmount(text: string, excludeSpan: Span | null): { value: number; span: Span } | null {
  const re = /(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(lakhs?|lacs?|crores?|cr|k|thousand)?\b/gi;
  let best: { value: number; span: Span; hasSignal: boolean } | null = null;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text))) {
    const span: Span = { start: match.index, end: match.index + match[0].length };
    if (excludeSpan && span.start < excludeSpan.end && span.end > excludeSpan.start) continue; // overlaps deadline text

    const numStr = match[1].replace(/,/g, '');
    const rawNum = parseFloat(numStr);
    if (!Number.isFinite(rawNum) || rawNum <= 0) continue;

    const suffix = match[2]?.toLowerCase();
    const hasCurrencySymbol = /^\s*(₹|rs\.?|inr)/i.test(match[0]);
    const multiplier = suffix ? AMOUNT_SUFFIX_MULTIPLIERS[suffix] : undefined;
    const hasSignal = Boolean(hasCurrencySymbol || multiplier);

    // A bare number with no ₹/lakh/crore/k signal and no decimals is ambiguous — if it
    // looks like a calendar year (skip it) or is too small (< 1000, likely a duration
    // like "2 years"), don't treat it as money.
    if (!hasSignal) {
      const isPlausibleYear = /^\d{4}$/.test(numStr) && rawNum >= 1900 && rawNum <= 2100;
      if (isPlausibleYear || rawNum < 1000) continue;
    }

    const value = rawNum * (multiplier ?? 1);
    if (!best || (hasSignal && !best.hasSignal)) {
      best = { value, span, hasSignal };
    }
  }

  return best ? { value: best.value, span: best.span } : null;
}

function toTitleCase(s: string): string {
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  return words
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (i !== 0 && i !== words.length - 1 && MINOR_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function deriveName(text: string, spansToRemove: Span[], category: GoalCategory): string {
  const sorted = [...spansToRemove].sort((a, b) => b.start - a.start);
  let cleaned = text;
  for (const span of sorted) {
    let { start, end } = span;
    const before = cleaned.slice(0, start);
    const connectorMatch = AMOUNT_CONNECTOR_RE.exec(before);
    if (connectorMatch) start -= connectorMatch[0].length;
    cleaned = (cleaned.slice(0, start) + ' ' + cleaned.slice(end)).replace(/\s+/g, ' ');
  }
  cleaned = cleaned.trim();

  for (let i = 0; i < 3; i++) {
    const next = cleaned.replace(FILLER_PREFIX_RE, '').trim();
    if (next === cleaned) break;
    cleaned = next;
  }

  cleaned = cleaned.replace(/[.,;:]+$/, '').trim();

  if (cleaned.length < 3) {
    return CATEGORY_META[category].label;
  }
  return toTitleCase(cleaned);
}

function detectPriority(text: string): number | undefined {
  if (/\b(urgent|asap|top priority|most important|critical)\b/i.test(text)) return 1;
  if (/\b(low priority|someday|eventually|whenever|no rush)\b/i.test(text)) return 5;
  return undefined;
}

export function parseGoalText(text: string): ParsedGoal {
  const trimmed = text.trim();
  const category = detectCategory(trimmed);
  const deadline = extractDeadline(trimmed);
  const amount = extractAmount(trimmed, deadline?.span ?? null);
  const priority = detectPriority(trimmed);

  const spansToRemove: Span[] = [];
  if (deadline) spansToRemove.push(deadline.span);
  if (amount) spansToRemove.push(amount.span);

  const name = trimmed ? deriveName(trimmed, spansToRemove, category) : '';

  return {
    name,
    category,
    targetAmount: amount?.value,
    deadline: deadline?.iso,
    priority,
  };
}
