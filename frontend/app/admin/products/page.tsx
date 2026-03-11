'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: { id: string; name: string };
  categoryId: string;
}

type FormState = { name: string; description: string; price: string; stock: string; categoryId: string };

const emptyForm: FormState = { name: '', description: '', price: '', stock: '', categoryId: '' };

export default function AdminProductsPage() {
  const { user, isAdmin } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!user || !isAdmin()) router.push('/');
  }, [user, isAdmin, router]);

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
      const isNew = !productId;

      if (!productId) {
        const { data } = await api.post('/products', {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock),
          categoryId: form.categoryId,
        });
        productId = data.id;
      } else {
        await api.patch(`/products/${productId}`, {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock),
          categoryId: form.categoryId,
        });
      }
      if (imageFile && productId) {
        const formData = new FormData();
        formData.append('image', imageFile);
        try {
          await api.post(`/products/${productId}/image`, formData);
        } catch (err) {
          if (isNew) await api.delete(`/products/${productId}`);
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
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      setSaveError(msg);
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFile) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(imageFile.type)) {
        setSaveError('Unsupported image format. Please use JPEG, PNG, or WebP.');
        return;
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        setSaveError('Image is too large. Maximum size is 5MB.');
        return;
      }
    }
    saveMutation.mutate();
  };

  if (isLoading) return <p className="py-16 text-center text-gray-400">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button
          onClick={() => { if (showForm) { handleCancel(); } else { setShowForm(true); } }}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            showForm
              ? 'border border-gray-300 text-gray-600 hover:border-gray-400'
              : 'bg-[#ff0033]/10 text-[#ff0033] hover:bg-[#ff0033]/20'
          }`}
        >
          {showForm ? 'Cancel' : '+ New Product'}
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-800">{editingId ? 'Edit Product' : 'New Product'}</h2>
          {saveError && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ff0033]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ff0033]"
              >
                <option value="">Select category</option>
                {categories?.map((c: { id: string; name: string }) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Price (¥)</label>
              <input
                required
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ff0033]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Stock</label>
              <input
                required
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ff0033]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ff0033]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Image {editingId && <span className="text-gray-400 font-normal">(leave empty to keep current)</span>}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="text-sm text-gray-600"
            />
          </div>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="bg-[#ff0033] text-white font-semibold px-6 py-2 rounded-full hover:bg-[#cc0029] disabled:opacity-50 transition-all"
          >
            {saveMutation.isPending ? 'Saving...' : editingId ? 'Update Product' : 'Save Product'}
          </button>
        </form>
      )}

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
          <tr className="bg-[#ff0033]/5">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Image</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.data.map((product: Product) => (
              <tr key={product.id} className="hover:bg-[#ff0033]/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="w-11 h-11 bg-gray-100 rounded-lg relative overflow-hidden">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-xs">N/A</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-[#ff0033]/10 text-[#ff0033] px-2 py-0.5 rounded-full font-medium">
                    {product.category.name}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-800">¥{product.price.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-semibold ${product.stock === 0 ? 'text-red-500' : product.stock < 5 ? 'text-yellow-500' : 'text-gray-700'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-[#ff0033] hover:text-[#cc0029] text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(product.id); }}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
