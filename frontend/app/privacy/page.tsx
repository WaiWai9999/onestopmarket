import TopBar from '@/components/layout/TopBar';
import Ticker from '@/components/layout/Ticker';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const sections = [
  {
    title: '1. 収集する情報',
    content: [
      '当社は、本サービスの提供にあたり、以下の個人情報を収集することがあります。',
      '(1) お名前、メールアドレス、電話番号、住所等の連絡先情報',
      '(2) ユーザーID、パスワード等のアカウント情報',
      '(3) 注文履歴、配送先情報、お支払い方法等の取引情報',
      '(4) アクセスログ、Cookie、IPアドレス等の技術情報',
      '(5) お問い合わせ内容等のコミュニケーション情報',
    ],
  },
  {
    title: '2. 情報の利用目的',
    content: [
      '収集した個人情報は、以下の目的で利用します。',
      '(1) 本サービスの提供、運営、維持、改善',
      '(2) ユーザーからのお問い合わせへの対応',
      '(3) 注文の処理、商品の配送、代金の決済',
      '(4) 新機能、セール情報、キャンペーン等のお知らせ',
      '(5) 不正利用の防止、セキュリティの確保',
      '(6) 利用規約に違反する行為への対応',
      '(7) サービス利用状況の統計・分析',
    ],
  },
  {
    title: '3. 情報の共有・第三者提供',
    content: [
      '当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。',
      '(1) ユーザーの同意がある場合',
      '(2) 法令に基づく場合',
      '(3) 人の生命、身体または財産の保護のために必要がある場合であって、ユーザーの同意を得ることが困難であるとき',
      '(4) 業務委託先（決済処理、配送業者等）に対して、サービス提供に必要な範囲で提供する場合',
      '当社は、決済処理にStripe, Inc.のサービスを利用しています。クレジットカード情報は当社のサーバーには保存されず、Stripeの安全な環境で処理されます。',
    ],
  },
  {
    title: '4. Cookieの使用',
    content: [
      '当社は、本サービスにおいてCookieおよび類似の技術を使用しています。',
      'Cookieは、ユーザーのログイン状態の維持、利用状況の分析、サービスの改善等のために使用されます。',
      'ユーザーは、ブラウザの設定によりCookieの受け入れを拒否することができますが、その場合、本サービスの一部機能が利用できなくなる場合があります。',
    ],
  },
  {
    title: '5. 情報の保護',
    content: [
      '当社は、個人情報の漏洩、滅失、毀損の防止等のために、適切なセキュリティ対策を講じます。',
      '通信はSSL/TLSにより暗号化されています。',
      'パスワードはハッシュ化して保存しており、平文では保存していません。',
      '定期的なセキュリティ監査を実施しています。',
    ],
  },
  {
    title: '6. ユーザーの権利',
    content: [
      'ユーザーは、当社が保有する自己の個人情報について、以下の権利を有します。',
      '(1) 個人情報の開示を請求する権利',
      '(2) 個人情報の訂正・追加・削除を請求する権利',
      '(3) 個人情報の利用停止を請求する権利',
      '(4) アカウントの削除を請求する権利',
      'これらの請求は、カスタマーサポートまでお問い合わせください。本人確認の上、対応いたします。',
    ],
  },
  {
    title: '7. 未成年者の個人情報',
    content: [
      '当社は、16歳未満の方から意図的に個人情報を収集しません。',
      '16歳未満の方が個人情報を提供された場合、保護者の方はカスタマーサポートまでご連絡ください。確認の上、速やかに情報を削除いたします。',
    ],
  },
  {
    title: '8. プライバシーポリシーの変更',
    content: [
      '当社は、必要に応じて本プライバシーポリシーを変更することがあります。',
      '重要な変更を行う場合は、本サービス上での告知またはメールでお知らせいたします。',
      '変更後のプライバシーポリシーは、当社ウェブサイトに掲載した時点から効力を生じます。',
    ],
  },
  {
    title: '9. お問い合わせ窓口',
    content: [
      '個人情報の取扱いに関するご質問・ご相談は、以下の窓口までお問い合わせください。',
      'メール: privacy@onestopmarket.com',
      '電話: +81-3-XXXX-XXXX（平日 10:00〜18:00）',
      '住所: 〒100-0001 東京都千代田区千代田1-1-1 モールショップビル',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh' }}>
      <TopBar />
      <Ticker />
      <Navbar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 12px' }}>
        {/* Header */}
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '24px 28px', marginBottom: 12 }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#222', margin: '0 0 6px' }}>プライバシーポリシー</h1>
          <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>
            最終更新日: 2026年1月1日
          </p>
        </div>

        {/* Introduction */}
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '20px 28px', marginBottom: 12 }}>
          <p style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.8, margin: 0 }}>
            モールショップ（以下「当社」）は、ユーザーの個人情報の保護を重要な責務と考え、以下のとおりプライバシーポリシーを定め、
            個人情報の適切な取扱い及び保護に努めます。
          </p>
        </div>

        {/* Sections */}
        {sections.map((section, i) => (
          <div key={i} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '20px 28px', marginBottom: i < sections.length - 1 ? 8 : 12 }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#222', margin: '0 0 12px', paddingBottom: 8, borderBottom: '2px solid #ff0033' }}>
              {section.title}
            </h2>
            {section.content.map((text, j) => (
              <p key={j} style={{ fontSize: '0.82rem', color: '#444', lineHeight: 1.8, margin: j < section.content.length - 1 ? '0 0 6px' : 0, paddingLeft: text.startsWith('(') ? 16 : 0 }}>
                {text}
              </p>
            ))}
          </div>
        ))}

      </div>
      <Footer />
    </div>
  );
}
