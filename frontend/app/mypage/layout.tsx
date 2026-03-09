'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
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
    <div className="max-w-5xl mx-auto px-6 py-8 flex gap-8 items-start">
      <AccountSidebar />
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
