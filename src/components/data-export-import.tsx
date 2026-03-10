'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, MonthlyEntry } from '@/lib/types';
import { getCategories, getEntries, saveCategories, saveEntries } from '@/lib/storage';

const BACKUP_VERSION = 1;

export type BackupData = {
  version: number;
  exportedAt: string;
  categories: Category[];
  entries: MonthlyEntry[];
};

function isValidCategory(c: unknown): c is Category {
  if (typeof c !== 'object' || c === null) return false;
  const o = c as Record<string, unknown>;
  const type = o.type;
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    (type === 'income' || type === 'expense') &&
    typeof o.order === 'number'
  );
}

function isValidEntry(e: unknown): e is MonthlyEntry {
  if (typeof e !== 'object' || e === null) return false;
  const o = e as Record<string, unknown>;
  return (
    typeof o.year === 'number' &&
    typeof o.month === 'number' &&
    typeof o.incomeByCategory === 'object' &&
    o.incomeByCategory !== null &&
    typeof o.expenseByCategory === 'object' &&
    o.expenseByCategory !== null
  );
}

export function DataExportImport() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = () => {
    const categories = getCategories();
    const entries = getEntries();
    const data: BackupData = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      categories,
      entries,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shushi-kanri-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = reader.result as string;
        const data = JSON.parse(raw) as unknown;
        if (typeof data !== 'object' || data === null || !('categories' in data) || !('entries' in data)) {
          setImportMessage({ type: 'error', text: '不正なバックアップ形式です。' });
          return;
        }
        const categories = (data as { categories: unknown }).categories;
        const entries = (data as { entries: unknown }).entries;
        if (!Array.isArray(categories) || !categories.every(isValidCategory)) {
          setImportMessage({ type: 'error', text: '分類データの形式が正しくありません。' });
          return;
        }
        if (!Array.isArray(entries) || !entries.every(isValidEntry)) {
          setImportMessage({ type: 'error', text: '収支データの形式が正しくありません。' });
          return;
        }
        saveCategories(categories);
        saveEntries(entries);
        setImportMessage({
          type: 'success',
          text: `インポートしました（分類 ${categories.length} 件、収支 ${entries.length} 件）。ページを再読み込みします。`,
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => router.refresh(), 1500);
      } catch {
        setImportMessage({ type: 'error', text: 'ファイルの読み込みに失敗しました。' });
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">データのエクスポート・インポート</h3>
      <p className="mt-1 text-xs text-slate-500">
        バックアップをダウンロードしたり、別の環境（例：デプロイ版）から取り込んだデータを復元できます。
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          エクスポート（ダウンロード）
        </button>
        <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            className="sr-only"
          />
          インポート（ファイルを選択）
        </label>
      </div>
      {importMessage && (
        <p
          className={`mt-3 text-sm ${importMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
          role="alert"
        >
          {importMessage.text}
        </p>
      )}
    </div>
  );
}
