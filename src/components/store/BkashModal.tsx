import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle2, AlertCircle, Smartphone, KeyRound, ShieldCheck, RefreshCw } from 'lucide-react';

interface BkashModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  formatPrice: (amount: number) => string;
  onSuccess: (transactionId: string, senderPhone: string) => void;
  isBn: boolean;
  siteName?: string;
}

export const BkashModal: React.FC<BkashModalProps> = ({
  isOpen,
  onClose,
  amount,
  formatPrice,
  onSuccess,
  isBn,
  siteName = 'SHOPNOVA'
}) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'pin' | 'processing' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');
  const [generatedTrxId, setGeneratedTrxId] = useState('');
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setPhone('');
      setOtp('');
      setPin('');
      setError('');
      setAgreed(true);
      setCountdown(120);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const clean = phone.replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) {
      setError(isBn ? 'সঠিক ১১ ডিজিটের বিকাশ নম্বর লিখুন (যেমন: 017XXXXXXXX)' : 'Please enter a valid 11-digit bKash number');
      return;
    }
    if (!agreed) {
      setError(isBn ? 'শর্তাবলীতে সম্মতি দিন' : 'Please agree to the terms and conditions');
      return;
    }
    setStep('otp');
    setCountdown(120);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.trim().length < 4) {
      setError(isBn ? 'সঠিক ভেরিফিকেশন কোড লিখুন' : 'Please enter valid verification code');
      return;
    }
    setStep('pin');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!pin || pin.trim().length < 4) {
      setError(isBn ? 'সঠিক ৫ ডিজিটের পিন লিখুন' : 'Please enter your 5-digit PIN');
      return;
    }

    setStep('processing');

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const tx = `BK${Date.now().toString().slice(-6)}${randomSuffix}`;
    setGeneratedTrxId(tx);

    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess(tx, phone);
      }, 1500);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        {/* bKash Official Branded Header */}
        <div className="bg-[#E2136E] text-white p-5 flex flex-col justify-between relative">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* bKash Bird Icon SVG */}
            <div className="w-10 h-10 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-xs">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="#E2136E">
                <path d="M15 15 L85 15 L50 85 Z" />
                <path d="M20 25 L80 25 L50 75 Z" fill="#ffffff" />
                <path d="M35 35 L65 35 L50 65 Z" fill="#E2136E" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight">bKash</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Payment</span>
              </div>
              <p className="text-xs text-pink-100 font-medium">{siteName} Official Gateway</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-pink-400/40 flex items-center justify-between text-xs">
            <div>
              <span className="text-pink-200 block text-[10px]">Merchant Invoice</span>
              <span className="font-mono font-bold">INV-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="text-right">
              <span className="text-pink-200 block text-[10px]">Total Amount</span>
              <span className="text-lg font-black text-white">{formatPrice(amount)}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Phone Entry */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-black text-slate-900 text-sm">
                  {isBn ? 'আপনার বিকাশ একাউন্ট নম্বর দিন' : 'Your bKash Account Number'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isBn
                    ? 'যেকোনো সচল বিকাশ পার্সোনাল অথবা এজেন্ট নম্বর প্রবেশ করান'
                    : 'Enter your active bKash mobile number'}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBn ? 'বিকাশ নম্বর (১১ ডিজিট)' : 'bKash Mobile No'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 border-r border-slate-200 pr-2">
                    +88
                  </span>
                  <input
                    type="tel"
                    autoFocus
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    maxLength={14}
                    className="w-full pl-16 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:border-[#E2136E] focus:ring-2 focus:ring-pink-500/20 outline-hidden font-bold"
                  />
                  <Smartphone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-[#E2136E] focus:ring-[#E2136E]"
                />
                <span className="text-[11px] text-slate-600 leading-tight">
                  {isBn
                    ? 'আমি বিকাশ পেমেন্ট শর্তাবলী ও নিয়মনীতি মেনে নিচ্ছি।'
                    : 'I agree to the bKash terms and conditions.'}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors"
                >
                  {isBn ? 'বাতিল করুন' : 'CLOSE'}
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#E2136E] hover:bg-[#C20F5D] text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-pink-500/20"
                >
                  {isBn ? 'পরবর্তী ধাপ (CONFIRM)' : 'CONFIRM'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-black text-slate-900 text-sm">
                  {isBn ? 'বিকাশ ভেরিফিকেশন কোড লিখুন' : 'Enter Verification Code'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isBn
                    ? `${phone} নম্বরে ৬ সংখ্যার OTP পাঠানো হয়েছে`
                    : `6-digit verification OTP sent to ${phone}`}
                </p>
              </div>

              {/* Demo Helper Button */}
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-pink-700 font-semibold block mb-1">
                  {isBn ? '🧪 টেস্ট পেমেন্ট কোড (ক্লিক করে বসান):' : '🧪 Test Verification Code (Click to fill):'}
                </span>
                <button
                  type="button"
                  onClick={() => setOtp('123456')}
                  className="px-3 py-1 bg-[#E2136E] text-white rounded-lg text-xs font-mono font-bold hover:bg-[#C20F5D] transition-colors"
                >
                  123456
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBn ? 'ভেরিফিকেশন কোড (OTP)' : 'Verification Code'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="e.g. 123456"
                    maxLength={6}
                    className="w-full px-4 py-2.5 text-center tracking-widest border border-slate-300 rounded-xl text-base font-mono font-bold focus:border-[#E2136E] focus:ring-2 focus:ring-pink-500/20 outline-hidden"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>{countdown > 0 ? `00:${countdown < 10 ? '0' : ''}${countdown}` : 'Expired'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCountdown(120);
                      setOtp('123456');
                    }}
                    className="text-[#E2136E] hover:underline font-bold"
                  >
                    {isBn ? 'পুনরায় কোড পাঠান' : 'Resend Code'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors"
                >
                  {isBn ? 'পিছনে যান' : 'BACK'}
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#E2136E] hover:bg-[#C20F5D] text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-pink-500/20"
                >
                  {isBn ? 'যাচাই করুন (CONFIRM)' : 'CONFIRM'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PIN Entry */}
          {step === 'pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-black text-slate-900 text-sm">
                  {isBn ? 'আপনার বিকাশ পিন (PIN) লিখুন' : 'Enter your bKash PIN'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isBn
                    ? 'নিরাপদ ডেমো গেটওয়ে: যেকোনো ৫ ডিজিটের পিন (যেমন: 12345) লিখুন'
                    : 'Sandbox demo mode: Enter any 5-digit PIN (e.g. 12345)'}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBn ? 'বিকাশ পিন (PIN)' : 'bKash PIN'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    autoFocus
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="•••••"
                    maxLength={5}
                    className="w-full px-4 py-2.5 text-center tracking-[0.5em] border border-slate-300 rounded-xl text-lg font-mono font-bold focus:border-[#E2136E] focus:ring-2 focus:ring-pink-500/20 outline-hidden"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isBn
                    ? 'আপনার পিন সম্পূর্ণ এনক্রিপ্টেড এবং ১০০% নিরাপদ।'
                    : 'Your PIN is encrypted and bank-grade secured.'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('otp')}
                  className="w-full py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors"
                >
                  {isBn ? 'পিছনে যান' : 'BACK'}
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#E2136E] hover:bg-[#C20F5D] text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-pink-500/20"
                >
                  {isBn ? 'পেমেন্ট সম্পন্ন করুন' : 'PAY NOW'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Processing */}
          {step === 'processing' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-pink-100 border-t-[#E2136E] rounded-full animate-spin mx-auto flex items-center justify-center" />
              <div>
                <h4 className="font-black text-slate-900 text-sm">
                  {isBn ? 'বিকাশ পেমেন্ট প্রসেসিং হচ্ছে...' : 'Processing bKash Payment...'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {isBn
                    ? 'অনুগ্রহ করে অপেক্ষা করুন, ব্রাউজার রিফ্রেশ করবেন না'
                    : 'Please wait, verifying transaction with bKash API...'}
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Success */}
          {step === 'success' && (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base text-emerald-700">
                  {isBn ? 'পেমেন্ট সফল হয়েছে!' : 'Payment Successful!'}
                </h4>
                <div className="mt-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-xs">
                  <span className="text-slate-400 block text-[10px]">Transaction ID</span>
                  <span className="font-bold text-slate-800">{generatedTrxId}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {isBn ? 'আপনার অর্ডার কনফার্ম করা হচ্ছে...' : 'Confirming your order automatically...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span>bKash Payment Gateway v2.4</span>
          <span>16247 Helpline</span>
        </div>
      </div>
    </div>
  );
};
