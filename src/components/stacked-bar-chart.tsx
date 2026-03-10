'use client';

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
import type { MonthlySummary } from '@/lib/types';
import { formatYen } from '@/lib/utils';

interface StackedBarChartProps {
  data: MonthlySummary[];
  type: 'income' | 'expense';
  colors: string[];
}

export function StackedBarChart({ data, type, colors }: StackedBarChartProps) {
  const breakdownKey = type === 'income' ? 'incomeBreakdown' : 'expenseBreakdown';
  const totalKey = type === 'income' ? 'incomeTotal' : 'expenseTotal';

  const keys = data[0]?.[breakdownKey]?.map((b) => b.name) ?? [];
  const chartData = data.map((d) => {
    const row: Record<string, string | number> = {
      label: d.label,
      [totalKey]: d[totalKey],
    };
    keys.forEach((k, i) => {
      row[k] = d[breakdownKey][i]?.value ?? 0;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
        <Tooltip
          formatter={(value: number) => formatYen(value)}
          labelFormatter={(label) => label}
        />
        <Legend />
        {keys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="stack"
            fill={colors[i % colors.length]}
            name={key}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
