import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit2, X, AlertCircle, Save, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Banner } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { ImageUploadField } from './ImageUploadField.tsx';

export const AdminBanners: React.FC = () => {
  const { t, language } = useLanguage();
  const isBn = language === 'bn';
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title_en: '',
    title_bn: '',
    subtitle_en: '',
    subtitle_bn: '',
    image_url: '',
    link_url: '/shop',
    button_text_en: 'Explore Collection',
    button_text_bn: 'এখনই কিনুন',
    badge_en: '',
    badge_bn: '',
    position: 'hero',
    sort_order: 1,
    is_active: 1
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminBanners();
      if (res.success) setBanners(res.banners || []);
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData({
      title_en: '',
      title_bn: '',
      subtitle_en: '',
      subtitle_bn: '',
      image_url: '',
      link_url: '/shop',
      button_text_en: 'Explore Collection',
      button_text_bn: 'এখনই কিনুন',
      badge_en: '',
      badge_bn: '',
      position: 'hero',
      sort_order: banners.length + 1,
      is_active: 1
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setFormData({
      title_en: b.title_en || '',
      title_bn: b.title_bn || b.title_en || '',
      subtitle_en: b.subtitle_en || '',
      subtitle_bn: b.subtitle_bn || b.subtitle_en || '',
      badge_en: b.badge_en || '',
      badge_bn: b.badge_bn || '',
      image_url: b.image_url || '',
      link_url: b.button_link || b.link_url || '/shop',
      button_text_en: b.button_text_en || 'Explore Collection',
      button_text_bn: b.button_text_bn || 'এখনই কিনুন',
      position: b.position || 'hero',
      sort_order: b.sort_order || 1,
      is_active: b.is_active ?? 1
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const titleEn = formData.title_en.trim() || formData.title_bn.trim();
    const titleBn = formData.title_bn.trim() || formData.title_en.trim();

    if (!titleEn && !titleBn) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে ব্যানারের একটি শিরোনাম লিখুন।' : 'Please enter a banner title.');
      return;
    }

    if (!formData.image_url.trim()) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে ব্যানার ইমেজ আপলোড করুন অথবা ছবি লিংক দিন।' : 'Please upload a banner image or enter an image URL.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        title_en: titleEn,
        title_bn: titleBn,
        subtitle_en: formData.subtitle_en?.trim() || '',
        subtitle_bn: formData.subtitle_bn?.trim() || '',
        badge_en: formData.badge_en?.trim() || '',
        badge_bn: formData.badge_bn?.trim() || '',
        button_text_en: formData.button_text_en?.trim() || 'Explore Collection',
        button_text_bn: formData.button_text_bn?.trim() || 'এখনই কিনুন',
        button_link: formData.link_url?.trim() || '/shop',
        link_url: formData.link_url?.trim() || '/shop'
      };
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, payload);
      } else {
        await api.createBanner(payload);
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (err: any) {
      setErrorMsg(err.message || (isBn ? 'ব্যানার সংরক্ষণ করতে ব্যর্থ হয়েছে।' : 'Failed to save banner.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await api.deleteBanner(id);
      setDeleteConfirmId(null);
      loadBanners();
    } catch (err: any) {
      console.error('Failed to delete banner:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (b: Banner) => {
    try {
      const newStatus = b.is_active === 1 ? 0 : 1;
      await api.updateBanner(b.id, { ...b, is_active: newStatus });
      loadBanners();
    } catch (err) {
      console.error('Failed to toggle banner status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-3xl">
        <div>
          <h2 className="text-base font-black text-white">
            {isBn ? 'ব্যানার ও হিরো স্লাইডার' : 'Banners & Hero Sliders'}
          </h2>
          <p className="text-xs text-slate-400">
            {isBn ? 'হোমপেজের টপ স্লাইডার এবং অফার ব্যানার ম্যানেজ করুন' : 'Manage top carousel sliders and promotional display boards'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isBn ? 'নতুন ব্যানার যোগ করুন' : 'Add Banner'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden space-y-4 hover:border-slate-700 transition-colors"
          >
            <div className="relative aspect-video bg-slate-900 overflow-hidden">
              <img src={b.image_url} alt={b.title_en} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                {(b.badge_bn || b.badge_en) && (
                  <span className="inline-block self-start text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md mb-1">
                    {isBn && b.badge_bn ? b.badge_bn : (b.badge_en || b.badge_bn)}
                  </span>
                )}
                <p className="text-white font-black text-sm">{isBn && b.title_bn ? b.title_bn : b.title_en}</p>
                {(b.subtitle_bn || b.subtitle_en) && (
                  <p className="text-slate-300 text-xs">{isBn && b.subtitle_bn ? b.subtitle_bn : b.subtitle_en}</p>
                )}
              </div>
            </div>

            <div className="p-4 pt-0 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">{isBn ? `সিরিয়াল: #${b.sort_order}` : `Order: #${b.sort_order}`}</span>
                <button
                  onClick={() => handleToggleStatus(b)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    b.is_active === 1
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900/60'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                  title={isBn ? 'স্ট্যাটাস টগল করতে ক্লিক করুন' : 'Click to toggle status'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${b.is_active === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span>{b.is_active === 1 ? (isBn ? 'পাবলিশড' : 'Active') : (isBn ? 'ড্রাফট (হাইড)' : 'Inactive')}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="px-3 py-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-1.5 transition-colors font-bold text-xs cursor-pointer"
                  title={isBn ? 'এডিট করুন' : 'Edit Banner'}
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBn ? 'এডিট' : 'Edit'}</span>
                </button>
                <button
                  onClick={() => setDeleteConfirmId(b.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
                  title={isBn ? 'ডিলিট করুন' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-white mb-2">
              {isBn ? 'ব্যানার ডিলিট নিশ্চিত করুন' : 'Confirm Delete Banner'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {isBn ? 'আপনি কি নিশ্চিত এই ব্যানারটি ওয়েবসাইট থেকে ডিলিট করতে চান?' : 'Are you sure you want to delete this banner from homepage?'}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-slate-400 hover:text-white font-bold text-xs"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDelete(deleteConfirmId)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? (isBn ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...') : (isBn ? 'ডিলিট করুন' : 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-black text-white">
                {editingBanner ? (isBn ? 'ব্যানার এডিট করুন' : 'Edit Banner') : (isBn ? 'নতুন ব্যানার তৈরি করুন' : 'Create New Banner')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              {/* Banner Titles: English & Bangla */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'ব্যানার শিরোনাম (English)' : 'Banner Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="e.g. Exclusive Summer Grand Sale"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'ব্যানার শিরোনাম (বাংলা)' : 'Banner Title (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.title_bn}
                    onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                    placeholder="যেমন: এক্সক্লুসিভ সামার গ্র্যান্ড সেল ২০২৬"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Subtitles: English & Bangla */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'সাবটাইটেল / অফার টেক্সট (English)' : 'Subtitle / Tagline (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle_en}
                    onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                    placeholder="e.g. Up to 40% discount on luxury items"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'সাবটাইটেল / অফার টেক্সট (বাংলা)' : 'Subtitle / Tagline (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle_bn}
                    onChange={(e) => setFormData({ ...formData, subtitle_bn: e.target.value })}
                    placeholder="যেমন: লাক্সারি প্রডাক্টে সর্বোচ্চ ৪০% পর্যন্ত ছাড়"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Badge: English & Bangla */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'হাইলাইট ব্যাজ (English)' : 'Highlight Badge (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.badge_en}
                    onChange={(e) => setFormData({ ...formData, badge_en: e.target.value })}
                    placeholder="e.g. SUMMER SALE 2026"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'হাইলাইট ব্যাজ (বাংলা)' : 'Highlight Badge (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.badge_bn}
                    onChange={(e) => setFormData({ ...formData, badge_bn: e.target.value })}
                    placeholder="যেমন: সামার মেগা অফার"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Banner Image */}
              <div>
                <ImageUploadField
                  label={isBn ? "ব্যানার ইমেজ (Banner / Slider Image) *" : "Banner Image *"}
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  placeholder="https://images.unsplash.com/... or upload image"
                  helpText={isBn ? "ডিভাইস থেকে ব্যানার আপলোড করুন অথবা সরাসরি লিঙ্ক দিন।" : "Upload banner from device or provide direct image URL."}
                  recommendedSize={
                    isBn
                      ? "1600 x 600 px (ল্যান্ডস্কেপ ৮:৩ বা ১৬:৬ অনুপাত)"
                      : "1600 x 600 px (Landscape 8:3 / 16:6 ratio)"
                  }
                />
              </div>

              {/* Button Text: English & Bangla */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'বাটন টেক্সট (English)' : 'Button Text (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.button_text_en}
                    onChange={(e) => setFormData({ ...formData, button_text_en: e.target.value })}
                    placeholder="e.g. Shop Deals Now"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'বাটন টেক্সট (বাংলা)' : 'Button Text (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.button_text_bn}
                    onChange={(e) => setFormData({ ...formData, button_text_bn: e.target.value })}
                    placeholder="যেমন: এখনই কিনুন"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Link URL and Sort Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'লিঙ্ক URL (Link URL)' : 'Link URL'}
                  </label>
                  <input
                    type="text"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="/shop"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'ক্রম / সাজানোর সিরিয়াল' : 'Sort Order'}
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSaving
                      ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving Changes...')
                      : (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')}
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
