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

const statusStyle: Record<string, string> = {
  PENDING:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  PAID:      'bg-green-50 text-green-700 border-green-200',
  SHIPPED:   'bg-blue-50 text-blue-700 border-blue-200',
  DELIVERED: 'bg-purple-50 text-purple-700 border-purple-200',
  CANCELLED: 'bg-red-50 text-red-600 border-red-200',
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
        <p className="text-gray-500 mb-4">注文履歴を見るにはログインしてください。</p>
        <button
          onClick={() => router.push('/login')}
          className="bg-[#1a6b1f] hover:bg-[#155318] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          ログイン
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-4xl mb-3">📦</p>
        <p className="text-gray-700 font-semibold mb-2">注文履歴がありません</p>
        <p className="text-gray-400 text-sm mb-6">注文履歴はこちらに表示されます。</p>
        <Link
          href="/products"
          className="bg-[#1a6b1f] hover:bg-[#155318] text-white font-semibold px-6 py-3 rounded-xl transition-colors inline-block"
        >
          買い物を始める
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">注文履歴</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">注文ID</p>
                <p className="font-mono text-xs text-gray-700">{order.id}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle[order.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
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

            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleDateString('ja-JP')}
              </p>
              <p className="font-bold text-gray-900 text-sm">¥{order.total.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
