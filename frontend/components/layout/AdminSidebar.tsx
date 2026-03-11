'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const navLinks = [
  { label: 'ダッシュボード', href: '/admin' },
  { label: 'カテゴリ管理', href: '/admin/categories' },
  { label: '商品管理', href: '/admin/products' },
  { label: '注文管理', href: '/admin/orders' },
  { label: 'ユーザー管理', href: '/admin/users' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="w-52 flex-shrink-0">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-20">
        <div className="bg-[#ff0033] px-4 py-3">
          <p className="text-white font-semibold text-sm">管理パネル</p>
        </div>

        <nav className="p-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === link.href
                  ? 'bg-[#ff0033]/10 text-[#ff0033]'
                  : 'text-gray-600 hover:bg-[#ff0033]/5 hover:text-[#ff0033]'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-gray-100 mt-2 pt-2">
            <Link
              href="/"
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-[#ff0033] transition-all"
            >
              ← ストアに戻る
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
            >
              ログアウト
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}
