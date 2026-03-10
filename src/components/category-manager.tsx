'use client';

import { useCallback, useState } from 'react';
import type { Category, EntryType } from '@/lib/types';
import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/lib/storage';
import { getCategoriesForType } from '@/lib/utils';

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<EntryType>('expense');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const refresh = useCallback(() => setCategories(getCategories()), []);

  const incomeCats = getCategoriesForType(categories, 'income');
  const expenseCats = getCategoriesForType(categories, 'expense');

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    addCategory(name, newType);
    setNewName('');
    refresh();
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updateCategory(editingId, editName.trim());
      setEditingId(null);
      setEditName('');
      refresh();
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (cat: Category) => {
    if (!confirm(`「${cat.name}」を削除しますか？\nこの分類に紐づく過去の金額データは削除されます。`)) return;
    deleteCategory(cat.id, cat.type);
    refresh();
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-slate-800">分類を追加</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500">種別</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as EntryType)}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="income">収入</option>
              <option value="expense">支出</option>
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-slate-500">分類名</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="例: 医療費"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            追加
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-green-800">収入の分類</h3>
          <ul className="space-y-2">
            {incomeCats.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2"
              >
                {editingId === c.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={saveEdit}
                      className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded bg-slate-400 px-2 py-1 text-xs text-white hover:bg-slate-500"
                    >
                      キャンセル
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-slate-800">{c.name}</span>
                    <span className="flex gap-1">
                      <button
                        onClick={() => startEdit(c)}
                        className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        削除
                      </button>
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
          {incomeCats.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-400">収入の分類がありません。上で追加してください。</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-red-800">支出の分類</h3>
          <ul className="space-y-2">
            {expenseCats.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2"
              >
                {editingId === c.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={saveEdit}
                      className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded bg-slate-400 px-2 py-1 text-xs text-white hover:bg-slate-500"
                    >
                      キャンセル
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-slate-800">{c.name}</span>
                    <span className="flex gap-1">
                      <button
                        onClick={() => startEdit(c)}
                        className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        削除
                      </button>
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
          {expenseCats.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-400">支出の分類がありません。上で追加してください。</p>
          )}
        </div>
      </div>
    </div>
  );
}
