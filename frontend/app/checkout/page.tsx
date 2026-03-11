'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import TopBar from '@/components/layout/TopBar';
import Ticker from '@/components/layout/Ticker';
import Navbar from '@/components/layout/Navbar';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    discountPrice: number | null;
    discountPercent: number | null;
    imageUrl: string | null;
  };
}

interface Cart {
  items: CartItem[];
  total: number;
}

const STEPS = ['カート', 'お届け先', 'お支払い', '確認', '完了'];

type PaymentMethod = 'card' | 'paypay' | 'cvs' | 'bank' | 'cod';
type DeliveryMethod = 'standard' | 'express' | 'cvs-pickup';

const effectivePrice = (p: { price: number; discountPrice: number | null }) =>
  p.discountPrice ?? p.price;

export default function CheckoutPage() {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();

  // Address fields
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastNameKana, setLastNameKana] = useState('');
  const [firstNameKana, setFirstNameKana] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [prefecture, setPrefecture] = useState('');
  const [city, setCity] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedAddr, setSelectedAddr] = useState<'home' | 'work' | 'new'>('home');

  // Delivery
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardMonth, setCardMonth] = useState('');
  const [cardYear, setCardYear] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [cvsStore, setCvsStore] = useState('');

  // Gift
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Confirm
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Sections collapse
  const [sectionsOpen, setSectionsOpen] = useState({ addr: true, delivery: true, payment: true, confirm: true });

  // Success modal
  const [showModal, setShowModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Submitting
  const [submitting, setSubmitting] = useState(false);

  const { data: cart } = useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data),
    enabled: !!user,
  });

  const { data: profile } = useQuery<{ name: string; address: string | null }>({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/me').then((r) => r.data),
    enabled: !!user,
  });

  useEffect(() => {
    if (profile?.address) setAddressLine(profile.address);
    if (profile?.name) {
      const parts = profile.name.split(' ');
      if (parts.length >= 2) {
        setLastName(parts[0]);
        setFirstName(parts[1]);
      } else {
        setLastName(profile.name);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (_hasHydrated && !user) router.push('/login');
  }, [_hasHydrated, user, router]);

  if (!_hasHydrated || !user) return null;

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + effectivePrice(item.product) * item.quantity, 0);
  const originalTotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = originalTotal - subtotal;
  const baseShipping = subtotal >= 3000 ? 0 : 550;
  const deliveryFee = deliveryMethod === 'express' ? 550 : deliveryMethod === 'cvs-pickup' ? 0 : baseShipping;
  const codFee = paymentMethod === 'cod' ? 330 : 0;
  const grandTotal = subtotal + deliveryFee + codFee;

  const toggleSection = (key: keyof typeof sectionsOpen) => {
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handlePlaceOrder = async () => {
    if (!agreedToTerms) {
      alert('利用規約に同意してください');
      return;
    }
    if (paymentMethod === 'card') {
      const digits = cardNumber.replace(/\s/g, '');
      if (digits.length < 13 || !cardName.trim()) {
        alert('カード情報を正しく入力してください');
        return;
      }
    }

    setSubmitting(true);
    try {
      const shippingAddress = `〒${postalCode} ${prefecture}${city}${addressLine}`;
      const { data } = await api.post('/orders/checkout', { shippingAddress });
      const num = `#MS-2026-${data.orderId.slice(0, 6).toUpperCase()}`;
      setOrderNumber(num);
      setShowModal(true);
    } catch {
      alert('注文に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  const deliveryDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 2 + i);
    return `${d.getMonth() + 1}/${d.getDate()}（${'日月火水木金土'[d.getDay()]}）`;
  });

  return (
    <>
      <TopBar />
      <Ticker />
      <Navbar />
      <div style={{ background: '#f4f4f4' }}>
        <div className="max-w-[1200px] mx-auto px-3 py-3">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[0.75rem] text-[#888] mb-2.5">
            <Link href="/" className="text-[#0075c2] hover:underline">トップ</Link>
            <span className="text-[#ccc]">›</span>
            <Link href="/cart" className="text-[#0075c2] hover:underline">カート</Link>
            <span className="text-[#ccc]">›</span>
            <span>ご注文手続き</span>
          </nav>

          {/* Step bar */}
          <div className="bg-white border border-[#e0e0e0] rounded py-3.5 px-5 mb-3.5 flex items-center justify-center">
            {STEPS.map((step, i) => (
              <span key={step} className="flex items-center">
                <span className={`flex items-center gap-1.5 text-[0.8rem] ${
                  i === 0 ? 'text-[#2e7d32]' :
                  i === 1 || i === 2 ? 'text-[#ff0033] font-bold' : 'text-[#aaa]'
                }`}>
                  <span
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[0.72rem] font-bold ${
                      i === 0
                        ? 'border-[#2e7d32] bg-[#2e7d32] text-white'
                        : i === 1 || i === 2
                        ? 'border-[#ff0033] text-[#ff0033] bg-white'
                        : 'border-[#ddd] text-[#aaa] bg-white'
                    }`}
                  >
                    {i === 0 ? '✓' : i + 1}
                  </span>
                  {step}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="w-[60px] h-px bg-[#ddd] mx-2 flex-shrink-0" />
                )}
              </span>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-[1fr_320px] gap-3.5 items-start">
            {/* Left column - Forms */}
            <div>
              {/* Card 1: お届け先 */}
              <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden mb-3">
                <div
                  className="flex items-center justify-between px-4 py-2.5 border-b-2 border-[#ff0033] cursor-pointer"
                  onClick={() => toggleSection('addr')}
                >
                  <h2 className="text-[0.95rem] font-bold text-[#222] flex items-center gap-2">
                    <span className="bg-[#ff0033] text-white text-[0.65rem] font-bold px-[7px] py-0.5 rounded-sm">1</span>
                    お届け先
                  </h2>
                  <span className="text-[0.75rem] text-[#0075c2] cursor-pointer hover:underline">
                    {sectionsOpen.addr ? '閉じる' : '編集'}
                  </span>
                </div>
                {sectionsOpen.addr && (
                  <div className="p-4">
                    {/* Saved address buttons */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {(['home', 'work', 'new'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedAddr(type)}
                          className={`text-[0.75rem] px-3 py-[5px] border rounded-sm transition-colors cursor-pointer ${
                            selectedAddr === type
                              ? 'border-[#ff0033] text-[#ff0033] bg-[#fff5f5] font-bold'
                              : 'border-[#ddd] text-[#444] bg-white hover:border-[#ff0033] hover:text-[#ff0033]'
                          }`}
                        >
                          {type === 'home' ? '🏠 自宅' : type === 'work' ? '🏢 会社' : '＋ 新しい住所'}
                        </button>
                      ))}
                    </div>

                    {/* Name fields */}
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[0.78rem] font-bold text-[#444]">
                          姓 <span className="text-[#ff0033] text-[0.68rem]">必須</span>
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="山田"
                          className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full outline-none focus:border-[#ff0033] focus:shadow-[0_0_0_2px_rgba(255,0,51,0.08)] transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[0.78rem] font-bold text-[#444]">
                          名 <span className="text-[#ff0033] text-[0.68rem]">必須</span>
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="太郎"
                          className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full outline-none focus:border-[#ff0033] focus:shadow-[0_0_0_2px_rgba(255,0,51,0.08)] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Kana fields */}
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[0.78rem] font-bold text-[#444]">姓（フリガナ）</label>
                        <input
                          type="text"
                          value={lastNameKana}
                          onChange={(e) => setLastNameKana(e.target.value)}
                          placeholder="ヤマダ"
                          className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full outline-none focus:border-[#ff0033] focus:shadow-[0_0_0_2px_rgba(255,0,51,0.08)] transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[0.78rem] font-bold text-[#444]">名（フリガナ）</label>
                        <input
                          type="text"
                          value={firstNameKana}
                          onChange={(e) => setFirstNameKana(e.target.value)}
                          placeholder="タロウ"
                          className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full outline-none focus:border-[#ff0033] focus:shadow-[0_0_0_2px_rgba(255,0,51,0.08)] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Postal code + Prefecture */}
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[0.78rem] font-bold text-[#444]">
                          郵便番号 <span className="text-[#ff0033] text-[0.68rem]">必須</span>
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9-]/g, ''))}
                          placeholder="123-4567"
                          maxLength={8}
                          className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full outline-none focus:border-[#ff0033] focus:shadow-[0_0_0_2px_rgba(255,0,51,0.08)] transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[0.78rem] font-bold text-[#444]">
                          都道府県 <span className="text-[#ff0033] text-[0.68rem]">必須</span>
                        </label>
                        <select
                          value={prefecture}
                          onChange={(e) => setPrefecture(e.target.value)}
                          className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full bg-white cursor-pointer focus:border-[#ff0033] outline-none transition-colors"
                        >
                          <option value="">選択してください</option>
                          {['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'].map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* City */}
                    <div className="flex flex-col gap-1 mb-3">
                      <label className="text-[0.78rem] font-bold text-[#444]">
                        市区町村 <span className="text-[#ff0033] text-[0.68rem]">必須</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="渋谷区"
                        className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full outline-none focus:border-[#ff0033] focus:shadow-[0_0_0_2px_rgba(255,0,51,0.08)] transition-colors"
                      />
                    </div>

                    {/* Address line */}
                    <div className="flex flex-col gap-1 mb-3">
                      <label className="text-[0.78rem] font-bold text-[#444]">
                        番地・建物名 <span className="text-[#ff0033] text-[0.68rem]">必須</span>
                      </label>
                      <input
                        type="text"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="神宮前1-2-3 モールビル101"
                        className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full outline-none focus:border-[#ff0033] focus:shadow-[0_0_0_2px_rgba(255,0,51,0.08)] transition-colors"
                      />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1 mb-3">
                      <label className="text-[0.78rem] font-bold text-[#444]">
                        電話番号 <span className="text-[#ff0033] text-[0.68rem]">必須</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="090-1234-5678"
                        className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full outline-none focus:border-[#ff0033] focus:shadow-[0_0_0_2px_rgba(255,0,51,0.08)] transition-colors"
                      />
                    </div>

                    {/* Gift */}
                    <div
                      className={`flex items-center gap-2.5 px-3 py-2.5 border rounded cursor-pointer transition-colors ${
                        isGift ? 'border-[#ff0033] bg-[#fff8f8]' : 'border-[#ddd] hover:border-[#ff0033] hover:bg-[#fff8f8]'
                      }`}
                      onClick={() => setIsGift(!isGift)}
                    >
                      <input type="checkbox" checked={isGift} onChange={() => setIsGift(!isGift)} className="accent-[#ff0033]" />
                      <span className="text-[0.82rem] text-[#333]">🎁 ギフト包装を希望する</span>
                      <span className="text-[0.75rem] text-[#888]">（＋¥330）</span>
                    </div>
                    {isGift && (
                      <div className="mt-2">
                        <textarea
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="ギフトメッセージ（任意）"
                          rows={2}
                          className="w-full border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.82rem] outline-none focus:border-[#ff0033] resize-none transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card 2: お届け日時 */}
              <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden mb-3">
                <div
                  className="flex items-center justify-between px-4 py-2.5 border-b-2 border-[#ff0033] cursor-pointer"
                  onClick={() => toggleSection('delivery')}
                >
                  <h2 className="text-[0.95rem] font-bold text-[#222] flex items-center gap-2">
                    <span className="bg-[#ff0033] text-white text-[0.65rem] font-bold px-[7px] py-0.5 rounded-sm">2</span>
                    お届け日時・配送方法
                  </h2>
                  <span className="text-[0.75rem] text-[#0075c2] cursor-pointer hover:underline">
                    {sectionsOpen.delivery ? '閉じる' : '編集'}
                  </span>
                </div>
                {sectionsOpen.delivery && (
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[0.78rem] font-bold text-[#444]">お届け希望日</label>
                        <select
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full bg-white cursor-pointer focus:border-[#ff0033] outline-none transition-colors"
                        >
                          <option value="">指定なし</option>
                          {deliveryDates.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[0.78rem] font-bold text-[#444]">お届け希望時間帯</label>
                        <select
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full bg-white cursor-pointer focus:border-[#ff0033] outline-none transition-colors"
                        >
                          <option value="">指定なし</option>
                          <option value="午前中">午前中（8:00〜12:00）</option>
                          <option value="14-16">14:00〜16:00</option>
                          <option value="16-18">16:00〜18:00</option>
                          <option value="18-20">18:00〜20:00</option>
                          <option value="19-21">19:00〜21:00</option>
                        </select>
                      </div>
                    </div>

                    {/* Delivery method radio */}
                    <p className="text-[0.78rem] font-bold text-[#444] mb-2">配送方法</p>
                    <div className="flex flex-col gap-2">
                      {([
                        { id: 'standard' as DeliveryMethod, icon: '🚚', label: '通常配送', badge: baseShipping === 0 ? '送料無料' : `送料 ¥${baseShipping.toLocaleString()}`, badgeClass: baseShipping === 0 ? 'bg-[#2e7d32]' : 'bg-[#888]', sub: '2〜4営業日でお届け', fee: baseShipping },
                        { id: 'express' as DeliveryMethod, icon: '⚡', label: '当日配送', badge: 'おすすめ', badgeClass: 'bg-[#ff8c00]', sub: '12時までのご注文で当日お届け', fee: 550 },
                        { id: 'cvs-pickup' as DeliveryMethod, icon: '📦', label: 'コンビニ受け取り', badge: '送料無料', badgeClass: 'bg-[#2e7d32]', sub: '最寄りのコンビニで受け取れます', fee: 0 },
                      ]).map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-start gap-2.5 px-3 py-2.5 border rounded cursor-pointer transition-colors ${
                            deliveryMethod === opt.id
                              ? 'border-[#ff0033] bg-[#fff0f0]'
                              : 'border-[#ddd] hover:border-[#ff0033] hover:bg-[#fff8f8]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="delivery"
                            checked={deliveryMethod === opt.id}
                            onChange={() => setDeliveryMethod(opt.id)}
                            className="accent-[#ff0033] mt-0.5 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-[0.85rem] font-bold text-[#222] flex items-center gap-2 flex-wrap">
                              {opt.icon} {opt.label}
                              <span className={`${opt.badgeClass} text-white text-[0.6rem] font-bold px-1.5 py-px rounded-sm`}>
                                {opt.badge}
                              </span>
                              {opt.fee > 0 && (
                                <span className="text-[#e00] text-[0.75rem]">＋¥{opt.fee.toLocaleString()}</span>
                              )}
                            </div>
                            <p className="text-[0.75rem] text-[#666] mt-0.5 leading-[1.5]">{opt.sub}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: お支払い方法 */}
              <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden mb-3">
                <div
                  className="flex items-center justify-between px-4 py-2.5 border-b-2 border-[#ff0033] cursor-pointer"
                  onClick={() => toggleSection('payment')}
                >
                  <h2 className="text-[0.95rem] font-bold text-[#222] flex items-center gap-2">
                    <span className="bg-[#ff0033] text-white text-[0.65rem] font-bold px-[7px] py-0.5 rounded-sm">3</span>
                    お支払い方法
                  </h2>
                  <span className="text-[0.75rem] text-[#0075c2] cursor-pointer hover:underline">
                    {sectionsOpen.payment ? '閉じる' : '編集'}
                  </span>
                </div>
                {sectionsOpen.payment && (
                  <div className="p-4">
                    <div className="flex flex-col gap-2">
                      {([
                        { id: 'card' as PaymentMethod, icon: '💳', label: 'クレジット・デビットカード', badge: 'おすすめ', badgeClass: 'bg-[#ff8c00]', sub: null },
                        { id: 'paypay' as PaymentMethod, icon: '📱', label: 'PayPay', badge: null, badgeClass: '', sub: 'PayPayアプリで決済' },
                        { id: 'cvs' as PaymentMethod, icon: '🏪', label: 'コンビニ払い', badge: null, badgeClass: '', sub: '各種コンビニでお支払い' },
                        { id: 'bank' as PaymentMethod, icon: '🏦', label: '銀行振込', badge: null, badgeClass: '', sub: '振込手数料はお客様負担' },
                        { id: 'cod' as PaymentMethod, icon: '💰', label: '代金引換', badge: null, badgeClass: '', sub: '手数料 ＋¥330' },
                      ]).map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-start gap-2.5 px-3 py-2.5 border rounded cursor-pointer transition-colors ${
                            paymentMethod === opt.id
                              ? 'border-[#ff0033] bg-[#fff0f0]'
                              : 'border-[#ddd] hover:border-[#ff0033] hover:bg-[#fff8f8]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === opt.id}
                            onChange={() => setPaymentMethod(opt.id)}
                            className="accent-[#ff0033] mt-0.5 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-[0.85rem] font-bold text-[#222] flex items-center gap-2 flex-wrap">
                              {opt.icon} {opt.label}
                              {opt.badge && (
                                <span className={`${opt.badgeClass} text-white text-[0.6rem] font-bold px-1.5 py-px rounded-sm`}>
                                  {opt.badge}
                                </span>
                              )}
                            </div>
                            {opt.sub && <p className="text-[0.75rem] text-[#666] mt-0.5">{opt.sub}</p>}
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Credit card fields */}
                    {paymentMethod === 'card' && (
                      <div className="bg-[#f8f8f8] border border-[#e0e0e0] rounded mt-2.5 p-3.5">
                        {/* Card logos */}
                        <div className="flex gap-1.5 mb-3">
                          {['VISA', 'MC', 'JCB', 'AMEX'].map((logo) => (
                            <span key={logo} className="bg-white border border-[#ddd] rounded-sm px-2 py-0.5 text-[0.68rem] text-[#555]">
                              {logo}
                            </span>
                          ))}
                        </div>

                        {/* Card number */}
                        <div className="flex flex-col gap-1 mb-3">
                          <label className="text-[0.78rem] font-bold text-[#444]">
                            カード番号 <span className="text-[#ff0033] text-[0.68rem]">必須</span>
                          </label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full outline-none focus:border-[#ff0033] focus:shadow-[0_0_0_2px_rgba(255,0,51,0.08)] transition-colors"
                          />
                        </div>

                        {/* Card name */}
                        <div className="flex flex-col gap-1 mb-3">
                          <label className="text-[0.78rem] font-bold text-[#444]">
                            カード名義人 <span className="text-[#ff0033] text-[0.68rem]">必須</span>
                          </label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            placeholder="TARO YAMADA"
                            style={{ textTransform: 'uppercase' }}
                            className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full outline-none focus:border-[#ff0033] focus:shadow-[0_0_0_2px_rgba(255,0,51,0.08)] transition-colors"
                          />
                        </div>

                        {/* Expiry + CVV */}
                        <div className="grid grid-cols-3 gap-2.5 mb-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[0.78rem] font-bold text-[#444]">有効期限（月）</label>
                            <select
                              value={cardMonth}
                              onChange={(e) => setCardMonth(e.target.value)}
                              className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full bg-white cursor-pointer focus:border-[#ff0033] outline-none transition-colors"
                            >
                              <option value="">月</option>
                              {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                  {String(i + 1).padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[0.78rem] font-bold text-[#444]">有効期限（年）</label>
                            <select
                              value={cardYear}
                              onChange={(e) => setCardYear(e.target.value)}
                              className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full bg-white cursor-pointer focus:border-[#ff0033] outline-none transition-colors"
                            >
                              <option value="">年</option>
                              {Array.from({ length: 10 }, (_, i) => (
                                <option key={i} value={String(2026 + i)}>{2026 + i}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[0.78rem] font-bold text-[#444]">セキュリティコード</label>
                            <input
                              type="text"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              placeholder="123"
                              maxLength={4}
                              style={{ letterSpacing: '3px' }}
                              className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full outline-none focus:border-[#ff0033] focus:shadow-[0_0_0_2px_rgba(255,0,51,0.08)] transition-colors"
                            />
                          </div>
                        </div>

                        {/* Save card */}
                        <label className="flex items-center gap-2 text-[0.78rem] text-[#444] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveCard}
                            onChange={() => setSaveCard(!saveCard)}
                            className="accent-[#ff0033]"
                          />
                          次回のお買い物のためにカード情報を保存する
                        </label>
                      </div>
                    )}

                    {/* CVS store select */}
                    {paymentMethod === 'cvs' && (
                      <div className="mt-2.5">
                        <label className="text-[0.78rem] font-bold text-[#444] mb-1 block">コンビニ選択</label>
                        <select
                          value={cvsStore}
                          onChange={(e) => setCvsStore(e.target.value)}
                          className="border border-[#ddd] rounded-sm px-2.5 py-2 text-[0.85rem] w-full bg-white cursor-pointer focus:border-[#ff0033] outline-none transition-colors"
                        >
                          <option value="">選択してください</option>
                          <option value="seven">セブン-イレブン</option>
                          <option value="lawson">ローソン</option>
                          <option value="familymart">ファミリーマート</option>
                          <option value="ministop">ミニストップ</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card 4: 注文確認 */}
              <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden mb-3">
                <div
                  className="flex items-center justify-between px-4 py-2.5 border-b-2 border-[#ff0033] cursor-pointer"
                  onClick={() => toggleSection('confirm')}
                >
                  <h2 className="text-[0.95rem] font-bold text-[#222] flex items-center gap-2">
                    <span className="bg-[#ff0033] text-white text-[0.65rem] font-bold px-[7px] py-0.5 rounded-sm">4</span>
                    注文内容確認
                  </h2>
                </div>
                {sectionsOpen.confirm && (
                  <div className="p-4">
                    {/* Address display */}
                    <div className="bg-[#f8f8f8] border border-[#e0e0e0] rounded px-3.5 py-3 text-[0.82rem] text-[#444] leading-[1.8] mb-3.5">
                      <p className="font-bold text-[#222] text-[0.88rem]">{lastName} {firstName}</p>
                      <p>〒{postalCode}</p>
                      <p>{prefecture}{city}{addressLine}</p>
                      <p>TEL: {phone}</p>
                    </div>

                    {/* Order info rows */}
                    <div className="flex justify-between text-[0.82rem] text-[#555] leading-[2]">
                      <span>お支払い方法</span>
                      <span className="font-bold text-[#333]">
                        {paymentMethod === 'card' ? 'クレジットカード' :
                         paymentMethod === 'paypay' ? 'PayPay' :
                         paymentMethod === 'cvs' ? 'コンビニ払い' :
                         paymentMethod === 'bank' ? '銀行振込' : '代金引換'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[0.82rem] text-[#555] leading-[2]">
                      <span>配送方法</span>
                      <span className="font-bold text-[#333]">
                        {deliveryMethod === 'standard' ? '通常配送' :
                         deliveryMethod === 'express' ? '当日配送' : 'コンビニ受け取り'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[0.82rem] text-[#555] leading-[2]">
                      <span>お届け希望日</span>
                      <span className="font-bold text-[#333]">{deliveryDate || '指定なし'}</span>
                    </div>

                    <hr className="border-none border-t border-[#f0f0f0] my-3.5" />

                    {/* Terms agreement */}
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={() => setAgreedToTerms(!agreedToTerms)}
                        className="accent-[#ff0033] mt-0.5"
                      />
                      <span className="text-[0.78rem] text-[#444] leading-[1.6]">
                        <span className="text-[#ff0033]">必須</span>{' '}
                        <span className="text-[#0075c2] cursor-pointer hover:underline">利用規約</span>、
                        <span className="text-[#0075c2] cursor-pointer hover:underline">プライバシーポリシー</span>
                        に同意して注文を確定します。
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Order summary */}
            <div className="sticky top-[80px]">
              <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden">
                <div className="px-4 py-2.5 border-b-2 border-[#ff0033] text-[0.95rem] font-bold text-[#222]">
                  注文内容
                </div>

                {/* Order items */}
                <div className="max-h-[280px] overflow-y-auto">
                  {items.map((item) => {
                    const price = effectivePrice(item.product);
                    return (
                      <div key={item.id} className="flex gap-2.5 px-3.5 py-2.5 border-b border-[#f0f0f0] last:border-b-0">
                        <div className="w-[50px] h-[50px] rounded-sm bg-[#f0f0f0] flex-shrink-0 relative overflow-hidden">
                          {item.product.imageUrl ? (
                            <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-[1.4rem]">📦</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.75rem] text-[#333] leading-[1.4] line-clamp-2">{item.product.name}</p>
                          <p className="text-[0.68rem] text-[#888] mt-0.5">数量: {item.quantity}</p>
                        </div>
                        <span className="text-[0.88rem] font-bold text-[#e00] min-w-[60px] text-right flex-shrink-0">
                          ¥{(price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Summary body */}
                <div className="px-4 py-3">
                  <div className="flex justify-between text-[0.82rem] mb-[9px] text-[#555]">
                    <span>商品合計（{items.length}点）</span>
                    <span className="font-medium text-[#333]">¥{originalTotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[0.82rem] mb-[9px] text-[#555]">
                      <span>割引額</span>
                      <span className="font-medium text-[#e00]">-¥{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[0.82rem] mb-[9px] text-[#555]">
                    <span>送料</span>
                    <span className={`font-medium ${deliveryFee === 0 ? 'text-[#2e7d32]' : 'text-[#333]'}`}>
                      {deliveryFee === 0 ? '無料' : `¥${deliveryFee.toLocaleString()}`}
                    </span>
                  </div>
                  {codFee > 0 && (
                    <div className="flex justify-between text-[0.82rem] mb-[9px] text-[#555]">
                      <span>代引き手数料</span>
                      <span className="font-medium text-[#333]">¥{codFee.toLocaleString()}</span>
                    </div>
                  )}

                  <hr className="border-none border-t border-[#f0f0f0] my-2.5" />

                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[0.88rem] font-bold text-[#222]">お支払い合計</span>
                    <span className="text-[1.6rem] font-bold text-[#e00]">¥{grandTotal.toLocaleString()}</span>
                  </div>
                  <p className="text-[0.7rem] text-[#888] text-right mb-3">（税込）</p>

                  {/* Place order button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className="block w-full bg-[#ff0033] hover:bg-[#cc0029] text-white py-3.5 rounded font-bold text-[1rem] mb-2 cursor-pointer border-none transition-colors disabled:opacity-50"
                  >
                    {submitting ? '処理中...' : '注文を確定する'}
                  </button>
                  <Link
                    href="/cart"
                    className="block w-full text-center bg-white text-[#555] border border-[#ddd] py-[9px] rounded text-[0.82rem] hover:border-[#ff0033] hover:text-[#ff0033] transition-colors mb-3"
                  >
                    カートに戻る
                  </Link>

                  {/* Security badges */}
                  <div className="flex flex-col gap-1 text-[0.68rem] text-[#888]">
                    <span>🔒 SSL暗号化による安全な決済</span>
                    <span>🔒 正規販売店・品質保証</span>
                    <span>🔒 30日間返品・交換保証</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center">
          <div className="bg-white rounded-lg px-8 py-9 max-w-[460px] w-[90%] text-center">
            <p className="text-[4rem] mb-3.5">🎉</p>
            <h2 className="text-[1.3rem] font-bold text-[#222] mb-2">ご注文が完了しました！</h2>
            <p className="text-[0.85rem] text-[#666] leading-[1.7] mb-5">
              確認メールをお送りしました。<br />
              ご注文の詳細は注文履歴からご確認いただけます。
            </p>
            <div className="bg-[#f8f8f8] border border-[#e0e0e0] rounded px-4 py-2.5 text-[0.82rem] text-[#444] mb-5">
              注文番号: <strong className="text-[#ff0033] text-[1rem]">{orderNumber}</strong>
            </div>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => router.push('/')}
                className="bg-[#ff0033] hover:bg-[#cc0029] text-white px-7 py-[11px] rounded font-bold text-[0.9rem] cursor-pointer border-none transition-colors"
              >
                トップページへ
              </button>
              <button
                onClick={() => router.push('/mypage/orders')}
                className="bg-white text-[#555] border border-[#ddd] px-5 py-[9px] rounded text-[0.85rem] cursor-pointer hover:border-[#ff0033] hover:text-[#ff0033] transition-colors"
              >
                注文履歴を見る
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
