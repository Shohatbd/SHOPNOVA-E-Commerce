import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, Trash2, ShieldCheck, EyeOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../services/api.ts';

export const AdminReviews: React.FC = () => {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminReviews();
      if (res.success) setReviews(res.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (id: string, approve: boolean) => {
    const status = approve ? 'approved' : 'rejected';
    await api.moderateReview(id, { status, is_approved: approve ? 1 : 0 });
    loadReviews();
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await api.deleteReview(id);
      setDeleteConfirmId(null);
      loadReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-3xl flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white">
            {isBn ? 'গ্রাহক রিভিউ ও মতামত' : 'Customer Reviews & Moderation'}
          </h2>
          <p className="text-xs text-slate-400">
            {isBn ? 'গ্রাহকদের রেটিং ও ভেরিফাইড প্রোডাক্ট রিভিউ মডারেট ও নিয়ন্ত্রণ করুন' : 'Approve, reject, or delete customer ratings and product testimonials'}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400">
          {isBn ? `মোট রিভিউ: ${reviews.length}` : `Total Reviews: ${reviews.length}`}
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold">{isBn ? 'রিভিউ লোড হচ্ছে...' : 'Loading reviews...'}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">{isBn ? 'এখনও কোনো রিভিউ পাওয়া যায়নি।' : 'No customer reviews yet.'}</div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {reviews.map((rev) => {
              const isApproved = rev.status === 'approved' || rev.is_approved === 1 || rev.is_approved === '1';

              return (
                <div key={rev.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">{rev.user_name || 'Customer'}</span>
                      {rev.is_verified_purchase === 1 && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {isBn ? 'ভেরিফাইড বায়্যার' : 'Verified Purchase'}
                        </span>
                      )}
                      <span className="text-slate-500">• Product: <strong className="text-amber-400">{rev.product_name || rev.product_id}</strong></span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        isApproved
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {isApproved ? (isBn ? 'অনুমোদিত' : 'Approved') : (isBn ? 'হাইড করা / বাতিল' : 'Hidden / Rejected')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                      <span className="text-slate-400 ml-2 text-[11px]">{rev.created_at || 'Just now'}</span>
                    </div>

                    <p className="text-slate-300 leading-relaxed max-w-2xl bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 font-noto">
                      "{rev.comment || 'No text review'}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isApproved ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(rev.id, false)}
                        className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/80 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>{isBn ? 'হাইড করুন' : 'Hide / Reject'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(rev.id, true)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isBn ? 'অনুমোদন দিন' : 'Approve'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(rev.id)}
                      title={isBn ? 'ডিলিট করুন' : 'Delete Review'}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-white mb-2">
              {isBn ? 'রিভিউ ডিলিট নিশ্চিত করুন' : 'Confirm Delete Review'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {isBn ? 'আপনি কি নিশ্চিত এই গ্রাহকের রিভিউটি ডিলিট করতে চান?' : 'Are you sure you want to delete this review permanently?'}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDelete(deleteConfirmId)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (isBn ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...') : (isBn ? 'ডিলিট করুন' : 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
