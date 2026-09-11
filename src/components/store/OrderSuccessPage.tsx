import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Printer,
  Truck,
  ArrowRight,
  Package,
  ShoppingBag,
  Clock,
  Phone
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { tracker } from '../../utils/analytics.ts';
import { InvoiceModal } from '../common/InvoiceModal.tsx';

interface OrderSuccessPageProps {
  orderNumberOrId: string;
  onNavigate: (page: string, param?: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  orderNumberOrId,
  onNavigate
}) => {
  const { t, isBn } = useLanguage();
  const { formatPrice, settings } = useSettings();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await api.getOrderDetails(orderNumberOrId);
        if (res.success && res.order) {
          setOrder(res.order);
          tracker.trackPurchase(res.order, res.order.items, settings);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [orderNumberOrId]);

  const handlePrint = () => {
    setIsInvoiceOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('order_success_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {t('order_success_msg')}
          </p>
        </div>

        {order ? (
          <>
            {/* Key Order Info Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">{t('order_number')}</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{order.order_number}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">{t('order_date')}</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{order.created_at?.split(' ')[0]}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">{t('grand_total')}</span>
                <span className="font-black text-amber-800 mt-0.5 block">{formatPrice(order.grand_total)}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">{t('payment_method')}</span>
                <span className="font-bold text-slate-900 uppercase mt-0.5 block">{order.payment_method}</span>
              </div>
            </div>

            {/* Delivery Address & Items */}
            <div className="space-y-4">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Delivery Details & Ordered Items
              </h2>

              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-700">
                <p className="font-bold text-slate-900">{order.customer_name} ({order.customer_phone})</p>
                <p>{order.shipping_address}, {order.shipping_city}</p>
                {order.notes && <p className="text-slate-500 italic">Note: {order.notes}</p>}
              </div>

              {/* Items Table */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {order.items?.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.thumbnail}
                        alt={isBn && item.product_name_bn ? item.product_name_bn : item.product_name_en}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 font-siliguri">
                          {isBn && item.product_name_bn ? item.product_name_bn : item.product_name_en}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap text-slate-500 mt-0.5">
                          <span>Qty: {item.quantity}</span>
                          {item.size && <span>• Size: <strong className="text-slate-700">{item.size}</strong></span>}
                          {item.color && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/80 px-1.5 py-0.5 rounded font-medium text-[10px]">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="font-black text-slate-900">
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Track, Print Invoice, Shop More */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => onNavigate('track', order.order_number)}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Truck className="w-4 h-4" />
                <span>{t('track_your_order')}</span>
              </button>

              <button
                onClick={handlePrint}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>{t('download_invoice')}</span>
              </button>

              <button
                onClick={() => onNavigate('shop')}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('continue_shopping')}</span>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <button
              onClick={() => onNavigate('shop')}
              className="bg-amber-500 text-slate-950 font-bold px-6 py-2 rounded-xl text-xs"
            >
              {t('continue_shopping')}
            </button>
          </div>
        )}
      </div>

      {order && (
        <InvoiceModal
          order={order}
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}
    </div>
  );
};

