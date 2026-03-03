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
    { label: 'Profile Info', href: '/mypage/profile' },
    { label: 'Change Password', href: '/mypage/password' },
    { label: 'Orders', href: '/mypage/orders' },
  ];

  const adminLinks = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Product Management', href: '/admin/products' },
    { label: 'Order Management', href: '/admin/orders' },
    { label: 'User Management', href: '/admin/users' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="w-52 flex-shrink-0">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-teal-500 px-4 py-3">
          <p className="text-white font-semibold text-sm">Account</p>
          {user && (
            <div className="mt-1">
              <p className="text-white text-xs truncate">{user.name || user.email}</p>
              <p className="text-orange-100 text-xs">{isAdmin ? 'Admin' : 'Customer'}</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="p-2">
          {accountLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === link.href
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Admin Links - Only show if user is admin */}
          {isAdmin && (
            <>
              <div className="border-t border-gray-200 my-2" />
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-gray-600 hover:bg-teal-50 hover:text-teal-600'
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
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}
