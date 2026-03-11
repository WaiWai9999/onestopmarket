'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import TopBar from '@/components/layout/TopBar';
import Ticker from '@/components/layout/Ticker';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AccountSidebar from '@/components/layout/AccountSidebar';

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && !user) {
      router.push('/login');
    }
  }, [user, _hasHydrated, router]);

  if (!_hasHydrated) return null;
  if (!user) return null;

  return (
    <>
      <TopBar />
      <Ticker />
      <Navbar />
      <div style={{ background: '#f4f4f4', minHeight: 'calc(100vh - 160px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 12px' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <AccountSidebar />
            <main style={{ flex: 1, minWidth: 0 }}>
              {children}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
