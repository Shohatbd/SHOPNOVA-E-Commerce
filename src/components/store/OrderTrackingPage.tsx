import React, { useState, useEffect } from 'react';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Phone,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface OrderTrackingPageProps {
  initialTrackingQuery?: string;
  onNavigate: (page: string, param?: string) => void;
}

const ORDER_STEPS: { key: OrderStatus; label_en: string; label_bn: string; icon: any }[] = [
  { key: 'pending', label_en: 'Order Placed', label_bn: 'অর্ডার গ্রহণ', icon: Clock },
  { key: 'confirmed', label_en: 'Confirmed', label_bn: 'অর্ডার নিশ্চিত', icon: CheckCircle2 },
  { key: 'processing', label_en: 'Processing', label_bn: 'প্রসেসিং হচ্ছে', icon: Package },
  { key: 'packed', label_en: 'Packed', label_bn: 'প্যাকেজিং সম্পন্ন', icon: Package },
  { key: 'shipped', label_en: 'Shipped', label_bn: 'কুরিয়ারে হস্তান্তর', icon: Truck },
  { key: 'out_for_delivery', label_en: 'Out for Delivery', label_bn: 'ডেলিভারির জন্য বের হয়েছে', icon: Truck },
  { key: 'delivered', label_en: 'Delivered', label_bn: 'ডেলিভারি সম্পন্ন', icon: CheckCircle2 }
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialTrackingQuery,
  onNavigate
}) => {
  const { t, isBn } = useLanguage();
  const { formatPrice, settings } = useSettings();

  const [query, setQuery] = useState(initialTrackingQuery || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (searchTerm?: string) => {
    const q = searchTerm || query;
    if (!q.trim()) return;

    setIsSearching(true);
    setErrorMsg('');
    setOrder(null);

    try {
      const res = await api.trackOrder(q.trim());
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setErrorMsg(isBn ? 'এই নাম্বারে কোনো অর্ডার খুঁজে পাওয়া যায়নি।' : 'No order found matching this Order Number or Phone.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to track order.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialTrackingQuery) {
      handleSearch(initialTrackingQuery);
    }
  }, [initialTrackingQuery]);

  const getStepIndex = (status: OrderStatus) => {
    const index = ORDER_STEPS.findIndex((s) => s.key === status);
    return index > -1 ? index : 0;
  };

  const currentStepIndex = order ? getStepIndex(order.order_status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <Truck className="w-7 h-7 text-amber-500" />
          <span>{t('track_order')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          {isBn
            ? 'আপনার অর্ডার নম্বর (যেমন SN-2026-1001) বা ফোন নাম্বার দিয়ে অর্ডারের রিয়েল-টাইম অবস্থা জানুন।'
            : 'Enter your Order Number (e.g. SN-2026-1001) or phone number to track shipment progress in real time.'}
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm max-w-xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('tracking_input_placeholder')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors shadow-xs"
          >
            {isSearching ? t('loading') : t('search_tracking')}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="max-w-xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tracking Result Card */}
      {order && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-lg space-y-8 animate-in fade-in duration-200">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">{order.order_number}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900">
                  {order.order_status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Placed on: {order.created_at}
              </p>
            </div>

            {order.courier_name && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-right">
                <span className="text-slate-400 block text-[10px]">Courier Partner</span>
                <span className="font-bold text-slate-900 uppercase">{order.courier_name}</span>
                {order.tracking_id && (
                  <span className="text-amber-800 font-mono block text-[11px] font-bold">
                    ID: {order.tracking_id}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stepper Timeline */}
          <div>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-6">
              {isBn ? 'ডেলিভারি অগ্রগতি' : 'Delivery Progress'}
            </h2>

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const IconComponent = step.icon;

                return (
                  <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isPassed
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                          : 'bg-slate-100 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-amber-500/20 scale-110' : ''}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="md:text-center">
                      <p className={`text-xs font-bold ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                        {isBn ? step.label_bn : step.label_en}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] text-amber-800 font-semibold block">
                          Active Stage
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details & Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100 text-xs">
            <div className="space-y-1 bg-slate-50 p-4 rounded-2xl">
              <span className="font-bold text-slate-900 block mb-1">
                {isBn ? 'গ্রাহকের তথ্য ও ঠিকানা' : 'Customer & Shipping Address'}
              </span>
              <p className="text-slate-700 font-semibold">{order.customer_name}</p>
              <p className="text-slate-500">{order.customer_phone}</p>
              <p className="text-slate-600">{order.shipping_address}, {order.shipping_city}</p>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl">
              <span className="font-bold text-slate-900 block mb-1">
                {isBn ? 'পেমেন্ট ও ডেলিভারি স্ট্যাটাস' : 'Payment & Summary'}
              </span>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <span className="font-bold uppercase text-slate-900">{order.payment_method}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Status:</span>
                <span className={`font-bold uppercase ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-800'}`}>
                  {order.payment_status}
                </span>
              </div>
              <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-amber-800">{formatPrice(order.grand_total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
