import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit2, X, AlertCircle, Save, CheckCircle2, LayoutGrid, Sliders, ExternalLink, Sparkles, Flame, Truck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { Banner } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { ImageUploadField } from './ImageUploadField.tsx';

export const AdminBanners: React.FC = () => {
  const { t, language } = useLanguage();
  const isBn = language === 'bn';
  const { settings, updateSettings } = useSettings();

  const [activeTab, setActiveTab] = useState<'slider' | 'side_banners'>('slider');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Side Promos Form State (Daraz Style 2 Cards)
  const [sidePromos, setSidePromos] = useState({
    side_banner_top_enabled: '1',
    side_banner_top_image: '',
    side_banner_top_badge_en: '',
    side_banner_top_badge_bn: '',
    side_banner_top_title_en: '',
    side_banner_top_title_bn: '',
    side_banner_top_subtitle_en: '',
    side_banner_top_subtitle_bn: '',
    side_banner_top_button_en: '',
    side_banner_top_button_bn: '',
    side_banner_top_link: '/shop',

    side_banner_bottom_enabled: '1',
    side_banner_bottom_image: '',
    side_banner_bottom_badge_en: '',
    side_banner_bottom_badge_bn: '',
    side_banner_bottom_title_en: '',
    side_banner_bottom_title_bn: '',
    side_banner_bottom_subtitle_en: '',
    side_banner_bottom_subtitle_bn: '',
    side_banner_bottom_button_en: '',
    side_banner_bottom_button_bn: '',
    side_banner_bottom_link: '/shop',
  });
  const [isSavingSidePromos, setIsSavingSidePromos] = useState(false);
  const [sidePromosSuccessMsg, setSidePromosSuccessMsg] = useState('');

  // Sync settings when loaded
  useEffect(() => {
    if (settings) {
      setSidePromos({
        side_banner_top_enabled: String(settings.side_banner_top_enabled ?? '1'),
        side_banner_top_image: settings.side_banner_top_image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
        side_banner_top_badge_en: settings.side_banner_top_badge_en || 'HOT DEAL • 50% OFF',
        side_banner_top_badge_bn: settings.side_banner_top_badge_bn || 'হট ডিল • ৫০% ছাড়',
        side_banner_top_title_en: settings.side_banner_top_title_en || 'Modern Tech & Watches',
        side_banner_top_title_bn: settings.side_banner_top_title_bn || 'স্মার্ট গ্যাজেট ও ঘড়ি',
        side_banner_top_subtitle_en: settings.side_banner_top_subtitle_en || 'Premium Gear at Best Value',
        side_banner_top_subtitle_bn: settings.side_banner_top_subtitle_bn || 'সেরা মূল্যে প্রিমিয়াম ব্র্যান্ড',
        side_banner_top_button_en: settings.side_banner_top_button_en || 'Shop Now',
        side_banner_top_button_bn: settings.side_banner_top_button_bn || 'এখনই কিনুন',
        side_banner_top_link: settings.side_banner_top_link || '/shop',

        side_banner_bottom_enabled: String(settings.side_banner_bottom_enabled ?? '1'),
        side_banner_bottom_image: settings.side_banner_bottom_image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
        side_banner_bottom_badge_en: settings.side_banner_bottom_badge_en || 'FREE HOME DELIVERY',
        side_banner_bottom_badge_bn: settings.side_banner_bottom_badge_bn || 'ফ্রি ডেলিভারি অফার',
        side_banner_bottom_title_en: settings.side_banner_bottom_title_en || 'Latest Lifestyle Fashion',
        side_banner_bottom_title_bn: settings.side_banner_bottom_title_bn || 'লেটেস্ট ট্রেন্ডি ফ্যাশন',
        side_banner_bottom_subtitle_en: settings.side_banner_bottom_subtitle_en || 'Curated Apparel & Lifestyle',
        side_banner_bottom_subtitle_bn: settings.side_banner_bottom_subtitle_bn || 'নতুন প্রিমিয়াম পোশাক কালেকশন',
        side_banner_bottom_button_en: settings.side_banner_bottom_button_en || 'Explore Deals',
        side_banner_bottom_button_bn: settings.side_banner_bottom_button_bn || 'অফার দেখুন',
        side_banner_bottom_link: settings.side_banner_bottom_link || '/shop',
      });
    }
  }, [settings]);

  const handleSaveSidePromos = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSidePromos(true);
    setSidePromosSuccessMsg('');
    try {
      const res = await updateSettings(sidePromos);
      if (res.success) {
        setSidePromosSuccessMsg(isBn ? 'সাইড ব্যানার সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Side promo banners updated successfully!');
        setTimeout(() => setSidePromosSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to save side promos:', err);
    } finally {
      setIsSavingSidePromos(false);
    }
  };

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
      {/* Navigation Tabs: Hero Slider vs Side Promo Cards */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-3 sm:p-4 rounded-3xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('slider')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'slider'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isBn ? 'মূল স্লাইডার ব্যানার' : 'Main Hero Slider'}</span>
          </button>

          <button
            onClick={() => setActiveTab('side_banners')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'side_banners'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{isBn ? 'ডান পাশের ২টি অফার ব্যানার (দারাজ স্টাইল)' : 'Side Offer Cards (Daraz Style)'}</span>
          </button>
        </div>

        {activeTab === 'slider' && (
          <button
            onClick={handleOpenCreate}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? 'নতুন ব্যানার যোগ করুন' : 'Add Banner'}</span>
          </button>
        )}
      </div>

      {/* TAB 1: Main Carousel Slider */}
      {activeTab === 'slider' && (
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
      )}

      {/* TAB 2: Side Offer Cards (Daraz Style 2 Cards Beside Slider) */}
      {activeTab === 'side_banners' && (
        <form onSubmit={handleSaveSidePromos} className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6">
            <div className="border-b border-slate-800/80 pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isBn ? 'ডান পাশের ২টি অফার কার্ড সেটিংস (দারাজ স্টাইল)' : 'Side Offer Cards Settings (Daraz Style)'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isBn
                    ? 'মূল স্লাইডারের ডান পাশে প্রদর্শিত ২টি ছোট অফার ব্যানারের ছবি, টেক্সট এবং লিংক বাংলা ও ইংরেজিতে পরিবর্তন করুন।'
                    : 'Customize image, texts, badge, and redirect link for the 2 side offer cards in both English & Bengali.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSavingSidePromos}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSidePromos ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')}</span>
              </button>
            </div>

            {sidePromosSuccessMsg && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{sidePromosSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CARD 1: TOP SIDE BANNER */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center border border-rose-500/30">
                      1
                    </span>
                    <span className="font-black text-white text-sm">
                      {isBn ? '১ম সাইড ব্যানার (উপরের কার্ড)' : 'Side Card 1 (Top Banner)'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                    {isBn ? 'হট ডিল' : 'Hot Deal'}
                  </span>
                </div>

                {/* Image Upload */}
                <ImageUploadField
                  label={isBn ? 'ব্যানার ইমেজ (Landscape Card Image) *' : 'Banner Image *'}
                  value={sidePromos.side_banner_top_image}
                  onChange={(url) => setSidePromos({ ...sidePromos, side_banner_top_image: url })}
                  placeholder="https://images.unsplash.com/... or upload image"
                  helpText={isBn ? 'ল্যাপটপ বা ডিভাইস থেকে ছবি আপলোড করুন।' : 'Upload or paste image URL.'}
                  recommendedSize="600 x 380 px"
                />

                {/* Badge: English & Bangla */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'ব্যাজ (English)' : 'Badge (English)'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_top_badge_en}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_top_badge_en: e.target.value })}
                      placeholder="HOT DEAL • 50% OFF"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'ব্যাজ (বাংলা)' : 'Badge (Bangla)'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_top_badge_bn}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_top_badge_bn: e.target.value })}
                      placeholder="হট ডিল • ৫০% ছাড়"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Title: English & Bangla */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'শিরোনাম (English) *' : 'Title (English) *'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_top_title_en}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_top_title_en: e.target.value })}
                      placeholder="Modern Tech & Watches"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'শিরোনাম (বাংলা) *' : 'Title (Bangla) *'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_top_title_bn}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_top_title_bn: e.target.value })}
                      placeholder="স্মার্ট গ্যাজেট ও ঘড়ি"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Subtitle: English & Bangla */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'সাব-টাইটেল (English)' : 'Subtitle (English)'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_top_subtitle_en}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_top_subtitle_en: e.target.value })}
                      placeholder="Premium Gear at Best Value"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'সাব-টাইটেল (বাংলা)' : 'Subtitle (Bangla)'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_top_subtitle_bn}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_top_subtitle_bn: e.target.value })}
                      placeholder="সেরা মূল্যে প্রিমিয়াম ব্র্যান্ড"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Button Text & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'বাটন (EN)' : 'Button (EN)'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_top_button_en}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_top_button_en: e.target.value })}
                      placeholder="Shop Now"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'বাটন (বাংলা)' : 'Button (BN)'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_top_button_bn}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_top_button_bn: e.target.value })}
                      placeholder="এখনই কিনুন"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'ক্লিক লিংক (URL)' : 'Click Link (URL)'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_top_link}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_top_link: e.target.value })}
                      placeholder="/shop or /category/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: BOTTOM SIDE BANNER */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                      2
                    </span>
                    <span className="font-black text-white text-sm">
                      {isBn ? '২য় সাইড ব্যানার (নিচের কার্ড)' : 'Side Card 2 (Bottom Banner)'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {isBn ? 'ফ্রি ডেলিভারি' : 'Free Delivery'}
                  </span>
                </div>

                {/* Image Upload */}
                <ImageUploadField
                  label={isBn ? 'ব্যানার ইমেজ (Landscape Card Image) *' : 'Banner Image *'}
                  value={sidePromos.side_banner_bottom_image}
                  onChange={(url) => setSidePromos({ ...sidePromos, side_banner_bottom_image: url })}
                  placeholder="https://images.unsplash.com/... or upload image"
                  helpText={isBn ? 'ল্যাপটপ বা ডিভাইস থেকে ছবি আপলোড করুন।' : 'Upload or paste image URL.'}
                  recommendedSize="600 x 380 px"
                />

                {/* Badge: English & Bangla */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'ব্যাজ (English)' : 'Badge (English)'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_bottom_badge_en}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_bottom_badge_en: e.target.value })}
                      placeholder="FREE HOME DELIVERY"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'ব্যাজ (বাংলা)' : 'Badge (Bangla)'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_bottom_badge_bn}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_bottom_badge_bn: e.target.value })}
                      placeholder="ফ্রি ডেলিভারি অফার"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Title: English & Bangla */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'শিরোনাম (English) *' : 'Title (English) *'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_bottom_title_en}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_bottom_title_en: e.target.value })}
                      placeholder="Latest Lifestyle Fashion"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'শিরোনাম (বাংলা) *' : 'Title (Bangla) *'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_bottom_title_bn}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_bottom_title_bn: e.target.value })}
                      placeholder="লেটেস্ট ট্রেন্ডি ফ্যাশন"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Subtitle: English & Bangla */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'সাব-টাইটেল (English)' : 'Subtitle (English)'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_bottom_subtitle_en}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_bottom_subtitle_en: e.target.value })}
                      placeholder="Curated Apparel & Lifestyle"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'সাব-টাইটেল (বাংলা)' : 'Subtitle (Bangla)'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_bottom_subtitle_bn}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_bottom_subtitle_bn: e.target.value })}
                      placeholder="নতুন প্রিমিয়াম পোশাক কালেকশন"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Button Text & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'বাটন (EN)' : 'Button (EN)'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_bottom_button_en}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_bottom_button_en: e.target.value })}
                      placeholder="Explore Deals"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'বাটন (বাংলা)' : 'Button (BN)'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_bottom_button_bn}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_bottom_button_bn: e.target.value })}
                      placeholder="অফার দেখুন"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold text-xs block mb-1">
                      {isBn ? 'ক্লিক লিংক (URL)' : 'Click Link (URL)'}
                    </label>
                    <input
                      type="text"
                      value={sidePromos.side_banner_bottom_link}
                      onChange={(e) => setSidePromos({ ...sidePromos, side_banner_bottom_link: e.target.value })}
                      placeholder="/shop or /category/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingSidePromos}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSidePromos ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving Changes...') : (isBn ? 'সকল পরিবর্তন সংরক্ষণ করুন' : 'Save All Changes')}</span>
              </button>
            </div>
          </div>
        </form>
      )}

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
