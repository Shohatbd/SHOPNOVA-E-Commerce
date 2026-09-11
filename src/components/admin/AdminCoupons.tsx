import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { Coupon } from '../../types/index.ts';
import { api } from '../../services/api.ts';

export const AdminCoupons: React.FC = () => {
  const { t, language } = useLanguage();
  const isBn = language === 'bn';
  const { formatPrice } = useSettings();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'fixed' as 'fixed' | 'percentage',
    discount_value: 100,
    min_order_amount: 1000,
    max_discount_amount: 500,
    usage_limit: 100,
    is_active: 1
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminCoupons();
      if (res.success) setCoupons(res.coupons || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: 'EID2026',
      discount_type: 'fixed',
      discount_value: 200,
      min_order_amount: 1500,
      max_discount_amount: 500,
      usage_limit: 50,
      is_active: 1
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order_amount: c.min_order_amount || 0,
      max_discount_amount: c.max_discount_amount || 0,
      usage_limit: c.usage_limit || 100,
      is_active: c.is_active ?? 1
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.code.trim()) {
      setErrorMsg(isBn ? 'কুপন কোড আবশ্যক।' : 'Coupon code is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCoupon) {
        await api.updateCoupon(editingCoupon.id, formData);
      } else {
        await api.createCoupon(formData);
      }
      setIsModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      setErrorMsg(err.message || (isBn ? 'কুপন সংরক্ষণ করতে ব্যর্থ হয়েছে।' : 'Failed to save coupon.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await api.deleteCoupon(id);
      setDeleteConfirmId(null);
      loadCoupons();
    } catch (err: any) {
      console.error('Failed to delete coupon:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-3xl">
        <div>
          <h2 className="text-base font-black text-white">
            {isBn ? 'ডিসকাউন্ট কুপন ও ভাউচার' : 'Discount Coupons & Vouchers'}
          </h2>
          <p className="text-xs text-slate-400">
            {isBn ? 'প্রমোশনাল ডিসকাউন্ট কোড এবং পার্সেন্টেজ ভাউচার ম্যানেজ করুন' : 'Create promotional discount codes and percentage vouchers'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isBn ? 'নতুন কুপন যোগ করুন' : 'Create Coupon'}</span>
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold">{isBn ? 'কুপন লোড হচ্ছে...' : 'Loading coupons...'}</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">{isBn ? 'কোনো ডিসকাউন্ট কুপন পাওয়া যায়নি।' : 'No active discount coupons found.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3">{isBn ? 'কুপন কোড' : 'Coupon Code'}</th>
                  <th className="pb-3">{isBn ? 'ডিসকাউন্ট' : 'Discount Type & Value'}</th>
                  <th className="pb-3">{isBn ? 'ন্যূনতম অর্ডার' : 'Min Order'}</th>
                  <th className="pb-3">{isBn ? 'ব্যবহার সীমা' : 'Usage Count / Limit'}</th>
                  <th className="pb-3">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="pb-3 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3">
                      <span className="font-mono font-black text-amber-400 uppercase text-sm bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-white">
                      {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `${formatPrice(c.discount_value)} OFF`}
                    </td>
                    <td className="py-3 text-slate-300">{formatPrice(c.min_order_amount)}</td>
                    <td className="py-3 text-slate-300">
                      {c.used_count} / {c.usage_limit || '∞'} used
                    </td>
                    <td className="py-3">
                      {c.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                          {isBn ? 'সক্রিয় (Active)' : 'Active'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800">
                          {isBn ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title={isBn ? 'এডিট করুন' : 'Edit Coupon'}
                          className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(c.id)}
                          title={isBn ? 'ডিলিট করুন' : 'Delete Coupon'}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-white mb-2">
              {isBn ? 'কুপন ডিলিট নিশ্চিত করুন' : 'Confirm Delete Coupon'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {isBn ? 'আপনি কি নিশ্চিত এই কুপনটি ডিলিট করতে চান? এটি পুনরায় ফিরিয়ে আনা যাবে না।' : 'Are you sure you want to permanently delete this coupon?'}
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

          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-black text-white">
                {editingCoupon 
                  ? (isBn ? 'কুপন এডিট করুন' : 'Edit Coupon') 
                  : (isBn ? 'নতুন কুপন তৈরি করুন' : 'Create New Coupon')}
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
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'কুপন কোড (বড় হাতের অক্ষরে) *' : 'Coupon Code (Uppercase) *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. WELCOME100"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'ডিসকাউন্টের ধরণ' : 'Discount Type'}
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="fixed">{isBn ? 'নির্দিষ্ট টাকা (৳)' : 'Fixed Taka (৳)'}</option>
                    <option value="percentage">{isBn ? 'শতাংশ (%)' : 'Percentage (%)'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'ডিসকাউন্ট পরিমাণ *' : 'Discount Value *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'সর্বনিম্ন অর্ডার মূল্য (৳)' : 'Min Order Amount (৳)'}
                  </label>
                  <input
                    type="number"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'সর্বোচ্চ ছাড় (শতাংশের জন্য)' : 'Max Discount (for %)'}
                  </label>
                  <input
                    type="number"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({ ...formData, max_discount_amount: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'ব্যবহারের সর্বোচ্চ সীমা' : 'Usage Limit'}
                  </label>
                  <input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'স্ট্যাটাস' : 'Status'}
                  </label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>{isBn ? 'সক্রিয় (Active)' : 'Active'}</option>
                    <option value={0}>{isBn ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
                  </select>
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
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (editingCoupon ? (isBn ? 'আপডেট করুন' : 'Update Coupon') : (isBn ? 'সংরক্ষণ করুন' : 'Save Coupon'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
