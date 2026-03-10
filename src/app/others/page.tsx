import Link from 'next/link';

export default function OthersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">その他</h2>
        <p className="mt-1 text-sm text-slate-500">
          分類管理や資産シミュレーションなど、補助的な機能はこちらから利用できます。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/categories"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <h3 className="text-sm font-semibold text-slate-800">分類管理</h3>
          <p className="mt-1 text-xs text-slate-500">
            収入・支出の分類を追加・編集・削除して、自分の家計簿スタイルに合わせてカスタマイズできます。
          </p>
          <p className="mt-3 inline-flex items-center text-xs font-medium text-slate-700 group-hover:text-slate-900">
            開く →
          </p>
        </Link>

        <Link
          href="/simulation"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <h3 className="text-sm font-semibold text-slate-800">資産シミュレーション</h3>
          <p className="mt-1 text-xs text-slate-500">
            初期投資額・毎月の積立額・年利・期間を入力して、将来の資産推移を確認できます。
          </p>
          <p className="mt-3 inline-flex items-center text-xs font-medium text-slate-700 group-hover:text-slate-900">
            開く →
          </p>
        </Link>
      </div>
    </div>
  );
}

