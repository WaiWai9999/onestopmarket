'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface Category {
  id: string;
  name: string;
  slug: string;
}

type FormState = { name: string; slug: string };
const emptyForm: FormState = { name: '', slug: '' };

export default function AdminCategoriesPage() {
  const { user, isAdmin } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saveError, setSaveError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      setSaveError('');
      if (!editingId) {
        await api.post('/categories', { name: form.name, slug: form.slug });
      } else {
        await api.patch(`/categories/${editingId}`, { name: form.name, slug: form.slug });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setSaveError('');
    },
    onError: (err: unknown) => {
      setSaveError(err instanceof Error ? err.message : '保存に失敗しました');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({ name: category.name, slug: category.slug });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setSaveError('');
  };

  const categories: Category[] = data ?? [];

  return (
    <div>
      {/* Page header */}
      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '18px 22px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#222', margin: '0 0 4px' }}>カテゴリ管理</h1>
          <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>全 {categories.length} 件のカテゴリ</p>
        </div>
        <button
          onClick={() => { if (showForm) handleCancel(); else setShowForm(true); }}
          style={{
            background: showForm ? 'white' : '#ff0033',
            color: showForm ? '#555' : 'white',
            border: showForm ? '1px solid #ddd' : 'none',
            borderRadius: 3,
            padding: '8px 20px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {showForm ? 'キャンセル' : '+ 新規カテゴリ'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '22px', marginBottom: 12 }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#222', margin: '0 0 16px' }}>
            {editingId ? 'カテゴリを編集' : '新規カテゴリを追加'}
          </h2>
          {saveError && (
            <div style={{ background: '#fff5f5', border: '1px solid #ffcdd2', borderRadius: 3, padding: '10px 14px', marginBottom: 16, fontSize: '0.8rem', color: '#c62828' }}>{saveError}</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#444', marginBottom: 4 }}>カテゴリ名</label>
              <input
                required
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((prev) => ({ ...prev, name, slug: prev.slug || (name.length > 0 ? name.charAt(0).toUpperCase() : '') }));
                }}
                style={{ width: '100%', border: '1px solid #ddd', borderRadius: 3, padding: '8px 10px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#444', marginBottom: 4 }}>スラッグ</label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                style={{ width: '100%', border: '1px solid #ddd', borderRadius: 3, padding: '8px 10px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            style={{ background: saveMutation.isPending ? '#ccc' : '#ff0033', color: 'white', border: 'none', borderRadius: 3, padding: '10px 28px', fontSize: '0.85rem', fontWeight: 700, cursor: saveMutation.isPending ? 'not-allowed' : 'pointer' }}
          >
            {saveMutation.isPending ? '保存中...' : editingId ? '更新する' : '保存する'}
          </button>
        </form>
      )}

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
                {['カテゴリ名', 'スラッグ', '操作'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#555' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 14px', fontSize: '0.85rem', fontWeight: 600, color: '#222' }}>{category.name}</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.82rem', color: '#888' }}>{category.slug}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEdit(category)} style={{ fontSize: '0.75rem', color: '#0075c2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>編集</button>
                      <button onClick={() => { if (confirm('このカテゴリを削除しますか？')) deleteMutation.mutate(category.id); }} style={{ fontSize: '0.75rem', color: '#e00', background: 'none', border: 'none', cursor: 'pointer' }}>削除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '32px 0', textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>カテゴリがありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
