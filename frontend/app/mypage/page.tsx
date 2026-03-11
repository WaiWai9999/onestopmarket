'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: { id: string; quantity: number; price: number; product: { name: string; imageUrl: string | null } }[];
}

export default function MypagePage() {
  const { user } = useAuthStore();

  const { data: orders } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders').then((r) => r.data),
    enabled: !!user,
  });

  const { data: favData } = useQuery<{ count: number }>({
    queryKey: ['fav-count'],
    queryFn: () => api.get('/favorites/count').then((r) => r.data),
    enabled: !!user,
  });

  const { data: couponData } = useQuery<{ count: number }>({
    queryKey: ['coupon-count'],
    queryFn: () => api.get('/coupons/my/count').then((r) => r.data),
    enabled: !!user,
  });

  const recentOrders = orders?.slice(0, 3) ?? [];
  const totalOrders = orders?.length ?? 0;
  const shippingCount = orders?.filter((o) => o.status === 'PAID' || o.status === 'SHIPPED').length ?? 0;
  const deliveredCount = orders?.filter((o) => o.status === 'DELIVERED').length ?? 0;
  const favCount = favData?.count ?? 0;
  const couponCount = couponData?.count ?? 0;

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

  const quickLinks = [
    { icon: '📋', label: '注文履歴', desc: '過去の注文を確認', href: '/mypage/orders', count: totalOrders },
    { icon: '♥', label: 'お気に入り', desc: 'お気に入り商品を確認', href: '/favorites', count: favCount },
    { icon: '🎫', label: 'クーポン', desc: '利用可能なクーポン', href: '/mypage/coupons', count: couponCount },
    { icon: '🏷️', label: 'ポイント', desc: 'ポイント残高・履歴', href: '/mypage', count: 0 },
    { icon: '📝', label: 'プロフィール', desc: '登録情報の変更', href: '/mypage/profile' },
    { icon: '🔒', label: 'パスワード変更', desc: 'パスワードを更新', href: '/mypage/password' },
  ];

  return (
    <div>
      {/* Welcome card */}
      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '20px 24px', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#222', margin: '0 0 4px' }}>
              こんにちは、{user?.name} さん
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>
              マイページへようこそ
            </p>
          </div>
          <Link href="/products" style={{
            background: '#ff0033',
            color: 'white',
            border: 'none',
            borderRadius: 3,
            padding: '8px 20px',
            fontSize: '0.82rem',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}>
            お買い物を続ける →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
        {[
          { label: '全注文', value: totalOrders, color: '#ff0033' },
          { label: '配送中', value: shippingCount, color: '#0075c2' },
          { label: '配達完了', value: deliveredCount, color: '#2e7d32' },
          { label: 'お気に入り', value: favCount, color: '#e91e63' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'white', padding: '16px 12px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, margin: '0 0 2px' }}>{s.value}</p>
            <p style={{ fontSize: '0.72rem', color: '#888', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
        {quickLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            style={{
              background: 'white',
              padding: '18px 16px',
              textDecoration: 'none',
              transition: 'background 0.15s',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>{link.icon}</span>
              {link.count !== undefined && link.count > 0 && (
                <span style={{ background: '#ff0033', color: 'white', fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                  {link.count}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#222', margin: 0 }}>{link.label}</p>
            <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#222', margin: 0 }}>最近の注文</h2>
          <Link href="/mypage/orders" style={{ fontSize: '0.75rem', color: '#0075c2', textDecoration: 'none' }}>
            すべて見る →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: '32px 18px', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>📦</p>
            <p style={{ fontSize: '0.85rem', color: '#888' }}>まだ注文がありません</p>
            <Link href="/products" style={{ fontSize: '0.78rem', color: '#0075c2', textDecoration: 'none' }}>
              お買い物を始める →
            </Link>
          </div>
        ) : (
          recentOrders.map((order, i) => {
            const st = statusLabel(order.status);
            return (
              <div key={order.id} style={{ padding: '14px 18px', borderBottom: i < recentOrders.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.72rem', color: '#888' }}>
                      {new Date(order.createdAt).toLocaleDateString('ja-JP')}
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
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#e00' }}>
                    ¥{order.total.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} style={{
                      width: 44,
                      height: 44,
                      background: '#f5f5f5',
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      flexShrink: 0,
                    }}>
                      📦
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div style={{
                      width: 44,
                      height: 44,
                      background: '#f5f5f5',
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.68rem',
                      color: '#888',
                      flexShrink: 0,
                    }}>
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
