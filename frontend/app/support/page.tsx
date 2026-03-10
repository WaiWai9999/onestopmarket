import Link from 'next/link';

const FAQ = [
  {
    category: '注文について',
    items: [
      {
        q: '注文の状況を確認するには？',
        a: '注文後、マイページ → 注文履歴からいつでもステータスを確認できます。ステータスは「保留中 → 支払済 → 発送済 → 配達完了」の順に更新されます。',
      },
      {
        q: '注文のキャンセルや変更はできますか？',
        a: '「保留中」の間はキャンセルが可能です。お支払い確認後のキャンセルはお受けできません。お早めにお問い合わせください。',
      },
      {
        q: 'どのような支払い方法に対応していますか？',
        a: 'Stripe経由でVisa、Mastercard、Amexなどの主要なクレジットカード・デビットカードをご利用いただけます。すべての決済は暗号化され安全に処理されます。',
      },
    ],
  },
  {
    category: '配送について',
    items: [
      {
        q: '配送にはどのくらいかかりますか？',
        a: '通常配送は、お届け先により2〜5営業日ほどかかります。配送目安はチェックアウト画面に表示されます。',
      },
      {
        q: '送料無料はありますか？',
        a: '対象注文は送料無料でお届けします。無料配送の条件はチェックアウト画面でカート合計に基づき表示されます。',
      },
    ],
  },
  {
    category: '返品について',
    items: [
      {
        q: '返品ポリシーを教えてください。',
        a: '商品到着後14日以内であれば、未使用かつ元の状態の商品に限り返品を受け付けています。返品をご希望の場合は、サポートチームまでお問い合わせください。',
      },
      {
        q: '返金にはどのくらいかかりますか？',
        a: '返品商品の受領・検品後、5〜10営業日以内に返金処理を行います。',
      },
    ],
  },
  {
    category: 'アカウントについて',
    items: [
      {
        q: 'パスワードをリセットするには？',
        a: 'ログイン後、マイページ → パスワード変更から変更できます。ログインできない場合は、サポートチームまで直接お問い合わせください。',
      },
      {
        q: '配送先住所を変更するには？',
        a: 'マイページ → プロフィール情報からデフォルトの配送先住所を更新できます。変更は今後の注文に適用されます。',
      },
    ],
  },
];

export default function SupportPage() {
  return (
    <>
      {/* Hero header */}
      <div className="bg-[#1a6b1f] text-white px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-white/80 uppercase tracking-widest mb-2">ヘルプセンター</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">カスタマーサポート</h1>
          <p className="text-white/70 text-sm max-w-md">
            注文、配送、返品、アカウントに関するよくある質問をまとめています。
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { icon: '📦', label: '注文', href: '#注文について' },
            { icon: '🚚', label: '配送', href: '#配送について' },
            { icon: '↩️', label: '返品', href: '#返品について' },
            { icon: '👤', label: 'アカウント', href: '#アカウントについて' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="bg-white border border-gray-200 rounded-2xl p-4 text-center hover:border-[#1a6b1f] hover:shadow-sm transition-all group"
            >
              <div className="text-2xl mb-1.5">{item.icon}</div>
              <p className="text-sm font-semibold text-gray-700 group-hover:text-[#1a6b1f] transition-colors">{item.label}</p>
            </a>
          ))}
        </div>

        {/* FAQ sections */}
        <div className="space-y-10">
          {FAQ.map((section) => (
            <section key={section.category} id={section.category}>
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.q} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#1a6b1f]/30 transition-colors">
                    <p className="font-semibold text-gray-900 text-sm mb-2">{item.q}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-14 bg-[#1a6b1f] rounded-2xl px-8 py-10 text-center text-white">
          <h2 className="text-xl font-bold mb-2">まだお困りですか？</h2>
          <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">
            お探しの情報が見つからない場合は、注文履歴をご確認いただくか、商品ページをご覧ください。
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/mypage/orders"
              className="bg-white hover:bg-gray-50 text-[#1a6b1f] font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              注文履歴を見る
            </Link>
            <Link
              href="/products"
              className="border border-white/30 hover:border-white/60 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              商品を探す
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
