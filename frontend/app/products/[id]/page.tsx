'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import TopBar from '@/components/layout/TopBar';
import Ticker from '@/components/layout/Ticker';
import Navbar from '@/components/layout/Navbar';

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
  category: { id: string; name: string };
}

interface ProductsResponse {
  data: Product[];
  meta: { total: number; page: number; totalPages: number };
}

type TabKey = 'description' | 'spec' | 'review' | 'qa';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [cartError, setCartError] = useState('');
  const [cartSuccess, setCartSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data),
  });

  const { data: favCheck } = useQuery<{ favorited: boolean }>({
    queryKey: ['fav-check', id],
    queryFn: () => api.get(`/favorites/${id}/check`).then((r) => r.data),
    enabled: !!user,
  });
  const wishlisted = favCheck?.favorited ?? false;

  const toggleFavMutation = useMutation({
    mutationFn: () => wishlisted ? api.delete(`/favorites/${id}`) : api.post(`/favorites/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fav-check', id] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // Fetch related products from same category
  const { data: relatedData } = useQuery<ProductsResponse>({
    queryKey: ['related-products', product?.category?.id],
    queryFn: () =>
      api.get('/products', {
        params: { categoryId: product!.category.id, limit: 5 },
      }).then((r) => r.data),
    enabled: !!product?.category?.id,
  });

  const relatedProducts = relatedData?.data?.filter((p) => p.id !== id)?.slice(0, 5) ?? [];

  const addToCartMutation = useMutation({
    mutationFn: () => api.post('/cart/items', { productId: id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 2500);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? (err instanceof Error ? err.message : 'カートへの追加に失敗しました');
      setCartError(msg);
    },
  });

  const handleAddToCart = () => {
    if (!user) { router.push('/login'); return; }
    setCartError('');
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    if (!user) { router.push('/login'); return; }
    setCartError('');
    addToCartMutation.mutate();
    router.push('/cart');
  };

  const effectivePrice = (p: Product) => p.discountPrice ?? p.price;

  if (isLoading) {
    return (
      <>
      <TopBar />
      <Ticker />
      <Navbar />
      <div style={{ background: '#f4f4f4' }}>
        <div className="max-w-[1200px] mx-auto px-3 py-3">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3.5">
            <div className="flex flex-col gap-3">
              <div className="bg-white border border-[#e0e0e0] rounded p-4">
                <div className="w-full aspect-square bg-gradient-to-br from-[#f0f0f0] to-[#e0e0e0] rounded mb-3 animate-pulse" />
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-16 h-16 bg-[#f0f0f0] rounded-sm animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="bg-white border border-[#e0e0e0] rounded p-4">
                <div className="h-4 bg-[#f0f0f0] rounded w-1/4 mb-2 animate-pulse" />
                <div className="h-6 bg-[#f0f0f0] rounded w-3/4 mb-3 animate-pulse" />
                <div className="h-8 bg-[#f0f0f0] rounded w-1/3 animate-pulse" />
              </div>
            </div>
            <div className="bg-white border border-[#e0e0e0] rounded p-4 h-fit">
              <div className="h-4 bg-[#f0f0f0] rounded w-1/3 mb-2 animate-pulse" />
              <div className="h-8 bg-[#f0f0f0] rounded w-2/3 mb-4 animate-pulse" />
              <div className="h-10 bg-[#f0f0f0] rounded mb-2 animate-pulse" />
              <div className="h-10 bg-[#f0f0f0] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
      <TopBar />
      <Ticker />
      <Navbar />
      <div style={{ background: '#f4f4f4' }}>
        <div className="max-w-[1200px] mx-auto px-3 py-16 text-center">
          <p className="text-3xl mb-2">😕</p>
          <p className="text-[#555] font-bold">商品が見つかりませんでした</p>
          <Link href="/products" className="mt-3 inline-block text-[#0075c2] hover:underline text-[0.82rem]">
            ← 商品一覧に戻る
          </Link>
        </div>
      </div>
      </>
    );
  }

  const inStock = product.stock > 0;
  const price = effectivePrice(product);

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'description', label: '商品説明' },
    { key: 'spec', label: '仕様・スペック' },
    { key: 'review', label: 'レビュー', count: 3 },
    { key: 'qa', label: 'Q&A', count: 2 },
  ];

  return (
    <>
    <TopBar />
    <Ticker />
    <Navbar />
    <div style={{ background: '#f4f4f4' }}>
      <div className="max-w-[1200px] mx-auto px-3 pt-3">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[0.75rem] text-[#888] mb-2.5 flex-wrap">
          <Link href="/" className="text-[#0075c2] hover:underline">トップ</Link>
          <span className="text-[#ccc]">›</span>
          <Link href="/products" className="text-[#0075c2] hover:underline">商品一覧</Link>
          <span className="text-[#ccc]">›</span>
          <Link href={`/products?categoryId=${product.category.id}`} className="text-[#0075c2] hover:underline">
            {product.category.name}
          </Link>
          <span className="text-[#ccc]">›</span>
          <span className="line-clamp-1">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-[1200px] mx-auto px-3 pb-6">
        {/* Detail grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3.5 mb-3.5" style={{ alignItems: 'start' }}>

          {/* ====== Left column ====== */}
          <div className="flex flex-col gap-3">

            {/* Image gallery card */}
            <div className="bg-white border border-[#e0e0e0] rounded p-4">
              <div className="w-full aspect-square bg-gradient-to-br from-[#f0f0f0] to-[#e0e0e0] rounded mb-3 relative overflow-hidden flex items-center justify-center cursor-zoom-in">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                ) : (
                  <span className="text-[9rem]">📦</span>
                )}
              </div>
              {/* Thumbnail row */}
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-16 h-16 rounded-sm flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${
                      i === 0
                        ? 'border-2 border-[#ff0033]'
                        : 'border-2 border-[#ddd] hover:border-[#ff0033]'
                    }`}
                    style={{ background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)' }}
                  >
                    {i === 0 && product.imageUrl ? (
                      <div className="relative w-full h-full overflow-hidden rounded-sm">
                        <Image src={product.imageUrl} alt="" fill className="object-cover" />
                      </div>
                    ) : (
                      <span className="text-[1.7rem]">{['📦', '📸', '🔍', '📐'][i]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Product info card */}
            <div className="bg-white border border-[#e0e0e0] rounded p-4">
              {/* Store name */}
              <p className="text-[0.75rem] text-[#0075c2] mb-1 cursor-pointer hover:underline">
                モールショップ公式ストア
              </p>

              {/* Title */}
              <h1 className="text-[1.1rem] font-bold leading-[1.5] text-[#222] mb-2">
                {product.name}
              </h1>

              {/* Badges */}
              <div className="flex gap-1.5 flex-wrap mb-2.5">
                {product.isHotDeal && (
                  <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-sm bg-[#f5a623] text-[#333]">人気商品</span>
                )}
                {product.discountPercent && product.discountPercent > 0 && (
                  <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-sm bg-[#ff0033] text-white">SALE</span>
                )}
                <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-sm bg-[#0075c2] text-white">公式</span>
              </div>

              {/* Rating row */}
              <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-[#f0f0f0] flex-wrap">
                <span className="text-[1rem] text-[#f5a623]" style={{ letterSpacing: '-1px' }}>★★★★☆</span>
                <span className="text-[1rem] font-bold text-[#f5a623]">4.3</span>
                <button
                  className="text-[0.78rem] text-[#0075c2] cursor-pointer hover:underline"
                  onClick={() => setActiveTab('review')}
                >
                  レビュー 3件を見る
                </button>
              </div>

              {/* Price area */}
              <div className="py-3 border-b border-[#f0f0f0] mb-3">
                {product.discountPrice && (
                  <p className="text-[0.82rem] text-[#999] line-through mb-0.5">
                    参考価格: ¥{product.price.toLocaleString()}
                  </p>
                )}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[1.8rem] font-bold text-[#e00] leading-none">
                    ¥{price.toLocaleString()}
                  </span>
                  {product.discountPercent && product.discountPercent > 0 && (
                    <span className="bg-[#ff0033] text-white text-[0.78rem] font-bold px-2 py-0.5 rounded-sm">
                      {product.discountPercent}%OFF
                    </span>
                  )}
                </div>
                <p className="text-[0.72rem] text-[#888] mt-1">税込・送料無料</p>

                {/* Point info */}
                <div className="bg-[#fff9e6] border border-[#f5c842] rounded-sm px-2.5 py-1.5 text-[0.78rem] text-[#664d00] mt-2">
                  🏷️ {Math.floor(price * 0.01)}ポイント還元（1%）— プレミアム会員なら3倍
                </div>
              </div>

              {/* Spec summary */}
              <div className="text-[0.8rem] leading-[1.9] text-[#555] border-b border-[#f0f0f0] pb-3 mb-3">
                <div className="flex gap-2">
                  <span className="text-[#888] min-w-[82px] flex-shrink-0">カテゴリ</span>
                  <span>{product.category.name}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#888] min-w-[82px] flex-shrink-0">在庫状況</span>
                  <span className={inStock ? 'text-[#2e7d32]' : 'text-[#e00]'}>
                    {inStock ? `在庫あり（残り${product.stock}点）` : '在庫切れ'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#888] min-w-[82px] flex-shrink-0">配送</span>
                  <span>翌日配送対応</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#888] min-w-[82px] flex-shrink-0">返品</span>
                  <span>30日間返品保証</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-1.5 flex-wrap">
                <span className="border border-[#0075c2] text-[#0075c2] text-[0.68rem] px-[7px] py-0.5 rounded-sm">送料無料</span>
                <span className="border border-[#2e7d32] text-[#2e7d32] text-[0.68rem] px-[7px] py-0.5 rounded-sm">翌日配送対応</span>
                <span className="border border-[#ddd] text-[#666] text-[0.68rem] px-[7px] py-0.5 rounded-sm">30日間返品保証</span>
                <span className="border border-[#ddd] text-[#666] text-[0.68rem] px-[7px] py-0.5 rounded-sm">ポイント還元</span>
                <span className="border border-[#ddd] text-[#666] text-[0.68rem] px-[7px] py-0.5 rounded-sm">正規品</span>
              </div>
            </div>
          </div>

          {/* ====== Right column — Purchase box (sticky) ====== */}
          <div className="bg-white border border-[#e0e0e0] rounded p-4 lg:sticky lg:top-[80px]">
            {/* Price */}
            <p className="text-[0.75rem] text-[#888] mb-1">価格（税込）</p>
            {product.discountPrice && (
              <p className="text-[0.82rem] text-[#999] line-through">¥{product.price.toLocaleString()}</p>
            )}
            <div className="flex items-baseline gap-2 flex-wrap mb-1">
              <span className="text-[2rem] font-bold text-[#e00]">¥{price.toLocaleString()}</span>
              {product.discountPercent && product.discountPercent > 0 && (
                <span className="bg-[#ff0033] text-white text-[0.72rem] font-bold px-1.5 py-0.5 rounded-sm inline-block">
                  {product.discountPercent}%OFF
                </span>
              )}
            </div>
            <p className="text-[0.7rem] text-[#888] mb-3">税込・送料無料</p>

            {/* Point box */}
            <div className="bg-[#fff9e6] border border-[#f5c842] rounded-sm px-2.5 py-1.5 text-[0.75rem] text-[#664d00] mb-3">
              🏷️ {Math.floor(price * 0.01)}ポイント還元
            </div>

            <hr className="border-none border-t border-[#f0f0f0] my-2.5" />

            {/* Info rows */}
            <div className="space-y-[7px] text-[0.78rem] mb-3">
              <div className="flex justify-between">
                <span className="text-[#555]">在庫</span>
                <span className={`font-medium ${inStock ? 'text-[#2e7d32]' : 'text-[#e00]'}`}>
                  {inStock ? `残り${product.stock}点` : '在庫なし'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555]">配送</span>
                <span className="font-medium text-[#0075c2]">翌日お届け</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555]">返品</span>
                <span className="font-medium text-[#333]">30日間可能</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555]">保証</span>
                <span className="font-medium text-[#333]">メーカー1年保証</span>
              </div>
            </div>

            <hr className="border-none border-t border-[#f0f0f0] my-2.5" />

            {/* Quantity selector */}
            {inStock && (
              <div className="flex justify-between items-center mb-3">
                <span className="text-[0.78rem] text-[#555]">数量</span>
                <div className="flex">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-[30px] h-[30px] border border-[#ddd] bg-[#f8f8f8] text-[1rem] hover:bg-[#eee] transition-colors"
                  >
                    −
                  </button>
                  <div className="w-10 h-[30px] border-y border-[#ddd] text-center leading-[30px] text-[0.9rem]">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-[30px] h-[30px] border border-[#ddd] bg-[#f8f8f8] text-[1rem] hover:bg-[#eee] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Stock warning */}
            {inStock && product.stock <= 5 && (
              <p className="text-[0.72rem] text-[#ff6600] font-bold mb-3">
                ⚠ 残りわずか！お早めにご購入ください
              </p>
            )}

            {/* Error */}
            {cartError && (
              <p className="text-[0.78rem] text-red-600 bg-red-50 px-3 py-2 rounded-sm border border-red-100 mb-3">{cartError}</p>
            )}

            {/* Buttons */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock || addToCartMutation.isPending}
              className={`block w-full border-none py-[13px] rounded text-[0.92rem] font-bold mb-2 transition-colors ${
                cartSuccess
                  ? 'bg-[#2e7d32] text-white'
                  : !inStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#ff0033] text-white hover:bg-[#cc0029] cursor-pointer'
              }`}
            >
              {addToCartMutation.isPending ? '追加中...' : cartSuccess ? '✓ カートに追加しました！' : !inStock ? '在庫切れ' : '🛒 カートに入れる'}
            </button>

            {inStock && (
              <button
                onClick={handleBuyNow}
                disabled={addToCartMutation.isPending}
                className="block w-full border-none py-[13px] rounded text-[0.92rem] font-bold mb-2 bg-[#ff8c00] text-white hover:bg-[#cc7000] cursor-pointer transition-colors"
              >
                ⚡ 今すぐ購入
              </button>
            )}

            <button
              onClick={() => {
                if (!user) { router.push('/login'); return; }
                toggleFavMutation.mutate();
              }}
              className={`block w-full py-[9px] rounded text-[0.78rem] transition-colors cursor-pointer ${
                wishlisted
                  ? 'bg-[#fff5f5] text-[#ff0033] border border-[#ff0033]'
                  : 'bg-white text-[#555] border border-[#ddd] hover:border-[#ff0033] hover:text-[#ff0033] hover:bg-[#fff5f5]'
              }`}
            >
              {wishlisted ? '♥ お気に入り済み' : '♡ お気に入りに追加'}
            </button>

            {!user && inStock && (
              <p className="text-[0.72rem] text-[#888] text-center mt-2">
                <Link href="/login" className="text-[#0075c2] hover:underline font-medium">ログイン</Link>
                してカートに追加できます
              </p>
            )}

            {/* Security info */}
            <div className="mt-3 flex flex-col gap-1 text-[0.7rem] text-[#888]">
              <span className="before:content-['✓_'] before:text-[#2e7d32]">安全なお支払い（SSL暗号化通信）</span>
              <span className="before:content-['✓_'] before:text-[#2e7d32]">プライバシー保護</span>
              <span className="before:content-['✓_'] before:text-[#2e7d32]">購入者保護制度対応</span>
            </div>

            {/* Seller info */}
            <div className="mt-3 pt-3 border-t border-[#f0f0f0] text-[0.75rem] text-[#555]">
              <p>販売元: <span className="text-[#0075c2] font-bold cursor-pointer hover:underline">モールショップ公式ストア</span></p>
              <div className="flex items-center gap-1 mt-0.5 text-[0.72rem] text-[#888]">
                <span className="text-[#f5a623]">★★★★★</span>
                <span>4.8 (1,245件の評価)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ====== Tab section ====== */}
        <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden mb-3">
          {/* Tab nav */}
          <div className="flex border-b-2 border-[#ff0033] overflow-x-auto nav-scroll">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-[11px] text-[0.85rem] whitespace-nowrap cursor-pointer border-b-[3px] -mb-[2px] transition-colors ${
                  activeTab === tab.key
                    ? 'text-[#ff0033] border-b-[#ff0033] font-bold bg-white'
                    : 'text-[#555] border-b-transparent font-medium hover:text-[#ff0033]'
                }`}
              >
                {tab.label}{tab.count !== undefined && ` (${tab.count})`}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-4">
            {/* Description tab */}
            {activeTab === 'description' && (
              <div className="prod-desc">
                <h3 className="text-[0.95rem] text-[#222] mt-0 mb-2 pl-2.5 border-l-[3px] border-[#ff0033]">
                  商品概要
                </h3>
                <p className="text-[0.85rem] leading-[1.9] text-[#444] mb-2">
                  {product.description}
                </p>

                <h3 className="text-[0.95rem] text-[#222] mt-4 mb-2 pl-2.5 border-l-[3px] border-[#ff0033]">
                  おすすめポイント
                </h3>
                <ul className="pl-5 mb-3">
                  <li className="text-[0.85rem] text-[#444] mb-1">高品質な素材を使用し、長くご愛用いただけます</li>
                  <li className="text-[0.85rem] text-[#444] mb-1">シンプルで使いやすいデザイン</li>
                  <li className="text-[0.85rem] text-[#444] mb-1">幅広いシーンでご利用いただけます</li>
                </ul>

                {/* Feature cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-3.5">
                  {[
                    { icon: '🚚', title: '送料無料', desc: '全国どこでも送料無料でお届けします' },
                    { icon: '🔄', title: '30日間返品保証', desc: '商品にご満足いただけない場合は返品可能' },
                    { icon: '🛡️', title: 'メーカー保証', desc: '安心のメーカー1年保証付き' },
                  ].map((f) => (
                    <div key={f.title} className="bg-[#f8f8f8] rounded p-3.5 text-center">
                      <p className="text-[2rem] mb-1.5">{f.icon}</p>
                      <p className="text-[0.82rem] font-bold text-[#222] mb-1">{f.title}</p>
                      <p className="text-[0.75rem] text-[#666] leading-[1.6]">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spec tab */}
            {activeTab === 'spec' && (
              <table className="w-full border-collapse text-[0.82rem]">
                <tbody>
                  {[
                    ['商品名', product.name],
                    ['カテゴリ', product.category.name],
                    ['価格', `¥${price.toLocaleString()}（税込）`],
                    ['在庫数', `${product.stock}点`],
                    ['配送方法', '宅配便（翌日配送対応）'],
                    ['返品期限', '商品到着後30日以内'],
                    ['保証期間', 'メーカー1年保証'],
                    ['原産国', '日本'],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-[#f0f0f0] last:border-b-0">
                      <th className="bg-[#f8f8f8] px-3.5 py-[9px] text-left font-bold text-[#444] w-[160px]">{label}</th>
                      <td className="px-3.5 py-[9px] text-[#333]">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Review tab */}
            {activeTab === 'review' && (
              <div>
                {/* Summary */}
                <div className="flex gap-6 items-center bg-[#f8f8f8] rounded p-4 mb-3.5">
                  <div className="text-center flex-shrink-0">
                    <p className="text-[3rem] font-bold text-[#e00] leading-none">4.3</p>
                    <p className="text-[1.2rem] text-[#f5a623]" style={{ letterSpacing: '-1px' }}>★★★★☆</p>
                    <p className="text-[0.72rem] text-[#888] mt-0.5">3件の評価</p>
                  </div>
                  <div className="flex-1">
                    {[
                      { star: 5, count: 2, pct: 67 },
                      { star: 4, count: 1, pct: 33 },
                      { star: 3, count: 0, pct: 0 },
                      { star: 2, count: 0, pct: 0 },
                      { star: 1, count: 0, pct: 0 },
                    ].map((r) => (
                      <div key={r.star} className="flex items-center gap-2 mb-1.5 text-[0.75rem]">
                        <span className="w-[30px] text-right text-[#f5a623] flex-shrink-0">{r.star}★</span>
                        <div className="flex-1 h-2 bg-[#e8e8e8] rounded overflow-hidden">
                          <div className="h-full bg-[#f5a623] rounded" style={{ width: `${r.pct}%` }} />
                        </div>
                        <span className="w-7 text-[#888] flex-shrink-0">{r.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                {[
                  { stars: 5, title: '期待以上の品質！', user: 'T.S.', date: '2026年3月10日', body: '思っていた以上に品質が良く、大変満足しています。配送も早く、梱包も丁寧でした。リピート購入を検討中です。' },
                  { stars: 5, title: '毎日使っています！', user: '田中 K.', date: '2026年2月28日', body: '使い勝手がとても良いです。デザインもシンプルで気に入っています。家族にもすすめました。' },
                  { stars: 4, title: '概ね満足。コスパ良し', user: 'M.Y.', date: '2026年2月15日', body: '価格を考えると十分な品質です。細かい部分でもう少し改善の余地がありますが、全体的には満足しています。' },
                ].map((rv, i) => (
                  <div key={i} className={`py-3.5 ${i < 2 ? 'border-b border-[#f0f0f0]' : ''}`}>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-[0.85rem] text-[#f5a623]" style={{ letterSpacing: '-1px' }}>
                        {'★'.repeat(rv.stars)}{'☆'.repeat(5 - rv.stars)}
                      </span>
                      <span className="text-[0.85rem] font-bold text-[#222]">{rv.title}</span>
                      <span className="text-[0.72rem] text-[#888]">{rv.user}</span>
                      <span className="text-[0.72rem] text-[#aaa] ml-auto">{rv.date}</span>
                    </div>
                    <p className="text-[0.82rem] text-[#444] leading-[1.7]">{rv.body}</p>
                    <p className="text-[0.72rem] text-[#888] mt-2">
                      <span className="text-[#0075c2] cursor-pointer hover:underline">参考になった (5)</span>
                      {' · '}
                      <span className="text-[#0075c2] cursor-pointer hover:underline">報告</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Q&A tab */}
            {activeTab === 'qa' && (
              <div>
                {[
                  {
                    q: 'ギフトラッピングは対応していますか？',
                    a: 'はい、対応しております。ご注文時にギフトラッピングオプションをお選びください。追加料金は330円（税込）となります。',
                    date: '2026年3月5日',
                  },
                  {
                    q: '返品の際の送料はどちら負担ですか？',
                    a: '商品の不良・誤配送の場合は当店負担、お客様のご都合による返品の場合はお客様負担となります。',
                    date: '2026年2月20日',
                  },
                ].map((item, i) => (
                  <div key={i} className={`py-3 ${i < 1 ? 'border-b border-[#f0f0f0]' : ''}`}>
                    <p className="text-[0.82rem] font-bold text-[#222] leading-[1.8] mb-1">
                      Q: {item.q}
                    </p>
                    <p className="text-[0.82rem] text-[#444] leading-[1.8]">
                      A: {item.a}
                    </p>
                    <p className="text-[0.72rem] text-[#aaa] mt-1">回答日: {item.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ====== Related products ====== */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-[0.95rem] font-bold text-[#333] mb-2 pl-2.5 border-l-[3px] border-[#ff0033]">
              関連商品
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-[#e8e8e8]">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/products/${rp.id}`}
                  className="bg-white p-2.5 cursor-pointer transition-shadow hover:shadow-[inset_0_0_0_2px_#ff0033] hover:z-[1] group"
                >
                  <div
                    className="w-full aspect-square rounded-sm mb-1.5 relative overflow-hidden flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)' }}
                  >
                    {rp.imageUrl ? (
                      <Image src={rp.imageUrl} alt={rp.name} fill className="object-cover" />
                    ) : (
                      <span className="text-[2.5rem]">📦</span>
                    )}
                  </div>
                  <h3 className="text-[0.75rem] text-[#333] group-hover:text-[#ff0033] transition-colors leading-snug line-clamp-2 mb-1">
                    {rp.name}
                  </h3>
                  <p className="text-[0.95rem] font-bold text-[#e00]">
                    ¥{(rp.discountPrice ?? rp.price).toLocaleString()}
                  </p>
                  <span className="text-[0.68rem] text-[#f5a623]" style={{ letterSpacing: '-1px' }}>★★★★☆</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
