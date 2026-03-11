'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const navLinks = [
  { icon: '📊', label: 'ダッシュボード', href: '/admin' },
  { icon: '📁', label: 'カテゴリ管理', href: '/admin/categories' },
  { icon: '📦', label: '商品管理', href: '/admin/products' },
  { icon: '🛍️', label: '注文管理', href: '/admin/orders' },
  { icon: '👥', label: 'ユーザー管理', href: '/admin/users' },
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
    <aside style={{ width: 200, flexShrink: 0 }}>
      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden', position: 'sticky', top: 80 }}>
        <nav style={{ padding: 6 }}>
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 3,
                  fontSize: '0.8rem',
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

          <div style={{ height: 1, background: '#e8e8e8', margin: '6px 8px' }} />

          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 12px',
              borderRadius: 3,
              fontSize: '0.8rem',
              fontWeight: 500,
              color: '#888',
              textDecoration: 'none',
              borderLeft: '3px solid transparent',
            }}
          >
            <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>🏪</span>
            ストアに戻る
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '9px 12px',
              borderRadius: 3,
              fontSize: '0.8rem',
              fontWeight: 500,
              color: '#999',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
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
