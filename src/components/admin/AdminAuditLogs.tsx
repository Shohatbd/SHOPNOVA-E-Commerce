import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Search,
  RefreshCw,
  User,
  Filter,
  CheckCircle2,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../services/api.ts';

export const AdminAuditLogs: React.FC = () => {
  const { isBn } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isCleaning, setIsCleaning] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAuditLogs();
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanup7Days = async () => {
    setIsCleaning(true);
    try {
      const res = await api.cleanupAuditLogs(7);
      if (res.success) {
        await fetchLogs();
      }
    } catch (err) {
      console.error('Failed to cleanup old logs:', err);
    } finally {
      setIsCleaning(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await api.deleteAuditLog(id);
      if (res.success) {
        setLogs((prev) => prev.filter((l) => l.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error('Failed to delete audit log:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const adminName = log.admin_name || log.user_name || '';
    const matchesSearch =
      (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (adminName && adminName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAction =
      selectedAction === 'all' ||
      (log.action && log.action.toLowerCase().includes(selectedAction.toLowerCase()));

    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action: string) => {
    const act = (action || '').toLowerCase();
    if (act.includes('create') || act.includes('insert') || act.includes('add') || act.includes('receive')) {
      return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
    }
    if (act.includes('delete') || act.includes('remove') || act.includes('purge') || act.includes('clear')) {
      return 'bg-rose-950/80 text-rose-400 border-rose-800';
    }
    if (act.includes('update') || act.includes('edit') || act.includes('status') || act.includes('adjust') || act.includes('return')) {
      return 'bg-sky-950/80 text-sky-400 border-sky-800';
    }
    if (act.includes('login') || act.includes('auth') || act.includes('password') || act.includes('export')) {
      return 'bg-amber-950/80 text-amber-400 border-amber-800';
    }
    return 'bg-slate-900 text-slate-300 border-slate-700';
  };

  return (
    <div id="admin-audit-logs" className="space-y-4 font-sans text-[13px]">
      {/* Header Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold shrink-0">
            <ScrollText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">
              {isBn ? 'সিস্টেম অডিট ও অ্যাক্টিভিটি লগ' : 'System Audit & Activity Logs'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBn
                ? 'অ্যাডমিন অ্যাকশন, ডেটা পরিবর্তন, লগইন ও সিকিউরিটি ইভেন্টের রিয়েল-টাইম ট্র্যাকিং'
                : 'Real-time immutable security trace of administrative changes, updates, logins, and order events'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-cleanup-audit-logs"
            type="button"
            onClick={handleCleanup7Days}
            disabled={isCleaning}
            title={isBn ? '৭ দিনের আগের লগ পরিষ্কার করুন' : 'Clean logs older than 7 days'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className={`w-3.5 h-3.5 ${isCleaning ? 'animate-spin' : ''}`} />
            <span>{isBn ? '৭ দিনের আগের তথ্য ডিলিট' : 'Purge >7 Days Logs'}</span>
          </button>

          <button
            id="btn-refresh-audit-logs"
            type="button"
            onClick={fetchLogs}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 7-Day Auto Retention Info Bar */}
      <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-300/90">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {isBn
              ? 'অটোমেটিক রিটেনশন পলিসি সক্রিয়: বিগত ৭ দিনের অডিট রেকর্ড সংরক্ষিত থাকে। ৭ দিনের পূর্বের সকল রিপোর্ট স্বয়ংক্রিয়ভাবে মুছে ফেলা হয়।'
              : '7-Day Auto Retention Active: System retains the last 7 days of audit logs. Reports older than 7 days are automatically purged.'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-audit-search"
            type="text"
            placeholder={isBn ? 'অ্যাডমিন নাম, অ্যাকশন, IP বা ডিটেইলস দিয়ে সার্চ করুন...' : 'Search logs by admin, action, IP or details...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            id="select-audit-filter-action"
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">{isBn ? 'সব অ্যাকশন টাইপ' : 'All Action Types'}</option>
            <option value="create">{isBn ? 'তৈরি / নতুন যুক্ত' : 'Create / Add'}</option>
            <option value="update">{isBn ? 'আপডেট / পরিবর্তন' : 'Update / Edit'}</option>
            <option value="delete">{isBn ? 'ডিলিট / রিমুভ' : 'Delete / Remove'}</option>
            <option value="login">{isBn ? 'লগইন / নিরাপত্তা' : 'Auth / Login'}</option>
            <option value="order">{isBn ? 'অর্ডার ইভেন্ট' : 'Order Events'}</option>
            <option value="export">{isBn ? 'এক্সপোর্ট / ব্যাকআপ' : 'Export / Backup'}</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>{isBn ? 'অডিট রেকর্ড লোড হচ্ছে...' : 'Loading Audit Records...'}</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-semibold">{isBn ? 'কোনো অডিট রেকর্ড পাওয়া যায়নি।' : 'No audit records match your filter.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">{isBn ? 'সময়' : 'Timestamp'}</th>
                  <th className="py-3 px-4">{isBn ? 'অ্যাডমিন / ইউজার' : 'Admin / User'}</th>
                  <th className="py-3 px-4">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                  <th className="py-3 px-4">{isBn ? 'বিস্তারিত তথ্য' : 'Entity & Details'}</th>
                  <th className="py-3 px-4">{isBn ? 'আইপি অ্যাড্রেস' : 'IP Address'}</th>
                  <th className="py-3 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log, idx) => {
                  const adminName = log.admin_name || log.user_name || log.admin_id || log.user_id || 'System / Admin';

                  return (
                    <tr key={log.id || idx} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(log.created_at || Date.now()).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{adminName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-md break-words font-noto">
                        {log.details || log.description || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(log.id)}
                          title={isBn ? 'লগ ডিলিট করুন' : 'Delete Log'}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2.5 text-[11px] text-slate-400 flex justify-between items-center">
          <span>{filteredLogs.length} {isBn ? 'টি রেকর্ড সংরক্ষিত আছে' : 'total audit entries recorded'}</span>
          <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isBn ? 'লাইভ সিকিউরিটি ট্রেস অ্যাক্টিভ' : 'Live Audit Trace Active'}</span>
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white">
              {isBn ? 'অডিট লগ মুছে ফেলতে চান?' : 'Delete Audit Log Entry?'}
            </h3>
            <p className="text-xs text-slate-400">
              {isBn
                ? 'এই অডিট রেকর্ডটি স্থায়ীভাবে মুছে ফেলা হবে। আপনি কি নিশ্চিত?'
                : 'This action will permanently remove this audit log entry. Are you sure?'}
            </p>
            <div className="flex justify-end gap-2 pt-2">
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

