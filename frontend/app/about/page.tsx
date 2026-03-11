'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff0033]/5 via-white to-[#ff0033]/10">
      {/* Header */}
      <div className="bg-[#ff0033] text-white px-6 py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">OneStopMarketについて</h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          便利で快適なショッピング体験を、すべての方に
        </p>
      </div>

      {/* Mission Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">私たちのミッション</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              OneStopMarketは、ショッピングはシンプルで楽しく、誰もが利用しやすいものであるべきだと考えています。
              厳選された高品質な商品を手頃な価格で提供し、シームレスなオンラインショッピング体験をお届けすることが
              私たちの使命です。
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              商品の品質からカスタマーサポートまで、あらゆる面で卓越したサービスを提供することに全力を尽くしています。
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#ff0033] to-[#e6002d] rounded-2xl h-96 shadow-xl flex items-center justify-center">
            <div className="text-center text-white">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-lg font-semibold">イノベーション第一</p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 mb-20">
        <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">私たちの価値観</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: '品質へのこだわり',
              desc: '信頼できる仕入先から最高の商品のみを厳選し、お客様にご満足いただける品質をお約束します。',
              icon: '⭐'
            },
            {
              title: '信頼と誠実さ',
              desc: '透明性と誠実さをすべての活動の基盤とし、お客様との信頼関係を大切にしています。',
              icon: '🤝'
            },
            {
              title: 'イノベーション',
              desc: '最高のショッピング体験を提供するために、プラットフォームの継続的な改善に取り組んでいます。',
              icon: '💡'
            },
            {
              title: 'お客様第一',
              desc: 'お客様の満足を最優先に、24時間365日のサポート体制でお応えします。',
              icon: '❤️'
            },
            {
              title: 'サステナビリティ',
              desc: '環境に配慮し、エコフレンドリーなショッピングの推進に努めています。',
              icon: '🌍'
            },
            {
              title: 'コミュニティ',
              desc: '満足度の高い、ロイヤルなお客様のコミュニティづくりを目指しています。',
              icon: '👥'
            }
          ].map((value) => (
            <div key={value.title} className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#ff0033] hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">{value.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#ff0033] py-16 mb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { label: 'お客様の笑顔', value: '50K+' },
              { label: '取扱商品数', value: '5K+' },
              { label: 'サービス提供年数', value: '5+' },
              { label: '1日あたりの取引件数', value: '1K+' }
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-lg text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">お問い合わせ</h2>
          <p className="text-gray-600 text-lg mb-8">
            ご質問やご相談がございましたら、お気軽にお問い合わせください。
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">メール</p>
              <p className="text-lg font-semibold text-[#ff0033]">support@onestopmarket.com</p>
            </div>
            <div className="hidden md:block border-l border-gray-300"></div>
            <div>
              <p className="text-sm text-gray-500 mb-1">電話</p>
              <p className="text-lg font-semibold text-[#ff0033]">+81-3-XXXX-XXXX</p>
            </div>
            <div className="hidden md:block border-l border-gray-300"></div>
            <div>
              <p className="text-sm text-gray-500 mb-1">営業時間</p>
              <p className="text-lg font-semibold text-[#ff0033]">24時間対応</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
