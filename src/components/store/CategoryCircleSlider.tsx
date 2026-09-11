import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Category } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';

interface CategoryCircleSliderProps {
  categories: Category[];
  onSelectCategory: (slug: string) => void;
  onViewAll?: () => void;
}

export const CategoryCircleSlider: React.FC<CategoryCircleSliderProps> = ({
  categories,
  onSelectCategory,
}) => {
  const { isBn } = useLanguage();
  const { settings } = useSettings();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const shape = settings.category_view_shape || 'circle';

  // Active categories only
  const displayCategories = categories.filter((c) => c.is_active !== 0);

  // Check scroll boundaries
  const updateScrollState = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState, displayCategories.length]);

  // Smooth scroll handler
  const scroll = (direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    // Step by approximately one or two items
    const step = el.clientWidth > 768 ? el.clientWidth / 3 : el.clientWidth * 0.75;
    const targetScroll = direction === 'left' ? el.scrollLeft - step : el.scrollLeft + step;

    // Loop around if reached the end
    if (direction === 'right' && el.scrollLeft + el.clientWidth >= el.scrollWidth - 15) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction === 'left' && el.scrollLeft <= 15) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  };

  // Auto-scroll animation every 3.5 seconds (slides 1 category forward)
  useEffect(() => {
    if (isHovered || displayCategories.length <= 3) return;

    const interval = setInterval(() => {
      const el = sliderRef.current;
      if (!el) return;

      const visibleItems = el.clientWidth >= 1024 ? 5 : el.clientWidth >= 768 ? 4 : el.clientWidth >= 640 ? 3 : 2;
      const scrollStep = el.clientWidth / visibleItems;

      // If reached the end, smoothly scroll back to start
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 25) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollStep, behavior: 'smooth' });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isHovered, displayCategories.length]);

  if (displayCategories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Header with ALL CATEGORIES and centered green accent underline */}
      <div className="relative flex flex-col items-center mb-6">
        <div className="relative inline-block pb-3 px-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-wide uppercase">
            ALL CATEGORIES
          </h2>
          {/* Centered green accent line right under ALL CATEGORIES */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[3px] bg-emerald-600 rounded-full z-10" />
        </div>
        {/* Full-width subtle horizontal baseline */}
        <div className="w-full h-px bg-slate-200 -mt-px" />
      </div>

      {/* Framed Slider Container with circular items & vertical dividers */}
      <div
        className="relative group bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => {
          setTimeout(() => setIsHovered(false), 2000);
        }}
      >
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Previous Category"
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 text-slate-700 shadow-lg border border-slate-200 flex items-center justify-center hover:bg-white hover:text-emerald-700 hover:border-emerald-500 hover:scale-105 transition-all cursor-pointer ${
            canScrollLeft ? 'opacity-90 hover:opacity-100 scale-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Next Category"
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 text-slate-700 shadow-lg border border-slate-200 flex items-center justify-center hover:bg-white hover:text-emerald-700 hover:border-emerald-500 hover:scale-105 transition-all cursor-pointer ${
            canScrollRight ? 'opacity-90 hover:opacity-100 scale-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Categories Scroll Track */}
        <div
          ref={sliderRef}
          className="flex overflow-x-auto scroll-smooth no-scrollbar select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayCategories.map((category) => {
            const displayName = isBn ? (category.name_bn || category.name_en) : category.name_en;

            return (
              <div
                key={category.id}
                onClick={() => onSelectCategory(category.slug || category.id)}
                className="group/item shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 flex flex-col items-center justify-center py-6 px-3 sm:px-4 cursor-pointer transition-colors hover:bg-slate-50/80 border-r border-slate-200/80 last:border-r-0"
              >
                {/* Image container based on admin setting shape */}
                <div
                  className={`relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 overflow-hidden bg-white shadow-md border-2 border-slate-100 flex items-center justify-center transition-all duration-300 group-hover/item:scale-105 group-hover/item:shadow-xl group-hover/item:border-emerald-500/30 ${
                    shape === 'square'
                      ? 'rounded-none'
                      : shape === 'rounded_square'
                      ? 'rounded-2xl'
                      : 'rounded-full'
                  }`}
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name_en}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover/item:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-bold text-lg">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Subtle hover overlay */}
                  <div
                    className={`absolute inset-0 bg-black/0 group-hover/item:bg-black/5 transition-colors ${
                      shape === 'square'
                        ? 'rounded-none'
                        : shape === 'rounded_square'
                        ? 'rounded-2xl'
                        : 'rounded-full'
                    }`}
                  />
                </div>

                {/* Category Label - exactly preserves Admin casing (uppercase, lowercase, mixed/title case) matching Category Bar */}
                <span className="mt-3.5 sm:mt-4 text-xs sm:text-sm font-bold text-slate-800 text-center group-hover/item:text-emerald-700 transition-colors font-siliguri px-2 line-clamp-1">
                  {displayName}
                </span>

                {/* Stock Quantity / Items Count display */}
                <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {typeof category.productCount === 'number' && category.productCount > 0
                    ? (isBn ? `${category.productCount} টি পণ্য` : `${category.productCount} ${category.productCount === 1 ? 'item' : 'items'}`)
                    : (isBn ? '০টি পণ্য' : '0 items')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
