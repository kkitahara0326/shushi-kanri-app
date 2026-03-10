'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { MonthlySummary } from '@/lib/types';
import { formatYen } from '@/lib/utils';

interface CategoryPieChartProps {
  data: MonthlySummary[];
  type: 'income' | 'expense';
  colors: string[];
}

export function CategoryPieChart({ data, type, colors }: CategoryPieChartProps) {
  const breakdownKey = type === 'income' ? 'incomeBreakdown' : 'expenseBreakdown';

  const aggregated = (() => {
    const byName: Record<string, number> = {};
    data.forEach((d) => {
      (d[breakdownKey] ?? []).forEach((b) => {
        byName[b.name] = (byName[b.name] ?? 0) + b.value;
      });
    });
    return Object.entries(byName)
      .map(([name, value]) => ({ name, value }))
      .filter((e) => e.value > 0)
      .sort((a, b) => b.value - a.value);
  })();

  if (aggregated.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
        データがありません
      </div>
    );
  }

  const total = aggregated.reduce((s, e) => s + e.value, 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <Pie
          data={aggregated}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          isAnimationActive={true}
        >
          {aggregated.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} stroke="#fff" strokeWidth={1} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatYen(value), `${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%`]}
          contentStyle={{ fontSize: 12 }}
        />
        <Legend
          formatter={(value, entry: { payload?: { value?: number } }) => {
            const v = entry?.payload?.value ?? 0;
            const pct = total > 0 ? ((v / total) * 100).toFixed(0) : '0';
            return `${value} (${pct}%)`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
