'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import TopBar from '@/components/layout/TopBar';
import Ticker from '@/components/layout/Ticker';
import Navbar from '@/components/layout/Navbar';

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  discountPercent: number | null;
  imageUrl: string | null;
  stock: number;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

interface Order {
  id: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

type StatusFilter = 'all' | 'shipping' | 'delivered' | 'cancelled';
type PeriodFilter = 'all' | '3m' | '6m' | '1y' | '2025' | '2024';

const STATUS_MAP: Record<Order['status'], { label: string; icon: string; cls: string }> = {
  PENDING: { label: '発送準備中', icon: '📦', cls: 'bg-[#fff9e6] text-[#e65100] border-[#ffcc02]' },
  PAID: { label: '発送準備中', icon: '📦', cls: 'bg-[#fff9e6] text-[#e65100] border-[#ffcc02]' },
  SHIPPED: { label: '配送中', icon: '🚚', cls: 'bg-[#e3f2fd] text-[#1565c0] border-[#90caf9]' },
  DELIVERED: { label: '配達完了', icon: '✅', cls: 'bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]' },
  CANCELLED: { label: 'キャンセル済み', icon: '✕', cls: 'bg-[#fafafa] text-[#999] border-[#ddd]' },
};

const SIDEBAR_MENU = [
  { icon: '📋', label: '注文履歴', href: '/mypage/orders', active: true },
  { icon: '♡', label: 'お気に入り', href: '/favorites', badge: null as number | null, badgeGray: true },
  { icon: '🔔', label: '入荷通知', href: '#', badge: 2, badgeGray: false },
  { icon: '🎁', label: 'クーポン', href: '#', badge: 3, badgeGray: false },
  { icon: '🟡', label: 'ポイント', href: '#' },
  { icon: '👤', label: 'プロフィール', href: '/mypage/profile' },
  { icon: '🏠', label: '住所管理', href: '#' },
  { icon: '💳', label: 'お支払い方法', href: '#' },
];

const PERIOD_PILLS: { id: PeriodFilter; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: '3m', label: '3ヶ月以内' },
  { id: '6m', label: '6ヶ月以内' },
  { id: '1y', label: '1年以内' },
  { id: '2025', label: '2025年' },
  { id: '2024', label: '2024年' },
];

const PERIOD_RADIOS: { id: PeriodFilter; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: '3m', label: '過去3ヶ月' },
  { id: '6m', label: '過去6ヶ月' },
  { id: '2025', label: '2025年' },
  { id: '2024', label: '2024年' },
];

export default function OrdersPage() {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [modalOrder, setModalOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (_hasHydrated && !user) router.push('/login');
  }, [_hasHydrated, user, router]);

  useEffect(() => {
    if (!modalOrder) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalOrder(null); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [modalOrder]);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then((r) => r.data),
    enabled: !!user,
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => api.post('/cart/items', { productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showToast('カートに追加しました');
    },
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  if (!_hasHydrated || !user) return null;

  // Filter orders
  let filtered = [...orders];

  if (statusFilter === 'shipping') filtered = filtered.filter((o) => o.status === 'SHIPPED');
  else if (statusFilter === 'delivered') filtered = filtered.filter((o) => o.status === 'DELIVERED');
  else if (statusFilter === 'cancelled') filtered = filtered.filter((o) => o.status === 'CANCELLED');

  const now = new Date();
  if (periodFilter === '3m') filtered = filtered.filter((o) => new Date(o.createdAt) >= new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()));
  else if (periodFilter === '6m') filtered = filtered.filter((o) => new Date(o.createdAt) >= new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()));
  else if (periodFilter === '1y') filtered = filtered.filter((o) => new Date(o.createdAt) >= new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()));
  else if (periodFilter === '2025') filtered = filtered.filter((o) => new Date(o.createdAt).getFullYear() === 2025);
  else if (periodFilter === '2024') filtered = filtered.filter((o) => new Date(o.createdAt).getFullYear() === 2024);

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter((o) => o.id.toLowerCase().includes(q) || o.items.some((item) => item.product.name.toLowerCase().includes(q)));
  }

  const statCounts = {
    all: orders.length,
    shipping: orders.filter((o) => o.status === 'SHIPPED').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
    cancelled: orders.filter((o) => o.status === 'CANCELLED').length,
  };

  const PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginatedOrders = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleExpand = (orderId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId); else next.add(orderId);
      return next;
    });
  };

  const reorder = (order: Order) => {
    order.items.forEach((item) => {
      if (item.product.stock > 0) addToCartMutation.mutate(item.product.id);
    });
  };

  const openInvoice = (order: Order) => {
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;
    const itemsHtml = order.items.map((item) =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:0.85rem">${item.product.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:0.85rem;text-align:center">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:0.85rem;text-align:right">&yen;${item.price.toLocaleString()}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:0.85rem;text-align:right">&yen;${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
    ).join('');
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>領収書 #${order.id.slice(0, 10).toUpperCase()}</title>
      <style>body{font-family:-apple-system,sans-serif;margin:0;padding:40px;color:#222}
      @media print{.no-print{display:none}}</style></head><body>
      <div style="max-width:700px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
          <div><span style="font-size:1.4rem;font-weight:700"><span style="color:#ff0033">モール</span>ショップ</span>
            <p style="font-size:0.75rem;color:#888;margin:4px 0 0">株式会社モールショップ</p></div>
          <div style="text-align:right"><h1 style="font-size:1.6rem;font-weight:700;margin:0;color:#222">領 収 書</h1>
            <p style="font-size:0.78rem;color:#888;margin:4px 0 0">発行日: ${new Date().toLocaleDateString('ja-JP')}</p></div>
        </div>
        <div style="background:#f8f8f8;border:1px solid #e0e0e0;border-radius:4px;padding:16px 20px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <div><p style="font-size:0.72rem;color:#888;margin:0 0 2px">注文番号</p><p style="font-size:0.9rem;font-weight:700;margin:0">#${order.id.slice(0, 10).toUpperCase()}</p></div>
            <div><p style="font-size:0.72rem;color:#888;margin:0 0 2px">注文日時</p><p style="font-size:0.9rem;margin:0">${formatDateTime(order.createdAt)}</p></div>
            <div><p style="font-size:0.72rem;color:#888;margin:0 0 2px">お届け先</p><p style="font-size:0.9rem;margin:0">${order.shippingAddress || '—'}</p></div>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <thead><tr style="background:#fafafa;border-bottom:2px solid #ff0033">
            <th style="padding:8px 12px;text-align:left;font-size:0.78rem;color:#555">商品名</th>
            <th style="padding:8px 12px;text-align:center;font-size:0.78rem;color:#555">数量</th>
            <th style="padding:8px 12px;text-align:right;font-size:0.78rem;color:#555">単価</th>
            <th style="padding:8px 12px;text-align:right;font-size:0.78rem;color:#555">小計</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="display:flex;justify-content:flex-end">
          <div style="width:250px">
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.85rem"><span>商品合計</span><span>&yen;${order.total.toLocaleString()}</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.85rem"><span>送料</span><span style="color:#2e7d32">&yen;0（送料無料）</span></div>
            <hr style="border:none;border-top:2px solid #222;margin:8px 0">
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:1.1rem;font-weight:700"><span>合計（税込）</span><span>&yen;${order.total.toLocaleString()}</span></div>
          </div>
        </div>
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;font-size:0.72rem;color:#aaa;text-align:center">
          <p style="margin:0 0 4px">株式会社モールショップ｜〒100-0001 東京都千代田区千代田1-1-1 モールショップビル 5F</p>
          <p style="margin:0">TEL: +81-3-XXXX-XXXX｜Email: support@onestopmarket.com</p>
        </div>
        <div class="no-print" style="text-align:center;margin-top:24px">
          <button onclick="window.print()" style="background:#ff0033;color:white;border:none;padding:10px 32px;border-radius:4px;font-size:0.9rem;font-weight:700;cursor:pointer">印刷 / PDF保存</button>
        </div>
      </div></body></html>`);
    w.document.close();
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Loading
  if (isLoading) {
    return (
      <>
        <TopBar /><Ticker /><Navbar />
        <div style={{ background: '#f4f4f4' }}>
          <div className="max-w-[1200px] mx-auto px-3 py-3">
            <div className="bg-white border border-[#e0e0e0] rounded p-4 mb-3">
              <div className="h-5 bg-[#f0f0f0] rounded w-48 animate-pulse" />
            </div>
            <div className="grid grid-cols-4 gap-px bg-[#e0e0e0] rounded overflow-hidden mb-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white py-3 px-4 text-center">
                  <div className="h-6 bg-[#f0f0f0] rounded w-12 mx-auto mb-1 animate-pulse" />
                  <div className="h-3 bg-[#f0f0f0] rounded w-16 mx-auto animate-pulse" />
                </div>
              ))}
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#e0e0e0] rounded mb-2.5 p-4">
                <div className="h-4 bg-[#f0f0f0] rounded w-64 mb-3 animate-pulse" />
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-[#f0f0f0] rounded animate-pulse" />
                  <div className="flex-1">
                    <div className="h-3 bg-[#f0f0f0] rounded w-3/4 mb-2 animate-pulse" />
                    <div className="h-4 bg-[#f0f0f0] rounded w-24 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar /><Ticker /><Navbar />
      <div style={{ background: '#f4f4f4' }}>
        <div className="max-w-[1200px] mx-auto px-3 py-3">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[0.75rem] text-[#888] mb-2.5">
            <Link href="/" className="text-[#0075c2] hover:underline">トップ</Link>
            <span className="text-[#ccc]">›</span>
            <span>注文履歴</span>
          </nav>

          {/* Page header */}
          <div className="bg-white border border-[#e0e0e0] rounded py-3.5 px-4 mb-3 flex items-center justify-between flex-wrap gap-2.5">
            <div>
              <h1 className="text-[1.15rem] font-bold text-[#222] flex items-center gap-2">
                <span className="text-[1.1rem]">📋</span> 注文履歴
              </h1>
              <p className="text-[0.78rem] text-[#888] mt-0.5">ご注文の確認・配送状況の確認ができます</p>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <button
                onClick={() => showToast('領収書をダウンロードしました')}
                className="text-[0.78rem] py-1.5 px-3.5 rounded-[3px] cursor-pointer bg-white border border-[#ddd] text-[#555] hover:border-[#ff0033] hover:text-[#ff0033] transition-all"
              >
                📄 領収書ダウンロード
              </button>
              <Link
                href="/products"
                className="text-[0.78rem] py-1.5 px-3.5 rounded-[3px] bg-[#ff0033] border border-[#ff0033] text-white font-bold hover:bg-[#cc0029] transition-all inline-block"
              >
                🛍 お買い物を続ける
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-px bg-[#e0e0e0] border border-[#e0e0e0] rounded overflow-hidden mb-3">
            {([
              { key: 'all' as StatusFilter, num: statCounts.all, label: 'すべての注文', color: '#ff0033' },
              { key: 'shipping' as StatusFilter, num: statCounts.shipping, label: '配送中', color: '#1565c0' },
              { key: 'delivered' as StatusFilter, num: statCounts.delivered, label: '配達完了', color: '#2e7d32' },
              { key: 'cancelled' as StatusFilter, num: statCounts.cancelled, label: 'キャンセル・返品', color: '#999' },
            ]).map((stat) => (
              <div
                key={stat.key}
                onClick={() => { setStatusFilter(stat.key); setPage(1); }}
                className={`bg-white py-3 px-4 text-center cursor-pointer transition-colors hover:bg-[#fff5f5] ${
                  statusFilter === stat.key ? '!bg-[#fff0f0] border-b-2 border-b-[#ff0033]' : ''
                }`}
              >
                <p className="text-[1.3rem] font-bold leading-none" style={{ color: stat.color }}>{stat.num}</p>
                <p className={`text-[0.72rem] mt-0.5 ${statusFilter === stat.key ? 'text-[#ff0033] font-bold' : 'text-[#888]'}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="bg-white border border-[#e0e0e0] rounded py-2.5 px-3.5 mb-3 flex items-center gap-2.5 flex-wrap">
            <span className="text-[0.78rem] text-[#888] whitespace-nowrap">期間：</span>
            <div className="flex gap-1.5 flex-wrap flex-1">
              {PERIOD_PILLS.map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => { setPeriodFilter(pill.id); setPage(1); }}
                  className={`text-[0.75rem] py-1 px-3 rounded-[20px] border cursor-pointer transition-all whitespace-nowrap ${
                    periodFilter === pill.id
                      ? 'bg-[#ff0033] text-white border-[#ff0033] font-bold'
                      : 'bg-white text-[#555] border-[#ddd] hover:border-[#ff0033] hover:text-[#ff0033]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-[#e0e0e0] flex-shrink-0" />
            <div className="flex border border-[#ddd] rounded-[3px] overflow-hidden h-[30px]">
              <input
                type="text"
                placeholder="注文番号で検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none px-2.5 text-[0.78rem] w-[160px] outline-none"
              />
              <button className="bg-[#f8f8f8] border-none border-l border-l-[#ddd] px-2.5 cursor-pointer text-[#888] text-[0.82rem] hover:bg-[#ff0033] hover:text-white transition-colors">
                🔍
              </button>
            </div>
          </div>

          {/* Main 2-column layout */}
          <div className="grid grid-cols-[200px_1fr] gap-3 items-start">
            {/* ===== Sidebar ===== */}
            <div>
              {/* My account menu */}
              <div className="bg-white border border-[#e0e0e0] rounded mb-2.5 overflow-hidden">
                <div className="bg-[#f8f8f8] px-3 py-[9px] text-[0.82rem] font-bold text-[#333] border-b-2 border-b-[#ff0033]">
                  マイアカウント
                </div>
                <ul className="list-none m-0 p-0">
                  {SIDEBAR_MENU.map((item, i) => (
                    <li key={i}>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-[9px] text-[0.8rem] border-b border-[#f0f0f0] last:border-b-0 transition-colors gap-1.5 no-underline ${
                          item.active
                            ? 'bg-[#fff5f5] text-[#ff0033] font-bold'
                            : 'text-[#333] hover:bg-[#fff5f5] hover:text-[#ff0033]'
                        }`}
                      >
                        <span className="text-[0.95rem] flex-shrink-0">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {'badge' in item && item.badge !== undefined && item.badge !== null ? (
                          <span className={`text-[0.6rem] font-bold px-[5px] py-px rounded-[10px] text-white flex-shrink-0 ${
                            item.badgeGray ? 'bg-[#aaa]' : 'bg-[#ff0033]'
                          }`}>
                            {item.badge}
                          </span>
                        ) : (
                          <span className="text-[#ccc] text-[0.75rem]">›</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Period filter radio */}
              <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden">
                <div className="bg-[#f8f8f8] px-3 py-[9px] text-[0.82rem] font-bold text-[#333] border-b-2 border-b-[#ff0033]">
                  期間
                </div>
                <div className="p-2.5">
                  <div className="flex flex-col gap-1">
                    {PERIOD_RADIOS.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-1.5 text-[0.78rem] text-[#444] cursor-pointer py-0.5 hover:text-[#ff0033]"
                      >
                        <input
                          type="radio"
                          name="period"
                          checked={periodFilter === opt.id}
                          onChange={() => { setPeriodFilter(opt.id); setPage(1); }}
                          className="accent-[#ff0033]"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Main content ===== */}
            <div>
              {filtered.length === 0 ? (
                <div className="bg-white border border-[#e0e0e0] rounded py-16 text-center">
                  <p className="text-[3rem] mb-3">📦</p>
                  <p className="text-[1rem] font-bold text-[#555] mb-1.5">注文履歴がありません</p>
                  <p className="text-[0.82rem] text-[#888] mb-4">
                    {statusFilter !== 'all' ? '該当する注文が見つかりませんでした' : 'お買い物をすると注文履歴がここに表示されます'}
                  </p>
                  <Link
                    href="/products"
                    className="inline-block bg-[#ff0033] text-white px-6 py-2.5 rounded text-[0.85rem] font-bold hover:bg-[#cc0029] transition-colors no-underline"
                  >
                    商品を探す
                  </Link>
                </div>
              ) : (
                <>
                  {paginatedOrders.map((order) => {
                    const statusInfo = STATUS_MAP[order.status];
                    const isCancelled = order.status === 'CANCELLED';
                    const isShipping = order.status === 'SHIPPED';
                    const isDelivered = order.status === 'DELIVERED';
                    const isPreparing = order.status === 'PENDING' || order.status === 'PAID';
                    const visibleItems = order.items.slice(0, 2);
                    const hiddenItems = order.items.slice(2);
                    const isExpanded = expandedItems.has(order.id);
                    const points = Math.floor(order.total * 0.01);

                    return (
                      <div
                        key={order.id}
                        className="bg-white border border-[#e0e0e0] rounded mb-2.5 overflow-hidden transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                      >
                        {/* Card header */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#f0f0f0] bg-[#fafafa] flex-wrap gap-2">
                          <div className="flex items-center gap-3.5 flex-wrap">
                            <span className="text-[0.78rem] text-[#555]">
                              注文番号: <strong
                                className="text-[#0075c2] cursor-pointer hover:underline"
                                onClick={() => setModalOrder(order)}
                              >
                                #{order.id.slice(0, 10).toUpperCase()}
                              </strong>
                            </span>
                            <span className="text-[0.75rem] text-[#888]">{formatDate(order.createdAt)}</span>
                            <span className="text-[0.75rem] text-[#0075c2] cursor-pointer hover:underline">モールショップ</span>
                          </div>
                          <span className={`text-[0.68rem] font-bold py-0.5 px-2.5 rounded-[20px] whitespace-nowrap border ${statusInfo.cls}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </div>

                        {/* Card body */}
                        <div className="px-4 py-3">
                          <div className="flex flex-col gap-2.5">
                            {visibleItems.map((item) => (
                              <OrderItemRow key={item.id} item={item} dimmed={isCancelled} />
                            ))}
                            {hiddenItems.length > 0 && isExpanded &&
                              hiddenItems.map((item) => (
                                <OrderItemRow key={item.id} item={item} dimmed={isCancelled} />
                              ))
                            }
                          </div>
                          {hiddenItems.length > 0 && (
                            <div
                              className="text-[0.75rem] text-[#0075c2] cursor-pointer mt-2 flex items-center gap-1 w-fit hover:underline"
                              onClick={() => toggleExpand(order.id)}
                            >
                              {isExpanded ? '▲ 折りたたむ' : `▼ 他${hiddenItems.length}件を表示`}
                            </div>
                          )}
                        </div>

                        {/* Shipping progress bar */}
                        {isShipping && (
                          <div className="px-4 pt-2.5 border-t border-[#f5f5f5]">
                            <p className="text-[0.75rem] text-[#555] font-bold mb-2">配送状況</p>
                            <div className="flex items-center mb-1.5">
                              {[
                                { label: '注文確定', done: true, active: false },
                                { label: '発送済み', done: true, active: false },
                                { label: '配送中', done: false, active: true },
                                { label: '配達完了', done: false, active: false },
                              ].map((step, i, arr) => (
                                <div key={i} className="flex flex-col items-center gap-1 flex-1 relative">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[0.6rem] font-bold z-[1] ${
                                    step.done ? 'bg-[#2e7d32] border-[#2e7d32] text-white'
                                    : step.active ? 'bg-[#0075c2] border-[#0075c2] text-white'
                                    : 'bg-white border-[#ddd] text-[#ddd]'
                                  }`}>
                                    {step.done ? '✓' : step.active ? '→' : (i + 1)}
                                  </div>
                                  <span className={`text-[0.62rem] text-center ${
                                    step.done ? 'text-[#2e7d32]' : step.active ? 'text-[#0075c2] font-bold' : 'text-[#aaa]'
                                  }`}>
                                    {step.label}
                                  </span>
                                  {i < arr.length - 1 && (
                                    <div className={`absolute top-[9px] left-1/2 w-full h-0.5 z-0 ${step.done ? 'bg-[#2e7d32]' : 'bg-[#ddd]'}`} />
                                  )}
                                </div>
                              ))}
                            </div>
                            <p className="text-[0.72rem] text-[#0075c2] font-bold text-center mb-2">
                              お届け予定: {(() => {
                                const d = new Date(order.createdAt);
                                d.setDate(d.getDate() + 3);
                                return d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
                              })()}
                            </p>
                          </div>
                        )}

                        {/* Review prompt */}
                        {isDelivered && (
                          <div className="mx-4 bg-[#fffbf0] border border-[#f5e642] rounded-[3px] py-2 px-3 flex items-center justify-between gap-2.5">
                            <span className="text-[0.78rem] text-[#664d00]">⭐ この商品はいかがでしたか？レビューを書いてポイントをもらおう！</span>
                            <button
                              onClick={() => showToast('レビューページへ移動します')}
                              className="text-[0.72rem] py-1 px-3 bg-[#f5c842] border-none rounded-[3px] cursor-pointer font-bold text-[#333] whitespace-nowrap hover:bg-[#e6b800] transition-colors"
                            >
                              レビューを書く
                            </button>
                          </div>
                        )}

                        {/* Cancel note */}
                        {isCancelled && (
                          <div className="mx-4 bg-[#fafafa] border border-[#e0e0e0] rounded-[3px] py-2 px-3 text-[0.75rem] text-[#888] flex items-start gap-1.5">
                            <span className="flex-shrink-0 text-[0.9rem]">ℹ</span>
                            <span>この注文は{formatDate(order.updatedAt || order.createdAt)}にキャンセルされました。返金は2〜5営業日以内に処理されます。</span>
                          </div>
                        )}

                        {/* Card footer */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#f0f0f0] bg-[#fafafa] flex-wrap gap-2 mt-2">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[0.78rem] text-[#888]">合計</span>
                              <span className={`text-[1.1rem] font-bold ${isCancelled ? 'text-[#aaa]' : 'text-[#333]'}`}>
                                ¥{order.total.toLocaleString()}
                              </span>
                              <span className="text-[0.68rem] text-[#aaa]">（税込）</span>
                            </div>
                            {!isCancelled && (
                              <span className="text-[0.72rem] text-[#c63]">{points}ポイント獲得</span>
                            )}
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {isShipping && (
                              <>
                                <button onClick={() => showToast('配送状況を確認中です')} className="text-[0.75rem] py-1.5 px-3.5 rounded-[3px] cursor-pointer bg-white border border-[#ddd] text-[#555] hover:border-[#ff0033] hover:text-[#ff0033] transition-all">
                                  🚚 配送状況を確認
                                </button>
                                <button onClick={() => showToast('受け取りを確認しました')} className="text-[0.75rem] py-1.5 px-3.5 rounded-[3px] cursor-pointer bg-white border border-[#0075c2] text-[#0075c2] hover:bg-[#0075c2] hover:text-white transition-all">
                                  ✓ 受け取り確認
                                </button>
                              </>
                            )}
                            {isDelivered && (
                              <>
                                <button onClick={() => reorder(order)} className="text-[0.75rem] py-1.5 px-3.5 rounded-[3px] cursor-pointer bg-[#ff0033] border border-[#ff0033] text-white font-bold hover:bg-[#cc0029] transition-all">
                                  🛒 もう一度購入
                                </button>
                                <button onClick={() => showToast('返品・交換の申請を受け付けました')} className="text-[0.75rem] py-1.5 px-3.5 rounded-[3px] cursor-pointer bg-white border border-[#ddd] text-[#555] hover:border-[#ff0033] hover:text-[#ff0033] transition-all">
                                  ↩ 返品・交換
                                </button>
                              </>
                            )}
                            {isPreparing && (
                              <button onClick={() => showToast('注文キャンセルを受け付けました')} className="text-[0.75rem] py-1.5 px-3.5 rounded-[3px] cursor-pointer bg-white border border-[#ddd] text-[#e00] hover:bg-[#fff0f0] hover:border-[#ff0033] transition-all">
                                ✕ 注文をキャンセル
                              </button>
                            )}
                            {isCancelled && (
                              <button onClick={() => reorder(order)} className="text-[0.75rem] py-1.5 px-3.5 rounded-[3px] cursor-pointer bg-[#ff0033] border border-[#ff0033] text-white font-bold hover:bg-[#cc0029] transition-all">
                                🛒 もう一度購入
                              </button>
                            )}
                            <button onClick={() => setModalOrder(order)} className="text-[0.75rem] py-1.5 px-3.5 rounded-[3px] cursor-pointer bg-white border border-[#ddd] text-[#555] hover:border-[#ff0033] hover:text-[#ff0033] transition-all">
                              📄 注文詳細
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-1 mt-3.5">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`w-8 h-8 flex items-center justify-center border rounded-[3px] text-[0.82rem] transition-colors ${
                          page === 1 ? 'border-[#e0e0e0] text-[#ccc] cursor-not-allowed bg-[#f8f8f8]' : 'border-[#ddd] text-[#555] bg-white hover:border-[#ff0033] hover:text-[#ff0033] cursor-pointer'
                        }`}
                      >
                        ‹
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 flex items-center justify-center border rounded-[3px] text-[0.82rem] transition-colors cursor-pointer ${
                            page === p ? 'bg-[#ff0033] border-[#ff0033] text-white font-bold' : 'border-[#ddd] text-[#555] bg-white hover:border-[#ff0033] hover:text-[#ff0033]'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={`w-8 h-8 flex items-center justify-center border rounded-[3px] text-[0.82rem] transition-colors ${
                          page === totalPages ? 'border-[#e0e0e0] text-[#ccc] cursor-not-allowed bg-[#f8f8f8]' : 'border-[#ddd] text-[#555] bg-white hover:border-[#ff0033] hover:text-[#ff0033] cursor-pointer'
                        }`}
                      >
                        ›
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Order detail modal ===== */}
      {modalOrder && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-start justify-center p-5 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOrder(null); }}
        >
          <div className="bg-white rounded-[6px] w-full max-w-[600px] overflow-hidden my-auto">
            {/* Modal header */}
            <div className="px-[18px] py-3.5 border-b-2 border-b-[#ff0033] flex items-center justify-between bg-[#fafafa]">
              <h2 className="text-[0.95rem] font-bold text-[#222]">📋 注文詳細</h2>
              <button
                onClick={() => setModalOrder(null)}
                className="text-[1.2rem] text-[#aaa] cursor-pointer bg-transparent border-none leading-none hover:text-[#ff0033] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div className="p-[18px]">
              {/* Order info */}
              <div className="mb-4">
                <h3 className="text-[0.82rem] font-bold text-[#333] mb-2 pb-[5px] border-b border-[#f0f0f0]">注文情報</h3>
                {[
                  ['注文番号', `#${modalOrder.id.slice(0, 10).toUpperCase()}`],
                  ['注文日時', formatDateTime(modalOrder.createdAt)],
                  ['お届け先', modalOrder.shippingAddress || '—'],
                  ['支払い方法', 'クレジットカード'],
                  ['配送方法', '通常配送'],
                  ['ステータス', `${STATUS_MAP[modalOrder.status].icon} ${STATUS_MAP[modalOrder.status].label}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-[0.8rem] text-[#555] py-1">
                    <span>{label}</span>
                    <span className="font-medium text-[#333] text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Order items */}
              <div className="mb-4">
                <h3 className="text-[0.82rem] font-bold text-[#333] mb-2 pb-[5px] border-b border-[#f0f0f0]">注文商品</h3>
                {modalOrder.items.map((item, i) => (
                  <div key={item.id} className={`flex gap-2.5 py-2 ${i < modalOrder.items.length - 1 ? 'border-b border-[#f5f5f5]' : ''}`}>
                    <div
                      className="w-12 h-12 rounded-[3px] flex items-center justify-center text-[1.4rem] flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)' }}
                    >
                      {item.product.imageUrl ? (
                        <Image src={item.product.imageUrl} alt={item.product.name} width={48} height={48} className="rounded-[3px] object-cover" />
                      ) : '📦'}
                    </div>
                    <span className="text-[0.78rem] text-[#333] leading-[1.4] flex-1">{item.product.name} × {item.quantity}</span>
                    <span className="text-[0.82rem] font-bold text-[#333] min-w-[70px] text-right flex-shrink-0">
                      ¥{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Payment breakdown */}
              <div>
                <h3 className="text-[0.82rem] font-bold text-[#333] mb-2 pb-[5px] border-b border-[#f0f0f0]">お支払い内訳</h3>
                <div className="flex justify-between text-[0.8rem] text-[#555] py-1">
                  <span>商品合計</span>
                  <span className="font-medium text-[#333]">¥{modalOrder.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[0.8rem] text-[#555] py-1">
                  <span>送料</span>
                  <span className="font-medium text-[#2e7d32]">¥0（送料無料）</span>
                </div>
                <hr className="border-none border-t border-t-[#f0f0f0] my-2.5" />
                <div className="flex justify-between items-baseline py-1.5">
                  <span className="text-[0.88rem] font-bold text-[#222]">合計（税込）</span>
                  <span className="text-[1.3rem] font-bold text-[#333]">¥{modalOrder.total.toLocaleString()}</span>
                </div>
                <p className="text-[0.72rem] text-[#c63] text-right">{Math.floor(modalOrder.total * 0.01)}ポイント獲得</p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-[18px] py-3.5 border-t border-[#e0e0e0] flex gap-2 justify-end bg-[#fafafa]">
              <button
                onClick={() => openInvoice(modalOrder)}
                className="text-[0.75rem] py-1.5 px-3.5 rounded-[3px] cursor-pointer bg-white border border-[#ddd] text-[#555] hover:border-[#ff0033] hover:text-[#ff0033] transition-all"
              >
                📄 領収書
              </button>
              <button
                onClick={() => setModalOrder(null)}
                className="text-[0.75rem] py-1.5 px-3.5 rounded-[3px] cursor-pointer bg-white border border-[#ddd] text-[#555] hover:border-[#ff0033] hover:text-[#ff0033] transition-all"
              >
                閉じる
              </button>
              <button
                onClick={() => { reorder(modalOrder); setModalOrder(null); }}
                className="text-[0.75rem] py-1.5 px-3.5 rounded-[3px] cursor-pointer bg-[#ff0033] border-none text-white font-bold hover:bg-[#cc0029] transition-all"
              >
                🛒 再購入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#333] text-white text-[0.82rem] py-2.5 px-5 rounded whitespace-nowrap z-[999] transition-all duration-[250ms] pointer-events-none ${
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        {toast}
      </div>
    </>
  );
}

function OrderItemRow({ item, dimmed }: { item: OrderItem; dimmed?: boolean }) {
  return (
    <div className={`flex gap-3 items-start ${dimmed ? 'opacity-60' : ''}`}>
      <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
        <div
          className={`w-16 h-16 rounded-[3px] flex items-center justify-center text-[1.9rem] flex-shrink-0 cursor-pointer ${dimmed ? 'grayscale-[80%]' : ''}`}
          style={{ background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)' }}
        >
          {item.product.imageUrl ? (
            <Image src={item.product.imageUrl} alt={item.product.name} width={64} height={64} className="rounded-[3px] object-cover" />
          ) : '📦'}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-[0.65rem] text-[#888] mb-0.5">モールショップ</p>
        <Link href={`/products/${item.product.id}`}>
          <p className="text-[0.82rem] text-[#333] leading-[1.4] mb-1 hover:text-[#ff0033] cursor-pointer">{item.product.name}</p>
        </Link>
        <p className="text-[0.72rem] text-[#888]">数量: {item.quantity}</p>
      </div>
      <div className="text-right min-w-[110px] flex-shrink-0">
        <p className={`text-[0.95rem] font-bold ${dimmed ? 'text-[#aaa]' : 'text-[#333]'}`}>
          ¥{(item.price * item.quantity).toLocaleString()}
        </p>
        {!dimmed && (
          <p className="text-[0.65rem] text-[#c63] mt-0.5">{Math.floor(item.price * item.quantity * 0.01)}pt還元</p>
        )}
      </div>
    </div>
  );
}
