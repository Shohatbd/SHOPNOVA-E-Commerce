import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const { settings } = useSettings();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState(''); // email or username or phone
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const isBn = settings.language === 'bn';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(identifier.trim(), password);
        if (res.success) {
          onClose();
          if (onSuccess) onSuccess();
        } else {
          setErrorMsg(res.message || (isBn ? 'লগইন ব্যর্থ হয়েছে। সঠিক তথ্য দিন।' : 'Login failed. Please check credentials.'));
        }
      } else {
        const res = await register(name.trim(), identifier.trim(), password, phone.trim());
        if (res.success) {
          onClose();
          if (onSuccess) onSuccess();
        } else {
          setErrorMsg(res.message || (isBn ? 'অ্যাকাউন্ট তৈরি করা যায়নি।' : 'Failed to create account.'));
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isBn ? 'কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Authentication failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-black text-lg">{settings.site_name || 'SHOPHATBD'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-3 transition-colors ${
              mode === 'login'
                ? 'bg-white text-slate-950 border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isBn ? 'সাইন ইন' : 'Sign In'}
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-3 transition-colors ${
              mode === 'register'
                ? 'bg-white text-slate-950 border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create Account'}
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'register' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('full_name')} *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isBn ? 'আপনার পূর্ণ নাম' : 'e.g. John Doe'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {mode === 'login'
                  ? (isBn ? 'ইমেইল / মোবাইল নম্বর / ইউজারনেম' : 'Username / Email / Phone')
                  : (isBn ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *')}
              </label>
              <div className="relative">
                <input
                  type={mode === 'login' ? 'text' : 'email'}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={mode === 'login' ? (isBn ? 'যেমন: user@email.com বা 017XXXXXXXX' : 'e.g. email or phone number') : 'you@example.com'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('phone_number')}</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isBn ? 'পাসওয়ার্ড *' : 'Password *'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-10 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px] font-semibold"
                >
                  {showPassword ? (isBn ? 'লুকান' : 'Hide') : (isBn ? 'দেখান' : 'Show')}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isLoading ? t('loading') : mode === 'login' ? (isBn ? 'সাইন ইন করুন' : 'Sign In') : (isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

