'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-500 mb-5">Please log in to view your cart.</p>
        <button
          onClick={() => router.push('/login')}
          className="bg-[#1a6b1f] hover:bg-[#155318] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Log in
        </button>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
        ))}
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <p className="text-gray-700 font-semibold mb-2">Your cart is empty</p>
        <p className="text-gray-400 text-sm mb-6">Add some products and come back here.</p>
        <Link
          href="/products"
          className="bg-[#1a6b1f] hover:bg-[#155318] text-white font-semibold px-6 py-3 rounded-xl transition-colors inline-block"
        >
          Browse Products
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        <p className="text-gray-500 text-sm mt-0.5">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Item list */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl relative flex-shrink-0 overflow-hidden">
                {item.product.imageUrl ? (
                  <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover rounded-xl" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</p>
                <p className="text-[#1a6b1f] font-bold text-sm mt-0.5">¥{item.product.price.toLocaleString()}</p>
              </div>

              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                  disabled={item.quantity <= 1}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors font-bold"
                >−</button>
                <span className="w-9 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                <button
                  onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors font-bold"
                >+</button>
              </div>

              <p className="text-sm font-bold text-gray-900 w-20 text-right hidden sm:block">
                ¥{(item.product.price * item.quantity).toLocaleString()}
              </p>

              <button
                onClick={() => removeMutation.mutate(item.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                aria-label={`Remove ${item.product.name}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Summary sidebar */}
        <aside className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
          <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-2 mb-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span className="truncate max-w-[140px]">{item.product.name} ×{item.quantity}</span>
                <span className="flex-shrink-0 ml-2">¥{(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 mb-5 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>¥{cart.total.toLocaleString()}</span>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full bg-[#1a6b1f] hover:bg-[#155318] text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            Proceed to Checkout
          </button>
          <Link
            href="/products"
            className="block text-center text-sm text-gray-500 hover:text-[#1a6b1f] mt-3 transition-colors"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
