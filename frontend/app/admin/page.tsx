'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user, isAdmin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || !isAdmin()) router.push('/');
  }, [user, isAdmin, router]);

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.get('/products').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/orders/all').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then((r) => r.data),
    enabled: !!user && isAdmin(),
  });

  const stats = [
    { label: 'カテゴリ数', value: categories?.meta?.total ?? 0, href: '/admin/categories', color: 'text-[#ff0033]' },
    { label: '商品数', value: products?.meta?.total ?? 0, href: '/admin/products', color: 'text-[#ff0033]' },
    { label: '注文数', value: orders?.length ?? 0, href: '/admin/orders', color: 'text-[#ff0033]' },
    { label: 'ユーザー数', value: users?.length ?? 0, href: '/admin/users', color: 'text-[#ff0033]' },
  ];

  const quickLinks = [
    { label: 'カテゴリ管理', desc: 'カテゴリの追加・編集・削除', href: '/admin/categories' },
    { label: '商品管理', desc: '商品の追加・編集・削除', href: '/admin/products' },
    { label: '注文管理', desc: '注文の確認・ステータス更新', href: '/admin/orders' },
    { label: 'ユーザー管理', desc: 'ユーザーの確認・権限管理', href: '/admin/users' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ダッシュボード</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-gradient-to-br from-[#ff0033]/5 to-white border border-[#ff0033]/10 rounded-xl p-5 hover:border-[#ff0033]/30 hover:shadow-md transition-all"
          >
            <p className="text-sm text-gray-600 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">クイックアクセス</h2>
      <div className="grid grid-cols-1 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-[#ff0033] hover:shadow-md transition-all group"
          >
            <div>
              <p className="font-semibold text-gray-700 group-hover:text-[#ff0033] transition-colors">{link.label}</p>
              <p className="text-sm text-gray-500 mt-0.5">{link.desc}</p>
            </div>
            <span className="text-gray-400 group-hover:text-[#ff0033] text-lg transition-colors">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
