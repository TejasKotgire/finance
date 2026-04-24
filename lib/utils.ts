import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, endOfMonth, differenceInDays, startOfMonth } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Currency ─────────────────────────────────────────────
export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
    if (amount >= 1_000)   return `₹${(amount / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

// ── Date helpers ──────────────────────────────────────────
export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

export function getDaysRemainingInMonth(): number {
  const today = new Date();
  return differenceInDays(endOfMonth(today), today) + 1;
}

export function getDaysElapsed(): number {
  return differenceInDays(new Date(), startOfMonth(new Date())) + 1;
}

export function getDaysInMonth(): number {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
}

// ── Budget maths ──────────────────────────────────────────
export function calcSpendableToday(remainingBudget: number, daysRemaining: number): number {
  if (daysRemaining <= 0 || remainingBudget <= 0) return 0;
  return Math.floor(remainingBudget / daysRemaining);
}

export function calcWealthRatio(wealthAmount: number, income: number): number {
  if (income <= 0) return 0;
  return Math.min((wealthAmount / income) * 100, 100);
}

// ── Category meta ─────────────────────────────────────────
export const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  'Rent':           { icon: '🏠', color: '#7b2fff' },
  'Mess/Food':      { icon: '🍱', color: '#ff9500' },
  'Daily Needs':    { icon: '🛒', color: '#00b4d8' },
  'Tech/Gaming':    { icon: '🎮', color: '#00f5d4' },
  'Skincare':       { icon: '✨', color: '#ff006e' },
  'Family Support': { icon: '❤️',  color: '#06d6a0' },
  'SIP/Investments':{ icon: '📈', color: '#ffb703' },
  'Transport':      { icon: '🚗', color: '#90e0ef' },
  'Entertainment':  { icon: '🎬', color: '#e040fb' },
  'Health':         { icon: '💊', color: '#4caf50' },
  'Utilities':      { icon: '⚡', color: '#ff7043' },
  'Other':          { icon: '📦', color: '#78909c' },
};

export function getCategoryIcon(name: string): string {
  return CATEGORY_META[name]?.icon ?? '💰';
}

export function getCategoryColor(name: string): string {
  return CATEGORY_META[name]?.color ?? '#00f5d4';
}

// ── App constants ─────────────────────────────────────────
export const PAYMENT_METHODS = ['UPI', 'Cash', 'Card', 'Bank Transfer', 'EMI'] as const;
export const DEFAULT_INCOME         = Number(process.env.NEXT_PUBLIC_MONTHLY_INCOME ?? 80_000);
export const DEFAULT_WANTS_BUDGET   = 20_000;
export const DEFAULT_NEEDS_BUDGET   = 30_000;
export const DEFAULT_SAVINGS_TARGET = 30_000;
export const WEALTH_TARGET_PCT      = 50;
