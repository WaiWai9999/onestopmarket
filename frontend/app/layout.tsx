import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/providers/query-provider';

export const metadata: Metadata = {
  title: 'モールショップ - かんたんお買いもの',
  description: 'モールショップ Yahoo! Shopping風ECサイト',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
