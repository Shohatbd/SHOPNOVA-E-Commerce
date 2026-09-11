import React, { useState, useEffect } from 'react';
import {
  Mail,
  Search,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Users,
  Download,
  AlertCircle,
  Clock,
  Send
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../services/api.ts';
import { formatDateTime } from '../../utils/formatters.ts';

export const AdminSubscribers: React.FC = () => {
  const { isBn } = useLanguage();

  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [deletingSubscriber, setDeletingSubscriber] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadSubscribers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminSubscribers(search);
      if (res?.success) {
        setSubscribers(res.subscribers || []);
      }
    } catch (err) {
      console.error('Failed to load subscribers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, [search]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopyAll = () => {
    if (subscribers.length === 0) return;
    const emailsList = subscribers.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(emailsList);
    setIsCopied(true);
    showToast('success', isBn ? 'সকল ইমেইল ক্লিপবোর্ডে কপি করা হয়েছে!' : 'All emails copied to clipboard!');
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleExportCsv = () => {
    if (subscribers.length === 0) return;
    let csvContent = 'data:text/csv;charset=utf-8,ID,Email,Status,Subscribed At\n';
    subscribers.forEach((s) => {
      csvContent += `"${s.id}","${s.email}","${s.status || 'active'}","${s.created_at || ''}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `subscribers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', isBn ? 'কাস্টমার সাবস্ক্রাইবার লিস্ট CSV ফাইল ডাউনলোড হয়েছে।' : 'CSV list downloaded.');
  };

  const handleDeleteSubscriber = async () => {
    if (!deletingSubscriber) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteSubscriber(deletingSubscriber.id);
      if (res?.success) {
        showToast('success', isBn ? 'ইমেইলটি সফলভাবে মুছে ফেলা হয়েছে।' : 'Subscriber deleted successfully.');
        setDeletingSubscriber(null);
        loadSubscribers();
      } else {
        showToast('error', res?.message || 'মুছে ফেলতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'মুছে ফেলতে ব্যর্থ হয়েছে।');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => formatDateTime(dateStr, isBn);

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
              : 'bg-rose-950 border-rose-500 text-rose-200'
          }`}
        >
          {notification.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-5 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {isBn ? 'নিউজলেটার গ্রাহক সাবস্ক্রিপশন লিস্ট' : 'Newsletter Subscribers List'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn
                  ? 'ওয়েবসাইটের ফুটার বা প্রোমো সাবস্ক্রিপশন বক্স থেকে যুক্ত হওয়া সকল কাস্টমারের তালিকা।'
                  : 'All customers who subscribed to newsletter offers and updates.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleCopyAll}
            disabled={subscribers.length === 0}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{isBn ? 'সকল ইমেইল কপি করুন' : 'Copy All Emails'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={subscribers.length === 0}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>{isBn ? 'CSV ডাউনলোড' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[11px] font-bold block uppercase tracking-wider">
              {isBn ? 'মোট সাবস্ক্রাইবার' : 'Total Subscribers'}
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{subscribers.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[11px] font-bold block uppercase tracking-wider">
              {isBn ? 'স্ট্যাটাস' : 'Status'}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg mt-1 inline-block">
              {isBn ? '১০০% সক্রিয় লিস্ট' : '100% Active List'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Send className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[11px] font-bold block uppercase tracking-wider">
              {isBn ? 'সর্বশেষ আপডেট' : 'Last Updated'}
            </span>
            <span className="text-xs font-bold text-slate-700 mt-1 block">
              {subscribers.length > 0 ? formatDate(subscribers[0].created_at) : (isBn ? 'কোন তথ্য নেই' : 'No data')}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBn ? 'ইমেইল দিয়ে সার্চ করুন...' : 'Search email...'}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={loadSubscribers}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          title={isBn ? 'রিফ্রেশ করুন' : 'Refresh'}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
            <p className="text-xs font-bold">{isBn ? 'সাবস্ক্রাইবার লোড হচ্ছে...' : 'Loading subscribers...'}</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Mail className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold">{isBn ? 'কোনো নিউজলেটার সাবস্ক্রাইবার পাওয়া যায়নি।' : 'No subscribers found.'}</p>
            <p className="text-xs text-slate-400">
              {isBn ? 'কাস্টমাররা ওয়েবসাইটের ফুটারে ইমেইল দিয়ে সাবস্ক্রাইব করলে এখানে জমা হবে।' : 'Subscribers will appear here when customers enter their email.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5 pl-5">#</th>
                  <th className="p-3.5">{isBn ? 'ইমেইল এড্রেস' : 'Email Address'}</th>
                  <th className="p-3.5">{isBn ? 'সাবস্ক্রিপশনের সময়' : 'Subscribed Date'}</th>
                  <th className="p-3.5">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="p-3.5 pr-5 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {subscribers.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5 text-slate-400 text-[11px] font-mono">{index + 1}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 font-bold text-[11px]">
                          {item.email ? item.email[0].toUpperCase() : '@'}
                        </div>
                        <span className="font-bold text-slate-900 select-all font-mono text-xs">{item.email}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-500 text-xs">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{isBn ? 'সক্রিয়' : 'Active'}</span>
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.email);
                            showToast('success', isBn ? 'ইমেইল কপি করা হয়েছে!' : 'Email copied!');
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                          title={isBn ? 'ইমেইল কপি করুন' : 'Copy email'}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingSubscriber(item)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title={isBn ? 'ডিলিট করুন' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
      {deletingSubscriber && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {isBn ? 'সাবস্ক্রাইবার মুছে ফেলবেন?' : 'Delete Subscriber?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-mono font-bold text-slate-800">{deletingSubscriber.email}</span>{' '}
                {isBn ? 'ইমেইলটি সাবস্ক্রাইবার তালিকা থেকে চিরতরে মুছে ফেলা হবে।' : 'will be removed from your newsletter list.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSubscriber(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteSubscriber}
                disabled={isDeleting}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isBn ? 'হ্যাঁ, ডিলিট করুন' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
