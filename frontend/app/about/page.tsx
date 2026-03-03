'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">About OneStopMarket</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your ultimate destination for shopping convenience and quality products
        </p>
      </div>

      {/* Mission Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              At OneStopMarket, we believe shopping should be simple, enjoyable, and accessible to everyone. 
              Our mission is to provide a seamless online shopping experience with a carefully curated selection 
              of quality products at competitive prices.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              We're committed to delivering excellence in every aspect of our service, from product quality 
              to customer support.
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-teal-400 rounded-2xl h-96 shadow-xl flex items-center justify-center">
            <div className="text-center text-white">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-lg font-semibold">Innovation First</p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 mb-20">
        <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Quality',
              desc: 'We source only the best products from trusted suppliers to ensure customer satisfaction.',
              icon: '⭐'
            },
            {
              title: 'Trust',
              desc: 'Transparency and honesty are at the core of everything we do for our customers.',
              icon: '🤝'
            },
            {
              title: 'Innovation',
              desc: 'We continuously improve our platform to provide the best shopping experience.',
              icon: '💡'
            },
            {
              title: 'Customer First',
              desc: 'Your satisfaction is our top priority, and we\'re here to help 24/7.',
              icon: '❤️'
            },
            {
              title: 'Sustainability',
              desc: 'We care about the environment and promote eco-friendly shopping practices.',
              icon: '🌍'
            },
            {
              title: 'Community',
              desc: 'We believe in building a strong community of satisfied and loyal customers.',
              icon: '👥'
            }
          ].map((value) => (
            <div key={value.title} className="bg-white rounded-2xl p-8 border border-orange-100 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">{value.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-orange-500 to-teal-500 py-16 mb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { label: 'Happy Customers', value: '50K+' },
              { label: 'Products', value: '5K+' },
              { label: 'Years of Service', value: '5+' },
              { label: 'Daily Transactions', value: '1K+' }
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-lg opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Get In Touch</h2>
          <p className="text-gray-600 text-lg mb-8">
            We'd love to hear from you. Have any questions? We're here to help.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-lg font-semibold text-orange-600">support@onestopmarket.com</p>
            </div>
            <div className="hidden md:block border-l border-gray-300"></div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="text-lg font-semibold text-orange-600">+81-3-XXXX-XXXX</p>
            </div>
            <div className="hidden md:block border-l border-gray-300"></div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Hours</p>
              <p className="text-lg font-semibold text-orange-600">24/7 Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
