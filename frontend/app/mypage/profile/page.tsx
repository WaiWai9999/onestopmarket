'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
  address: string | null;
  phone: string | null;
  lastName: string | null;
  firstName: string | null;
  lastNameKana: string | null;
  firstNameKana: string | null;
  postalCode: string | null;
  prefecture: string | null;
  city: string | null;
  addressLine: string | null;
}

const PREFECTURES = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県',
  '岐阜県','静岡県','愛知県','三重県',
  '滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
  '鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県',
  '福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県',
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #ddd',
  borderRadius: 3,
  padding: '9px 10px',
  fontSize: '0.85rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#444',
  marginBottom: 4,
};

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    email: '',
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    postalCode: '',
    prefecture: '',
    city: '',
    addressLine: '',
    phone: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/me').then((r) => r.data),
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        email: profile.email,
        lastName: profile.lastName ?? '',
        firstName: profile.firstName ?? '',
        lastNameKana: profile.lastNameKana ?? '',
        firstNameKana: profile.firstNameKana ?? '',
        postalCode: profile.postalCode ?? '',
        prefecture: profile.prefecture ?? '',
        city: profile.city ?? '',
        addressLine: profile.addressLine ?? '',
        phone: profile.phone ?? '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: () =>
      api.patch('/users/me', {
        email: form.email,
        lastName: form.lastName,
        firstName: form.firstName,
        lastNameKana: form.lastNameKana,
        firstNameKana: form.firstNameKana,
        postalCode: form.postalCode,
        prefecture: form.prefecture,
        city: form.city,
        addressLine: form.addressLine,
        phone: form.phone,
      }).then((r) => r.data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (token) setAuth({ ...user!, name: updated.name, email: updated.email }, token);
      setSuccess('プロフィールを更新しました。');
      setError('');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'プロフィールの更新に失敗しました';
      setError(msg);
      setSuccess('');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    updateMutation.mutate();
  };

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  if (!user) return null;

  const required = <span style={{ color: '#ff0033', fontSize: '0.68rem', marginLeft: 4 }}>必須</span>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#222', margin: 0 }}>プロフィール</h1>
        {profile?.role && (
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 20,
            border: `1px solid ${profile.role === 'ADMIN' ? 'rgba(255,0,51,0.2)' : '#e0e0e0'}`,
            background: profile.role === 'ADMIN' ? 'rgba(255,0,51,0.06)' : '#f8f8f8',
            color: profile.role === 'ADMIN' ? '#ff0033' : '#666',
          }}>
            {profile.role}
          </span>
        )}
      </div>

      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
        {success && (
          <div style={{ margin: '16px 16px 0', padding: '10px 14px', background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 3, fontSize: '0.82rem', color: '#2e7d32' }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ margin: '16px 16px 0', padding: '10px 14px', background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: 3, fontSize: '0.82rem', color: '#c62828' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name section */}
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#222', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #ff0033' }}>
              お名前
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>セイ（姓）{required}</label>
                <input
                  required
                  value={form.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                  placeholder="山田"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>メイ（名）{required}</label>
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  placeholder="太郎"
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>セイ（フリガナ）</label>
                <input
                  value={form.lastNameKana}
                  onChange={(e) => set('lastNameKana', e.target.value)}
                  placeholder="ヤマダ"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>メイ（フリガナ）</label>
                <input
                  value={form.firstNameKana}
                  onChange={(e) => set('firstNameKana', e.target.value)}
                  placeholder="タロウ"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div style={{ padding: '0 16px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#222', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #ff0033' }}>
              連絡先
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>メールアドレス{required}</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>電話番号</label>
              <input
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="090-1234-5678"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Address section */}
          <div style={{ padding: '0 16px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#222', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #ff0033' }}>
              住所
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>郵便番号</label>
                <input
                  value={form.postalCode}
                  onChange={(e) => set('postalCode', e.target.value.replace(/[^0-9-]/g, ''))}
                  placeholder="123-4567"
                  maxLength={8}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>都道府県</label>
                <select
                  value={form.prefecture}
                  onChange={(e) => set('prefecture', e.target.value)}
                  style={{ ...inputStyle, background: 'white', cursor: 'pointer' }}
                >
                  <option value="">選択してください</option>
                  {PREFECTURES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>市区町村</label>
              <input
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="渋谷区"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>番地・建物名</label>
              <input
                value={form.addressLine}
                onChange={(e) => set('addressLine', e.target.value)}
                placeholder="神宮前1-2-3 モールビル101"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Submit */}
          <div style={{ padding: '0 16px 16px' }}>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              style={{
                width: '100%',
                background: '#ff0033',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '12px 0',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: updateMutation.isPending ? 0.5 : 1,
                transition: 'background 0.15s',
              }}
            >
              {updateMutation.isPending ? '保存中...' : '変更を保存'}
            </button>
          </div>
        </form>

        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <Link href="/mypage/password" style={{ fontSize: '0.82rem', color: '#ff0033', fontWeight: 600, textDecoration: 'none' }}>
            パスワード変更 →
          </Link>
        </div>
      </div>
    </div>
  );
}
