'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getCategories, getEntries } from '@/lib/storage';
import { buildMonthlySummaries } from '@/lib/utils';
import type { Category, MonthlyEntry, MonthlySummary } from '@/lib/types';
import { StackedBarChart } from '@/components/stacked-bar-chart';
import { CategoryPieChart } from '@/components/category-pie-chart';
import { BreakdownTable } from '@/components/breakdown-table';
import { MonthlyBalanceTable } from '@/components/monthly-balance-table';

const INCOME_CHART_COLORS = ['#22c55e', '#4ade80', '#86efac', '#bbf7d0'];
const EXPENSE_CHART_COLORS = ['#b91c1c', '#dc2626', '#ef4444', '#f97316', '#eab308'];

function ymKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function parseYmKey(key: string) {
  const [y, m] = key.split('-').map((v) => Number(v));
  return { year: y, month: m };
}

function compareYm(a: { year: number; month: number }, b: { year: number; month: number }) {
  return a.year - b.year || a.month - b.month;
}

function buildMonthOptions(min: { year: number; month: number }, max: { year: number; month: number }) {
  const options: { key: string; label: string; year: number; month: number }[] = [];
  let y = min.year;
  let m = min.month;
  while (y < max.year || (y === max.year && m <= max.month)) {
    options.push({
      key: ymKey(y, m),
      label: `${y}/${String(m).padStart(2, '0')}`,
      year: y,
      month: m,
    });
    m += 1;
    if (m === 13) {
      m = 1;
      y += 1;
    }
  }
  return options;
}

export default function DashboardPage() {
  const [summaries, setSummaries] = useState<MonthlySummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<MonthlyEntry[]>([]);
  const [startKey, setStartKey] = useState<string>('');
  const [endKey, setEndKey] = useState<string>('');

  const load = useCallback(() => {
    const cats = getCategories();
    const ents = getEntries();
    const s = buildMonthlySummaries(ents, cats);
    setCategories(cats);
    setEntries(ents);
    setSummaries(s);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const monthOptions = useMemo(() => {
    // 少なくとも 2023/07 から選べるようにする（要件）
    const baseMin = { year: 2023, month: 7 };
    const now = new Date();
    const baseMax = { year: now.getFullYear(), month: now.getMonth() + 1 };

    if (entries.length === 0) return buildMonthOptions(baseMin, baseMax);
    const sorted = [...entries].sort((a, b) => a.year - b.year || a.month - b.month);
    const min = {
      year: Math.min(baseMin.year, sorted[0].year),
      month:
        sorted[0].year < baseMin.year
          ? sorted[0].month
          : sorted[0].year === baseMin.year
            ? Math.min(baseMin.month, sorted[0].month)
            : baseMin.month,
    };
    const max = {
      year: Math.max(baseMax.year, sorted[sorted.length - 1].year),
      month:
        sorted[sorted.length - 1].year > baseMax.year
          ? sorted[sorted.length - 1].month
          : sorted[sorted.length - 1].year === baseMax.year
            ? Math.max(baseMax.month, sorted[sorted.length - 1].month)
            : baseMax.month,
    };
    return buildMonthOptions(min, max);
  }, [entries]);

  // 初期値: 直近12ヶ月（なければ全期間）
  useEffect(() => {
    if (monthOptions.length === 0) return;
    if (startKey && endKey) return;
    const last = monthOptions[monthOptions.length - 1];
    const start = monthOptions[Math.max(0, monthOptions.length - 12)];
    setStartKey(start.key);
    setEndKey(last.key);
  }, [monthOptions, startKey, endKey]);

  const range = useMemo(() => {
    if (!startKey || !endKey) return null;
    const s = parseYmKey(startKey);
    const e = parseYmKey(endKey);
    return compareYm(s, e) <= 0 ? { start: s, end: e } : { start: e, end: s };
  }, [startKey, endKey]);

  /** 表は表示期間のうち最新12ヶ月分のみ表示 */
  const tableRange = useMemo(() => {
    if (!range) return null;
    const months: { year: number; month: number }[] = [];
    let y = range.start.year;
    let m = range.start.month;
    while (y < range.end.year || (y === range.end.year && m <= range.end.month)) {
      months.push({ year: y, month: m });
      m += 1;
      if (m === 13) {
        m = 1;
        y += 1;
      }
    }
    if (months.length <= 12) return range;
    const last12 = months.slice(-12);
    return {
      start: last12[0],
      end: last12[last12.length - 1],
    };
  }, [range]);

  const filteredSummaries = useMemo(() => {
    if (!range) return summaries.slice(-12);
    return summaries.filter((s) => {
      const k = { year: s.year, month: s.month };
      return compareYm(range.start, k) <= 0 && compareYm(k, range.end) <= 0;
    });
  }, [summaries, range]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800">ダッシュボード</h2>
        <p className="mt-1 text-sm text-slate-500">
          期間を選択して、グラフと分類別の内訳表を確認できます。
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500">開始</label>
            <select
              value={startKey}
              onChange={(e) => setStartKey(e.target.value)}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {monthOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">終了</label>
            <select
              value={endKey}
              onChange={(e) => setEndKey(e.target.value)}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {monthOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredSummaries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-slate-500">まだ収支データがありません。</p>
          <Link
            href="/records"
            className="mt-3 inline-block rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            収支を記録する
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-3">
              <h3 className="mb-3 text-base font-semibold text-slate-800 sm:mb-4">収入の推移</h3>
              <StackedBarChart
                data={filteredSummaries}
                type="income"
                colors={INCOME_CHART_COLORS}
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
              <h3 className="mb-3 text-base font-semibold text-slate-800 sm:mb-4">収入の内訳</h3>
              <CategoryPieChart
                data={filteredSummaries}
                type="income"
                colors={INCOME_CHART_COLORS}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-3">
              <h3 className="mb-3 text-base font-semibold text-slate-800 sm:mb-4">支出の推移</h3>
              <StackedBarChart
                data={filteredSummaries}
                type="expense"
                colors={EXPENSE_CHART_COLORS}
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
              <h3 className="mb-3 text-base font-semibold text-slate-800 sm:mb-4">支出の内訳</h3>
              <CategoryPieChart
                data={filteredSummaries}
                type="expense"
                colors={EXPENSE_CHART_COLORS}
              />
            </div>
          </div>

          {tableRange && (
            <>
              {range &&
                (range.start.year !== tableRange.start.year ||
                  range.start.month !== tableRange.start.month) && (
                  <>
                    <p className="text-sm text-slate-500">
                      ※表は選択期間のうち最新12ヶ月分（{tableRange.start.year}/
                      {String(tableRange.start.month).padStart(2, '0')}〜
                      {tableRange.end.year}/{String(tableRange.end.month).padStart(2, '0')}）を表示しています。
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      ※収入は前年比で増加している場合は緑・減少している場合は赤、支出は前年比で減少している場合は緑・増加している場合は赤
                    </p>
                  </>
                )}
              {range &&
                range.start.year === tableRange.start.year &&
                range.start.month === tableRange.start.month && (
                  <p className="text-sm text-slate-500">
                    ※収入は前年比で増加している場合は緑・減少している場合は赤、支出は前年比で減少している場合は緑・増加している場合は赤
                  </p>
                )}
              <BreakdownTable
                title="収入の内訳"
                type="income"
                categories={categories}
                entries={entries}
                start={tableRange.start}
                end={tableRange.end}
              />
              <BreakdownTable
                title="支出の内訳"
                type="expense"
                categories={categories}
                entries={entries}
                start={tableRange.start}
                end={tableRange.end}
              />
              <MonthlyBalanceTable
                categories={categories}
                entries={entries}
                start={tableRange.start}
                end={tableRange.end}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
