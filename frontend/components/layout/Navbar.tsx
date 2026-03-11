'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

const navItems = [
  'トップ', 'ファッション', '家電・PC', 'スマホ・タブレット', '食品・飲料',
  'キッチン・日用品', 'スポーツ・アウトドア', '美容・健康', '本・CD・ゲーム', 'インテリア・家具',
];

function NavbarInner() {
  const { user, _hasHydrated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const isAdmin = user?.role === 'ADMIN';

  const getActiveNav = () => {
    if (pathname === '/') return 'トップ';
    if (pathname === '/hot-deals') return 'セール';
    if (pathname === '/favorites') return 'お気に入り';
    if (pathname === '/cart') return 'カート';
    if (pathname === '/products' && categoryParam) {
      const match = navItems.find((item) => item === categoryParam);
      if (match) return match;
    }
    return '';
  };
  const activeNav = getActiveNav();

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data),
    enabled: !!user,
  });

  const cartCount = cart?.items?.reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0,
  ) ?? 0;

  return (
    <>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '3px solid #ff0033',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.1 }}>
                <span style={{ color: '#ff0033' }}>モール</span>
                <span style={{ color: '#333' }}>ショップ</span>
              </div>
              <div style={{ fontSize: '0.55rem', color: '#888', letterSpacing: '0.05em' }}>
                かんたんお買いもの
              </div>
            </div>
          </Link>

          {/* Search bar */}
          <div style={{
            flex: 1,
            maxWidth: 600,
            display: 'flex',
            border: '2px solid #ff0033',
            borderRadius: 4,
            height: 40,
            overflow: 'hidden',
          }}>
            <select style={{
              minWidth: 90,
              border: 'none',
              borderRight: '1px solid #e0e0e0',
              background: '#f8f8f8',
              padding: '0 8px',
              fontSize: '0.78rem',
              color: '#444',
              outline: 'none',
            }}>
              <option>すべて</option>
              <option>ファッション</option>
              <option>家電・PC</option>
              <option>食品・飲料</option>
            </select>
            <input
              type="text"
              placeholder="商品・ブランドを検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                padding: '0 12px',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            <button
              onClick={() => { if (searchQuery) window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`; }}
              style={{
                background: '#ff0033',
                color: 'white',
                border: 'none',
                padding: '0 20px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#cc0029')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ff0033')}
            >
              検索
            </button>
          </div>

          {/* Right buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            {/* Admin: show admin panel link */}
            {_hasHydrated && isAdmin && (
              <Link href="/admin" style={{
                textAlign: 'center',
                fontSize: '0.68rem',
                color: pathname.startsWith('/admin') ? '#ff0033' : '#444',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}>
                <div style={{ fontSize: '1.2rem' }}>⚙️</div>
                管理
              </Link>
            )}

            {/* Guest: show login/register */}
            {_hasHydrated && !user && (
              <>
                <Link href="/login" style={{
                  textAlign: 'center',
                  fontSize: '0.68rem',
                  color: '#444',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}>
                  <div style={{ fontSize: '1.2rem' }}>👤</div>
                  ログイン
                </Link>
                <Link href="/register" style={{
                  textAlign: 'center',
                  fontSize: '0.68rem',
                  color: '#ff0033',
                  textDecoration: 'none',
                  border: '1px solid #ff0033',
                  borderRadius: 4,
                  padding: '4px 10px',
                }}>
                  <div style={{ fontSize: '1.2rem' }}>✨</div>
                  新規登録
                </Link>
              </>
            )}

            {/* User/Admin: show favorites, orders, mypage */}
            {_hasHydrated && user && (
              <>
                <Link href="/favorites" style={{
                  textAlign: 'center',
                  fontSize: '0.68rem',
                  color: activeNav === 'お気に入り' ? '#ff0033' : '#444',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}>
                  <div style={{ fontSize: '1.2rem' }}>{activeNav === 'お気に入り' ? '♥' : '♡'}</div>
                  お気に入り
                </Link>
                <Link href="/mypage/orders" style={{ textAlign: 'center', fontSize: '0.68rem', color: '#444', textDecoration: 'none' }}>
                  <div style={{ fontSize: '1.2rem' }}>📋</div>
                  注文履歴
                </Link>
                <Link href="/mypage" style={{ textAlign: 'center', fontSize: '0.68rem', color: pathname.startsWith('/mypage') ? '#ff0033' : '#444', textDecoration: 'none' }}>
                  <div style={{ fontSize: '1.2rem' }}>👤</div>
                  マイページ
                </Link>
              </>
            )}

            {/* Cart (always visible, but redirects guest to login) */}
            <Link href={user ? '/cart' : '/login'} style={{
              textAlign: 'center',
              fontSize: '0.68rem',
              color: '#ff0033',
              textDecoration: 'none',
              border: '1px solid #ff0033',
              borderRadius: 4,
              padding: '4px 12px',
              position: 'relative',
            }}>
              <div style={{ fontSize: '1.2rem' }}>🛒</div>
              カート
              {_hasHydrated && user && cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  background: '#ff0033',
                  color: 'white',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Global Nav */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #e8e8e8',
      }}>
        <div className="nav-scroll" style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
        }}>
          {navItems.map((item, i) => (
            <span key={item} style={{ display: 'flex', alignItems: 'center' }}>
              <Link
                href={item === 'トップ' ? '/' : `/products?category=${encodeURIComponent(item)}`}
                style={{
                  padding: '10px 14px',
                  fontSize: '0.82rem',
                  fontWeight: activeNav === item ? 700 : 500,
                  color: activeNav === item ? '#ff0033' : '#444',
                  borderBottom: activeNav === item ? '2px solid #ff0033' : '2px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s, border-color 0.15s',
                  textDecoration: 'none',
                }}
              >
                {item}
              </Link>
              {i < navItems.length - 1 && (
                <span style={{ width: 1, height: 16, background: '#e0e0e0', flexShrink: 0 }} />
              )}
            </span>
          ))}
          {/* Separator before special items */}
          <span style={{ width: 1, height: 16, background: '#e0e0e0', flexShrink: 0 }} />
          <Link href="/hot-deals" style={{
            padding: '10px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#ff0033',
            whiteSpace: 'nowrap',
            textDecoration: 'none',
            borderBottom: activeNav === 'セール' ? '2px solid #ff0033' : '2px solid transparent',
          }}>
            セール
          </Link>
          <span style={{ width: 1, height: 16, background: '#e0e0e0', flexShrink: 0 }} />
          <Link href="/mypage/coupons" style={{
            padding: '10px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#ff0033',
            whiteSpace: 'nowrap',
            textDecoration: 'none',
          }}>
            クーポン
          </Link>
        </div>
      </nav>
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense>
      <NavbarInner />
    </Suspense>
  );
}
