import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Zap,
  Smartphone,
  Info,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { PaymentMethod, PaymentGateway } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { tracker } from '../../utils/analytics.ts';
import { BkashModal } from './BkashModal.tsx';
import { CardModal } from './CardModal.tsx';

interface CheckoutPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const {
    items,
    subtotal,
    discountAmount,
    shippingCost,
    grandTotal,
    appliedCoupon,
    shippingZone,
    setShippingZone,
    clearCart
  } = useCart();

  const { t, isBn } = useLanguage();
  const { user } = useAuth();
  const { formatPrice, settings } = useSettings();

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState(shippingZone === 'inside' ? 'Dhaka' : 'Chittagong');
  const [shippingArea, setShippingArea] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [selectedCourier, setSelectedCourier] = useState('pathao');

  // Manual & Online Payment details state
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isBkashModalOpen, setIsBkashModalOpen] = useState(false);
  const [onlinePaidTrxId, setOnlinePaidTrxId] = useState('');
  const [onlinePaidPhone, setOnlinePaidPhone] = useState('');

  // Card payment state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardPaidTrxId, setCardPaidTrxId] = useState('');
  const [cardPaidDetails, setCardPaidDetails] = useState<{ brand: string; last4: string; holder: string } | null>(null);
  const [inlineCardNumber, setInlineCardNumber] = useState('');
  const [inlineCardHolder, setInlineCardHolder] = useState(user?.name || '');
  const [inlineCardExpiry, setInlineCardExpiry] = useState('');
  const [inlineCardCvv, setInlineCardCvv] = useState('');
  const [inlineCardBrand, setInlineCardBrand] = useState<'visa' | 'mastercard' | 'amex' | 'nexus'>('visa');

  // Gateways from database
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (items.length > 0) {
      tracker.trackBeginCheckout(items, grandTotal, appliedCoupon?.code);
    }
  }, []);

  useEffect(() => {
    const fetchGateways = async () => {
      try {
        const res = await api.getPaymentGateways();
        if (res.success && Array.isArray(res.gateways)) {
          setGateways(res.gateways);
        }
      } catch (err) {
        console.error('Failed to load gateways:', err);
      }
    };
    fetchGateways();
  }, []);

  const bkashGateway = gateways.find((g) => g.gateway_type === 'bkash' && g.is_active);
  const nagadGateway = gateways.find((g) => g.gateway_type === 'nagad' && g.is_active);
  const rocketGateway = gateways.find((g) => g.gateway_type === 'rocket' && g.is_active);

  const bkashNumber = bkashGateway?.account_number || '01724709454';
  const bkashType = bkashGateway?.account_type || 'Personal';
  const nagadNumber = nagadGateway?.account_number || '01800-654321';
  const nagadType = nagadGateway?.account_type || 'Merchant';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-black text-slate-900">{t('cart_empty')}</h2>
        <p className="text-xs text-slate-500">{t('cart_empty_sub')}</p>
        <button
          onClick={() => onNavigate('shop')}
          className="bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs"
        >
          {t('continue_shopping')}
        </button>
      </div>
    );
  }

  const handleZoneChange = (zone: 'inside' | 'outside') => {
    setShippingZone(zone);
    if (zone === 'inside') {
      setShippingCity('Dhaka');
    } else {
      setShippingCity('Outside Dhaka');
    }
  };

  const executeOrderCreation = async (paymentOverrides?: {
    payment_method: PaymentMethod;
    payment_status: string;
    transaction_id?: string;
    sender_phone?: string;
    card_brand?: string;
    card_last4?: string;
    card_holder?: string;
    notes?: string;
  }) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const activeMethod = paymentOverrides?.payment_method || paymentMethod;
      const activeStatus = paymentOverrides?.payment_status || (activeMethod === 'cod' ? 'pending' : (onlinePaidTrxId ? 'paid' : 'pending'));
      const activeTxId = paymentOverrides?.transaction_id || onlinePaidTrxId || transactionId.trim().toUpperCase() || null;
      const activePhone = paymentOverrides?.sender_phone || onlinePaidPhone || senderPhone.trim() || null;

      const orderPayload = {
        user_id: user?.id || null,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || null,
        shipping_address: shippingAddress.trim(),
        shipping_city: shippingCity,
        shipping_area: shippingArea.trim() || null,
        notes: (paymentOverrides?.notes || notes.trim()) || null,
        payment_method: activeMethod,
        payment_status: activeStatus,
        transaction_id: activeTxId,
        sender_phone: activePhone,
        card_brand: paymentOverrides?.card_brand || null,
        card_last4: paymentOverrides?.card_last4 || null,
        card_holder: paymentOverrides?.card_holder || null,
        coupon_code: appliedCoupon?.code || null,
        shipping_zone: shippingZone,
        courier_name: selectedCourier,
        items: items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          size: item.variant?.size || null,
          color: item.variant?.color || null
        }))
      };

      const res = await api.createOrder(orderPayload);

      if (res.success && res.order) {
        clearCart();
        onNavigate('order-success', res.order.order_number || res.order.id);
      } else {
        setErrorMessage(res.message || 'Failed to place order.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnlinePaymentSuccess = async (txId: string, phone: string) => {
    setOnlinePaidTrxId(txId);
    setOnlinePaidPhone(phone);
    setIsBkashModalOpen(false);

    // Automatically create and confirm the order with verified payment
    await executeOrderCreation({
      payment_method: 'bkash',
      payment_status: 'paid',
      transaction_id: txId,
      sender_phone: phone
    });
  };

  const handleCardOnlinePaymentSuccess = async (
    txId: string,
    cardInfo: { brand: string; last4: string; holder: string }
  ) => {
    setCardPaidTrxId(txId);
    setCardPaidDetails(cardInfo);
    setIsCardModalOpen(false);

    // Automatically create and confirm the order with verified payment
    await executeOrderCreation({
      payment_method: 'card',
      payment_status: 'paid',
      transaction_id: txId,
      card_brand: cardInfo.brand,
      card_last4: cardInfo.last4,
      card_holder: cardInfo.holder,
      notes: `[CARD Payment: ${cardInfo.brand} ending in ${cardInfo.last4}, Holder: ${cardInfo.holder}, TrxID: ${txId}]`
    });
  };

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '').slice(0, 16);
    if (raw.startsWith('4')) {
      setInlineCardBrand('visa');
    } else if (raw.startsWith('5') || raw.startsWith('2')) {
      setInlineCardBrand('mastercard');
    } else if (raw.startsWith('3')) {
      setInlineCardBrand('amex');
    } else if (raw.startsWith('6') || raw.startsWith('9')) {
      setInlineCardBrand('nexus');
    }
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setInlineCardNumber(formatted);
    setErrorMessage('');
  };

  const handleCardExpiryChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '').slice(0, 4);
    if (clean.length > 2) {
      setInlineCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setInlineCardExpiry(clean);
    }
    setErrorMessage('');
  };

  const handleFillDemoCard = (demoBrand: 'visa' | 'mastercard' | 'amex' = 'visa') => {
    setInlineCardBrand(demoBrand);
    if (demoBrand === 'visa') {
      setInlineCardNumber('4532 8841 9920 4242');
    } else if (demoBrand === 'mastercard') {
      setInlineCardNumber('5412 7534 8921 5820');
    } else {
      setInlineCardNumber('3782 8224 6310 005');
    }
    setInlineCardHolder(customerName.trim() ? customerName.toUpperCase() : 'MD. RAHIM AHMED');
    setInlineCardExpiry('12/28');
    setInlineCardCvv('890');
    setErrorMessage('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে সঠিক মোবাইল নম্বর দিন (যেমন: 01700000000)।' : 'Please enter a valid mobile number (e.g. 01700000000).');
      return;
    }

    if (!shippingAddress.trim()) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে বিস্তারিত ডেলিভারি ঠিকানা লিখুন।' : 'Please enter your complete delivery address.');
      return;
    }

    // Strict validation for bKash payment method (preventing unverified direct orders!)
    if (paymentMethod === 'bkash') {
      // If user has already paid via online modal, proceed
      if (!onlinePaidTrxId) {
        const cleanSender = senderPhone.replace(/[^0-9]/g, '');
        if (!cleanSender || cleanSender.length < 11) {
          setErrorMessage(
            isBn
              ? '⚠️ আপনি বিকাশ পেমেন্ট নির্বাচন করেছেন। অনুগ্রহ করে টাকা পাঠিয়ে আপনার ১১ ডিজিটের বিকাশ নম্বর লিখুন, অথবা নিচের "সরাসরি বিকাশ অনলাইন পেমেন্ট" বাটনে ক্লিক করে পেমেন্ট সম্পন্ন করুন।'
              : '⚠️ You selected bKash payment. Please provide your 11-digit bKash sender number, or click "Pay with bKash Online" below.'
          );
          return;
        }

        if (!transactionId.trim() || transactionId.trim().length < 4) {
          setErrorMessage(
            isBn
              ? '⚠️ অনুগ্রহ করে বিকাশে টাকা পাঠানোর পর SMS থেকে প্রাপ্ত Transaction ID (TrxID) লিখুন (যেমন: 8N7X6Y5Z)।'
              : '⚠️ Please enter the Transaction ID (TrxID) received from bKash after payment.'
          );
          return;
        }
      }
    }

    // Strict validation for Nagad payment method
    if (paymentMethod === 'nagad') {
      const cleanSender = senderPhone.replace(/[^0-9]/g, '');
      if (!cleanSender || cleanSender.length < 11) {
        setErrorMessage(
          isBn
            ? '⚠️ আপনি নগদ পেমেন্ট নির্বাচন করেছেন। অনুগ্রহ করে নগদ নম্বর এবং TrxID প্রদান করুন।'
            : '⚠️ You selected Nagad payment. Please provide your Nagad number and Transaction ID (TrxID).'
        );
        return;
      }

      if (!transactionId.trim() || transactionId.trim().length < 4) {
        setErrorMessage(
          isBn
            ? '⚠️ অনুগ্রহ করে নগদে টাকা পাঠানোর পর প্রাপ্ত Transaction ID (TrxID) লিখুন।'
            : '⚠️ Please enter the Transaction ID (TrxID) received from Nagad.'
        );
        return;
      }
    }

    // Strict validation for Rocket payment method
    if (paymentMethod === 'rocket') {
      const cleanSender = senderPhone.replace(/[^0-9]/g, '');
      if (!cleanSender || cleanSender.length < 11) {
        setErrorMessage(
          isBn
            ? '⚠️ অনুগ্রহ করে রকেট নম্বর এবং TrxID প্রদান করুন।'
            : '⚠️ Please provide your Rocket number and Transaction ID (TrxID).'
        );
        return;
      }
      if (!transactionId.trim()) {
        setErrorMessage(
          isBn
            ? '⚠️ অনুগ্রহ করে রকেট Transaction ID (TrxID) লিখুন।'
            : '⚠️ Please enter the Rocket Transaction ID (TrxID).'
        );
        return;
      }
    }

    // Strict validation for Card payment method
    if (paymentMethod === 'card') {
      if (cardPaidTrxId) {
        await executeOrderCreation({
          payment_method: 'card',
          payment_status: 'paid',
          transaction_id: cardPaidTrxId,
          card_brand: cardPaidDetails?.brand || 'CARD',
          card_last4: cardPaidDetails?.last4 || '',
          card_holder: cardPaidDetails?.holder || customerName,
          notes: `[CARD Payment: ${cardPaidDetails?.brand || 'Card'} ending in ${cardPaidDetails?.last4 || ''}, Holder: ${cardPaidDetails?.holder || customerName}, TrxID: ${cardPaidTrxId}]`
        });
        return;
      }

      const rawCardNum = inlineCardNumber.replace(/\s+/g, '');
      if (!rawCardNum || rawCardNum.length < 15) {
        setErrorMessage(
          isBn
            ? '⚠️ আপনি ডেবিট/ক্রেডিট কার্ড নির্বাচন করেছেন। অনুগ্রহ করে নিচের ফর্মে কার্ডের সঠিক তথ্য দিন, অথবা "সরাসরি কার্ড গেটওয়ে" বাটনে ক্লিক করে পে করুন।'
            : '⚠️ You selected Card payment. Please enter valid card details below or click "Pay with Card Gateway".'
        );
        return;
      }

      if (!inlineCardHolder.trim()) {
        setErrorMessage(isBn ? '⚠️ কার্ডহোল্ডারের পুরো নামটি লিখুন।' : '⚠️ Please enter the cardholder name.');
        return;
      }

      if (!inlineCardExpiry.trim() || inlineCardExpiry.length < 5 || !inlineCardExpiry.includes('/')) {
        setErrorMessage(isBn ? '⚠️ কার্ডের মেয়াদ উত্তীর্ণের তারিখ লিখুন (MM/YY)।' : '⚠️ Please enter a valid expiry date (MM/YY).');
        return;
      }

      if (!inlineCardCvv.trim() || inlineCardCvv.length < 3) {
        setErrorMessage(isBn ? '⚠️ কার্ডের ৩ বা ৪ ডিজিটের CVV/CVC কোড লিখুন।' : '⚠️ Please enter valid CVV/CVC code.');
        return;
      }

      const last4 = rawCardNum.slice(-4);
      const generatedCardTx = `TXN-CARD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      await executeOrderCreation({
        payment_method: 'card',
        payment_status: 'paid',
        transaction_id: generatedCardTx,
        card_brand: inlineCardBrand.toUpperCase(),
        card_last4: last4,
        card_holder: inlineCardHolder.toUpperCase(),
        notes: `[CARD Payment: ${inlineCardBrand.toUpperCase()} ending in ${last4}, Holder: ${inlineCardHolder.toUpperCase()}, TrxID: ${generatedCardTx}]`
      });
      return;
    }

    await executeOrderCreation();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('checkout')}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Fast, encrypted, and secure nationwide delivery
        </p>
      </div>

      {errorMessage && (
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Customer Info & Shipping & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Customer & Shipping Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck className="w-4 h-4 text-amber-500" />
              <span>{t('delivery_information')}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('full_name')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('phone_number')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t('email_address')}
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="youremail@domain.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Zone Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                {t('delivery_zone')} <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleZoneChange('inside')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    shippingZone === 'inside'
                      ? 'border-amber-500 bg-amber-50/60 text-slate-950 font-bold ring-2 ring-amber-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold">{t('inside_dhaka')}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">24 - 48 Hours Delivery</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleZoneChange('outside')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    shippingZone === 'outside'
                      ? 'border-amber-500 bg-amber-50/60 text-slate-950 font-bold ring-2 ring-amber-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold">{t('outside_dhaka')}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">48 - 72 Hours Nationwide</p>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t('full_address')} <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="House no, Road no, Area, District..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t('order_notes')}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special notes for delivery courier..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 2. Payment Method Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-amber-500" />
              <span>{t('payment_method')}</span>
            </h2>

            <div className="space-y-3">
              {/* COD */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => {
                    setPaymentMethod('cod');
                    setErrorMessage('');
                  }}
                  className="mt-1 text-amber-500 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900">{t('cod_label')}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t('cod_desc')}</p>
                </div>
              </label>

              {/* bKash Payment Option */}
              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  paymentMethod === 'bkash'
                    ? 'border-[#E2136E] bg-pink-50/40 ring-2 ring-pink-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <label className="flex items-start gap-3 p-4 cursor-pointer">
                  <input
                    type="radio"
                    name="payment_method"
                    value="bkash"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => {
                      setPaymentMethod('bkash');
                      setErrorMessage('');
                    }}
                    className="mt-1 text-pink-600 focus:ring-pink-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-900">{t('bkash_label')}</p>
                      <span className="text-[10px] font-black text-white bg-[#E2136E] px-2.5 py-0.5 rounded-full shadow-xs">
                        bKash
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t('bkash_desc')}</p>
                  </div>
                </label>

                {/* Expanded bKash Payment Section */}
                {paymentMethod === 'bkash' && (
                  <div className="px-4 pb-5 pt-1 space-y-4 border-t border-pink-100/80 animate-in fade-in">
                    {/* Instant Online Verification Notice if completed */}
                    {onlinePaidTrxId ? (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="text-xs">
                          <p className="font-bold text-emerald-900">
                            {isBn ? '✓ বিকাশ অনলাইন পেমেন্ট সফল হয়েছে!' : '✓ bKash Online Payment Verified!'}
                          </p>
                          <p className="text-emerald-700 font-mono text-[11px]">
                            TrxID: {onlinePaidTrxId} | Phone: {onlinePaidPhone}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Option 1: Instant Online Payment Modal Button */}
                        <div className="p-3.5 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                          <div className="text-left">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#E2136E] uppercase tracking-wider">
                              <Zap className="w-3.5 h-3.5 fill-[#E2136E]" />
                              {isBn ? 'সহজ ও ইনস্ট্যান্ট পেমেন্ট' : 'Fast & Instant Gateway'}
                            </span>
                            <p className="text-xs font-bold text-slate-900 mt-0.5">
                              {isBn ? 'সরাসরি বিকাশ পপআপে পেমেন্ট করতে চান?' : 'Want to pay via official bKash popup?'}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {isBn ? 'কোনো TrxID টাইপ ছাড়াই স্বয়ংক্রিয়ভাবে নিশ্চিত হবে' : 'Auto-confirms without typing TrxID'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsBkashModalOpen(true)}
                            className="w-full sm:w-auto px-4 py-2.5 bg-[#E2136E] hover:bg-[#C20F5D] text-white font-black text-xs rounded-xl transition-all shadow-md shadow-pink-500/25 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>{isBn ? 'অনলাইনে পেমেন্ট করুন' : 'Pay Online with bKash'}</span>
                          </button>
                        </div>

                        {/* Divider */}
                        <div className="relative flex py-1 items-center">
                          <div className="grow border-t border-pink-200"></div>
                          <span className="shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">
                            {isBn ? 'অথবা বিকাশ অ্যাপে টাকা পাঠান' : 'OR Send Money via bKash App'}
                          </span>
                          <div className="grow border-t border-pink-200"></div>
                        </div>

                        {/* Option 2: Manual Send Money / Payment Details */}
                        <div className="bg-white p-4 rounded-xl border border-pink-200/90 shadow-xs space-y-3">
                          {/* Account Number Card */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-pink-50/60 rounded-xl border border-pink-100">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                {isBn ? 'শপনোভা বিকাশ একাউন্ট নম্বর' : 'Merchant bKash Number'}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-base font-black text-[#E2136E] font-mono select-all">
                                  {bkashNumber}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-200/80 text-pink-800">
                                  {bkashType === 'Merchant'
                                    ? (isBn ? 'মার্চেন্ট' : 'Merchant')
                                    : (isBn ? 'পার্সোনাল' : 'Personal')}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(bkashNumber)}
                              className="px-3 py-1.5 bg-white border border-pink-200 hover:bg-pink-100 text-pink-800 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
                            >
                              {copiedNumber ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700">{isBn ? 'কপি হয়েছে!' : 'Copied!'}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>{isBn ? 'নম্বর কপি করুন' : 'Copy Number'}</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Payable amount notice */}
                          <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            <span className="text-slate-600 font-medium">
                              {isBn ? 'বিকাশে প্রদেয় মোট টাকা:' : 'Total Amount to Send:'}
                            </span>
                            <span className="font-black text-sm text-[#E2136E]">
                              {formatPrice(grandTotal)}
                            </span>
                          </div>

                          {/* Instructions */}
                          <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="font-bold text-slate-800 flex items-center gap-1">
                              <Info className="w-3.5 h-3.5 text-pink-600" />
                              <span>{isBn ? 'কীভাবে পেমেন্ট করবেন?' : 'Payment Instructions:'}</span>
                            </p>
                            <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                              <li>
                                {isBn
                                  ? 'আপনার বিকাশ অ্যাপ ওপেন করুন অথবা *২৪৭# ডায়াল করুন।'
                                  : 'Open your bKash app or dial *247#.'}
                              </li>
                              <li>
                                {isBn
                                  ? `${bkashType === 'Merchant' ? '‘Make Payment’' : '‘Send Money’'} অপশনে গিয়ে প্রাপক নম্বর হিসেবে ${bkashNumber} দিন।`
                                  : `Select ${bkashType === 'Merchant' ? 'Make Payment' : 'Send Money'} and enter ${bkashNumber}.`}
                              </li>
                              <li>
                                {isBn
                                  ? `টাকার পরিমাণ ${formatPrice(grandTotal)} লিখে পেমেন্ট সম্পন্ন করুন।`
                                  : `Enter amount ${formatPrice(grandTotal)} and complete the transaction.`}
                              </li>
                              <li>
                                {isBn
                                  ? 'পেমেন্ট শেষে পাওয়া SMS থেকে Transaction ID (TrxID) এবং আপনার বিকাশ নম্বর নিচে লিখে "অর্ডার কনফার্ম করুন" বাটনে ক্লিক করুন।'
                                  : 'Copy the Transaction ID (TrxID) from the confirmation SMS and fill the fields below.'}
                              </li>
                            </ol>
                          </div>

                          {/* Form Inputs for Sender Phone & TrxID */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="text-xs font-bold text-slate-800 block mb-1">
                                {isBn ? 'আপনার প্রেরক বিকাশ নম্বর *' : 'Your bKash Sender No *'}
                              </label>
                              <div className="relative">
                                <input
                                  type="tel"
                                  value={senderPhone}
                                  onChange={(e) => setSenderPhone(e.target.value)}
                                  placeholder="01XXXXXXXXX"
                                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:border-[#E2136E] focus:ring-2 focus:ring-pink-500/20 outline-hidden bg-white"
                                />
                                <Smartphone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-800 block mb-1">
                                {isBn ? 'ট্রানজেকশন আইডি (TrxID) *' : 'Transaction ID (TrxID) *'}
                              </label>
                              <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                                placeholder="e.g. 8N7X6Y5Z"
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase tracking-wider focus:border-[#E2136E] focus:ring-2 focus:ring-pink-500/20 outline-hidden bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Nagad Payment Option */}
              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  paymentMethod === 'nagad'
                    ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <label className="flex items-start gap-3 p-4 cursor-pointer">
                  <input
                    type="radio"
                    name="payment_method"
                    value="nagad"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => {
                      setPaymentMethod('nagad');
                      setErrorMessage('');
                    }}
                    className="mt-1 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-900">{t('nagad_label')}</p>
                      <span className="text-[10px] font-black text-white bg-orange-500 px-2.5 py-0.5 rounded-full shadow-xs">
                        Nagad
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t('nagad_desc')}</p>
                  </div>
                </label>

                {/* Expanded Nagad Section */}
                {paymentMethod === 'nagad' && (
                  <div className="px-4 pb-5 pt-1 space-y-3 border-t border-orange-100 animate-in fade-in">
                    <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-orange-50/60 rounded-xl border border-orange-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            {isBn ? 'শপনোভা নগদ একাউন্ট নম্বর' : 'Merchant Nagad Number'}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-base font-black text-orange-600 font-mono select-all">
                              {nagadNumber}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-200 text-orange-800">
                              {nagadType}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(nagadNumber)}
                          className="px-3 py-1.5 bg-white border border-orange-200 hover:bg-orange-100 text-orange-800 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
                        >
                          {copiedNumber ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">{isBn ? 'কপি হয়েছে!' : 'Copied!'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{isBn ? 'নম্বর কপি করুন' : 'Copy Number'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-xs font-bold text-slate-800 block mb-1">
                            {isBn ? 'আপনার নগদ নম্বর *' : 'Your Nagad Sender No *'}
                          </label>
                          <input
                            type="tel"
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-hidden bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-800 block mb-1">
                            {isBn ? 'ট্রানজেকশন আইডি (TrxID) *' : 'Transaction ID (TrxID) *'}
                          </label>
                          <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                            placeholder="e.g. 7M8X9Y"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase tracking-wider focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-hidden bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card / SSLCommerz / Bank Gateway */}
              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <label
                  className={`flex items-start gap-3 p-3.5 sm:p-4 cursor-pointer transition-all ${
                    paymentMethod === 'card' ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => {
                      setPaymentMethod('card');
                      setErrorMessage('');
                    }}
                    className="mt-1 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <p className="text-xs font-black text-slate-900">
                          {isBn ? 'ডেবিট / ক্রেডিট কার্ড (Debit / Credit Card)' : 'Debit / Credit Card'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded">
                          VISA
                        </span>
                        <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                          Mastercard
                        </span>
                        <span className="text-[10px] font-black text-cyan-800 bg-cyan-100 border border-cyan-200 px-2 py-0.5 rounded">
                          AMEX
                        </span>
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                          Nexus
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {isBn
                        ? 'ভিসা, মাস্টারকার্ড, এমেক্স অথবা নেক্সাস কার্ডের মাধ্যমে তাৎক্ষণিক ও সম্পূর্ণ নিরাপদ ৩ডি সিকিউর পেমেন্ট।'
                        : 'Instant and 100% secure 3D Secure payment via Visa, Mastercard, AMEX or DBBL Nexus card.'}
                    </p>
                  </div>
                </label>

                {/* Expanded Card Details & Gateway Trigger */}
                {paymentMethod === 'card' && (
                  <div className="px-4 pb-5 pt-2 space-y-4 border-t border-blue-100 animate-in fade-in">
                    {/* If paid via online modal */}
                    {cardPaidTrxId ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <span className="font-bold text-xs text-emerald-900">
                              {isBn ? 'কার্ড পেমেন্ট সফলভাবে ভেরিফাই হয়েছে!' : 'Card Payment Authorized!'}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            {cardPaidDetails?.brand || 'CARD'} •••• {cardPaidDetails?.last4 || '4242'}
                          </span>
                        </div>
                        <div className="text-xs text-emerald-800 flex items-center justify-between pt-1 border-t border-emerald-200/60 font-mono">
                          <span>TrxID: {cardPaidTrxId}</span>
                          <span className="font-bold">৳{grandTotal}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Instant Online Modal Trigger Button */}
                        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 rounded-xl shadow-md border border-blue-800/60 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-xs font-bold text-blue-100">
                                {isBn ? 'অনলাইন কার্ড পেমেন্ট গেটওয়ে' : 'Instant 3D Secure Gateway'}
                              </span>
                            </div>
                            <span className="text-[10px] font-black bg-white/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> 256-Bit SSL
                            </span>
                          </div>

                          <p className="text-xs text-blue-200/90 leading-relaxed">
                            {isBn
                              ? `এক-ক্লিকে নিরাপদ ব্যাংক পেমেন্ট উইন্ডো ওপেন করুন এবং ওটিপি (OTP) দিয়ে সরাসরি ৳${grandTotal} পেমেন্ট সম্পন্ন করুন।`
                              : `Open secure bank checkout window with 3D Secure OTP verification for ৳${grandTotal}.`}
                          </p>

                          <button
                            type="button"
                            onClick={() => setIsCardModalOpen(true)}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                          >
                            <Zap className="w-4 h-4 text-amber-300" />
                            <span>
                              {isBn
                                ? `সরাসরি কার্ড গেটওয়ে দিয়ে এখনই পে করুন (৳${grandTotal})`
                                : `Pay via Card Gateway (৳${grandTotal})`}
                            </span>
                            <ChevronRight className="w-4 h-4 opacity-70" />
                          </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold my-1">
                          <div className="h-px bg-slate-200 flex-1" />
                          <span>{isBn ? 'অথবা নিচের ফর্মে সরাসরি কার্ডের তথ্য দিন' : 'Or enter card details below'}</span>
                          <div className="h-px bg-slate-200 flex-1" />
                        </div>

                        {/* Inline Card Details Box */}
                        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs space-y-3">
                          {/* Demo Autofill Bar */}
                          <div className="flex items-center justify-between p-2 bg-blue-50/70 border border-blue-100 rounded-lg">
                            <span className="text-[11px] font-semibold text-blue-900 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-blue-600" />
                              {isBn ? 'টেস্ট করতে চান?' : 'Quick Demo Test:'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleFillDemoCard('visa')}
                                className="px-2 py-0.5 bg-white hover:bg-blue-600 hover:text-white border border-blue-300 text-blue-700 text-[10px] font-bold rounded transition-colors shadow-2xs cursor-pointer"
                              >
                                Visa Demo
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFillDemoCard('mastercard')}
                                className="px-2 py-0.5 bg-white hover:bg-amber-600 hover:text-white border border-amber-300 text-amber-800 text-[10px] font-bold rounded transition-colors shadow-2xs cursor-pointer"
                              >
                                Mastercard
                              </button>
                            </div>
                          </div>

                          {/* Card Number */}
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              {isBn ? 'কার্ড নম্বর (Card Number)' : 'Card Number'}
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={inlineCardNumber}
                                onChange={(e) => handleCardNumberChange(e.target.value)}
                                placeholder="4532 0000 0000 0000"
                                maxLength={19}
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold tracking-wider focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden bg-white text-slate-900"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                  {inlineCardBrand}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Cardholder Name */}
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              {isBn ? 'কার্ডহোল্ডারের নাম (Name on Card)' : 'Name on Card'}
                            </label>
                            <input
                              type="text"
                              value={inlineCardHolder}
                              onChange={(e) => {
                                setInlineCardHolder(e.target.value.toUpperCase());
                                setErrorMessage('');
                              }}
                              placeholder="MD. RAHIM AHMED"
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden bg-white text-slate-900"
                            />
                          </div>

                          {/* Expiry & CVV */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                {isBn ? 'মেয়াদ (MM/YY)' : 'Expiry (MM/YY)'}
                              </label>
                              <input
                                type="text"
                                value={inlineCardExpiry}
                                onChange={(e) => handleCardExpiryChange(e.target.value)}
                                placeholder="12/28"
                                maxLength={5}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden bg-white text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                                <span>{isBn ? 'সিভিভি (CVV/CVC)' : 'Security CVV'}</span>
                                <span className="text-[10px] font-normal text-slate-400">3-4 digits</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="password"
                                  value={inlineCardCvv}
                                  onChange={(e) => {
                                    setInlineCardCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 4));
                                    setErrorMessage('');
                                  }}
                                  placeholder="•••"
                                  maxLength={4}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden bg-white text-slate-900"
                                />
                                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          {/* Security Info */}
                          <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-slate-500 border-t border-slate-100">
                            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> PCI-DSS Compliant
                            </span>
                            <span>•</span>
                            <span>3D Secure Protected</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-5 sticky top-24">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3">
              Order Summary
            </h2>

            {/* Items List */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100">
              {items.map((item) => (
                <div key={`${item.product_id}_${item.variant_id || 'b'}`} className="pt-2.5 flex items-center gap-3">
                  <img
                    src={item.product.thumbnail}
                    alt={isBn && item.product.name_bn ? item.product.name_bn : item.product.name_en}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate font-siliguri">
                      {isBn && item.product.name_bn ? item.product.name_bn : item.product.name_en}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 mt-0.5">
                      <span>Qty: {item.quantity}</span>
                      {item.variant?.size && <span>• Size: <strong className="text-slate-700">{item.variant.size}</strong></span>}
                      {item.variant?.color && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/80 px-1.5 py-0.5 rounded font-medium text-[10px]">
                          {item.variant.color_code && (
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block shrink-0"
                              style={{ backgroundColor: item.variant.color_code }}
                            />
                          )}
                          Color: {item.variant.color}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {formatPrice(item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>{t('subtotal')}</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>{t('discount')} ({appliedCoupon?.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>{t('shipping_charge')} ({shippingZone === 'inside' ? 'Dhaka' : 'Outside'})</span>
                <span className="font-semibold text-slate-900">
                  {shippingCost === 0 ? t('free') : formatPrice(shippingCost)}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>{t('grand_total')}</span>
                <span className="text-lg text-amber-800">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-300 disabled:text-slate-500 text-slate-950 font-black py-4 px-6 rounded-xl text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>{t('processing_order')}</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{t('place_order')} • {formatPrice(grandTotal)}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-bit Bank Grade Secure Checkout</span>
            </div>
          </div>
        </div>
      </form>

      {/* bKash Direct Popup Modal */}
      <BkashModal
        isOpen={isBkashModalOpen}
        onClose={() => setIsBkashModalOpen(false)}
        amount={grandTotal}
        formatPrice={formatPrice}
        onSuccess={handleOnlinePaymentSuccess}
        isBn={isBn}
        siteName={settings?.site_name || 'SHOPNOVA'}
      />

      {/* Card / 3D Secure Bank Modal */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        amount={grandTotal}
        formatPrice={formatPrice}
        onSuccess={handleCardOnlinePaymentSuccess}
        isBn={isBn}
        siteName={settings?.site_name || 'SHOPNOVA'}
        customerName={customerName}
        customerPhone={customerPhone}
      />
    </div>
  );
};

