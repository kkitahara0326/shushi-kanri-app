import Link from 'next/link';
import { MonthlyRecordForm } from '@/components/monthly-record-form';

export default function RecordsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">収支記録</h2>
          <p className="mt-1 text-sm text-slate-500">
            年・月を選び、収入・支出を分類ごとに入力して保存できます。
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← ダッシュボードへ戻る
        </Link>
      </div>
      <MonthlyRecordForm />
    </div>
  );
}
