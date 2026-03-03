'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    // Redirect non-admin users to home page
    if (user === null) {
      // User not logged in, redirect to login
      router.push('/auth/login');
    } else if (!isAdmin) {
      // User is not admin, redirect to home
      router.push('/');
    }
  }, [user, isAdmin, router]);

  // Don't render if not admin
  if (!isAdmin) {
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
