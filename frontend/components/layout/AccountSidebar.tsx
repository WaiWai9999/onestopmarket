'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function AccountSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.role === 'ADMIN';

  const accountLinks = [
    { label: 'プロフィール', href: '/mypage/profile' },
    { label: 'パスワード変更', href: '/mypage/password' },
    ...(!isAdmin ? [{ label: '注文履歴', href: '/mypage/orders' }] : []),
  ];

  const adminLinks = [
    { label: 'ダッシュボード', href: '/admin' },
    { label: '商品管理', href: '/admin/products' },
    { label: '注文管理', href: '/admin/orders' },
    { label: 'ユーザー管理', href: '/admin/users' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="w-48 flex-shrink-0">
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden sticky top-24">
        {/* Header */}
        <div className="bg-[#1a6b1f] text-white p-6 px-4 py-4">
          <p className="text-white font-semibold text-sm truncate">{user?.name ?? 'アカウント'}</p>
          <p className="text-gray-400 text-xs mt-0.5 truncate">{user?.email}</p>
          {isAdmin && (
            <span className="inline-block mt-1.5 text-xs font-semibold text-white bg-white/20 px-2 py-0.5 rounded-full">
              管理者
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="p-2">
          {accountLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-[#1a6b1f] text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="border-t border-gray-100 my-2" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">管理者メニュー</p>
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-[#1a6b1f] text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </>
          )}

          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}
