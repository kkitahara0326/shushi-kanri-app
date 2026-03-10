'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'ダッシュボード' },
  { href: '/records', label: '収支記録' },
  { href: '/others', label: 'その他' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex min-w-0 gap-1 overflow-x-auto py-1 -mx-1 px-1 sm:overflow-visible sm:mx-0 sm:px-0">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === href
              ? 'bg-slate-200 text-slate-900'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
