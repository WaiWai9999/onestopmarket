'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  };
}

interface Cart {
  items: CartItem[];
  total: number;
}

export default function CartPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data),
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

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-500 mb-4">Please login to view your cart.</p>
        <button
          onClick={() => router.push('/login')}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded hover:shadow-lg transition-all"
        >
          Login
        </button>
      </main>
    );
  }

  if (isLoading) return <p className="text-center py-16 text-gray-500">Loading...</p>;

  if (!cart || cart.items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <button
          onClick={() => router.push('/products')}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded hover:shadow-lg transition-all"
        >
          Browse Products
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border border-gray-200 rounded-lg p-4">
            <div className="w-20 h-20 bg-orange-50 rounded relative flex-shrink-0">
              {item.product.imageUrl ? (
                <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover rounded" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
              )}
            </div>

            <div className="flex-1">
              <p className="font-semibold text-gray-800">{item.product.name}</p>
              <p className="text-orange-600 font-semibold">¥{item.product.price.toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                disabled={item.quantity <= 1}
                className="w-8 h-8 border rounded hover:bg-orange-50 disabled:opacity-30"
              >
                -
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                className="w-8 h-8 border rounded hover:bg-orange-50"
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeMutation.mutate(item.id)}
              className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-all"
              aria-label={`Remove ${item.product.name}`}
              title="Remove item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6 flex items-center justify-between">
        <div>
          <p className="text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800">¥{cart.total.toLocaleString()}</p>
        </div>
        <button
          onClick={() => router.push('/checkout')}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          Proceed to Checkout
        </button>
      </div>
    </main>
  );
}
