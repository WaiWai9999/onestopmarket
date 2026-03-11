'use client';

import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import Ticker from '@/components/layout/Ticker';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const values = [
  { icon: '⭐', title: '品質へのこだわり', desc: '信頼できる仕入先から最高の商品のみを厳選し、お客様にご満足いただける品質をお約束します。' },
  { icon: '🤝', title: '信頼と誠実さ', desc: '透明性と誠実さをすべての活動の基盤とし、お客様との信頼関係を大切にしています。' },
  { icon: '💡', title: 'イノベーション', desc: '最高のショッピング体験を提供するために、プラットフォームの継続的な改善に取り組んでいます。' },
  { icon: '❤️', title: 'お客様第一', desc: 'お客様の満足を最優先に、24時間365日のサポート体制でお応えします。' },
  { icon: '🌍', title: 'サステナビリティ', desc: '環境に配慮し、エコフレンドリーなショッピングの推進に努めています。' },
  { icon: '👥', title: 'コミュニティ', desc: '満足度の高い、ロイヤルなお客様のコミュニティづくりを目指しています。' },
];

const stats = [
  { label: 'お客様の笑顔', value: '50,000+' },
  { label: '取扱商品数', value: '5,000+' },
  { label: 'サービス提供年数', value: '5年+' },
  { label: '1日あたりの取引件数', value: '1,000+' },
];

export default function AboutPage() {
  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh' }}>
      <TopBar />
      <Ticker />
      <Navbar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 12px' }}>
        {/* Hero header */}
        <div style={{
          background: 'linear-gradient(135deg, #ff0033 0%, #ff6b35 100%)',
          borderRadius: 4,
          padding: '32px 28px',
          marginBottom: 12,
          color: 'white',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 4 }}>
            <span style={{ opacity: 0.9 }}>モール</span>ショップ
          </div>
          <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: '0 0 4px' }}>
            便利で快適なショッピング体験を、すべての方に
          </p>
          <p style={{ fontSize: '0.72rem', opacity: 0.7, margin: 0 }}>
            OneStopMarket Inc.
          </p>
        </div>

        {/* Mission */}
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '24px 28px', marginBottom: 12 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#222', margin: '0 0 12px', paddingBottom: 8, borderBottom: '2px solid #ff0033' }}>
            私たちのミッション
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.8, margin: '0 0 8px' }}>
            モールショップは、ショッピングはシンプルで楽しく、誰もが利用しやすいものであるべきだと考えています。
            厳選された高品質な商品を手頃な価格で提供し、シームレスなオンラインショッピング体験をお届けすることが私たちの使命です。
          </p>
          <p style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.8, margin: 0 }}>
            商品の品質からカスタマーサポートまで、あらゆる面で卓越したサービスを提供することに全力を尽くしています。
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: 'white', padding: '20px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ff0033', margin: '0 0 2px' }}>{s.value}</p>
              <p style={{ fontSize: '0.72rem', color: '#888', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ padding: '14px 20px', borderBottom: '2px solid #ff0033' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#222', margin: 0 }}>私たちの価値観</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#f0f0f0' }}>
            {values.map((v) => (
              <div key={v.title} style={{ background: 'white', padding: '20px' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{v.icon}</div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#222', margin: '0 0 6px' }}>{v.title}</p>
                <p style={{ fontSize: '0.78rem', color: '#666', lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Company info */}
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ padding: '14px 20px', borderBottom: '2px solid #ff0033' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#222', margin: 0 }}>会社概要</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                { label: '会社名', value: '株式会社モールショップ（OneStopMarket Inc.）' },
                { label: '設立', value: '2021年4月' },
                { label: '代表者', value: '代表取締役 山田 太郎' },
                { label: '所在地', value: '〒100-0001 東京都千代田区千代田1-1-1 モールショップビル 5F' },
                { label: '事業内容', value: 'ECプラットフォームの企画・開発・運営' },
                { label: '資本金', value: '1億円' },
                { label: '従業員数', value: '120名（2026年1月現在）' },
              ].map((row, i, arr) => (
                <tr key={i} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <th style={{
                    padding: '12px 20px',
                    textAlign: 'left',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#333',
                    background: '#fafafa',
                    width: '25%',
                    borderRight: '2px solid #ff0033',
                  }}>
                    {row.label}
                  </th>
                  <td style={{ padding: '12px 20px', fontSize: '0.82rem', color: '#444' }}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contact */}
        <div style={{
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: 4,
          padding: '28px',
          textAlign: 'center',
          marginBottom: 12,
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#222', margin: '0 0 6px' }}>お問い合わせ</h2>
          <p style={{ fontSize: '0.78rem', color: '#888', margin: '0 0 16px' }}>
            ご質問やご相談がございましたら、お気軽にお問い合わせください。
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ background: '#f8f8f8', borderRadius: 4, padding: '12px 20px' }}>
              <p style={{ fontSize: '0.68rem', color: '#888', margin: '0 0 2px' }}>メール</p>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ff0033', margin: 0 }}>support@onestopmarket.com</p>
            </div>
            <div style={{ background: '#f8f8f8', borderRadius: 4, padding: '12px 20px' }}>
              <p style={{ fontSize: '0.68rem', color: '#888', margin: '0 0 2px' }}>電話</p>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ff0033', margin: 0 }}>+81-3-XXXX-XXXX</p>
            </div>
            <div style={{ background: '#f8f8f8', borderRadius: 4, padding: '12px 20px' }}>
              <p style={{ fontSize: '0.68rem', color: '#888', margin: '0 0 2px' }}>営業時間</p>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ff0033', margin: 0 }}>24時間対応</p>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
