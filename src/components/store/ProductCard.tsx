import React from 'react';
import { Star, Heart, ShoppingBag, Zap, Check, Eye } from 'lucide-react';
import { Product, ProductVariant } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, param?: string) => void;
  onQuickBuy?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate, onQuickBuy }) => {
  const { t, isBn } = useLanguage();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useSettings();

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;

  const currentPrice = product.sale_price ?? product.regular_price;
  const hasDiscount = product.sale_price && product.sale_price < product.regular_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.regular_price - product.sale_price!) / product.regular_price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      if (product.variants && product.variants.length > 0) {
        onNavigate('product', product.slug || product.id);
      } else {
        addToCart(product, 1);
      }
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onClick={() => onNavigate('product', product.slug || product.id)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image & Badges Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
          alt={product.name_en}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.is_flash_sale === 1 && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
              <Zap className="w-3 h-3 fill-slate-950" /> FLASH
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label="Add to Wishlist"
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-xs z-10 ${
            isFavorited
              ? 'bg-rose-500 text-white'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View / Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
              {t('out_of_stock')}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span className="truncate">{product.brand}</span>
            {isLowStock && (
              <span className="text-amber-800 font-bold text-xs">
                {`${product.stock_quantity} left`}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug font-siliguri">
            {isBn && product.name_bn ? product.name_bn : product.name_en}
          </h3>

          {/* Star Ratings & Color Swatches */}
          <div className="flex items-center justify-between gap-2 mt-1.5 font-siliguri">
            <div className="flex items-center gap-1">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-xs font-bold text-slate-700">{product.rating}</span>
              <span className="text-[11px] text-slate-400">({product.review_count})</span>
            </div>

            {/* Colors Preview if variants available */}
            {product.variants && product.variants.length > 0 && (() => {
              const uniqueVariantColors: ProductVariant[] = Array.from(
                new Map<string, ProductVariant>(
                  product.variants
                    .filter((v): v is ProductVariant => Boolean(v.color && v.color.trim()))
                    .map((v) => [v.color!.trim(), v])
                ).values()
              );
              if (uniqueVariantColors.length === 0) return null;

              return (
                <div className="flex items-center gap-1" title={`${uniqueVariantColors.length} Colors available`}>
                  <div className="flex items-center -space-x-1">
                    {uniqueVariantColors.slice(0, 4).map((v, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-white shadow-xs inline-block shrink-0"
                        style={{ backgroundColor: v.color_code || '#64748b' }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200/60">
                    {uniqueVariantColors.length} {isBn ? 'কালার' : 'Colors'}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Price & Cart Actions */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 font-siliguri">
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-slate-900 font-siliguri">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-[13px] sm:text-sm font-semibold text-slate-400 line-through decoration-slate-400/80 font-siliguri">
                  {formatPrice(product.regular_price)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label="Add to cart"
            className={`p-2 rounded-xl flex items-center justify-center transition-all ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-slate-950'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

