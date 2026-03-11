'use client';

import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import TopBar from '@/components/layout/TopBar';
import Ticker from '@/components/layout/Ticker';
import Navbar from '@/components/layout/Navbar';

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  discountPercent: number | null;
  isHotDeal: boolean;
  description: string;
  imageUrl: string | null;
  stock: number;
  createdAt: string;
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

type SortKey = 'default' | 'newest' | 'price_asc' | 'price_desc';
type ViewMode = 'grid' | 'list';

// Price range presets
const PRICE_RANGES = [
  { label: '¥1,000未満', min: undefined, max: 999 },
  { label: '¥1,000〜¥5,000', min: 1000, max: 5000 },
  { label: '¥5,000〜¥10,000', min: 5000, max: 10000 },
  { label: '¥10,000〜¥30,000', min: 10000, max: 30000 },
  { label: '¥30,000以上', min: 30000, max: undefined },
] as const;

const CONDITION_FILTERS = ['送料無料', 'セール中', 'ポイント2倍以上', '翌日配送'] as const;
const RATING_FILTERS = ['★4以上', '★3以上'] as const;

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') ?? '');
  const [sort, setSort] = useState<SortKey>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [cartAnimating, setCartAnimating] = useState<string | null>(null);

  // Filter states
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | undefined>(undefined);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | undefined>(undefined);
  const [conditions, setConditions] = useState<Set<string>>(new Set());
  const [ratings, setRatings] = useState<Set<string>>(new Set());

  useEffect(() => {
    const cat = searchParams.get('categoryId');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Price range checkbox handler
  const handlePriceRangeToggle = (index: number) => {
    if (selectedPriceRange === index) {
      // Deselect
      setSelectedPriceRange(null);
      setAppliedMinPrice(undefined);
      setAppliedMaxPrice(undefined);
      setCustomMinPrice('');
      setCustomMaxPrice('');
    } else {
      setSelectedPriceRange(index);
      const range = PRICE_RANGES[index];
      setAppliedMinPrice(range.min);
      setAppliedMaxPrice(range.max);
      setCustomMinPrice(range.min?.toString() ?? '');
      setCustomMaxPrice(range.max?.toString() ?? '');
    }
    setPage(1);
  };

  // Custom price apply handler
  const handleApplyCustomPrice = () => {
    const min = customMinPrice ? parseInt(customMinPrice, 10) : undefined;
    const max = customMaxPrice ? parseInt(customMaxPrice, 10) : undefined;
    setAppliedMinPrice(isNaN(min as number) ? undefined : min);
    setAppliedMaxPrice(isNaN(max as number) ? undefined : max);
    // Deselect preset if custom values don't match any
    const matchIdx = PRICE_RANGES.findIndex(
      (r) => r.min === min && r.max === max,
    );
    setSelectedPriceRange(matchIdx >= 0 ? matchIdx : null);
    setPage(1);
  };

  // Condition toggle handler
  const toggleCondition = (c: string) => {
    setConditions((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c); else next.add(c);
      return next;
    });
    setPage(1);
  };

  // Rating toggle handler
  const toggleRating = (r: string) => {
    setRatings((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r); else next.add(r);
      return next;
    });
    setPage(1);
  };

  // Determine if onSale filter is active
  const onSale = conditions.has('セール中');

  // Check if any filter is active
  const hasActiveFilters = selectedCategory || search || appliedMinPrice !== undefined || appliedMaxPrice !== undefined || conditions.size > 0 || ratings.size > 0;

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory('');
    setSearch('');
    setAppliedMinPrice(undefined);
    setAppliedMaxPrice(undefined);
    setSelectedPriceRange(null);
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setConditions(new Set());
    setRatings(new Set());
    setPage(1);
  };

  // Build price label for active filter tag
  const priceFilterLabel = (() => {
    if (selectedPriceRange !== null) return PRICE_RANGES[selectedPriceRange].label;
    if (appliedMinPrice !== undefined && appliedMaxPrice !== undefined) return `¥${appliedMinPrice.toLocaleString()}〜¥${appliedMaxPrice.toLocaleString()}`;
    if (appliedMinPrice !== undefined) return `¥${appliedMinPrice.toLocaleString()}以上`;
    if (appliedMaxPrice !== undefined) return `¥${appliedMaxPrice.toLocaleString()}以下`;
    return null;
  })();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data, isLoading } = useQuery<ProductsResponse>({
    queryKey: ['products', search, page, selectedCategory, appliedMinPrice, appliedMaxPrice, onSale],
    queryFn: () =>
      api.get('/products', {
        params: {
          search, page, limit: 12,
          ...(selectedCategory && { categoryId: selectedCategory }),
          ...(appliedMinPrice !== undefined && { minPrice: appliedMinPrice }),
          ...(appliedMaxPrice !== undefined && { maxPrice: appliedMaxPrice }),
          ...(onSale && { onSale: true }),
        },
      }).then((r) => r.data),
  });

  const selectedCategoryName = categories?.find((c) => c.id === selectedCategory)?.name ?? 'すべての商品';

  const sortedProducts = (() => {
    if (!data?.data) return [];
    const list = [...data.data];
    if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sort === 'price_asc') list.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    if (sort === 'price_desc') list.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
    return list;
  })();

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push('/login'); return; }
    try {
      setCartAnimating(productId);
      await api.post('/cart/items', { productId, quantity: 1 });
      setTimeout(() => setCartAnimating(null), 2000);
    } catch {
      setCartAnimating(null);
    }
  };

  const effectivePrice = (p: Product) => p.discountPrice ?? p.price;
  const isNew = (p: Product) => {
    const created = new Date(p.createdAt);
    const now = new Date();
    return (now.getTime() - created.getTime()) < 7 * 24 * 60 * 60 * 1000;
  };

  return (
    <div style={{ background: '#f4f4f4' }}>
      {/* Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-3 pt-3">
        <nav className="flex items-center gap-1.5 text-[0.75rem] text-[#888] mb-2.5 flex-wrap">
          <Link href="/" className="text-[#0075c2] hover:underline">トップ</Link>
          <span className="text-[#ccc]">›</span>
          {selectedCategory ? (
            <>
              <Link href="/products" className="text-[#0075c2] hover:underline">商品一覧</Link>
              <span className="text-[#ccc]">›</span>
              <span>{selectedCategoryName}</span>
            </>
          ) : (
            <span>商品一覧</span>
          )}
        </nav>
      </div>

      {/* Promo strip */}
      <div className="max-w-[1200px] mx-auto px-3">
        <div
          className="flex items-center justify-between rounded px-4 py-2.5 mb-2.5"
          style={{ background: 'linear-gradient(135deg, #ff0033 0%, #ff6b35 100%)' }}
        >
          <span className="text-[0.82rem] font-bold text-white">
            🎉 期間限定セール開催中！対象商品が最大50%OFF — エントリーで全品ポイント5倍
          </span>
          <Link
            href="/hot-deals"
            className="bg-white text-[#ff0033] text-[0.75rem] font-bold px-3.5 py-1 rounded-full hover:opacity-90 transition-opacity flex-shrink-0 ml-3"
          >
            セール会場へ →
          </Link>
        </div>
      </div>

      {/* Main grid: sidebar + content */}
      <div className="max-w-[1200px] mx-auto px-3 pb-6">
        <div className="grid grid-cols-[200px_1fr] gap-3" style={{ alignItems: 'start' }}>

          {/* ====== Sidebar ====== */}
          <aside className="hidden lg:flex flex-col gap-2.5">
            {/* Category list */}
            <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden">
              <div className="bg-[#f0f0f0] px-3 py-2 text-[0.82rem] font-bold text-[#444] border-b border-[#e0e0e0]">
                カテゴリ
              </div>
              <ul className="list-none m-0 p-0">
                <li>
                  <button
                    onClick={() => { setSelectedCategory(''); setPage(1); }}
                    className={`w-full text-left px-3 py-[7px] text-[0.8rem] border-b border-[#f0f0f0] transition-colors ${
                      selectedCategory === '' ? 'bg-[#fff5f5] text-[#ff0033] font-bold' : 'text-[#333] hover:bg-[#fff5f5] hover:text-[#ff0033]'
                    }`}
                  >
                    すべてのカテゴリ
                  </button>
                </li>
                {categories?.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                      className={`w-full text-left px-3 py-[7px] text-[0.8rem] border-b border-[#f0f0f0] transition-colors ${
                        selectedCategory === cat.id ? 'bg-[#fff5f5] text-[#ff0033] font-bold' : 'text-[#333] hover:bg-[#fff5f5] hover:text-[#ff0033]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filters */}
            <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden">
              <div className="bg-[#f0f0f0] px-3 py-2 text-[0.82rem] font-bold text-[#444] border-b border-[#e0e0e0]">
                絞り込み
              </div>

              {/* Price filter */}
              <div className="px-3 py-2.5 border-b border-[#f0f0f0]">
                <p className="text-[0.78rem] font-bold text-[#333] mb-2">価格帯</p>
                <div className="flex flex-col gap-1.5">
                  {PRICE_RANGES.map((range, i) => (
                    <label key={range.label} className="flex items-center gap-1.5 text-[0.78rem] text-[#444] cursor-pointer hover:text-[#ff0033]">
                      <input
                        type="checkbox"
                        className="w-[13px] h-[13px] accent-[#ff0033]"
                        checked={selectedPriceRange === i}
                        onChange={() => handlePriceRangeToggle(i)}
                      />
                      {range.label}
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <input
                    type="text"
                    placeholder="¥ 下限"
                    value={customMinPrice}
                    onChange={(e) => setCustomMinPrice(e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCustomPrice()}
                    className="border border-[#ddd] rounded-sm px-1.5 py-1 text-[0.78rem] w-[66px] outline-none focus:border-[#ff0033]"
                  />
                  <span className="text-[0.78rem] text-[#888]">〜</span>
                  <input
                    type="text"
                    placeholder="¥ 上限"
                    value={customMaxPrice}
                    onChange={(e) => setCustomMaxPrice(e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCustomPrice()}
                    className="border border-[#ddd] rounded-sm px-1.5 py-1 text-[0.78rem] w-[66px] outline-none focus:border-[#ff0033]"
                  />
                </div>
                <button
                  onClick={handleApplyCustomPrice}
                  className="w-full mt-2 bg-[#ff0033] hover:bg-[#cc0029] text-white border-none py-1.5 rounded-sm text-[0.75rem] font-bold transition-colors cursor-pointer"
                >
                  適用
                </button>
              </div>

              {/* Condition filter */}
              <div className="px-3 py-2.5 border-b border-[#f0f0f0]">
                <p className="text-[0.78rem] font-bold text-[#333] mb-2">条件</p>
                <div className="flex flex-col gap-1.5">
                  {CONDITION_FILTERS.map((label) => (
                    <label key={label} className="flex items-center gap-1.5 text-[0.78rem] text-[#444] cursor-pointer hover:text-[#ff0033]">
                      <input
                        type="checkbox"
                        className="w-[13px] h-[13px] accent-[#ff0033]"
                        checked={conditions.has(label)}
                        onChange={() => toggleCondition(label)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating filter */}
              <div className="px-3 py-2.5">
                <p className="text-[0.78rem] font-bold text-[#333] mb-2">評価</p>
                <div className="flex flex-col gap-1.5">
                  {RATING_FILTERS.map((label) => (
                    <label key={label} className="flex items-center gap-1.5 text-[0.78rem] text-[#444] cursor-pointer hover:text-[#ff0033]">
                      <input
                        type="checkbox"
                        className="w-[13px] h-[13px] accent-[#ff0033]"
                        checked={ratings.has(label)}
                        onChange={() => toggleRating(label)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Premium member banner */}
            <div
              className="rounded p-4 text-center text-white"
              style={{ background: 'linear-gradient(135deg, #0075c2, #00b4d8)' }}
            >
              <p className="text-[0.82rem] font-bold mb-1">プレミアム会員</p>
              <p className="text-[0.72rem] opacity-90 mb-3">送料無料＆ポイント3倍の特典付き</p>
              <button className="bg-white text-[#0075c2] text-[0.75rem] font-bold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                詳しく見る
              </button>
            </div>
          </aside>

          {/* ====== Main content ====== */}
          <div className="min-w-0">
            {/* Mobile category pills */}
            <div className="lg:hidden overflow-x-auto mb-2.5">
              <div className="flex gap-1.5 pb-1">
                <button
                  onClick={() => { setSelectedCategory(''); setPage(1); }}
                  className={`flex-shrink-0 text-[0.75rem] px-3 py-1 border rounded-full cursor-pointer transition-all ${
                    selectedCategory === '' ? 'bg-[#ff0033] text-white border-[#ff0033]' : 'border-[#ddd] text-[#444] hover:border-[#ff0033] hover:text-[#ff0033] hover:bg-[#fff5f5]'
                  }`}
                >
                  すべて
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                    className={`flex-shrink-0 text-[0.75rem] px-3 py-1 border rounded-full cursor-pointer transition-all ${
                      selectedCategory === cat.id ? 'bg-[#ff0033] text-white border-[#ff0033]' : 'border-[#ddd] text-[#444] hover:border-[#ff0033] hover:text-[#ff0033] hover:bg-[#fff5f5]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategory pills (desktop) */}
            <div className="hidden lg:flex bg-white border border-[#e0e0e0] rounded px-3 py-2.5 flex-wrap gap-1.5 mb-2">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={`text-[0.75rem] px-3 py-1 border rounded-full cursor-pointer transition-all ${
                  selectedCategory === '' ? 'bg-[#ff0033] text-white border-[#ff0033]' : 'border-[#ddd] text-[#444] hover:border-[#ff0033] hover:text-[#ff0033] hover:bg-[#fff5f5]'
                }`}
              >
                すべて
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                  className={`text-[0.75rem] px-3 py-1 border rounded-full cursor-pointer transition-all ${
                    selectedCategory === cat.id ? 'bg-[#ff0033] text-white border-[#ff0033]' : 'border-[#ddd] text-[#444] hover:border-[#ff0033] hover:text-[#ff0033] hover:bg-[#fff5f5]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Result bar */}
            <div className="bg-white border border-[#e0e0e0] rounded px-3.5 py-2.5 mb-2 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {/* Search input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="キーワード検索..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="border border-[#ddd] rounded-sm pl-7 pr-3 py-1 text-[0.78rem] w-[180px] outline-none focus:border-[#ff0033]"
                  />
                  <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <span className="text-[0.82rem] text-[#555]">
                  <strong className="text-[#ff0033] text-[1rem]">{data?.meta.total ?? 0}</strong> 件の商品
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort buttons */}
                <div className="flex gap-1">
                  {([
                    ['default', 'おすすめ順'],
                    ['newest', '新着順'],
                    ['price_asc', '価格が安い順'],
                    ['price_desc', '価格が高い順'],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSort(key)}
                      className={`text-[0.75rem] px-2.5 py-1 border rounded-sm transition-all ${
                        sort === key
                          ? 'bg-[#ff0033] text-white border-[#ff0033]'
                          : 'border-[#ddd] text-[#444] hover:bg-[#ff0033] hover:text-white hover:border-[#ff0033]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* View toggle */}
                <div className="flex">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`w-7 h-7 border rounded-sm text-[0.82rem] transition-all ${
                      viewMode === 'grid' ? 'bg-[#ff0033] text-white border-[#ff0033]' : 'border-[#ddd] text-[#444]'
                    }`}
                    title="グリッド表示"
                  >
                    ⊞
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`w-7 h-7 border rounded-sm text-[0.82rem] transition-all ${
                      viewMode === 'list' ? 'bg-[#ff0033] text-white border-[#ff0033]' : 'border-[#ddd] text-[#444]'
                    }`}
                    title="リスト表示"
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter tags */}
            {hasActiveFilters && (
              <div className="flex items-center gap-1.5 flex-wrap mb-2 text-[0.75rem]">
                <span className="text-[#888]">絞り込み:</span>
                {selectedCategory && (
                  <span
                    className="bg-[#fff0f0] border border-[#ffcccc] text-[#cc0033] px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-[#ffe0e0]"
                    onClick={() => { setSelectedCategory(''); setPage(1); }}
                  >
                    {selectedCategoryName} ✕
                  </span>
                )}
                {search && (
                  <span
                    className="bg-[#fff0f0] border border-[#ffcccc] text-[#cc0033] px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-[#ffe0e0]"
                    onClick={() => { setSearch(''); setPage(1); }}
                  >
                    「{search}」 ✕
                  </span>
                )}
                {priceFilterLabel && (
                  <span
                    className="bg-[#fff0f0] border border-[#ffcccc] text-[#cc0033] px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-[#ffe0e0]"
                    onClick={() => {
                      setAppliedMinPrice(undefined);
                      setAppliedMaxPrice(undefined);
                      setSelectedPriceRange(null);
                      setCustomMinPrice('');
                      setCustomMaxPrice('');
                      setPage(1);
                    }}
                  >
                    {priceFilterLabel} ✕
                  </span>
                )}
                {[...conditions].map((c) => (
                  <span
                    key={c}
                    className="bg-[#fff0f0] border border-[#ffcccc] text-[#cc0033] px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-[#ffe0e0]"
                    onClick={() => toggleCondition(c)}
                  >
                    {c} ✕
                  </span>
                ))}
                {[...ratings].map((r) => (
                  <span
                    key={r}
                    className="bg-[#fff0f0] border border-[#ffcccc] text-[#cc0033] px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-[#ffe0e0]"
                    onClick={() => toggleRating(r)}
                  >
                    {r} ✕
                  </span>
                ))}
                <span
                  className="text-[#0075c2] cursor-pointer hover:underline"
                  onClick={clearAllFilters}
                >
                  すべて解除
                </span>
              </div>
            )}

            {/* Product area */}
            {isLoading ? (
              <div className="grid grid-cols-4 gap-px bg-[#e8e8e8]">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white p-3">
                    <div className="w-full aspect-square bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8] rounded-sm mb-2 animate-pulse" />
                    <div className="h-3 bg-[#f0f0f0] rounded w-2/3 mb-2 animate-pulse" />
                    <div className="h-4 bg-[#f0f0f0] rounded w-full mb-1.5 animate-pulse" />
                    <div className="h-5 bg-[#f0f0f0] rounded w-1/3 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="bg-white border border-[#e0e0e0] rounded text-center py-16">
                <p className="text-[#aaa] text-3xl mb-2">🔍</p>
                <p className="text-[#555] font-bold text-[0.9rem]">商品が見つかりませんでした</p>
                <p className="text-[#888] text-[0.78rem] mt-1">別のキーワードやカテゴリをお試しください</p>
              </div>
            ) : (
              <>
                {/* Grid view */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[#e8e8e8]">
                    {sortedProducts.map((product) => (
                      <Link
                        href={`/products/${product.id}`}
                        key={product.id}
                        className="bg-white p-3 cursor-pointer relative transition-shadow hover:shadow-[inset_0_0_0_2px_#ff0033] hover:z-[1] group"
                      >
                        {/* Image */}
                        <div className="w-full aspect-square bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8] rounded-sm mb-2 relative overflow-hidden">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-4xl">📦</div>
                          )}
                          {/* Badges */}
                          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                            {isNew(product) && (
                              <span className="bg-[#0075c2] text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-sm">NEW</span>
                            )}
                            {product.discountPercent && product.discountPercent > 0 && (
                              <span className="bg-[#ff0033] text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-sm">SALE</span>
                            )}
                            {product.isHotDeal && (
                              <span className="bg-[#f5a623] text-[#333] text-[0.6rem] font-bold px-1.5 py-0.5 rounded-sm">人気</span>
                            )}
                          </div>
                        </div>

                        {/* Store name */}
                        <p className="text-[0.68rem] text-[#888] mb-0.5">モールショップ公式</p>

                        {/* Product name */}
                        <h3 className="text-[0.78rem] text-[#333] group-hover:text-[#ff0033] transition-colors leading-snug mb-1.5 line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-[1.05rem] font-bold text-[#e00]">
                            ¥{effectivePrice(product).toLocaleString()}
                          </span>
                          {product.discountPrice && (
                            <>
                              <span className="text-[0.72rem] text-[#999] line-through">¥{product.price.toLocaleString()}</span>
                              <span className="bg-[#ff0033] text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-sm">
                                {product.discountPercent}%OFF
                              </span>
                            </>
                          )}
                        </div>

                        {/* Review placeholder */}
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[0.68rem] text-[#f5a623]" style={{ letterSpacing: '-1px' }}>★★★★☆</span>
                          <span className="text-[0.68rem] text-[#888]">(24)</span>
                        </div>

                        {/* Points */}
                        <p className="text-[0.68rem] text-[#c63] mt-0.5">
                          {Math.floor(effectivePrice(product) * 0.01)}pt還元
                        </p>

                        {/* Tags */}
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          <span className="border border-[#0075c2] text-[#0075c2] text-[0.62rem] px-1 py-px rounded-sm">送料無料</span>
                          {product.stock > 0 && (
                            <span className="border border-[#ddd] text-[#666] text-[0.62rem] px-1 py-px rounded-sm">在庫あり</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* List view */}
                {viewMode === 'list' && (
                  <div className="flex flex-col gap-px bg-[#e8e8e8]">
                    {sortedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white flex gap-3.5 p-3.5 cursor-pointer transition-colors hover:bg-[#fffafa] group"
                        onClick={() => router.push(`/products/${product.id}`)}
                      >
                        {/* Image */}
                        <div className="w-[110px] min-w-[110px] aspect-square bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8] rounded-sm relative overflow-hidden flex-shrink-0">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-[2.8rem]">📦</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.7rem] text-[#888]">モールショップ公式</p>
                          <h3 className="text-[0.9rem] font-medium text-[#333] group-hover:text-[#ff0033] transition-colors mb-1">
                            {product.name}
                          </h3>
                          <p className="text-[0.78rem] text-[#666] line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[0.68rem] text-[#f5a623]" style={{ letterSpacing: '-1px' }}>★★★★☆</span>
                            <span className="text-[0.68rem] text-[#888]">(24)</span>
                          </div>
                        </div>

                        {/* Right side */}
                        <div className="min-w-[150px] text-right flex flex-col items-end gap-1 justify-center flex-shrink-0">
                          <span className="text-[1.2rem] font-bold text-[#e00]">
                            ¥{effectivePrice(product).toLocaleString()}
                          </span>
                          {product.discountPrice && (
                            <>
                              <span className="bg-[#ff0033] text-white text-[0.65rem] font-bold px-1.5 py-0.5 rounded-sm">
                                {product.discountPercent}%OFF
                              </span>
                              <span className="text-[0.78rem] text-[#999] line-through">¥{product.price.toLocaleString()}</span>
                            </>
                          )}
                          <span className="text-[0.7rem] text-[#c63]">
                            {Math.floor(effectivePrice(product) * 0.01)}pt還元
                          </span>
                          <button
                            onClick={(e) => handleAddToCart(e, product.id)}
                            disabled={product.stock === 0}
                            className={`mt-1 border-none px-3.5 py-[7px] rounded-sm text-[0.78rem] font-bold transition-colors ${
                              cartAnimating === product.id
                                ? 'bg-[#2e7d32] text-white'
                                : product.stock === 0
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-[#ff0033] text-white hover:bg-[#cc0029]'
                            }`}
                          >
                            {cartAnimating === product.id ? '✓ 追加済み' : product.stock === 0 ? '在庫切れ' : 'カートに入れる'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {data && data.meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 pt-4 pb-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="min-w-[32px] h-8 border border-[#ddd] bg-white rounded-sm text-[0.82rem] text-[#444] px-1.5 transition-all hover:border-[#ff0033] hover:text-[#ff0033] disabled:text-[#ccc] disabled:pointer-events-none"
                    >
                      ‹
                    </button>
                    {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((p) => {
                      if (
                        data.meta.totalPages <= 7 ||
                        p === 1 ||
                        p === data.meta.totalPages ||
                        Math.abs(p - page) <= 1
                      ) {
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`min-w-[32px] h-8 border rounded-sm text-[0.82rem] px-1.5 transition-all ${
                              p === page
                                ? 'bg-[#ff0033] text-white border-[#ff0033] font-bold'
                                : 'border-[#ddd] bg-white text-[#444] hover:border-[#ff0033] hover:text-[#ff0033]'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      }
                      if (p === 2 || p === data.meta.totalPages - 1) {
                        return <span key={p} className="text-[#aaa] px-1 text-[0.82rem]">…</span>;
                      }
                      return null;
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                      disabled={page === data.meta.totalPages}
                      className="min-w-[32px] h-8 border border-[#ddd] bg-white rounded-sm text-[0.82rem] text-[#444] px-1.5 transition-all hover:border-[#ff0033] hover:text-[#ff0033] disabled:text-[#ccc] disabled:pointer-events-none"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <>
      <TopBar />
      <Ticker />
      <Navbar />
      <Suspense>
        <ProductsContent />
      </Suspense>
    </>
  );
}
