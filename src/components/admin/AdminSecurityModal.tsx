import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, AlertCircle, Eye, EyeOff, User as UserIcon, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../services/api.ts';

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSecurityModal: React.FC<AdminSecurityModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const { isBn } = useLanguage();

  const [activeTab, setActiveTab] = useState<'password' | 'profile'>('password');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Profile / Username state
  const [username, setUsername] = useState(user?.username || '');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg(isBn ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(isBn ? 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।' : 'New passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });

      if (res.success) {
        setSuccessMsg(isBn ? 'অ্যাডমিন পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!' : 'Admin password updated successfully!');
        await refreshUser();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message || (isBn ? 'পাসওয়ার্ড আপডেট করতে ব্যর্থ হয়েছে।' : 'Failed to update password.'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isBn ? 'পাসওয়ার্ড পরিবর্তনের সময় একটি ত্রুটি ঘটেছে।' : 'An error occurred while changing password.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMsg(isBn ? 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।' : 'Username must be at least 3 characters long.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setErrorMsg(isBn ? 'ইউজারনেমে শুধুমাত্র ইংরেজি অক্ষর, সংখ্যা এবং আন্ডারস্কোর (_) ব্যবহার করা যাবে।' : 'Username can only contain English letters, numbers, and underscores (_).');
      return;
    }

    if (!name.trim()) {
      setErrorMsg(isBn ? 'সম্পূর্ণ নাম খালি রাখা যাবে না।' : 'Full Name cannot be empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.updateProfile({
        username: cleanUsername,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      });

      if (res.success) {
        setSuccessMsg(isBn ? `ইউজারনেম ও প্রোফাইল সফলভাবে আপডেট করা হয়েছে! আপনার নতুন ইউজারনেম: "${cleanUsername}"` : `Username & profile updated successfully! New username: "${cleanUsername}"`);
        await refreshUser();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(res.message || (isBn ? 'প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে।' : 'Failed to update profile.'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isBn ? 'প্রোফাইল আপডেটের সময় একটি ত্রুটি ঘটেছে।' : 'An error occurred while updating profile.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs animate-in fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {isBn ? 'অ্যাডমিন অ্যাকাউন্ট ও নিরাপত্তা' : 'Admin Security & Account'}
              </h2>
              <p className="text-[10px] text-slate-400">
                {isBn ? 'পাসওয়ার্ড এবং ইউজারনেম পরিচালনা করুন' : 'Manage your admin username and password'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#14171E] p-1 rounded-xl border border-slate-800 mb-4 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'password'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isBn ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>{isBn ? 'ইউজারনেম পরিবর্তন' : 'Change Username'}</span>
          </button>
        </div>

        <div className="bg-[#14171E] border border-slate-800 rounded-xl px-3 py-2 mb-3 flex items-center justify-between text-xs">
          <span className="text-slate-400">{isBn ? 'বর্তমান অ্যাকাউন্ট:' : 'Logged in as:'}</span>
          <span className="font-bold text-amber-400 font-mono">
            {user?.username || 'md_liakot_ali'} ({user?.name || 'Admin'})
          </span>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Password Change */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-bold block">
                  {isBn ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                >
                  {showPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPasswords ? (isBn ? 'লুকান' : 'Hide') : (isBn ? 'দেখান' : 'Show')}</span>
                </button>
              </div>
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                {isBn ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'New Password (min 6 chars)'}
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                {isBn ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? (isBn ? 'আপডেট হচ্ছে...' : 'Updating...')
                    : (isBn ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Update Admin Password')}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Username & Profile Change */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                {isBn ? 'লগইন ইউজারনেম (Username)' : 'Login Username'}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. liakot_admin"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-400 font-bold focus:outline-none focus:border-amber-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {isBn ? 'অ্যাডমিন প্যানেলে লগইন করার জন্য এই ইউজারনেম ব্যবহৃত হবে (শুধুমাত্র a-z, 0-9 এবং _)।' : 'This username is used to log into the Admin Console (a-z, 0-9 and _).'}
              </p>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                {isBn ? 'প্রশাসকের নাম (Display Name)' : 'Administrator Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Md Liakot Ali"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'ইমেইল' : 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shopnova.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'ফোন নম্বর' : 'Phone'}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                    : (isBn ? 'ইউজারনেম ও তথ্য সংরক্ষণ করুন' : 'Save Username & Profile')}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
