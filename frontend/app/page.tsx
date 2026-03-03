'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  category: { name: string };
}

export default function Home() {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data: productsData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get('/products', { params: { limit: 8 } }).then((r) => r.data),
  });

  return (
    <>
      {/* Hero Section */}
      <div
        className="relative flex flex-col items-center justify-center text-center text-white px-6"
        style={{
          height: '60vh',
          background: 'linear-gradient(135deg, rgba(255,205,39,0.75) 0%, rgba(0,0,0,0.88) 100%)',
          borderBottomLeftRadius: '50px',
          borderBottomRightRadius: '50px',
        }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          Welcome to OneStopMarket
        </h1>
        <p className="text-lg text-gray-200 mb-8 max-w-md">
          Your one stop shop for everything you need.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/products"
            className="bg-amber-400 text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-amber-300 transition-all text-sm shadow-lg"
          >
            Shop Now
          </Link>
          <Link
            href="/register"
            className="border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white hover:text-gray-900 transition-all text-sm"
          >
            Register
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Categories */}
        {categories && categories.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-800 mb-5">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?categoryId=${cat.id}`}
                  className="border border-gray-200 rounded-xl p-4 text-center hover:border-amber-400 hover:shadow-md transition-all bg-white group"
                >
                  <div className="w-12 h-12 bg-amber-100 rounded-full mx-auto mb-2 flex items-center justify-center text-amber-600 font-bold text-xl group-hover:bg-amber-400 group-hover:text-white transition-all">
                    {cat.name[0].toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-gray-700">{cat.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {productsData?.data && productsData.data.length > 0 && (
          <section className="mt-12 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Featured Products</h2>
              <Link
                href="/products"
                className="bg-amber-400 text-gray-900 font-semibold px-5 py-2 rounded-full hover:bg-amber-300 transition-all text-sm"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {productsData.data.map((product: Product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-amber-400 transition-all group"
                >
                  <div className="h-44 bg-gray-100 relative overflow-hidden">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-amber-500 font-medium mb-1">{product.category.name}</p>
                    <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate">{product.name}</h3>
                    <p className="text-amber-500 font-bold">¥{product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
