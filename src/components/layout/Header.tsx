import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Shield,
  Menu,
  X,
  Truck,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { api } from '../../services/api.ts';
import { Product } from '../../types/index.ts';

interface HeaderProps {
  onNavigate: (page: string, param?: string) => void;
  currentPage: string;
  currentParam?: string;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, currentParam, onOpenAuth }) => {
  const { t, isBn } = useLanguage();
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings } = useSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Header and Category Bar colors from settings with Deep Orange default
  const headerBgColor = settings.header_bg_color || '#F97316';
  const headerTextColor = settings.header_text_color || '#0F172A';
  const categoryBarBg = settings.category_bar_bg || '#C2410C';
  const categoryBarTextColor = settings.category_bar_text_color || '#0F172A';

  // Category Buttons Customizable Borders & Colors
  const catBtnBorderColor = settings.category_btn_border_color || 'rgba(0,0,0,0.12)';
  const catBtnBg = settings.category_btn_bg || 'transparent';
  const catBtnText = settings.category_btn_text || categoryBarTextColor;
  const catActiveBg = settings.category_active_bg || '#0F172A';
  const catActiveText = settings.category_active_text || '#F97316';
  const catActiveBorder = settings.category_active_border || '#0F172A';

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Load categories
  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.success) setCategories(res.categories);
    }).catch(() => {});
  }, []);

  // Live autocomplete search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.getProducts({ search: searchQuery, limit: 5 });
        if (res.success) {
          setSearchResults(res.products);
          setShowSearchDropdown(true);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      onNavigate('shop', searchQuery.trim());
    }
  };

  return (
    <header
      style={{ backgroundColor: headerBgColor, color: headerTextColor }}
      className="border-b border-black/10 transition-colors"
    >
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center min-w-0 flex-1 sm:flex-initial mr-1 sm:mr-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 sm:gap-2.5 text-left group min-w-0 max-w-full"
          >
            {/* Logo Image / Icon (Hidden if text-only mode) */}
            {settings.logo_type !== 'text' && (
              settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.site_name || 'Logo'}
                  style={{
                    maxHeight: settings.logo_height ? `${Math.min(Math.max(Number(settings.logo_height), 24), 60)}px` : '42px',
                  }}
                  className="w-auto object-contain rounded-lg sm:rounded-xl group-hover:scale-105 transition-transform shrink-0"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-950 text-white flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                </div>
              )
            )}

            {/* Brand Name & Tagline (Hidden if image-only mode) */}
            {settings.logo_type !== 'image' && (
              <div className="inline-flex flex-col justify-center min-w-0 overflow-visible py-0.5">
                <span
                  className="text-base sm:text-xl lg:text-2xl font-black tracking-tight font-heading block leading-tight uppercase whitespace-nowrap pt-1 pb-0.5 overflow-visible"
                  style={{ color: headerTextColor }}
                >
                  {isBn && settings.site_name_bn ? settings.site_name_bn : (settings.site_name || 'SHOPHATBD')}
                </span>
                {(() => {
                  const taglineText = isBn
                    ? (settings.site_tagline_bn || 'স্মার্ট কেনাকাটা সুন্দর জীবন')
                    : (settings.site_tagline_en || 'SHOP SMART LIVE BETTER');
                  const words = taglineText.trim().split(/\s+/);
                  return words.length > 1 ? (
                    <div
                      className={`w-full flex justify-between items-center text-[7px] sm:text-[8px] lg:text-[8.5px] font-extrabold uppercase opacity-90 leading-tight mt-0.5 select-none ${
                        isBn ? 'font-bengali' : ''
                      }`}
                      style={{ color: headerTextColor }}
                    >
                      {words.map((w, idx) => (
                        <span
                          key={idx}
                          className={`shrink-0 ${
                            isBn ? '' : 'tracking-[0.03em] sm:tracking-[0.05em]'
                          }`}
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`w-full text-center text-[7px] sm:text-[8px] lg:text-[8.5px] font-extrabold uppercase opacity-90 leading-tight mt-0.5 select-none ${
                        isBn ? 'font-bengali' : 'tracking-[0.08em]'
                      }`}
                      style={{ color: headerTextColor }}
                    >
                      {taglineText}
                    </div>
                  );
                })()}
              </div>
            )}
          </button>
        </div>

        {/* Search Bar with live autocomplete */}
        <div ref={searchRef} className="relative flex-1 max-w-xl hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
              placeholder={t('search_placeholder')}
              className="w-full bg-white/95 border border-black/15 text-slate-900 rounded-full py-2.5 pl-11 pr-24 text-xs font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white shadow-xs transition-all"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-slate-950 hover:bg-slate-800 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xs transition-colors"
            >
              {isBn ? 'অনুসন্ধান' : 'Search'}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-900">
              <div className="p-2 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider px-3">
                {isBn ? 'সম্পর্কিত পণ্যসমূহ' : 'Matching Products'}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                      onNavigate('product', product.slug);
                    }}
                    className="w-full p-2.5 hover:bg-lime-50/80 flex items-center gap-3 text-left transition-colors"
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.name_en}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {isBn ? (product.name_bn || product.name_en) : product.name_en}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {product.brand} • <span className="font-bold text-slate-900">৳{product.sale_price ?? product.regular_price}</span>
                        {product.sale_price && (
                          <span className="line-through text-slate-400 ml-1.5">৳{product.regular_price}</span>
                        )}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleSearchSubmit}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-center text-xs font-bold text-slate-900 transition-colors border-t border-slate-100"
              >
                {isBn ? `"${searchQuery}" এর সকল ফলাফল দেখুন` : `View all results for "${searchQuery}"`}
              </button>
            </div>
          )}
        </div>

        {/* Right Actions: Track, Wishlist, Cart, User / Admin */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Order Tracking Button */}
          <button
            onClick={() => onNavigate('track')}
            className="flex items-center gap-1.5 text-xs font-bold px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl bg-black/10 hover:bg-black/15 transition-colors shrink-0"
            style={{ color: headerTextColor }}
            title={t('track_order')}
          >
            <Truck className="w-4 h-4" />
            <span className="hidden md:inline font-bold">{t('track_order')}</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => onNavigate('wishlist')}
            aria-label="Wishlist"
            className="relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-black/10 hover:bg-black/15 transition-colors shrink-0"
            style={{ color: headerTextColor }}
            title={t('wishlist')}
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] sm:text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-75">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Shopping Cart"
            className="relative flex items-center gap-1.5 sm:gap-2 bg-slate-950 hover:bg-slate-800 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-xs transition-all font-bold text-xs group shrink-0"
          >
            <ShoppingBag className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-bold">{t('cart')}</span>
            {itemCount > 0 && (
              <span className="bg-white text-slate-950 text-[10px] sm:text-[11px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Account / Admin Dropdown */}
          <div ref={userMenuRef} className="relative shrink-0">
            {user ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 sm:p-1.5 sm:pr-2.5 rounded-lg sm:rounded-xl bg-black/10 hover:bg-black/15 transition-colors text-xs font-bold"
                style={{ color: headerTextColor }}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-slate-950 text-white font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-colors shadow-xs"
              >
                <UserIcon className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">{t('login_register')}</span>
              </button>
            )}

            {/* User Dropdown Menu */}
            {isUserMenuOpen && user && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-150 text-slate-800">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email || user.username}</p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('admin');
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-lime-800 hover:bg-lime-50 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-lime-700" />
                    <span>{t('admin_panel')}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onNavigate('account', 'profile');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>{t('my_profile')}</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onNavigate('track');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span>{t('track_order')}</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold"
                >
                  <span>{t('logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation Bar with Scroll Buttons and #A7E864 Light Green Background */}
      <nav
        style={{ backgroundColor: categoryBarBg, color: categoryBarTextColor }}
        className="border-t border-black/10 hidden md:block relative group/nav min-h-[38px] flex items-center"
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative flex items-center justify-between text-xs font-normal py-0.5">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            className="absolute left-2 z-10 p-1 rounded-full bg-slate-950 text-white shadow-md hover:scale-110 transition-all opacity-80 group-hover/nav:opacity-100 hidden sm:flex items-center justify-center"
            title="Scroll Left (আগে দেখুন)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Scrollable Categories List */}
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-7 w-full select-none"
          >
            {/* Home button */}
            {(() => {
              const isHomeActive = currentPage === 'home';
              return (
                <button
                  onClick={() => onNavigate('home')}
                  style={{
                    backgroundColor: isHomeActive ? catActiveBg : catBtnBg,
                    color: isHomeActive ? catActiveText : catBtnText,
                    borderColor: isHomeActive ? catActiveBorder : catBtnBorderColor,
                  }}
                  className={`px-3 py-1 rounded-lg sm:rounded-xl transition-all shrink-0 border text-xs sm:text-[13px] font-normal ${
                    isHomeActive ? 'shadow-xs' : 'hover:opacity-85'
                  }`}
                >
                  {t('nav_home')}
                </button>
              );
            })()}

            {/* All Products button */}
            {(() => {
              const isAllProductsActive = currentPage === 'shop' && (!currentParam || currentParam === '');
              return (
                <button
                  onClick={() => onNavigate('shop')}
                  style={{
                    backgroundColor: isAllProductsActive ? catActiveBg : catBtnBg,
                    color: isAllProductsActive ? catActiveText : catBtnText,
                    borderColor: isAllProductsActive ? catActiveBorder : catBtnBorderColor,
                  }}
                  className={`px-3 py-1 rounded-lg sm:rounded-xl transition-all shrink-0 border text-xs sm:text-[13px] font-normal ${
                    isAllProductsActive ? 'shadow-xs' : 'hover:opacity-85'
                  }`}
                >
                  {t('nav_all_products')}
                </button>
              );
            })()}

            {/* Categories */}
            {categories.map((cat) => {
              const isCatActive =
                (currentPage === 'category' || currentPage === 'shop') &&
                (currentParam === cat.slug ||
                  currentParam === cat.id ||
                  (cat.subcategories && cat.subcategories.some((s: any) => s.slug === currentParam || s.id === currentParam)));

              return (
                <button
                  key={cat.id}
                  onClick={() => onNavigate('category', cat.slug)}
                  style={{
                    backgroundColor: isCatActive ? catActiveBg : catBtnBg,
                    color: isCatActive ? catActiveText : catBtnText,
                    borderColor: isCatActive ? catActiveBorder : catBtnBorderColor,
                  }}
                  className={`flex items-center px-3 py-1 rounded-lg sm:rounded-xl transition-all whitespace-nowrap shrink-0 border text-xs sm:text-[13px] font-normal ${
                    isCatActive ? 'shadow-xs' : 'hover:opacity-85'
                  }`}
                >
                  <span>{isBn ? (cat.name_bn || cat.name_en) : cat.name_en}</span>
                </button>
              );
            })}

            {/* Flash Sale Tab */}
            {(() => {
              const isFlashSaleActive = currentPage === 'shop' && currentParam === 'flash_sale';
              return (
                <button
                  onClick={() => onNavigate('shop', 'flash_sale')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg sm:rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all whitespace-nowrap shrink-0 shadow-xs border border-rose-700 text-xs sm:text-[13px] ${
                    isFlashSaleActive ? 'ring-2 ring-white ring-offset-1 scale-105' : 'animate-pulse'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>{t('nav_flash_sale')}</span>
                </button>
              );
            })()}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollCategories('right')}
            className="absolute right-2 z-10 p-1 rounded-full bg-slate-950 text-white shadow-md hover:scale-110 transition-all opacity-80 group-hover/nav:opacity-100 hidden sm:flex items-center justify-center"
            title="Scroll Right (পরে দেখুন)"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Admin shortcut if logged in */}
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="hidden 2xl:inline-flex items-center gap-1 text-xs font-bold bg-slate-950 text-white px-2.5 py-1 rounded-md transition-colors shrink-0 ml-2 shadow-xs"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t('admin_panel')}</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

