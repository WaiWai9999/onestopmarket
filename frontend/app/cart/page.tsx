'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import TopBar from '@/components/layout/TopBar';
import Ticker from '@/components/layout/Ticker';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    discountPrice: number | null;
    discountPercent: number | null;
    imageUrl: string | null;
    stock: number;
  };
}

interface Cart {
  items: CartItem[];
  total: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  discountPercent: number | null;
  imageUrl: string | null;
}

const STEPS = ['カート', 'お届け先', 'お支払い', '確認', '完了'];

const effectivePrice = (p: { price: number; discountPrice: number | null }) =>
  p.discountPrice ?? p.price;

export default function CartPage() {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [allSelected, setAllSelected] = useState(true);
  const [savedForLater, setSavedForLater] = useState<Set<string>>(new Set());
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<number>(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [pointInput, setPointInput] = useState('');
  const [appliedPoints, setAppliedPoints] = useState(0);

  const { data: cart, isLoading } = useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data),
    enabled: !!user,
  });

  const { data: recommended } = useQuery<{ data: Product[] }>({
    queryKey: ['recommended-products'],
    queryFn: () => api.get('/products', { params: { limit: 4 } }).then((r) => r.data),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      api.patch(`/cart/items/${itemId}`, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => api.delete(`/cart/items/${itemId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => api.post('/cart/items', { productId, quantity: 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  // Split items into active cart and saved-for-later
  const allItems = cart?.items ?? [];
  const items = allItems.filter((i) => !savedForLater.has(i.id));
  const savedItems = allItems.filter((i) => savedForLater.has(i.id));

  // Initialize selected items when cart loads
  if (items.length > 0 && selectedItems.size === 0 && allSelected) {
    const all = new Set(items.map((i) => i.id));
    if (all.size > 0 && selectedItems.size !== all.size) {
      setSelectedItems(all);
    }
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
      setAllSelected(false);
    } else {
      setSelectedItems(new Set(items.map((i) => i.id)));
      setAllSelected(true);
    }
  };

  const toggleItem = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
    setAllSelected(next.size === items.length);
  };

  const saveForLater = (id: string) => {
    setSavedForLater((prev) => new Set(prev).add(id));
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const moveBackToCart = (id: string) => {
    setSavedForLater((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setSelectedItems((prev) => new Set(prev).add(id));
  };

  const selectedCartItems = items.filter((i) => selectedItems.has(i.id));
  const subtotal = selectedCartItems.reduce(
    (sum, item) => sum + effectivePrice(item.product) * item.quantity,
    0,
  );
  const originalTotal = selectedCartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const discount = originalTotal - subtotal;
  const shipping = subtotal >= 3000 ? 0 : 550;
  const totalBeforeDeductions = subtotal + shipping;
  const grandTotal = Math.max(0, totalBeforeDeductions - appliedCoupon - appliedPoints);
  const freeShippingRemaining = subtotal < 3000 ? 3000 - subtotal : 0;

  const earnedPoints = Math.floor(subtotal * 0.01);

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE500') {
      setAppliedCoupon(500);
      setCouponApplied(true);
    } else {
      alert('無効なクーポンコードです');
    }
  };

  const handleApplyPoints = () => {
    const pts = parseInt(pointInput, 10);
    if (isNaN(pts) || pts <= 0) return;
    if (pts > 1250) {
      alert('利用可能なポイント上限（1,250pt）を超えています');
      return;
    }
    setAppliedPoints(pts);
  };

  const deleteSelected = () => {
    selectedItems.forEach((id) => removeMutation.mutate(id));
    setSelectedItems(new Set());
  };

  if (!_hasHydrated) return null;

  if (!user) {
    return (
      <>
        <TopBar />
        <Ticker />
        <Navbar />
        <div style={{ background: '#f4f4f4' }}>
          <div className="max-w-[1200px] mx-auto px-3 py-16 text-center">
            <p className="text-3xl mb-4">🔒</p>
            <p className="text-[0.95rem] font-bold text-[#444] mb-2">ログインが必要です</p>
            <p className="text-[0.82rem] text-[#888] mb-5">カートを表示するにはログインしてください。</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-[#ff0033] hover:bg-[#cc0029] text-white font-bold px-6 py-2.5 rounded text-[0.85rem] transition-colors cursor-pointer border-none"
            >
              ログインする
            </button>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <TopBar />
        <Ticker />
        <Navbar />
        <div style={{ background: '#f4f4f4' }}>
          <div className="max-w-[1200px] mx-auto px-3 py-3">
            <div className="bg-white border border-[#e0e0e0] rounded p-4 mb-3.5 animate-pulse">
              <div className="h-5 bg-[#f0f0f0] rounded w-1/3 mb-3" />
              <div className="h-10 bg-[#f0f0f0] rounded mb-3" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#e0e0e0] rounded p-4 mb-3 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-[#f0f0f0] rounded" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#f0f0f0] rounded w-2/3 mb-2" />
                    <div className="h-3 bg-[#f0f0f0] rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Empty cart
  if (!cart || allItems.length === 0) {
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
              <span>ショッピングカート</span>
            </nav>

            <div className="bg-white border border-[#e0e0e0] rounded text-center py-12 px-5">
              <p className="text-[4rem] mb-4">🛒</p>
              <p className="text-[1rem] font-bold text-[#444] mb-2">カートに商品がありません</p>
              <p className="text-[0.82rem] text-[#888] mb-5">お気に入りの商品をカートに追加してください。</p>
              <Link
                href="/products"
                className="inline-block bg-[#ff0033] hover:bg-[#cc0029] text-white font-bold px-6 py-2.5 rounded text-[0.85rem] transition-colors"
              >
                商品を探す
              </Link>
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
            <span>ショッピングカート</span>
          </nav>

          {/* Step bar */}
          <div className="bg-white border border-[#e0e0e0] rounded py-3.5 px-5 mb-3.5 flex items-center justify-center">
            {STEPS.map((step, i) => (
              <span key={step} className="flex items-center">
                <span className={`flex items-center gap-1.5 text-[0.8rem] ${i === 0 ? 'text-[#ff0033] font-bold' : 'text-[#aaa]'}`}>
                  <span
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[0.72rem] font-bold ${
                      i === 0
                        ? 'border-[#ff0033] text-[#ff0033] bg-white'
                        : 'border-[#ddd] text-[#aaa] bg-white'
                    }`}
                  >
                    {i + 1}
                  </span>
                  {step}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="w-[60px] h-px bg-[#ddd] mx-2 flex-shrink-0" />
                )}
              </span>
            ))}
          </div>

          {/* Free shipping notice */}
          {freeShippingRemaining > 0 && (
            <div className="bg-[#fff9e6] border border-[#f5c842] rounded py-2 px-3.5 text-[0.78rem] text-[#664d00] flex items-center gap-2 mb-3">
              📢 送料無料まであと ¥{freeShippingRemaining.toLocaleString()}！ ¥3,000以上のご注文で送料無料になります。
            </div>
          )}

          {/* Main grid */}
          <div className="grid grid-cols-[1fr_300px] gap-3.5 items-start">
            {/* Left column */}
            <div>
              {/* Cart box */}
              <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-[#ff0033]">
                  <h2 className="text-[0.95rem] font-bold text-[#222] flex items-center">
                    ショッピングカート
                    <span className="bg-[#ff0033] text-white text-[0.65rem] font-bold py-0.5 px-[7px] rounded-full ml-1.5">
                      {items.length}
                    </span>
                  </h2>
                </div>

                {/* Select all row */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-[#f0f0f0] bg-[#fafafa] text-[0.78rem] text-[#555]">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-[14px] h-[14px] accent-[#ff0033]"
                  />
                  <span>すべて選択（{selectedItems.size}/{items.length}）</span>
                  {selectedItems.size > 0 && (
                    <span
                      className="ml-auto text-[0.72rem] text-[#0075c2] cursor-pointer hover:underline"
                      onClick={deleteSelected}
                    >
                      選択した商品を削除
                    </span>
                  )}
                </div>

                {/* Cart items */}
                {items.map((item) => {
                  const price = effectivePrice(item.product);
                  const hasDiscount = item.product.discountPrice !== null;
                  const itemSubtotal = price * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 px-4 py-3.5 border-b border-[#f0f0f0] items-start hover:bg-[#fffafa] transition-colors"
                    >
                      {/* Checkbox */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleItem(item.id)}
                          className="w-[14px] h-[14px] accent-[#ff0033]"
                        />
                      </div>

                      {/* Image */}
                      <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
                        <div className="w-20 h-20 rounded bg-[#f0f0f0] relative overflow-hidden">
                          {item.product.imageUrl ? (
                            <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-[2.2rem]">📦</div>
                          )}
                        </div>
                      </Link>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.68rem] text-[#0075c2] mb-0.5 hover:underline cursor-pointer">モールショップ公式</p>
                        <Link href={`/products/${item.product.id}`}>
                          <p className="text-[0.85rem] text-[#333] font-medium leading-[1.45] mb-1.5 hover:text-[#ff0033] line-clamp-2">
                            {item.product.name}
                          </p>
                        </Link>

                        {/* Tags */}
                        <div className="flex gap-1 flex-wrap mb-2">
                          <span className="border border-[#0075c2] text-[#0075c2] text-[0.62rem] px-[5px] py-px rounded-sm">送料無料</span>
                          <span className="border border-[#2e7d32] text-[#2e7d32] text-[0.62rem] px-[5px] py-px rounded-sm">翌日配送</span>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 });
                            }}
                            disabled={item.quantity <= 1}
                            className="w-[26px] h-[26px] border border-[#ddd] bg-[#f8f8f8] text-[0.9rem] cursor-pointer hover:bg-[#eee] disabled:opacity-30 transition-colors"
                          >
                            −
                          </button>
                          <span className="w-9 h-[26px] border-y border-[#ddd] flex items-center justify-center text-[0.85rem] text-center bg-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                            className="w-[26px] h-[26px] border border-[#ddd] bg-[#f8f8f8] text-[0.9rem] cursor-pointer hover:bg-[#eee] transition-colors"
                          >
                            ＋
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className="text-[0.72rem] text-[#888] cursor-pointer hover:text-[#ff0033] hover:underline py-0.5"
                            onClick={() => saveForLater(item.id)}
                          >
                            あとで買う
                          </span>
                          <span className="text-[#ddd] text-[0.72rem]">|</span>
                          <span
                            className="text-[0.72rem] text-[#888] cursor-pointer hover:text-[#ff0033] hover:underline py-0.5"
                            onClick={() => removeMutation.mutate(item.id)}
                          >
                            削除
                          </span>
                        </div>
                      </div>

                      {/* Price area */}
                      <div className="text-right min-w-[120px] flex-shrink-0 flex flex-col items-end gap-0.5">
                        {hasDiscount && (
                          <>
                            <span className="text-[0.72rem] text-[#999] line-through">
                              ¥{item.product.price.toLocaleString()}
                            </span>
                            <span className="bg-[#ff0033] text-white text-[0.6rem] font-bold px-[5px] py-px rounded-sm">
                              {item.product.discountPercent}%OFF
                            </span>
                          </>
                        )}
                        <span className="text-[1.15rem] font-bold text-[#e00]">
                          ¥{price.toLocaleString()}
                        </span>
                        <span className="text-[0.68rem] text-[#c63] mt-0.5">
                          ポイント {Math.floor(price * 0.01)}pt
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[0.72rem] text-[#888] mt-1">
                            小計 <strong className="text-[#e00] text-[0.85rem]">¥{itemSubtotal.toLocaleString()}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Saved for later section */}
              {savedItems.length > 0 && (
                <div className="mt-3.5">
                  <div className="text-[0.82rem] font-bold text-[#444] px-4 py-2.5 bg-[#f8f8f8] border border-[#e0e0e0] border-b-2 border-b-[#ff0033] rounded-t">
                    あとで買う（{savedItems.length}）
                  </div>
                  <div className="bg-white border border-[#e0e0e0] border-t-0 rounded-b overflow-hidden">
                    {savedItems.map((item) => {
                      const price = effectivePrice(item.product);
                      const hasDiscount = item.product.discountPrice !== null;
                      return (
                        <div
                          key={item.id}
                          className="flex gap-3 px-4 py-3.5 border-b border-[#f0f0f0] last:border-b-0 items-start opacity-75"
                        >
                          <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
                            <div className="w-20 h-20 rounded bg-[#f0f0f0] relative overflow-hidden">
                              {item.product.imageUrl ? (
                                <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full text-[2.2rem]">📦</div>
                              )}
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/products/${item.product.id}`}>
                              <p className="text-[0.85rem] text-[#333] font-medium leading-[1.45] mb-1.5 hover:text-[#ff0033] line-clamp-2">
                                {item.product.name}
                              </p>
                            </Link>
                            <div className="flex items-center gap-2">
                              {hasDiscount && (
                                <span className="text-[0.72rem] text-[#999] line-through">¥{item.product.price.toLocaleString()}</span>
                              )}
                              <span className="text-[1rem] font-bold text-[#e00]">¥{price.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => moveBackToCart(item.id)}
                                className="bg-[#ff0033] text-white px-3 py-[5px] text-[0.72rem] font-bold rounded-sm border-none cursor-pointer hover:bg-[#cc0029] transition-colors"
                              >
                                カートに戻す
                              </button>
                              <span
                                className="text-[0.72rem] text-[#888] cursor-pointer hover:text-[#ff0033] hover:underline"
                                onClick={() => removeMutation.mutate(item.id)}
                              >
                                削除
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommended products */}
              {recommended?.data && recommended.data.length > 0 && (
                <div className="mt-3.5">
                  <div className="text-[0.82rem] font-bold text-[#444] px-4 py-2.5 bg-[#f8f8f8] border border-[#e0e0e0] border-b-2 border-b-[#ff0033] rounded-t">
                    あなたへのおすすめ商品
                  </div>
                  <div className="grid grid-cols-4 gap-px bg-[#e8e8e8] border border-[#e0e0e0] border-t-0 rounded-b overflow-hidden">
                    {recommended.data.slice(0, 4).map((p) => {
                      const rPrice = effectivePrice(p);
                      return (
                        <div key={p.id} className="bg-white p-2.5 cursor-pointer transition-shadow hover:shadow-[inset_0_0_0_2px_#ff0033] relative">
                          <Link href={`/products/${p.id}`}>
                            <div className="w-full aspect-square rounded bg-[#f0f0f0] relative overflow-hidden mb-1.5">
                              {p.imageUrl ? (
                                <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full text-[2rem]">📦</div>
                              )}
                            </div>
                            <p className="text-[0.72rem] text-[#333] leading-[1.4] mb-1 line-clamp-2">{p.name}</p>
                            <p className="text-[0.9rem] font-bold text-[#e00]">¥{rPrice.toLocaleString()}</p>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              addToCartMutation.mutate(p.id);
                            }}
                            className="block w-full mt-1.5 bg-white border border-[#ff0033] text-[#ff0033] text-[0.68rem] font-bold py-1 rounded-sm cursor-pointer transition-colors hover:bg-[#ff0033] hover:text-white"
                          >
                            カートに追加
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Order summary */}
            <div className="sticky top-[80px]">
              <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden">
                <div className="px-4 py-2.5 border-b-2 border-[#ff0033] text-[0.95rem] font-bold text-[#222]">
                  注文サマリー
                </div>
                <div className="px-4 py-3.5">
                  {/* Summary rows */}
                  <div className="flex justify-between text-[0.82rem] mb-[9px] text-[#555]">
                    <span>商品合計（{selectedCartItems.length}点）</span>
                    <span className="font-medium text-[#333]">¥{originalTotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[0.82rem] mb-[9px] text-[#555]">
                      <span>割引額</span>
                      <span className="font-medium text-[#e00]">-¥{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[0.82rem] mb-[9px] text-[#555]">
                    <span>送料</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-[#2e7d32]' : 'text-[#333]'}`}>
                      {shipping === 0 ? '無料' : `¥${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  {appliedCoupon > 0 && (
                    <div className="flex justify-between text-[0.82rem] mb-[9px] text-[#555]">
                      <span>クーポン割引</span>
                      <span className="font-medium text-[#e00]">-¥{appliedCoupon.toLocaleString()}</span>
                    </div>
                  )}
                  {appliedPoints > 0 && (
                    <div className="flex justify-between text-[0.82rem] mb-[9px] text-[#555]">
                      <span>ポイント利用</span>
                      <span className="font-medium text-[#e00]">-{appliedPoints}pt</span>
                    </div>
                  )}

                  <hr className="border-none border-t border-[#f0f0f0] my-2.5" />

                  {/* Total */}
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[0.88rem] font-bold text-[#222]">お支払い合計</span>
                    <span className="text-[1.5rem] font-bold text-[#e00]">¥{grandTotal.toLocaleString()}</span>
                  </div>
                  <p className="text-[0.7rem] text-[#888] text-right mb-2.5">（税込）</p>

                  {/* Points earned */}
                  <div className="bg-[#fff9e6] border border-[#f5c842] rounded-sm px-2.5 py-[7px] text-[0.75rem] text-[#664d00] mb-3">
                    🏷️ この注文で <strong>{earnedPoints}ポイント</strong> 獲得予定
                  </div>

                  {/* Checkout button */}
                  <button
                    onClick={() => router.push('/checkout')}
                    disabled={selectedItems.size === 0}
                    className="block w-full bg-[#ff0033] hover:bg-[#cc0029] text-white py-3.5 rounded font-bold text-[1rem] mb-2 cursor-pointer border-none transition-colors disabled:opacity-50"
                  >
                    ご注文手続きへ
                  </button>
                  <Link
                    href="/products"
                    className="block w-full text-center bg-white text-[#555] border border-[#ddd] py-2.5 rounded text-[0.82rem] hover:border-[#ff0033] hover:text-[#ff0033] transition-colors mb-3.5"
                  >
                    お買い物を続ける
                  </Link>

                  {/* Payment methods */}
                  <div className="flex flex-wrap gap-[5px] mb-3">
                    {['💳 クレジット', '🏧 デビット', '📱 PayPay', '🏪 コンビニ', '🏦 銀行振込', '💰 代引き'].map((m) => (
                      <span key={m} className="bg-[#f8f8f8] border border-[#ddd] rounded-sm px-[7px] py-[3px] text-[0.65rem] text-[#555]">
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* Security note */}
                  <div className="flex flex-col gap-0.5 text-[0.68rem] text-[#888]">
                    <span>🔒 SSL暗号化による安全な決済</span>
                    <span>🔒 30日間返品・交換保証</span>
                  </div>
                </div>

                {/* Coupon area */}
                <div className="px-4 py-3 border-t border-[#f0f0f0]">
                  <p className="text-[0.78rem] font-bold text-[#444] mb-1.5">クーポンコード</p>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="コードを入力"
                      className={`flex-1 border rounded-sm px-2.5 py-1.5 text-[0.8rem] outline-none transition-colors ${
                        couponApplied ? 'border-[#2e7d32]' : 'border-[#ddd] focus:border-[#ff0033]'
                      }`}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-white border border-[#ff0033] text-[#ff0033] px-3 py-1.5 rounded-sm text-[0.78rem] font-bold cursor-pointer hover:bg-[#ff0033] hover:text-white transition-colors"
                    >
                      適用
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-[0.68rem] text-[#2e7d32] mt-1">✓ クーポン SAVE500 が適用されました</p>
                  )}
                </div>

                {/* Point usage area */}
                <div className="px-4 py-3 border-t border-[#f0f0f0]">
                  <div className="flex justify-between text-[0.78rem] font-bold text-[#444] mb-1">
                    <span>ポイント利用</span>
                    <span className="text-[0.72rem] text-[#c63] font-normal">保有: 1,250pt</span>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={pointInput}
                      onChange={(e) => setPointInput(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="利用ポイント"
                      className="flex-1 border border-[#ddd] rounded-sm px-2.5 py-1.5 text-[0.8rem] outline-none focus:border-[#ff0033] transition-colors"
                    />
                    <button
                      onClick={handleApplyPoints}
                      className="bg-white border border-[#cc6600] text-[#cc6600] px-3 py-1.5 rounded-sm text-[0.78rem] font-bold cursor-pointer hover:bg-[#cc6600] hover:text-white transition-colors"
                    >
                      適用
                    </button>
                  </div>
                  {appliedPoints > 0 && (
                    <p className="text-[0.68rem] text-[#cc6600] mt-1">✓ {appliedPoints}pt を利用中</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
