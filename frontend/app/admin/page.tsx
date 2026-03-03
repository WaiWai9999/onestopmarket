'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user, isAdmin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || !isAdmin()) router.push('/');
  }, [user, isAdmin, router]);

  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.get('/products').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/orders/all').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const stats = [
    { label: 'Total Products', value: products?.meta?.total ?? 0, href: '/admin/products', color: 'text-amber-500' },
    { label: 'Total Orders', value: orders?.length ?? 0, href: '/admin/orders', color: 'text-green-600' },
    { label: 'Total Users', value: users?.length ?? 0, href: '/admin/users', color: 'text-blue-500' },
  ];

  const quickLinks = [
    { label: 'Product Management', desc: 'Add, edit and delete products', href: '/admin/products' },
    { label: 'Order Management', desc: 'View and update order statuses', href: '/admin/orders' },
    { label: 'User Management', desc: 'View users and manage roles', href: '/admin/users' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition-all"
          >
            <p className="text-sm text-gray-600 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Quick Access</h2>
      <div className="grid grid-cols-1 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-orange-300 hover:shadow-md transition-all group"
          >
            <div>
              <p className="font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">{link.label}</p>
              <p className="text-sm text-gray-500 mt-0.5">{link.desc}</p>
            </div>
            <span className="text-gray-400 group-hover:text-orange-500 text-lg transition-colors">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
