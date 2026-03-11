'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user?: { name: string; email: string };
}

export default function AdminPage() {
  const { user, isAdmin } = useAuthStore();

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.get('/products').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/orders/all').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const recentOrders = orders?.slice(0, 5) ?? [];
  const pendingOrders = orders?.filter((o) => o.status === 'PENDING' || o.status === 'PAID').length ?? 0;

  const stats = [
    { label: 'カテゴリ数', value: categories?.meta?.total ?? categories?.length ?? 0, href: '/admin/categories', icon: '📁' },
    { label: '商品数', value: products?.meta?.total ?? products?.data?.length ?? 0, href: '/admin/products', icon: '📦' },
    { label: '注文数', value: orders?.length ?? 0, href: '/admin/orders', icon: '🛍️' },
    { label: 'ユーザー数', value: users?.length ?? 0, href: '/admin/users', icon: '👥' },
  ];

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

  return (
    <div>
      {/* Page header */}
      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '18px 22px', marginBottom: 12 }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#222', margin: '0 0 4px' }}>ダッシュボード</h1>
        <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>ストアの概要を確認できます</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
        {stats.map((s) => (
          <Link key={s.label} href={s.href} style={{ background: 'white', padding: '18px 16px', textDecoration: 'none', transition: 'background 0.15s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
            </div>
            <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ff0033', margin: '0 0 2px' }}>{s.value}</p>
            <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Alert bar if pending orders */}
      {pendingOrders > 0 && (
        <div style={{ background: '#fff3e0', border: '1px solid #ffcc02', borderRadius: 4, padding: '12px 18px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: '#664d00', fontWeight: 600 }}>
            ⚠ 処理待ちの注文が {pendingOrders} 件あります
          </span>
          <Link href="/admin/orders" style={{ fontSize: '0.75rem', color: '#0075c2', textDecoration: 'none', fontWeight: 600 }}>
            確認する →
          </Link>
        </div>
      )}

      {/* Quick actions + Recent orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Quick actions */}
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0f0' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#222', margin: 0 }}>クイックアクセス</h2>
          </div>
          <div style={{ padding: 6 }}>
            {[
              { label: 'カテゴリ管理', desc: 'カテゴリの追加・編集・削除', href: '/admin/categories', icon: '📁' },
              { label: '商品管理', desc: '商品の追加・編集・削除', href: '/admin/products', icon: '📦' },
              { label: '注文管理', desc: '注文の確認・ステータス更新', href: '/admin/orders', icon: '🛍️' },
              { label: 'ユーザー管理', desc: 'ユーザーの確認・権限管理', href: '/admin/users', icon: '👥' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 3,
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{link.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#222', margin: 0 }}>{link.label}</p>
                  <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>{link.desc}</p>
                </div>
                <span style={{ color: '#ccc', fontSize: '0.85rem' }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #f0f0f0' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#222', margin: 0 }}>最近の注文</h2>
            <Link href="/admin/orders" style={{ fontSize: '0.72rem', color: '#0075c2', textDecoration: 'none' }}>すべて見る →</Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: '32px 18px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: '#888' }}>まだ注文がありません</p>
            </div>
          ) : (
            recentOrders.map((order, i) => {
              const st = statusLabel(order.status);
              return (
                <div key={order.id} style={{ padding: '10px 18px', borderBottom: i < recentOrders.length - 1 ? '1px solid #f5f5f5' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.78rem', color: '#444', margin: '0 0 2px', fontWeight: 500 }}>
                      {order.user?.name ?? '—'}
                    </p>
                    <p style={{ fontSize: '0.68rem', color: '#aaa', margin: 0 }}>
                      {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: st.color,
                      background: st.bg,
                      padding: '2px 8px',
                      borderRadius: 3,
                    }}>
                      {st.text}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e00' }}>
                      ¥{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
