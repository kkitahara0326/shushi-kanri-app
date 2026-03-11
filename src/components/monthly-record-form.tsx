'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Category, MonthlyEntry } from '@/lib/types';
import { getCategories, getEntries, getEntry, upsertEntry } from '@/lib/storage';
import { getCategoriesForType } from '@/lib/utils';
import { formatYen } from '@/lib/utils';
import { useSync } from '@/components/sync-provider';

const INCOME_COLORS = ['#22c55e', '#4ade80', '#86efac', '#bbf7d0'];
// ダッシュボードの支出グラフと揃えたカラーセット
const EXPENSE_COLORS = ['#b91c1c', '#dc2626', '#ef4444', '#f97316', '#eab308', '#facc15'];

export function MonthlyRecordForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [, setEntries] = useState<MonthlyEntry[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [incomeValues, setIncomeValues] = useState<Record<string, number>>({});
  const [expenseValues, setExpenseValues] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  const incomeCats = getCategoriesForType(categories, 'income');
  const expenseCats = getCategoriesForType(categories, 'expense');

  const { isSynced } = useSync();
  const load = useCallback(() => {
    setCategories(getCategories());
    setEntries(getEntries());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isSynced) load();
  }, [isSynced, load]);

  // 年月または分類の数が変わったときだけフォームを再セット（incomeCats/expenseCats を依存に含めると毎レンダーで上書きされて入力できなくなる）
  useEffect(() => {
    const entry = getEntry(selectedYear, selectedMonth);
    const incomeList = getCategoriesForType(categories, 'income');
    const expenseList = getCategoriesForType(categories, 'expense');
    if (entry) {
      setIncomeValues(entry.incomeByCategory ?? {});
      setExpenseValues(entry.expenseByCategory ?? {});
    } else {
      const emptyIncome: Record<string, number> = {};
      incomeList.forEach((c) => (emptyIncome[c.id] = 0));
      const emptyExpense: Record<string, number> = {};
      expenseList.forEach((c) => (emptyExpense[c.id] = 0));
      setIncomeValues(emptyIncome);
      setExpenseValues(emptyExpense);
    }
  }, [selectedYear, selectedMonth, categories.length, categories.map((c) => c.id).join(',')]);

  const handleIncomeChange = (categoryId: string, value: number) => {
    setIncomeValues((prev) => ({ ...prev, [categoryId]: value }));
    setSaved(false);
  };

  const handleExpenseChange = (categoryId: string, value: number) => {
    setExpenseValues((prev) => ({ ...prev, [categoryId]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    const entry: MonthlyEntry = {
      year: selectedYear,
      month: selectedMonth,
      incomeByCategory: { ...incomeValues },
      expenseByCategory: { ...expenseValues },
    };
    upsertEntry(entry);
    setEntries(getEntries()); // 再レンダー用
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => 2023 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    if (selectedYear > currentYear) setSelectedYear(currentYear);
    if (selectedYear < 2023) setSelectedYear(2023);
  }, [selectedYear, currentYear]);

  const incomeTotal = Object.values(incomeValues).reduce((a, b) => a + b, 0);
  const expenseTotal = Object.values(expenseValues).reduce((a, b) => a + b, 0);
  const balance = incomeTotal - expenseTotal;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <span className="text-xs font-medium text-slate-500">対象年月</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-md border-none bg-transparent px-2 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
          <span className="text-slate-400">/</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-md border-none bg-transparent px-2 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSave}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
            saved ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-800'
          }`}
        >
          {saved ? '保存しました' : '保存'}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-green-800">収入</h3>
          <ul className="space-y-3">
            {incomeCats.map((c, i) => (
              <li key={c.id} className="flex items-center justify-between gap-4">
                <span
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: INCOME_COLORS[i % INCOME_COLORS.length] }}
                />
                <label className="flex-1 text-sm text-slate-700">{c.name}</label>
                <input
                  type="number"
                  min={0}
                  value={(incomeValues[c.id] ?? 0) === 0 ? '' : incomeValues[c.id]}
                  onChange={(e) => handleIncomeChange(c.id, Number(e.target.value) || 0)}
                  placeholder=""
                  className="w-32 rounded border border-slate-300 px-2 py-1.5 text-right text-sm"
                />
                <span className="text-xs text-slate-400">円</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-slate-100 pt-3 text-right font-semibold text-green-700">
            合計: {formatYen(incomeTotal)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-red-800">支出</h3>
          <ul className="space-y-3">
            {expenseCats.map((c, i) => (
              <li key={c.id} className="flex items-center justify-between gap-4">
                <span
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}
                />
                <label className="flex-1 text-sm text-slate-700">{c.name}</label>
                <input
                  type="number"
                  min={0}
                  value={(expenseValues[c.id] ?? 0) === 0 ? '' : expenseValues[c.id]}
                  onChange={(e) => handleExpenseChange(c.id, Number(e.target.value) || 0)}
                  placeholder=""
                  className="w-32 rounded border border-slate-300 px-2 py-1.5 text-right text-sm"
                />
                <span className="text-xs text-slate-400">円</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-slate-100 pt-3 text-right font-semibold text-red-700">
            合計: {formatYen(expenseTotal)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-600">収支差額（{selectedYear}年{selectedMonth}月）</p>
        <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatYen(balance)}
        </p>
      </div>
    </div>
  );
}
