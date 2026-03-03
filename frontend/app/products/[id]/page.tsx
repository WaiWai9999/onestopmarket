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
      router.push('/cart');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? (err instanceof Error ? err.message : 'Failed to add to cart');
      setCartError(msg);
    },
  });

  const handleAddToCart = () => {
    if (!user) { router.push('/login'); return; }
    setCartError('');
    addToCartMutation.mutate();
  };

  if (isLoading) return <p className="text-center py-16 text-gray-500">Loading...</p>;
  if (!product) return <p className="text-center py-16 text-gray-500">Product not found.</p>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <Link href="/products" className="text-amber-500 hover:text-amber-600 text-sm mb-6 block font-medium">
        ← Back to Products
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="h-80 bg-gray-100 relative">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
            )}
          </div>

          {/* Details */}
          <div className="p-8 flex flex-col gap-4">
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide bg-amber-50 px-3 py-1 rounded-full w-fit">
              {product.category.name}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-3xl font-bold text-amber-500">¥{product.price.toLocaleString()}</p>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            <div className={`flex items-center gap-2 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              {product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock'}
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-amber-50 transition-all"
                  >−</button>
                  <span className="px-4 py-1 text-gray-900 font-medium text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-amber-50 transition-all"
                  >+</button>
                </div>
              </div>
            )}

            {cartError && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{cartError}</p>
            )}

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addToCartMutation.isPending}
              className="bg-amber-400 text-gray-900 py-3 rounded-full hover:bg-amber-300 disabled:opacity-50 font-semibold transition-all shadow-sm mt-2"
            >
              {addToCartMutation.isPending ? 'Adding...' : '🛒 Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
