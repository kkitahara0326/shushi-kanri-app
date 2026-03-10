import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Nav } from '@/components/nav';

export const metadata: Metadata = {
  title: '収支管理アプリ',
  description: '毎月の収入・支出の記録と資産シミュレーション',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-10 overflow-hidden border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-0 sm:h-14">
            <Link
              href="/"
              className="min-w-0 shrink-0 truncate text-base font-bold text-slate-800 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 rounded sm:text-lg"
            >
              収支管理アプリ
            </Link>
            <Nav />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">{children}</main>
      </body>
    </html>
  );
}
