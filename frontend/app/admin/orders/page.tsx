'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface Order {
  id: string;
  status: string;
  total: number;
  shippingAddress: string;
  createdAt: string;
  user?: { name: string; email: string };
  items: { id: string; quantity: number; price: number; product: { name: string } }[];
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function AdminOrdersPage() {
  const { user, isAdmin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || !isAdmin()) router.push('/');
  }, [user, isAdmin, router]);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/orders').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  if (isLoading) return <p className="text-center py-16 text-gray-500">Loading...</p>;

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>

      <div className="space-y-4">
        {orders?.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-mono text-sm text-gray-500">{order.id}</p>
                <p className="text-sm text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>

            <div className="space-y-1 mb-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>¥{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <p className="text-sm text-gray-500">Ship to: {order.shippingAddress}</p>
              <p className="font-bold">¥{order.total.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
