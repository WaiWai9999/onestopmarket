'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  category: { name: string };
}

interface Slide {
  bg: string;
  badge: string;
  title: string;
  desc: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
  features: { icon: string; text: string }[];
}

export default function Home() {
  const { user, _hasHydrated } = useAuthStore();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data: productsData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get('/products', { params: { limit: 8 } }).then((r) => r.data),
  });

  const slides: Slide[] = [
    {
      bg: 'from-[#1a6b1f] to-[#155318]',
      badge: 'OneStopMarket',
      title: '必要なものが、\nすべてここに。',
      desc: '幅広いカテゴリの商品を、シンプルな操作で。今すぐ探して、カートに追加しよう。',
      cta: { label: '商品を探す', href: '/products' },
      secondary: _hasHydrated && !user ? { label: '無料で登録', href: '/register' } : undefined,
      features: [
        { icon: '🚚', text: '送料無料' },
        { icon: '🔒', text: '安全決済' },
        { icon: '📦', text: '豊富な品揃え' },
        { icon: '👤', text: '会員特典' },
      ],
    },
    {
      bg: 'from-[#0f4a2e] to-[#1a6b1f]',
      badge: 'SALE',
      title: '期間限定セール\n開催中！',
      desc: '人気商品が特別価格で登場。お見逃しなく！',
      cta: { label: 'セール商品を見る', href: '/hot-deals' },
      features: [
        { icon: '🔥', text: '最大50%OFF' },
        { icon: '⏰', text: '期間限定' },
        { icon: '🎁', text: 'お得なセット' },
      ],
    },
    {
      bg: 'from-[#1a6b1f] to-[#2d8a33]',
      badge: 'NEW ARRIVAL',
      title: '新商品、\n続々入荷中。',
      desc: '最新アイテムをいち早くチェック。トレンドを見逃さない。',
      cta: { label: '新着を見る', href: '/products' },
      features: [
        { icon: '✨', text: '毎日更新' },
        { icon: '🏷️', text: '厳選アイテム' },
        { icon: '💎', text: '高品質' },
      ],
    },
    ...(_hasHydrated && !user
      ? [
          {
            bg: 'from-[#155318] to-[#1a6b1f]',
            badge: 'MEMBERS',
            title: '会員登録で、\nもっと便利に。',
            desc: '注文履歴の管理、かんたん再注文、会員限定特典が使えます。',
            cta: { label: '無料で登録する', href: '/register' },
            features: [
              { icon: '📋', text: '注文履歴' },
              { icon: '🔄', text: 'かんたん再注文' },
              { icon: '🎉', text: '会員限定特典' },
            ],
          } as Slide,
        ]
      : []),
  ];

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const slide = slides[current];

  return (
    <>
      {/* ─── Hero Carousel ─── */}
      <section
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`bg-gradient-to-br ${slide.bg} text-white transition-all duration-700`}>
          <div className="max-w-6xl mx-auto px-6 py-14 md:py-20">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Content */}
              <div key={current} className="animate-fadeIn">
                <span className="inline-block text-xs font-semibold text-white bg-white/15 px-3 py-1 rounded-full mb-4 tracking-wider uppercase">
                  {slide.badge}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4 whitespace-pre-line">
                  {slide.title}
                </h1>
                <p className="text-white/80 text-base md:text-lg mb-8 max-w-md leading-relaxed">
                  {slide.desc}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link
                    href={slide.cta.href}
                    className="bg-white hover:bg-gray-100 text-[#1a6b1f] font-semibold px-7 py-3 rounded-full text-sm transition-colors shadow-lg"
                  >
                    {slide.cta.label}
                  </Link>
                  {slide.secondary && (
                    <Link
                      href={slide.secondary.href}
                      className="border border-white/40 hover:bg-white/10 text-white font-semibold px-7 py-3 rounded-full text-sm transition-colors"
                    >
                      {slide.secondary.label}
                    </Link>
                  )}
                </div>
              </div>

              {/* Feature pills */}
              <div key={`features-${current}`} className="hidden md:flex flex-wrap gap-3 justify-center animate-fadeIn">
                {slide.features.map((f) => (
                  <div
                    key={f.text}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-4 text-center min-w-[120px]"
                  >
                    <div className="text-2xl mb-1.5">{f.icon}</div>
                    <p className="text-white font-medium text-sm">{f.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel controls */}
            <div className="flex items-center justify-between mt-8">
              {/* Dots */}
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === current ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex gap-2">
                <button
                  onClick={prev}
                  className="w-9 h-9 rounded-full border border-white/30 hover:bg-white/10 flex items-center justify-center text-white transition-colors text-sm"
                >
                  &lt;
                </button>
                <button
                  onClick={next}
                  className="w-9 h-9 rounded-full border border-white/30 hover:bg-white/10 flex items-center justify-center text-white transition-colors text-sm"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">

        {/* ─── Category Nav (SCR-01 / SCR-02) ─── */}
        {categories && categories.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">カテゴリから探す</h2>
              <Link href="/products" className="text-sm text-[#1a6b1f] hover:text-[#155318] font-medium transition-colors">
                すべて見る →
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?categoryId=${cat.id}`}
                  className="group flex flex-col items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl hover:border-[#1a6b1f] hover:shadow-sm transition-all text-center"
                >
                  <div className="w-10 h-10 bg-[#1a6b1f]/10 group-hover:bg-[#1a6b1f] rounded-full flex items-center justify-center text-[#1a6b1f] group-hover:text-white font-bold text-sm transition-all">
                    {cat.name[0].toUpperCase()}
                  </div>
                  <p className="text-xs font-medium text-gray-600 group-hover:text-[#1a6b1f] leading-tight">{cat.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── Featured Products (SCR-01 / SCR-02 entry) ─── */}
        {productsData?.data && productsData.data.length > 0 && (
          <section className="mt-12 mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">新着・おすすめ商品</h2>
              <Link
                href="/products"
                className="bg-[#1a6b1f] hover:bg-[#155318] text-white font-semibold px-5 py-2 rounded-full text-sm transition-colors"
              >
                すべて見る
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productsData.data.map((product: Product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-[#1a6b1f] transition-all"
                >
                  <div className="h-44 bg-gray-100 relative overflow-hidden">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-3.5">
                    <p className="text-xs text-[#1a6b1f] font-medium mb-1">{product.category.name}</p>
                    <h3 className="font-semibold text-gray-800 text-sm mb-1.5 truncate">{product.name}</h3>
                    <p className="text-[#1a6b1f] font-bold text-sm">¥{product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── CTA Banner (ゲスト向け登録促進) ─── */}
        {_hasHydrated && !user && (
          <section className="mb-12 bg-[#1a6b1f] rounded-2xl px-8 py-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-1">会員登録で、もっと便利に</h2>
              <p className="text-white/80 text-sm">注文履歴の管理、かんたん再注文、会員限定特典が使えます。</p>
            </div>
            <Link
              href="/register"
              className="bg-white text-[#1a6b1f] hover:bg-gray-50 font-semibold px-8 py-3 rounded-full text-sm whitespace-nowrap transition-colors shadow"
            >
              無料で登録する
            </Link>
          </section>
        )}
      </div>
    </>
  );
}
