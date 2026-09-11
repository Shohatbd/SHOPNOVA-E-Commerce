import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, X, AlertCircle, ArrowUp, ArrowDown, ChevronUp, ChevronDown, CheckCircle2, Circle, Square, LayoutGrid, Check, Save } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { Category } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { ImageUploadField } from './ImageUploadField.tsx';

export const AdminCategories: React.FC = () => {
  const { t, language } = useLanguage();
  const { settings, updateSettings, refreshSettings } = useSettings();
  const isBn = language === 'bn';
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentSavedShape = (settings.category_view_shape as 'circle' | 'square' | 'rounded_square') || 'circle';
  const [selectedShape, setSelectedShape] = useState<'circle' | 'square' | 'rounded_square'>(currentSavedShape);
  const [isUpdatingShape, setIsUpdatingShape] = useState(false);

  useEffect(() => {
    if (settings.category_view_shape) {
      setSelectedShape(settings.category_view_shape as 'circle' | 'square' | 'rounded_square');
    }
  }, [settings.category_view_shape]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_bn: '',
    slug: '',
    description_en: '',
    description_bn: '',
    image: '',
    sort_order: 0,
    is_active: 1
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Subcategory Edit / Rename state
  const [subToEdit, setSubToEdit] = useState<{
    id: string;
    category_id: string;
    name_en: string;
    name_bn?: string;
    slug?: string;
    image?: string;
    catName: string;
  } | null>(null);
  const [subEditFormData, setSubEditFormData] = useState({
    name_en: '',
    name_bn: '',
    slug: '',
    image: ''
  });
  const [isSavingSub, setIsSavingSub] = useState(false);
  const [subEditError, setSubEditError] = useState('');

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCategories();
      if (res.success) {
        // Sort by sort_order ascending
        const sorted = (res.categories || []).sort((a: Category, b: Category) => (a.sort_order || 0) - (b.sort_order || 0));
        setCategories(sorted);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === categories.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    // Update sort_order for each
    const updated = newCategories.map((c, i) => ({ ...c, sort_order: i + 1 }));
    setCategories(updated);

    try {
      await Promise.all(updated.map((c) => api.updateCategory(c.id, { sort_order: c.sort_order })));
    } catch (err) {
      console.error('Failed to persist category order:', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name_en: '',
      name_bn: '',
      slug: '',
      description_en: '',
      description_bn: '',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
      sort_order: categories.length + 1,
      is_active: 1
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setFormData({
      name_en: c.name_en,
      name_bn: c.name_bn || c.name_en,
      slug: c.slug,
      description_en: c.description_en || '',
      description_bn: c.description_bn || '',
      image: c.image || '',
      sort_order: c.sort_order || 0,
      is_active: c.is_active ?? 1
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name_en.trim()) {
      setFormError(isBn ? 'ক্যাটাগরির ইংরেজি নাম আবশ্যক।' : 'Category English name is required.');
      return;
    }

    const slug = formData.slug.trim() || formData.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        name_en: formData.name_en.trim(),
        name_bn: formData.name_bn?.trim() || formData.name_en.trim(),
        description_en: formData.description_en?.trim() || '',
        description_bn: formData.description_bn?.trim() || '',
        slug
      };
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, payload);
      } else {
        await api.createCategory(payload);
      }
      setActionSuccess(isBn ? `ক্যাটাগরি "${formData.name_en}" সফলভাবে সংরক্ষিত হয়েছে।` : `Category "${formData.name_en}" saved successfully.`);
      setIsModalOpen(false);
      await loadCategories();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      setFormError(err.message || (isBn ? 'ক্যাটাগরি সংরক্ষণ করতে ব্যর্থ হয়েছে।' : 'Failed to save category.'));
    } finally {
      setIsSaving(false);
    }
  };

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [subToDelete, setSubToDelete] = useState<{ id: string; name: string; catName: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const handleOpenEditSub = (sub: any, cat: Category) => {
    setSubToEdit({
      id: sub.id,
      category_id: cat.id,
      name_en: sub.name_en,
      name_bn: sub.name_bn || sub.name_en,
      slug: sub.slug || '',
      image: sub.image || '',
      catName: cat.name_en
    });
    setSubEditFormData({
      name_en: sub.name_en,
      name_bn: sub.name_bn || sub.name_en,
      slug: sub.slug || '',
      image: sub.image || ''
    });
    setSubEditError('');
  };

  const handleSaveSubEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subToEdit) return;
    setSubEditError('');

    if (!subEditFormData.name_en.trim()) {
      setSubEditError(isBn ? 'সাব-ক্যাটাগরীর নাম আবশ্যক।' : 'Subcategory name is required.');
      return;
    }

    setIsSavingSub(true);
    try {
      const slug = subEditFormData.slug.trim() || subEditFormData.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const res = await api.updateSubcategory(subToEdit.id, {
        name_en: subEditFormData.name_en.trim(),
        name_bn: subEditFormData.name_bn?.trim() || subEditFormData.name_en.trim(),
        slug,
        image: subEditFormData.image.trim()
      });
      if (res && res.success === false) {
        throw new Error(res.message || 'Failed to rename subcategory');
      }
      setActionSuccess(isBn ? `সাব-ক্যাটাগরী "${subEditFormData.name_en}" সফলভাবে আপডেট হয়েছে।` : `Subcategory "${subEditFormData.name_en}" updated successfully.`);
      setSubToEdit(null);
      await loadCategories();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      console.error('Rename subcategory error:', err);
      setSubEditError(err.message || (isBn ? 'সাব-ক্যাটাগরীর নাম পরিবর্তন করতে ব্যর্থ হয়েছে।' : 'Failed to rename subcategory.'));
    } finally {
      setIsSavingSub(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    setActionError('');
    try {
      const res = await api.deleteCategory(categoryToDelete.id);
      if (res && res.success === false) {
        throw new Error(res.message || 'Failed to delete category');
      }
      setActionSuccess(`Category "${categoryToDelete.name_en}" deleted successfully.`);
      setCategoryToDelete(null);
      await loadCategories();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      console.error('Delete category error:', err);
      setActionError(err.message || 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteSubcategory = async () => {
    if (!subToDelete) return;
    setIsDeleting(true);
    setActionError('');
    try {
      const res = await api.deleteSubcategory(subToDelete.id);
      if (res && res.success === false) {
        throw new Error(res.message || 'Failed to delete subcategory');
      }
      setActionSuccess(`Subcategory "${subToDelete.name}" deleted successfully.`);
      setSubToDelete(null);
      await loadCategories();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      console.error('Delete subcategory error:', err);
      setActionError(err.message || 'Failed to delete subcategory.');
    } finally {
      setIsDeleting(false);
    }
  };

  const [isSavingAllCategories, setIsSavingAllCategories] = useState(false);

  const handleSaveAllCategories = async () => {
    setIsSavingAllCategories(true);
    setActionError('');
    try {
      await Promise.all(
        categories.map((c, i) =>
          api.updateCategory(c.id, {
            sort_order: i + 1,
            is_active: c.is_active ?? 1
          })
        )
      );
      await loadCategories();
      setActionSuccess(
        isBn
          ? 'সকল ক্যাটাগরির ক্রম এবং পরিবর্তন সফলভাবে সেভ হয়েছে!'
          : 'All category changes & order saved successfully!'
      );
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      console.error('Failed to save all categories:', err);
      setActionError(
        err.message ||
          (isBn ? 'ক্যাটাগরি পরিবর্তন সংরক্ষণ করতে ব্যর্থ হয়েছে।' : 'Failed to save category changes.')
      );
    } finally {
      setIsSavingAllCategories(false);
    }
  };

  const hasUnsavedShapeChange = selectedShape !== currentSavedShape;

  const handleSaveShape = async () => {
    setIsUpdatingShape(true);
    setActionError('');
    try {
      const res = await updateSettings({ category_view_shape: selectedShape });
      if (res && res.success) {
        await refreshSettings();
        const shapeName = selectedShape === 'circle' ? (isBn ? 'সার্কেল / বৃত্তাকার (Circle)' : 'Circle') : selectedShape === 'square' ? (isBn ? 'সোজা চতুর্ভুজ (Square)' : 'Square') : (isBn ? 'সফট চতুর্ভুজ (Rounded Square)' : 'Rounded Square');
        setActionSuccess(isBn ? `হোমপেজের ক্যাটাগরি ভিউ স্টাইল সফলভাবে "${shapeName}" হিসেবে সেভ করা হয়েছে!` : `Homepage category view shape saved as "${shapeName}"!`);
        setTimeout(() => setActionSuccess(''), 4500);
      } else {
        throw new Error(res?.message || 'Failed to update category shape');
      }
    } catch (err: any) {
      console.error('Update shape error:', err);
      setActionError(err.message || (isBn ? 'ক্যাটাগরি সাইজ/শেপ পরিবর্তন সেভ করতে ব্যর্থ হয়েছে।' : 'Failed to save category shape.'));
    } finally {
      setIsUpdatingShape(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Notifications */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-bold rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-950/70 border border-rose-800 text-rose-300 font-bold rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-3xl">
        <div>
          <h2 className="text-base font-black text-white">
            Category Management
          </h2>
          <p className="text-xs text-slate-400">
            Organize your store taxonomy and navigation hierarchy
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Category Shape Display Settings Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="border-b border-slate-800/80 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-emerald-400" />
            <span>{isBn ? 'হোমপেজ ক্যাটাগরি ভিউ শেপ সেটিংস' : 'Homepage Category View Shape'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn
              ? 'হোমপেজের ক্যাটাগরি ছবিগুলো গোলাকার নাকি চতুর্ভুজ দেখাবে তা নির্বাচন করে "Save Changes" বাটনে চাপুন।'
              : 'Select whether homepage category images display as circular or square cards, then click "Save Changes".'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option 1: Circle */}
          <button
            type="button"
            onClick={() => setSelectedShape('circle')}
            disabled={isUpdatingShape}
            className={`p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
              selectedShape === 'circle'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              selectedShape === 'circle' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300' : 'border-slate-700 bg-slate-800 text-slate-400'
            }`}>
              <Circle className="w-5 h-5 fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-xs font-bold ${selectedShape === 'circle' ? 'text-emerald-300' : 'text-white'}`}>
                  {isBn ? 'সার্কেল / গোলাকার' : 'Circle / Round'}
                </p>
                {selectedShape === 'circle' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isBn ? '১০০% গোল বৃত্তাকার ভিউ' : 'Full circular rounded avatar'}
              </p>
            </div>
          </button>

          {/* Option 2: Rounded Square */}
          <button
            type="button"
            onClick={() => setSelectedShape('rounded_square')}
            disabled={isUpdatingShape}
            className={`p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
              selectedShape === 'rounded_square'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 transition-colors ${
              selectedShape === 'rounded_square' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300' : 'border-slate-700 bg-slate-800 text-slate-400'
            }`}>
              <div className="w-4 h-4 rounded-md border border-current bg-current/30" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-xs font-bold ${selectedShape === 'rounded_square' ? 'text-emerald-300' : 'text-white'}`}>
                  {isBn ? 'সফট চতুর্ভুজ' : 'Rounded Square'}
                </p>
                {selectedShape === 'rounded_square' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isBn ? 'স্মুথ কোণা চতুর্ভুজ ফ্রেম' : 'Rounded corner square card'}
              </p>
            </div>
          </button>

          {/* Option 3: Square */}
          <button
            type="button"
            onClick={() => setSelectedShape('square')}
            disabled={isUpdatingShape}
            className={`p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
              selectedShape === 'square'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className={`w-10 h-10 rounded-none border-2 flex items-center justify-center shrink-0 transition-colors ${
              selectedShape === 'square' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300' : 'border-slate-700 bg-slate-800 text-slate-400'
            }`}>
              <Square className="w-4 h-4 fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-xs font-bold ${selectedShape === 'square' ? 'text-emerald-300' : 'text-white'}`}>
                  {isBn ? 'সোজা চতুর্ভুজ' : 'Sharp Square'}
                </p>
                {selectedShape === 'square' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isBn ? 'ধারালো চারকোণা চতুর্ভুজ' : 'Flat sharp-corner square'}
              </p>
            </div>
          </button>
        </div>

        {/* Bottom Actions bar with Save Change Button and Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400">
            <span>{isBn ? 'বর্তমান অ্যাক্টিভ স্টাইল:' : 'Currently active:'}</span>
            <span className="font-bold text-emerald-400">
              {currentSavedShape === 'circle'
                ? (isBn ? 'সার্কেল (Circle)' : 'Circle')
                : currentSavedShape === 'square'
                ? (isBn ? 'সোজা চতুর্ভুজ (Square)' : 'Square')
                : (isBn ? 'সফট চতুর্ভুজ (Rounded Square)' : 'Rounded Square')}
            </span>
            {hasUnsavedShapeChange && (
              <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                {isBn ? 'পরিবর্তন সেভ করা হয়নি' : 'Unsaved change'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveShape}
            disabled={isUpdatingShape}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              hasUnsavedShapeChange
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <Save className="w-4 h-4 text-current" />
            <span>
              {isUpdatingShape
                ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                : (isBn ? 'Save Changes' : 'Save Changes')}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between relative group"
          >
            <div className="flex items-start gap-4">
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'}
                alt={cat.name_en}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-800 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full">
                    #{idx + 1}
                  </span>
                  <h3 className="font-black text-white text-sm truncate">{cat.name_en}</h3>
                </div>
                <span className="inline-block mt-2 font-mono text-[10px] bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-slate-800">
                  /{cat.slug}
                </span>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    {cat.subcategories.length} Subcategories
                  </p>
                )}
              </div>
            </div>

            {/* Subcategories list inside card */}
            {cat.subcategories && cat.subcategories.length > 0 && (
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isBn ? `সাব-ক্যাটাগরী (${cat.subcategories.length}):` : `Subcategories (${cat.subcategories.length}):`}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cat.subcategories.map((sub) => (
                    <span
                      key={sub.id}
                      className="inline-flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 text-slate-200 text-[10px] font-semibold pl-1.5 pr-1.5 py-1 rounded-lg group/sub hover:border-amber-500/50 transition-colors"
                    >
                      {sub.image && (
                        <img
                          src={sub.image}
                          alt={sub.name_en}
                          className="w-4 h-4 rounded-md object-cover border border-slate-700 shrink-0"
                        />
                      )}
                      <span className="truncate max-w-[120px]" title={sub.name_en}>
                        {isBn && sub.name_bn ? sub.name_bn : sub.name_en}
                      </span>
                      <div className="flex items-center gap-0.5 ml-0.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditSub(sub, cat)}
                          className="text-slate-400 hover:text-amber-400 transition-colors p-0.5 rounded hover:bg-slate-700/80"
                          title={isBn ? "সাব-ক্যাটাগরী নাম পরিবর্তন (Rename)" : "Rename Subcategory"}
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubToDelete({ id: sub.id, name: sub.name_en, catName: cat.name_en })}
                          className="text-slate-400 hover:text-rose-400 transition-colors p-0.5 rounded hover:bg-slate-700/80"
                          title={isBn ? "সাব-ক্যাটাগরী ডিলিট করুন" : "Delete Subcategory"}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Add Subcategory form */}
            <div className="pt-1">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  const nameInput = target.elements[`sub_name_${cat.id}`];
                  const nameVal = nameInput?.value?.trim();
                  if (!nameVal) return;
                  try {
                    await api.addSubcategory(cat.id, { name_en: nameVal, name_bn: nameVal });
                    nameInput.value = '';
                    await loadCategories();
                  } catch (err: any) {
                    console.error('Failed to add subcategory:', err);
                    setActionError(err.message || (isBn ? 'সাব-ক্যাটাগরী তৈরি করতে ব্যর্থ হয়েছে।' : 'Failed to add subcategory.'));
                  }
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  name={`sub_name_${cat.id}`}
                  type="text"
                  placeholder={isBn ? "+ নতুন সাব-ক্যাটাগরী..." : "+ New Subcategory..."}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-2.5 py-1 rounded-xl text-[11px] border border-slate-700 shrink-0 transition-colors"
                >
                  {isBn ? 'যোগ করুন' : 'Add'}
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              {/* Move Up / Down Buttons */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveCategory(idx, 'up')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    idx === 0
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800'
                  }`}
                  title="Move Up / Before (আগে / উপরে নিন)"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === categories.length - 1}
                  onClick={() => handleMoveCategory(idx, 'down')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    idx === categories.length - 1
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800'
                  }`}
                  title="Move Down / After (পরে / নিচে নিন)"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Edit & Delete */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Edit Category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCategoryToDelete(cat)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Save Changes Bar for All Categories */}
      {categories.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Save className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white font-bold">
                {isBn ? 'ক্যাটাগরি সিরিয়াল ও পরিবর্তন সংরক্ষণ' : 'Save Category Order & Changes'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isBn
                  ? `সকল (${categories.length} টি) ক্যাটাগরির বর্তমান ক্রম ও সকল পরিবর্তন ডাটাবেজে স্থায়ীভাবে সংরক্ষণ করতে Save Changes বাটনে চাপুন।`
                  : `Click Save Changes to permanently persist current category order (${categories.length} categories) to the database.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveAllCategories}
            disabled={isSavingAllCategories}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSavingAllCategories
                ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                : (isBn ? 'Save Changes' : 'Save Changes')}
            </span>
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-black text-white">
                {editingCategory ? (isBn ? 'ক্যাটাগরি এডিট করুন' : 'Edit Category') : (isBn ? 'নতুন ক্যাটাগরি তৈরি করুন' : 'Add New Category')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              {/* Category Name (English & Bangla) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'ক্যাটাগরির নাম (English) *' : 'Category Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="e.g. Men's Clothing"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'ক্যাটাগরির নাম (বাংলা)' : 'Category Name (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.name_bn}
                    onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                    placeholder="যেমন: পুরুষদের পোশাক"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Category Description (English & Bangla) */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'ক্যাটাগরি বিবরণ / সাবটাইটেল (English)' : 'Category Description (English)'}
                </label>
                <textarea
                  rows={2}
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="e.g. Premium men's shirts, panjabis, polos, t-shirts, jackets and trousers crafted for elegance."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'ক্যাটাগরি বিবরণ / সাবটাইটেল (বাংলা)' : 'Category Description (Bangla)'}
                </label>
                <textarea
                  rows={2}
                  value={formData.description_bn}
                  onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
                  placeholder="যেমন: প্রিমিয়াম শার্ট, পাঞ্জাবি, পোলো, টি-শার্ট ও ট্রাউজার্স কালেকশন।"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <ImageUploadField
                  label={isBn ? "ক্যাটাগরি ইমেজ (Category Cover Image)" : "Category Cover Image"}
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  placeholder="https://images.unsplash.com/... or upload image"
                  helpText={isBn ? "ডিভাইস থেকে ছবি আপলোড করুন অথবা অনলাইন লিঙ্ক দিন।" : "Upload image from device or provide direct URL."}
                  recommendedSize="600 x 600 px (Square 1:1)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="mens-clothing"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'ক্রম / সিরিয়াল' : 'Sort Order'}
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2 rounded-xl"
                >
                  {isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সংরক্ষণ করুন' : 'Save Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => !isDeleting && setCategoryToDelete(null)} />
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-white">Delete Category?</h3>
              <p className="text-xs text-slate-300">
                Are you sure you want to delete <span className="text-amber-400 font-bold">"{categoryToDelete.name_en}"</span>?
              </p>
              <p className="text-[11px] text-slate-500">
                {isBn
                  ? 'এই ক্যাটাগরির অধীনস্থ সকল সাব-ক্যাটাগরিও মুছে যাবে। ক্যাটাগরিতে কোনো প্রডাক্ট থাকলে প্রথমে তা সরিয়ে নিতে হবে।'
                  : 'All subcategories under this category will also be removed. If this category contains products, they must be reassigned or deleted first.'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 font-bold hover:bg-slate-900 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteCategory}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black px-4 py-2.5 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subcategory Confirmation Modal */}
      {subToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => !isDeleting && setSubToDelete(null)} />
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-white">
                {isBn ? 'সাব-ক্যাটাগরী ডিলিট নিশ্চিতকরণ' : 'Delete Subcategory?'}
              </h3>
              <p className="text-xs text-slate-300">
                {isBn ? 'আপনি কি নিশ্চিত সাব-ক্যাটাগরী ' : 'Are you sure you want to delete subcategory '}
                <span className="text-amber-400 font-bold">"{subToDelete.name}"</span>
                {isBn ? ' ডিলিট করতে চান?' : '?'}
              </p>
              <p className="text-[11px] text-slate-500">
                {isBn ? 'মূল ক্যাটাগরি: ' : 'From category: '}
                <span className="text-slate-300 font-semibold">{subToDelete.catName}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSubToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 font-bold hover:bg-slate-900 transition-colors text-xs"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteSubcategory}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black px-4 py-2.5 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? (isBn ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...') : (isBn ? 'হ্যাঁ, ডিলিট করুন' : 'Yes, Delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Rename Subcategory Modal */}
      {subToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => !isSavingSub && setSubToEdit(null)} />
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isBn ? 'সাব-ক্যাটাগরীর নাম পরিবর্তন (Rename)' : 'Rename Subcategory'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'ক্যাটাগরি: ' : 'Category: '}
                    <span className="text-amber-400 font-bold">{subToEdit.catName}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubToEdit(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {subEditError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{subEditError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'সাব-ক্যাটাগরীর নাম (English) *' : 'Subcategory Name (English) *'}
                </label>
                <input
                  type="text"
                  required
                  value={subEditFormData.name_en}
                  onChange={(e) => setSubEditFormData({ ...subEditFormData, name_en: e.target.value })}
                  placeholder="e.g. Mechanical Watches"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'সাব-ক্যাটাগরীর নাম (বাংলা)' : 'Subcategory Name (Bangla)'}
                </label>
                <input
                  type="text"
                  value={subEditFormData.name_bn}
                  onChange={(e) => setSubEditFormData({ ...subEditFormData, name_bn: e.target.value })}
                  placeholder="যেমন: মেকানিক্যাল ঘড়ি"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'সাব-ক্যাটাগরীর ছবি URL (Image URL)' : 'Subcategory Image URL'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={subEditFormData.image}
                    onChange={(e) => setSubEditFormData({ ...subEditFormData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                  />
                  {subEditFormData.image && (
                    <img
                      src={subEditFormData.image}
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'স্লাগ / URL Slug (অপশনাল)' : 'Slug / URL Slug (Optional)'}
                </label>
                <input
                  type="text"
                  value={subEditFormData.slug}
                  onChange={(e) => setSubEditFormData({ ...subEditFormData, slug: e.target.value })}
                  placeholder="mechanical-watches"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isSavingSub}
                  onClick={() => setSubToEdit(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingSub}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>
                    {isSavingSub
                      ? (isBn ? 'আপডেট হচ্ছে...' : 'Saving...')
                      : (isBn ? 'নাম পরিবর্তন করুন (Save)' : 'Rename Subcategory')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
