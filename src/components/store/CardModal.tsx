import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  KeyRound
} from 'lucide-react';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  formatPrice: (amount: number) => string;
  onSuccess: (transactionId: string, cardInfo: { brand: string; last4: string; holder: string }) => void;
  isBn: boolean;
  siteName?: string;
  customerName?: string;
  customerPhone?: string;
}

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'nexus';

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  amount,
  formatPrice,
  onSuccess,
  isBn,
  siteName = 'SHOPHATBD',
  customerName = '',
  customerPhone = ''
}) => {
  const [step, setStep] = useState<'card' | 'otp' | 'processing' | 'success'>('card');
  const [brand, setBrand] = useState<CardBrand>('visa');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName || 'MD. RAHIM AHMED');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [generatedTrxId, setGeneratedTrxId] = useState('');
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    if (isOpen) {
      setStep('card');
      setCardNumber('');
      setCardHolder(customerName || 'MD. RAHIM AHMED');
      setExpiry('');
      setCvv('');
      setOtp('');
      setError('');
      setBrand('visa');
      setCountdown(120);
    }
  }, [isOpen, customerName]);

  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // Format Card Number (with spaces every 4 digits)
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '').slice(0, 16);
    // Auto-detect brand
    if (raw.startsWith('4')) {
      setBrand('visa');
    } else if (raw.startsWith('5') || raw.startsWith('2')) {
      setBrand('mastercard');
    } else if (raw.startsWith('3')) {
      setBrand('amex');
    } else if (raw.startsWith('6') || raw.startsWith('9')) {
      setBrand('nexus');
    }

    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
    setError('');
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '').slice(0, 4);
    if (clean.length > 2) {
      setExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setExpiry(clean);
    }
    setError('');
  };

  // Quick Demo Autofill
  const handleFillDemoCard = (demoBrand: CardBrand = 'visa') => {
    setBrand(demoBrand);
    if (demoBrand === 'visa') {
      setCardNumber('4532 8841 9920 4242');
    } else if (demoBrand === 'mastercard') {
      setCardNumber('5412 7534 8921 5820');
    } else if (demoBrand === 'amex') {
      setCardNumber('3782 8224 6310 005');
    } else {
      setCardNumber('6011 4820 1934 9102');
    }
    setCardHolder(customerName.trim() ? customerName.toUpperCase() : 'MD. RAHIM AHMED');
    setExpiry('12/28');
    setCvv('890');
    setError('');
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const rawNum = cardNumber.replace(/\s+/g, '');
    if (rawNum.length < 15) {
      setError(isBn ? 'অনুগ্রহ করে সঠিক ১৬ ডিজিটের কার্ড নম্বর লিখুন।' : 'Please enter a valid card number.');
      return;
    }

    if (!cardHolder.trim()) {
      setError(isBn ? 'কার্ডে থাকা পুরো নামটি লিখুন।' : 'Please enter the cardholder name.');
      return;
    }

    if (expiry.length < 5 || !expiry.includes('/')) {
      setError(isBn ? 'সঠিক মেয়াদ উত্তীর্ণের তারিখ লিখুন (MM/YY)।' : 'Please enter a valid expiry date (MM/YY).');
      return;
    }

    const [mm] = expiry.split('/').map((s) => parseInt(s, 10));
    if (isNaN(mm) || mm < 1 || mm > 12) {
      setError(isBn ? 'মেয়াদ উত্তীর্ণের মাস ০১ থেকে ১২ এর মধ্যে হতে হবে।' : 'Expiry month must be between 01 and 12.');
      return;
    }

    if (cvv.length < 3) {
      setError(isBn ? 'কার্ডের পেছনের ৩ বা ৪ ডিজিটের CVV/CVC কোড লিখুন।' : 'Please enter 3 or 4 digit CVV/CVC code.');
      return;
    }

    // Move to 3D Secure / OTP step
    setStep('otp');
    setCountdown(120);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length < 4) {
      setError(isBn ? 'ব্যাংক থেকে প্রাপ্ত সঠিক ওটিপি কোড লিখুন (যেমন: 123456)।' : 'Please enter the valid OTP code received from bank.');
      return;
    }

    setStep('processing');

    setTimeout(() => {
      const rawNum = cardNumber.replace(/\s+/g, '');
      const last4 = rawNum.slice(-4) || '4242';
      const txId = `TXN-CARD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedTrxId(txId);
      setStep('success');

      setTimeout(() => {
        onSuccess(txId, {
          brand: brand.toUpperCase(),
          last4,
          holder: cardHolder
        });
      }, 1800);
    }, 2000);
  };

  const rawDigits = cardNumber.replace(/\s+/g, '');
  const displayDigits = rawDigits ? cardNumber : '•••• •••• •••• ••••';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col relative animate-scale-up">
        {/* Header: SSLCOMMERZ / 3D Secure Gateway */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base tracking-wide text-white">
                  {isBn ? 'নিরাপদ কার্ড পেমেন্ট গেটওয়ে' : 'Secure Card Gateway'}
                </h3>
                <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 256-Bit SSL
                </span>
              </div>
              <p className="text-xs text-blue-200/80 flex items-center gap-1.5 mt-0.5">
                <span>{siteName}</span> • <span className="font-semibold text-white">{formatPrice(amount)}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Card Details */}
        {step === 'card' && (
          <form onSubmit={handleCardSubmit} className="p-4 sm:p-6 space-y-4">
            {/* Interactive Card Mockup */}
            <div
              className={`rounded-2xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden transition-all duration-300 ${
                brand === 'visa'
                  ? 'bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950'
                  : brand === 'mastercard'
                  ? 'bg-gradient-to-br from-slate-900 via-neutral-900 to-amber-950'
                  : brand === 'amex'
                  ? 'bg-gradient-to-br from-cyan-900 via-slate-800 to-blue-950'
                  : 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950'
              }`}
            >
              {/* Background decorative circuits */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl font-black italic tracking-tighter select-none pointer-events-none">
                {brand.toUpperCase()}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {/* EMV Chip */}
                  <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-200 border border-amber-500/50 shadow-inner flex items-center justify-center">
                    <div className="w-7 h-5 border-t border-b border-amber-600/40 flex flex-col justify-between py-1">
                      <div className="h-px bg-amber-600/40 w-full" />
                    </div>
                  </div>
                  {/* Contactless symbol */}
                  <span className="text-white/60 text-xs tracking-tighter font-mono">(((•)))</span>
                </div>
                {/* Brand Badge */}
                <span className="text-xs font-black tracking-widest px-2.5 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/20 uppercase">
                  {brand === 'visa' && 'VISA'}
                  {brand === 'mastercard' && 'Mastercard'}
                  {brand === 'amex' && 'AMEX'}
                  {brand === 'nexus' && 'DBBL NEXUS'}
                </span>
              </div>

              {/* Card Number Display */}
              <div className="font-mono text-base sm:text-lg tracking-widest font-semibold my-3 text-white drop-shadow">
                {displayDigits}
              </div>

              {/* Card Bottom Row */}
              <div className="flex items-end justify-between text-xs pt-1 border-t border-white/10">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/60 block">Card Holder</span>
                  <span className="font-bold tracking-wide truncate max-w-[170px] sm:max-w-[220px] block">
                    {cardHolder || 'NAME SURNAME'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/60 block text-right">Expires</span>
                  <span className="font-mono font-bold">{expiry || 'MM/YY'}</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Autofill Bar */}
            <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200/80 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-blue-900 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{isBn ? 'টেস্ট করতে চান?' : 'Quick Demo Test?'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillDemoCard('visa')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white border border-blue-300 text-blue-700 text-[11px] font-bold rounded-lg transition-colors shadow-sm"
                >
                  Visa Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemoCard('mastercard')}
                  className="px-2.5 py-1 bg-white hover:bg-amber-600 hover:text-white border border-amber-300 text-amber-800 text-[11px] font-bold rounded-lg transition-colors shadow-sm"
                >
                  Mastercard
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              {/* Card Number Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'কার্ড নম্বর (Card Number)' : 'Card Number'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="4532 0000 0000 0000"
                    maxLength={19}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-mono text-sm tracking-wider font-semibold text-slate-900"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      {brand}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'কার্ডহোল্ডারের নাম (Cardholder Name)' : 'Cardholder Name'}
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => {
                    setCardHolder(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="MD. RAHIM AHMED"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-semibold text-slate-900 uppercase"
                />
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'মেয়াদ (MM/YY)' : 'Expiry Date (MM/YY)'}
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    placeholder="12/28"
                    maxLength={5}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-mono font-semibold text-slate-900 text-center"
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
                      value={cvv}
                      onChange={(e) => {
                        setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 4));
                        setError('');
                      }}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-mono font-semibold text-slate-900 text-center"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isBn ? `৳${amount} ওটিপি ভেরিফিকেশনে এগিয়ে যান` : `Proceed with ৳${amount}`}</span>
              </button>
            </div>

            {/* Trust Footer */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified by VISA
              </span>
              <span>•</span>
              <span>MasterCard ID Check</span>
              <span>•</span>
              <span>PCI-DSS Secured</span>
            </div>
          </form>
        )}

        {/* Step 2: 3D Secure / OTP Screen */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="p-4 sm:p-6 space-y-4">
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>{isBn ? '৩ডি সিকিউর ওটিপি ভেরিফিকেশন' : '3D Secure Bank OTP'}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isBn
                  ? `আপনার ব্যাংক থেকে পাঠানো ৬ ডিজিটের ওটিপি ভেরিফিকেশন কোডটি প্রদান করুন। কোডটি আপনার নিবন্ধিত নম্বরে (${customerPhone ? `***${customerPhone.slice(-3)}` : '***454'}) পাঠানো হয়েছে।`
                  : `A 6-digit OTP verification code has been dispatched to your bank registered mobile number ending in ${customerPhone ? `***${customerPhone.slice(-3)}` : '***454'}.`}
              </p>
            </div>

            {/* Quick OTP Button for Easy Testing */}
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-xs font-semibold text-emerald-900">
                {isBn ? 'টেস্ট কোড ব্যবহার করুন:' : 'Demo OTP Code:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOtp('123456');
                  setError('');
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs rounded-lg shadow-sm transition-colors"
              >
                123456
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'ওটিপি কোড লিখুন (Enter OTP Code)' : 'Enter 6-Digit OTP'}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                  setError('');
                }}
                placeholder="123456"
                maxLength={6}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-center font-mono text-xl tracking-[0.3em] font-black text-slate-900"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {isBn ? 'কোডের মেয়াদ:' : 'Expires in:'}{' '}
                <strong className="text-slate-800 font-mono">
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                </strong>
              </span>
              <button
                type="button"
                disabled={countdown > 0}
                onClick={() => {
                  setCountdown(120);
                  setOtp('');
                }}
                className={`flex items-center gap-1 font-semibold ${
                  countdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:underline'
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isBn ? 'পুনরায় কোড পাঠান' : 'Resend Code'}</span>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('card')}
                className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                {isBn ? 'পিছনে' : 'Back'}
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isBn ? 'পেমেন্ট ভেরিফাই করুন' : 'Verify & Authorize'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin mx-auto" />
            <div>
              <h4 className="font-bold text-base text-slate-900">
                {isBn ? 'ব্যাংক গেটওয়ে যোগাযোগ করছে...' : 'Authorizing Card with Bank...'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {isBn
                  ? 'অনুগ্রহ করে ব্রাউজার রিফ্রেশ বা ব্যাক করবেন না। কয়েক সেকেন্ডের মধ্যে পেমেন্ট সম্পন্ন হচ্ছে।'
                  : 'Please do not close or refresh your window. Contacting issuing bank network...'}
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="p-8 sm:p-10 text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-lg text-emerald-700">
                {isBn ? 'কার্ড পেমেন্ট সফল হয়েছে!' : 'Card Payment Approved!'}
              </h4>
              <p className="text-xs text-slate-600">
                {isBn
                  ? 'আপনার ব্যাংক কার্ড থেকে সফলভাবে অর্থ গৃহীত হয়েছে।'
                  : 'Your transaction has been authorized by your card issuer.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-xs mx-auto text-left space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">{isBn ? 'পরিশোধিত:' : 'Amount:'}</span>
                <span className="font-bold text-slate-900">{formatPrice(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isBn ? 'কার্ড:' : 'Card:'}</span>
                <span className="font-mono font-bold text-slate-800">
                  {brand.toUpperCase()} •••• {cardNumber.replace(/\s+/g, '').slice(-4) || '4242'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                <span className="text-slate-500">{isBn ? 'ট্রানজেকশন ID:' : 'Trx ID:'}</span>
                <span className="font-mono font-bold text-blue-600">{generatedTrxId}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              {isBn ? 'আপনার অর্ডার স্বয়ংক্রিয়ভাবে তৈরি হচ্ছে...' : 'Finalizing and placing your order...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
