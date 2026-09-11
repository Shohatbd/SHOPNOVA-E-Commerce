import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  Heart,
  Settings,
  Lock,
  LogOut,
  ChevronRight,
  Truck,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface CustomerDashboardProps {
  onNavigate: (page: string, param?: string) => void;
  onOpenAuth: () => void;
  initialTab?: 'profile' | 'orders' | 'wishlist' | 'password';
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onNavigate,
  onOpenAuth,
  initialTab
}) => {
  const { user, logout, refreshUser } = useAuth();
  const { t, isBn } = useLanguage();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'password'>(
    initialTab || 'profile'
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Profile Edit Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Change Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setEmail(user.email || '');
      api.getMyOrders().then((res) => {
        if (res.success && res.orders) {
          setOrders(res.orders);
        }
      }).catch(() => {}).finally(() => setIsLoadingOrders(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-black text-slate-900">
          {isBn ? 'আপনার একাউন্টে প্রবেশ করুন' : 'Please Sign In to Access Your Dashboard'}
        </h2>
        <button
          onClick={onOpenAuth}
          className="bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs"
        >
          {t('login_register')}
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setIsUpdatingProfile(true);
    try {
      const res = await api.updateProfile({ name, phone, email });
      if (res.success) {
        setProfileMsg(isBn ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!');
        await refreshUser();
      } else {
        setProfileMsg(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');

    if (newPassword.length < 6) {
      setPasswordErr(isBn ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErr(isBn ? 'নতুন পাসওয়ার্ড দুটি মিলছে না।' : 'New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      if (res.success) {
        setPasswordMsg(isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' : 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordErr(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Greeting Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">{user.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{user.email || user.username} • {user.phone || 'No phone set'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-950/50 border border-rose-800/60 hover:bg-rose-900/50 px-4 py-2 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>

      {/* Main Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-1.5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('my_profile')}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t('my_orders')}</span>
            <span className="ml-auto text-[10px] opacity-70">({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'wishlist'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{t('wishlist')}</span>
            <span className="ml-auto text-[10px] opacity-70">({wishlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'password'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{t('change_password')}</span>
          </button>
        </aside>

        {/* Tab Content */}
        <main className="lg:col-span-9">
          {/* 1. Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <h2 className="text-base font-black text-slate-900">
                {t('my_orders')}
              </h2>

              {isLoadingOrders ? (
                <div className="text-center py-8 text-xs text-slate-400">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Package className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">
                    {isBn ? 'আপনার কোনো পূর্ববর্তী অর্ডার নেই।' : 'You have not placed any orders yet.'}
                  </p>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="bg-amber-500 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs"
                  >
                    {t('hero_shop_now')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 hover:border-amber-400 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <span className="font-black text-slate-900 text-xs sm:text-sm">
                            {ord.order_number}
                          </span>
                          <p className="text-[11px] text-slate-400">{ord.created_at}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900">
                            {ord.order_status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {formatPrice(ord.grand_total)}
                          </span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto">
                          {ord.items?.map((it) => (
                            <img
                              key={it.id}
                              src={it.thumbnail}
                              alt={it.product_name_en}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ))}
                        </div>

                        <button
                          onClick={() => onNavigate('track', ord.order_number)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shrink-0"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{t('track_your_order')}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <h2 className="text-base font-black text-slate-900">{t('wishlist')}</h2>
              {wishlist.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">
                    {isBn ? 'উইশলিস্টে কোনো পণ্য যোগ করা হয়নি।' : 'Your wishlist is currently empty.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((prod) => (
                    <div
                      key={prod.id}
                      className="border border-slate-200 rounded-2xl p-3 flex gap-3 items-center justify-between"
                    >
                      <img
                        src={prod.thumbnail}
                        alt={prod.name_en}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {isBn ? prod.name_bn : prod.name_en}
                        </h4>
                        <p className="text-xs font-black text-amber-800 mt-1">
                          {formatPrice(prod.sale_price ?? prod.regular_price)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => addToCart(prod, 1)}
                          className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => removeFromWishlist(prod.id)}
                          className="text-[10px] text-rose-600 hover:underline text-center"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs max-w-xl">
              <h2 className="text-base font-black text-slate-900">{t('my_profile')}</h2>
              {profileMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                  {profileMsg}
                </div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('full_name')}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('phone_number')}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('email_address')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs"
                >
                  {isUpdatingProfile ? t('loading') : t('save_changes')}
                </button>
              </form>
            </div>
          )}

          {/* 4. Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs max-w-xl">
              <h2 className="text-base font-black text-slate-900">{t('change_password')}</h2>
              {passwordMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                  {passwordMsg}
                </div>
              )}
              {passwordErr && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
                  {passwordErr}
                </div>
              )}
              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs"
                >
                  {isChangingPassword ? t('loading') : t('change_password')}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
