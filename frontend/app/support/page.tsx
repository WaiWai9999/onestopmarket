import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import Ticker from '@/components/layout/Ticker';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const FAQ = [
  {
    category: '注文について',
    icon: '📦',
    items: [
      {
        q: '注文の状況を確認するには？',
        a: '注文後、マイページ → 注文履歴からいつでもステータスを確認できます。ステータスは「決済待ち → 発送準備中 → 配送中 → 配達完了」の順に更新されます。',
      },
      {
        q: '注文のキャンセルや変更はできますか？',
        a: '「決済待ち」の間はキャンセルが可能です。お支払い確認後のキャンセルはお受けできません。お早めにお問い合わせください。',
      },
      {
        q: 'どのような支払い方法に対応していますか？',
        a: 'Stripe経由でVisa、Mastercard、Amexなどの主要なクレジットカード・デビットカードをご利用いただけます。すべての決済は暗号化され安全に処理されます。',
      },
    ],
  },
  {
    category: '配送について',
    icon: '🚚',
    items: [
      {
        q: '配送にはどのくらいかかりますか？',
        a: '通常配送は、お届け先により2〜5営業日ほどかかります。配送目安はチェックアウト画面に表示されます。',
      },
      {
        q: '送料無料はありますか？',
        a: '3,000円以上のご注文で送料無料です。3,000円未満のご注文には全国一律500円の送料がかかります。',
      },
      {
        q: '配送状況を追跡できますか？',
        a: '発送完了後、マイページの注文履歴から配送状況をご確認いただけます。ステータスが「配送中」に変わった時点で配送が開始されています。',
      },
    ],
  },
  {
    category: '返品・交換について',
    icon: '↩️',
    items: [
      {
        q: '返品ポリシーを教えてください。',
        a: '商品到着後14日以内であれば、未使用かつ未開封の商品に限り返品を受け付けています。返品をご希望の場合は、サポートチームまでお問い合わせください。',
      },
      {
        q: '返金にはどのくらいかかりますか？',
        a: '返品商品の受領・検品後、5〜10営業日以内に返金処理を行います。クレジットカードへの返金反映には、カード会社により追加で数日かかる場合があります。',
      },
      {
        q: '不良品が届いた場合は？',
        a: '不良品や注文と異なる商品が届いた場合は、当社負担で交換または返金いたします。商品到着後7日以内にカスタマーサポートまでご連絡ください。',
      },
    ],
  },
  {
    category: 'アカウントについて',
    icon: '👤',
    items: [
      {
        q: 'パスワードをリセットするには？',
        a: 'ログイン後、マイページ → パスワード変更から変更できます。ログインできない場合は、サポートチームまで直接お問い合わせください。',
      },
      {
        q: '配送先住所を変更するには？',
        a: 'マイページ → プロフィール情報からデフォルトの配送先住所を更新できます。変更は今後の注文に適用されます。',
      },
      {
        q: '会員登録は無料ですか？',
        a: 'はい、会員登録は完全無料です。登録するだけで500ポイントプレゼント、注文履歴の確認、お気に入り機能、クーポンの取得などがご利用いただけます。',
      },
    ],
  },
  {
    category: 'クーポン・ポイントについて',
    icon: '🎫',
    items: [
      {
        q: 'クーポンの使い方を教えてください。',
        a: 'マイページ → クーポンから利用可能なクーポンを取得し、カート画面でクーポンコードを入力して適用してください。',
      },
      {
        q: 'ポイントはどのように貯まりますか？',
        a: 'お買い物金額の5%がポイントとして付与されます。プレミアム会員の場合はポイント2倍の10%還元となります。',
      },
      {
        q: 'ポイントの有効期限はありますか？',
        a: '最後のお買い物から1年間有効です。1年以内にお買い物いただければ、保有ポイントの有効期限が延長されます。',
      },
    ],
  },
];

export default function SupportPage() {
  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh' }}>
      <TopBar />
      <Ticker />
      <Navbar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 12px' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ff0033 0%, #ff6b35 100%)',
          borderRadius: 4,
          padding: '28px',
          marginBottom: 12,
          color: 'white',
        }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px' }}>カスタマーサポート</h1>
          <p style={{ fontSize: '0.82rem', opacity: 0.9, margin: 0 }}>
            注文、配送、返品、アカウントに関するよくある質問をまとめています。
          </p>
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
          {FAQ.map((section) => (
            <a
              key={section.category}
              href={`#${section.category}`}
              style={{
                background: 'white',
                padding: '14px 8px',
                textAlign: 'center',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{section.icon}</div>
              <div style={{ fontSize: '0.72rem', color: '#444', fontWeight: 600 }}>{section.category.replace('について', '')}</div>
            </a>
          ))}
        </div>

        {/* FAQ sections */}
        {FAQ.map((section) => (
          <div key={section.category} id={section.category} style={{ marginBottom: 12 }}>
            <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
              {/* Section header */}
              <div style={{ padding: '14px 20px', borderBottom: '2px solid #ff0033', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.1rem' }}>{section.icon}</span>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#222', margin: 0 }}>{section.category}</h2>
              </div>

              {/* Questions */}
              {section.items.map((item, i) => (
                <div key={i} style={{ padding: '16px 20px', borderBottom: i < section.items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <span style={{
                      flexShrink: 0,
                      width: 22,
                      height: 22,
                      background: '#ff0033',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                    }}>Q</span>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#222', margin: 0, lineHeight: 1.5, paddingTop: 1 }}>{item.q}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{
                      flexShrink: 0,
                      width: 22,
                      height: 22,
                      background: '#e8f5e9',
                      color: '#2e7d32',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                    }}>A</span>
                    <p style={{ fontSize: '0.82rem', color: '#555', margin: 0, lineHeight: 1.7, paddingTop: 1 }}>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div style={{
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: 4,
          padding: '28px',
          textAlign: 'center',
          marginBottom: 12,
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: 6 }}>💬</p>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#222', margin: '0 0 6px' }}>まだお困りですか？</h2>
          <p style={{ fontSize: '0.78rem', color: '#888', margin: '0 0 16px' }}>
            お探しの情報が見つからない場合は、お気軽にお問い合わせください。
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ background: '#f8f8f8', borderRadius: 4, padding: '12px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.68rem', color: '#888', margin: '0 0 2px' }}>メール</p>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ff0033', margin: 0 }}>support@onestopmarket.com</p>
            </div>
            <div style={{ background: '#f8f8f8', borderRadius: 4, padding: '12px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.68rem', color: '#888', margin: '0 0 2px' }}>電話</p>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ff0033', margin: 0 }}>+81-3-XXXX-XXXX</p>
            </div>
            <div style={{ background: '#f8f8f8', borderRadius: 4, padding: '12px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.68rem', color: '#888', margin: '0 0 2px' }}>営業時間</p>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ff0033', margin: 0 }}>24時間対応</p>
            </div>
          </div>
        </div>

        {/* Bottom links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/mypage/orders" style={{
            background: '#ff0033',
            color: 'white',
            border: 'none',
            borderRadius: 3,
            padding: '10px 24px',
            fontSize: '0.82rem',
            fontWeight: 700,
            textDecoration: 'none',
          }}>
            注文履歴を見る
          </Link>
          <Link href="/products" style={{
            background: 'white',
            color: '#444',
            border: '1px solid #ddd',
            borderRadius: 3,
            padding: '10px 24px',
            fontSize: '0.82rem',
            fontWeight: 700,
            textDecoration: 'none',
          }}>
            商品を探す
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
