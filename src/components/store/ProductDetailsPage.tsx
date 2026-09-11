import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  MessageSquare,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { Product, ProductVariant, Review } from '../../types/index.ts';
import { ProductCard } from './ProductCard.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { api } from '../../services/api.ts';
import { fallbackProducts } from '../../data/fallbackData.ts';
import { tracker } from '../../utils/analytics.ts';

interface ProductDetailsPageProps {
  productSlugOrId: string;
  onNavigate: (page: string, param?: string) => void;
  onOpenAuth: () => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  productSlugOrId,
  onNavigate,
  onOpenAuth
}) => {
  const { t, isBn } = useLanguage();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { formatPrice } = useSettings();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Review submission state
  const [userRating, setUserRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<string>('');

  const colorScrollRef = useRef<HTMLDivElement>(null);

  const scrollColors = (direction: 'left' | 'right') => {
    if (colorScrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      colorScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      try {
        const res = await api.getProductBySlugOrId(productSlugOrId).catch(() => null);
        if (res?.success && res.product) {
          setProduct(res.product);
          setSelectedImage(res.product.variants?.[0]?.image || res.product.thumbnail);
          if (res.product.variants && res.product.variants.length > 0) {
            setSelectedVariant(res.product.variants[0]);
          }
          if (res.reviews) setReviews(res.reviews);
          if (res.relatedProducts) setRelatedProducts(res.relatedProducts);
          tracker.trackViewItem(res.product);
        } else {
          // Fallback lookup
          const fallback = fallbackProducts.find(p => p.id === productSlugOrId || p.slug === productSlugOrId) || fallbackProducts[0];
          if (fallback) {
            setProduct(fallback);
            setSelectedImage(fallback.variants?.[0]?.image || fallback.thumbnail);
            if (fallback.variants && fallback.variants.length > 0) {
              setSelectedVariant(fallback.variants[0]);
            }
            setRelatedProducts(fallbackProducts.filter(p => p.id !== fallback.id));
            tracker.trackViewItem(fallback);
          }
        }
      } catch (err) {
        console.warn('Product load fallback:', err);
        const fallback = fallbackProducts.find(p => p.id === productSlugOrId || p.slug === productSlugOrId) || fallbackProducts[0];
        if (fallback) {
          setProduct(fallback);
          setSelectedImage(fallback.thumbnail);
          if (fallback.variants && fallback.variants.length > 0) {
            setSelectedVariant(fallback.variants[0]);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [productSlugOrId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">{t('loading')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <button
          onClick={() => onNavigate('shop')}
          className="bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs"
        >
          {t('continue_shopping')}
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const maxStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const isOutOfStock = maxStock <= 0;
  const basePrice = (product.sale_price ?? product.regular_price) + (selectedVariant?.price_adjustment ?? 0);
  const hasDiscount = product.sale_price && product.sale_price < product.regular_price;

  const galleryImages = Array.from(
    new Set(
      [
        product.thumbnail,
        ...(product.images || [])
      ].filter(Boolean)
    )
  );

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    const colorImage =
      variant.image ||
      product.variants?.find(
        (v) => v.color && variant.color && v.color.trim().toLowerCase() === variant.color.trim().toLowerCase() && v.image
      )?.image;

    if (colorImage) {
      setSelectedImage(colorImage);
    }
  };

  const handleSelectImage = (img: string) => {
    setSelectedImage(img);
  };

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity, selectedVariant);
    }
  };

  const handleBuyNow = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity, selectedVariant);
      onNavigate('checkout');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await api.submitReview({
        product_id: product.id,
        rating: userRating,
        comment: reviewComment
      });

      if (res.success) {
        setReviewMessage('Your review has been submitted successfully!');
        setReviewComment('');
        // Reload reviews
        const updated = await api.getProductBySlugOrId(product.id);
        if (updated.success && updated.reviews) setReviews(updated.reviews);
      }
    } catch (err: any) {
      setReviewMessage(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto pb-2">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-900">
          {t('nav_home')}
        </button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => onNavigate('shop')} className="hover:text-slate-900">
          {t('nav_all_products')}
        </button>
        {product.category && (
          <>
            <ChevronRight className="w-3 h-3" />
            <button
              onClick={() => onNavigate('category', product.category?.slug)}
              className="hover:text-slate-900 whitespace-nowrap font-siliguri"
            >
              {isBn && product.category.name_bn ? product.category.name_bn : product.category.name_en}
            </button>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-900 font-bold truncate font-siliguri">
          {isBn && product.name_bn ? product.name_bn : product.name_en}
        </span>
      </div>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
            <img
              src={selectedImage || product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
              alt={isBn && product.name_bn ? product.name_bn : product.name_en}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
              }}
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
                -{Math.round(((product.regular_price - product.sale_price!) / product.regular_price) * 100)}% OFF
              </span>
            )}
            {product.is_flash_sale === 1 && (
              <span className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-slate-950" /> FLASH DEAL
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectImage(img)}
                  className={`w-18 h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImage === img
                      ? 'border-amber-500 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Buy Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/60 px-2.5 py-1 rounded-md">
                {product.brand}
              </span>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2 rounded-full border transition-colors ${
                  isFavorited
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight font-siliguri">
              {isBn && product.name_bn ? product.name_bn : product.name_en}
            </h1>

            {/* Ratings & SKU */}
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-siliguri">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-slate-900">{product.rating}</span>
                <span className="text-slate-400">({reviews.length} {t('reviews_ratings')})</span>
              </div>
              <span>•</span>
              <span>{t('sku')}: <strong className="text-slate-700">{selectedVariant?.sku || product.sku}</strong></span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900 font-siliguri">
              {formatPrice(basePrice)}
            </span>
            {hasDiscount && (
              <span className="text-base text-slate-400 line-through font-siliguri">
                {formatPrice(product.regular_price)}
              </span>
            )}
            {hasDiscount && (
              <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-siliguri">
                {t('save_amount')}: {formatPrice(product.regular_price - product.sale_price!)}
              </span>
            )}
          </div>

          {/* Short Description (Noto Sans Bengali for high readability) */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-noto font-description">
            {isBn && product.short_description_bn ? product.short_description_bn : product.short_description_en}
          </p>

          {/* Variants Selector (Size / Color) */}
          {product.variants && product.variants.length > 0 && (() => {
            const uniqueColors = Array.from(
              new Set(product.variants.map((v) => v.color?.trim()).filter(Boolean) as string[])
            );
            const uniqueSizes = Array.from(
              new Set(product.variants.map((v) => v.size?.trim()).filter(Boolean) as string[])
            );

            return (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                {/* 1. Color Selector */}
                {uniqueColors.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span>{isBn ? 'রং নির্বাচন করুন' : 'Select Color'}:</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          ({uniqueColors.length} {isBn ? 'টি কালার' : 'Colors'})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedVariant?.color && (
                          <span className="text-amber-900 font-black bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-2xs flex items-center gap-1.5">
                            {selectedVariant.color_code && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-slate-400 inline-block shrink-0"
                                style={{ backgroundColor: selectedVariant.color_code }}
                              />
                            )}
                            {selectedVariant.color}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Scrollable Horizontal Color Slider flanked by Left & Right Arrows */}
                    <div className="relative flex items-center gap-2">
                      {/* Left Arrow Button */}
                      <button
                        type="button"
                        onClick={() => scrollColors('left')}
                        className="p-2 rounded-full bg-white hover:bg-amber-500 hover:text-white text-slate-700 shadow-md border border-slate-200 transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95 flex items-center justify-center z-10"
                        title={isBn ? 'বামে স্লাইড করুন' : 'Slide left'}
                      >
                        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                      </button>

                      {/* Scrollable Color Items */}
                      <div
                        ref={colorScrollRef}
                        className="flex gap-2.5 overflow-x-auto scrollbar-none scroll-smooth pb-1 pt-0.5 flex-1"
                      >
                        {uniqueColors.map((colorName) => {
                        const variantForColor =
                          product.variants?.find((v) => v.color?.trim() === colorName && v.image) ||
                          product.variants?.find((v) => v.color?.trim() === colorName);
                        const isSelected = selectedVariant?.color?.trim() === colorName;
                        const colorImg = variantForColor?.image || product.thumbnail;

                        return (
                          <button
                            key={colorName}
                            type="button"
                            onClick={() => {
                              const matched =
                                product.variants?.find(
                                  (v) =>
                                    v.color?.trim() === colorName &&
                                    (!selectedVariant?.size || v.size?.trim() === selectedVariant?.size?.trim())
                                ) || variantForColor;
                              if (matched) handleSelectVariant(matched);
                            }}
                            className={`p-1.5 rounded-2xl border transition-all flex flex-col items-center justify-between text-center cursor-pointer group overflow-hidden shrink-0 w-24 sm:w-28 ${
                              isSelected
                                ? 'border-amber-500 bg-amber-500/10 text-slate-950 font-black ring-2 ring-amber-500/40 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                            }`}
                          >
                            {/* Product Color Thumbnail Image on TOP */}
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 mb-1.5">
                              {colorImg ? (
                                <img
                                  src={colorImg}
                                  alt={colorName}
                                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 text-xs">
                                  No Img
                                </div>
                              )}
                              {isSelected && (
                                <span className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow-md flex items-center justify-center">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              )}
                            </div>

                            {/* Color Name & Color Code Dot BELOW Image */}
                            <div className="flex items-center justify-center gap-1.5 w-full px-1 py-0.5">
                              {variantForColor?.color_code && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block shrink-0 shadow-2xs"
                                  style={{ backgroundColor: variantForColor.color_code }}
                                />
                              )}
                              <span className="text-[11px] sm:text-xs font-bold truncate max-w-full font-siliguri">
                                {colorName}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                      </div>

                      {/* Right Arrow Button */}
                      <button
                        type="button"
                        onClick={() => scrollColors('right')}
                        className="p-2 rounded-full bg-white hover:bg-amber-500 hover:text-white text-slate-700 shadow-md border border-slate-200 transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95 flex items-center justify-center z-10"
                        title={isBn ? 'ডানে স্লাইড করুন' : 'Slide right'}
                      >
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <span className="text-amber-600 font-bold">✓</span>
                      <span>
                        {isBn
                          ? 'কালার সিলেক্ট করলে উপরের মূল ছবিতে সংশ্লিষ্ট রঙের ভিউ দেখতে পাবেন।'
                          : 'Selecting a color automatically updates the product preview image.'}
                      </span>
                    </p>
                  </div>
                )}

                {/* 2. Size Selector */}
                {uniqueSizes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{isBn ? 'সাইজ নির্বাচন করুন' : 'Select Size'}:</span>
                      {selectedVariant?.size && (
                        <span className="text-amber-700 font-black bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/80">
                          {selectedVariant.size}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {uniqueSizes.map((sizeName) => {
                        const isSelected = selectedVariant?.size?.trim() === sizeName;

                        return (
                          <button
                            key={sizeName}
                            type="button"
                            onClick={() => {
                              const matched =
                                product.variants?.find(
                                  (v) =>
                                    v.size?.trim() === sizeName &&
                                    (!selectedVariant?.color || v.color?.trim() === selectedVariant?.color?.trim())
                                ) || product.variants?.find((v) => v.size?.trim() === sizeName);
                              if (matched) handleSelectVariant(matched);
                            }}
                            className={`min-w-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                              isSelected
                                ? 'border-amber-500 bg-amber-500 text-slate-950 ring-2 ring-amber-500/25 shadow-xs font-black'
                                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                            }`}
                          >
                            {sizeName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Combined/Generic Variant Pills (if no separate color or size found) */}
                {uniqueColors.length === 0 && uniqueSizes.length === 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      {isBn ? 'অপশন নির্বাচন করুন' : 'Select Option / Variant'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleSelectVariant(v)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                            selectedVariant?.id === v.id
                              ? 'border-amber-500 bg-amber-50 text-slate-950 font-bold ring-2 ring-amber-500/20'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          }`}
                        >
                          {v.color_code && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block"
                              style={{ backgroundColor: v.color_code }}
                            />
                          )}
                          <span>
                            {v.size ? `Size: ${v.size}` : ''} {v.color ? `(${v.color})` : ''}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Quantity & Stock Status */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>{t('quantity')}</span>
              <span className={isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}>
                {isOutOfStock ? t('out_of_stock') : `${t('in_stock')}: ${maxStock}`}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((prev) => Math.min(maxStock, prev + 1))}
                  disabled={quantity >= maxStock || isOutOfStock}
                  className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('add_to_cart')}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{t('buy_now')}</span>
              </button>
            </div>
          </div>

          {/* Delivery & Trust Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <ShieldCheck className="w-5 h-5 text-amber-700 mx-auto" />
              <p className="text-[11px] font-bold text-slate-900">100% Genuine</p>
              <p className="text-[10px] text-slate-400">Authentic Brand</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <Truck className="w-5 h-5 text-amber-700 mx-auto" />
              <p className="text-[11px] font-bold text-slate-900">Fast Delivery</p>
              <p className="text-[10px] text-slate-400">All 64 Districts</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <RotateCcw className="w-5 h-5 text-amber-700 mx-auto" />
              <p className="text-[11px] font-bold text-slate-900">7 Days Return</p>
              <p className="text-[10px] text-slate-400">Hassle-Free</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex border-b border-slate-200 bg-slate-50/70">
          <button
            onClick={() => setActiveTab('desc')}
            className={`px-6 py-3.5 text-xs sm:text-sm font-bold transition-all border-b-2 ${
              activeTab === 'desc'
                ? 'border-amber-500 text-slate-950 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('product_description')}
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-6 py-3.5 text-xs sm:text-sm font-bold transition-all border-b-2 ${
              activeTab === 'specs'
                ? 'border-amber-500 text-slate-950 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('specifications')}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3.5 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-amber-500 text-slate-950 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>{t('reviews_ratings')}</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
              {reviews.length}
            </span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'desc' && (
            <div className="font-noto font-description prose prose-sm max-w-none text-slate-700 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>{isBn && product.description_bn ? product.description_bn : product.description_en}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-xl font-siliguri">
              <table className="w-full text-xs sm:text-sm text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 font-bold text-slate-600">{t('brand')}</td>
                    <td className="py-2.5 text-slate-900">{product.brand}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 font-bold text-slate-600">{t('sku')}</td>
                    <td className="py-2.5 text-slate-900">{product.sku}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 font-bold text-slate-600">{t('category')}</td>
                    <td className="py-2.5 text-slate-900">
                      {isBn && product.category?.name_bn ? product.category.name_bn : product.category?.name_en}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 font-bold text-slate-600">Weight / Specs</td>
                    <td className="py-2.5 text-slate-900">{product.weight ? `${product.weight} kg` : 'Standard'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-600">Warranty</td>
                    <td className="py-2.5 text-slate-900">7 Days Return & Official Warranty</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 font-siliguri">
              {/* Review Submission Form */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-siliguri">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  <span>{t('write_a_review')}</span>
                </h3>

                {reviewMessage && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    {reviewMessage}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {t('rating')} (1 - 5)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className={`p-1 rounded-md transition-colors ${
                            userRating >= star ? 'text-amber-500' : 'text-slate-300'
                          }`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {t('comment')}
                    </label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts on quality, fitting, or delivery..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-noto font-description"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition-colors shadow-xs font-siliguri"
                  >
                    {isSubmittingReview ? t('loading') : t('submit_review')}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No customer reviews yet. Be the first to review this product!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-slate-100 pb-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 font-siliguri">{rev.user_name}</span>
                          {rev.is_verified_purchase === 1 && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-siliguri">
                              <Check className="w-3 h-3" /> {t('verified_buyer')}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{rev.created_at?.split(' ')[0]}</span>
                      </div>

                      <div className="flex items-center text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-noto font-description">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('related_products')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

