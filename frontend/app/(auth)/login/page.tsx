'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && user) router.push('/');
  }, [_hasHydrated, user, router]);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('session_expired')) {
      setSessionExpired(true);
      sessionStorage.removeItem('session_expired');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data.user, data.accessToken);
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch {
      setError('メールアドレスまたはパスワードが正しくありません');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh' }}>
      {/* Mini header */}
      <header style={{ background: 'white', borderBottom: '3px solid #ff0033', padding: '12px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.1 }}>
                <span style={{ color: '#ff0033' }}>モール</span>
                <span style={{ color: '#333' }}>ショップ</span>
              </div>
              <div style={{ fontSize: '0.55rem', color: '#888', letterSpacing: '0.05em' }}>
                かんたんお買いもの
              </div>
            </div>
          </Link>
          <Link href="/support" style={{ fontSize: '0.78rem', color: '#0075c2', textDecoration: 'none' }}>
            お困りの方はこちら
          </Link>
        </div>
      </header>

      {/* Main */}
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '40px 16px 60px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#222', margin: '0 0 6px' }}>ログイン</h1>
          <p style={{ fontSize: '0.78rem', color: '#888' }}>
            モールショップのアカウントでログイン
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '28px 24px' }}>
          {sessionExpired && (
            <div style={{ background: '#fff9e6', border: '1px solid #f5c842', borderRadius: 3, padding: '10px 14px', marginBottom: 16, fontSize: '0.8rem', color: '#664d00' }}>
              セッションの有効期限が切れました。再度ログインしてください。
            </div>
          )}
          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #ffcdd2', borderRadius: 3, padding: '10px 14px', marginBottom: 16, fontSize: '0.8rem', color: '#c62828' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#333', marginBottom: 6 }}>
                メールアドレス
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@mail.com"
                style={{
                  width: '100%',
                  border: '1px solid #ddd',
                  borderRadius: 3,
                  padding: '10px 12px',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#ff0033')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#333', marginBottom: 6 }}>
                パスワード
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="パスワードを入力"
                style={{
                  width: '100%',
                  border: '1px solid #ddd',
                  borderRadius: 3,
                  padding: '10px 12px',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#ff0033')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <Link href="/support" style={{ fontSize: '0.72rem', color: '#0075c2', textDecoration: 'none' }}>
                パスワードをお忘れの方
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#ccc' : '#ff0033',
                color: 'white',
                border: 'none',
                borderRadius: 3,
                padding: '13px 0',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#cc0029'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#ff0033'; }}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
            <span style={{ fontSize: '0.72rem', color: '#aaa' }}>または</span>
            <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
          </div>

          {/* Social login buttons (placeholder) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              disabled
              style={{
                width: '100%',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: 3,
                padding: '10px 0',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: '#555',
                cursor: 'not-allowed',
                opacity: 0.6,
              }}
            >
              Googleでログイン
            </button>
            <button
              type="button"
              disabled
              style={{
                width: '100%',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: 3,
                padding: '10px 0',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: '#555',
                cursor: 'not-allowed',
                opacity: 0.6,
              }}
            >
              LINEでログイン
            </button>
          </div>
        </div>

        {/* Register CTA */}
        <div style={{
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: 4,
          padding: '18px 24px',
          marginTop: 12,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.82rem', color: '#555', margin: '0 0 10px' }}>
            まだアカウントをお持ちでないですか？
          </p>
          <Link
            href="/register"
            style={{
              display: 'block',
              border: '1px solid #ff0033',
              color: '#ff0033',
              borderRadius: 3,
              padding: '10px 0',
              fontSize: '0.88rem',
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#ff0033'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#ff0033'; }}
          >
            新規会員登録（無料）
          </Link>
        </div>

        {/* Trust badges */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 20, fontSize: '0.68rem', color: '#999' }}>
          <span>🔒 SSL暗号化通信</span>
          <span>🛡️ 個人情報保護</span>
          <span>✓ 安心のセキュリティ</span>
        </div>
      </div>
    </div>
  );
}
