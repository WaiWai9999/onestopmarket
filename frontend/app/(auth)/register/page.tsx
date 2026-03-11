'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

export default function RegisterPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && user) router.push('/');
  }, [_hasHydrated, user, router]);

  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      router.push('/login');
    } catch {
      setError('登録に失敗しました。このメールアドレスは既に使用されている可能性があります。');
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
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#222', margin: '0 0 6px' }}>新規会員登録</h1>
          <p style={{ fontSize: '0.78rem', color: '#888' }}>
            無料でかんたんに登録できます
          </p>
        </div>

        {/* Benefits banner */}
        <div style={{
          background: '#fff9e6',
          border: '1px solid #f5c842',
          borderRadius: 4,
          padding: '14px 18px',
          marginBottom: 16,
        }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#664d00', margin: '0 0 8px' }}>
            🎁 会員特典
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              'お買い物でポイント1%還元',
              '注文履歴・配送状況の確認',
              'お気に入り・クーポンの利用',
              '新規登録で500ポイントプレゼント',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#664d00' }}>
                <span style={{ color: '#2e7d32', fontWeight: 700, flexShrink: 0 }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '28px 24px' }}>
          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #ffcdd2', borderRadius: 3, padding: '10px 14px', marginBottom: 16, fontSize: '0.8rem', color: '#c62828' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#333', marginBottom: 6 }}>
                お名前 <span style={{ color: '#ff0033', fontSize: '0.68rem' }}>必須</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="山田 太郎"
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

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#333', marginBottom: 6 }}>
                メールアドレス <span style={{ color: '#ff0033', fontSize: '0.68rem' }}>必須</span>
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

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#333', marginBottom: 6 }}>
                パスワード <span style={{ color: '#ff0033', fontSize: '0.68rem' }}>必須</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="8文字以上で入力"
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
              <p style={{ fontSize: '0.68rem', color: '#999', marginTop: 4 }}>
                半角英数字8文字以上
              </p>
            </div>

            {/* Terms */}
            <p style={{ fontSize: '0.68rem', color: '#999', marginBottom: 16, lineHeight: 1.6 }}>
              「登録する」ボタンを押すことで、
              <span style={{ color: '#0075c2', cursor: 'pointer' }}>利用規約</span>および
              <span style={{ color: '#0075c2', cursor: 'pointer' }}>プライバシーポリシー</span>
              に同意したものとみなされます。
            </p>

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
              {loading ? '登録中...' : '登録する（無料）'}
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
              Googleで登録
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
              LINEで登録
            </button>
          </div>
        </div>

        {/* Login CTA */}
        <div style={{
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: 4,
          padding: '18px 24px',
          marginTop: 12,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.82rem', color: '#555', margin: '0 0 10px' }}>
            すでにアカウントをお持ちの方
          </p>
          <Link
            href="/login"
            style={{
              display: 'block',
              border: '1px solid #555',
              color: '#555',
              borderRadius: 3,
              padding: '10px 0',
              fontSize: '0.88rem',
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f8f8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
          >
            ログイン
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
