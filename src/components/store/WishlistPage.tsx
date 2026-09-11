import React, { useState } from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Check, Package, Zap } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { Product } from '../../types/index.ts';

interface WishlistPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();
  const { t, isBn } = useLanguage();
  const { formatPrice, settings } = useSettings();

  const [addedIds, setAddedIds] = useState<{ [id: string]: boolean }>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (product.stock_quantity <= 0) return;

    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const handleAddAllToCart = () => {
    const inStockItems = wishlist.filter((item) => item.stock_quantity > 0);
    if (inStockItems.length === 0) return;

    inStockItems.forEach((item) => {
      addToCart(item, 1);
    });

    setIsCartOpen(true);
  };

  return (
    <div className="min-h-[75vh] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-amber-700 transition-colors"
              >
                {t('nav_home')}
              </button>
              <span>/</span>
              <span className="font-semibold text-slate-800">{t('wishlist')}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-500/20">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
                  <span>{isBn ? 'পছন্দের তালিকা' : 'My Wishlist'}</span>
                  <span className="text-sm font-bold bg-slate-200/80 text-slate-700 px-2.5 py-0.5 rounded-full">
                    {wishlist.length}
                  </span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBn
                    ? 'আপনার পছন্দের পণ্যগুলো পরে কেনার জন্য সংরক্ষিত রাখা হয়েছে।'
                    : 'Your saved favorite items to purchase later.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons if wishlist is not empty */}
          {wishlist.length > 0 && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleAddAllToCart}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isBn ? 'সব কার্টে যোগ করুন' : 'Add All to Cart'}</span>
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                className="bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{isBn ? 'তালিকা মুছুন' : 'Clear All'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-black text-slate-900">
                  {isBn ? 'উইশলিস্ট খালি করতে চান?' : 'Clear Entire Wishlist?'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isBn
                    ? 'আপনার তালিকার সকল সংরক্ষিত পণ্য মুছে ফেলা হবে।'
                    : 'This will remove all saved items from your wishlist.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    clearWishlist();
                    setShowClearConfirm(false);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs"
                >
                  {isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Clear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-16 text-center max-w-lg mx-auto space-y-5 shadow-xs">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
              <Heart className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {isBn ? 'আপনার উইশলিস্ট খালি!' : 'Your Wishlist is Empty'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                {isBn
                  ? 'আপনি এখনও কোনো পণ্য পছন্দের তালিকায় যুক্ত করেননি। আমাদের আকর্ষণীয় কালেকশন ঘুরে দেখুন।'
                  : 'You have not added any products to your wishlist yet. Explore our curated catalog to save your favorites!'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('shop')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-md inline-flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>{isBn ? 'কেনাকাটা শুরু করুন' : 'Explore Store'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map((product) => {
              const currentPrice = product.sale_price ?? product.regular_price;
              const hasDiscount = product.sale_price && product.sale_price < product.regular_price;
              const discountPercent = hasDiscount
                ? Math.round(((product.regular_price - product.sale_price!) / product.regular_price) * 100)
                : 0;
              const isOutOfStock = product.stock_quantity <= 0;
              const isAdded = addedIds[product.id];

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Image & Overlay Controls */}
                  <div
                    onClick={() => onNavigate('product', product.slug || product.id)}
                    className="relative aspect-square w-full bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.name_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                      {hasDiscount && (
                        <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                          -{discountPercent}%
                        </span>
                      )}
                      {product.is_flash_sale === 1 && (
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
                          <Zap className="w-3 h-3 fill-slate-950" /> FLASH
                        </span>
                      )}
                    </div>

                    {/* Remove from Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(product.id);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center backdrop-blur-xs border border-slate-200/60 shadow-xs transition-colors z-10"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Out of stock overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
                          {t('out_of_stock')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div
                      onClick={() => onNavigate('product', product.slug || product.id)}
                      className="cursor-pointer"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                        {product.brand}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-2 group-hover:text-amber-800 transition-colors">
                        {isBn ? product.name_bn || product.name_en : product.name_en}
                      </h3>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-base font-black text-slate-900">
                          {formatPrice(currentPrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[13px] sm:text-sm font-semibold text-slate-400 line-through">
                            {formatPrice(product.regular_price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={isOutOfStock}
                        className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{isBn ? 'যোগ হয়েছে!' : 'Added!'}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>{isOutOfStock ? (isBn ? 'স্টক শেষ' : 'Out of Stock') : (isBn ? 'কার্টে যোগ করুন' : 'Add to Cart')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
