'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function CompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <main className="max-w-xl mx-auto px-6 py-16 text-center">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-2xl font-bold mb-2">Order Complete!</h1>
      <p className="text-gray-500 mb-2">Thank you for your purchase.</p>
      {orderId && (
        <p className="text-sm text-gray-400 mb-6">Order ID: {orderId}</p>
      )}
      <div className="flex gap-4 justify-center">
        <Link
          href="/mypage/orders"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          View Orders
        </Link>
        <Link
          href="/products"
          className="border border-gray-300 px-6 py-2 rounded hover:border-blue-500"
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
