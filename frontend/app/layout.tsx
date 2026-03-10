import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/query-provider';
import Navbar from '@/components/layout/Navbar';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'OneStopMarket',
  description: 'Your one stop shop for everything',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${poppins.variable} antialiased`} style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
        <QueryProvider>
          <Navbar />
          <div className="min-h-screen">{children}</div>
          <footer className="bg-[#f5f3ef] border-t border-gray-200 mt-20">
            {/* Main footer */}
            <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Brand */}
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">OneStopMarket</p>
                <h2 className="text-xl font-bold text-gray-900 leading-snug mb-3">
                  Everyday goods, presented<br />like a discovery.
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Browse pantry favorites, home cafe picks, and gift-ready finds
                  in a storefront built for quick decisions and calm browsing.
                </p>
              </div>

              {/* Explore */}
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">Explore</p>
                <nav className="flex flex-col gap-2.5">
                  {[
                    { label: 'Home', href: '/' },
                    { label: 'Products', href: '/products' },
                    { label: 'Hot Deals', href: '/hot-deals' },
                    { label: 'About', href: '/about' },
                  ].map((link) => (
                    <a key={link.href} href={link.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit">
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Service */}
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">Service</p>
                <nav className="flex flex-col gap-2.5 mb-5">
                  <a href="/support" className="text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit">
                    Customer Support
                  </a>
                  <a href="/support#orders" className="text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit">
                    Order Help
                  </a>
                  <a href="/support#returns" className="text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit">
                    Returns & Refunds
                  </a>
                  <a href="/support#shipping" className="text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit">
                    Shipping Info
                  </a>
                </nav>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-200">
              <div className="max-w-6xl mx-auto px-6 py-4">
                <p className="text-xs text-gray-400 text-center">
                  2026 OneStopMarket. Curated demo storefront.
                </p>
              </div>
            </div>
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
