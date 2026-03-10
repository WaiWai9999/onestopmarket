'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: { name: string };
}

const VALUE_PROPS = [
  { icon: '🚚', title: 'Fast dispatch', desc: 'Stocked products ship from local demo inventory. Inventory sync are ready for cart and order testing.' },
  { icon: '🎁', title: 'Gift-ready feel', desc: 'The product detail layout has enough richness to carry premium and everyday goods alike.' },
  { icon: '🔄', title: 'Built for flow checks', desc: 'Login, cart, add-to-cart can all be exercised from this single stocked catalog.' },
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [cartError, setCartError] = useState('');

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data),
  });

  const addToCartMutation = useMutation({
    mutationFn: () => api.post('/cart/items', { productId: id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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

  const handleGoToCart = () => {
    if (!user) { router.push('/login'); return; }
    setCartError('');
    addToCartMutation.mutate();
    router.push('/cart');
  };

  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse" />
            <div className="h-8 bg-gray-100 rounded w-3/4 animate-pulse" />
            <div className="h-10 bg-gray-100 rounded w-1/3 animate-pulse" />
            <div className="h-20 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-400 text-4xl mb-3">😕</p>
        <p className="text-gray-600 font-medium">商品が見つかりませんでした</p>
        <Link href="/products" className="mt-4 inline-block text-[#1a6b1f] hover:text-[#155318] text-sm font-medium">← Back to products</Link>
      </main>
    );
  }

  const inStock = product.stock > 0;

  return (
    <>
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link href="/products" className="text-[#1a6b1f] hover:text-[#155318] text-sm font-medium mb-8 block transition-colors">
          ← Back to products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="aspect-square bg-gray-100 rounded-2xl relative overflow-hidden">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No Image</div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs font-semibold text-[#1a6b1f] uppercase tracking-wider">{product.category.name}</span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 leading-snug">{product.name}</h1>
            </div>

            <p className="text-4xl font-bold text-gray-900">¥{product.price.toLocaleString()}</p>

            <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>

            {/* Stock badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                inStock ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                {inStock ? `${product.stock} in stock` : 'Out of stock'}
              </span>
              {inStock && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                  Ships from local demo inventory
                </span>
              )}
            </div>

            {/* Quantity */}
            {inStock && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quantity</p>
                <div className="flex items-center border border-gray-200 rounded-xl w-fit overflow-hidden">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium">−</button>
                  <span className="w-12 text-center text-gray-900 font-bold text-sm">{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium">+</button>
                </div>
              </div>
            )}

            {cartError && (
              <p className="text-red-600 text-sm bg-red-50 px-4 py-2.5 rounded-lg border border-red-100">{cartError}</p>
            )}

            {/* CTAs */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || addToCartMutation.isPending}
                className="flex-1 bg-[#1a6b1f] hover:bg-[#155318] disabled:opacity-40 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                {addToCartMutation.isPending ? 'Adding...' : !inStock ? '在庫切れ' : 'Add to cart'}
              </button>
              {inStock && (
                <button
                  onClick={handleGoToCart}
                  disabled={addToCartMutation.isPending}
                  className="flex-1 border-2 border-[#1a6b1f] text-[#1a6b1f] hover:bg-[#1a6b1f] hover:text-white font-semibold py-3.5 rounded-xl transition-colors"
                >
                  Go to cart
                </button>
              )}
            </div>

            {!user && inStock && (
              <p className="text-xs text-gray-400 text-center">
                <Link href="/login" className="text-[#1a6b1f] hover:underline font-medium">ログイン</Link>
                {' '}してカートに追加できます
              </p>
            )}

            {/* Debug/test info */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Built for checkout testing</p>
              <p className="text-xs text-gray-500 mb-3">This product page is wired to live cart-add and the stacked inventory count.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full font-medium">PRODUCT DETAIL</span>
                <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full font-medium">CART MUTATION</span>
                <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full font-medium">ADMIN-VISIBLE INVENTORY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Value props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {VALUE_PROPS.map((v) => (
            <div key={v.title} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-2 hover:shadow-md hover:border-[#1a6b1f] transition-all">
              <span className="text-2xl">{v.icon}</span>
              <h3 className="font-bold text-gray-900 text-base">{v.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
