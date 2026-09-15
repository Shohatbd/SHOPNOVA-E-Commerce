import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  CheckCircle,
  Shirt,
  Watch,
  Smile,
  CreditCard,
  Award,
  Clock,
  Heart,
  Package,
  Lock,
  ThumbsUp,
  Gift
} from 'lucide-react';
import { ProductCard } from './ProductCard.tsx';
import { CategoryCircleSlider } from './CategoryCircleSlider.tsx';
import { Product, Category, Banner, WhyShopFeatureItem } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { api } from '../../services/api.ts';

import { fallbackCategories, fallbackProducts, fallbackBanners } from '../../data/fallbackData.ts';

interface HomeProps {
  onNavigate: (page: string, param?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { t, isBn } = useLanguage();
  const { settings, banners: initialBanners } = useSettings();

  const [banners, setBanners] = useState<Banner[]>(initialBanners.length > 0 ? initialBanners : fallbackBanners);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [gadgets, setGadgets] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Flash Sale Countdown Timer (Calculated dynamically from Admin Settings)
  const calculateRemainingTime = () => {
    const rawEndTime = settings.flash_sale_end_time;
    const now = new Date().getTime();

    if (rawEndTime && rawEndTime.trim()) {
      const targetTime = new Date(rawEndTime).getTime();
      if (!isNaN(targetTime)) {
        const diff = targetTime - now;
        if (diff <= 0) {
          return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return { days, hours, minutes, seconds, isExpired: false };
      }
    }

    // Default: Dynamic countdown to tonight midnight (23:59:59)
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    const diff = Math.max(0, midnight.getTime() - now);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days: 0, hours, minutes, seconds, isExpired: false };
  };

  const [timeLeft, setTimeLeft] = useState(calculateRemainingTime);

  useEffect(() => {
    setTimeLeft(calculateRemainingTime());
    const timer = setInterval(() => {
      setTimeLeft(calculateRemainingTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.flash_sale_end_time]);

  // Fetch Homepage Data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [catsRes, featRes, flashRes, bestRes, gadgRes, bansRes] = await Promise.all([
          api.getCategories().catch(() => ({ success: true, categories: fallbackCategories })),
          api.getProducts({ is_featured: 1, limit: 8 }).catch(() => ({ success: true, products: fallbackProducts.filter(p => p.is_featured === 1) })),
          api.getFlashSaleProducts().catch(() => ({ success: true, products: fallbackProducts.filter(p => p.is_flash_sale === 1) })),
          api.getProducts({ is_bestseller: 1, limit: 8 }).catch(() => ({ success: true, products: fallbackProducts.filter(p => p.is_bestseller === 1) })),
          api.getProducts({ category: 'gadgets', limit: 4 }).catch(() => ({ success: true, products: fallbackProducts.filter(p => p.category_id === 'cat_gadgets') })),
          api.getBanners().catch(() => ({ success: true, banners: fallbackBanners }))
        ]);

        if (!isMounted) return;

        if (catsRes?.success && catsRes.categories?.length > 0) setCategories(catsRes.categories);
        if (featRes?.success && featRes.products?.length > 0) setFeaturedProducts(featRes.products);
        if (flashRes?.success && flashRes.products?.length > 0) setFlashSaleProducts(flashRes.products);
        if (bestRes?.success && bestRes.products?.length > 0) setBestSellers(bestRes.products);
        if (gadgRes?.success && gadgRes.products?.length > 0) setGadgets(gadgRes.products);
        if (bansRes?.success && bansRes.banners?.length > 0) setBanners(bansRes.banners);
      } catch (err) {
        console.warn('Home data loaded with fallback dataset:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto Banner Slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Banner Carousel & Side Offer Cards (Daraz Style) */}
      <section className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-2 sm:pt-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-4 items-stretch">
          {/* Main Hero Slider (Takes 8 columns on large screens) */}
          <div className="lg:col-span-8 w-full min-w-0">
            {banners.length > 0 ? (
              <div className="relative rounded-xl sm:rounded-3xl overflow-hidden shadow-md sm:shadow-xl aspect-[16/9] sm:aspect-[18/9] lg:aspect-auto lg:h-[390px] min-h-[160px] sm:min-h-[250px] bg-slate-900">
                {banners.map((banner, index) => {
                  const displayTitle = isBn ? (banner.title_bn || banner.title_en) : banner.title_en;
                  const displaySubtitle = isBn ? (banner.subtitle_bn || banner.subtitle_en) : banner.subtitle_en;
                  const displayBadge = isBn ? (banner.badge_bn || banner.badge_en) : banner.badge_en;
                  const displayButton = isBn ? (banner.button_text_bn || banner.button_text_en || 'অফার দেখুন') : (banner.button_text_en || 'Shop Deals Now');

                  return (
                    <div
                      key={banner.id}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      {/* Background Image with Gradient Overlay */}
                      <img
                        src={banner.image_url}
                        alt={displayTitle}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-slate-950/95 via-slate-950/70 sm:via-slate-950/45 to-transparent flex items-end sm:items-center">
                        <div className="max-w-xl p-3 sm:p-6 md:p-8 space-y-1 sm:space-y-2.5">
                          {displayBadge && (
                            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                              <Sparkles className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                              {displayBadge}
                            </span>
                          )}

                          <h1 className="text-sm sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight font-siliguri line-clamp-2">
                            {displayTitle}
                          </h1>

                          {displaySubtitle && (
                            <p className="text-[10px] sm:text-xs md:text-sm text-slate-300 line-clamp-1 sm:line-clamp-2 font-siliguri max-w-xs sm:max-w-md">
                              {displaySubtitle}
                            </p>
                          )}

                          <div className="pt-0.5 sm:pt-2">
                            <button
                              onClick={() => {
                                if (banner.link_url && (banner.link_url.startsWith('http://') || banner.link_url.startsWith('https://'))) {
                                  window.open(banner.link_url, '_blank');
                                } else if (banner.link_url) {
                                  const clean = banner.link_url.replace(/^\//, '');
                                  onNavigate(clean || 'shop');
                                } else {
                                  onNavigate('shop');
                                }
                              }}
                              className="inline-flex items-center gap-1 sm:gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 sm:px-5 py-1 sm:py-2 rounded-md sm:rounded-xl shadow-md sm:shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all text-[10px] sm:text-sm group font-siliguri"
                            >
                              <span>{displayButton}</span>
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Slider Controls */}
                {banners.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
                      className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/75 text-white items-center justify-center backdrop-blur-md transition-colors"
                      aria-label="Previous banner"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
                      className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/75 text-white items-center justify-center backdrop-blur-md transition-colors"
                      aria-label="Next banner"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <div className="absolute bottom-2 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-1.5">
                      {banners.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          aria-label={`Go to slide ${i + 1}`}
                          className={`h-1 sm:h-2 rounded-full transition-all ${
                            i === currentSlide ? 'w-4 sm:w-7 bg-amber-500' : 'w-1 sm:w-2 bg-white/50 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>

          {/* 2 Stacked Promo Mini Banners on the Right (Daraz Style) */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-4 lg:col-span-4 h-full min-w-0">
            {/* Promo Card 1: Top Side Banner */}
            <div
              onClick={() => {
                const targetLink = settings.side_banner_top_link || '/shop';
                if (targetLink.startsWith('http://') || targetLink.startsWith('https://')) {
                  window.open(targetLink, '_blank');
                } else {
                  const clean = targetLink.replace(/^\//, '');
                  onNavigate(clean || 'shop');
                }
              }}
              className="group relative rounded-xl sm:rounded-3xl overflow-hidden shadow-sm sm:shadow-lg border border-slate-200/60 cursor-pointer bg-slate-900 h-[105px] sm:h-[145px] lg:h-[188px] transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <img
                src={settings.side_banner_top_image || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80"}
                alt={isBn ? (settings.side_banner_top_title_bn || "স্মার্ট গ্যাজেট ডিল") : (settings.side_banner_top_title_en || "Smart Gadgets Deal")}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-transparent flex items-center">
                <div className="p-2.5 sm:p-5 md:p-6 space-y-0.5 sm:space-y-1.5 max-w-[240px]">
                  {(settings.side_banner_top_badge_bn || settings.side_banner_top_badge_en) && (
                    <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-500/25 border border-rose-400/40 text-rose-300 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                      <Flame className="w-2 h-2 sm:w-3 sm:h-3 text-rose-400" />
                      {isBn ? (settings.side_banner_top_badge_bn || settings.side_banner_top_badge_en) : (settings.side_banner_top_badge_en || settings.side_banner_top_badge_bn)}
                    </span>
                  )}
                  <h3 className="text-xs sm:text-base lg:text-lg font-black text-white leading-tight font-siliguri line-clamp-1 sm:line-clamp-2">
                    {isBn ? (settings.side_banner_top_title_bn || settings.side_banner_top_title_en || "স্মার্ট গ্যাজেট ও ঘড়ি") : (settings.side_banner_top_title_en || "Modern Tech & Watches")}
                  </h3>
                  {(settings.side_banner_top_subtitle_bn || settings.side_banner_top_subtitle_en) && (
                    <p className="text-[9px] sm:text-xs text-slate-300 line-clamp-1 font-siliguri hidden sm:block">
                      {isBn ? (settings.side_banner_top_subtitle_bn || settings.side_banner_top_subtitle_en) : (settings.side_banner_top_subtitle_en || settings.side_banner_top_subtitle_bn)}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[9.5px] sm:text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors pt-0.5">
                    <span>{isBn ? (settings.side_banner_top_button_bn || "এখনই কিনুন") : (settings.side_banner_top_button_en || "Shop Now")}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>

            {/* Promo Card 2: Bottom Side Banner */}
            <div
              onClick={() => {
                const targetLink = settings.side_banner_bottom_link || '/shop';
                if (targetLink.startsWith('http://') || targetLink.startsWith('https://')) {
                  window.open(targetLink, '_blank');
                } else {
                  const clean = targetLink.replace(/^\//, '');
                  onNavigate(clean || 'shop');
                }
              }}
              className="group relative rounded-xl sm:rounded-3xl overflow-hidden shadow-sm sm:shadow-lg border border-slate-200/60 cursor-pointer bg-slate-900 h-[105px] sm:h-[145px] lg:h-[188px] transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <img
                src={settings.side_banner_bottom_image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80"}
                alt={isBn ? (settings.side_banner_bottom_title_bn || "ফ্যাশন কালেকশন") : (settings.side_banner_bottom_title_en || "Fashion Collection")}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-transparent flex items-center">
                <div className="p-2.5 sm:p-5 md:p-6 space-y-0.5 sm:space-y-1.5 max-w-[240px]">
                  {(settings.side_banner_bottom_badge_bn || settings.side_banner_bottom_badge_en) && (
                    <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                      <Truck className="w-2 h-2 sm:w-3 sm:h-3 text-emerald-400" />
                      {isBn ? (settings.side_banner_bottom_badge_bn || settings.side_banner_bottom_badge_en) : (settings.side_banner_bottom_badge_en || settings.side_banner_bottom_badge_bn)}
                    </span>
                  )}
                  <h3 className="text-xs sm:text-base lg:text-lg font-black text-white leading-tight font-siliguri line-clamp-1 sm:line-clamp-2">
                    {isBn ? (settings.side_banner_bottom_title_bn || settings.side_banner_bottom_title_en || "লেটেস্ট ট্রেন্ডি ফ্যাশন") : (settings.side_banner_bottom_title_en || "Latest Lifestyle Fashion")}
                  </h3>
                  {(settings.side_banner_bottom_subtitle_bn || settings.side_banner_bottom_subtitle_en) && (
                    <p className="text-[9px] sm:text-xs text-slate-300 line-clamp-1 font-siliguri hidden sm:block">
                      {isBn ? (settings.side_banner_bottom_subtitle_bn || settings.side_banner_bottom_subtitle_en) : (settings.side_banner_bottom_subtitle_en || settings.side_banner_bottom_subtitle_bn)}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[9.5px] sm:text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors pt-0.5">
                    <span>{isBn ? (settings.side_banner_bottom_button_bn || "অফার দেখুন") : (settings.side_banner_bottom_button_en || "Explore Deals")}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category Showcase with Circular Slider & Auto Animation */}
      <CategoryCircleSlider
        categories={categories}
        onSelectCategory={(slug) => onNavigate('category', slug)}
        onViewAll={() => onNavigate('shop')}
      />

      {/* 3. Flash Sale Section with Countdown */}
      {settings.flash_sale_enabled !== '0' && settings.flash_sale_enabled !== 'false' && settings.flash_sale_enabled !== false && flashSaleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-md flex items-center gap-1 shadow-xs animate-pulse">
                    <Zap className="w-3.5 h-3.5 fill-current" /> FLASH SALE
                  </span>
                  <span className="text-rose-400 font-bold text-xs">
                    🔥 Limited Time Mega Deals
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {isBn
                    ? (settings.flash_sale_title_bn || t('flash_sale_heading'))
                    : (settings.flash_sale_title_en || t('flash_sale_heading'))}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  {isBn
                    ? (settings.flash_sale_sub_bn || t('flash_sale_sub'))
                    : (settings.flash_sale_sub_en || t('flash_sale_sub'))}
                </p>
              </div>

              {/* Countdown Timer Boxes */}
              <div className="flex items-center gap-2">
                {timeLeft.days > 0 && (
                  <>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-center min-w-[54px]">
                      <span className="text-xl font-black text-amber-400 block font-mono leading-none">
                        {String(timeLeft.days).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-slate-300">{isBn ? 'দিন' : 'Days'}</span>
                    </div>
                    <span className="text-xl font-black text-amber-400">:</span>
                  </>
                )}

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-center min-w-[54px]">
                  <span className="text-xl font-black text-amber-400 block font-mono leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-300">{isBn ? 'ঘণ্টা' : 'Hours'}</span>
                </div>
                <span className="text-xl font-black text-amber-400">:</span>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-center min-w-[54px]">
                  <span className="text-xl font-black text-amber-400 block font-mono leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-300">{isBn ? 'মিনিট' : 'Mins'}</span>
                </div>
                <span className="text-xl font-black text-amber-400">:</span>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-center min-w-[54px]">
                  <span className="text-xl font-black text-amber-400 block font-mono leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-300">{isBn ? 'সেকেন্ড' : 'Secs'}</span>
                </div>
              </div>
            </div>

            {/* Flash Sale Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flashSaleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span>{t('featured_products')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Handpicked high-quality fashion & tech
            </p>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
          >
            <span>Browse All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </section>

      {/* 5. Best Sellers Carousel / Grid */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <span>{t('best_sellers')}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Top trending items ordered repeatedly
                </p>
              </div>
              <button
                onClick={() => onNavigate('shop', 'bestseller')}
                className="text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
              >
                <span>View Top List</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {bestSellers.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Trending Gadgets Showcase */}
      {gadgets.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Headphones className="w-6 h-6 text-amber-600" />
                <span>{t('trending_gadgets')}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Smart gadgets, wearables and audio
              </p>
            </div>
            <button
              onClick={() => onNavigate('category', 'gadgets')}
              className="text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
            >
              <span>View Gadgets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {gadgets.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. Why Shop With Store Banner */}
      {(() => {
        if (settings.why_shop_enabled === 'false' || settings.why_shop_enabled === false || settings.why_shop_enabled === 0 || settings.why_shop_enabled === '0') {
          return null;
        }

        const sectionBg = settings.why_shop_bg_color || '#0F172A';
        const titleColor = settings.why_shop_title_color || '#FFFFFF';
        const subColor = settings.why_shop_subtitle_color || '#94A3B8';
        const cardBg = settings.why_shop_card_bg || 'rgba(30, 41, 59, 0.6)';
        const cardBorder = settings.why_shop_card_border || 'rgba(51, 65, 85, 0.6)';
        const cardTitleColor = settings.why_shop_card_title_color || '#FFFFFF';
        const cardDescColor = settings.why_shop_card_desc_color || '#94A3B8';
        const iconBg = settings.why_shop_icon_bg || 'rgba(245, 158, 11, 0.2)';
        const iconColor = settings.why_shop_icon_color || '#FBBF24';

        const mainTitle = isBn
          ? (settings.why_shop_title_bn || `কেন ${settings.site_name_bn || settings.site_name || 'শপহাটবিডি'} থেকে কেনাকাটা করবেন?`)
          : (settings.why_shop_title_en || `Why Shop with ${settings.site_name || 'SHOPHATBD'}`);

        const subtitle = isBn
          ? (settings.why_shop_subtitle_bn || 'অভিজ্ঞ কাস্টমার সাপোর্ট, দ্রুততম ডেলিভারি এবং খাঁটি লাক্সারি শপিংয়ের অভিজ্ঞতা।')
          : (settings.why_shop_subtitle_en || 'Experience premier customer care, fast fulfillment, and authentic luxury.');

        let features: WhyShopFeatureItem[] = [
          {
            id: 'why_1',
            title: '100% Authentic Quality',
            title_bn: '১০০% খাঁটি কোয়ালিটি',
            subtitle: 'Carefully curated premium fabrics and verified original gadget warranties.',
            subtitle_bn: 'শতভাগ অরিজিনাল ব্র্যান্ড ওয়্যারেন্টি ও প্রিমিয়াম কোয়ালিটি নিশ্চিত।',
            icon: 'shield',
            is_active: true
          },
          {
            id: 'why_2',
            title: 'Super Fast Nationwide Delivery',
            title_bn: 'সারাদেশে দ্রুত হোম ডেলিভারি',
            subtitle: 'Next-day delivery in Dhaka city and 48-72h door-to-door delivery across all 64 districts.',
            subtitle_bn: 'ঢাকায় দ্রুততম ডেলিভারি এবং ৬৪ জেলায় ৪৮-৭২ ঘণ্টার মধ্যে হোম ডেলিভারি।',
            icon: 'truck',
            is_active: true
          },
          {
            id: 'why_3',
            title: '7-Day Easy Exchange',
            title_bn: '৭ দিনে সহজ এক্সচেঞ্জ সুবিধা',
            subtitle: 'Hassle-free size exchange and dedicated 24/7 customer care helpline.',
            subtitle_bn: 'ঝামেলামুক্ত সাইজ এক্সচেঞ্জ ও ২৪/৭ ডেডিকেটেড কাস্টমার হেল্পলাইন।',
            icon: 'rotate-ccw',
            is_active: true
          },
          {
            id: 'why_4',
            title: 'Flexible & Safe Payments',
            title_bn: 'নিরাপদ ও সহজ পেমেন্ট',
            subtitle: 'Cash on Delivery (COD), bKash, Nagad, Visa, Mastercard, and SSLCommerz secured.',
            subtitle_bn: 'ক্যাশ অন ডেলিভারি, বিকাশ, নগদ ও কার্ডে সম্পূর্ণ নিরাপদ পেমেন্ট।',
            icon: 'sparkles',
            is_active: true
          }
        ];

        if (settings.why_shop_features_json) {
          try {
            const parsed = JSON.parse(settings.why_shop_features_json);
            if (Array.isArray(parsed) && parsed.length > 0) {
              features = parsed;
            }
          } catch (e) {}
        }

        const activeFeatures = features.filter((f) => f.is_active !== false);
        if (activeFeatures.length === 0) return null;

        const getIconElement = (iconName?: string) => {
          switch (iconName?.toLowerCase()) {
            case 'shield':
            case 'shield-check':
              return <ShieldCheck className="w-6 h-6" />;
            case 'truck':
              return <Truck className="w-6 h-6" />;
            case 'rotate-ccw':
            case 'return':
            case 'exchange':
              return <RotateCcw className="w-6 h-6" />;
            case 'sparkles':
            case 'sparkle':
              return <Sparkles className="w-6 h-6" />;
            case 'credit-card':
            case 'card':
            case 'payment':
              return <CreditCard className="w-6 h-6" />;
            case 'headphones':
            case 'support':
              return <Headphones className="w-6 h-6" />;
            case 'star':
              return <Star className="w-6 h-6" />;
            case 'check':
            case 'check-circle':
              return <CheckCircle className="w-6 h-6" />;
            case 'award':
              return <Award className="w-6 h-6" />;
            case 'clock':
              return <Clock className="w-6 h-6" />;
            case 'zap':
              return <Zap className="w-6 h-6" />;
            case 'heart':
              return <Heart className="w-6 h-6" />;
            case 'package':
              return <Package className="w-6 h-6" />;
            case 'lock':
              return <Lock className="w-6 h-6" />;
            case 'thumbs-up':
              return <ThumbsUp className="w-6 h-6" />;
            case 'gift':
              return <Gift className="w-6 h-6" />;
            default:
              return <Sparkles className="w-6 h-6" />;
          }
        };

        const gridColsClass =
          activeFeatures.length === 1
            ? 'grid-cols-1 max-w-md mx-auto'
            : activeFeatures.length === 2
            ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
            : activeFeatures.length === 3
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              style={{ backgroundColor: sectionBg }}
              className="rounded-3xl px-6 py-5 sm:px-8 sm:py-6 transition-colors shadow-xl"
            >
              <div className="text-center max-w-2xl mx-auto mb-5">
                <h2
                  style={{ color: titleColor }}
                  className="text-xl sm:text-2xl font-black tracking-tight"
                >
                  {mainTitle}
                </h2>
                <p
                  style={{ color: subColor }}
                  className="text-xs sm:text-sm mt-1 leading-relaxed"
                >
                  {subtitle}
                </p>
              </div>

              <div className={`grid ${gridColsClass} gap-4`}>
                {activeFeatures.map((feat) => (
                  <div
                    key={feat.id}
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder
                    }}
                    className="border rounded-2xl p-5 sm:p-6 text-center flex flex-col items-center justify-center space-y-2 transition-all hover:scale-[1.02] shadow-xs h-full min-h-[130px]"
                  >
                    <h3
                      style={{ color: cardTitleColor }}
                      className="font-extrabold text-base sm:text-lg leading-snug tracking-tight text-center"
                    >
                      {isBn ? (feat.title_bn || feat.title) : (feat.title || feat.title_bn)}
                    </h3>
                    <p
                      style={{ color: cardDescColor }}
                      className="text-xs sm:text-sm leading-relaxed text-center"
                    >
                      {isBn ? (feat.subtitle_bn || feat.subtitle) : (feat.subtitle || feat.subtitle_bn)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}
    </div>
  );
};

