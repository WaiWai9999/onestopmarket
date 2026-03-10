'use client';

import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/axios';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
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

type SortKey = 'default' | 'price_asc' | 'price_desc';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') ?? '');
  const [sort, setSort] = useState<SortKey>('default');

  useEffect(() => {
    const cat = searchParams.get('categoryId');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

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

  const selectedCategoryName = categories?.find((c) => c.id === selectedCategory)?.name;

  const sortedProducts = (() => {
    if (!data?.data) return [];
    const list = [...data.data];
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    return list;
  })();

  return (
    <>
      {/* Hero header */}
      <div className="bg-[#1a6b1f] text-white p-6 text-white px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-2">
            {selectedCategoryName ?? '商品一覧'}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
            毎日をもっと快適に。
          </h1>
          <p className="text-white/70 text-sm max-w-lg mb-6">
            最新の商品カタログをカテゴリ別にチェック。お得な商品や定番アイテムをすぐに見つけられます。
          </p>

          {/* Search + sort bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 max-w-xl">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="商品を検索..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-gray-800 border border-gray-700 rounded-full pl-10 pr-5 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white"
              />
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 font-semibold">{data?.meta.total ?? 0}</span>
              <span className="text-gray-600 text-xs">件</span>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-gray-800 border border-gray-700 rounded-full px-4 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-white cursor-pointer"
            >
              <option value="default">おすすめ順</option>
              <option value="price_asc">価格: 安い順</option>
              <option value="price_desc">価格: 高い順</option>
            </select>
          </div>
        </div>
      </div>

      {/* Body: sidebar + grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">カテゴリで絞り込む</p>
            <nav className="flex flex-col gap-0.5">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === ''
                    ? 'bg-[#1a6b1f] text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                すべてのカテゴリ
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-[#1a6b1f] text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </nav>
          </aside>

          {/* Mobile category pills */}
          <div className="lg:hidden w-full -mx-6 px-6 mb-4 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedCategory === '' ? 'bg-[#1a6b1f] text-white border-[#1a6b1f]' : 'bg-white border-gray-200 text-gray-600'
                }`}
              >すべて</button>
              {categories?.map((cat) => (
                <button key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    selectedCategory === cat.id ? 'bg-[#1a6b1f] text-white border-[#1a6b1f]' : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >{cat.name}</button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-4xl mb-3">🔍</p>
                <p className="text-gray-500 font-medium">商品が見つかりませんでした</p>
                <p className="text-gray-400 text-sm mt-1">別のキーワードやカテゴリをお試しください</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {sortedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#1a6b1f] transition-all flex flex-col"
                    >
                      {/* Image */}
                      <div className="h-48 bg-gray-100 relative overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                        )}
                        <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                          {product.category.name}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="p-4 flex flex-col gap-1.5 flex-1">
                        <h2 className="font-bold text-gray-900 text-sm leading-snug">{product.name}</h2>
                        {product.description && (
                          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{product.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-3">
                          <p className="text-[#1a6b1f] font-bold text-sm">¥{product.price.toLocaleString()}</p>
                          <Link
                            href={`/products/${product.id}`}
                            className="text-xs font-semibold text-white bg-[#1a6b1f] hover:bg-[#155318] px-3 py-1.5 rounded-full transition-colors"
                          >
                            詳細を見る
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {data && data.meta.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="w-9 h-9 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-[#1a6b1f] disabled:opacity-30 transition-all">‹</button>
                    {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${p === page ? 'bg-[#1a6b1f] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1a6b1f]'}`}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages}
                      className="w-9 h-9 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-[#1a6b1f] disabled:opacity-30 transition-all">›</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
