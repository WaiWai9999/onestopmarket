'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
  address: string | null;
  phone: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user, isAdmin } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !isAdmin()) router.push('/');
  }, [user, isAdmin, router]);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'CUSTOMER' | 'ADMIN' }) =>
      api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (isLoading) return <p className="py-16 text-center text-gray-400">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <span className="text-sm text-gray-400">{users?.length ?? 0} total</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#ff0033]/5">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-[#ff0033]/5 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{u.name}</p>
                  {u.address && <p className="text-xs text-gray-400 truncate max-w-[140px]">{u.address}</p>}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{u.phone ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(u.createdAt).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-4 py-3">
                  {u.id === user?.id ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ff0033]/10 text-[#ff0033]">
                      {u.role} (you)
                    </span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) =>
                        roleMutation.mutate({ id: u.id, role: e.target.value as 'CUSTOMER' | 'ADMIN' })
                      }
                      className={`border rounded-lg px-2 py-1 text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff0033] ${
                        u.role === 'ADMIN'
                          ? 'border-[#ff0033] bg-[#ff0033]/10 text-[#ff0033]'
                          : 'border-gray-200 text-gray-700'
                      }`}
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
