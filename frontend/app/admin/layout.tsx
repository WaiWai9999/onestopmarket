'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.push('/login');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, _hasHydrated, router]);

  if (!_hasHydrated || !isAdmin) {
    return null;
  }

  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh' }}>
      {/* Admin header */}
      <header style={{ background: 'white', borderBottom: '3px solid #ff0033', padding: '10px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/" style={{ textDecoration: 'none' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.1 }}>
                <span style={{ color: '#ff0033' }}>モール</span>
                <span style={{ color: '#333' }}>ショップ</span>
              </div>
            </a>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'white',
              background: '#ff0033',
              padding: '3px 10px',
              borderRadius: 3,
            }}>
              管理パネル
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.78rem' }}>
            <span style={{ color: '#888' }}>{user?.name}</span>
            <a href="/" style={{ color: '#0075c2', textDecoration: 'none', fontSize: '0.75rem' }}>
              ← ストアに戻る
            </a>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 12px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <AdminSidebar />
          <main style={{ flex: 1, minWidth: 0 }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
