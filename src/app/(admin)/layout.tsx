'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

const navItems = [
  { href: '/users', label: '사용자 관리' },
  { href: '/audit-log', label: '감사 로그' },
  { href: '/settings/config', label: '연동 설정' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">로딩 중...</div>
      </div>
    );
  }

  if (!session) return null;

  const isSuperAdmin = (session.user as { role?: string })?.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-gray-900">IAS Admin</span>
            <nav className="flex gap-1">
              {navItems.map((item) => {
                if (item.href === '/settings/config' && !isSuperAdmin) return null;
                const active = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{session.user?.email}</span>
            {isSuperAdmin && (
              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                SUPER
              </span>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
