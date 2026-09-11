import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { tracker } from '../../utils/analytics.ts';

interface CartDrawerProps {
  onNavigate: (page: string, param?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    shippingCost,
    grandTotal,
    appliedCoupon,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    freeShippingProgress,
    amountNeededForFreeShipping
  } = useCart();

  const { t, isBn } = useLanguage();
  const { formatPrice } = useSettings();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  React.useEffect(() => {
    if (isCartOpen && items.length > 0) {
      tracker.trackViewCart(items, subtotal);
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) return;

    setIsApplying(true);
    const res = await applyCoupon(couponInput.trim());
    setIsApplying(false);

    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <h2 className="font-black text-slate-900 text-base">
              {t('shopping_cart')} ({itemCount})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="bg-amber-50/60 p-3.5 border-b border-amber-100/80">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1.5">
            <Truck className="w-4 h-4 text-amber-600 shrink-0" />
            {amountNeededForFreeShipping === 0 ? (
              <span className="text-emerald-700">
                {isBn
                  ? '🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি পেয়েছেন!'
                  : '🎉 Congratulations! You unlocked FREE Delivery!'}
              </span>
            ) : (
              <span>
                {isBn
                  ? `ফ্রি ডেলিভারি পেতে আরও ${formatPrice(amountNeededForFreeShipping)} এর পণ্য যোগ করুন!`
                  : `Add ${formatPrice(amountNeededForFreeShipping)} more to get FREE Delivery!`}
              </span>
            )}
          </div>
          <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">{t('cart_empty')}</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {t('cart_empty_sub')}
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigate('shop');
                }}
                className="bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-xs"
              >
                {t('continue_shopping')}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.product_id}_${item.variant_id || 'base'}`} className="py-3.5 flex gap-3">
                <img
                  src={item.product.thumbnail}
                  alt={item.product.name_en}
                  className="w-16 h-16 object-cover rounded-xl border border-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate font-siliguri">
                        {isBn && item.product.name_bn ? item.product.name_bn : item.product.name_en}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product_id, item.variant_id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.variant && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.variant.size ? `Size: ${item.variant.size}` : ''}{' '}
                        {item.variant.color ? `(${item.variant.color})` : ''}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.variant_id)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-l-lg"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.variant_id)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-r-lg"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-black text-slate-900">
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with totals & checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 space-y-4">
            {/* Coupon Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Coupon: {appliedCoupon.code} (-{formatPrice(discountAmount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-rose-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder={t('coupon_code')}
                      className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs uppercase font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition-colors"
                  >
                    {isApplying ? '...' : t('apply_coupon')}
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-600 mt-1 font-medium">{couponError}</p>}
              {couponSuccess && <p className="text-[11px] text-emerald-600 mt-1 font-medium">{couponSuccess}</p>}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{t('subtotal')}</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>{t('discount')}</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>{t('shipping_charge')}</span>
                <span className="font-semibold text-slate-900">
                  {shippingCost === 0 ? t('free') : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>{t('grand_total')}</span>
                <span className="text-base text-amber-800">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                onNavigate('checkout');
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all group"
            >
              <span>{t('checkout')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

