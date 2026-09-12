import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Zap,
  Star,
  CheckCircle2,
  X,
  SlidersHorizontal,
  Upload,
  AlertCircle,
  Eye,
  Package,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Tag,
  ChevronRight,
  ChevronLeft,
  LayoutList,
  Check,
  Palette,
  ImagePlus,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { Product, Category, ProductVariant } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { ImageUploadField } from './ImageUploadField.tsx';

const COLOR_PRESETS = [
  { name: 'Black', name_bn: 'কালো', hex: '#111827' },
  { name: 'White', name_bn: 'সাদা', hex: '#FFFFFF' },
  { name: 'Red', name_bn: 'লাল', hex: '#EF4444' },
  { name: 'Blue', name_bn: 'নীল', hex: '#2563EB' },
  { name: 'Navy Blue', name_bn: 'নেভি ব্লু', hex: '#1E3A8A' },
  { name: 'Green', name_bn: 'সবুজ', hex: '#10B981' },
  { name: 'Yellow', name_bn: 'হলুদ', hex: '#F59E0B' },
  { name: 'Maroon', name_bn: 'মেরুন', hex: '#831843' },
  { name: 'Pink', name_bn: 'গোলাপি', hex: '#EC4899' },
  { name: 'Grey', name_bn: 'ধূসর', hex: '#6B7280' },
  { name: 'Brown', name_bn: 'বাদামি', hex: '#78350F' },
  { name: 'Orange', name_bn: 'কমলা', hex: '#F97316' },
  { name: 'Purple', name_bn: 'বেগুনি', hex: '#7C3AED' }
];

export const AdminProducts: React.FC = () => {
  const { t, isBn } = useLanguage();
  const { formatPrice } = useSettings();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Quick subcategory creation state inside product modal
  const [showQuickAddSub, setShowQuickAddSub] = useState(false);
  const [quickSubName, setQuickSubName] = useState('');
  const [isAddingSub, setIsAddingSub] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState<any>({
    name_en: '',
    name_bn: '',
    slug: '',
    sku: '',
    brand: '',
    category_id: '',
    subcategory_id: '',
    regular_price: 0,
    sale_price: null,
    stock_quantity: 10,
    low_stock_threshold: 3,
    weight: 0.5,
    short_description_en: '',
    short_description_bn: '',
    description_en: '',
    description_bn: '',
    thumbnail: '',
    images: [] as string[],
    is_featured: 0,
    is_bestseller: 0,
    is_flash_sale: 0,
    flash_sale_end: '',
    status: 'active',
    variants: [] as ProductVariant[]
  });

  // Enable/Disable Variants toggle for Simple Products vs Fashion/Variable Products
  const [hasVariants, setHasVariants] = useState<boolean>(false);

  const [imageInputUrl, setImageInputUrl] = useState('');

  // Bulk Multi-Size Generator for a specific Color
  const [showMultiSizeHelper, setShowMultiSizeHelper] = useState(false);
  const [bulkColor, setBulkColor] = useState('Black');
  const [bulkColorCode, setBulkColorCode] = useState('#111827');
  const [bulkSizes, setBulkSizes] = useState<string[]>(['M', 'L', 'XL', 'XXL']);
  const [bulkCustomSize, setBulkCustomSize] = useState('');
  const [bulkStock, setBulkStock] = useState(10);
  const [bulkImage, setBulkImage] = useState('');

  // Personal Product Protection & Demo Management
  const [isClearingDemo, setIsClearingDemo] = useState(false);
  const [showClearDemoModal, setShowClearDemoModal] = useState(false);
  const [demoActionStatus, setDemoActionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const demoProductsList = products.filter(
    (p) =>
      p.is_demo === 1 ||
      (p.id && (p.id.startsWith('prod_men_') || p.id.startsWith('prod_w_') || p.id.startsWith('prod_k_') || p.id.startsWith('prod_wat_') || p.id.startsWith('prod_gad_')))
  );
  const demoProductsCount = demoProductsList.length;
  const userProductsCount = products.length - demoProductsCount;

  const handleClearDemoProducts = async () => {
    setIsClearingDemo(true);
    setDemoActionStatus(null);
    try {
      const res = await api.clearDemoProducts();
      if (res.success) {
        setDemoActionStatus({ type: 'success', message: res.message || 'সকল ডেমো প্রডাক্ট সফলভাবে মুছে ফেলা হয়েছে।' });
        setShowClearDemoModal(false);
        await loadData();
      } else {
        setDemoActionStatus({ type: 'error', message: res.message || 'ডেমো প্রডাক্ট মুছতে ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      console.error('Clear demo error:', err);
      setDemoActionStatus({ type: 'error', message: 'ডেমো প্রডাক্ট মুছে ফেলার সময় সমস্যা হয়েছে।' });
    } finally {
      setIsClearingDemo(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getAdminProducts({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
          search: searchQuery || undefined
        }),
        api.getCategories()
      ]);

      if (catRes.success) setCategories(catRes.categories || []);

      if (prodRes.success) {
        let loadedProducts: Product[] = prodRes.products || [];
        const loadedCats: Category[] = catRes.success ? (catRes.categories || []) : [];
        if (loadedCats.length > 0 && selectedCategory === 'all' && !searchQuery) {
          const catOrderMap = new Map<string, number>();
          loadedCats.forEach((c, idx) => {
            catOrderMap.set(c.id, typeof c.sort_order === 'number' ? c.sort_order : idx + 1);
          });
          loadedProducts = [...loadedProducts].sort((a, b) => {
            const catA = catOrderMap.get(a.category_id || (a.category ? a.category.id : '')) ?? 999;
            const catB = catOrderMap.get(b.category_id || (b.category ? b.category.id : '')) ?? 999;
            if (catA !== catB) return catA - catB;
            const subA = (a.subcategory_id || (a.subcategory ? a.subcategory.id : '')) || '';
            const subB = (b.subcategory_id || (b.subcategory ? b.subcategory.id : '')) || '';
            if (subA !== subB) return subA.localeCompare(subB);
            return (a.id || '').localeCompare(b.id || '');
          });
        }
        setProducts(loadedProducts);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedSubcategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setShowQuickAddSub(false);
    setQuickSubName('');
    setHasVariants(false);
    const firstCat = categories[0]?.id || '';
    setFormData({
      name_en: '',
      name_bn: '',
      slug: '',
      sku: `SN-${Math.floor(1000 + Math.random() * 9000)}`,
      brand: 'SHOPNOVA Luxury',
      category_id: firstCat,
      subcategory_id: '',
      regular_price: 1500,
      sale_price: 1200,
      stock_quantity: 25,
      low_stock_threshold: 5,
      weight: 0.5,
      short_description_en: '',
      short_description_bn: '',
      description_en: '',
      description_bn: '',
      thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
      images: [],
      is_featured: 1,
      is_bestseller: 0,
      is_flash_sale: 0,
      flash_sale_end: '',
      status: 'active',
      variants: []
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setShowQuickAddSub(false);
    setQuickSubName('');
    const productHasVariants = Array.isArray(p.variants) && p.variants.length > 0;
    setHasVariants(productHasVariants);
    setFormData({
      ...p,
      category_id: p.category_id || (p.category ? p.category.id : ''),
      subcategory_id: p.subcategory_id || (p.subcategory ? p.subcategory.id : '') || '',
      variants: p.variants || [],
      images: p.images || []
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleQuickAddSubcategory = async () => {
    if (!formData.category_id || !quickSubName.trim()) return;
    setIsAddingSub(true);
    try {
      const res = await api.addSubcategory(formData.category_id, {
        name_en: quickSubName.trim(),
        name_bn: quickSubName.trim()
      });
      const catRes = await api.getCategories();
      if (catRes.success) setCategories(catRes.categories || []);
      if (res && res.subcategoryId) {
        setFormData((prev: any) => ({ ...prev, subcategory_id: res.subcategoryId }));
      }
      setQuickSubName('');
      setShowQuickAddSub(false);
    } catch (err: any) {
      console.error('Failed to quick add subcategory:', err);
      setFormError(err.message || 'Failed to add subcategory.');
    } finally {
      setIsAddingSub(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name_en.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (!formData.category_id) {
      setFormError('Please select a category.');
      return;
    }
    if (!formData.regular_price || formData.regular_price <= 0) {
      setFormError('Regular price must be greater than 0.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        variants: hasVariants ? formData.variants : [],
        subcategory_id: formData.subcategory_id || null,
        name_bn: formData.name_bn || formData.name_en
      };
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteProduct(productToDelete.id);
      setSelectedIds((prev) => prev.filter((id) => id !== productToDelete.id));
      setProductToDelete(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        isBn
          ? `আপনি কি নির্বাচিত ${selectedIds.length} টি প্রডাক্ট মুছে ফেলতে নিশ্চিত?`
          : `Are you sure you want to delete ${selectedIds.length} selected products?`
      )
    )
      return;
    setIsBulkDeleting(true);
    try {
      await api.bulkProductAction({ action: 'delete', ids: selectedIds });
      setSelectedIds([]);
      loadData();
    } catch (err) {
      console.error('Failed to bulk delete products:', err);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddImage = () => {
    if (imageInputUrl.trim()) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), imageInputUrl.trim()]
      });
      setImageInputUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...formData.images];
    updated.splice(index, 1);
    setFormData({ ...formData, images: updated });
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      product_id: editingProduct?.id || '',
      size: 'Free Size',
      color: 'Black',
      color_code: '#111827',
      price_adjustment: 0,
      stock_quantity: 10,
      image: '',
      sku: ''
    };
    setFormData({
      ...formData,
      variants: [...formData.variants, newVariant]
    });
  };

  const handleDuplicateVariant = (index: number) => {
    const original = formData.variants[index];
    if (!original) return;
    const duplicated: ProductVariant = {
      ...original,
      id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sku: original.sku ? `${original.sku}-copy` : ''
    };
    const updated = [...formData.variants];
    updated.splice(index + 1, 0, duplicated);
    setFormData({ ...formData, variants: updated });
  };

  const handleRemoveVariant = (index: number) => {
    const updated = [...formData.variants];
    updated.splice(index, 1);
    setFormData({ ...formData, variants: updated });
  };

  const handleVariantImageUpload = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const copy = [...formData.variants];
        copy[index] = { ...copy[index], image: result };
        setFormData({ ...formData, variants: copy });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBulkImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) setBulkImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleBulkSize = (sizeName: string) => {
    if (bulkSizes.includes(sizeName)) {
      setBulkSizes(bulkSizes.filter((s) => s !== sizeName));
    } else {
      setBulkSizes([...bulkSizes, sizeName]);
    }
  };

  const handleAddCustomBulkSize = () => {
    if (bulkCustomSize.trim() && !bulkSizes.includes(bulkCustomSize.trim())) {
      setBulkSizes([...bulkSizes, bulkCustomSize.trim()]);
      setBulkCustomSize('');
    }
  };

  const handleGenerateBulkSizes = () => {
    if (bulkSizes.length === 0) return;
    const newVariants: ProductVariant[] = bulkSizes.map((sz, idx) => ({
      id: `var_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      product_id: editingProduct?.id || '',
      size: sz.trim(),
      color: bulkColor.trim() || 'Black',
      color_code: bulkColorCode || '#111827',
      price_adjustment: 0,
      stock_quantity: Number(bulkStock) || 10,
      image: bulkImage || '',
      sku: ''
    }));

    setFormData({
      ...formData,
      variants: [...formData.variants, ...newVariants]
    });
    setShowMultiSizeHelper(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-4 rounded-3xl">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex flex-wrap sm:flex-nowrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? "প্রোডাক্টের নাম বা এসকেইউ দিয়ে খুঁজুন..." : "Search by name or SKU..."}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory('all');
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">{isBn ? "সকল ক্যাটাগরি" : "All Categories"}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {isBn ? (c.name_bn || c.name_en) : c.name_en}
              </option>
            ))}
          </select>

          {/* Subcategory Filter Dropdown */}
          {selectedCategory !== 'all' && (
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="bg-slate-900 border border-amber-500/40 text-amber-400 font-medium rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="all">{isBn ? "সকল সাব-ক্যাটাগরি" : "All Subcategories"}</option>
              {(categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory)?.subcategories || []).map((sub) => (
                <option key={sub.id} value={sub.slug || sub.id}>
                  {isBn ? (sub.name_bn || sub.name_en) : sub.name_en}
                </option>
              ))}
            </select>
          )}
        </form>

        <button
          onClick={handleOpenCreateModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isBn ? "নতুন প্রোডাক্ট যোগ করুন" : "Add New Product"}</span>
        </button>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-rose-950/80 border border-rose-800/80 rounded-2xl p-3.5 px-5 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs text-rose-200 font-bold">
            <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-mono">
              {selectedIds.length}
            </span>
            <span>{isBn ? "টি প্রডাক্ট নির্বাচিত করা হয়েছে" : "products selected"}</span>
          </div>

          <button
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {isBulkDeleting
                ? (isBn ? "মুছে ফেলা হচ্ছে..." : "Deleting...")
                : (isBn ? "নির্বাচিত প্রডাক্টসমূহ মুছে ফেলুন" : "Delete Selected Products")}
            </span>
          </button>
        </div>
      )}

      {/* Personal Product Safeguard & Demo Cleanup Notice Banner */}
      <div className="bg-[#14171E] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-white">
                {isBn ? 'ব্যক্তিগত পণ্য ও কাস্টমাইজেশন সুরক্ষা সক্রিয়' : 'Personal Product & Customization Safeguard Active'}
              </h4>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {isBn ? 'সুরক্ষিত ডেটাবেস' : 'Protected DB'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {isBn
                ? `আপনার আপলোড করা পণ্য (${userProductsCount}টি) এবং সেটিংস কঠোরভাবে সুরক্ষিত। সার্ভার রিস্টার্ট হলেও আপনার নিজস্ব পণ্য কখনোই মুছে যাবে না বা ডিফল্ট দিয়ে ওভাররাইট হবে না।`
                : `Your custom uploaded products (${userProductsCount}) and settings are permanently safe. They will never be wiped or overwritten on server restarts.`}
            </p>
          </div>
        </div>

        {demoProductsCount > 0 ? (
          <div className="flex items-center gap-2 shrink-0 self-stretch md:self-auto justify-end">
            <button
              type="button"
              onClick={() => setShowClearDemoModal(true)}
              disabled={isClearingDemo}
              className="px-3.5 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{isBn ? `সকল ডেমো পণ্য মুছুন (${demoProductsCount}টি)` : `Clear All Demo Products (${demoProductsCount})`}</span>
            </button>
          </div>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isBn ? 'স্টোরে কোনো ডেমো পণ্য নেই (১০০% নিজস্ব)' : 'No Demo Products (100% Personal)'}</span>
          </div>
        )}
      </div>

      {demoActionStatus && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn border ${
          demoActionStatus.type === 'success'
            ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
            : 'bg-rose-950/70 border-rose-800 text-rose-300'
        }`}>
          {demoActionStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{demoActionStatus.message}</span>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold">
            {isBn ? "প্রোডাক্ট লোড হচ্ছে..." : "Loading products..."}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-xs text-slate-400">
              {isBn ? "কোনো প্রোডাক্ট পাওয়া যায়নি।" : "No products found matching query."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3 pr-2 w-8">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedIds.length === products.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                      title={isBn ? "সবকটি নির্বাচন করুন" : "Select All"}
                    />
                  </th>
                  <th className="pb-3">{isBn ? "প্রোডাক্ট" : "Product"}</th>
                  <th className="pb-3">{isBn ? "এসকেইউ / ব্র্যান্ড" : "SKU / Brand"}</th>
                  <th className="pb-3">{isBn ? "ক্যাটাগরি ও সাব-ক্যাটাগরি" : "Category & Subcategory"}</th>
                  <th className="pb-3">{isBn ? "মূল্য" : "Price"}</th>
                  <th className="pb-3">{isBn ? "স্টক" : "Stock"}</th>
                  <th className="pb-3">{isBn ? "স্ট্যাটাস / ট্যাগ" : "Status / Tags"}</th>
                  <th className="pb-3 text-right">{isBn ? "অ্যাকশন" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-900/50 transition-colors">
                    {/* Checkbox */}
                    <td className="py-3 pr-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(prod.id)}
                        onChange={() => handleToggleSelect(prod.id)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                      />
                    </td>

                    {/* Thumbnail & Title */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.thumbnail}
                          alt={prod.name_en}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-white truncate">
                              {isBn ? (prod.name_bn || prod.name_en) : prod.name_en}
                            </p>
                            {(prod.is_demo === 1 || (prod.id && (prod.id.startsWith('prod_men_') || prod.id.startsWith('prod_w_') || prod.id.startsWith('prod_k_') || prod.id.startsWith('prod_wat_') || prod.id.startsWith('prod_gad_')))) ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono shrink-0">
                                {isBn ? 'ডিফল্ট ডেমো' : 'Demo'}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono shrink-0">
                                {isBn ? 'ব্যক্তিগত পণ্য' : 'Personal'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SKU & Brand */}
                    <td className="py-3 text-slate-300">
                      <span className="font-mono text-amber-400 font-bold block">{prod.sku}</span>
                      <span className="text-[11px] text-slate-500">{prod.brand}</span>
                    </td>

                    {/* Category & Subcategory */}
                    <td className="py-3 text-slate-300">
                      <div className="space-y-1">
                        <div className="font-semibold text-white">
                          {isBn ? (prod.category?.name_bn || prod.category?.name_en || '—') : (prod.category?.name_en || '—')}
                        </div>
                        {prod.subcategory && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-900 text-amber-400 border border-slate-800 px-2 py-0.5 rounded font-mono">
                            <span className="text-slate-500">↳</span>
                            <span>{isBn ? (prod.subcategory.name_bn || prod.subcategory.name_en) : prod.subcategory.name_en}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3">
                      <div className="font-black text-amber-400">
                        {formatPrice(prod.sale_price ?? prod.regular_price)}
                      </div>
                      {prod.sale_price && (
                        <span className="text-[10px] text-slate-500 line-through">
                          {formatPrice(prod.regular_price)}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          prod.stock_quantity <= 0
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                            : prod.stock_quantity <= (prod.low_stock_threshold || 5)
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {isBn
                          ? `${prod.stock_quantity} টি স্টকে আছে`
                          : `${prod.stock_quantity} in stock`}
                      </span>
                    </td>

                    {/* Tags */}
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        {prod.is_featured === 1 && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                            {isBn ? "ফিচার্ড" : "Featured"}
                          </span>
                        )}
                        {prod.is_flash_sale === 1 && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500 text-white flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5 fill-current" /> {isBn ? "ফ্ল্যাশ সেল" : "Flash"}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="px-2.5 py-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-1.5 transition-colors font-bold text-[11px]"
                          title={isBn ? "প্রোডাক্ট সম্পাদন করুন" : "Edit Product Details"}
                        >
                          <Edit2 className="w-3 h-3 text-amber-400" />
                          <span>{isBn ? "সম্পাদনা" : "Edit"}</span>
                        </button>
                        <button
                          onClick={() => setProductToDelete(prod)}
                          className="px-2.5 py-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/60 rounded-xl flex items-center gap-1.5 transition-colors font-bold text-[11px]"
                          title={isBn ? "প্রোডাক্ট মুছে ফেলুন" : "Delete Product"}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{isBn ? "মুছুন" : "Delete"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Product Multi-Tab Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {editingProduct
                      ? (isBn ? 'প্রোডাক্টের বিবরণ সম্পাদনা করুন' : 'Edit Product Details')
                      : (isBn ? 'নতুন প্রোডাক্ট যুক্ত করুন' : 'Create New Product')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isBn
                      ? 'সকল তথ্য, মূল্য, স্টক ও ছবি সঠিকভাবে পূরণ করুন'
                      : 'Fill in product info, pricing, stock and images'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title={isBn ? "বন্ধ করুন" : "Close"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick-Jump Navigation Bar (All sections stay visible, clicking scrolls smoothly to that section) */}
            <div className="shrink-0 bg-[#0E121A] border-b border-slate-800 px-4 py-3 overflow-x-auto scrollbar-thin">
              <div className="flex items-center gap-2 min-w-max">
                {[
                  {
                    id: 'section-details',
                    icon: Package,
                    num: isBn ? '১' : '1',
                    label: isBn ? 'প্রোডাক্ট বিবরণ' : 'Product Details'
                  },
                  {
                    id: 'section-pricing',
                    icon: DollarSign,
                    num: isBn ? '২' : '2',
                    label: isBn ? 'মূল্য ও স্টক' : 'Pricing & Stock'
                  },
                  {
                    id: 'section-variants',
                    icon: Layers,
                    num: isBn ? '৩' : '3',
                    label: isBn ? 'ভ্যারিয়েন্ট' : 'Variants (Size/Color)'
                  },
                  {
                    id: 'section-images',
                    icon: ImageIcon,
                    num: isBn ? '৪' : '4',
                    label: isBn ? 'গ্যালারি ছবি' : 'Gallery Images'
                  },
                  {
                    id: 'section-badges',
                    icon: Tag,
                    num: isBn ? '৫' : '5',
                    label: isBn ? 'ফ্ল্যাশ সেল ও ট্যাগ' : 'Flash Sale & Tags'
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(item.id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-800 hover:border-amber-400 transition-all cursor-pointer shadow-xs group"
                    >
                      <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black bg-slate-800 text-amber-400 group-hover:bg-slate-950 group-hover:text-amber-400 shrink-0">
                        {item.num}
                      </span>
                      <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-950 shrink-0" />
                      <span className="whitespace-nowrap font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Body Form - All 5 sections are continuously visible with no hiding */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs scroll-smooth">
              {formError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-400 font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Basic Details */}
              <div id="section-details" className="space-y-4 bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80 scroll-mt-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400 font-black text-sm">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">
                    {isBn ? '১' : '1'}
                  </div>
                  <Package className="w-4 h-4" />
                  <span>{isBn ? 'প্রোডাক্ট বিবরণ' : 'Product Details'}</span>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'প্রোডাক্টের নাম (ইংরেজিতে) *' : 'Product Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder={isBn ? "যেমন: Royal Emerald Chronograph Watch" : "e.g. Royal Emerald Chronograph Watch"}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'প্রোডাক্টের নাম (বাংলায় - ঐচ্ছিক)' : 'Product Name (Bengali - Optional)'}
                  </label>
                  <input
                    type="text"
                    value={formData.name_bn || ''}
                    onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                    placeholder={isBn ? "যেমন: প্রিমিয়াম ক্রোনোগ্রাফ ঘড়ি" : "e.g. প্রিমিয়াম ক্রোনোগ্রাফ ঘড়ি"}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      {isBn ? 'এসকেইউ কোড *' : 'SKU Code *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="SN-1001"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      {isBn ? 'ব্র্যান্ডের নাম *' : 'Brand Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="SHOPNOVA Luxury"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      {isBn ? 'ক্যাটাগরি নির্বাচন করুন *' : 'Select Category *'}
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => {
                        const newCatId = e.target.value;
                        setFormData({ ...formData, category_id: newCatId, subcategory_id: '' });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                    >
                      <option value="">{isBn ? '-- ক্যাটাগরি নির্বাচন করুন --' : '-- Select Category --'}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {isBn ? (c.name_bn || c.name_en) : c.name_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-bold block">
                        {isBn ? 'সাব-ক্যাটাগরি (ঐচ্ছিক)' : 'Subcategory (Optional)'}
                      </label>
                      {formData.category_id && (
                        <button
                          type="button"
                          onClick={() => setShowQuickAddSub(!showQuickAddSub)}
                          className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isBn ? 'নতুন সাব-ক্যাটাগরি' : 'Add New'}</span>
                        </button>
                      )}
                    </div>
                    <select
                      value={formData.subcategory_id || ''}
                      onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                      disabled={!formData.category_id}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">-None-</option>
                      {(categories.find((c) => c.id === formData.category_id)?.subcategories || []).map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {isBn ? (sub.name_bn || sub.name_en) : sub.name_en}
                        </option>
                      ))}
                    </select>

                    {/* Quick Add Subcategory inline popup */}
                    {showQuickAddSub && formData.category_id && (
                      <div className="mt-2 p-2 bg-slate-950 border border-amber-500/40 rounded-xl flex items-center gap-2 animate-in fade-in">
                        <input
                          type="text"
                          value={quickSubName}
                          onChange={(e) => setQuickSubName(e.target.value)}
                          placeholder={isBn ? "নতুন সাব-ক্যাটাগরির নাম..." : "New subcategory name..."}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleQuickAddSubcategory();
                            }
                          }}
                        />
                        <button
                          type="button"
                          disabled={isAddingSub || !quickSubName.trim()}
                          onClick={handleQuickAddSubcategory}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs transition-colors shrink-0 disabled:opacity-50"
                        >
                          {isAddingSub ? (isBn ? 'যোগ হচ্ছে...' : 'Adding...') : (isBn ? 'যোগ করুন' : 'Add')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <ImageUploadField
                    label={isBn ? "থাম্বনেইল / মূল ছবি *" : "Thumbnail Image *"}
                    value={formData.thumbnail || ''}
                    onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                    placeholder="https://images.unsplash.com/photo-..."
                    helpText={isBn ? "ডিভাইস থেকে ফাইল আপলোড করুন অথবা অনলাইন লিঙ্ক দিন।" : "Upload from your device or paste an image URL."}
                    recommendedSize="800 x 800 px (Square 1:1)"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'সংক্ষিপ্ত বিবরণ' : 'Short Description'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.short_description_en || ''}
                    onChange={(e) => setFormData({ ...formData, short_description_en: e.target.value })}
                    placeholder={isBn ? "প্রোডাক্টের সংক্ষিপ্ত এক-দুই লাইনের বিবরণ" : "Short 1-2 line product summary"}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'বিস্তারিত বিবরণ' : 'Full Description'}
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description_en || ''}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    placeholder={isBn ? "প্রোডাক্টের বিস্তারিত তথ্য ও বৈশিষ্ট্য..." : "Full product features and description..."}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              {/* Section 2: Pricing & Stock */}
              <div id="section-pricing" className="space-y-4 bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80 scroll-mt-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400 font-black text-sm">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">
                    {isBn ? '২' : '2'}
                  </div>
                  <DollarSign className="w-4 h-4" />
                  <span>{isBn ? 'মূল্য ও স্টক' : 'Pricing & Stock'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      {isBn ? 'নিয়মিত মূল্য (৳) *' : 'Regular Price (৳) *'}
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.regular_price}
                      onChange={(e) => setFormData({ ...formData, regular_price: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      {isBn ? 'অফার / সেল মূল্য (৳ - ঐচ্ছিক)' : 'Sale / Discount Price (৳ - Optional)'}
                    </label>
                    <input
                      type="number"
                      value={formData.sale_price || ''}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value ? Number(e.target.value) : null })}
                      placeholder={isBn ? "যেমন: ১২০০" : "e.g. 1200"}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      {isBn ? 'প্রাথমিক স্টক পরিমাণ *' : 'Base Stock Quantity *'}
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      {isBn ? 'লো স্টক অ্যালার্ট সীমা' : 'Low Stock Alert Threshold'}
                    </label>
                    <input
                      type="number"
                      value={formData.low_stock_threshold}
                      onChange={(e) => setFormData({ ...formData, low_stock_threshold: Number(e.target.value) })}
                      placeholder="5"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Variants Manager with Enable/Disable Switch */}
              <div id="section-variants" className="space-y-4 bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80 scroll-mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">
                      {isBn ? '৩' : '3'}
                    </div>
                    <Layers className="w-4 h-4" />
                    <span>{isBn ? 'ভ্যারিয়েন্ট - সাইজ ও কালার' : 'Variants (Color, Size & Photo)'}</span>
                  </div>

                  {/* Enable / Disable Toggle Switch */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-300">
                      {isBn ? 'এই পণ্যে কালার/সাইজ আছে কি?' : 'Has Color/Size Variants?'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !hasVariants;
                        setHasVariants(nextState);
                        if (nextState && formData.variants.length === 0) {
                          // Auto-add first variant for user convenience
                          handleAddVariant();
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        hasVariants ? 'bg-amber-500' : 'bg-slate-800'
                      }`}
                      role="switch"
                      aria-checked={hasVariants}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          hasVariants ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                      hasVariants
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {hasVariants ? (isBn ? 'চালু (Enabled)' : 'Enabled') : (isBn ? 'বন্ধ (Disabled)' : 'Disabled')}
                    </span>
                  </div>
                </div>

                {!hasVariants ? (
                  /* Disabled state: Clean, non-distracting message for simple products */
                  <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 justify-center sm:justify-start">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>
                          {isBn
                            ? 'এটি একটি একক পণ্য (Simple Product) হিসেবে আপলোড হবে'
                            : 'This product will be saved as a Simple Product'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isBn
                          ? 'মধু, ঘড়ি, বই, ইলেকট্রনিক্স বা যেকোনো সাধারণ পণ্যের ক্ষেত্রে ভ্যারিয়েন্ট বন্ধ রাখাই উপযুক্ত। ২ নম্বর সেকশনে দেওয়া মূল্যের ও স্টকেই এটি বিক্রি হবে।'
                          : 'Ideal for items like honey, books, single-model gadgets, or accessories that don’t require size or color options.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHasVariants(true);
                        if (formData.variants.length === 0) handleAddVariant();
                      }}
                      className="shrink-0 bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 hover:border-amber-500/40 transition-all cursor-pointer"
                    >
                      {isBn ? 'কালার / সাইজ চালু করুন' : 'Enable Color / Size'}
                    </button>
                  </div>
                ) : (
                  /* Enabled state: Full Variant controls with Bulk helper */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-slate-400 text-[11px]">
                        {isBn
                          ? 'ফ্যাশন পণ্য, জুতো বা পোশাকের জন্য বিভিন্ন কালার, সাইজ ও প্রতিটি কালারের জন্য ছবি যোগ করুন।'
                          : 'Configure specific colors, sizes, stock counts, and photos for this fashion item.'}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setShowMultiSizeHelper(!showMultiSizeHelper)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isBn ? '⚡ এক কালারে একাধিক সাইজ তৈরি করুন' : '⚡ Bulk Sizes for One Color'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleAddVariant}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border border-slate-700 transition-all text-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isBn ? '+ একক ভ্যারিয়েন্ট' : '+ Single Variant'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 text-xs text-amber-200 leading-relaxed font-siliguri space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                        <span>💡</span>
                        <span>{isBn ? 'একই কালারের একাধিক সাইজ (যেমন: Black কালারে M, L, XL, XXL) কীভাবে করবেন?' : 'Multiple Sizes for the Same Color:'}</span>
                      </div>
                      <p className="text-slate-300">
                        {isBn
                          ? 'আপনাকে প্রতিটা সাইজের জন্য বারবার ছবি আপলোড করতে হবে না! কালারটির ছবি একবারই আপলোড করতে হবে। আপনি উপরের "⚡ এক কালারে একাধিক সাইজ তৈরি করুন" বাটনে চাপ দিয়ে Black নির্বাচন করে সাইজগুলো (M, L, XL, XXL) একসাথে সিলেক্ট করে ১ ক্লিকেই তৈরি করে ফেলতে পারেন। অথবা একটি ভ্যারিয়েন্ট বানিয়ে তার পাশের "ডুপ্লিকেট (Copy)" বাটনে চাপলে সেই কালার ও ছবি অপরিবর্তিত রেখে নতুন সাইজ যোগ হয়ে যাবে।'
                          : 'You do NOT need to upload the image repeatedly! Upload the color photo once. Use "Bulk Sizes for One Color" to select all sizes at once with one image, or duplicate any variant and simply change the size!'}
                      </p>
                    </div>

                {/* Bulk Multi-Size Generator Panel */}
                {showMultiSizeHelper && (
                  <div className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>{isBn ? 'একই কালারে একাধিক সাইজ জেনারেটর' : 'Bulk Size Generator (One Image for All Sizes)'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMultiSizeHelper(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Step 1: Pick / Enter Color */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-200 block">
                        ১. {isBn ? 'কালার নির্বাচন করুন' : 'Select Color'}:
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {COLOR_PRESETS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              setBulkColor(isBn ? p.name_bn : p.name);
                              setBulkColorCode(p.hex);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                              bulkColor === p.name || bulkColor === p.name_bn || bulkColorCode === p.hex
                                ? 'border-amber-500 bg-amber-500/20 text-white ring-1 ring-amber-500 font-bold'
                                : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full border border-slate-600" style={{ backgroundColor: p.hex }} />
                            <span>{isBn ? p.name_bn : p.name}</span>
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 max-w-sm">
                        <input
                          type="color"
                          value={bulkColorCode}
                          onChange={(e) => setBulkColorCode(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer p-0.5 shrink-0"
                        />
                        <input
                          type="text"
                          value={bulkColor}
                          onChange={(e) => setBulkColor(e.target.value)}
                          placeholder={isBn ? "যেমন: Black বা কালো" : "e.g. Black"}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Step 2: Upload Image ONCE */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <label className="text-xs font-bold text-slate-200 block">
                        ২. {isBn ? 'এই কালারের ছবিটি দিন (সবগুলো সাইজে এই ১টি ছবিই ব্যবহৃত হবে)' : 'Upload image once for all these sizes'}:
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                          {bulkImage ? (
                            <img src={bulkImage} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1 flex flex-wrap sm:flex-nowrap gap-2">
                          <label className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-1.5 cursor-pointer shrink-0">
                            <Upload className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isBn ? 'ডিভাইস থেকে ১টি ছবি আপলোড' : 'Upload 1 Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleBulkImageUpload(file);
                              }}
                            />
                          </label>
                          <input
                            type="text"
                            value={bulkImage}
                            onChange={(e) => setBulkImage(e.target.value)}
                            placeholder={isBn ? "অথবা ছবির অনলাইন লিঙ্ক (URL) দিন" : "Or paste image URL"}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500 min-w-[200px]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Select Sizes */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200">
                          ৩. {isBn ? 'যে যে সাইজগুলো তৈরি করতে চান (ক্লিক করে নির্বাচন করুন)' : 'Select sizes to generate'}:
                        </label>
                        <span className="text-xs text-amber-400 font-bold">
                          {bulkSizes.length} {isBn ? 'টি সাইজ নির্বাচিত' : 'sizes selected'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size', '28', '30', '32', '34', '36', '38', '40', '42', '44'].map((sz) => {
                          const isSelected = bulkSizes.includes(sz);
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleToggleBulkSize(sz)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-amber-500 bg-amber-500 text-slate-950 ring-2 ring-amber-500/25 font-black'
                                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Size add */}
                      <div className="flex items-center gap-2 pt-1 max-w-sm">
                        <input
                          type="text"
                          value={bulkCustomSize}
                          onChange={(e) => setBulkCustomSize(e.target.value)}
                          placeholder={isBn ? "অন্য সাইজ (যেমন: 46 বা 30ml)" : "Custom size"}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomBulkSize}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700"
                        >
                          {isBn ? '+ সাইজ যোগ' : '+ Add'}
                        </button>
                      </div>
                    </div>

                    {/* Step 4: Default Stock per size */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-slate-200 shrink-0">
                          ৪. {isBn ? 'প্রতিটি সাইজের স্টক:' : 'Stock per size:'}
                        </label>
                        <input
                          type="number"
                          value={bulkStock}
                          onChange={(e) => setBulkStock(Number(e.target.value))}
                          className="w-24 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500 text-center font-bold"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateBulkSizes}
                        disabled={bulkSizes.length === 0}
                        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {isBn
                            ? `এক ক্লিকে ${bulkColor} কালারের ${bulkSizes.length}টি সাইজ তৈরি করুন`
                            : `Generate ${bulkSizes.length} sizes for ${bulkColor}`}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {formData.variants.length === 0 ? (
                    <div className="p-6 bg-slate-950/60 rounded-xl border border-slate-800 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center mx-auto">
                        <Layers className="w-5 h-5" />
                      </div>
                      <p className="text-slate-400 text-xs italic">
                        {isBn
                          ? 'কোনো আলাদা কালার বা সাইজ যুক্ত নেই। প্রোডাক্টটি একক আইটেম হিসেবে বিক্রি হবে।'
                          : 'No variants added. Product will be sold as a single standard item.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 px-4 py-2 rounded-xl text-xs font-bold border border-amber-500/30 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isBn ? 'প্রথম কালার / ভ্যারিয়েন্ট যোগ করুন' : 'Add First Variant'}</span>
                      </button>
                    </div>
                  ) : (
                    formData.variants.map((v: ProductVariant, idx: number) => {
                      const availableGalleryImages = [formData.thumbnail, ...formData.images].filter(Boolean);

                      return (
                        <div
                          key={v.id || idx}
                          className="p-4 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-3.5 hover:border-slate-700/80 transition-all shadow-xs"
                        >
                          {/* Variant Card Header */}
                          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                            <div className="flex items-center gap-2.5">
                              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                #{idx + 1}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-4 h-4 rounded-full border border-slate-600 shadow-xs inline-block shrink-0"
                                  style={{ backgroundColor: v.color_code || '#cbd5e1' }}
                                />
                                <span className="text-xs font-bold text-slate-200">
                                  {v.color || (isBn ? 'রং নির্ধারণ করুন' : 'Color')}{' '}
                                  {v.size ? `(${v.size})` : ''}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDuplicateVariant(idx)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-amber-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                title={isBn ? "একই কালারের আরেকটি সাইজ তৈরি করতে ডুপ্লিকেট করুন" : "Duplicate variant"}
                              >
                                <Copy className="w-3 h-3" />
                                <span>{isBn ? 'ডুপ্লিকেট' : 'Copy'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                className="p-1 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-900/60 rounded-lg transition-colors cursor-pointer"
                                title={isBn ? "ভ্যারিয়েন্ট মুছে ফেলুন" : "Remove Variant"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Quick Color Presets */}
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                              <Palette className="w-3 h-3 text-amber-400" />
                              <span>{isBn ? 'দ্রুত কালার সিলেক্ট করুন (One-Click)' : 'Quick Color Presets'}:</span>
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {COLOR_PRESETS.map((preset) => (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => {
                                    const copy = [...formData.variants];
                                    copy[idx].color = isBn ? preset.name_bn : preset.name;
                                    copy[idx].color_code = preset.hex;
                                    setFormData({ ...formData, variants: copy });
                                  }}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                                    v.color_code === preset.hex || v.color === preset.name || v.color === preset.name_bn
                                      ? 'border-amber-500 bg-amber-500/20 text-white ring-1 ring-amber-500'
                                      : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-slate-600 inline-block"
                                    style={{ backgroundColor: preset.hex }}
                                  />
                                  <span>{isBn ? preset.name_bn : preset.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Color, Size, Stock, Price Inputs */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                            <div>
                              <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                                {isBn ? 'রং এর নাম *' : 'Color Name *'}
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={v.color_code || '#111827'}
                                  onChange={(e) => {
                                    const copy = [...formData.variants];
                                    copy[idx].color_code = e.target.value;
                                    setFormData({ ...formData, variants: copy });
                                  }}
                                  className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer p-0.5 shrink-0"
                                  title={isBn ? "কালার পিকার" : "Color Picker"}
                                />
                                <input
                                  type="text"
                                  value={v.color || ''}
                                  onChange={(e) => {
                                    const copy = [...formData.variants];
                                    copy[idx].color = e.target.value;
                                    setFormData({ ...formData, variants: copy });
                                  }}
                                  placeholder={isBn ? "যেমন: লাল / Red" : "e.g. Red, Black"}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                                {isBn ? 'সাইজ (ঐচ্ছিক)' : 'Size (Optional)'}
                              </label>
                              <input
                                type="text"
                                value={v.size || ''}
                                onChange={(e) => {
                                  const copy = [...formData.variants];
                                  copy[idx].size = e.target.value;
                                  setFormData({ ...formData, variants: copy });
                                }}
                                placeholder={isBn ? "যেমন: M, L, XL, Free" : "e.g. M, L, XL, Free"}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                                {isBn ? 'এই কালারের স্টক *' : 'Stock Quantity *'}
                              </label>
                              <input
                                type="number"
                                required
                                value={v.stock_quantity}
                                onChange={(e) => {
                                  const copy = [...formData.variants];
                                  copy[idx].stock_quantity = Number(e.target.value);
                                  setFormData({ ...formData, variants: copy });
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                                {isBn ? 'মূল্যের তারতম্য (+/- ৳)' : 'Price Adjust (+/- ৳)'}
                              </label>
                              <input
                                type="number"
                                value={v.price_adjustment || 0}
                                onChange={(e) => {
                                  const copy = [...formData.variants];
                                  copy[idx].price_adjustment = Number(e.target.value);
                                  setFormData({ ...formData, variants: copy });
                                }}
                                placeholder="0"
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          {/* Variant Specific Image (Photo for this Color) */}
                          <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
                            <label className="text-[11px] text-slate-300 font-bold block flex items-center justify-between">
                              <span className="flex items-center gap-1 text-amber-400">
                                <ImagePlus className="w-3.5 h-3.5" />
                                <span>{isBn ? 'এই কালারের নির্দিষ্ট ছবি (Variant Photo)' : 'Photo for this Color'}:</span>
                              </span>
                              {v.image && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const copy = [...formData.variants];
                                    copy[idx].image = '';
                                    setFormData({ ...formData, variants: copy });
                                  }}
                                  className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                                >
                                  {isBn ? 'ছবি মুছুন' : 'Remove Photo'}
                                </button>
                              )}
                            </label>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                              {/* Preview Thumbnail */}
                              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                                {v.image ? (
                                  <img src={v.image} alt={v.color || 'variant'} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-slate-600" />
                                )}
                              </div>

                              {/* Upload / URL Input */}
                              <div className="flex-1 flex flex-wrap sm:flex-nowrap gap-2">
                                <label className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{isBn ? 'ডিভাইস থেকে আপলোড' : 'Upload File'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleVariantImageUpload(idx, file);
                                    }}
                                  />
                                </label>

                                <input
                                  type="text"
                                  value={v.image || ''}
                                  onChange={(e) => {
                                    const copy = [...formData.variants];
                                    copy[idx].image = e.target.value;
                                    setFormData({ ...formData, variants: copy });
                                  }}
                                  placeholder={isBn ? "অথবা ছবির অনলাইন লিংক (URL) দিন" : "Or paste image URL here..."}
                                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500 min-w-[180px]"
                                />
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {formData.variants.length > 0 && (
                  <div className="pt-2 flex justify-start">
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="bg-slate-900 hover:bg-slate-850 text-amber-400 hover:text-amber-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isBn ? '+ আরও একটি কালার / সাইজ যোগ করুন' : '+ Add Another Color / Variant'}</span>
                    </button>
                  </div>
                )}
                  </div>
                )}
              </div>

              {/* Section 4: Images & Gallery */}
              <div id="section-images" className="space-y-4 bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80 scroll-mt-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400 font-black text-sm">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">
                    {isBn ? '৪' : '4'}
                  </div>
                  <ImageIcon className="w-4 h-4" />
                  <span>{isBn ? 'গ্যালারি ছবি' : 'Gallery Images'}</span>
                </div>

                <ImageUploadField
                  label={isBn ? "গ্যালারিতে অতিরিক্ত ছবি যুক্ত করুন" : "Add Gallery Image"}
                  value={imageInputUrl}
                  onChange={(url) => {
                    if (url) {
                      setFormData({
                        ...formData,
                        images: [...(formData.images || []), url]
                      });
                      setImageInputUrl('');
                    }
                  }}
                  placeholder={isBn ? "https://... অথবা ডিভাইস থেকে ছবি আপলোড করুন" : "https://images.unsplash.com/... or upload image"}
                  helpText={isBn ? "ডিভাইস থেকে ছবি আপলোড করলেই তা সরাসরি গ্যালারিতে যুক্ত হবে।" : "Upload an image to add it directly to the product gallery."}
                  recommendedSize="800 x 800 px"
                />

                <div>
                  <p className="text-slate-300 font-bold mb-2">
                    {isBn ? 'সংযুক্ত গ্যালারি ছবিসমূহ:' : 'Attached Gallery Images:'} ({formData.images?.length || 0})
                  </p>
                  {(!formData.images || formData.images.length === 0) ? (
                    <p className="text-slate-500 italic text-[11px] p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      {isBn ? 'এখনও কোনো অতিরিক্ত গ্যালারি ছবি যোগ করা হয়নি।' : 'No additional gallery images attached yet.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {formData.images?.map((img: string, idx: number) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 group bg-slate-950">
                          <img src={img} alt="preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title={isBn ? "ছবি মুছুন" : "Delete Image"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 5: Flash Sale & Badges */}
              <div id="section-badges" className="space-y-4 bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80 scroll-mt-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400 font-black text-sm">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">
                    {isBn ? '৫' : '5'}
                  </div>
                  <Tag className="w-4 h-4" />
                  <span>{isBn ? 'ফ্ল্যাশ সেল ও ট্যাগ' : 'Flash Sale & Tags'}</span>
                </div>

                <label className="flex items-center gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_featured === 1}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })}
                    className="rounded text-amber-500 w-4 h-4 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <p className="font-bold text-white">
                      {isBn ? 'ফিচার্ড প্রোডাক্ট' : 'Featured Product'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isBn
                        ? 'হোমপেজের স্পটলাইট এবং জনপ্রিয় পণ্য হিসেবে প্রদর্শিত হবে'
                        : 'Showcase in homepage featured section and spotlight banners'}
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_flash_sale === 1}
                    onChange={(e) => setFormData({ ...formData, is_flash_sale: e.target.checked ? 1 : 0 })}
                    className="rounded text-amber-500 w-4 h-4 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-rose-500 fill-current" />
                      <span>{isBn ? 'ফ্ল্যাশ সেল অফার' : 'Flash Sale Deal'}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isBn
                        ? 'কাউন্টডাউন টাইমার সহ স্পেশাল ফ্ল্যাশ ডিল সেকশনে প্রদর্শিত হবে'
                        : 'Include in active countdown Flash Deal banner with special discount tag'}
                    </p>
                  </div>
                </label>
              </div>

              {/* Bottom Sticky Submit Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-950 sticky bottom-0 z-10 py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white font-bold rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer text-xs"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>{isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        {editingProduct
                          ? (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Update Product')
                          : (isBn ? 'প্রোডাক্ট তৈরি করুন' : 'Create & Publish Product')}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in"
            onClick={() => setProductToDelete(null)}
          />
          <div className="relative w-full max-w-md bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">
                {isBn ? "প্রোডাক্ট মুছে ফেলবেন?" : "Delete Product?"}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn ? (
                  <>
                    আপনি কি নিশ্চিত যে আপনি <span className="text-white font-semibold">{productToDelete.name_bn || productToDelete.name_en}</span> মুছে ফেলতে চান? এটি ক্যাটালগ থেকে সম্পূর্ণ অপসারণ করা হবে।
                  </>
                ) : (
                  <>
                    Are you sure you want to delete <span className="text-white font-semibold">{productToDelete.name_en}</span>? This will permanently remove the item, its variants, and images from the catalog.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#2C323F]">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isDeleting
                    ? (isBn ? "মুছে ফেলা হচ্ছে..." : "Deleting...")
                    : (isBn ? "নিশ্চিত মুছুন" : "Confirm Delete")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Demo Products Confirmation Modal */}
      {showClearDemoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1E222B] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isBn ? "সকল ডেমো পণ্য মুছে ফেলার নিশ্চিতকরণ" : "Clear All Demo Products Confirmation"}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isBn ? `মোট ${demoProductsCount}টি নমুনা/ডিফল্ট ডেমো পণ্য ডাটাবেজ থেকে মুছে যাবে।` : `Total ${demoProductsCount} demo items will be removed from database.`}
                </p>
              </div>
            </div>

            <div className="bg-[#14171E] border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{isBn ? `আপনার নিজস্ব আপলোড (${userProductsCount}টি পণ্য) সম্পূর্ণ অক্ষত থাকবে!` : `Your own uploads (${userProductsCount} products) remain 100% safe!`}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isBn
                  ? "শুধুমাত্র সিস্টেমের স্যাম্পল পণ্যগুলো মুছে ফেলা হবে, যাতে আপনার আসল পণ্যের সাথে ডেমো পণ্য মিশে ব্যবসার কোনো ক্ষতি না হয়।"
                  : "Only the system default sample products will be removed so they do not mix with your actual customer-facing inventory."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearDemoModal(false)}
                disabled={isClearingDemo}
                className="px-4 py-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>

              <button
                type="button"
                disabled={isClearingDemo}
                onClick={handleClearDemoProducts}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isClearingDemo
                    ? (isBn ? "মুছে ফেলা হচ্ছে..." : "Clearing...")
                    : (isBn ? `হ্যাঁ, ${demoProductsCount}টি ডেমো পণ্য মুছুন` : `Yes, Clear ${demoProductsCount} Demo Items`)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
