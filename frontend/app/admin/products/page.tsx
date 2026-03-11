'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  discountPercent: number | null;
  isHotDeal: boolean;
  stock: number;
  imageUrl: string | null;
  category: { id: string; name: string };
  categoryId: string;
}

type FormState = {
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  discountPercent: string;
  isHotDeal: boolean;
  stock: string;
  categoryId: string;
};

const emptyForm: FormState = { name: '', description: '', price: '', discountPrice: '', discountPercent: '', isHotDeal: false, stock: '', categoryId: '' };

export default function AdminProductsPage() {
  const { user, isAdmin } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saveError, setSaveError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.get('/products', { params: { limit: 100 } }).then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      setSaveError('');
      let productId = editingId;
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: form.categoryId,
        ...(form.discountPrice ? { discountPrice: Number(form.discountPrice) } : {}),
        ...(form.discountPercent ? { discountPercent: Number(form.discountPercent) } : {}),
        isHotDeal: form.isHotDeal,
      };

      if (!productId) {
        const { data } = await api.post('/products', payload);
        productId = data.id;
      } else {
        await api.patch(`/products/${productId}`, payload);
      }
      if (imageFile && productId) {
        const formData = new FormData();
        formData.append('image', imageFile);
        try {
          await api.post(`/products/${productId}/image`, formData);
        } catch (err) {
          if (!editingId) await api.delete(`/products/${productId}`);
          throw err;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setImageFile(null);
      setSaveError('');
    },
    onError: (err: unknown) => {
      setSaveError(err instanceof Error ? err.message : '保存に失敗しました');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : '',
      discountPercent: product.discountPercent ? String(product.discountPercent) : '',
      isHotDeal: product.isHotDeal,
      stock: String(product.stock),
      categoryId: product.categoryId,
    });
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setSaveError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFile) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(imageFile.type)) {
        setSaveError('対応していない画像形式です。JPEG, PNG, WebPをご使用ください。');
        return;
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        setSaveError('画像サイズが大きすぎます。5MB以下にしてください。');
        return;
      }
    }
    saveMutation.mutate();
  };

  const products: Product[] = data?.data ?? [];
  const filtered = searchQuery
    ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  return (
    <div>
      {/* Page header */}
      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '18px 22px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#222', margin: '0 0 4px' }}>商品管理</h1>
          <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>
            全 {products.length} 件の商品
          </p>
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
          {showForm ? 'キャンセル' : '+ 新規商品'}
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '22px', marginBottom: 12 }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#222', margin: '0 0 16px' }}>
            {editingId ? '商品を編集' : '新規商品を追加'}
          </h2>
          {saveError && (
            <div style={{ background: '#fff5f5', border: '1px solid #ffcdd2', borderRadius: 3, padding: '10px 14px', marginBottom: 16, fontSize: '0.8rem', color: '#c62828' }}>
              {saveError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#444', marginBottom: 4 }}>商品名</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', border: '1px solid #ddd', borderRadius: 3, padding: '8px 10px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#444', marginBottom: 4 }}>カテゴリ</label>
              <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} style={{ width: '100%', border: '1px solid #ddd', borderRadius: 3, padding: '8px 10px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}>
                <option value="">選択してください</option>
                {categories?.map((c: { id: string; name: string }) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#444', marginBottom: 4 }}>価格（税込）</label>
              <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ width: '100%', border: '1px solid #ddd', borderRadius: 3, padding: '8px 10px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#444', marginBottom: 4 }}>在庫数</label>
              <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={{ width: '100%', border: '1px solid #ddd', borderRadius: 3, padding: '8px 10px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#444', marginBottom: 4 }}>割引価格</label>
              <input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} placeholder="なしの場合は空欄" style={{ width: '100%', border: '1px solid #ddd', borderRadius: 3, padding: '8px 10px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#444', marginBottom: 4 }}>割引率（%）</label>
              <input type="number" min="0" max="100" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} placeholder="0-100" style={{ width: '100%', border: '1px solid #ddd', borderRadius: 3, padding: '8px 10px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#444', marginBottom: 4 }}>商品説明</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: '100%', border: '1px solid #ddd', borderRadius: 3, padding: '8px 10px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#444', marginBottom: 4 }}>
                画像 {editingId && <span style={{ color: '#999', fontWeight: 400 }}>（変更しない場合は空欄）</span>}
              </label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} style={{ fontSize: '0.78rem', color: '#555' }} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#444', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isHotDeal} onChange={(e) => setForm({ ...form, isHotDeal: e.target.checked })} />
              ホットディール
            </label>
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

      {/* Search bar */}
      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '10px 16px', marginBottom: 12 }}>
        <input
          type="text"
          placeholder="商品名で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', border: 'none', fontSize: '0.85rem', outline: 'none' }}
        />
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '48px 0', textAlign: 'center' }}>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>読み込み中...</p>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ff0033' }}>
                {['画像', '商品名', 'カテゴリ', '価格', '在庫', '操作'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#555', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 14px' }}>
                    <div style={{ width: 44, height: 44, background: '#f5f5f5', borderRadius: 3, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {product.imageUrl ? (
                        <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '1.2rem' }}>📦</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '8px 14px' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#222', margin: '0 0 2px' }}>{product.name}</p>
                    {product.isHotDeal && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, background: '#f5a623', color: '#333', padding: '1px 5px', borderRadius: 2 }}>HOT</span>
                    )}
                  </td>
                  <td style={{ padding: '8px 14px' }}>
                    <span style={{ fontSize: '0.72rem', background: '#f5f5f5', color: '#555', padding: '2px 8px', borderRadius: 3 }}>
                      {product.category.name}
                    </span>
                  </td>
                  <td style={{ padding: '8px 14px' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e00', margin: 0 }}>
                      ¥{(product.discountPrice ?? product.price).toLocaleString()}
                    </p>
                    {product.discountPrice && (
                      <p style={{ fontSize: '0.68rem', color: '#999', textDecoration: 'line-through', margin: 0 }}>
                        ¥{product.price.toLocaleString()}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: '8px 14px' }}>
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: product.stock === 0 ? '#e00' : product.stock < 5 ? '#f57c00' : '#2e7d32',
                    }}>
                      {product.stock}
                    </span>
                  </td>
                  <td style={{ padding: '8px 14px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleEdit(product)}
                        style={{ fontSize: '0.75rem', color: '#0075c2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => { if (confirm('この商品を削除しますか？')) deleteMutation.mutate(product.id); }}
                        style={{ fontSize: '0.75rem', color: '#e00', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '32px 0', textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>
                    商品が見つかりませんでした
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
