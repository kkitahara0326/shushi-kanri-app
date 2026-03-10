'use client';

import type { YearOverYear as YoYType } from '@/lib/types';
import { formatYen } from '@/lib/utils';

export function YearOverYearCard({
  yoy,
  type,
}: {
  yoy: YoYType | null;
  year: number;
  type: 'income' | 'expense';
  periodLabel?: string;
}) {
  const label = type === 'income' ? '収入' : '支出';
  if (!yoy) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500">{label} 前年比</p>
        <p className="mt-1 text-slate-400">データがありません</p>
      </div>
    );
  }

  const isPlus = yoy.diff >= 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{label} 前年比</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{formatYen(yoy.currentYearTotal)}</p>
      <p className="mt-1 text-sm text-slate-500">前年: {formatYen(yoy.previousYearTotal)}</p>
      <p
        className={`mt-2 text-lg font-semibold ${
          yoy.type === 'income' ? (isPlus ? 'text-green-600' : 'text-red-600') : isPlus ? 'text-red-600' : 'text-green-600'
        }`}
      >
        {isPlus ? '+' : ''}
        {formatYen(yoy.diff)}（{yoy.diffPercent >= 0 ? '+' : ''}
        {yoy.diffPercent.toFixed(1)}%）
      </p>
    </div>
  );
}
