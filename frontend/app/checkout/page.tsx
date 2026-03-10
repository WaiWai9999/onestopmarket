'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Cart {
  items: { id: string; quantity: number; product: { name: string; price: number } }[];
  total: number;
}

function CheckoutForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/complete?orderId=${orderId}`,
      },
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && (
        <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">{error}</p>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [address, setAddress] = useState('');
  const [step, setStep] = useState<'address' | 'payment'>('address');

  const { data: cart } = useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data),
    enabled: !!user,
  });

  const { data: profile } = useQuery<{ address: string | null }>({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/me').then((r) => r.data),
    enabled: !!user,
  });

  useEffect(() => {
    if (profile?.address) setAddress(profile.address);
  }, [profile]);

  useEffect(() => {
    if (_hasHydrated && !user) router.push('/login');
  }, [_hasHydrated, user, router]);

  if (!_hasHydrated || !user) return null;

  const handleProceedToPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/orders/checkout', { shippingAddress: address });
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setStep('payment');
    } catch {
      alert('Failed to create order. Please try again.');
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        <div className={`flex items-center gap-2 text-sm font-semibold ${step === 'address' ? 'text-gray-900' : 'text-gray-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'address' ? 'bg-gray-900 text-white' : 'bg-green-500 text-white'}`}>
            {step === 'payment' ? '✓' : '1'}
          </span>
          Shipping
        </div>
        <div className="flex-1 h-px bg-gray-200 max-w-8" />
        <div className={`flex items-center gap-2 text-sm font-semibold ${step === 'payment' ? 'text-gray-900' : 'text-gray-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>
            2
          </span>
          Payment
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main form */}
        <div className="lg:col-span-2">
          {step === 'address' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-bold text-gray-900 mb-5">Shipping Address</h2>
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={4}
                  placeholder="Tokyo, Shibuya-ku 1-1-1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
                <button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl transition-colors"
                >
                  Continue to Payment
                </button>
              </form>
            </div>
          )}

          {step === 'payment' && clientSecret && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-bold text-gray-900 mb-5">Payment</h2>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm orderId={orderId} />
              </Elements>
            </div>
          )}

          {step === 'payment' && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500">
              <p className="font-semibold text-gray-700 mb-1">Test card</p>
              <p className="font-mono text-xs">4242 4242 4242 4242 · Any future date · Any CVC</p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <aside className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
          <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
          {cart ? (
            <>
              <div className="space-y-2 mb-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate max-w-[130px]">{item.product.name} ×{item.quantity}</span>
                    <span className="flex-shrink-0 ml-2">¥{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>¥{cart.total.toLocaleString()}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">No items in cart</p>
          )}
        </aside>
      </div>
    </main>
  );
}
