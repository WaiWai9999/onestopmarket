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
}

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', address: '', phone: '' });
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
        name: profile.name,
        email: profile.email,
        address: profile.address ?? '',
        phone: profile.phone ?? '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: () =>
      api.patch('/users/me', {
        name: form.name,
        email: form.email,
        address: form.address,
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

  if (!user) return null;

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a6b1f] focus:border-transparent';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">プロフィール</h1>
        {profile?.role && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
            profile.role === 'ADMIN'
              ? 'bg-[#1a6b1f]/10 text-[#1a6b1f] border-[#1a6b1f]/20'
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            {profile.role}
          </span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {success && <p className="text-green-700 text-sm bg-green-50 px-4 py-3 rounded-xl mb-4 border border-green-100">{success}</p>}
        {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl mb-4 border border-red-100">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">お名前</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">住所</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="東京都渋谷区1-1-1" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">電話番号</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="090-1234-5678" className={inputClass} />
          </div>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full bg-[#1a6b1f] hover:bg-[#155318] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {updateMutation.isPending ? '保存中...' : '変更を保存'}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-gray-100">
          <Link href="/mypage/password" className="text-sm text-[#1a6b1f] hover:text-[#155318] font-medium transition-colors">
            パスワード変更 →
          </Link>
        </div>
      </div>
    </div>
  );
}
