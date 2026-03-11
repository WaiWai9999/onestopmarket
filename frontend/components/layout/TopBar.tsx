'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

export default function TopBar() {
  const { user, _hasHydrated } = useAuthStore();

  return (
    <div style={{ background: '#ff0033', color: 'white', fontSize: '0.75rem', padding: '5px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {_hasHydrated && !user ? (
            <>
              <Link href="/register" style={{ color: 'white' }}>会員登録（無料）</Link>
              <Link href="/login" style={{ color: 'white' }}>ログイン</Link>
            </>
          ) : (
            <Link href="/mypage/profile" style={{ color: 'white' }}>マイページ</Link>
          )}
          <Link href="/mypage/profile" style={{ color: 'white' }}>ポイント確認</Link>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/support" style={{ color: 'white' }}>ヘルプ</Link>
          <Link href="/support" style={{ color: 'white' }}>お問い合わせ</Link>
          <span style={{ color: 'white', cursor: 'default' }}>ストア出店</span>
        </div>
      </div>
    </div>
  );
}
