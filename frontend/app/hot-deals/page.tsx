'use client';

import Link from 'next/link';

export default function HotDealsPage() {
  // Example deals - in production, this would come from your API
  const deals = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      originalPrice: 12000,
      dealPrice: 7999,
      discount: 33,
      image: '🎧',
      badge: 'Flash Sale',
      expiresIn: '2 hours'
    },
    {
      id: 2,
      name: 'Smart Watch Pro',
      originalPrice: 15000,
      dealPrice: 9999,
      discount: 33,
      image: '⌚',
      badge: 'Limited Stock',
      expiresIn: '18 hours'
    },
    {
      id: 3,
      name: 'Portable Power Bank',
      originalPrice: 5000,
      dealPrice: 2999,
      discount: 40,
      image: '🔋',
      badge: 'Best Seller',
      expiresIn: '5 hours'
    },
    {
      id: 4,
      name: 'USB-C Cable Bundle (3pcs)',
      originalPrice: 3000,
      dealPrice: 1499,
      discount: 50,
      image: '🔌',
      badge: 'Bundle Deal',
      expiresIn: '24 hours'
    },
    {
      id: 5,
      name: 'Bluetooth Speaker',
      originalPrice: 8000,
      dealPrice: 4999,
      discount: 37,
      image: '🔊',
      badge: 'Daily Deal',
      expiresIn: '12 hours'
    },
    {
      id: 6,
      name: 'Screen Protector Pack (5pcs)',
      originalPrice: 2500,
      dealPrice: 999,
      discount: 60,
      image: '📱',
      badge: 'Hot Pick',
      expiresIn: '3 hours'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-block text-6xl mb-4">🔥</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Hot Deals</h1>
          <p className="text-lg text-gray-600">Limited-time offers you don't want to miss!</p>
        </div>

        {/* Filter/Info Bar */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-6 mb-12 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">⏰ Flash Sale Alert</p>
              <p className="text-sm text-gray-600">Prices update every hour - Check back for new deals!</p>
            </div>
            <div className="text-sm font-semibold text-orange-600">
              Updated: Just now
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {deals.map((deal) => (
            <Link key={deal.id} href={`/products/${deal.id}`}>
              <div className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer h-full border border-gray-200 hover:border-orange-300">
                {/* Product Image Area */}
                <div className="bg-gradient-to-br from-orange-100 to-orange-50 h-48 flex items-center justify-center relative overflow-hidden">
                  <div className="text-6xl">{deal.image}</div>
                  
                  {/* Discount Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                    -{deal.discount}%
                  </div>

                  {/* Deal Type Badge */}
                  <div className="absolute top-4 left-4 bg-white text-orange-600 px-3 py-1 rounded-full font-semibold text-xs">
                    {deal.badge}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg line-clamp-2">{deal.name}</h3>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-3 mb-2">
                      <p className="text-3xl font-bold text-orange-600">¥{deal.dealPrice.toLocaleString()}</p>
                      <p className="text-sm text-gray-500 line-through">¥{deal.originalPrice.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-red-600 font-semibold">You save ¥{(deal.originalPrice - deal.dealPrice).toLocaleString()}</p>
                  </div>

                  {/* Expiry */}
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center mb-4">
                    <p className="text-xs font-semibold text-red-600">⏳ Expires in {deal.expiresIn}</p>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-200">
                    View Deal →
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Why Shop Hot Deals */}
        <div className="bg-white rounded-xl border border-gray-200 p-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Why Shop Hot Deals?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <p className="font-semibold text-gray-800 mb-2">Save Big</p>
              <p className="text-gray-600">Up to 60% off on selected products</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <p className="font-semibold text-gray-800 mb-2">Limited Stock</p>
              <p className="text-gray-600">Pre-order or buy while supplies last</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎁</div>
              <p className="font-semibold text-gray-800 mb-2">Exclusive Offers</p>
              <p className="text-gray-600">Premium deals available only here</p>
            </div>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-teal-500 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Never Miss a Deal!</h3>
          <p className="mb-6">Subscribe to get notifications about new hot deals</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
