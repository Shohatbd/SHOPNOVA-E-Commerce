import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Boxes,
  Tag,
  Star,
  CreditCard,
  Truck,
  BarChart3,
  Image as ImageIcon,
  Settings,
  Users,
  ScrollText,
  Shield,
  LogOut,
  ExternalLink,
  Menu,
  X,
  AlertTriangle,
  Lock,
  ChevronRight,
  Database,
  MessageSquare,
  Mail,
  MailCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { AdminSecurityModal } from './AdminSecurityModal.tsx';
import { api } from '../../services/api.ts';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onExitToStore: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onExitToStore,
  children
}) => {
  const { user, logout } = useAuth();
  const { t, lang, setLang, isBn } = useLanguage();
  const { settings } = useSettings();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [unreadInquiries, setUnreadInquiries] = useState<number>(0);

  // Check if admin is using default password
  const isDefaultPassword = user?.password_changed === 0;

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.getContactStats();
        if (res.success && res.stats) {
          setUnreadInquiries(res.stats.unread || 0);
        }
      } catch (_) {}
    };
    fetchUnread();
    const timer = setInterval(fetchUnread, 30000); // 30s poll
    return () => clearInterval(timer);
  }, [currentTab]);

  const navItems = [
    { id: 'dashboard', label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', icon: LayoutDashboard },
    { id: 'categories', label: isBn ? 'ক্যাটাগরি' : 'Categories', icon: FolderTree },
    { id: 'inquiries', label: isBn ? 'কাস্টমার ইনবক্স' : 'Customer Inbox', icon: Mail, badge: unreadInquiries },
    { id: 'orders', label: isBn ? 'অর্ডার ও শিপমেন্ট' : 'Orders & Shipments', icon: ShoppingBag },
    { id: 'products', label: isBn ? 'প্রোডাক্ট ব্যবস্থাপনা' : 'Products Management', icon: Package },
    { id: 'inventory', label: isBn ? 'ইনভেন্টরি ও স্টক' : 'Inventory & Stock', icon: Boxes },
    { id: 'coupons', label: isBn ? 'ডিসকাউন্ট কুপন' : 'Discount Coupons', icon: Tag },
    { id: 'reviews', label: isBn ? 'কাস্টমার রিভিউ' : 'Customer Reviews', icon: Star },
    { id: 'payments', label: isBn ? 'পেমেন্ট ও গেটওয়ে' : 'Payments & Gateway', icon: CreditCard },
    { id: 'courier', label: isBn ? 'কুরিয়ার হিস্ট্রি' : 'Courier History', icon: Truck },
    { id: 'analytics', label: isBn ? 'অ্যানালিটিক্স ও ট্র্যাকিং' : 'Analytics & Tracking', icon: BarChart3 },
    { id: 'banners', label: isBn ? 'ব্যানার ও স্লাইডার' : 'Banners & Sliders', icon: ImageIcon },
    { id: 'sms', label: isBn ? 'এসএমএস গেটওয়ে' : 'SMS Gateway', icon: MessageSquare },
    { id: 'settings', label: isBn ? 'সাইট সেটিংস' : 'Site Settings', icon: Settings },
    { id: 'backup', label: isBn ? 'ডেটা এক্সপোর্ট' : 'Data Export', icon: Database },
    { id: 'customers', label: isBn ? 'কাস্টমার তালিকা' : 'Customers List', icon: Users },
    { id: 'subscribers', label: isBn ? 'নিউজলেটার গ্রাহক' : 'Subscribers', icon: MailCheck },
    { id: 'logs', label: isBn ? 'অডিট লগ' : 'Audit Logs', icon: ScrollText }
  ];

  const currentNav = navItems.find((n) => n.id === currentTab);

  return (
    <div className="min-h-screen bg-[#F1F3F5] text-slate-800 text-[13px] font-sans flex flex-col antialiased">
      {/* Top Warning Banner if Default Password is Active */}
      {isDefaultPassword && (
        <div className="bg-amber-400 text-slate-950 px-4 py-2 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs border-b border-amber-500">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 fill-slate-950" />
            <span>
              {isBn
                ? `⚠️ নিরাপত্তা সতর্কতা: "${user?.username || 'admin'}" অ্যাকাউন্টে ডিফল্ট পাসওয়ার্ড (12345678) সক্রিয়। অনুগ্রহ করে আপনার অ্যাডমিন পাসওয়ার্ড এখনই পরিবর্তন করুন।`
                : `⚠️ Security Notice: Default password (12345678) is active for "${user?.username || 'admin'}". Please update your administrator password now.`}
            </span>
          </div>
          <button
            onClick={() => setIsSecurityModalOpen(true)}
            className="bg-slate-950 hover:bg-slate-800 text-white px-3 py-1 rounded text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            {isBn ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
          </button>
        </div>
      )}

      {/* Main Admin Wrapper */}
      <div className="flex-1 flex">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden"
          />
        )}

        {/* High Density Sleek Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#1E222B] text-slate-300 border-r border-[#2C323F] flex flex-col transform transition-transform duration-150 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand Header */}
          <div className="h-14 px-4 border-b border-[#2C323F] flex items-center justify-between bg-[#181B23]">
            <div className="flex items-center gap-2.5">
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.site_name || 'Logo'}
                  className="w-7 h-7 rounded object-contain bg-white/10 p-0.5"
                />
              ) : (
                <div className="w-7 h-7 rounded bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
                  <Shield className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="font-bold text-sm text-white tracking-wide block leading-none truncate max-w-[130px]">
                  {settings.site_name || 'SHOPNOVA'}
                </span>
                <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mt-0.5">
                  {isBn ? 'অ্যাডমিন প্যানেল' : 'Admin Console'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Profile Strip */}
          <div className="px-3 py-2.5 mx-2.5 my-2.5 bg-[#14171E] border border-[#2C323F] rounded flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.name || (isBn ? 'অ্যাডমিনিস্ট্রেটর' : 'Administrator')}
                </p>
                <p className="text-[10px] text-amber-400/90 font-medium">{isBn ? 'সুপার অ্যাডমিন' : 'Super Admin'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSecurityModalOpen(true)}
              title={isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password"}
              aria-label={isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password"}
              className="p-1.5 text-amber-400 hover:text-white bg-[#252A36] hover:bg-amber-500 hover:text-slate-950 rounded transition-colors cursor-pointer border border-[#3A4152] shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Nav Links List with Smooth Vertical Scroll */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth px-2 space-y-0.5 py-1 text-xs">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[12px] font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#282E3B]'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-slate-950 text-amber-400'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-[#2C323F] space-y-1.5 bg-[#181B23]">
            <button
              onClick={onExitToStore}
              className="w-full flex items-center justify-center gap-2 bg-[#252A36] hover:bg-[#2D3342] text-slate-200 py-1.5 px-3 rounded text-xs font-semibold border border-[#3A4152] transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBn ? 'লাইভ স্টোর দেখুন' : 'Live Storefront'}</span>
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 bg-rose-950/30 hover:bg-rose-950/50 text-rose-300 py-1.5 px-3 rounded text-xs font-semibold border border-rose-900/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isBn ? 'লগআউট' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
          {/* Top High Density Header */}
          <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded bg-slate-100 border border-slate-200"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <span className="font-medium hidden sm:inline">{isBn ? 'অ্যাডমিন' : 'Admin'}</span>
                <ChevronRight className="w-3.5 h-3.5 hidden sm:inline text-slate-400" />
                <h1 className="text-sm font-bold text-slate-900">
                  {currentNav?.label}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    !isBn
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('bn')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    isBn
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  বাংলা
                </button>
              </div>

              {/* View Store Button */}
              <button
                onClick={onExitToStore}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded text-xs transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBn ? 'স্টোর দেখুন' : 'View Store'}</span>
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Security Change Password Modal */}
      {isSecurityModalOpen && (
        <AdminSecurityModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
        />
      )}
    </div>
  );
};
