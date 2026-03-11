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
    { icon: '👤', label: 'マイページトップ', href: '/mypage' },
    { icon: '📋', label: '注文履歴', href: '/mypage/orders' },
    { icon: '♥', label: 'お気に入り', href: '/favorites' },
    { icon: '🎫', label: 'クーポン', href: '/mypage/coupons' },
    { icon: '🏷️', label: 'ポイント', href: '/mypage' },
    { icon: '📝', label: 'プロフィール', href: '/mypage/profile' },
    { icon: '🔒', label: 'パスワード変更', href: '/mypage/password' },
  ];

  const adminLinks = [
    { icon: '📊', label: 'ダッシュボード', href: '/admin' },
    { icon: '📦', label: '商品管理', href: '/admin/products' },
    { icon: '🛍️', label: '注文管理', href: '/admin/orders' },
    { icon: '👥', label: 'ユーザー管理', href: '/admin/users' },
    { icon: '📁', label: 'カテゴリ管理', href: '/admin/categories' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside style={{ width: 200, flexShrink: 0 }}>
      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden', position: 'sticky', top: 80 }}>
        {/* Header */}
        <div style={{ background: '#ff0033', padding: '14px 16px' }}>
          <p style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name ?? 'アカウント'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </p>
          {isAdmin && (
            <span style={{
              display: 'inline-block',
              marginTop: 6,
              fontSize: '0.62rem',
              fontWeight: 700,
              color: 'white',
              background: 'rgba(255,255,255,0.25)',
              padding: '2px 8px',
              borderRadius: 3,
            }}>
              管理者
            </span>
          )}
        </div>

        {/* Account nav */}
        <nav style={{ padding: 6 }}>
          {accountLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 3,
                  fontSize: '0.78rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#ff0033' : '#444',
                  background: active ? '#fff5f5' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 0.15s, color 0.15s',
                  borderLeft: active ? '3px solid #ff0033' : '3px solid transparent',
                }}
              >
                <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div style={{ height: 1, background: '#e8e8e8', margin: '6px 8px' }} />
              <p style={{ fontSize: '0.62rem', fontWeight: 700, color: '#999', padding: '4px 12px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                管理者メニュー
              </p>
              {adminLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 3,
                      fontSize: '0.78rem',
                      fontWeight: active ? 700 : 500,
                      color: active ? '#ff0033' : '#444',
                      background: active ? '#fff5f5' : 'transparent',
                      textDecoration: 'none',
                      transition: 'background 0.15s, color 0.15s',
                      borderLeft: active ? '3px solid #ff0033' : '3px solid transparent',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </>
          )}

          {/* Logout */}
          <div style={{ height: 1, background: '#e8e8e8', margin: '6px 8px' }} />
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '8px 12px',
              borderRadius: 3,
              fontSize: '0.78rem',
              fontWeight: 500,
              color: '#999',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'color 0.15s',
              borderLeft: '3px solid transparent',
            }}
          >
            <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>🚪</span>
            ログアウト
          </button>
        </nav>
      </div>
    </aside>
  );
}
