'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

export default function ChangePasswordPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  const mutation = useMutation({
    mutationFn: () =>
      api.patch('/users/me/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }).then((r) => r.data),
    onSuccess: () => {
      setSuccess('パスワードを変更しました。');
      setError('');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'パスワードの変更に失敗しました';
      setError(msg);
      setSuccess('');
    },
  });

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      setError('新しいパスワードが一致しません');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('新しいパスワードは8文字以上にしてください');
      return;
    }
    mutation.mutate();
  };

  if (!user) return null;

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a6b1f] focus:border-transparent';

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">パスワード変更</h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {success && <p className="text-green-700 text-sm bg-green-50 px-4 py-3 rounded-xl mb-4 border border-green-100">{success}</p>}
        {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl mb-4 border border-red-100">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">現在のパスワード</label>
            <input
              required type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">新しいパスワード</label>
            <input
              required type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              minLength={8}
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1.5">8文字以上</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">新しいパスワード（確認）</label>
            <input
              required type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-[#1a6b1f] hover:bg-[#155318] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? '変更中...' : 'パスワードを変更'}
          </button>
        </form>
      </div>
    </div>
  );
}
