// Shared goal-category metadata: icon, label, keywords (for the Magic Add parser) and
// sensible defaults (for one-click templates). Single source of truth so GoalCard,
// AddGoalModal and goalParser never drift out of sync with each other.
import { Home, Car, GraduationCap, Plane, ShieldAlert, Target, Gem, Landmark, Briefcase } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type GoalCategory = 'emergency' | 'house' | 'car' | 'education' | 'vacation' | 'wedding' | 'retirement' | 'gadget' | 'custom';

export interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  keywords: string[];
  defaultTargetAmount: number;
  defaultMonths: number;
}

export const CATEGORY_ORDER: GoalCategory[] = [
  'emergency',
  'house',
  'car',
  'education',
  'vacation',
  'wedding',
  'retirement',
  'gadget',
  'custom',
];

export const CATEGORY_META: Record<GoalCategory, CategoryMeta> = {
  emergency: {
    label: 'Emergency Fund',
    icon: ShieldAlert,
    keywords: ['emergency', 'rainy day', 'contingency', 'safety net'],
    defaultTargetAmount: 500000,
    defaultMonths: 12,
  },
  house: {
    label: 'House / Property',
    icon: Home,
    keywords: ['house', 'home', 'flat', 'apartment', 'property', 'down payment'],
    defaultTargetAmount: 5000000,
    defaultMonths: 48,
  },
  car: {
    label: 'Car / Vehicle',
    icon: Car,
    keywords: ['car', 'bike', 'vehicle', 'scooter', 'motorcycle', 'suv'],
    defaultTargetAmount: 1000000,
    defaultMonths: 24,
  },
  education: {
    label: 'Education',
    icon: GraduationCap,
    keywords: ['education', 'college', 'course', 'degree', 'study', 'mba', 'tuition', 'school'],
    defaultTargetAmount: 2000000,
    defaultMonths: 36,
  },
  vacation: {
    label: 'Vacation / Travel',
    icon: Plane,
    keywords: ['vacation', 'trip', 'travel', 'holiday', 'tour', 'honeymoon'],
    defaultTargetAmount: 300000,
    defaultMonths: 12,
  },
  wedding: {
    label: 'Wedding',
    icon: Gem,
    keywords: ['wedding', 'marriage', 'shaadi', 'engagement'],
    defaultTargetAmount: 1500000,
    defaultMonths: 18,
  },
  retirement: {
    label: 'Retirement',
    icon: Landmark,
    keywords: ['retirement', 'fire', 'pension', 'retire'],
    defaultTargetAmount: 20000000,
    defaultMonths: 240,
  },
  gadget: {
    label: 'Gadget / Big Purchase',
    icon: Briefcase,
    keywords: ['gadget', 'laptop', 'phone', 'iphone', 'camera', 'computer'],
    defaultTargetAmount: 150000,
    defaultMonths: 6,
  },
  custom: {
    label: 'Custom Goal',
    icon: Target,
    keywords: [],
    defaultTargetAmount: 200000,
    defaultMonths: 12,
  },
};

export function categoryIcon(category: string): LucideIcon {
  return (CATEGORY_META as Record<string, CategoryMeta>)[category]?.icon ?? Target;
}

export function categoryLabel(category: string): string {
  return (CATEGORY_META as Record<string, CategoryMeta>)[category]?.label ?? 'Custom Goal';
}

/** Scans free text for category keywords; used by both the template picker and the Magic Add parser. */
export function detectCategory(text: string): GoalCategory {
  const lower = text.toLowerCase();
  for (const cat of CATEGORY_ORDER) {
    if (cat === 'custom') continue;
    if (CATEGORY_META[cat].keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return 'custom';
}
