'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const allStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const statusLabel = (s: string) => {
  const map: Record<string, { text: string; color: string; bg: string }> = {
    PENDING: { text: '決済待ち', color: '#f57c00', bg: '#fff3e0' },
    PAID: { text: '発送準備中', color: '#1565c0', bg: '#e3f2fd' },
    SHIPPED: { text: '配送中', color: '#0075c2', bg: '#e3f2fd' },
    DELIVERED: { text: '配達完了', color: '#2e7d32', bg: '#e8f5e9' },
    CANCELLED: { text: 'キャンセル済み', color: '#888', bg: '#f5f5f5' },
  };
  return map[s] ?? { text: s, color: '#555', bg: '#f5f5f5' };
};

const statusTextJa: Record<string, string> = {
  PENDING: '決済待ち',
  PAID: '発送準備中',
  SHIPPED: '配送中',
  DELIVERED: '配達完了',
  CANCELLED: 'キャンセル済み',
};

export default function AdminOrdersPage() {
  const { user, isAdmin } = useAuthStore();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/orders/all').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const allOrders = orders ?? [];
  const filtered = filterStatus === 'ALL' ? allOrders : allOrders.filter((o) => o.status === filterStatus);

  const statusCounts = allStatuses.reduce((acc, s) => {
    acc[s] = allOrders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      {/* Page header */}
      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '18px 22px', marginBottom: 12 }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#222', margin: '0 0 4px' }}>注文管理</h1>
        <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>全 {allOrders.length} 件の注文</p>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${allStatuses.length + 1}, 1fr)`, gap: 1, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
        <button
          onClick={() => setFilterStatus('ALL')}
          style={{
            background: filterStatus === 'ALL' ? '#fff5f5' : 'white',
            border: 'none',
            padding: '12px 8px',
            cursor: 'pointer',
            textAlign: 'center',
            borderBottom: filterStatus === 'ALL' ? '2px solid #ff0033' : '2px solid transparent',
          }}
        >
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ff0033', margin: '0 0 2px' }}>{allOrders.length}</p>
          <p style={{ fontSize: '0.68rem', color: '#888', margin: 0 }}>すべて</p>
        </button>
        {allStatuses.map((s) => {
          const st = statusLabel(s);
          const active = filterStatus === s;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                background: active ? st.bg : 'white',
                border: 'none',
                padding: '12px 8px',
                cursor: 'pointer',
                textAlign: 'center',
                borderBottom: active ? `2px solid ${st.color}` : '2px solid transparent',
              }}
            >
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: st.color, margin: '0 0 2px' }}>{statusCounts[s]}</p>
              <p style={{ fontSize: '0.68rem', color: '#888', margin: 0 }}>{st.text}</p>
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '48px 0', textAlign: 'center' }}>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>読み込み中...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '48px 0', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: 8 }}>📋</p>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>該当する注文がありません</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((order) => {
            const st = statusLabel(order.status);
            return (
              <div key={order.id} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: '0.72rem', color: '#aaa', fontFamily: 'monospace' }}>
                        {order.id.slice(0, 8)}...
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: st.color,
                        background: st.bg,
                        padding: '2px 8px',
                        borderRadius: 3,
                      }}>
                        {st.text}
                      </span>
                    </div>
                    {order.user && (
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#222', margin: 0 }}>
                        {order.user.name}
                        <span style={{ fontWeight: 400, color: '#aaa', marginLeft: 6, fontSize: '0.72rem' }}>{order.user.email}</span>
                      </p>
                    )}
                    <p style={{ fontSize: '0.68rem', color: '#aaa', margin: '2px 0 0' }}>
                      {new Date(order.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <select
                      value={order.status}
                      onChange={(e) => statusMutation.mutate({ id: order.id, status: e.target.value })}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: 3,
                        padding: '5px 8px',
                        fontSize: '0.75rem',
                        color: '#444',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {allStatuses.map((s) => (
                        <option key={s} value={s}>{statusTextJa[s]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div style={{ padding: '10px 18px' }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.8rem', color: '#555' }}>
                      <span>{item.product.name} × {item.quantity}</span>
                      <span style={{ fontWeight: 600, color: '#222' }}>¥{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 18px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                  <p style={{ fontSize: '0.72rem', color: '#aaa', margin: 0, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📍 {order.shippingAddress}
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#e00', margin: 0 }}>
                    ¥{order.total.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
