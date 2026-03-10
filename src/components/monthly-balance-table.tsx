'use client';

import type { Category, MonthlyEntry } from '@/lib/types';
import { formatYen, getCategoriesForType } from '@/lib/utils';

function ymKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function buildMonthsInRange(startYear: number, startMonth: number, endYear: number, endMonth: number) {
  const months: { year: number; month: number; label: string; key: string }[] = [];
  let y = startYear;
  let m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    months.push({
      year: y,
      month: m,
      label: `${y}/${String(m).padStart(2, '0')}`,
      key: ymKey(y, m),
    });
    m += 1;
    if (m === 13) {
      m = 1;
      y += 1;
    }
  }
  return months;
}

export function MonthlyBalanceTable({
  categories,
  entries,
  start,
  end,
}: {
  categories: Category[];
  entries: MonthlyEntry[];
  start: { year: number; month: number };
  end: { year: number; month: number };
}) {
  const incomeCats = getCategoriesForType(categories, 'income');
  const expenseCats = getCategoriesForType(categories, 'expense');
  const months = buildMonthsInRange(start.year, start.month, end.year, end.month);

  const entryMap = new Map<string, MonthlyEntry>();
  entries.forEach((e) => entryMap.set(ymKey(e.year, e.month), e));

  const getIncomeTotal = (key: string) => {
    const e = entryMap.get(key);
    if (!e) return 0;
    return incomeCats.reduce((s, c) => s + (e.incomeByCategory[c.id] ?? 0), 0);
  };
  const getExpenseTotal = (key: string) => {
    const e = entryMap.get(key);
    if (!e) return 0;
    return expenseCats.reduce((s, c) => s + (e.expenseByCategory[c.id] ?? 0), 0);
  };

  const balances = months.map((m) => {
    const income = getIncomeTotal(m.key);
    const expense = getExpenseTotal(m.key);
    return { key: m.key, label: m.label, balance: income - expense };
  });
  const totalBalance = balances.reduce((a, b) => a + b.balance, 0);
  const avgBalance = months.length === 0 ? 0 : Math.round(totalBalance / months.length);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h3 className="text-base font-semibold text-slate-800">月別収支</h3>
        <span className="inline-flex w-fit rounded-full bg-slate-600 px-3 py-1 text-xs font-medium text-white whitespace-nowrap">
          期間合計 {formatYen(totalBalance)}　月平均 {formatYen(avgBalance)}
        </span>
      </div>
      <p className="mb-4 text-xs text-slate-500">※各月の収入合計 − 支出合計。黒字は緑、赤字は赤で表示します。</p>

      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="min-w-[480px] w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600">
                収支
              </th>
              {months.map((m) => (
                <th
                  key={m.key}
                  className="border-b border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-600 whitespace-nowrap"
                >
                  {m.label}
                </th>
              ))}
              <th className="border-b border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-600 whitespace-nowrap">
                合計
              </th>
              <th className="border-b border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-600 whitespace-nowrap">
                月平均
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-slate-50">
              <td className="border-t border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 whitespace-nowrap">
                収支
              </td>
              {balances.map(({ key, balance }) => {
                const isBlack = balance >= 0;
                const color = isBlack ? 'text-green-600' : 'text-red-600';
                const text = balance === 0 ? '' : formatYen(balance);
                return (
                  <td
                    key={key}
                    className={`border-t border-slate-200 px-3 py-2 text-right text-sm font-semibold whitespace-nowrap ${color}`}
                  >
                    {text}
                  </td>
                );
              })}
              <td
                className={`border-t border-slate-200 px-3 py-2 text-right text-sm font-bold whitespace-nowrap ${
                  totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {totalBalance === 0 ? '' : formatYen(totalBalance)}
              </td>
              <td
                className={`border-t border-slate-200 px-3 py-2 text-right text-sm font-semibold text-slate-700 whitespace-nowrap ${
                  avgBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {avgBalance === 0 ? '' : formatYen(avgBalance)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
