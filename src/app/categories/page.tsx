import { CategoryManager } from '@/components/category-manager';

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">分類管理</h2>
        <p className="mt-1 text-sm text-slate-500">
          収入・支出の分類を追加・編集・削除できます。収支記録やグラフに反映されます。
        </p>
      </div>
      <CategoryManager />
    </div>
  );
}
