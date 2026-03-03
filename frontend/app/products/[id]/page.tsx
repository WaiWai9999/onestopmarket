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
    if (!user) {
      router.push('/login');
      return;
    }
    setCartError('');
    addToCartMutation.mutate();
  };

  if (isLoading) return <p className="text-center py-16 text-gray-500">Loading...</p>;
  if (!product) return <p className="text-center py-16 text-gray-500">Product not found.</p>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <Link href="/products" className="text-blue-600 hover:underline text-sm mb-6 block">
        ← Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="h-80 bg-gray-100 rounded-lg relative overflow-hidden">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">{product.category.name}</p>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-3xl font-bold text-blue-600">¥{product.price.toLocaleString()}</p>
          <p className="text-gray-700">{product.description}</p>
          <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}
          </p>

          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Qty:</label>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-16 border border-gray-300 rounded px-2 py-1 text-gray-900 text-center"
              />
            </div>
          )}

          {cartError && (
            <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">{cartError}</p>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addToCartMutation.isPending}
            className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </main>
  );
}
