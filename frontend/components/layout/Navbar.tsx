'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          OneStopMarket
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link href="/products" className="text-gray-600 hover:text-blue-600">
            Products
          </Link>

          {user ? (
            <>
              <Link href="/cart" className="text-gray-600 hover:text-blue-600">
                Cart
              </Link>
              <Link href="/mypage/orders" className="text-gray-600 hover:text-blue-600">
                Orders
              </Link>
              <Link href="/mypage/profile" className="text-gray-600 hover:text-blue-600">
                Profile
              </Link>
              {isAdmin() && (
                <Link href="/admin" className="text-gray-600 hover:text-blue-600">
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
