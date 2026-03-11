'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minPurchase: number;
  maxUses: number | null;
  usedCount: number;
  category: string | null;
  expiresAt: string;
  isActive: boolean;
}

interface UserCoupon {
  id: string;
  couponId: string;
  usedAt: string | null;
  createdAt: string;
  coupon: Coupon;
}

export default function CouponsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'available' | 'my'>('available');

  // All available coupons (public)
  const { data: allCoupons, isLoading: loadingAll } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: () => api.get('/coupons').then((r) => r.data),
  });

  // User's acquired coupons
  const { data: myCoupons, isLoading: loadingMy } = useQuery<UserCoupon[]>({
    queryKey: ['my-coupons'],
    queryFn: () => api.get('/coupons/my').then((r) => r.data),
    enabled: !!user,
  });

  const acquireMutation = useMutation({
    mutationFn: (couponId: string) => api.post(`/coupons/${couponId}/acquire`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['my-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon-count'] });
    },
  });

  const acquiredIds = new Set((myCoupons ?? []).map((uc) => uc.couponId));
  const available = allCoupons ?? [];
  const myList = myCoupons ?? [];
  const unusedCount = myList.filter((uc) => !uc.usedAt && new Date(uc.coupon.expiresAt) > new Date()).length;

  const formatDiscount = (c: Coupon) => {
    if (c.discountType === 'PERCENT') return { value: `${c.discountValue}`, unit: '%OFF' };
    return { value: `${c.discountValue.toLocaleString()}`, unit: '円OFF' };
  };

  const isExpired = (c: Coupon) => new Date(c.expiresAt) < new Date();
  const isFull = (c: Coupon) => c.maxUses !== null && c.usedCount >= c.maxUses;

  return (
    <div>
      {/* Page header */}
      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '18px 22px', marginBottom: 12 }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#222', margin: '0 0 4px' }}>クーポン</h1>
        <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>
          利用可能なクーポン: {unusedCount} 枚
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
        <button
          onClick={() => setTab('available')}
          style={{
            background: tab === 'available' ? '#fff5f5' : 'white',
            border: 'none',
            padding: '14px 8px',
            cursor: 'pointer',
            textAlign: 'center',
            borderBottom: tab === 'available' ? '2px solid #ff0033' : '2px solid transparent',
          }}
        >
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: tab === 'available' ? '#ff0033' : '#444', margin: '0 0 2px' }}>{available.length}</p>
          <p style={{ fontSize: '0.72rem', color: '#888', margin: 0 }}>お得なクーポン</p>
        </button>
        <button
          onClick={() => setTab('my')}
          style={{
            background: tab === 'my' ? '#fff5f5' : 'white',
            border: 'none',
            padding: '14px 8px',
            cursor: 'pointer',
            textAlign: 'center',
            borderBottom: tab === 'my' ? '2px solid #ff0033' : '2px solid transparent',
          }}
        >
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: tab === 'my' ? '#ff0033' : '#444', margin: '0 0 2px' }}>{unusedCount}</p>
          <p style={{ fontSize: '0.72rem', color: '#888', margin: 0 }}>取得済みクーポン</p>
        </button>
      </div>

      {/* Available coupons */}
      {tab === 'available' && (
        loadingAll ? (
          <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '48px 0', textAlign: 'center' }}>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>読み込み中...</p>
          </div>
        ) : available.length === 0 ? (
          <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '48px 0', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>🎫</p>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>現在配布中のクーポンはありません</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {available.map((coupon) => {
              const { value, unit } = formatDiscount(coupon);
              const acquired = acquiredIds.has(coupon.id);
              const expired = isExpired(coupon);
              const full = isFull(coupon);
              const disabled = acquired || expired || full || acquireMutation.isPending;

              return (
                <div key={coupon.id} style={{
                  background: 'white',
                  border: '2px dashed #ff0033',
                  borderRadius: 8,
                  overflow: 'hidden',
                  opacity: expired || full ? 0.5 : 1,
                  position: 'relative',
                }}>
                  {/* Top gradient bar */}
                  <div style={{ height: 4, background: 'linear-gradient(90deg, #ff0033, #ff9a00)' }} />

                  {/* Notches */}
                  <div style={{ position: 'absolute', top: '50%', left: -8, width: 16, height: 16, borderRadius: '50%', background: '#f4f4f4', transform: 'translateY(-50%)' }} />
                  <div style={{ position: 'absolute', top: '50%', right: -8, width: 16, height: 16, borderRadius: '50%', background: '#f4f4f4', transform: 'translateY(-50%)' }} />

                  <div style={{ padding: '18px 20px', textAlign: 'center' }}>
                    {/* Discount value */}
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: '#ff0033' }}>{value}</span>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ff0033' }}>{unit}</span>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '0.82rem', color: '#444', margin: '0 0 4px', fontWeight: 600 }}>{coupon.description}</p>

                    {/* Conditions */}
                    {coupon.minPurchase > 0 && (
                      <p style={{ fontSize: '0.7rem', color: '#888', margin: '0 0 2px' }}>
                        ¥{coupon.minPurchase.toLocaleString()}以上で利用可能
                      </p>
                    )}
                    {coupon.category && (
                      <p style={{ fontSize: '0.7rem', color: '#888', margin: '0 0 2px' }}>
                        {coupon.category}限定
                      </p>
                    )}

                    {/* Expiry */}
                    <p style={{ fontSize: '0.68rem', color: '#aaa', margin: '4px 0 12px' }}>
                      有効期限: {new Date(coupon.expiresAt).toLocaleDateString('ja-JP')}まで
                    </p>

                    {/* Code */}
                    <div style={{
                      display: 'inline-block',
                      background: '#f8f8f8',
                      border: '1px dashed #ccc',
                      borderRadius: 3,
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#555',
                      letterSpacing: '0.1em',
                      fontFamily: 'monospace',
                      marginBottom: 12,
                    }}>
                      {coupon.code}
                    </div>

                    {/* Acquire button */}
                    <div>
                      <button
                        onClick={() => !disabled && acquireMutation.mutate(coupon.id)}
                        disabled={disabled}
                        style={{
                          background: acquired ? '#2e7d32' : disabled ? '#ccc' : '#ff0033',
                          color: 'white',
                          border: 'none',
                          borderRadius: 20,
                          padding: '8px 28px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          transition: 'background 0.15s',
                        }}
                      >
                        {acquired ? '✓ 取得済み' : expired ? '期限切れ' : full ? '配布終了' : 'クーポンを取得'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* My coupons */}
      {tab === 'my' && (
        loadingMy ? (
          <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '48px 0', textAlign: 'center' }}>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>読み込み中...</p>
          </div>
        ) : myList.length === 0 ? (
          <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '48px 0', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>🎫</p>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>取得したクーポンはありません</p>
            <button
              onClick={() => setTab('available')}
              style={{ marginTop: 8, background: 'none', border: 'none', color: '#0075c2', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
            >
              クーポンを探す →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myList.map((uc) => {
              const coupon = uc.coupon;
              const { value, unit } = formatDiscount(coupon);
              const used = !!uc.usedAt;
              const expired = isExpired(coupon);
              const isUsable = !used && !expired;

              return (
                <div key={uc.id} style={{
                  background: 'white',
                  border: `1px solid ${isUsable ? '#e0e0e0' : '#eee'}`,
                  borderRadius: 4,
                  overflow: 'hidden',
                  opacity: isUsable ? 1 : 0.55,
                  display: 'flex',
                  alignItems: 'stretch',
                }}>
                  {/* Left: discount display */}
                  <div style={{
                    background: isUsable ? 'linear-gradient(135deg, #ff0033, #ff6b35)' : '#ccc',
                    color: 'white',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 100,
                  }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 900 }}>{value}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{unit}</span>
                  </div>

                  {/* Right: details */}
                  <div style={{ flex: 1, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#222', margin: '0 0 4px' }}>{coupon.description}</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#555',
                          background: '#f5f5f5',
                          padding: '2px 8px',
                          borderRadius: 3,
                          letterSpacing: '0.05em',
                        }}>
                          {coupon.code}
                        </span>
                        {coupon.minPurchase > 0 && (
                          <span style={{ fontSize: '0.68rem', color: '#888' }}>
                            ¥{coupon.minPurchase.toLocaleString()}以上
                          </span>
                        )}
                        {coupon.category && (
                          <span style={{ fontSize: '0.68rem', color: '#888' }}>
                            {coupon.category}限定
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.68rem', color: '#aaa', margin: '4px 0 0' }}>
                        {expired ? '期限切れ' : `有効期限: ${new Date(coupon.expiresAt).toLocaleDateString('ja-JP')}まで`}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div style={{ flexShrink: 0, marginLeft: 12 }}>
                      {used ? (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#888',
                          background: '#f5f5f5',
                          padding: '4px 12px',
                          borderRadius: 3,
                        }}>
                          使用済み
                        </span>
                      ) : expired ? (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#888',
                          background: '#f5f5f5',
                          padding: '4px 12px',
                          borderRadius: 3,
                        }}>
                          期限切れ
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#2e7d32',
                          background: '#e8f5e9',
                          padding: '4px 12px',
                          borderRadius: 3,
                        }}>
                          利用可能
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
