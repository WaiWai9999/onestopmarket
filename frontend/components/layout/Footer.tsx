import Link from 'next/link';

const footerLinks = [
  { title: 'ショッピング', links: [
    { label: '商品を探す', href: '/products' },
    { label: 'ランキング', href: '/products' },
    { label: 'セール・特集', href: '/hot-deals' },
    { label: 'クーポン', href: '/mypage/coupons' },
  ]},
  { title: '会員サービス', links: [
    { label: '会員登録（無料）', href: '/register' },
    { label: 'ログイン', href: '/login' },
    { label: 'ポイント確認', href: '/mypage' },
    { label: 'プレミアム会員', href: '/mypage' },
  ]},
  { title: '注文・配送', links: [
    { label: '注文履歴', href: '/mypage/orders' },
    { label: '配送状況確認', href: '/mypage/orders' },
    { label: '返品・交換', href: '/support' },
    { label: 'お支払い方法', href: '/support' },
  ]},
  { title: 'サポート', links: [
    { label: 'よくある質問', href: '/support' },
    { label: 'お問い合わせ', href: '/about' },
    { label: '利用規約', href: '/terms' },
    { label: 'プライバシーポリシー', href: '/privacy' },
  ]},
];

const footerBottom = [
  { label: '利用規約', href: '/terms' },
  { label: 'プライバシーポリシー', href: '/privacy' },
  { label: '特定商取引法に基づく表記', href: '/legal' },
  { label: '会社概要', href: '/about' },
  { label: 'サイトマップ', href: '/products' },
];

export default function Footer() {
  return (
    <footer style={{ marginTop: 12, background: 'white', borderTop: '3px solid #ff0033' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 12px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 48px', marginBottom: 24 }}>
          {footerLinks.map((col) => (
            <div key={col.title} style={{ minWidth: 140 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 8 }}>{col.title}</div>
              {col.links.map((link) => (
                <div key={link.label} style={{ marginBottom: 4 }}>
                  <Link
                    href={link.href}
                    style={{ fontSize: '0.75rem', color: '#666', textDecoration: 'none' }}
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            <span style={{ color: '#ff0033' }}>モール</span>
            <span style={{ color: '#333' }}>ショップ</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {footerBottom.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{ fontSize: '0.72rem', color: '#aaa', textDecoration: 'none' }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: '0.72rem', color: '#ccc' }}>
          © 2026 モールショップ. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
