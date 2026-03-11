'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';
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
  dealExpiresAt: string | null;
  stock: number;
  imageUrl: string | null;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

type SortKey = 'discount' | 'price_asc' | 'review' | 'newest';

const effectivePrice = (p: { price: number; discountPrice: number | null }) =>
  p.discountPrice ?? p.price;

const SALE_TABS = [
  { icon: '🛍', label: 'すべて', id: '' },
  { icon: '👗', label: 'ファッション', id: 'fashion' },
  { icon: '💻', label: '家電・PC', id: 'electronics' },
  { icon: '🍱', label: '食品・飲料', id: 'food' },
  { icon: '💄', label: '美容・健康', id: 'beauty' },
  { icon: '⚽', label: 'スポーツ', id: 'sports' },
  { icon: '🍳', label: 'キッチン', id: 'kitchen' },
  { icon: '📚', label: '本・CD', id: 'books' },
];

const DISCOUNT_FILTERS = ['10%以上', '30%以上', '50%以上', '70%以上'] as const;
const PRICE_FILTERS = ['¥1,000未満', '¥1,000〜3,000', '¥3,000〜10,000', '¥10,000〜30,000', '¥30,000以上'] as const;
const CONDITION_FILTERS = ['送料無料', '翌日配送対応', 'ポイント2倍以上', '在庫あり', 'クーポン使える'] as const;
const RATING_FILTERS = ['★4以上', '★3以上'] as const;

const COUPONS = [
  { id: 1, off: '¥500', offLabel: 'OFF', cond: '3,000円以上・家電PCカテゴリ限定', exp: '2026年3月14日' },
  { id: 2, off: '10%', offLabel: 'OFF', cond: 'ファッション全品・1会計1回まで', exp: '2026年3月15日' },
  { id: 3, off: '¥1,000', offLabel: 'OFF', cond: '10,000円以上・全カテゴリ対象', exp: '2026年3月13日' },
];

const PICKUP_BANNERS = [
  { color: 'bg-gradient-to-br from-[#ff0033] to-[#cc0029]', tag: 'LIMITED', icon: '⚡', title: 'タイムセール 本日限定', cta: '今すぐチェック →' },
  { color: 'bg-gradient-to-br from-[#ff6b00] to-[#ff8c00]', tag: 'POPULAR', icon: '🏆', title: 'ランキング上位セール品', cta: 'ランキングを見る →' },
  { color: 'bg-gradient-to-br from-[#0055cc] to-[#0075c2]', tag: 'MEMBERS ONLY', icon: '👑', title: '会員限定 特別クーポン', cta: 'クーポンを取得 →' },
];

const SIDEBAR_CATEGORIES = [
  { icon: '🛍', name: 'すべて', off: null },
  { icon: '👗', name: 'ファッション', off: '70%' },
  { icon: '💻', name: '家電・PC', off: '60%' },
  { icon: '📱', name: 'スマホ周辺', off: '55%' },
  { icon: '🍱', name: '食品・飲料', off: '40%' },
  { icon: '💄', name: '美容・健康', off: '50%' },
  { icon: '⚽', name: 'スポーツ', off: '65%' },
  { icon: '🍳', name: 'キッチン', off: '45%' },
  { icon: '📚', name: '本・CD・ゲーム', off: '30%' },
  { icon: '🛋', name: 'インテリア', off: '50%' },
];

export default function HotDealsPage() {
  const [activeTab, setActiveTab] = useState('');
  const [activeCat, setActiveCat] = useState('すべて');
  const [sort, setSort] = useState<SortKey>('discount');
  const [page, setPage] = useState(1);
  const [gottenCoupons, setGottenCoupons] = useState<Set<number>>(new Set());
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [flashTime, setFlashTime] = useState('02:45:33');

  // Countdown timer
  useEffect(() => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);
    endDate.setHours(23, 59, 59, 0);

    const tick = () => {
      const diff = endDate.getTime() - Date.now();
      if (diff <= 0) return;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Flash timer
  useEffect(() => {
    let totalSec = 2 * 3600 + 45 * 60 + 33;
    const id = setInterval(() => {
      totalSec = Math.max(0, totalSec - 1);
      const hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
      const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
      const ss = String(totalSec % 60).padStart(2, '0');
      setFlashTime(`${hh}:${mm}:${ss}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['hot-deals'],
    queryFn: () => api.get('/products/hot-deals').then((r) => r.data),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const getCoupon = (id: number) => {
    setGottenCoupons((prev) => new Set(prev).add(id));
  };

  // Filter and sort products
  const filteredProducts = (() => {
    if (!products) return [];
    let list = [...products];

    // Filter by category tab
    if (activeTab) {
      const catMatch = categories?.find((c) => c.name.includes(activeTab) || activeTab.includes(c.name));
      if (catMatch) list = list.filter((p) => p.category.id === catMatch.id);
    }

    // Sort
    switch (sort) {
      case 'discount':
        list.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
        break;
      case 'price_asc':
        list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case 'newest':
        break; // Already sorted by newest from API
      case 'review':
        break; // No review data, keep as-is
    }

    return list;
  })();

  const totalProducts = filteredProducts.length;
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(totalProducts / perPage));
  const pagedProducts = filteredProducts.slice((page - 1) * perPage, page * perPage);

  // Top 5 for ranking
  const rankingProducts = (products ?? [])
    .filter((p) => p.discountPercent)
    .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))
    .slice(0, 5);

  // Flash sale items (first 6 products)
  const flashItems = (products ?? []).slice(0, 6);

  const getStockLabel = (stock: number) => {
    if (stock < 10) return { label: '残りわずか！', hot: true };
    if (stock < 30) return { label: '人気急上昇！', hot: true };
    if (stock < 50) return { label: '売れ筋！', hot: true };
    return { label: `残り${stock}個`, hot: false };
  };

  const getStockPercent = (stock: number) => {
    const maxStock = 100;
    return Math.min(100, Math.max(5, ((maxStock - stock) / maxStock) * 100));
  };

  const getRankColor = (i: number) => {
    if (i === 0) return 'text-[#f5a623]';
    if (i === 1) return 'text-[#9e9e9e]';
    if (i === 2) return 'text-[#a1673a]';
    return 'text-[#555]';
  };

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
            <span>🔥 セール会場</span>
          </nav>

          {/* Hero banner */}
          <div
            className="rounded-md px-8 py-7 mb-3.5 relative overflow-hidden flex items-center justify-between gap-5"
            style={{ background: 'linear-gradient(135deg, #cc0000 0%, #ff0033 40%, #ff4500 100%)' }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-[200px] h-[200px] bg-white/[0.06] rounded-full" />
            <div className="absolute -bottom-[60px] left-[30%] w-[280px] h-[280px] bg-white/[0.04] rounded-full" />

            <div className="relative z-[1]">
              <p className="text-[0.72rem] font-bold text-white/80 tracking-[0.1em] uppercase mb-1.5">
                SUMMER MEGA SALE 2026
              </p>
              <h1 className="text-[2rem] font-bold text-white leading-[1.2] mb-2">
                夏のメガセール<br />
                <span className="bg-[#fff200] text-[#cc0000] px-1.5 rounded-sm">最大70%OFF</span>
              </h1>
              <p className="text-[0.85rem] text-white/90 mb-4 leading-[1.6]">
                人気ブランド・話題の商品が驚きの価格で登場！<br />
                期間限定のスペシャルプライスをお見逃しなく。
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-[#fff200] text-[#cc0000] border border-[#fff200] text-[0.72rem] font-bold px-2.5 py-1 rounded-full">
                  🔥 最大70%OFF
                </span>
                {['送料無料対象多数', 'ポイント最大10倍', '会員限定クーポン配布中'].map((b) => (
                  <span key={b} className="bg-white/15 border border-white/30 text-white text-[0.72rem] font-bold px-2.5 py-1 rounded-full">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Countdown */}
            <div className="relative z-[1] text-center flex-shrink-0">
              <p className="text-[0.72rem] text-white/80 mb-1.5 tracking-[0.05em]">セール終了まで</p>
              <div className="flex gap-1.5 items-center">
                {[
                  { val: countdown.d, lbl: '日' },
                  { val: countdown.h, lbl: '時間' },
                  { val: countdown.m, lbl: '分' },
                  { val: countdown.s, lbl: '秒' },
                ].map((c, i) => (
                  <span key={c.lbl} className="flex items-center gap-1.5">
                    <span className="bg-black/30 rounded px-2.5 py-2 text-center min-w-[52px]">
                      <span className="text-[1.6rem] font-bold text-[#fff200] leading-none block" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {String(c.val).padStart(2, '0')}
                      </span>
                      <span className="text-[0.6rem] text-white/70 mt-0.5 block">{c.lbl}</span>
                    </span>
                    {i < 3 && <span className="text-[1.4rem] font-bold text-white/50 mb-3">:</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-px bg-[#e0e0e0] border border-[#e0e0e0] rounded overflow-hidden mb-3.5">
            {[
              { num: `${totalProducts > 0 ? totalProducts.toLocaleString() : '---'}件`, lbl: '対象商品数' },
              { num: '最大70%', lbl: '割引率' },
              { num: '10倍', lbl: 'ポイント還元（最大）' },
              { num: '¥3,000以上', lbl: '送料無料' },
            ].map((s) => (
              <div key={s.lbl} className="bg-white px-4 py-3 text-center">
                <p className="text-[1.3rem] font-bold text-[#ff0033] leading-none">{s.num}</p>
                <p className="text-[0.72rem] text-[#888] mt-0.5">{s.lbl}</p>
              </div>
            ))}
          </div>

          {/* Category tabs */}
          <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden mb-3.5">
            <div className="flex overflow-x-auto border-b-2 border-[#ff0033] nav-scroll">
              {SALE_TABS.map((tab) => (
                <span
                  key={tab.label}
                  onClick={() => { setActiveTab(tab.id); setPage(1); }}
                  className={`flex items-center gap-[5px] px-[18px] py-2.5 text-[0.82rem] whitespace-nowrap cursor-pointer border-b-[3px] -mb-[2px] transition-colors ${
                    activeTab === tab.id
                      ? 'text-[#ff0033] border-[#ff0033] font-bold bg-white'
                      : 'text-[#555] border-transparent font-medium hover:text-[#ff0033]'
                  }`}
                >
                  {tab.icon} {tab.label}
                </span>
              ))}
            </div>
          </div>

          {/* Pickup banners */}
          <div className="grid grid-cols-3 gap-2.5 mb-3.5">
            {PICKUP_BANNERS.map((b) => (
              <div key={b.tag} className={`${b.color} rounded overflow-hidden cursor-pointer`}>
                <div className="px-4 py-[18px] flex flex-col justify-between min-h-[110px]">
                  <div>
                    <p className="text-[0.65rem] font-bold text-white/80 tracking-[0.1em] uppercase">{b.tag}</p>
                    <p className="text-[1rem] font-bold text-white leading-[1.3] my-1">{b.icon} {b.title}</p>
                  </div>
                  <span className="inline-block self-start mt-2.5 bg-white/20 border border-white/40 text-white text-[0.7rem] font-bold px-3 py-1 rounded-full hover:bg-white/[0.35] transition-colors">
                    {b.cta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Flash sale strip */}
          <div
            className="rounded px-4 py-2.5 mb-3.5 flex items-center gap-3.5 overflow-hidden"
            style={{ background: 'linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%)' }}
          >
            <span className="bg-[#ff0033] text-white text-[0.72rem] font-bold px-2.5 py-1 rounded-sm whitespace-nowrap flex-shrink-0">
              ⚡ タイムセール
            </span>
            <div className="flex gap-3 overflow-x-auto flex-1 nav-scroll">
              {flashItems.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="bg-white/[0.08] border border-white/[0.12] rounded-sm px-3 py-1.5 flex items-center gap-2.5 flex-shrink-0 hover:bg-white/15 transition-colors"
                >
                  <span className="text-[1.5rem]">
                    {p.imageUrl ? (
                      <span className="w-8 h-8 relative block rounded overflow-hidden">
                        <Image src={p.imageUrl} alt="" fill className="object-cover" />
                      </span>
                    ) : '📦'}
                  </span>
                  <div>
                    <p className="text-[0.72rem] text-white/90 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis">{p.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.88rem] font-bold text-[#ff6b6b]">¥{effectivePrice(p).toLocaleString()}</span>
                      {p.discountPercent && (
                        <span className="text-[0.6rem] text-[#fff200] font-bold">{p.discountPercent}%OFF</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <span className="text-[0.72rem] text-white/60 flex-shrink-0 flex items-center gap-1">
              残り <span className="text-[#ff6b6b] font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{flashTime}</span>
            </span>
          </div>

          {/* Main layout */}
          <div className="grid grid-cols-[200px_1fr] gap-3 items-start">
            {/* Sidebar */}
            <div>
              {/* Category list */}
              <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden mb-2.5">
                <div className="bg-[#f0f0f0] px-3 py-2 text-[0.82rem] font-bold text-[#444] border-b border-[#e0e0e0]">
                  カテゴリ
                </div>
                <ul className="list-none p-0 m-0">
                  {SIDEBAR_CATEGORIES.map((cat) => (
                    <li key={cat.name}>
                      <span
                        onClick={() => { setActiveCat(cat.name); setPage(1); }}
                        className={`flex items-center justify-between px-3 py-[7px] text-[0.8rem] border-b border-[#f0f0f0] cursor-pointer transition-colors ${
                          activeCat === cat.name
                            ? 'bg-[#fff5f5] text-[#ff0033] font-bold'
                            : 'text-[#333] hover:bg-[#fff5f5] hover:text-[#ff0033]'
                        }`}
                      >
                        <span>{cat.icon} {cat.name}</span>
                        {cat.off && (
                          <span className="bg-[#ff0033] text-white text-[0.58rem] font-bold px-1 py-px rounded-sm">{cat.off}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Filter boxes */}
              <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden mb-2.5">
                <div className="bg-[#f0f0f0] px-3 py-2 text-[0.82rem] font-bold text-[#444] border-b border-[#e0e0e0]">
                  絞り込み
                </div>

                {/* Discount filter */}
                <div className="px-3 py-2.5 border-b border-[#f0f0f0]">
                  <p className="text-[0.78rem] font-bold text-[#333] mb-[7px]">割引率で絞る</p>
                  <div className="flex flex-col gap-[5px]">
                    {DISCOUNT_FILTERS.map((f) => (
                      <label key={f} className="flex items-center gap-1.5 text-[0.78rem] text-[#444] cursor-pointer hover:text-[#ff0033]">
                        <input type="checkbox" className="w-[13px] h-[13px] accent-[#ff0033]" />
                        {f}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price filter */}
                <div className="px-3 py-2.5 border-b border-[#f0f0f0]">
                  <p className="text-[0.78rem] font-bold text-[#333] mb-[7px]">価格帯で絞る</p>
                  <div className="flex flex-col gap-[5px]">
                    {PRICE_FILTERS.map((f) => (
                      <label key={f} className="flex items-center gap-1.5 text-[0.78rem] text-[#444] cursor-pointer hover:text-[#ff0033]">
                        <input type="checkbox" className="w-[13px] h-[13px] accent-[#ff0033]" />
                        {f}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Condition filter */}
                <div className="px-3 py-2.5 border-b border-[#f0f0f0]">
                  <p className="text-[0.78rem] font-bold text-[#333] mb-[7px]">条件で絞る</p>
                  <div className="flex flex-col gap-[5px]">
                    {CONDITION_FILTERS.map((f) => (
                      <label key={f} className="flex items-center gap-1.5 text-[0.78rem] text-[#444] cursor-pointer hover:text-[#ff0033]">
                        <input type="checkbox" className="w-[13px] h-[13px] accent-[#ff0033]" />
                        {f}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating filter */}
                <div className="px-3 py-2.5">
                  <p className="text-[0.78rem] font-bold text-[#333] mb-[7px]">評価</p>
                  <div className="flex flex-col gap-[5px]">
                    {RATING_FILTERS.map((f) => (
                      <label key={f} className="flex items-center gap-1.5 text-[0.78rem] text-[#444] cursor-pointer hover:text-[#ff0033]">
                        <input type="checkbox" className="w-[13px] h-[13px] accent-[#ff0033]" />
                        {f}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div>
              {/* Coupon section */}
              <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden mb-3">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b-2 border-[#ff0033]">
                  <h2 className="text-[0.95rem] font-bold text-[#222] flex items-center gap-1.5">🎫 セール限定クーポン</h2>
                  <span className="text-[0.75rem] text-[#ff0033] hover:underline cursor-pointer">すべて見る →</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 p-3.5">
                  {COUPONS.map((c) => {
                    const gotten = gottenCoupons.has(c.id);
                    return (
                      <div
                        key={c.id}
                        className={`border-2 border-dashed rounded-md px-3.5 py-3 relative overflow-hidden cursor-pointer transition-colors ${
                          gotten ? 'border-[#2e7d32] hover:bg-[#f8fff8]' : 'border-[#ff0033] hover:bg-[#fff8f8]'
                        }`}
                      >
                        {/* Notches */}
                        <div className="absolute -left-px top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#f4f4f4] rounded-full border-2 border-dashed border-[#ff0033]" />
                        <div className="absolute -right-px top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#f4f4f4] rounded-full border-2 border-dashed border-[#ff0033]" />

                        <p className={`text-[1.4rem] font-bold leading-none ${gotten ? 'text-[#2e7d32]' : 'text-[#ff0033]'}`}>
                          {c.off} <small className="text-[0.75rem] font-normal">{c.offLabel}</small>
                        </p>
                        <p className="text-[0.7rem] text-[#888] mt-0.5 leading-[1.5]">{c.cond}</p>
                        <p className="text-[0.65rem] text-[#aaa] mt-1.5">有効期限: {c.exp}</p>
                        <button
                          onClick={() => getCoupon(c.id)}
                          disabled={gotten}
                          className={`block w-full mt-2 border-none py-[5px] rounded-sm text-[0.72rem] font-bold text-center cursor-pointer transition-colors ${
                            gotten
                              ? 'bg-[#2e7d32] text-white'
                              : 'bg-[#ff0033] text-white hover:bg-[#cc0029]'
                          }`}
                        >
                          {gotten ? '✓ 取得済み' : 'クーポンを取得'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Result bar */}
              <div className="bg-white border border-[#e0e0e0] rounded px-3.5 py-2.5 mb-2 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[0.82rem] text-[#555]">
                  セール商品 <strong className="text-[#ff0033] text-[1rem]">{totalProducts}</strong> 件
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[0.75rem] text-[#888]">並び替え:</span>
                  {([
                    { key: 'discount' as SortKey, label: '割引率が高い順' },
                    { key: 'price_asc' as SortKey, label: '価格が安い順' },
                    { key: 'review' as SortKey, label: 'レビュー評価順' },
                    { key: 'newest' as SortKey, label: '新着順' },
                  ]).map((s) => (
                    <button
                      key={s.key}
                      onClick={() => { setSort(s.key); setPage(1); }}
                      className={`text-[0.75rem] px-2.5 py-1 border rounded-sm cursor-pointer transition-colors ${
                        sort === s.key
                          ? 'bg-[#ff0033] text-white border-[#ff0033]'
                          : 'bg-white text-[#444] border-[#ddd] hover:border-[#ff0033] hover:text-[#ff0033]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product grid */}
              {isLoading ? (
                <div className="grid grid-cols-5 gap-px bg-[#e8e8e8]">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="bg-white p-2.5">
                      <div className="w-full aspect-square bg-[#f0f0f0] rounded-sm mb-[7px] animate-pulse" />
                      <div className="h-3 bg-[#f0f0f0] rounded w-2/3 mb-1.5 animate-pulse" />
                      <div className="h-4 bg-[#f0f0f0] rounded w-1/2 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : pagedProducts.length === 0 ? (
                <div className="bg-white border border-[#e0e0e0] rounded text-center py-12">
                  <p className="text-3xl mb-2">🔥</p>
                  <p className="text-[0.88rem] font-bold text-[#444]">現在セール中の商品はありません</p>
                  <p className="text-[0.78rem] text-[#888] mt-1">新しいオファーをお楽しみに。</p>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-px bg-[#e8e8e8]">
                  {pagedProducts.map((p, idx) => {
                    const price = effectivePrice(p);
                    const stockInfo = getStockLabel(p.stock);
                    const stockPct = getStockPercent(p.stock);
                    const globalIdx = (page - 1) * perPage + idx;

                    return (
                      <Link
                        key={p.id}
                        href={`/products/${p.id}`}
                        className="bg-white p-2.5 cursor-pointer transition-shadow relative hover:shadow-[inset_0_0_0_2px_#ff0033] hover:z-[1] group"
                      >
                        {/* Image */}
                        <div className="w-full aspect-square bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8] rounded-sm mb-[7px] relative overflow-hidden flex items-center justify-center">
                          {p.imageUrl ? (
                            <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                          ) : (
                            <span className="text-[2.5rem]">📦</span>
                          )}
                          {/* Badges */}
                          <div className="absolute top-[5px] left-[5px] flex flex-col gap-0.5">
                            {globalIdx < 3 && (
                              <span className="bg-[#f5a623] text-[#333] text-[0.58rem] font-bold px-[5px] py-0.5 rounded-sm block">
                                {globalIdx + 1}位
                              </span>
                            )}
                            <span className="bg-[#ff0033] text-white text-[0.58rem] font-bold px-[5px] py-0.5 rounded-sm block">
                              SALE
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <p className="text-[0.65rem] text-[#888] mb-0.5">モールショップ</p>
                        <p className="text-[0.75rem] text-[#333] leading-[1.4] mb-[5px] line-clamp-2 transition-colors group-hover:text-[#ff0033]">
                          {p.name}
                        </p>
                        {p.discountPrice !== null && (
                          <p className="text-[0.68rem] text-[#999] line-through">¥{p.price.toLocaleString()}</p>
                        )}
                        <div className="flex items-baseline gap-1 flex-wrap">
                          <span className="text-[1rem] font-bold text-[#e00]">¥{price.toLocaleString()}</span>
                          {p.discountPercent && (
                            <span className="bg-[#ff0033] text-white text-[0.58rem] font-bold px-1 py-px rounded-sm">
                              {p.discountPercent}%OFF
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <span className="text-[#f5a623] text-[0.68rem]" style={{ letterSpacing: '-1px' }}>★★★★☆</span>
                          <span className="text-[0.65rem] text-[#888]">(24)</span>
                        </div>
                        <p className="text-[0.65rem] text-[#c63] mt-0.5">ポイント {Math.floor(price * 0.01)}pt</p>
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          <span className="border border-[#0075c2] text-[#0075c2] text-[0.58rem] px-1 py-px rounded-sm">送料無料</span>
                        </div>

                        {/* Stock gauge */}
                        <div className="mt-[5px]">
                          <div className="flex justify-between text-[0.6rem] text-[#888] mb-0.5">
                            <span className={stockInfo.hot ? 'text-[#ff0033] font-bold' : ''}>{stockInfo.label}</span>
                          </div>
                          <div className="h-1 bg-[#f0f0f0] rounded-sm overflow-hidden">
                            <div
                              className="h-full rounded-sm"
                              style={{
                                width: `${stockPct}%`,
                                background: 'linear-gradient(90deg, #ff6600, #ff0033)',
                              }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 py-4">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`min-w-8 h-8 border rounded-sm flex items-center justify-center text-[0.82rem] cursor-pointer transition-colors px-1.5 ${
                      page === 1 ? 'text-[#ccc] border-[#ddd] cursor-default pointer-events-none' : 'text-[#444] border-[#ddd] bg-white hover:border-[#ff0033] hover:text-[#ff0033]'
                    }`}
                  >
                    ‹
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`min-w-8 h-8 border rounded-sm flex items-center justify-center text-[0.82rem] cursor-pointer transition-colors ${
                        page === p
                          ? 'bg-[#ff0033] text-white border-[#ff0033] font-bold'
                          : 'bg-white text-[#444] border-[#ddd] hover:border-[#ff0033] hover:text-[#ff0033]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  {totalPages > 5 && (
                    <>
                      <span className="text-[#aaa] px-1 text-[0.82rem]">…</span>
                      <button
                        onClick={() => setPage(totalPages)}
                        className={`min-w-8 h-8 border rounded-sm flex items-center justify-center text-[0.82rem] cursor-pointer transition-colors ${
                          page === totalPages
                            ? 'bg-[#ff0033] text-white border-[#ff0033] font-bold'
                            : 'bg-white text-[#444] border-[#ddd] hover:border-[#ff0033] hover:text-[#ff0033]'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className={`min-w-8 h-8 border rounded-sm flex items-center justify-center text-[0.82rem] cursor-pointer transition-colors px-1.5 ${
                      page === totalPages ? 'text-[#ccc] border-[#ddd] cursor-default pointer-events-none' : 'text-[#444] border-[#ddd] bg-white hover:border-[#ff0033] hover:text-[#ff0033]'
                    }`}
                  >
                    ›
                  </button>
                </div>
              )}

              {/* Ranking section */}
              {rankingProducts.length > 0 && (
                <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden mb-3">
                  <div className="flex items-center justify-between px-3.5 py-2.5 border-b-2 border-[#ff0033]">
                    <h2 className="text-[0.95rem] font-bold text-[#222] flex items-center gap-1.5">🏆 セール売れ筋ランキング</h2>
                  </div>
                  <div>
                    {rankingProducts.map((p, i) => {
                      const price = effectivePrice(p);
                      return (
                        <Link
                          key={p.id}
                          href={`/products/${p.id}`}
                          className="flex gap-3 px-4 py-3 border-b border-[#f0f0f0] last:border-b-0 items-center hover:bg-[#fffafa] transition-colors group"
                        >
                          <span className={`text-[1.2rem] font-bold min-w-7 text-center flex-shrink-0 ${getRankColor(i)}`}>
                            {i + 1}
                          </span>
                          <div className="w-[60px] h-[60px] bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8] rounded-sm flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                            {p.imageUrl ? (
                              <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                            ) : (
                              <span className="text-[1.8rem]">📦</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.65rem] text-[#888]">モールショップ</p>
                            <p className="text-[0.82rem] text-[#333] font-medium leading-[1.4] line-clamp-2 transition-colors group-hover:text-[#ff0033]">
                              {p.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[0.95rem] font-bold text-[#e00]">¥{price.toLocaleString()}</span>
                              {p.discountPercent && (
                                <span className="bg-[#ff0033] text-white text-[0.58rem] font-bold px-1 py-px rounded-sm">
                                  {p.discountPercent}%OFF
                                </span>
                              )}
                              <span className="text-[#f5a623] text-[0.7rem]" style={{ letterSpacing: '-1px' }}>★★★★☆</span>
                              <span className="text-[0.65rem] text-[#888]">(24)</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
