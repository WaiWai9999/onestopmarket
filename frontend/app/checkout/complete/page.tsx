'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

function CompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  }, [queryClient]);

  return (
    <main className="max-w-lg mx-auto px-6 py-20 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order confirmed!</h1>
      <p className="text-gray-500 mb-2">Thank you for your purchase.</p>
      {orderId && (
        <p className="text-xs text-gray-400 font-mono bg-gray-100 rounded-lg px-3 py-1.5 inline-block mb-8">
          Order ID: {orderId}
        </p>
      )}
      <div className="flex gap-3 justify-center">
        <Link
          href="/mypage/orders"
          className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          View Orders
        </Link>
        <Link
          href="/products"
          className="border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}

export default function CompletePage() {
  return (
    <Suspense>
      <CompleteContent />
    </Suspense>
  );
}
