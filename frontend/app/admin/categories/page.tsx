'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface Category {
  id: string;
  name: string;
  slug: string;
}

type FormState = {
  name: string;
  slug: string;
};

const emptyForm: FormState = {
  name: '',
  slug: '',
};

export default function AdminCategoriesPage() {
  const { user, isAdmin } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!user || !isAdmin()) router.push('/');
  }, [user, isAdmin, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      setSaveError('');

      if (!editingId) {
        await api.post('/categories', {
          name: form.name,
          slug: form.slug,
        });
      } else {
        await api.patch(`/categories/${editingId}`, {
          name: form.name,
          slug: form.slug,
        });
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
      const msg = err instanceof Error ? err.message : 'Failed to save category';
      setSaveError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
    });
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  if (isLoading)
    return <p className="py-16 text-center text-gray-400">Loading...</p>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>

        <button
          onClick={() => {
            if (showForm) handleCancel();
            else setShowForm(true);
          }}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            showForm
              ? 'border border-gray-300 text-gray-600 hover:border-gray-400'
              : 'bg-[#ff0033]/10 text-[#ff0033] hover:bg-[#ff0033]/20'
          }`}
        >
          {showForm ? 'Cancel' : '+ New Category'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4"
        >
          <h2 className="font-semibold text-gray-800">
            {editingId ? 'Edit Category' : 'New Category'}
          </h2>

          {saveError && (
            <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
              {saveError}
            </p>
          )}

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Category Name
            </label>

            <input
              required
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;

                setForm((prev) => ({
                  ...prev,
                  name,
                  slug:
                    prev.slug ||
                    (name.length > 0 ? name.charAt(0).toUpperCase() : ''),
                }));
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ff0033]"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Slug
            </label>

            <input
              required
              value={form.slug}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  slug: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ff0033]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="bg-[#ff0033] text-white font-semibold px-6 py-2 rounded-full hover:bg-[#cc0029] disabled:opacity-50 transition-all"
          >
            {saveMutation.isPending
              ? 'Saving...'
              : editingId
              ? 'Update Category'
              : 'Save Category'}
          </button>
        </form>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#ff0033]/5">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Name
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Slug
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data?.map((category: Category) => (
              <tr
                key={category.id}
                className="hover:bg-[#ff0033]/5 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {category.name}
                </td>

                <td className="px-4 py-3 text-gray-600">{category.slug}</td>

                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-[#ff0033] hover:text-[#cc0029] text-sm font-medium"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Delete this category?'))
                          deleteMutation.mutate(category.id);
                      }}
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