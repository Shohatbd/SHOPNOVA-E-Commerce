import React, { useState, useEffect } from 'react';
import { Home, Grid, Heart, ShoppingBag, User, Shield, Zap, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { api } from '../../services/api.ts';

interface MobileNavProps {
  onNavigate: (page: string, param?: string) => void;
  currentPage: string;
  onOpenAuth: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onNavigate, currentPage, onOpenAuth }) => {
  const { t, isBn } = useLanguage();
  const { user, isAdmin } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings } = useSettings();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.success) setCategories(res.categories);
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* Bottom Sticky Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            currentPage === 'home' ? 'text-amber-800 font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{t('nav_home')}</span>
        </button>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            currentPage === 'shop' || currentPage === 'category' ? 'text-amber-800 font-bold' : 'text-slate-500'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => onNavigate('wishlist')}
          className={`relative flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            currentPage === 'wishlist' ? 'text-rose-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span>{t('wishlist')}</span>
          {wishlistCount > 0 && (
            <span className="absolute -top-1 right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-medium text-slate-500"
        >
          <ShoppingBag className="w-5 h-5 text-slate-700" />
          <span>{t('cart')}</span>
          {itemCount > 0 && (
            <span className="absolute -top-1 right-1 bg-amber-500 text-slate-950 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            if (user) {
              onNavigate('account', 'profile');
            } else {
              onOpenAuth();
            }
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            currentPage === 'account' ? 'text-amber-800 font-bold' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span>{user ? t('my_profile') : t('login_register')}</span>
        </button>
      </div>

      {/* Slide-out Mobile Category Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {settings.logo_type !== 'text' && (
                  settings.logo_url ? (
                    <img
                      src={settings.logo_url}
                      alt={settings.site_name || 'Logo'}
                      className="h-8 w-auto object-contain rounded shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center text-slate-950 font-black shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )
                )}
                {settings.logo_type !== 'image' && (
                  <div className="inline-flex flex-col justify-center min-w-0">
                    <span className="font-black text-sm text-slate-900 truncate block leading-none uppercase">
                      {isBn && settings.site_name_bn ? settings.site_name_bn : (settings.site_name || 'SHOPHATBD')}
                    </span>
                    {(() => {
                      const taglineText = isBn
                        ? (settings.site_tagline_bn || 'স্মার্ট কেনাকাটা সুন্দর জীবন')
                        : (settings.site_tagline_en || 'SHOP SMART LIVE BETTER');
                      const words = taglineText.trim().split(/\s+/);
                      return words.length > 1 ? (
                        <div className={`w-full flex justify-between items-center text-[7px] font-extrabold uppercase text-slate-500 leading-none mt-1 select-none ${isBn ? 'font-bengali' : ''}`}>
                          {words.map((w, idx) => (
                            <span
                              key={idx}
                              className={`shrink-0 ${
                                isBn ? '' : 'tracking-[0.03em]'
                              }`}
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className={`w-full text-center text-[7px] font-extrabold uppercase text-slate-500 leading-none mt-1 select-none ${isBn ? 'font-bengali' : 'tracking-[0.08em]'}`}>
                          {taglineText}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onNavigate('shop');
                }}
                className="w-full text-left p-2.5 rounded-xl font-semibold text-sm hover:bg-amber-50 hover:text-amber-800 text-slate-800 transition-colors"
              >
                {t('nav_all_products')}
              </button>

              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onNavigate('shop', 'flash_sale');
                }}
                className="w-full text-left p-2.5 rounded-xl font-bold text-sm text-rose-600 bg-rose-50 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-rose-600" />
                <span>{t('nav_flash_sale')}</span>
              </button>

              <div className="pt-2 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('shop_by_category')}
              </div>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onNavigate('category', cat.slug);
                  }}
                  className="w-full text-left p-2.5 rounded-xl text-sm font-normal text-slate-700 hover:bg-slate-50 flex items-center justify-between font-siliguri"
                >
                  <span>{isBn && cat.name_bn ? cat.name_bn : cat.name_en}</span>
                  {cat.productCount !== undefined && (
                    <span className="text-xs text-slate-400 font-mono">{cat.productCount}</span>
                  )}
                </button>
              ))}

              <div className="pt-4 border-t border-slate-100 space-y-1">
                {user && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onNavigate('account', 'profile');
                    }}
                    className="w-full text-left p-2 text-sm font-semibold text-slate-800 hover:text-amber-800 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>{t('my_profile')}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onNavigate('track');
                  }}
                  className="w-full text-left p-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  {t('track_order')}
                </button>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onNavigate('about');
                  }}
                  className="w-full text-left p-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  About Us
                </button>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onNavigate('contact');
                  }}
                  className="w-full text-left p-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  Contact Us
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onNavigate('admin');
                    }}
                    className="w-full text-left p-2.5 mt-2 rounded-xl text-sm font-bold text-amber-700 bg-amber-50 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>{t('admin_panel')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

