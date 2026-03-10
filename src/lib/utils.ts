import type { Category, MonthlyEntry, MonthlySummary, YearOverYear } from './types';
import { getEntries } from './storage';

export function getCategoriesForType(categories: Category[], type: 'income' | 'expense'): Category[] {
  return categories.filter((c) => c.type === type).sort((a, b) => a.order - b.order);
}

export function buildMonthlySummaries(
  entries: MonthlyEntry[],
  categories: Category[]
): MonthlySummary[] {
  const incomeCats = getCategoriesForType(categories, 'income');
  const expenseCats = getCategoriesForType(categories, 'expense');

  return entries.map((e) => {
    const incomeBreakdown = incomeCats.map((c) => ({
      name: c.name,
      value: e.incomeByCategory[c.id] ?? 0,
    }));
    const expenseBreakdown = expenseCats.map((c) => ({
      name: c.name,
      value: e.expenseByCategory[c.id] ?? 0,
    }));
    return {
      year: e.year,
      month: e.month,
      label: `${e.year}年${e.month}月`,
      incomeTotal: Object.values(e.incomeByCategory).reduce((a, b) => a + b, 0),
      expenseTotal: Object.values(e.expenseByCategory).reduce((a, b) => a + b, 0),
      incomeBreakdown,
      expenseBreakdown,
    };
  });
}

export function getYearOverYear(
  type: 'income' | 'expense',
  targetYear: number
): YearOverYear | null {
  const entries = getEntries();
  const current = entries
    .filter((e) => e.year === targetYear)
    .reduce((sum, e) => {
      const vals = type === 'income' ? Object.values(e.incomeByCategory) : Object.values(e.expenseByCategory);
      return sum + vals.reduce((a, b) => a + b, 0);
    }, 0);
  const previous = entries
    .filter((e) => e.year === targetYear - 1)
    .reduce((sum, e) => {
      const vals = type === 'income' ? Object.values(e.incomeByCategory) : Object.values(e.expenseByCategory);
      return sum + vals.reduce((a, b) => a + b, 0);
    }, 0);

  if (current === 0 && previous === 0) return null;
  const diff = current - previous;
  const diffPercent = previous === 0 ? (current > 0 ? 100 : 0) : (diff / previous) * 100;
  return {
    currentYearTotal: current,
    previousYearTotal: previous,
    diff,
    diffPercent,
    type,
  };
}

/** 選択期間 vs 前年同期で前年比を計算（entries を渡す） */
export function getYearOverYearForRange(
  type: 'income' | 'expense',
  start: { year: number; month: number },
  end: { year: number; month: number },
  entries: MonthlyEntry[]
): YearOverYear | null {
  const inRange = (e: MonthlyEntry, s: { year: number; month: number }, eEnd: { year: number; month: number }) => {
    if (e.year < s.year || e.year > eEnd.year) return false;
    if (e.year === s.year && e.month < s.month) return false;
    if (e.year === eEnd.year && e.month > eEnd.month) return false;
    return true;
  };
  const prevStart = { year: start.year - 1, month: start.month };
  const prevEnd = { year: end.year - 1, month: end.month };

  const current = entries
    .filter((e) => inRange(e, start, end))
    .reduce((sum, e) => {
      const vals = type === 'income' ? Object.values(e.incomeByCategory) : Object.values(e.expenseByCategory);
      return sum + vals.reduce((a, b) => a + b, 0);
    }, 0);
  const previous = entries
    .filter((e) => inRange(e, prevStart, prevEnd))
    .reduce((sum, e) => {
      const vals = type === 'income' ? Object.values(e.incomeByCategory) : Object.values(e.expenseByCategory);
      return sum + vals.reduce((a, b) => a + b, 0);
    }, 0);

  if (current === 0 && previous === 0) return null;
  const diff = current - previous;
  const diffPercent = previous === 0 ? (current > 0 ? 100 : 0) : (diff / previous) * 100;
  return {
    currentYearTotal: current,
    previousYearTotal: previous,
    diff,
    diffPercent,
    type,
  };
}

export function formatYen(n: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(n);
}
