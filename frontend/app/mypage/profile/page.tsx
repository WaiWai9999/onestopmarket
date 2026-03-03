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
      setSuccess('Profile updated successfully.');
      setError('');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to update profile';
      setError(msg);
      setSuccess('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    updateMutation.mutate();
  };

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="mb-5 text-sm text-gray-500">
          Role:{' '}
          <span className={`font-semibold ${profile?.role === 'ADMIN' ? 'text-amber-500' : 'text-gray-700'}`}>
            {profile?.role}
          </span>
        </div>

        {success && <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg mb-4">{success}</p>}
        {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Tokyo, Shibuya-ku 1-1-1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="090-1234-5678"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full bg-amber-400 text-gray-900 font-semibold py-2 rounded-full hover:bg-amber-300 disabled:opacity-50 transition-all"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-gray-100">
          <Link
            href="/mypage/password"
            className="text-sm text-amber-600 hover:text-amber-500 font-medium"
          >
            Change Password →
          </Link>
        </div>
      </div>
    </div>
  );
}
