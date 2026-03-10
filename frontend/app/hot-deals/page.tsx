'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  isHotDeal: boolean;
  dealExpiresAt?: string;
  imageUrl?: string;
  category: { id: string; name: string };
  description?: string;
}

function getExpiresIn(dealExpiresAt?: string): string {
  if (!dealExpiresAt) return '期限なし';
  const diff = new Date(dealExpiresAt).getTime() - Date.now();
  if (diff <= 0) return '終了';
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `残り${days}日`;
  if (hours > 0) return `残り${hours}時間`;
  return '残り1時間未満';
}

function getBadge(discount: number): string {
  if (discount >= 50) return '注目商品';
  if (discount >= 40) return '超お得';
  if (discount >= 30) return 'タイムセール';
  return '期間限定';
}

export default function HotDealsPage() {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['hot-deals'],
    queryFn: () => api.get('/products/hot-deals').then((r) => r.data),
  });

  return (
    <>
      {/* Dark hero header */}
      <div className="bg-[#1a6b1f] text-white p-6 text-white px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold text-white/80 uppercase tracking-widest mb-2">期間限定</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">🔥 お得なセール</h1>
          <p className="text-white/70 text-sm max-w-md">
            厳選されたお得な商品を定期的に更新。売り切れる前にお早めに。
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-4xl mb-3">⚠️</p>
            <p className="text-gray-500 font-medium">セール情報の読み込みに失敗しました</p>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-4xl mb-3">🔥</p>
            <p className="text-gray-500 font-medium">現在セール中の商品はありません</p>
            <p className="text-gray-400 text-sm mt-1">新しいオファーをお楽しみに。</p>
            <Link href="/products" className="mt-6 inline-block bg-[#1a6b1f] hover:bg-[#155318] text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              すべての商品を見る
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-14">
              {products.map((product) => {
                const dealPrice = product.discountPrice ?? product.price;
                const discount = product.discountPercent ?? Math.round(((product.price - dealPrice) / product.price) * 100);
                const expiresIn = getExpiresIn(product.dealExpiresAt);
                const badge = getBadge(discount);

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
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
                      {discount > 0 && (
                        <span className="absolute top-2.5 right-2.5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      )}
                      <span className="absolute top-2.5 left-2.5 bg-white/90 border border-gray-200 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {badge}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col gap-1.5 flex-1">
                      <p className="text-xs text-[#1a6b1f] font-medium">{product.category.name}</p>
                      <h2 className="font-bold text-gray-900 text-sm leading-snug">{product.name}</h2>

                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-[#1a6b1f] font-bold text-sm">¥{dealPrice.toLocaleString()}</p>
                        {dealPrice < product.price && (
                          <p className="text-gray-400 text-xs line-through">¥{product.price.toLocaleString()}</p>
                        )}
                      </div>

                      {dealPrice < product.price && (
                        <p className="text-xs text-green-600 font-medium">
                          ¥{(product.price - dealPrice).toLocaleString()} お得
                        </p>
                      )}

                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-400">⏳ {expiresIn}</span>
                        <span className="text-xs font-semibold text-white bg-[#1a6b1f] px-3 py-1 rounded-full">
                          詳細を見る
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Value props */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-200 pt-10">
              {[
                { icon: '💰', title: '大幅割引', desc: '対象商品が最大60%オフ。' },
                { icon: '⚡', title: '数量限定', desc: '在庫がなくなり次第終了。' },
                { icon: '🎁', title: '限定オファー', desc: 'ここだけのプレミアムな特別価格。' },
              ].map((v) => (
                <div key={v.title} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-2 hover:shadow-md hover:border-[#1a6b1f] transition-all">
                  <span className="text-2xl">{v.icon}</span>
                  <h3 className="font-bold text-gray-900">{v.title}</h3>
                  <p className="text-gray-500 text-sm">{v.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
