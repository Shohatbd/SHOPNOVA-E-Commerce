import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  Package,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Truck,
  Plus,
  Tag,
  ExternalLink,
  RefreshCw,
  Eye,
  Mail
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { api } from '../../services/api.ts';
import { formatBilingualName } from '../../utils/formatters.ts';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { t, isBn } = useLanguage();
  const { formatPrice } = useSettings();

  const [metrics, setMetrics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [unreadInquiries, setUnreadInquiries] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [dashRes, ordersRes, contactRes] = await Promise.all([
        api.getAdminDashboard().catch((e) => {
          console.warn('Admin dashboard API fallback:', e);
          return api.getAnalyticsDashboard();
        }),
        api.getAdminOrders({ limit: 6 }).catch(() => ({ success: false, orders: [] })),
        api.getContactStats().catch(() => ({ success: false, stats: null }))
      ]);

      if (contactRes && contactRes.success && contactRes.stats) {
        setUnreadInquiries(contactRes.stats.unread || 0);
      }

      if (dashRes && dashRes.success) {
        setMetrics(dashRes.metrics || dashRes.stats || {});
        setTopProducts(dashRes.topProducts || []);
        setSalesTrend(dashRes.salesTrend || dashRes.revenueTrend || []);
      }

      if (ordersRes && ordersRes.success) {
        setRecentOrders(ordersRes.orders || []);
      } else if (dashRes && dashRes.recentOrders) {
        setRecentOrders(dashRes.recentOrders || []);
      }
    } catch (err: any) {
      console.error('Failed to load admin stats:', err);
      setErrorMsg(err.message || 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 text-xs font-semibold">
        <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>{isBn ? 'ড্যাশবোর্ড অ্যানালিটিক্স লোড হচ্ছে...' : 'Loading Enterprise Dashboard Analytics...'}</span>
      </div>
    );
  }

  const statCards = [
    {
      title: isBn ? 'মোট আয়' : 'Total Revenue',
      value: formatPrice(metrics?.total_revenue || metrics?.totalSales || 0),
      subtitle: isBn ? 'সর্বমোট নিশ্চিত বিক্রয়' : 'Lifetime confirmed sales',
      icon: DollarSign,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      title: isBn ? 'আজকের বিক্রয়' : "Today's Sales",
      value: formatPrice(metrics?.today_revenue || 0),
      subtitle: isBn ? `আজকে ${metrics?.today_orders || 0} টি অর্ডার হয়েছে` : `${metrics?.today_orders || 0} orders placed today`,
      icon: TrendingUp,
      color: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    {
      title: isBn ? 'মোট অর্ডার' : 'Total Orders',
      value: metrics?.total_orders || metrics?.totalOrders || 0,
      subtitle: isBn ? `${metrics?.pending_orders || metrics?.orderStatuses?.pending || 0} টি অর্ডার প্রক্রিয়াধীন` : `${metrics?.pending_orders || metrics?.orderStatuses?.pending || 0} pending processing`,
      icon: ShoppingBag,
      color: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    {
      title: isBn ? 'স্টক সতর্কতা' : 'Stock Alerts',
      value: `${metrics?.low_stock_count || metrics?.lowStockCount || 0} / ${metrics?.out_of_stock_count || metrics?.outOfStockCount || 0}`,
      subtitle: isBn ? 'কম স্টক / স্টক শেষ' : 'Low Stock / Out of Stock',
      icon: AlertTriangle,
      color: 'text-rose-700 bg-rose-50 border-rose-200'
    }
  ];

  const getOrderStatusText = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    if (isBn) {
      if (s === 'pending') return 'অপেক্ষমান';
      if (s === 'confirmed') return 'নিশ্চিত';
      if (s === 'processing') return 'প্রক্রিয়াধীন';
      if (s === 'shipped') return 'শিপড';
      if (s === 'delivered') return 'ডেলিভার্ড';
      if (s === 'cancelled') return 'বাতিল';
      if (s === 'returned') return 'ফেরত';
      return s;
    }
    return s.replace(/_/g, ' ');
  };

  return (
    <div id="admin-dashboard-view" className="space-y-4 font-sans text-[13px]">
      {/* Top Operations Header Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            {isBn ? 'স্টোর অপারেশনস ও মেট্রিক্স ড্যাশবোর্ড' : 'Store Operations & Metrics Hub'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBn
              ? 'বিক্রয় আয়, ইনভেন্টরি অবস্থা, কুরিয়ার প্রেরণ এবং সাম্প্রতিক অর্ডারের লাইভ ওভারভিউ।'
              : 'Real-time overview of sales revenue, inventory health, courier dispatches, and recent orders.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-quick-add-product"
            onClick={() => onNavigateTab('products')}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-md text-xs transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isBn ? 'প্রোডাক্ট যোগ করুন' : 'Add Product'}</span>
          </button>

          <button
            id="btn-quick-view-orders"
            onClick={() => onNavigateTab('orders')}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBn ? 'অর্ডারসমূহ দেখুন' : 'Manage Orders'}</span>
          </button>

          <button
            id="btn-quick-view-inquiries"
            onClick={() => onNavigateTab('inquiries')}
            className={`inline-flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer border ${
              unreadInquiries > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600 shadow-xs animate-pulse'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
          >
            <Mail className={`w-3.5 h-3.5 ${unreadInquiries > 0 ? 'text-slate-950' : 'text-slate-500'}`} />
            <span>{isBn ? 'কাস্টমার মেসেজ' : 'Messages'}</span>
            {unreadInquiries > 0 ? (
              <span className="bg-slate-950 text-amber-300 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {unreadInquiries}
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-500 text-[10px] font-medium px-1.5 py-0.2 rounded-full">
                0
              </span>
            )}
          </button>

          <button
            id="btn-refresh-dashboard"
            onClick={loadStats}
            title={isBn ? "ডাটা রিফ্রেশ করুন" : "Refresh Data"}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Unread Inquiries Alert Banner */}
      {unreadInquiries > 0 && (
        <div
          onClick={() => onNavigateTab('inquiries')}
          className="bg-amber-500/10 border border-amber-500/30 text-slate-900 p-3 rounded-lg flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-500/20 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {isBn
                  ? `📨 আপনার কাছে ${unreadInquiries}টি নতুন অপঠিত কাস্টমার মেসেজ রয়েছে!`
                  : `📨 You have ${unreadInquiries} new unread customer inquiries!`}
              </p>
              <p className="text-[11px] text-slate-600">
                {isBn
                  ? 'কাস্টমারদের সাপোর্ট অনুরোধের উত্তর দিতে ইনবক্সে যান।'
                  : 'Click here to open the Customer Inbox and reply.'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-700 hover:text-amber-800 underline shrink-0">
            {isBn ? 'ইনবক্স দেখুন →' : 'View Inbox →'}
          </span>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-md border ${card.color}`}>
                  <IconComp className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <p className="text-xl font-black text-slate-900 tracking-tight">{card.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend Bar Chart & Top Selling Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Cols: Sales Trend Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {isBn ? 'গত ৭ দিনের বিক্রয় আয় ও অর্ডারের গ্রাফ' : '7-Day Revenue & Volume Curve'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isBn ? 'দৈনিক বিক্রয় ও অর্ডারের পরিমাণ' : 'Daily sales volume across all channels'}
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ● {isBn ? 'লাইভ সিঙ্ক' : 'Live Sync'}
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 bg-slate-50 rounded-md border border-slate-100">
            {salesTrend.length === 0 ? (
              <div className="w-full text-center text-xs text-slate-400 py-8">
                {isBn ? 'কোনো বিক্রয় রেকর্ড নেই' : 'No sales trend data yet'}
              </div>
            ) : (
              salesTrend.map((day, i) => {
                const maxRev = Math.max(...salesTrend.map((d) => d.revenue || d.sales || 1), 5000);
                const val = day.revenue !== undefined ? day.revenue : day.sales || 0;
                const ordersCount = day.orders !== undefined ? day.orders : day.orders_count || 0;
                const heightPct = Math.min(100, Math.max(12, (val / maxRev) * 100));

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="w-full bg-slate-200/80 rounded-t h-28 flex items-end p-0.5 relative">
                      <div
                        className="w-full bg-amber-500 group-hover:bg-amber-600 rounded-xs transition-all"
                        style={{ height: `${heightPct}%` }}
                      />
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] text-white font-bold px-2 py-0.5 rounded shadow whitespace-nowrap pointer-events-none transition-opacity z-10">
                        {formatPrice(val)} ({ordersCount} {isBn ? 'অর্ডার' : 'orders'})
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold truncate">
                      {day.day || day.month || day.date?.split('-').slice(1).join('/')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 5 Cols: Top Selling Products Leaderboard */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {isBn ? 'সর্বোচ্চ বিক্রিত প্রোডাক্ট' : 'Top Selling Products'}
            </h3>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-[11px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              {isBn ? 'সব দেখুন' : 'View All'}
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {topProducts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                {isBn ? 'কোনো বিক্রয় তথ্য নেই' : 'No sales records yet'}
              </div>
            ) : (
              topProducts.slice(0, 4).map((p) => (
                <div key={p.id} className="py-2 flex items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.thumbnail}
                      alt={isBn ? (p.name_bn || p.name_en) : p.name_en}
                      className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0 bg-slate-50"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate leading-tight">
                        {isBn ? (p.name_bn || p.name_en) : p.name_en}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {p.units_sold || p.total_sold || 0} {isBn ? 'বিক্রিত' : 'sold'} • {isBn ? 'স্টক:' : 'Stock:'} {p.stock_quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0 font-mono text-[12px]">
                    {formatPrice(p.total_revenue || (p.units_sold || 0) * (p.sale_price || p.regular_price || 0))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {isBn ? 'সাম্প্রতিক কাস্টমার অর্ডার' : 'Recent Customer Orders'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isBn ? 'ওয়েব ও মোবাইল স্টোরফ্রন্টের সর্বশেষ অর্ডারসমূহ' : 'Latest orders received across web & mobile storefront'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
          >
            {isBn ? 'সকল অর্ডার দেখুন →' : 'Manage All Orders →'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-3">{isBn ? 'অর্ডার নম্বর' : 'Order No'}</th>
                <th className="py-2.5 px-3">{isBn ? 'কাস্টমার' : 'Customer'}</th>
                <th className="py-2.5 px-3">{isBn ? 'মোট মূল্য' : 'Amount'}</th>
                <th className="py-2.5 px-3">{isBn ? 'পেমেন্ট' : 'Payment'}</th>
                <th className="py-2.5 px-3">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="py-2.5 px-3 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    {isBn ? 'কোনো সাম্প্রতিক অর্ডার নেই।' : 'No recent orders.'}
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-900 font-mono text-[11px]">
                      {ord.order_number}
                    </td>
                    <td className="py-2 px-3 text-slate-700">
                      <div className="font-medium">{formatBilingualName(ord.customer_name, isBn)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ord.customer_phone}</div>
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900 font-mono">
                      {formatPrice(ord.grand_total)}
                    </td>
                    <td className="py-2 px-3">
                      <span className="uppercase text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {ord.payment_method === 'cod' ? (isBn ? 'ক্যাশ' : 'COD') : ord.payment_method}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                        {getOrderStatusText(ord.order_status)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => onNavigateTab('orders')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-[11px] font-semibold border border-slate-300 transition-colors cursor-pointer"
                      >
                        {isBn ? 'বিস্তারিত' : 'Manage'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

