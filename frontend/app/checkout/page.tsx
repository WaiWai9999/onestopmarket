'use client';

import { useState } from 'react';
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

// Inner form — uses Stripe hooks
function CheckoutForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

// Outer page — creates order and gets clientSecret
export default function CheckoutPage() {
  const { user } = useAuthStore();
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

  if (!user) {
    return (
      <main className="max-w-xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-500 mb-4">Please login to checkout.</p>
        <button onClick={() => router.push('/login')} className="bg-blue-600 text-white px-6 py-2 rounded">
          Login
        </button>
      </main>
    );
  }

  const handleProceedToPayment = async (e: React.FormEvent) => {
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
    <main className="max-w-xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Order Summary */}
      {cart && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-3">Order Summary</h2>
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span>{item.product.name} × {item.quantity}</span>
              <span>¥{(item.product.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>¥{cart.total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Step 1 — Shipping Address */}
      {step === 'address' && (
        <form onSubmit={handleProceedToPayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shipping Address
            </label>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Tokyo, Shibuya-ku 1-1-1"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Continue to Payment
          </button>
        </form>
      )}

      {/* Step 2 — Stripe Payment */}
      {step === 'payment' && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm orderId={orderId} />
        </Elements>
      )}

      {/* Test card hint */}
      {step === 'payment' && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
          <p className="font-semibold">Test card:</p>
          <p>Card number: 4242 4242 4242 4242</p>
          <p>Expiry: any future date · CVC: any 3 digits</p>
        </div>
      )}
    </main>
  );
}
