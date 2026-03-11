'use client';

const items = [
  { label: '新着', text: '新規会員登録で500ポイントプレゼント' },
  { label: '送料無料', text: '3,000円以上のご注文で全国配送無料' },
  { label: null, text: '夏のセール第2弾スタート！最大70%OFF' },
  { label: null, text: '本日限定！全品5%ポイント還元キャンペーン実施' },
];

export default function Ticker() {
  const content = items.map((item, i) => (
    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginRight: 48 }}>
      {item.label && (
        <span style={{
          background: '#ff0033',
          color: 'white',
          padding: '2px 8px',
          borderRadius: 2,
          fontSize: '0.68rem',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}>
          {item.label}
        </span>
      )}
      <span>{item.text}</span>
    </span>
  ));

  return (
    <div style={{
      background: '#fff0f0',
      borderBottom: '1px solid #fdd',
      height: 28,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div className="animate-ticker" style={{
        display: 'inline-flex',
        whiteSpace: 'nowrap',
        color: '#cc0000',
        fontSize: '0.75rem',
      }}>
        {content}
        {content}
      </div>
    </div>
  );
}
