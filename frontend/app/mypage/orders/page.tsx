'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface Order {
  id: string;
  status: string;
  total: number;
  shippingAddress: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { name: string };
  }[];
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then((r) => r.data),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 mb-4">Please login to view your orders.</p>
        <button
          onClick={() => router.push('/login')}
          className="bg-amber-400 text-gray-900 font-semibold px-6 py-2 rounded-full hover:bg-amber-300 transition-all"
        >
          Login
        </button>
      </div>
    );
  }

  if (isLoading) return <p className="py-12 text-center text-gray-400">Loading...</p>;

  if (!orders || orders.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 mb-4">No orders yet.</p>
        <Link
          href="/products"
          className="bg-amber-400 text-gray-900 font-semibold px-6 py-2 rounded-full hover:bg-amber-300 transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400">Order ID</p>
                <p className="font-mono text-sm text-gray-700">{order.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>

            <div className="space-y-1 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>¥{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {new Date(order.createdAt).toLocaleDateString('ja-JP')}
              </p>
              <p className="font-bold text-gray-900">¥{order.total.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
