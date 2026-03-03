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
    <html lang="en">
      <body className={`${poppins.variable} antialiased bg-gray-50`} style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
        <QueryProvider>
          <Navbar />
          <div className="min-h-screen">{children}</div>
          <footer className="bg-gray-900 text-white py-8 text-center mt-16">
            <p className="text-gray-400 text-sm">
              © 2024 <span className="text-amber-400 font-semibold">OneStopMarket</span>. All rights reserved.
            </p>
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
