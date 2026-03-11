'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';
import TopBar from '@/components/layout/TopBar';
import Ticker from '@/components/layout/Ticker';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// ── Types ──

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  discountPercent: number | null;
  isHotDeal: boolean;
  imageUrl: string | null;
  stock: number;
  category: { id: string; name: string };
}

interface ProductsResponse {
  data: Product[];
  meta: { total: number; page: number; totalPages: number };
}

// ── Static data (no backend model) ──

const categoryIconMap: Record<string, string> = {
  'ファッション': '👗',
  'スマホ・タブレット': '📱',
  '家電・PC': '💻',
  '食品・飲料': '🍎',
  'スポーツ': '🏋️',
  'インテリア': '🛋️',
  '美容・健康': '💄',
  '本・CD': '📚',
  'おもちゃ': '🧸',
  '車・バイク': '🚗',
  'キッチン・日用品': '🍳',
  'スポーツ・アウトドア': '🏕️',
  '本・CD・ゲーム': '🎮',
  'インテリア・家具': '🛋️',
};

const sidebarCategoryNames = [
  'ファッション', 'スマホ・タブレット', '家電・PC', '食品・飲料', 'スポーツ',
  'インテリア', '美容・健康', '本・CD', 'おもちゃ', '車・バイク',
];

const navCategoryIcons = [
  { name: 'ファッション', icon: '👗', sale: false },
  { name: 'スマホ', icon: '📱', sale: false },
  { name: 'PC・家電', icon: '💻', sale: false },
  { name: '食品', icon: '🍎', sale: false },
  { name: 'スポーツ', icon: '🏋️', sale: false },
  { name: 'インテリア', icon: '🛋️', sale: false },
  { name: '美容', icon: '💄', sale: false },
  { name: '本・CD', icon: '📚', sale: false },
  { name: 'おもちゃ', icon: '🧸', sale: false },
  { name: 'セール', icon: '🔥', sale: true },
];

const coupons = [
  { value: '300', unit: '円OFF', desc: '3,000円以上で使える', expires: '〜7月31日まで' },
  { value: '10', unit: '%OFF', desc: 'ファッション限定', expires: '〜7月25日まで' },
  { value: '500', unit: '円OFF', desc: '初回購入限定', expires: '〜8月10日まで' },
  { value: 'P5', unit: '倍', desc: 'ポイント5倍デー', expires: '本日のみ！' },
];

const miniBanners = [
  { bg: 'linear-gradient(135deg, #0075c2, #0099ff)', icon: '🚚', label: '今なら', title: '送料無料', sub: '3,000円以上' },
  { bg: 'linear-gradient(135deg, #cc6600, #ff9500)', icon: '⭐', label: '期間限定', title: 'ポイント', sub: '最大10倍！' },
  { bg: 'linear-gradient(135deg, #2d8a4e, #4caf50)', icon: '🎁', label: '新規登録', title: '500pt', sub: 'プレゼント' },
];

// ── Helpers ──

function getRankColor(rank: number) {
  if (rank === 1) return '#c8941e';
  if (rank === 2) return '#888888';
  if (rank === 3) return '#b87333';
  return '#aaaaaa';
}

function formatPrice(price: number) {
  return `¥${price.toLocaleString()}`;
}

function calcDiscount(product: Product): { displayPrice: number; oldPrice: number | null; discountLabel: string | null } {
  if (product.discountPercent && product.discountPercent > 0) {
    const discounted = product.discountPrice ?? Math.round(product.price * (1 - product.discountPercent / 100));
    return {
      displayPrice: discounted,
      oldPrice: product.price,
      discountLabel: `${product.discountPercent}%OFF`,
    };
  }
  if (product.discountPrice && product.discountPrice < product.price) {
    const pct = Math.round((1 - product.discountPrice / product.price) * 100);
    return {
      displayPrice: product.discountPrice,
      oldPrice: product.price,
      discountLabel: `${pct}%OFF`,
    };
  }
  return { displayPrice: product.price, oldPrice: null, discountLabel: null };
}

function getCategoryId(categories: Category[] | undefined, name: string): string {
  const cat = categories?.find((c) => c.name === name || c.name.includes(name) || name.includes(c.name));
  return cat?.id ?? '';
}

// ── Component ──

export default function Home() {
  const { user, _hasHydrated } = useAuthStore();
  const [productTab, setProductTab] = useState<'recommend' | 'new' | 'sale'>('recommend');
  const [rankingTab, setRankingTab] = useState('総合');
  const [couponStates, setCouponStates] = useState<boolean[]>(new Array(coupons.length).fill(false));

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  // Fetch products for main grid (larger set)
  const { data: productsRes } = useQuery<ProductsResponse>({
    queryKey: ['products', 'home'],
    queryFn: () => api.get('/products', { params: { limit: 25 } }).then((r) => r.data),
  });

  // Fetch hot deals
  const { data: hotDeals } = useQuery<Product[]>({
    queryKey: ['hot-deals'],
    queryFn: () => api.get('/products/hot-deals').then((r) => r.data),
  });

  const allProducts = productsRes?.data ?? [];

  // Products for the grid (first 10)
  const gridProducts = allProducts.slice(0, 10);

  // Products for ranking (top 6 — cheapest with discounts first as "best sellers")
  const rankingProducts = [...allProducts]
    .sort((a, b) => {
      const aDiscount = a.discountPercent ?? 0;
      const bDiscount = b.discountPercent ?? 0;
      return bDiscount - aDiscount || a.price - b.price;
    })
    .slice(0, 6);

  // Sidebar ranking (top 5 by price ascending — "popular affordable items")
  const sideRanking = [...allProducts]
    .sort((a, b) => a.price - b.price)
    .slice(0, 5);

  // Browsing history — use last 8 products
  const historyProducts = allProducts.slice(0, 8);

  // Filter sidebar categories to only those that exist in DB
  const sideCategories = sidebarCategoryNames
    .map((name) => {
      const cat = categories?.find((c) => c.name === name);
      return cat ? { ...cat, icon: categoryIconMap[name] || '📦' } : null;
    })
    .filter(Boolean) as (Category & { icon: string })[];

  const handleCouponGet = (i: number) => {
    setCouponStates((prev) => { const n = [...prev]; n[i] = true; return n; });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <TopBar />
      <Ticker />
      <Navbar />

      {/* Notice bar */}
      <div
        className="text-center"
        style={{
          background: '#fff9e6',
          borderBottom: '1px solid #f5c842',
          padding: '6px 12px',
          fontSize: '0.78rem',
          color: '#664d00',
        }}
      >
        🔔 本日のおすすめ：夏のビッグセール開催中！人気商品が最大70%OFF。
        <Link href="/hot-deals" className="ml-2 font-bold" style={{ color: 'var(--color-primary)' }}>
          詳細はこちら →
        </Link>
      </div>

      {/* Main grid */}
      <div className="mx-auto grid gap-3" style={{ maxWidth: 1200, padding: 12, gridTemplateColumns: '200px 1fr' }}>

        {/* ── Sidebar ── */}
        <aside className="flex flex-col gap-[10px]">
          {/* Points box */}
          <SidebarBox>
            <div className="p-4 text-center">
              <div className="font-bold" style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>
                1,250<span style={{ fontSize: '0.85rem' }}>pt</span>
              </div>
              <div className="mb-2" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                {_hasHydrated && user ? `${user.name} さんの保有ポイント` : 'ゲスト さんの保有ポイント'}
              </div>
              <Link
                href="/mypage/profile"
                className="block rounded-[3px] text-center font-bold text-white"
                style={{ background: 'var(--color-primary)', padding: 7, fontSize: '0.78rem' }}
              >
                ポイントを使う
              </Link>
            </div>
          </SidebarBox>

          {/* Categories */}
          <SidebarBox>
            <div className="font-bold" style={{ background: 'var(--color-border-inner)', padding: '8px 12px', fontSize: '0.82rem' }}>
              カテゴリ一覧
            </div>
            {sideCategories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className="flex items-center gap-2 transition-colors duration-[120ms] hover:bg-[var(--color-hover-red-bg)] hover:text-[var(--color-primary)]"
                style={{
                  padding: '7px 12px',
                  fontSize: '0.8rem',
                  color: 'var(--color-text)',
                  borderBottom: i < sideCategories.length - 1 ? '1px solid var(--color-border-inner)' : 'none',
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="ml-auto" style={{ color: '#ccc', fontSize: '0.7rem' }}>›</span>
              </Link>
            ))}
            <Link
              href="/products"
              className="block font-bold"
              style={{ padding: '7px 12px', fontSize: '0.78rem', color: 'var(--color-primary)' }}
            >
              ▼ すべて見る
            </Link>
          </SidebarBox>

          {/* Side ranking */}
          <SidebarBox>
            <div className="font-bold" style={{ background: 'var(--color-border-inner)', padding: '8px 12px', fontSize: '0.82rem' }}>
              🏆 売上ランキング
            </div>
            {sideRanking.map((item, i) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="flex items-center gap-2 transition-colors duration-[120ms] hover:bg-[var(--color-hover-red-bg)]"
                style={{
                  padding: '7px 12px',
                  fontSize: '0.78rem',
                  borderBottom: i < sideRanking.length - 1 ? '1px solid var(--color-border-inner)' : 'none',
                }}
              >
                <span className="min-w-[20px] font-bold" style={{ color: getRankColor(i + 1) }}>{i + 1}位</span>
                <span className="flex-1 truncate">{item.name}</span>
                <span className="shrink-0 font-bold" style={{ color: 'var(--color-price)', fontSize: '0.72rem' }}>
                  {formatPrice(calcDiscount(item).displayPrice)}
                </span>
              </Link>
            ))}
          </SidebarBox>

          {/* Premium banner */}
          <SidebarBox>
            <div className="p-4 text-center text-white" style={{ background: 'linear-gradient(135deg, #0075c2, #00b4d8)' }}>
              <div className="mb-1.5 inline-block rounded-[10px] px-2 py-[2px]" style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.2)' }}>
                会員限定
              </div>
              <div className="mb-1 font-bold" style={{ fontSize: '1rem' }}>プレミアム会員</div>
              <div className="mb-2.5" style={{ fontSize: '0.68rem', opacity: 0.9 }}>ポイント2倍・送料無料・先行セール</div>
              <Link
                href="/mypage/profile"
                className="inline-block rounded-[20px] font-bold"
                style={{ background: 'white', color: '#0075c2', padding: '6px 16px', fontSize: '0.72rem' }}
              >
                詳細を見る
              </Link>
            </div>
          </SidebarBox>
        </aside>

        {/* ── Main content ── */}
        <main className="flex flex-col gap-3">
          {/* Hero banner */}
          <div
            className="relative overflow-hidden rounded-[6px] text-white"
            style={{
              height: 200,
              background: 'linear-gradient(135deg, #ff0033 0%, #ff6b35 50%, #ff9a00 100%)',
              padding: '28px 32px',
            }}
          >
            <span className="pointer-events-none absolute" style={{ right: -30, top: -40, fontSize: '13rem', opacity: 0.07 }}>🛍</span>
            <span
              className="mb-2 inline-block rounded-[20px] font-bold"
              style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', fontSize: '0.72rem' }}
            >
              期間限定 〜7/31まで
            </span>
            <h1 className="mb-1.5" style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.2 }}>
              夏のビッグセール<br />開催中！
            </h1>
            <p className="mb-3.5" style={{ fontSize: '0.85rem', opacity: 0.88 }}>
              人気商品が最大70%OFF・ポイント5倍
            </p>
            <Link
              href="/hot-deals"
              className="inline-block rounded-[20px] font-bold transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              style={{ background: 'white', color: 'var(--color-primary)', padding: '8px 20px', fontSize: '0.82rem' }}
            >
              セール会場へ →
            </Link>
            <div
              className="absolute text-center"
              style={{
                right: 32, bottom: 24,
                background: 'white', color: 'var(--color-primary)',
                padding: '10px 16px', borderRadius: 6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              }}
            >
              <div style={{ fontSize: '0.68rem' }}>最大</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1 }}>70%</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700 }}>OFF</div>
              <div style={{ fontSize: '0.55rem', color: 'var(--color-text-muted)' }}>対象商品限定</div>
            </div>
          </div>

          {/* Mini banners */}
          <div className="grid grid-cols-3 gap-2">
            {miniBanners.map((b) => (
              <div
                key={b.title}
                className="flex cursor-pointer items-center gap-2.5 rounded-[5px] text-white transition-opacity duration-150 hover:opacity-88"
                style={{ background: b.bg, padding: '14px 16px' }}
              >
                <span style={{ fontSize: '2rem' }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: '0.62rem', opacity: 0.9 }}>{b.label}</div>
                  <div className="font-bold" style={{ fontSize: '0.95rem' }}>{b.title}</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Category icons */}
          <SectionBox>
            <SectionHeader icon="📂" title="ジャンルから探す" linkText="すべてのカテゴリ ›" linkHref="/products" />
            <div className="grid grid-cols-10 grid-separator">
              {navCategoryIcons.map((cat) => {
                const catId = getCategoryId(categories, cat.name);
                const href = cat.sale ? '/hot-deals' : catId ? `/products?categoryId=${catId}` : '/products';
                return (
                  <Link
                    key={cat.name}
                    href={href}
                    className="text-center transition-colors duration-[120ms] hover:bg-[var(--color-hover-red-bg)]"
                    style={{ background: cat.sale ? '#fff0f0' : 'white', padding: '14px 6px' }}
                  >
                    <div className="mb-1" style={{ fontSize: '1.6rem' }}>{cat.icon}</div>
                    <div style={{ fontSize: '0.68rem', color: cat.sale ? 'var(--color-primary)' : 'var(--color-text-mid)' }}>{cat.name}</div>
                  </Link>
                );
              })}
            </div>
          </SectionBox>

          {/* Product grid */}
          <SectionBox>
            <SectionHeader icon="💡" title="おすすめ商品" linkText="もっと見る ›" linkHref="/products" />
            <div className="flex" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
              {([['recommend', 'あなたへのおすすめ'], ['new', '新着商品'], ['sale', 'セール']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setProductTab(key)}
                  className="cursor-pointer border-none bg-transparent transition-colors duration-[120ms]"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.78rem',
                    fontWeight: productTab === key ? 700 : 400,
                    color: productTab === key ? 'var(--color-primary)' : '#666',
                    borderBottom: `2px solid ${productTab === key ? 'var(--color-primary)' : 'transparent'}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-5 grid-separator">
              {(productTab === 'sale' ? (hotDeals ?? []).slice(0, 10) : gridProducts).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
              {gridProducts.length === 0 && (
                <div className="col-span-5 py-12 text-center" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  商品を読み込み中...
                </div>
              )}
            </div>
          </SectionBox>

          {/* Ranking */}
          <SectionBox>
            <SectionHeader icon="🏆" title="売れ筋ランキング" linkText="全ランキングを見る ›" linkHref="/products" />
            <div className="flex" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
              {['総合', 'ファッション', '家電・PC', '食品'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRankingTab(tab)}
                  className="cursor-pointer border-none bg-transparent"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.78rem',
                    fontWeight: rankingTab === tab ? 700 : 400,
                    color: rankingTab === tab ? 'var(--color-primary)' : '#666',
                    borderBottom: `2px solid ${rankingTab === tab ? 'var(--color-primary)' : 'transparent'}`,
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 grid-separator">
              {rankingProducts
                .filter((item) => {
                  if (rankingTab === '総合') return true;
                  return item.category?.name?.includes(rankingTab) || rankingTab.includes(item.category?.name);
                })
                .slice(0, 6)
                .map((item, idx) => {
                  const { displayPrice } = calcDiscount(item);
                  return (
                    <Link
                      key={item.id}
                      href={`/products/${item.id}`}
                      className="flex items-center gap-2.5 bg-white transition-colors duration-[120ms] hover:bg-[var(--color-hover-red-bg)]"
                      style={{ padding: '10px 12px' }}
                    >
                      <span className="min-w-[24px] font-bold" style={{ fontSize: '1.4rem', color: getRankColor(idx + 1) }}>
                        {idx + 1}
                      </span>
                      <div
                        className="flex shrink-0 items-center justify-center overflow-hidden rounded-[3px]"
                        style={{ width: 52, height: 52, background: '#f5f5f5' }}
                      >
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} width={52} height={52} className="object-cover" />
                        ) : (
                          <span style={{ fontSize: '1.6rem' }}>{categoryIconMap[item.category?.name] || '📦'}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate" style={{ fontSize: '0.78rem', color: 'var(--color-text)' }}>{item.name}</div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold" style={{ color: 'var(--color-price)', fontSize: '0.9rem' }}>
                            {formatPrice(displayPrice)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </SectionBox>

          {/* Coupons */}
          <SectionBox>
            <SectionHeader icon="🎟" title="お得なクーポン" linkText="クーポン一覧 ›" linkHref="/mypage/coupons" />
            <div className="grid grid-cols-4 gap-2 p-3">
              {coupons.map((c, i) => (
                <div
                  key={i}
                  className="relative cursor-pointer overflow-hidden rounded-[6px] bg-white p-3 text-center transition-colors duration-[120ms] hover:bg-[var(--color-hover-red-bg)]"
                  style={{ border: '2px dashed var(--color-primary)' }}
                >
                  <div className="absolute top-0 right-0 left-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #ff0033, #ff9a00)' }} />
                  <div className="mt-1.5">
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-primary)' }}>{c.value}</span>
                    <span className="font-bold" style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{c.unit}</span>
                  </div>
                  <div className="mt-1" style={{ fontSize: '0.72rem', color: '#666' }}>{c.desc}</div>
                  <div className="mt-0.5" style={{ fontSize: '0.65rem', color: '#999' }}>{c.expires}</div>
                  <button
                    onClick={() => handleCouponGet(i)}
                    className="mt-2 cursor-pointer rounded-[20px] border-none font-bold text-white transition-colors duration-150"
                    style={{
                      background: couponStates[i] ? 'var(--color-green)' : 'var(--color-primary)',
                      padding: '5px 16px',
                      fontSize: '0.68rem',
                    }}
                  >
                    {couponStates[i] ? '✓ 取得済み' : '取得する'}
                  </button>
                </div>
              ))}
            </div>
          </SectionBox>

          {/* History */}
          <SectionBox>
            <SectionHeader icon="🕐" title="閲覧履歴" linkText="履歴をクリア" linkHref="#" />
            <div className="history-scrollbar flex overflow-x-auto grid-separator">
              {historyProducts.map((item) => {
                const { displayPrice } = calcDiscount(item);
                return (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className="shrink-0 bg-white p-3 text-center transition-colors duration-[120ms] hover:bg-[var(--color-hover-red-bg)]"
                    style={{ minWidth: 100 }}
                  >
                    <div
                      className="mx-auto mb-1.5 flex items-center justify-center overflow-hidden rounded"
                      style={{ width: 72, height: 72, background: '#f5f5f5' }}
                    >
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} width={72} height={72} className="object-cover" />
                      ) : (
                        <span style={{ fontSize: '2rem' }}>{categoryIconMap[item.category?.name] || '📦'}</span>
                      )}
                    </div>
                    <div className="font-bold" style={{ color: 'var(--color-price)', fontSize: '0.82rem' }}>
                      {formatPrice(displayPrice)}
                    </div>
                  </Link>
                );
              })}
            </div>
          </SectionBox>
        </main>
      </div>

      <Footer />
    </div>
  );
}

// ── Sub-components ──

function SidebarBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded bg-white" style={{ border: '1px solid var(--color-border)' }}>
      {children}
    </div>
  );
}

function SectionBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded bg-white" style={{ border: '1px solid var(--color-border)' }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, linkText, linkHref }: { icon: string; title: string; linkText: string; linkHref: string }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: '10px 14px' }}>
      <h2 className="flex items-center gap-1.5 font-bold" style={{ fontSize: '0.95rem' }}>
        <span>{icon}</span> {title}
      </h2>
      <Link href={linkHref} style={{ fontSize: '0.72rem', color: 'var(--color-primary)' }}>
        {linkText}
      </Link>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { displayPrice, oldPrice, discountLabel } = calcDiscount(product);
  const badge = product.isHotDeal
    ? { text: 'SALE', bg: '#ff0033', color: 'white' }
    : product.discountPercent && product.discountPercent >= 40
      ? { text: `${product.discountPercent}%OFF`, bg: '#f5a623', color: '#333' }
      : null;

  return (
    <Link
      href={`/products/${product.id}`}
      className="relative block bg-white p-3 transition-shadow duration-[120ms] hover:shadow-[inset_0_0_0_2px_var(--color-primary)]"
      style={{ color: 'var(--color-text)' }}
    >
      {badge && (
        <span
          className="absolute top-2 left-2 z-10 rounded-[2px] font-bold"
          style={{ fontSize: '0.6rem', padding: '2px 6px', background: badge.bg, color: badge.color }}
        >
          {badge.text}
        </span>
      )}

      <div
        className="mb-2 flex items-center justify-center overflow-hidden rounded"
        style={{ aspectRatio: '1', background: '#f5f5f5' }}
      >
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} width={200} height={200} className="h-full w-full object-cover" />
        ) : (
          <span style={{ fontSize: '3rem' }}>{categoryIconMap[product.category?.name] || '📦'}</span>
        )}
      </div>

      <div className="mb-0.5" style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
        {product.category?.name}
      </div>

      <div
        className="mb-1"
        style={{
          fontSize: '0.78rem',
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {product.name}
      </div>

      <div className="flex flex-wrap items-baseline gap-1">
        <span className="font-bold" style={{ fontSize: '1.05rem', color: 'var(--color-price)' }}>
          {formatPrice(displayPrice)}
        </span>
        {oldPrice && (
          <span className="line-through" style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
            {formatPrice(oldPrice)}
          </span>
        )}
        {discountLabel && (
          <span className="rounded-[2px] font-bold text-white" style={{ fontSize: '0.6rem', background: 'var(--color-primary)', padding: '1px 4px' }}>
            {discountLabel}
          </span>
        )}
      </div>

      <div className="mt-0.5" style={{ fontSize: '0.68rem', color: 'var(--color-point)' }}>
        🟡 {Math.floor(displayPrice * 0.05)}ポイント
      </div>

      {product.stock <= 10 && product.stock > 0 && (
        <div className="mt-1">
          <span className="rounded-[2px]" style={{ fontSize: '0.62rem', border: '1px solid #ddd', padding: '1px 4px', color: '#666' }}>
            残り{product.stock}点
          </span>
        </div>
      )}
    </Link>
  );
}
