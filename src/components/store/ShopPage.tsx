import React, { useState, useEffect, useMemo } from 'react';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Grid,
  List,
  ChevronDown,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Zap,
  Package
} from 'lucide-react';
import { ProductCard } from './ProductCard.tsx';
import { Product, Category } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../services/api.ts';
import { fallbackCategories, fallbackProducts } from '../../data/fallbackData.ts';
import { tracker } from '../../utils/analytics.ts';

interface ShopPageProps {
  onNavigate: (page: string, param?: string) => void;
  initialFilter?: string; // 'flash_sale', 'bestseller', search term, or category slug
  initialCategory?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onNavigate, initialFilter, initialCategory }) => {
  const { t, isBn } = useLanguage();

  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [isFlashSaleOnly, setIsFlashSaleOnly] = useState<boolean>(false);
  const [isBestsellerOnly, setIsBestsellerOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Sync initialCategory & initialFilter whenever they change
  useEffect(() => {
    if (initialCategory) {
      // Check if initialCategory matches a subcategory
      let parentCatSlug = initialCategory;
      let matchedSubSlug = '';

      for (const cat of categories) {
        if (cat.subcategories) {
          const sub = cat.subcategories.find((s) => s.slug === initialCategory || s.id === initialCategory);
          if (sub) {
            parentCatSlug = cat.slug;
            matchedSubSlug = sub.slug;
            break;
          }
        }
      }

      setSelectedCategory(parentCatSlug);
      setSelectedSubcategory(matchedSubSlug);
      setIsFlashSaleOnly(false);
      setIsBestsellerOnly(false);
      setSearchQuery('');
    } else if (initialFilter) {
      if (initialFilter === 'flash_sale') {
        setIsFlashSaleOnly(true);
        setSelectedCategory('');
        setSelectedSubcategory('');
        setIsBestsellerOnly(false);
        setSearchQuery('');
      } else if (initialFilter === 'bestseller') {
        setIsBestsellerOnly(true);
        setSelectedCategory('');
        setSelectedSubcategory('');
        setIsFlashSaleOnly(false);
        setSearchQuery('');
      } else {
        // Check if filter is a category slug or subcategory slug
        let foundCat = false;
        for (const cat of categories) {
          if (cat.slug === initialFilter || cat.id === initialFilter) {
            setSelectedCategory(cat.slug);
            setSelectedSubcategory('');
            setSearchQuery('');
            setIsFlashSaleOnly(false);
            setIsBestsellerOnly(false);
            foundCat = true;
            break;
          }
          if (cat.subcategories) {
            const sub = cat.subcategories.find((s) => s.slug === initialFilter || s.id === initialFilter);
            if (sub) {
              setSelectedCategory(cat.slug);
              setSelectedSubcategory(sub.slug);
              setSearchQuery('');
              setIsFlashSaleOnly(false);
              setIsBestsellerOnly(false);
              foundCat = true;
              break;
            }
          }
        }

        if (!foundCat) {
          setSearchQuery(initialFilter);
          setSelectedCategory('');
          setSelectedSubcategory('');
          setIsFlashSaleOnly(false);
          setIsBestsellerOnly(false);
        }
      }
    } else {
      // When navigating to All Products (no filter or category provided)
      setSelectedCategory('');
      setSelectedSubcategory('');
      setIsFlashSaleOnly(false);
      setIsBestsellerOnly(false);
      setSearchQuery('');
    }
  }, [initialFilter, initialCategory, categories]);

  // Fetch Categories and Initial Products
  useEffect(() => {
    async function loadShop() {
      setIsLoading(true);
      try {
        const [catsRes, prodsRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ limit: 100 })
        ]);
        if (catsRes?.success) setCategories(catsRes.categories);
        if (prodsRes?.success) setProducts(prodsRes.products);
      } catch (err) {
        console.error('Shop fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadShop();
  }, []);

  // Track search query with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    const timer = setTimeout(() => {
      tracker.trackSearch(searchQuery.trim());
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Find active category object
  const currentCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory) || null;
  }, [categories, selectedCategory]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category Filter
      if (selectedCategory) {
        const cat = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
        const targetId = cat ? cat.id : selectedCategory;
        const targetSlug = cat ? cat.slug : selectedCategory;

        const matchesCatId = p.category_id === targetId || p.category_id === targetSlug;
        const matchesCatSlug = p.category?.slug === targetSlug || p.category?.slug === targetId;
        const matchesCatObjId = p.category?.id === targetId;
        const matchesSubId = p.subcategory_id === targetId || p.subcategory?.slug === targetSlug;

        if (!matchesCatId && !matchesCatSlug && !matchesCatObjId && !matchesSubId) {
          return false;
        }
      }

      // Subcategory Filter
      if (selectedSubcategory) {
        const matchesSub = p.subcategory_id === selectedSubcategory ||
          p.subcategory?.slug === selectedSubcategory ||
          p.subcategory?.id === selectedSubcategory;
        if (!matchesSub) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesEn = p.name_en.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || (p.tags && p.tags.toLowerCase().includes(q));
        const matchesBn = p.name_bn.toLowerCase().includes(q);
        if (!matchesEn && !matchesBn) return false;
      }

      // Price
      const price = p.sale_price ?? p.regular_price;
      if (price < minPrice || price > maxPrice) return false;

      // In Stock
      if (inStockOnly && p.stock_quantity <= 0) return false;

      // Flash Sale
      if (isFlashSaleOnly && p.is_flash_sale !== 1) return false;

      // Bestseller
      if (isBestsellerOnly && p.is_bestseller !== 1) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.sale_price ?? a.regular_price;
      const priceB = b.sale_price ?? b.regular_price;

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'bestseller') return (b.is_bestseller || 0) - (a.is_bestseller || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0; // Default newest
    });
  }, [products, categories, selectedCategory, selectedSubcategory, searchQuery, minPrice, maxPrice, inStockOnly, isFlashSaleOnly, isBestsellerOnly, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(20000);
    setInStockOnly(false);
    setIsFlashSaleOnly(false);
    setIsBestsellerOnly(false);
    setSortBy('newest');
  };

  const activeFilterCount = (selectedCategory ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (isFlashSaleOnly ? 1 : 0) +
    (isBestsellerOnly ? 1 : 0) +
    (minPrice > 0 || maxPrice < 20000 ? 1 : 0);

  return (
    <div id="shop-page-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Breadcrumbs Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
            <button onClick={() => onNavigate('home')} className="hover:text-amber-600 transition-colors">
              {t('nav_home')}
            </button>
            <span>/</span>
            <button onClick={handleResetFilters} className="hover:text-amber-600 transition-colors">
              {t('nav_all_products')}
            </button>
            {currentCategoryObj && (
              <>
                <span>/</span>
                <span className="text-amber-800 font-bold font-siliguri">
                  {isBn && currentCategoryObj.name_bn ? currentCategoryObj.name_bn : currentCategoryObj.name_en}
                </span>
              </>
            )}
            {selectedSubcategory && (
              <>
                <span>/</span>
                <span className="text-slate-800 font-bold capitalize font-siliguri">
                  {(() => {
                    const sub = currentCategoryObj?.subcategories?.find(s => s.slug === selectedSubcategory || s.id === selectedSubcategory);
                    return isBn && sub?.name_bn ? sub.name_bn : sub?.name_en || selectedSubcategory;
                  })()}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 font-siliguri">
            {isFlashSaleOnly
              ? t('nav_flash_sale')
              : isBestsellerOnly
              ? t('best_sellers')
              : selectedSubcategory
              ? (() => {
                  const sub = currentCategoryObj?.subcategories?.find(s => s.slug === selectedSubcategory || s.id === selectedSubcategory);
                  return isBn && sub?.name_bn ? sub.name_bn : sub?.name_en || selectedSubcategory;
                })()
              : currentCategoryObj
              ? (isBn && currentCategoryObj.name_bn ? currentCategoryObj.name_bn : currentCategoryObj.name_en)
              : t('nav_all_products')}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-siliguri">
            {currentCategoryObj
              ? (isBn && currentCategoryObj.description_bn ? currentCategoryObj.description_bn : currentCategoryObj.description_en) || `${t('showing_products')}: ${filteredProducts.length} ${t('items')}`
              : `${t('showing_products')}: ${filteredProducts.length} ${t('items')}`}
          </p>
        </div>

        {/* Controls: Filters Button (Checkmark Position) & Sort Dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-2xs hover:border-slate-300 active:scale-95 font-siliguri"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('filter_by')}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2 text-xs shadow-2xs transition-all">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1 font-siliguri"
            >
              <option value="newest">{t('sort_newest')}</option>
              <option value="price_asc">{t('sort_price_asc')}</option>
              <option value="price_desc">{t('sort_price_desc')}</option>
              <option value="bestseller">{t('sort_bestseller')}</option>
              <option value="rating">{t('sort_rating')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subcategory Pills if active category has subcategories */}
      {currentCategoryObj?.subcategories && currentCategoryObj.subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedSubcategory('')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shadow-2xs font-siliguri ${
              !selectedSubcategory
                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isBn ? `সকল ${currentCategoryObj.name_bn || currentCategoryObj.name_en}` : `All ${currentCategoryObj.name_en}`}
          </button>
          {currentCategoryObj.subcategories.map((sub) => {
            const isSubSelected = selectedSubcategory === sub.slug || selectedSubcategory === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(isSubSelected ? '' : sub.slug)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shadow-2xs font-siliguri ${
                  isSubSelected
                    ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{isBn && sub.name_bn ? sub.name_bn : sub.name_en}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Layout (Sidebar + Product Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                <span>{t('filter_by')}</span>
              </h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('clear_filters')}</span>
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="text-sm font-bold text-slate-800 block mb-2 font-siliguri">
                {t('search_by_keyword')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder_short')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-siliguri placeholder:text-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories List in Sidebar */}
            <div>
              <label className="text-sm font-bold text-slate-800 block mb-2 font-siliguri">
                {t('all_categories')}
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between font-siliguri font-normal ${
                    selectedCategory === '' && selectedSubcategory === ''
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{t('all_categories')}</span>
                  </span>
                  <span className="text-xs font-mono opacity-80 font-normal">({products.length})</span>
                </button>
                {categories.map((c) => {
                  const isSelected = selectedCategory === c.slug || selectedCategory === c.id;
                  const catCount = products.filter(
                    (p) => p.category_id === c.id || p.category?.slug === c.slug || p.category_id === c.slug
                  ).length;

                  return (
                    <div key={c.id} className="space-y-1">
                      <button
                        onClick={() => {
                          setSelectedCategory(c.slug);
                          setSelectedSubcategory('');
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between font-siliguri font-normal ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="truncate">{isBn && c.name_bn ? c.name_bn : c.name_en}</span>
                        </span>
                        <span className="text-xs font-mono opacity-80 font-normal">({catCount})</span>
                      </button>

                      {/* Subcategories in sidebar */}
                      {isSelected && c.subcategories && c.subcategories.length > 0 && (
                        <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-amber-300 ml-3">
                          {c.subcategories.map((sub) => {
                            const isSubActive = selectedSubcategory === sub.slug || selectedSubcategory === sub.id;
                            const subCount = products.filter(
                              (p) => p.subcategory_id === sub.id || p.subcategory?.slug === sub.slug
                            ).length;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => setSelectedSubcategory(isSubActive ? '' : sub.slug)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-normal transition-colors flex items-center justify-between font-siliguri ${
                                  isSubActive
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                              >
                                <span className="truncate">• {isBn && sub.name_bn ? sub.name_bn : sub.name_en}</span>
                                {subCount > 0 && <span className="text-[10px] font-mono opacity-80 font-normal">({subCount})</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between text-sm font-bold text-slate-800 mb-2 font-siliguri">
                <span>{t('price_range')}</span>
                <span className="text-amber-800 font-mono font-black text-sm">৳{minPrice} - ৳{maxPrice}</span>
              </div>
              <input
                type="range"
                min="0"
                max="20000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1.5 font-mono font-medium">
                <span>৳0</span>
                <span>৳10,000</span>
                <span>৳20,000+</span>
              </div>
            </div>

            {/* Special Checkboxes */}
            <div className="space-y-2.5 pt-3.5 border-t border-slate-100 font-siliguri">
              <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 cursor-pointer hover:text-slate-950">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <span>{t('in_stock_only')}</span>
              </label>

              <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 cursor-pointer hover:text-slate-950">
                <input
                  type="checkbox"
                  checked={isFlashSaleOnly}
                  onChange={(e) => {
                    setIsFlashSaleOnly(e.target.checked);
                    if (e.target.checked) setSelectedCategory('');
                  }}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-rose-600 font-bold">{t('nav_flash_sale')} ⚡</span>
              </label>

              <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 cursor-pointer hover:text-slate-950">
                <input
                  type="checkbox"
                  checked={isBestsellerOnly}
                  onChange={(e) => {
                    setIsBestsellerOnly(e.target.checked);
                    if (e.target.checked) setSelectedCategory('');
                  }}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <span>{t('best_sellers')}</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 aspect-3/4 animate-pulse flex flex-col justify-between">
                  <div className="bg-slate-100 rounded-xl h-48 w-full" />
                  <div className="space-y-2 mt-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-siliguri">
                {t('no_products_title')}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-noto font-description">
                {t('no_products_desc')}
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors inline-flex items-center gap-1.5 font-siliguri"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('clear_filters')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-siliguri">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                <span>{t('filter_by')}</span>
              </h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-5 flex-1 font-siliguri">
              {/* Category selector in mobile drawer */}
              <div>
                <label className="text-sm font-bold text-slate-800 block mb-2 font-siliguri">
                  {t('all_categories')}
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedSubcategory('');
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-normal font-siliguri ${
                      selectedCategory === '' && selectedSubcategory === ''
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {t('all_categories')}
                  </button>
                  {categories.map((c) => {
                    const isSelected = selectedCategory === c.slug || selectedCategory === c.id;
                    return (
                      <div key={c.id} className="space-y-1">
                        <button
                          onClick={() => {
                            setSelectedCategory(c.slug);
                            setSelectedSubcategory('');
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-normal flex items-center justify-between font-siliguri ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{isBn && c.name_bn ? c.name_bn : c.name_en}</span>
                          </span>
                        </button>
                        {isSelected && c.subcategories && c.subcategories.length > 0 && (
                          <div className="pl-6 space-y-1 border-l-2 border-amber-300 ml-3 py-1">
                            {c.subcategories.map((sub) => {
                              const isSubActive = selectedSubcategory === sub.slug || selectedSubcategory === sub.id;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => {
                                    setSelectedSubcategory(isSubActive ? '' : sub.slug);
                                    setIsMobileFilterOpen(false);
                                  }}
                                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-normal transition-colors font-siliguri ${
                                    isSubActive
                                      ? 'bg-slate-900 text-white shadow-xs'
                                      : 'text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  • {isBn && sub.name_bn ? sub.name_bn : sub.name_en}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2 font-siliguri">
              <button
                onClick={() => {
                  handleResetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                {t('clear_filters')}
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-950 bg-amber-500 rounded-xl hover:bg-amber-400"
              >
                {t('apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

