'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import TopBar from '@/components/layout/TopBar';
import Ticker from '@/components/layout/Ticker';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const STEPS = ['カート', 'お届け先', 'お支払い', '確認', '完了'];

function CompleteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  }, [queryClient]);

  return (
    <div style={{ background: '#f4f4f4' }}>
      <div className="max-w-[1200px] mx-auto px-3 py-3">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[0.75rem] text-[#888] mb-2.5">
          <Link href="/" className="text-[#0075c2] hover:underline">トップ</Link>
          <span className="text-[#ccc]">›</span>
          <span>ご注文完了</span>
        </nav>

        {/* Step bar */}
        <div className="bg-white border border-[#e0e0e0] rounded py-3.5 px-5 mb-3.5 flex items-center justify-center">
          {STEPS.map((step, i) => (
            <span key={step} className="flex items-center">
              <span className={`flex items-center gap-1.5 text-[0.8rem] ${
                i === 4 ? 'text-[#ff0033] font-bold' : 'text-[#2e7d32]'
              }`}>
                <span
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[0.72rem] font-bold ${
                    i < 4
                      ? 'border-[#2e7d32] bg-[#2e7d32] text-white'
                      : 'border-[#ff0033] text-[#ff0033] bg-white'
                  }`}
                >
                  {i < 4 ? '✓' : '5'}
                </span>
                {step}
              </span>
              {i < STEPS.length - 1 && (
                <span className="w-[60px] h-px bg-[#2e7d32] mx-2 flex-shrink-0" />
              )}
            </span>
          ))}
        </div>

        {/* Success content */}
        <div className="bg-white border border-[#e0e0e0] rounded text-center py-12 px-8">
          <p className="text-[4rem] mb-3.5">🎉</p>
          <h1 className="text-[1.3rem] font-bold text-[#222] mb-2">ご注文が完了しました！</h1>
          <p className="text-[0.85rem] text-[#666] leading-[1.7] mb-5">
            ご注文ありがとうございます。<br />
            確認メールをお送りしました。ご注文の詳細は注文履歴からご確認いただけます。
          </p>

          {orderId && (
            <div className="bg-[#f8f8f8] border border-[#e0e0e0] rounded px-4 py-2.5 text-[0.82rem] text-[#444] mb-5 inline-block">
              注文番号: <strong className="text-[#ff0033] text-[1rem]">#{orderId.slice(0, 10).toUpperCase()}</strong>
            </div>
          )}

          <div className="flex justify-center gap-2">
            <button
              onClick={() => router.push('/')}
              className="bg-[#ff0033] hover:bg-[#cc0029] text-white px-7 py-[11px] rounded font-bold text-[0.9rem] cursor-pointer border-none transition-colors"
            >
              トップページへ
            </button>
            <Link
              href="/mypage/orders"
              className="bg-white text-[#555] border border-[#ddd] px-5 py-[9px] rounded text-[0.85rem] hover:border-[#ff0033] hover:text-[#ff0033] transition-colors inline-flex items-center"
            >
              注文履歴を見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompletePage() {
  return (
    <>
      <TopBar />
      <Ticker />
      <Navbar />
      <Suspense>
        <CompleteContent />
      </Suspense>
      <Footer />
    </>
  );
}
