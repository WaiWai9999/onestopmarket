'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

interface ProductsResponse {
  data: Product[];
  meta: { total: number; page: number; totalPages: number };
}

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data, isLoading } = useQuery<ProductsResponse>({
    queryKey: ['products', search, page, selectedCategory],
    queryFn: () =>
      api.get('/products', {
        params: { search, page, limit: 12, ...(selectedCategory && { categoryId: selectedCategory }) },
      }).then((r) => r.data),
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-500 text-sm mt-1">{data?.meta.total ?? 0} products found</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full border border-gray-200 rounded-full px-5 py-3 text-gray-900 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => { setSelectedCategory(''); setPage(1); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === ''
              ? 'bg-amber-400 text-gray-900 shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-600'
          }`}
        >
          All
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-400 text-gray-900 shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-600'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <p className="text-center text-gray-500 py-16">Loading...</p>
      ) : data?.data.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {data?.data.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-amber-400 transition-all group"
              >
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-amber-500 font-medium mb-1">{product.category.name}</p>
                  <h2 className="font-semibold text-gray-800 text-sm mb-2 truncate">{product.name}</h2>
                  <p className="text-amber-500 font-bold">¥{product.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                    p === page
                      ? 'bg-amber-400 text-gray-900 shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
