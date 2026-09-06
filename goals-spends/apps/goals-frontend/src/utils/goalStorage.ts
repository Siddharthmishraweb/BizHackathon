// Persists a demo profile's custom goal edits (add/delete) in localStorage, keyed per
// profile, so they survive reloads but never touch the bundled demo data itself.
import type { Goal } from '@/types';

const PREFIX = 'goals-ai:goals:';

export function loadCustomGoals(profileId: string): Goal[] | null {
  try {
    const raw = localStorage.getItem(PREFIX + profileId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Goal[]) : null;
  } catch {
    return null;
  }
}

export function saveCustomGoals(profileId: string, goals: Goal[]): void {
  try {
    localStorage.setItem(PREFIX + profileId, JSON.stringify(goals));
  } catch {
    // Storage can fail in private-browsing/quota-exceeded situations — safe to ignore,
    // it only means edits won't survive a reload.
  }
}

export function clearCustomGoals(profileId: string): void {
  try {
    localStorage.removeItem(PREFIX + profileId);
  } catch {
    // ignore
  }
}
