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
    queryFn: () => api.get('/orders').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-sm text-blue-600 mb-1">Total Products</p>
          <p className="text-3xl font-bold text-blue-800">{products?.meta?.total ?? 0}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-sm text-green-600 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-green-800">{orders?.length ?? 0}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/admin/products"
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
        >
          <h2 className="font-semibold text-lg mb-1 text-gray-900">Product Management</h2>
          <p className="text-gray-500 text-sm">Add, edit and delete products</p>
        </Link>
        <Link
          href="/admin/orders"
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
        >
          <h2 className="font-semibold text-lg mb-1 text-gray-900">Order Management</h2>
          <p className="text-gray-500 text-sm">View and update order status</p>
        </Link>
        <Link
          href="/admin/users"
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
        >
          <h2 className="font-semibold text-lg mb-1 text-gray-900">User Management</h2>
          <p className="text-gray-500 text-sm">View users and change roles</p>
        </Link>
      </div>
    </main>
  );
}
