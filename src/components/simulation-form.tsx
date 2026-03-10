'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { calculateSimulation } from '@/lib/simulation';
import type { SimulationInput } from '@/lib/types';
import { formatYen } from '@/lib/utils';

const defaultInput: SimulationInput = {
  initialAmount: 0,
  monthlyContribution: 30000,
  annualRatePercent: 5,
  years: 20,
};

export function SimulationForm() {
  const [input, setInput] = useState<SimulationInput>(defaultInput);

  const result = useMemo(() => calculateSimulation(input), [input]);

  const chartData = useMemo(
    () =>
      result.map((r) => ({
        year: `${r.year}年`,
        元本: r.principal,
        利益: r.interest,
        合計: r.total,
      })),
    [result]
  );

  const final = result[result.length - 1];

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">シミュレーション条件</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">初期投資額（円）</label>
            <input
              type="number"
              min={0}
              value={input.initialAmount || ''}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, initialAmount: Number(e.target.value) || 0 }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">毎月の積立額（円）</label>
            <input
              type="number"
              min={0}
              value={input.monthlyContribution || ''}
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  monthlyContribution: Number(e.target.value) || 0,
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">年利（%）</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={input.annualRatePercent ?? ''}
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  annualRatePercent: Number(e.target.value) || 0,
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">投資期間（年）</label>
            <input
              type="number"
              min={1}
              max={50}
              value={input.years ?? ''}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, years: Number(e.target.value) || 1 }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {final && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">将来資産（{input.years}年後）</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">合計資産</p>
              <p className="text-2xl font-bold text-slate-900">{formatYen(final.total)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">元本合計</p>
              <p className="text-xl font-semibold text-slate-700">{formatYen(final.principal)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">運用益</p>
              <p className="text-xl font-semibold text-green-600">{formatYen(final.interest)}</p>
            </div>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">資産推移（積み上げ棒グラフ）</h2>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
              />
              <Tooltip
                formatter={(value: number) => formatYen(value)}
                labelFormatter={(label) => label}
              />
              <Legend />
              <Bar dataKey="元本" stackId="a" fill="#64748b" name="元本" />
              <Bar dataKey="利益" stackId="a" fill="#22c55e" name="運用益" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
