import { SimulationForm } from '@/components/simulation-form';

export default function SimulationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">資産運用シミュレーション</h2>
        <p className="mt-1 text-sm text-slate-500">
          初期投資額・毎月の積立額・年利・投資期間を入力すると、将来の資産を自動計算します。
        </p>
      </div>
      <SimulationForm />
    </div>
  );
}
