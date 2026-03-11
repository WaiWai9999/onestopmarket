import TopBar from '@/components/layout/TopBar';
import Ticker from '@/components/layout/Ticker';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const rows = [
  { label: '事業者名', value: '株式会社モールショップ' },
  { label: '代表者', value: '代表取締役 山田 太郎' },
  { label: '所在地', value: '〒100-0001 東京都千代田区千代田1-1-1 モールショップビル 5F' },
  { label: '電話番号', value: '+81-3-XXXX-XXXX（平日 10:00〜18:00）' },
  { label: 'メールアドレス', value: 'support@onestopmarket.com' },
  { label: 'URL', value: 'https://www.mallshop.jp' },
  { label: '販売価格', value: '各商品ページに表示される価格（税込）' },
  { label: '商品代金以外の必要料金', value: '送料（3,000円以上で無料、3,000円未満の場合は全国一律500円）、代金引換手数料（330円）' },
  { label: 'お支払い方法', value: 'クレジットカード決済（Visa、Mastercard、Amex）※Stripe経由' },
  { label: 'お支払い時期', value: 'クレジットカード決済：ご注文確定時' },
  { label: '商品の引き渡し時期', value: 'ご注文確定後、通常2〜5営業日以内に発送いたします。配送先・在庫状況により前後する場合があります。' },
  { label: '返品・交換について', value: '商品到着後14日以内、未使用・未開封に限り返品を受け付けます。不良品・誤配送の場合は当社負担で交換・返金いたします。お客様都合の返品は送料お客様負担となります。' },
  { label: '返品の送料', value: '不良品・誤配送の場合は当社負担、お客様都合の場合はお客様負担' },
  { label: '動作環境', value: 'Chrome、Safari、Firefox、Edge の最新バージョン推奨' },
  { label: '特別な販売条件', value: 'クーポンやセールの適用条件は各クーポン・キャンペーンページに記載のとおりとします。' },
];

export default function LegalPage() {
  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh' }}>
      <TopBar />
      <Ticker />
      <Navbar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 12px' }}>
        {/* Header */}
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, padding: '24px 28px', marginBottom: 12 }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#222', margin: '0 0 6px' }}>特定商取引法に基づく表記</h1>
          <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>
            特定商取引に関する法律第11条に基づく表示
          </p>
        </div>

        {/* Table */}
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <th style={{
                    padding: '14px 20px',
                    textAlign: 'left',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#333',
                    background: '#fafafa',
                    width: '25%',
                    verticalAlign: 'top',
                    borderRight: '2px solid #ff0033',
                  }}>
                    {row.label}
                  </th>
                  <td style={{
                    padding: '14px 20px',
                    fontSize: '0.82rem',
                    color: '#444',
                    lineHeight: 1.7,
                  }}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
      <Footer />
    </div>
  );
}
