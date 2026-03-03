import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to OneStopMarket</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Your one stop shop for everything. Browse our wide selection of products.
      </p>
      <Link
        href="/products"
        className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700"
      >
        Shop Now
      </Link>
    </main>
  );
}
