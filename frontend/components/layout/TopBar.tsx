'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function TopBar() {
  const { user, _hasHydrated, logout } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div style={{ background: '#ff0033', color: 'white', fontSize: '0.75rem', padding: '5px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {_hasHydrated && !user ? (
            <>
              <Link href="/register" style={{ color: 'white', textDecoration: 'none' }}>会員登録（無料）</Link>
              <Link href="/login" style={{ color: 'white', textDecoration: 'none' }}>ログイン</Link>
            </>
          ) : _hasHydrated && user ? (
            <>
              <span style={{ color: 'rgba(255,255,255,0.85)' }}>
                {user.name} さん
              </span>
              {isAdmin && (
                <Link href="/admin" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '1px 8px', borderRadius: 3, fontWeight: 700 }}>
                  管理パネル
                </Link>
              )}
              <Link href="/mypage" style={{ color: 'white', textDecoration: 'none' }}>マイページ</Link>
              <button
                onClick={handleLogout}
                style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
              >
                ログアウト
              </button>
            </>
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/mypage/profile" style={{ color: 'white', textDecoration: 'none' }}>ポイント確認</Link>
          <Link href="/support" style={{ color: 'white', textDecoration: 'none' }}>ヘルプ</Link>
          <Link href="/support" style={{ color: 'white', textDecoration: 'none' }}>お問い合わせ</Link>
        </div>
      </div>
    </div>
  );
}
