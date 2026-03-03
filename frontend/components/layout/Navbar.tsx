'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import Logo from '@/components/Logo';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuthStore();
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

  // Close dropdown when clicking outside
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
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Primary Menu */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </Link>

          {/* Primary Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/products"
              className="text-gray-600 hover:text-orange-500 text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Products
            </Link>
            <Link
              href="/hot-deals"
              className="text-gray-600 hover:text-orange-500 text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1"
            >
              🔥 Hot Deals
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-orange-500 text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
            >
              About
            </Link>
            {user && (
              <Link
                href="/cart"
                className="relative flex items-center gap-2 text-gray-600 hover:text-orange-500 text-sm font-semibold px-4 py-2 rounded-lg border border-transparent hover:bg-orange-50 transition-all duration-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold leading-none shadow-lg">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Right Menu */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Account dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setAccountOpen((o) => !o)}
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-500 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-orange-50 transition-all duration-200"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Account
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${accountOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 backdrop-blur-sm">
                    <p className="px-4 py-3 text-xs text-gray-500 border-b border-gray-100 font-semibold uppercase tracking-wide truncate">
                      {user.email}
                    </p>
                    <Link
                      href="/mypage/profile"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-teal-50 hover:text-orange-600 transition-all duration-200"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Profile Info
                    </Link>
                    <Link
                      href="/mypage/password"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-teal-50 hover:text-orange-600 transition-all duration-200"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      Change Password
                    </Link>
                    <Link
                      href="/mypage/orders"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-teal-50 hover:text-orange-600 transition-all duration-200"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      Orders
                    </Link>

                    {/* Admin Section - Only show if user is admin */}
                    {isAdmin() && (
                      <>
                        <div className="border-t border-gray-100 my-2" />
                        <Link
                          href="/admin"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-teal-600 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 transition-all duration-200"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 3v1m6.053 1.053l-.707.707M21 12h1m-1 6.053l-.707-.707M12 21v1m-6.053-1.053l.707.707M3 12H2m1-6.053l.707.707"></path>
                            <circle cx="12" cy="12" r="5"></circle>
                          </svg>
                          Dashboard
                        </Link>
                        <Link
                          href="/admin/products"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-teal-600 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 transition-all duration-200"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2h12a1 1 0 0 1 1 1v2h1a1 1 0 0 1 1 1v2H1V6a1 1 0 0 1 1-1h1V3a1 1 0 0 1 1-1z"></path>
                            <path d="M1 10h22v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-8z"></path>
                          </svg>
                          Product Management
                        </Link>
                        <Link
                          href="/admin/orders"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-teal-600 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 transition-all duration-200"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 11l3 3L22 4"></path>
                            <path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11"></path>
                          </svg>
                          Order Management
                        </Link>
                        <Link
                          href="/admin/users"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-teal-600 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 transition-all duration-200"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                          User Management
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-orange-500 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-orange-50 transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 transform hover:scale-105"
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
