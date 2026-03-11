'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface UserItem {
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
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<UserItem[]>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'CUSTOMER' | 'ADMIN' }) =>
      api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const allUsers = users ?? [];
  const adminCount = allUsers.filter((u) => u.role === 'ADMIN').length;
  const customerCount = allUsers.filter((u) => u.role === 'CUSTOMER').length;

  return (
    <div>
      {/* Page header */}
      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '18px 22px', marginBottom: 12 }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#222', margin: '0 0 4px' }}>ユーザー管理</h1>
        <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>
          全 {allUsers.length} 件（管理者: {adminCount} / 顧客: {customerCount}）
        </p>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '48px 0', textAlign: 'center' }}>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>読み込み中...</p>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ff0033' }}>
                {['ユーザー名', 'メール', '電話番号', '登録日', 'ロール'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#555' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#222', margin: '0 0 2px' }}>{u.name}</p>
                    {u.address && (
                      <p style={{ fontSize: '0.68rem', color: '#aaa', margin: 0, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address}</p>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '0.82rem', color: '#555' }}>{u.email}</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.82rem', color: '#888' }}>{u.phone ?? '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: '#aaa' }}>
                    {new Date(u.createdAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {u.id === user?.id ? (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#ff0033',
                        background: '#fff5f5',
                        padding: '3px 10px',
                        borderRadius: 3,
                      }}>
                        {u.role === 'ADMIN' ? '管理者' : '顧客'}（自分）
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value as 'CUSTOMER' | 'ADMIN' })}
                        style={{
                          border: `1px solid ${u.role === 'ADMIN' ? '#ff0033' : '#ddd'}`,
                          borderRadius: 3,
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: u.role === 'ADMIN' ? '#ff0033' : '#444',
                          background: u.role === 'ADMIN' ? '#fff5f5' : 'white',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="CUSTOMER">顧客</option>
                        <option value="ADMIN">管理者</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              {allUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px 0', textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>ユーザーがいません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
