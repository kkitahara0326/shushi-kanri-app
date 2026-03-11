import type { Category, MonthlyEntry } from './types';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, type Firestore } from 'firebase/firestore';

const CATEGORIES_KEY = 'shushi-kanri-categories';
const ENTRIES_KEY = 'shushi-kanri-entries';

type CategoriesDoc = { items: Category[] };
type EntriesDoc = { items: MonthlyEntry[] };

let firebaseApp: FirebaseApp | null = null;
let firestore: Firestore | null = null;

function initFirestore() {
  if (typeof window === 'undefined') return;
  if (firestore) return;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

  if (!projectId || !apiKey || !authDomain) return;

  const config = {
    apiKey,
    authDomain,
    projectId,
  };

  const apps = getApps();
  firebaseApp = apps.length ? apps[0] : initializeApp(config);
  firestore = getFirestore(firebaseApp);
}

function getDb(): Firestore | null {
  if (!firestore) initFirestore();
  return firestore;
}

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

  const db = getDb();
  if (db) {
    const ref = doc(db, 'shushi-app', 'categories');
    void setDoc(ref, { items: categories } satisfies CategoriesDoc, { merge: true }).catch(() => {
      // Firestore 書き込みエラーは UI には影響させない
    });
  }
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

  const db = getDb();
  if (db) {
    const ref = doc(db, 'shushi-app', 'entries');
    void setDoc(ref, { items: entries } satisfies EntriesDoc, { merge: true }).catch(() => {
      // Firestore 書き込みエラーは UI には影響させない
    });
  }
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

/** Firestore 側のデータをローカルストレージに同期（初回起動時などに呼び出し） */
export async function initialSyncFromFirestore(): Promise<void> {
  if (typeof window === 'undefined') return;
  const db = getDb();
  if (!db) return;

  try {
    const categoriesRef = doc(db, 'shushi-app', 'categories');
    const entriesRef = doc(db, 'shushi-app', 'entries');

    const [categoriesSnap, entriesSnap] = await Promise.all([getDoc(categoriesRef), getDoc(entriesRef)]);

    const localCategoriesRaw = window.localStorage.getItem(CATEGORIES_KEY);
    const localEntriesRaw = window.localStorage.getItem(ENTRIES_KEY);

    const localCategories: Category[] = localCategoriesRaw ? (JSON.parse(localCategoriesRaw) as Category[]) : [];
    const localEntries: MonthlyEntry[] = localEntriesRaw ? (JSON.parse(localEntriesRaw) as MonthlyEntry[]) : [];

    const cloudCategories = categoriesSnap.exists() ? ((categoriesSnap.data() as CategoriesDoc).items ?? []) : [];
    const cloudEntries = entriesSnap.exists() ? ((entriesSnap.data() as EntriesDoc).items ?? []) : [];

    const hasCloud = cloudCategories.length > 0 || cloudEntries.length > 0;
    const hasLocal = localCategories.length > 0 || localEntries.length > 0;

    if (hasCloud) {
      // Firestore 側が正とみなし、ローカルを上書き
      window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cloudCategories));
      window.localStorage.setItem(ENTRIES_KEY, JSON.stringify(cloudEntries));
    } else if (hasLocal) {
      // まだクラウドに何もない場合は、ローカルのデータをアップロード
      const categoriesRef2 = doc(db, 'shushi-app', 'categories');
      const entriesRef2 = doc(db, 'shushi-app', 'entries');
      await Promise.all([
        setDoc(categoriesRef2, { items: localCategories } satisfies CategoriesDoc, { merge: true }),
        setDoc(entriesRef2, { items: localEntries } satisfies EntriesDoc, { merge: true }),
      ]);
    }
  } catch {
    // 同期失敗時はローカルのみで動作を続ける
  }
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
