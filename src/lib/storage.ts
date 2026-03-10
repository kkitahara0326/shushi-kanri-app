import type { Category, MonthlyEntry } from './types';

const CATEGORIES_KEY = 'shushi-kanri-categories';
const ENTRIES_KEY = 'shushi-kanri-entries';

const defaultIncomeCategories: Category[] = [
  { id: 'inc-salary', name: '給与', type: 'income', order: 0 },
  { id: 'inc-bonus', name: '賞与', type: 'income', order: 1 },
  { id: 'inc-side', name: '副業', type: 'income', order: 2 },
  { id: 'inc-other', name: 'その他収入', type: 'income', order: 3 },
];

const defaultExpenseCategories: Category[] = [
  { id: 'exp-rent', name: '家賃', type: 'expense', order: 0 },
  { id: 'exp-util', name: '光熱費', type: 'expense', order: 1 },
  { id: 'exp-food', name: '食費', type: 'expense', order: 2 },
  { id: 'exp-trans', name: '交通費', type: 'expense', order: 3 },
  { id: 'exp-save', name: '貯蓄・投資', type: 'expense', order: 4 },
  { id: 'exp-other', name: 'その他支出', type: 'expense', order: 5 },
];

export function getCategories(): Category[] {
  if (typeof window === 'undefined') return [...defaultIncomeCategories, ...defaultExpenseCategories];
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Category[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return [...defaultIncomeCategories, ...defaultExpenseCategories];
}

export function saveCategories(categories: Category[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function getEntries(): MonthlyEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MonthlyEntry[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveEntries(entries: MonthlyEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function getEntry(year: number, month: number): MonthlyEntry | undefined {
  return getEntries().find((e) => e.year === year && e.month === month);
}

export function upsertEntry(entry: MonthlyEntry): void {
  const entries = getEntries();
  const idx = entries.findIndex((e) => e.year === entry.year && e.month === entry.month);
  if (idx >= 0) entries[idx] = entry;
  else entries.push(entry);
  entries.sort((a, b) => a.year - b.year || a.month - b.month);
  saveEntries(entries);
}

/** 分類削除時、全エントリから該当キーを除去 */
export function removeCategoryFromAllEntries(categoryId: string, type: Category['type']): void {
  const entries = getEntries();
  const key = type === 'income' ? 'incomeByCategory' : 'expenseByCategory';
  const updated = entries.map((e) => {
    const next = { ...e, [key]: { ...e[key] } };
    delete next[key][categoryId];
    return next;
  });
  saveEntries(updated);
}

/** 新規分類のIDを生成（重複しないように） */
function nextCategoryId(type: Category['type']): string {
  const prefix = type === 'income' ? 'inc-' : 'exp-';
  return `${prefix}${Date.now()}`;
}

/** 分類を追加 */
export function addCategory(name: string, type: Category['type']): Category {
  const categories = getCategories();
  const maxOrder = Math.max(
    0,
    ...categories.filter((c) => c.type === type).map((c) => c.order)
  );
  const newCat: Category = {
    id: nextCategoryId(type),
    name: name.trim(),
    type,
    order: maxOrder + 1,
  };
  categories.push(newCat);
  saveCategories(categories);
  return newCat;
}

/** 分類名を更新 */
export function updateCategory(categoryId: string, name: string): void {
  const categories = getCategories();
  const idx = categories.findIndex((c) => c.id === categoryId);
  if (idx < 0) return;
  categories[idx] = { ...categories[idx], name: name.trim() };
  saveCategories(categories);
}

/** 分類を削除（全エントリからも除去） */
export function deleteCategory(categoryId: string, type: Category['type']): void {
  removeCategoryFromAllEntries(categoryId, type);
  const categories = getCategories().filter((c) => c.id !== categoryId);
  saveCategories(categories);
}
