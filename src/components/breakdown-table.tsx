'use client';

import type { Category, EntryType, MonthlyEntry } from '@/lib/types';
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

/** 収入: 前年比で増→緑・減→赤。支出: 前年比で減→緑・増→赤 */
function cellColor(type: EntryType, current: number, previous: number): string {
  if (previous === 0 && current === 0) return 'text-slate-700';
  const diff = current - previous;
  if (type === 'income') return diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-slate-700';
  return diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-600' : 'text-slate-700';
}

export function BreakdownTable({
  title,
  type,
  categories,
  entries,
  start,
  end,
}: {
  title: string;
  type: EntryType;
  categories: Category[];
  entries: MonthlyEntry[];
  start: { year: number; month: number };
  end: { year: number; month: number };
}) {
  const cats = getCategoriesForType(categories, type);
  const months = buildMonthsInRange(start.year, start.month, end.year, end.month);

  const entryMap = new Map<string, MonthlyEntry>();
  entries.forEach((e) => entryMap.set(ymKey(e.year, e.month), e));

  const getValue = (catId: string, monthKey: string) => {
    const e = entryMap.get(monthKey);
    if (!e) return 0;
    return type === 'income' ? e.incomeByCategory[catId] ?? 0 : e.expenseByCategory[catId] ?? 0;
  };

  const getMonthTotal = (monthKey: string) =>
    cats.reduce((sum, c) => sum + getValue(c.id, monthKey), 0);

  const monthTotals = months.map((m) => getMonthTotal(m.key));
  const grandTotal = monthTotals.reduce((a, b) => a + b, 0);
  const avg = months.length === 0 ? 0 : Math.round(grandTotal / months.length);

  const prevYearGrandTotal = months.reduce(
    (sum, m) => sum + getMonthTotal(ymKey(m.year - 1, m.month)),
    0
  );
  const totalDiff = grandTotal - prevYearGrandTotal;
  const totalPct =
    prevYearGrandTotal === 0
      ? (grandTotal > 0 ? 100 : 0)
      : Math.round((totalDiff / prevYearGrandTotal) * 100);
  const totalDiffColor = cellColor(type, grandTotal, prevYearGrandTotal);

  const headerColor = type === 'income' ? 'text-green-800' : 'text-red-800';
  const badgeColor = type === 'income' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h3 className={`text-base font-semibold ${headerColor}`}>{title}</h3>
        <span className={`inline-flex w-fit rounded-full ${badgeColor} px-3 py-1 text-xs font-medium text-white whitespace-nowrap`}>
          合計 {formatYen(grandTotal)}　月平均 {formatYen(avg)}
        </span>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="min-w-[720px] w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600">
                分類
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
            {cats.map((c) => {
              const rowTotal = months.reduce((sum, m) => sum + getValue(c.id, m.key), 0);
              const rowAvg = months.length === 0 ? 0 : Math.round(rowTotal / months.length);
              return (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="sticky left-0 bg-white border-b border-slate-100 px-3 py-2 text-sm font-medium text-slate-800 whitespace-nowrap">
                    {c.name}
                  </td>
                  {months.map((m) => {
                    const v = getValue(c.id, m.key);
                    const prevKey = ymKey(m.year - 1, m.month);
                    const prev = getValue(c.id, prevKey);
                    const color = cellColor(type, v, prev);
                    return (
                      <td
                        key={m.key}
                        className={`border-b border-slate-100 px-3 py-2 text-right text-sm whitespace-nowrap ${color}`}
                      >
                        {v === 0 ? '' : formatYen(v)}
                      </td>
                    );
                  })}
                  <td className="border-b border-slate-100 px-3 py-2 text-right text-sm font-semibold text-slate-900 whitespace-nowrap">
                    {rowTotal === 0 ? '' : formatYen(rowTotal)}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right text-sm text-slate-600 whitespace-nowrap">
                    {rowAvg === 0 ? '' : formatYen(rowAvg)}
                  </td>
                </tr>
              );
            })}

            <tr className="bg-slate-50">
              <td className="sticky left-0 bg-slate-50 border-t border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 whitespace-nowrap">
                合計
              </td>
              {months.map((m, i) => {
                const t = monthTotals[i];
                const prevKey = ymKey(m.year - 1, m.month);
                const prevTotal = getMonthTotal(prevKey);
                const color = cellColor(type, t, prevTotal);
                return (
                  <td
                    key={m.key}
                    className={`border-t border-slate-200 px-3 py-2 text-right text-sm font-semibold whitespace-nowrap ${color}`}
                  >
                    {t === 0 ? '' : formatYen(t)}
                  </td>
                );
              })}
              <td className="border-t border-slate-200 px-3 py-2 text-right text-sm font-bold text-slate-900 whitespace-nowrap">
                {grandTotal === 0 ? '' : formatYen(grandTotal)}
              </td>
              <td className="border-t border-slate-200 px-3 py-2 text-right text-sm font-semibold text-slate-700 whitespace-nowrap">
                {avg === 0 ? '' : formatYen(avg)}
              </td>
            </tr>

            <tr className="bg-slate-100/80">
              <td className="sticky left-0 bg-slate-100/80 border-t border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 whitespace-nowrap">
                前年比
              </td>
              {months.map((m) => {
                const t = getMonthTotal(m.key);
                const prevKey = ymKey(m.year - 1, m.month);
                const prevTotal = getMonthTotal(prevKey);
                const diff = t - prevTotal;
                const color = cellColor(type, t, prevTotal);
                return (
                  <td key={m.key} className={`border-t border-slate-200 px-3 py-2 text-right text-sm font-medium whitespace-nowrap ${color}`}>
                    {diff === 0 ? '' : diff > 0 ? `+${formatYen(diff)}` : formatYen(diff)}
                  </td>
                );
              })}
              <td className={`border-t border-slate-200 px-3 py-2 text-right text-sm font-medium whitespace-nowrap ${totalDiffColor}`}>
                {totalDiff === 0 ? '' : totalDiff > 0 ? `+${formatYen(totalDiff)}` : formatYen(totalDiff)}
              </td>
              <td className="border-t border-slate-200 px-3 py-2 text-right text-sm text-slate-500 whitespace-nowrap">
                —
              </td>
            </tr>

            <tr className="bg-slate-100/80">
              <td className="sticky left-0 bg-slate-100/80 border-t border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 whitespace-nowrap">
                前年比率
              </td>
              {months.map((m) => {
                const t = getMonthTotal(m.key);
                const prevKey = ymKey(m.year - 1, m.month);
                const prevTotal = getMonthTotal(prevKey);
                const pct = prevTotal === 0 ? (t > 0 ? 100 : 0) : Math.round(((t - prevTotal) / prevTotal) * 100);
                const color = cellColor(type, t, prevTotal);
                return (
                  <td key={m.key} className={`border-t border-slate-200 px-3 py-2 text-right text-sm font-medium whitespace-nowrap ${color}`}>
                    {prevTotal === 0 && t === 0 ? '' : `${pct >= 0 ? '+' : ''}${pct}%`}
                  </td>
                );
              })}
              <td className={`border-t border-slate-200 px-3 py-2 text-right text-sm font-medium whitespace-nowrap ${totalDiffColor}`}>
                {prevYearGrandTotal === 0 && grandTotal === 0 ? '' : `${totalPct >= 0 ? '+' : ''}${totalPct}%`}
              </td>
              <td className="border-t border-slate-200 px-3 py-2 text-right text-sm text-slate-500 whitespace-nowrap">
                —
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

