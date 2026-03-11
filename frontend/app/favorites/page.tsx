'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import TopBar from '@/components/layout/TopBar';
import Ticker from '@/components/layout/Ticker';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
  createdAt: string;
  category: { id: string; name: string; slug: string };
}

interface Favorite {
  id: string;
  productId: string;
  createdAt: string;
  product: Product;
}

interface ProductsResponse {
  data: Product[];
  meta: { total: number; page: number; totalPages: number };
}

type TabId = 'all' | 'electronics' | 'fashion' | 'beauty' | 'other' | 'dropped' | 'soldout';
type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'drop';
type ViewMode = 'grid' | 'list';

const CATEGORY_TABS: { id: TabId; label: string; icon?: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'electronics', label: '💻 家電・PC' },
  { id: 'fashion', label: '👗 ファッション' },
  { id: 'beauty', label: '💄 美容・健康' },
  { id: 'other', label: 'その他' },
  { id: 'dropped', label: '📉 値下がり' },
  { id: 'soldout', label: '売り切れ' },
];

const FOLDERS = [
  { icon: '📂', name: 'すべて', count: 0 },
  { icon: '⭐', name: '買いたいもの', count: 0 },
  { icon: '🎁', name: 'プレゼント候補', count: 0 },
  { icon: '🏠', name: 'インテリア', count: 0 },
  { icon: '💼', name: '仕事用', count: 0 },
];

const TAGS = ['すべて', '送料無料', '値下がり', 'セール中', 'ポイント2倍', '翌日配送', '在庫わずか'];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: '登録日が新しい順' },
  { value: 'price_asc', label: '価格が安い順' },
  { value: 'price_desc', label: '価格が高い順' },
  { value: 'rating', label: '評価が高い順' },
  { value: 'drop', label: '値下がり幅が大きい順' },
];

const effectivePrice = (p: Product) => p.discountPrice ?? p.price;

export default function FavoritesPage() {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [activeFolder, setActiveFolder] = useState(0);
  const [activeTag, setActiveTag] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [allSelected, setAllSelected] = useState(false);
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (_hasHydrated && !user) router.push('/login');
  }, [_hasHydrated, user, router]);

  const { data: favorites = [], isLoading } = useQuery<Favorite[]>({
    queryKey: ['favorites'],
    queryFn: () => api.get('/favorites').then((r) => r.data),
    enabled: !!user,
  });

  const { data: recentProducts } = useQuery<ProductsResponse>({
    queryKey: ['recent-products'],
    queryFn: () => api.get('/products', { params: { limit: 7, sort: 'newest' } }).then((r) => r.data),
    enabled: !!user,
  });

  const removeFavMutation = useMutation({
    mutationFn: (productId: string) => api.delete(`/favorites/${productId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => api.post('/cart/items', { productId, quantity: 1 }),
    onSuccess: (_data, productId) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setAddedToCart((prev) => new Set(prev).add(productId));
      showToast('カートに追加しました');
    },
  });

  const addFavMutation = useMutation({
    mutationFn: (productId: string) => api.post(`/favorites/${productId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  if (!_hasHydrated || !user) return null;

  // Filter favorites
  let filtered = [...favorites];
  if (activeTab === 'soldout') {
    filtered = filtered.filter((f) => f.product.stock === 0);
  } else if (activeTab === 'dropped') {
    filtered = filtered.filter((f) => f.product.discountPrice !== null);
  } else if (activeTab === 'electronics') {
    filtered = filtered.filter((f) => ['electronics', '家電', 'PC'].some((k) => f.product.category?.name?.includes(k) || f.product.category?.slug?.includes(k)));
  } else if (activeTab === 'fashion') {
    filtered = filtered.filter((f) => ['fashion', 'ファッション'].some((k) => f.product.category?.name?.includes(k) || f.product.category?.slug?.includes(k)));
  } else if (activeTab === 'beauty') {
    filtered = filtered.filter((f) => ['beauty', '美容', '健康'].some((k) => f.product.category?.name?.includes(k) || f.product.category?.slug?.includes(k)));
  } else if (activeTab === 'other') {
    filtered = filtered.filter((f) => {
      const catName = f.product.category?.name ?? '';
      const catSlug = f.product.category?.slug ?? '';
      return !['electronics', '家電', 'PC', 'fashion', 'ファッション', 'beauty', '美容', '健康'].some((k) => catName.includes(k) || catSlug.includes(k));
    });
  }

  // Tag filtering
  if (activeTag === 1) filtered = filtered.filter((f) => effectivePrice(f.product) >= 3000); // 送料無料
  if (activeTag === 2) filtered = filtered.filter((f) => f.product.discountPrice !== null); // 値下がり
  if (activeTag === 3) filtered = filtered.filter((f) => f.product.isHotDeal); // セール中
  if (activeTag === 6) filtered = filtered.filter((f) => f.product.stock > 0 && f.product.stock <= 5); // 在庫わずか

  // Sort
  if (sortKey === 'price_asc') filtered.sort((a, b) => effectivePrice(a.product) - effectivePrice(b.product));
  else if (sortKey === 'price_desc') filtered.sort((a, b) => effectivePrice(b.product) - effectivePrice(a.product));
  else if (sortKey === 'drop') filtered.sort((a, b) => {
    const dropA = a.product.discountPrice ? a.product.price - a.product.discountPrice : 0;
    const dropB = b.product.discountPrice ? b.product.price - b.product.discountPrice : 0;
    return dropB - dropA;
  });
  // newest is default (already ordered by createdAt desc from API)

  // Tab counts
  const tabCounts: Record<TabId, number> = {
    all: favorites.length,
    electronics: favorites.filter((f) => ['electronics', '家電', 'PC'].some((k) => f.product.category?.name?.includes(k) || f.product.category?.slug?.includes(k))).length,
    fashion: favorites.filter((f) => ['fashion', 'ファッション'].some((k) => f.product.category?.name?.includes(k) || f.product.category?.slug?.includes(k))).length,
    beauty: favorites.filter((f) => ['beauty', '美容', '健康'].some((k) => f.product.category?.name?.includes(k) || f.product.category?.slug?.includes(k))).length,
    other: favorites.length - favorites.filter((f) => {
      const catName = f.product.category?.name ?? '';
      const catSlug = f.product.category?.slug ?? '';
      return ['electronics', '家電', 'PC', 'fashion', 'ファッション', 'beauty', '美容', '健康'].some((k) => catName.includes(k) || catSlug.includes(k));
    }).length,
    dropped: favorites.filter((f) => f.product.discountPrice !== null).length,
    soldout: favorites.filter((f) => f.product.stock === 0).length,
  };

  // Pagination
  const PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginatedItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const droppedItems = favorites.filter((f) => f.product.discountPrice !== null);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
      setAllSelected(false);
    } else {
      const availableIds = paginatedItems.filter((f) => f.product.stock > 0).map((f) => f.product.id);
      setSelectedItems(new Set(availableIds));
      setAllSelected(true);
    }
  };

  const toggleItem = (productId: string) => {
    const next = new Set(selectedItems);
    if (next.has(productId)) next.delete(productId);
    else next.add(productId);
    setSelectedItems(next);
    setAllSelected(next.size === paginatedItems.filter((f) => f.product.stock > 0).length);
  };

  const removeSelected = () => {
    selectedItems.forEach((productId) => removeFavMutation.mutate(productId));
    setSelectedItems(new Set());
    setAllSelected(false);
    showToast(`${selectedItems.size}件をお気に入りから削除しました`);
  };

  const addAllToCart = () => {
    const availableItems = paginatedItems.filter((f) => f.product.stock > 0);
    availableItems.forEach((f) => {
      if (!addedToCart.has(f.product.id)) {
        addToCartMutation.mutate(f.product.id);
      }
    });
    showToast(`${availableItems.length}件をカートに追加しました`);
  };

  // Price drop shortcut items (top 3 with biggest discount)
  const priceDropItems = [...favorites]
    .filter((f) => f.product.discountPrice !== null)
    .map((f) => ({ ...f, drop: f.product.price - f.product.discountPrice! }))
    .sort((a, b) => b.drop - a.drop)
    .slice(0, 3);

  // Folder counts (simulated — first folder = all)
  const folderCounts = [...FOLDERS];
  folderCounts[0].count = favorites.length;

  // Loading
  if (isLoading) {
    return (
      <>
        <TopBar />
        <Ticker />
        <Navbar />
        <div style={{ background: '#f4f4f4' }}>
          <div className="max-w-[1200px] mx-auto px-3 py-3">
            <div className="bg-white border border-[#e0e0e0] rounded p-4 mb-3">
              <div className="h-5 bg-[#f0f0f0] rounded w-48 animate-pulse" />
            </div>
            <div className="grid grid-cols-5 gap-px bg-[#e8e8e8] rounded overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white p-2.5">
                  <div className="w-full aspect-square bg-[#f0f0f0] rounded mb-2 animate-pulse" />
                  <div className="h-3 bg-[#f0f0f0] rounded w-3/4 mb-1 animate-pulse" />
                  <div className="h-4 bg-[#f0f0f0] rounded w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar />
      <Ticker />
      <Navbar />
      <div style={{ background: '#f4f4f4' }}>
        <div className="max-w-[1200px] mx-auto px-3 py-3">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[0.75rem] text-[#888] mb-2.5">
            <Link href="/" className="text-[#0075c2] hover:underline">トップ</Link>
            <span className="text-[#ccc]">›</span>
            <span>お気に入り</span>
          </nav>

          {/* Page header */}
          <div className="bg-white border border-[#e0e0e0] rounded py-3.5 px-4 mb-3 flex items-center justify-between flex-wrap gap-2.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-[1.15rem] font-bold text-[#222] flex items-center gap-1.5">
                <span className="text-[#ff0033]">♥</span> お気に入り
              </h1>
              <span className="bg-[#ff0033] text-white text-[0.68rem] font-bold px-2 py-0.5 rounded-[20px]">
                {favorites.length}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <button
                onClick={() => showToast('フォルダを作成しました')}
                className="text-[0.78rem] py-1.5 px-3.5 rounded-[3px] cursor-pointer bg-white border border-[#ddd] text-[#555] hover:border-[#ff0033] hover:text-[#ff0033] transition-all"
              >
                ＋ フォルダ作成
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('リンクをコピーしました'); }}
                className="text-[0.78rem] py-1.5 px-3.5 rounded-[3px] cursor-pointer bg-white border border-[#ddd] text-[#555] hover:border-[#ff0033] hover:text-[#ff0033] transition-all"
              >
                📤 リストを共有
              </button>
              <button
                onClick={addAllToCart}
                className="text-[0.78rem] py-1.5 px-3.5 rounded-[3px] cursor-pointer bg-[#ff0033] border border-[#ff0033] text-white font-bold hover:bg-[#cc0029] transition-all"
              >
                🛒 全てカートに入れる
              </button>
            </div>
          </div>

          {/* Price drop alert banner */}
          {droppedItems.length > 0 && (
            <div
              className="flex items-center gap-3 rounded mb-3 py-2.5 px-3.5"
              style={{ background: 'linear-gradient(90deg, #fff0f0, #fff8f8)', border: '1px solid #ffcccc', borderLeft: '4px solid #ff0033' }}
            >
              <span className="text-[1.4rem] flex-shrink-0">📉</span>
              <div className="flex-1 min-w-0">
                <p className="text-[0.82rem] font-bold text-[#cc0000]">{droppedItems.length}件の商品が値下がりしました！</p>
                <p className="text-[0.75rem] text-[#888] mt-0.5">お気に入りに登録した商品の価格が下がっています</p>
              </div>
              <span
                className="text-[0.75rem] text-[#0075c2] cursor-pointer whitespace-nowrap flex-shrink-0 hover:underline"
                onClick={() => setActiveTab('dropped')}
              >
                値下がり商品を見る ›
              </span>
            </div>
          )}

          {/* Category tabs */}
          <div className="bg-white border border-[#e0e0e0] rounded mb-3 overflow-hidden">
            <div className="flex border-b-2 border-[#ff0033] overflow-x-auto nav-scroll">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setPage(1); }}
                  className={`px-5 py-2.5 text-[0.82rem] whitespace-nowrap cursor-pointer border-b-[3px] -mb-[2px] transition-colors flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'text-[#ff0033] border-b-[#ff0033] font-bold'
                      : 'text-[#555] border-b-transparent font-medium hover:text-[#ff0033]'
                  }`}
                >
                  {tab.label}
                  {tabCounts[tab.id] > 0 && (
                    <span className={`text-[0.6rem] font-bold px-[5px] py-px rounded-[10px] text-white ${
                      tab.id === 'soldout' ? 'bg-[#aaa]' : 'bg-[#ff0033]'
                    }`}>
                      {tabCounts[tab.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main 2-column layout */}
          <div className="grid grid-cols-[220px_1fr] gap-3 items-start">
            {/* ===== Sidebar ===== */}
            <div>
              {/* Folder list */}
              <div className="bg-white border border-[#e0e0e0] rounded mb-2.5 overflow-hidden">
                <div className="bg-[#f8f8f8] px-3 py-[9px] text-[0.82rem] font-bold text-[#333] border-b-2 border-[#ff0033] flex justify-between items-center">
                  <span>フォルダ</span>
                  <span className="text-[0.7rem] text-[#0075c2] font-normal cursor-pointer hover:underline">編集</span>
                </div>
                <ul className="list-none m-0 p-0">
                  {folderCounts.map((folder, i) => (
                    <li key={i} className={`border-b border-[#f0f0f0] last:border-b-0`}>
                      <div
                        onClick={() => setActiveFolder(i)}
                        className={`flex items-center gap-2 px-3 py-[9px] text-[0.8rem] cursor-pointer transition-colors ${
                          activeFolder === i
                            ? 'bg-[#fff5f5] text-[#ff0033] font-bold'
                            : 'text-[#333] hover:bg-[#fff5f5] hover:text-[#ff0033]'
                        }`}
                      >
                        <span className="text-[1rem] flex-shrink-0">{folder.icon}</span>
                        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{folder.name}</span>
                        <span className={`text-[0.68rem] flex-shrink-0 ${activeFolder === i ? 'text-[#ff8080]' : 'text-[#aaa]'}`}>
                          {folder.count}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div
                  onClick={() => showToast('新しいフォルダを作成しました')}
                  className="flex items-center gap-1.5 px-3 py-[9px] text-[0.78rem] text-[#0075c2] cursor-pointer border-t border-dashed border-[#e0e0e0] hover:bg-[#f0f8ff] transition-colors"
                >
                  ＋ 新しいフォルダを追加
                </div>
              </div>

              {/* Tag filter */}
              <div className="bg-white border border-[#e0e0e0] rounded mb-2.5 overflow-hidden">
                <div className="bg-[#f8f8f8] px-3 py-[9px] text-[0.82rem] font-bold text-[#333] border-b-2 border-[#ff0033]">
                  タグ
                </div>
                <div className="p-2.5">
                  <div className="flex flex-wrap gap-[5px]">
                    {TAGS.map((tag, i) => (
                      <button
                        key={tag}
                        onClick={() => { setActiveTag(i); setPage(1); }}
                        className={`text-[0.7rem] py-[3px] px-[9px] rounded-[20px] border cursor-pointer transition-all ${
                          activeTag === i
                            ? 'bg-[#ff0033] text-white border-[#ff0033]'
                            : 'bg-white text-[#555] border-[#ddd] hover:border-[#ff0033] hover:text-[#ff0033]'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price drop shortcut */}
              {priceDropItems.length > 0 && (
                <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden">
                  <div className="bg-[#f8f8f8] px-3 py-[9px] text-[0.82rem] font-bold text-[#333] border-b-2 border-[#ff0033]">
                    値下がり商品
                  </div>
                  <div className="px-3 py-2.5">
                    {priceDropItems.map((item, i) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.product.id}`}
                        className={`flex items-center gap-2 py-1.5 cursor-pointer ${i < priceDropItems.length - 1 ? 'border-b border-[#f5f5f5]' : ''}`}
                      >
                        <div
                          className="w-9 h-9 rounded-[3px] flex items-center justify-center text-[1.1rem] flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)' }}
                        >
                          {item.product.imageUrl ? (
                            <Image src={item.product.imageUrl} alt="" width={36} height={36} className="rounded-[3px] object-cover" />
                          ) : (
                            '📦'
                          )}
                        </div>
                        <span className="text-[0.7rem] text-[#333] flex-1 line-clamp-2 leading-[1.35]">
                          {item.product.name}
                        </span>
                        <span className="text-[0.68rem] font-bold text-[#e00] flex-shrink-0 whitespace-nowrap">
                          ▼¥{item.drop.toLocaleString()}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ===== Main content ===== */}
            <div>
              {/* Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <label className="flex items-center gap-1.5 text-[0.8rem] text-[#555] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 accent-[#ff0033]"
                    />
                    すべて選択
                  </label>
                  {selectedItems.size > 0 && (
                    <span className="text-[0.78rem] text-[#888]">
                      <strong className="text-[#ff0033]">{selectedItems.size}</strong>件選択中
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 items-center">
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className="border border-[#ddd] rounded-[3px] py-[5px] px-2.5 text-[0.78rem] text-[#444] bg-white focus:border-[#ff0033] outline-none"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`w-[30px] h-[30px] border rounded-[3px] text-[0.9rem] cursor-pointer transition-all ${
                      viewMode === 'grid' ? 'border-[#ff0033] text-[#ff0033]' : 'border-[#ddd] text-[#555] bg-white hover:border-[#ff0033] hover:text-[#ff0033]'
                    }`}
                  >
                    ⊞
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`w-[30px] h-[30px] border rounded-[3px] text-[0.9rem] cursor-pointer transition-all ${
                      viewMode === 'list' ? 'border-[#ff0033] text-[#ff0033]' : 'border-[#ddd] text-[#555] bg-white hover:border-[#ff0033] hover:text-[#ff0033]'
                    }`}
                  >
                    ☰
                  </button>
                  {selectedItems.size > 0 && (
                    <button
                      onClick={removeSelected}
                      className="text-[0.75rem] py-[5px] px-2.5 rounded-[3px] bg-white border border-[#ddd] text-[#e00] hover:bg-[#fff0f0] hover:border-[#ff0033] transition-all cursor-pointer"
                    >
                      選択削除
                    </button>
                  )}
                </div>
              </div>

              {/* Section bar */}
              <div className="bg-white border border-[#e0e0e0] border-b-0 rounded-t py-2.5 px-3.5 flex items-center justify-between">
                <h2 className="text-[0.9rem] font-bold text-[#222] flex items-center gap-1.5">
                  ♡ お気に入り商品
                </h2>
                <span className="text-[0.75rem] text-[#888]">{filtered.length}件中 {(page - 1) * PER_PAGE + 1}〜{Math.min(page * PER_PAGE, filtered.length)}件表示</span>
              </div>

              {/* Empty state */}
              {filtered.length === 0 ? (
                <div className="bg-white border border-[#e0e0e0] rounded-b py-16 text-center">
                  <p className="text-[3rem] mb-3">💔</p>
                  <p className="text-[1rem] font-bold text-[#555] mb-1.5">お気に入り商品がありません</p>
                  <p className="text-[0.82rem] text-[#888] mb-4">気になる商品を見つけて♡ボタンでお気に入りに追加しましょう</p>
                  <Link
                    href="/products"
                    className="inline-block bg-[#ff0033] text-white px-6 py-2.5 rounded text-[0.85rem] font-bold hover:bg-[#cc0029] transition-colors"
                  >
                    商品を探す
                  </Link>
                </div>
              ) : viewMode === 'grid' ? (
                /* ===== Grid view ===== */
                <div className="grid grid-cols-5 gap-px bg-[#e8e8e8] border border-[#e0e0e0] rounded-b overflow-hidden">
                  {paginatedItems.map((fav) => {
                    const p = fav.product;
                    const price = effectivePrice(p);
                    const isSoldOut = p.stock === 0;
                    const drop = p.discountPrice ? p.price - p.discountPrice : 0;
                    const isInCart = addedToCart.has(p.id);

                    return (
                      <div
                        key={fav.id}
                        className={`bg-white p-2.5 cursor-pointer transition-shadow relative group hover:shadow-[inset_0_0_0_2px_#ff0033] hover:z-[1] ${
                          isSoldOut ? 'opacity-65' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedItems.has(p.id)}
                          onChange={() => toggleItem(p.id)}
                          disabled={isSoldOut}
                          className="absolute top-2 left-2 z-10 w-3.5 h-3.5 accent-[#ff0033]"
                          onClick={(e) => e.stopPropagation()}
                        />

                        {/* Image */}
                        <Link href={`/products/${p.id}`}>
                          <div
                            className={`w-full aspect-square rounded-[3px] mb-1.5 relative overflow-hidden flex items-center justify-center ${
                              isSoldOut ? 'grayscale-[60%]' : ''
                            }`}
                            style={{ background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)' }}
                          >
                            {p.imageUrl ? (
                              <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                            ) : (
                              <span className="text-[2.5rem]">📦</span>
                            )}

                            {/* Badges */}
                            <div className="absolute top-[5px] right-[5px] flex flex-col gap-1">
                              {p.discountPercent && p.discountPercent > 0 && (
                                <span className="bg-[#ff0033] text-white text-[0.55rem] font-bold px-1.5 py-0.5 rounded-sm">
                                  {p.discountPercent}%OFF
                                </span>
                              )}
                              {p.isHotDeal && (
                                <span className="bg-[#f5a623] text-[#333] text-[0.55rem] font-bold px-1.5 py-0.5 rounded-sm">
                                  セール終了間近
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>

                        {/* Heart button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavMutation.mutate(p.id);
                            showToast('お気に入りから削除しました');
                          }}
                          className="absolute bottom-auto right-[11px] top-auto w-[26px] h-[26px] bg-white/90 rounded-full border-none cursor-pointer text-[0.85rem] text-[#ff0033] shadow-[0_1px_3px_rgba(0,0,0,0.15)] hover:scale-[1.15] transition-all z-10"
                          style={{ marginTop: '-32px', position: 'relative', display: 'block', marginLeft: 'auto' }}
                        >
                          ♥
                        </button>

                        {/* Store */}
                        <p className="text-[0.65rem] text-[#888] mb-0.5 truncate">モールショップ</p>

                        {/* Name */}
                        <Link href={`/products/${p.id}`}>
                          <p className="text-[0.75rem] text-[#333] group-hover:text-[#ff0033] leading-[1.35] line-clamp-2 mb-1 min-h-[2.7em]">
                            {p.name}
                          </p>
                        </Link>

                        {/* Original price */}
                        {p.discountPrice !== null && (
                          <p className="text-[0.68rem] text-[#999] line-through">¥{p.price.toLocaleString()}</p>
                        )}

                        {/* Price row */}
                        {isSoldOut ? (
                          <p className="text-[0.82rem] text-[#aaa] font-bold">在庫切れ</p>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[0.95rem] font-bold text-[#e00]">¥{price.toLocaleString()}</span>
                            {p.discountPercent && p.discountPercent > 0 && (
                              <span className="bg-[#ff0033] text-white text-[0.55rem] font-bold px-1 py-px rounded-sm">
                                {p.discountPercent}%OFF
                              </span>
                            )}
                          </div>
                        )}

                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[0.7rem] text-[#f5a623]" style={{ letterSpacing: '-1px' }}>★★★★☆</span>
                          <span className="text-[0.6rem] text-[#888]">(3)</span>
                        </div>

                        {/* Points */}
                        <p className="text-[0.65rem] text-[#c63] mt-0.5">{Math.floor(price * 0.01)}pt還元</p>

                        {/* Tags */}
                        <div className="flex gap-1 flex-wrap mt-1">
                          {drop > 0 && (
                            <span className="border border-[#e00] text-[#e00] text-[0.55rem] font-bold px-1 py-px rounded-sm">
                              ▼¥{drop.toLocaleString()}値下がり
                            </span>
                          )}
                          {price >= 3000 && (
                            <span className="border border-[#0075c2] text-[#0075c2] text-[0.55rem] px-1 py-px rounded-sm">送料無料</span>
                          )}
                        </div>

                        {/* Stock warning */}
                        {p.stock > 0 && p.stock <= 5 && (
                          <p className="text-[0.6rem] text-[#ff0033] font-bold mt-1">残り{p.stock}点</p>
                        )}

                        {/* Sold out tag */}
                        {isSoldOut && (
                          <span className="border border-[#aaa] text-[#aaa] text-[0.55rem] px-1 py-px rounded-sm mt-1 inline-block">
                            入荷通知登録済み
                          </span>
                        )}

                        {/* Add to cart button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isSoldOut && !isInCart) addToCartMutation.mutate(p.id);
                          }}
                          disabled={isSoldOut}
                          className={`block w-full mt-[7px] text-[0.7rem] font-bold py-[5px] rounded-[3px] border transition-colors ${
                            isInCart
                              ? 'bg-[#2e7d32] border-[#2e7d32] text-white cursor-default'
                              : isSoldOut
                                ? 'bg-[#f0f0f0] border-[#ddd] text-[#aaa] cursor-not-allowed'
                                : 'bg-white border-[#ff0033] text-[#ff0033] hover:bg-[#ff0033] hover:text-white cursor-pointer'
                          }`}
                        >
                          {isInCart ? '✓ カートに追加済み' : isSoldOut ? 'カートに入れる' : '🛒 カートに入れる'}
                        </button>

                        {/* Date */}
                        <p className="text-[0.6rem] text-[#bbb] text-right mt-1">
                          {new Date(fav.createdAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}登録
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ===== List view ===== */
                <div className="border border-[#e0e0e0] rounded-b overflow-hidden">
                  {paginatedItems.map((fav, i) => {
                    const p = fav.product;
                    const price = effectivePrice(p);
                    const isSoldOut = p.stock === 0;
                    const drop = p.discountPrice ? p.price - p.discountPrice : 0;
                    const isInCart = addedToCart.has(p.id);

                    return (
                      <div
                        key={fav.id}
                        className={`flex gap-3 items-start bg-white px-3.5 py-3 ${i < paginatedItems.length - 1 ? 'border-b border-[#f0f0f0]' : ''} ${
                          isSoldOut ? 'opacity-65' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.has(p.id)}
                          onChange={() => toggleItem(p.id)}
                          disabled={isSoldOut}
                          className="w-3.5 h-3.5 accent-[#ff0033] mt-1 flex-shrink-0"
                        />
                        <Link href={`/products/${p.id}`} className="flex-shrink-0">
                          <div
                            className={`w-20 h-20 rounded-[3px] relative overflow-hidden flex items-center justify-center ${isSoldOut ? 'grayscale-[60%]' : ''}`}
                            style={{ background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)' }}
                          >
                            {p.imageUrl ? (
                              <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                            ) : (
                              <span className="text-[2rem]">📦</span>
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.65rem] text-[#888] mb-0.5">モールショップ</p>
                          <Link href={`/products/${p.id}`}>
                            <p className="text-[0.82rem] text-[#333] hover:text-[#ff0033] leading-[1.4] line-clamp-2 mb-1">{p.name}</p>
                          </Link>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-[0.7rem] text-[#f5a623]" style={{ letterSpacing: '-1px' }}>★★★★☆</span>
                            <span className="text-[0.6rem] text-[#888]">(3)</span>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {drop > 0 && (
                              <span className="border border-[#e00] text-[#e00] text-[0.55rem] font-bold px-1 py-px rounded-sm">▼¥{drop.toLocaleString()}</span>
                            )}
                            {price >= 3000 && (
                              <span className="border border-[#0075c2] text-[#0075c2] text-[0.55rem] px-1 py-px rounded-sm">送料無料</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right min-w-[130px] flex-shrink-0">
                          {p.discountPrice !== null && (
                            <p className="text-[0.68rem] text-[#999] line-through">¥{p.price.toLocaleString()}</p>
                          )}
                          {isSoldOut ? (
                            <p className="text-[0.82rem] text-[#aaa] font-bold">在庫切れ</p>
                          ) : (
                            <p className="text-[1rem] font-bold text-[#e00]">¥{price.toLocaleString()}</p>
                          )}
                          <button
                            onClick={() => {
                              if (!isSoldOut && !isInCart) addToCartMutation.mutate(p.id);
                            }}
                            disabled={isSoldOut}
                            className={`mt-1.5 text-[0.7rem] font-bold py-[5px] px-3.5 rounded-[3px] border transition-colors inline-block ${
                              isInCart
                                ? 'bg-[#2e7d32] border-[#2e7d32] text-white'
                                : isSoldOut
                                  ? 'bg-[#f0f0f0] border-[#ddd] text-[#aaa] cursor-not-allowed'
                                  : 'bg-white border-[#ff0033] text-[#ff0033] hover:bg-[#ff0033] hover:text-white cursor-pointer'
                            }`}
                          >
                            {isInCart ? '✓ 追加済み' : '🛒 カートに入れる'}
                          </button>
                          <div className="flex items-center gap-2 mt-1.5 justify-end">
                            <button
                              onClick={() => { removeFavMutation.mutate(p.id); showToast('お気に入りから削除しました'); }}
                              className="text-[0.68rem] text-[#888] hover:text-[#ff0033] cursor-pointer bg-transparent border-none"
                            >
                              ♥ 削除
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 mt-3.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`w-8 h-8 flex items-center justify-center border rounded-[3px] text-[0.82rem] transition-colors ${
                      page === 1
                        ? 'border-[#e0e0e0] text-[#ccc] cursor-not-allowed bg-[#f8f8f8]'
                        : 'border-[#ddd] text-[#555] bg-white hover:border-[#ff0033] hover:text-[#ff0033] cursor-pointer'
                    }`}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center border rounded-[3px] text-[0.82rem] transition-colors cursor-pointer ${
                        page === p
                          ? 'bg-[#ff0033] border-[#ff0033] text-white font-bold'
                          : 'border-[#ddd] text-[#555] bg-white hover:border-[#ff0033] hover:text-[#ff0033]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`w-8 h-8 flex items-center justify-center border rounded-[3px] text-[0.82rem] transition-colors ${
                      page === totalPages
                        ? 'border-[#e0e0e0] text-[#ccc] cursor-not-allowed bg-[#f8f8f8]'
                        : 'border-[#ddd] text-[#555] bg-white hover:border-[#ff0033] hover:text-[#ff0033] cursor-pointer'
                    }`}
                  >
                    ›
                  </button>
                </div>
              )}

              {/* Recently viewed products */}
              {recentProducts?.data && recentProducts.data.length > 0 && (
                <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden mt-3.5">
                  <div className="px-3.5 py-2.5 border-b-2 border-[#ff0033] flex items-center justify-between">
                    <h2 className="text-[0.9rem] font-bold text-[#222]">最近見た商品</h2>
                    <Link href="/products" className="text-[0.75rem] text-[#ff0033] hover:underline">もっと見る ›</Link>
                  </div>
                  <div className="flex gap-px bg-[#e8e8e8] overflow-x-auto nav-scroll">
                    {recentProducts.data.slice(0, 7).map((p) => {
                      const isFaved = favorites.some((f) => f.product.id === p.id);
                      return (
                        <div key={p.id} className="bg-white p-2.5 min-w-[140px] flex-shrink-0 cursor-pointer transition-shadow hover:shadow-[inset_0_0_0_2px_#ff0033] hover:z-[1]">
                          <Link href={`/products/${p.id}`}>
                            <div
                              className="w-full aspect-square rounded-[3px] mb-1.5 relative overflow-hidden flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)' }}
                            >
                              {p.imageUrl ? (
                                <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                              ) : (
                                <span className="text-[2rem]">📦</span>
                              )}
                            </div>
                            <p className="text-[0.72rem] text-[#333] leading-[1.35] mb-1 line-clamp-2">{p.name}</p>
                            <p className="text-[0.9rem] font-bold text-[#e00]">¥{(p.discountPrice ?? p.price).toLocaleString()}</p>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isFaved) {
                                addFavMutation.mutate(p.id);
                                showToast('お気に入りに追加しました');
                              }
                            }}
                            className={`block w-full mt-1.5 text-[0.65rem] py-1 rounded-[3px] border text-center cursor-pointer transition-all ${
                              isFaved
                                ? 'border-[#ff0033] text-[#ff0033] bg-[#fff5f5]'
                                : 'border-[#ddd] text-[#555] bg-white hover:border-[#ff0033] hover:text-[#ff0033]'
                            }`}
                          >
                            {isFaved ? '♥ 追加済み' : '♡ お気に入り'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#333] text-white text-[0.82rem] py-2.5 px-5 rounded whitespace-nowrap z-[999] transition-all duration-[250ms] pointer-events-none ${
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        {toast}
      </div>
      <Footer />
    </>
  );
}
