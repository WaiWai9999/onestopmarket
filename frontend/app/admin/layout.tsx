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
    <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8 items-start">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
