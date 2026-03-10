'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import Logo from '@/components/Logo';

export default function Navbar() {
  const { user, logout, isAdmin, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [accountOpen, setAccountOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data),
    enabled: !!user,
  });

  const cartCount = cart?.items?.reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0,
  ) ?? 0;

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    router.push('/');
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Left: Logo + Primary Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/products"
              className="text-gray-600 hover:text-orange-500 text-sm font-medium px-3 py-2 rounded-md transition-colors"
            >
              商品一覧
            </Link>
            <Link
              href="/hot-deals"
              className="text-gray-600 hover:text-orange-500 text-sm font-medium px-3 py-2 rounded-md transition-colors flex items-center gap-1"
            >
              <span className="text-orange-500">🔥</span> セール
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-orange-500 text-sm font-medium px-3 py-2 rounded-md transition-colors"
            >
              About
            </Link>
          </div>
        </div>

        {/* Right: Cart + Auth */}
        <div className="flex items-center gap-3">
          {/* Cart button — always visible, prominent */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            カート
            {_hasHydrated && user && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold leading-none shadow">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Auth state */}
          {!_hasHydrated ? null : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAccountOpen((o) => !o)}
                className="flex items-center gap-2 text-gray-700 hover:text-orange-500 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.name ?? 'アカウント'}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <p className="px-4 py-2.5 text-xs text-gray-400 border-b border-gray-100 truncate">{user.email}</p>

                  <Link href="/mypage/profile" onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    プロフィール
                  </Link>
                  {!isAdmin() && (
                    <Link href="/mypage/orders" onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      注文履歴
                    </Link>
                  )}
                  <Link href="/mypage/password" onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    パスワード変更
                  </Link>

                  {isAdmin() && (
                    <>
                      <div className="border-t border-gray-100 my-1" />
                      <Link href="/admin" onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-teal-700 hover:bg-teal-50 transition-colors">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        管理画面
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-100 mt-1">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      ログアウト
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-orange-500 text-sm font-medium px-3 py-2 rounded-md transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors shadow-sm"
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
