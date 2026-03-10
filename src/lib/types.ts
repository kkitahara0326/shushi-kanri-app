/** 収入・支出の種別 */
export type EntryType = 'income' | 'expense';

/** 分類（収入・支出それぞれで使用） */
export interface Category {
  id: string;
  name: string;
  type: EntryType;
  order: number;
}

/** 1ヶ月分の収入・支出（分類ごとの金額） */
export interface MonthlyEntry {
  year: number;
  month: number;
  incomeByCategory: Record<string, number>; // categoryId -> 金額
  expenseByCategory: Record<string, number>;
}

/** グラフ用：月別集計 */
export interface MonthlySummary {
  year: number;
  month: number;
  label: string; // "2024年1月" など
  incomeTotal: number;
  expenseTotal: number;
  incomeBreakdown: { name: string; value: number }[];
  expenseBreakdown: { name: string; value: number }[];
}

/** 前年度比 */
export interface YearOverYear {
  currentYearTotal: number;
  previousYearTotal: number;
  diff: number;
  diffPercent: number;
  type: 'income' | 'expense';
}

/** 資産シミュレーション入力 */
export interface SimulationInput {
  initialAmount: number;
  monthlyContribution: number;
  annualRatePercent: number;
  years: number;
}

/** 資産シミュレーション結果（年ごと） */
export interface SimulationYear {
  year: number;
  total: number;
  principal: number;
  interest: number;
}
