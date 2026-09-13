import React, { useState, useEffect } from 'react';
import {
  Mail,
  Inbox,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Trash2,
  Send,
  Phone,
  User,
  Search,
  Filter,
  Settings,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Archive,
  MessageCircle,
  Sparkles,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { api } from '../../services/api.ts';

interface ContactMessage {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  admin_notes?: string;
  ip_address?: string;
  created_at: string;
  replied_at?: string;
}

export const AdminMessages: React.FC = () => {
  const { isBn } = useLanguage();
  const { settings, refreshSettings } = useSettings();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, replied: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin note editing
  const [adminNote, setAdminNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Email reply form
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyResult, setReplyResult] = useState<{ success: boolean; message: string } | null>(null);

  // SMTP Settings modal
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState({
    smtp_enabled: '0',
    smtp_host: 'smtp.gmail.com',
    smtp_port: '465',
    smtp_secure: '1',
    smtp_user: '',
    smtp_pass: '',
    smtp_from_name: 'SHOPHATBD Support',
    smtp_from_email: '',
    admin_notification_email: 'liakot911@gmail.com'
  });
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Delete confirmation & action notifications (bypasses iframe window.confirm suppression)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const [msgRes, statsRes] = await Promise.all([
        api.getContactMessages({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery.trim() || undefined
        }),
        api.getContactStats()
      ]);

      if (msgRes.success && Array.isArray(msgRes.messages)) {
        setMessages(msgRes.messages);
        if (selectedMessage) {
          const updated = msgRes.messages.find((m: ContactMessage) => m.id === selectedMessage.id);
          if (updated) setSelectedMessage(updated);
        } else if (msgRes.messages.length > 0) {
          setSelectedMessage(msgRes.messages[0]);
        }
      }

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Failed to load contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [statusFilter]);

  // Sync SMTP fields from site settings when modal opens
  useEffect(() => {
    if (settings) {
      setSmtpConfig({
        smtp_enabled: settings.smtp_enabled || '0',
        smtp_host: settings.smtp_host || 'smtp.gmail.com',
        smtp_port: settings.smtp_port || '465',
        smtp_secure: settings.smtp_secure !== undefined ? settings.smtp_secure : '1',
        smtp_user: settings.smtp_user || '',
        smtp_pass: settings.smtp_pass || '',
        smtp_from_name: settings.smtp_from_name || `${settings.site_name || 'SHOPHATBD'} Support`,
        smtp_from_email: settings.smtp_from_email || settings.contact_email || '',
        admin_notification_email: settings.admin_notification_email || 'liakot911@gmail.com'
      });
    }
  }, [settings, showSmtpModal]);

  // When selected message changes, update admin note input
  useEffect(() => {
    if (selectedMessage) {
      setAdminNote(selectedMessage.admin_notes || '');
      setReplySubject(`Re: ${selectedMessage.subject || 'Customer Care Inquiry'}`);
      setReplyBody(
        `Dear ${selectedMessage.name},\n\nThank you for reaching out to SHOPHATBD. Regarding your message:\n\n\n\nBest regards,\nSHOPHATBD Customer Care Team`
      );
      setReplyResult(null);

      // Auto mark unread as read when viewed
      if (selectedMessage.status === 'unread') {
        handleUpdateStatus(selectedMessage.id, 'read');
      }
    }
  }, [selectedMessage?.id]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateContactStatus(id, { status: newStatus });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus as any } : m))
      );
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
      api.getContactStats().then((res) => {
        if (res.success && res.stats) setStats(res.stats);
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedMessage) return;
    setSavingNote(true);
    try {
      await api.updateContactStatus(selectedMessage.id, { admin_notes: adminNote });
      setSelectedMessage((prev) => (prev ? { ...prev, admin_notes: adminNote } : null));
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMessage.id ? { ...m, admin_notes: adminNote } : m))
      );
    } catch (err) {
      console.error('Failed to save admin note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const promptDeleteMessage = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteMessage = async (id: string) => {
    try {
      setDeletingId(id);
      await api.deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        const remaining = messages.filter((m) => m.id !== id);
        setSelectedMessage(remaining[0] || null);
      }
      setActionNotice(isBn ? 'বার্তাটি সফলভাবে মুছে ফেলা হয়েছে।' : 'Message deleted successfully.');
      setTimeout(() => setActionNotice(null), 3500);
      api.getContactStats().then((res) => {
        if (res.success && res.stats) setStats(res.stats);
      });
    } catch (err) {
      console.error('Failed to delete message:', err);
      setActionNotice(isBn ? 'বার্তা মুছতে ব্যর্থ হয়েছে।' : 'Failed to delete message.');
      setTimeout(() => setActionNotice(null), 3500);
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !selectedMessage.email || !replyBody.trim()) return;
    setSendingReply(true);
    setReplyResult(null);
    try {
      const res = await api.replyToContact(selectedMessage.id, {
        subject: replySubject,
        replyContent: replyBody.trim()
      });

      if (res.success) {
        setReplyResult({ success: true, message: res.message || 'ইমেইল সফলভাবে পাঠানো হয়েছে!' });
        handleUpdateStatus(selectedMessage.id, 'replied');
        setTimeout(() => {
          setShowReplyModal(false);
        }, 1500);
      } else {
        setReplyResult({ success: false, message: res.message || 'ইমেইল পাঠানো ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setReplyResult({ success: false, message: err.message || 'ত্রুটি হয়েছে।' });
    } finally {
      setSendingReply(false);
    }
  };

  const handleSaveSmtp = async () => {
    setSavingSmtp(true);
    try {
      await api.updateSettings({
        settings: smtpConfig
      });
      await refreshSettings();
      alert(isBn ? 'ইমেইল ও নোটিফিকেশন সেটিংস সংরক্ষিত হয়েছে।' : 'Email & notification settings saved successfully.');
      setShowSmtpModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save SMTP settings');
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await api.testSmtpConnection({
        ...smtpConfig,
        test_recipient: smtpConfig.admin_notification_email || 'liakot911@gmail.com'
      });
      setSmtpTestResult(res);
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        message: err.message || 'SMTP কানেকশন ব্যর্থ হয়েছে।'
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  const copyToClipboard = (text: string, type: 'phone' | 'email') => {
    navigator.clipboard.writeText(text);
    if (type === 'phone') {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {isBn ? 'কাস্টমার ইনবক্স ও বার্তা' : 'Customer Inbox & Messages'}
            </h2>
            {stats.unread > 0 && (
              <span className="px-2.5 py-0.5 bg-rose-500 text-white font-bold text-xs rounded-full animate-pulse">
                {stats.unread} {isBn ? 'নতুন' : 'new'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isBn
              ? 'কাস্টমাররা "Send Us a Quick Message" ফর্মে যে বার্তা পাঠান, তা এখানে সরাসরি ইনবক্সে জমা হয় এবং আপনার ইমেইলে পৌঁছায়।'
              : 'Messages submitted via the storefront "Send Us a Quick Message" form arrive here and forward to your email.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSmtpModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer border border-slate-200"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span>{isBn ? 'ইমেইল ও SMTP সেটআপ' : 'Email & SMTP Setup'}</span>
          </button>

          <button
            onClick={loadMessages}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200"
            title={isBn ? 'রিফ্রেশ' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Info Card Explaining Email Notification Process */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-sm">
              {isBn ? 'মেসেজ ডেলিভারি এবং ইমেইল প্রসেস কীভাবে কাজ করে?' : 'How Message Delivery & Forwarding Works'}
            </span>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              {isBn ? (
                <>
                  ১. কাস্টমার ওয়েবসাইট থেকে মেসেজ দিলে তা সাথে সাথে এই <strong>অ্যাডমিন ইনবক্সে</strong> সংরক্ষিত হয়।<br />
                  ২. আপনার নিজের ইমেইল (<strong>{settings?.admin_notification_email || 'liakot911@gmail.com'}</strong>)-এ সাথে সাথে নোটিফিকেশন পেতে উপরের <strong>"ইমেইল ও SMTP সেটআপ"</strong> বাটনে ক্লিক করে Gmail App Password টি একবার বসিয়ে দিন।
                </>
              ) : (
                <>
                  1. When customers submit a message, it is instantly recorded in this <strong>Admin Inbox</strong>.<br />
                  2. To forward messages directly to your personal email (<strong>{settings?.admin_notification_email || 'liakot911@gmail.com'}</strong>), configure your Gmail SMTP App Password via the <strong>Email & SMTP Setup</strong> button.
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSmtpModal(true)}
          className="self-start md:self-center px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-2xs whitespace-nowrap transition-colors cursor-pointer"
        >
          {isBn ? 'সেটিংস কনফিগার করুন' : 'Configure SMTP'}
        </button>
      </div>

      {/* Action Notification Toast/Banner */}
      {actionNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">{isBn ? 'সর্বমোট বার্তা' : 'Total Inquiries'}</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-600 font-medium">{isBn ? 'নতুন / অপঠিত' : 'Unread Inquiries'}</span>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.unread}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-600 font-medium">{isBn ? 'উত্তর দেওয়া হয়েছে' : 'Replied'}</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.replied}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: isBn ? 'সকল বার্তা' : 'All' },
            { id: 'unread', label: isBn ? 'অপঠিত' : 'Unread' },
            { id: 'read', label: isBn ? 'পঠিত' : 'Read' },
            { id: 'replied', label: isBn ? 'উত্তর দেওয়া' : 'Replied' },
            { id: 'archived', label: isBn ? 'আর্কাইভ' : 'Archived' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadMessages();
          }}
          className="relative w-full sm:w-72"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isBn ? 'নাম, ফোন বা ইমেইল খুঁজুন...' : 'Search by name, phone, email...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500"
          />
        </form>
      </div>

      {/* Main Two-Column View: Inquiries List & Detail Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Message List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{isBn ? 'ইনবক্স তালিকা' : 'Inquiries'} ({messages.length})</span>
            <span className="text-[11px] font-normal text-slate-500">
              {isBn ? 'নতুন বার্তা শীর্ষে' : 'Newest first'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
            {loading && messages.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>{isBn ? 'বার্তা লোড হচ্ছে...' : 'Loading messages...'}</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">
                  {isBn ? 'কোনো বার্তা পাওয়া যায়নি' : 'No inquiries found'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isBn
                    ? 'কাস্টমার সাপোর্ট পেজ থেকে নতুন বার্তা আসলে তা এখানে দেখাবে।'
                    : 'Customer messages from the contact page will appear here.'}
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const isUnread = msg.status === 'unread';

                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-amber-50/70 border-l-4 border-amber-500'
                        : isUnread
                        ? 'bg-slate-50/80 hover:bg-slate-100 font-semibold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isUnread && (
                          <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {msg.name}
                        </h4>
                      </div>

                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(msg.created_at).toLocaleDateString('bn-BD', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {msg.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2 truncate">
                        {msg.phone && (
                          <span className="flex items-center gap-1 text-slate-600 truncate">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {msg.phone}
                          </span>
                        )}
                        {msg.email && !msg.phone && (
                          <span className="flex items-center gap-1 text-slate-600 truncate">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {msg.email}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            msg.status === 'unread'
                              ? 'bg-rose-100 text-rose-700'
                              : msg.status === 'replied'
                              ? 'bg-emerald-100 text-emerald-700'
                              : msg.status === 'read'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {msg.status === 'unread'
                            ? isBn ? 'নতুন' : 'Unread'
                            : msg.status === 'replied'
                            ? isBn ? 'উত্তর দেওয়া' : 'Replied'
                            : msg.status === 'read'
                            ? isBn ? 'পঠিত' : 'Read'
                            : isBn ? 'আর্কাইভ' : 'Archived'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            promptDeleteMessage(msg.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title={isBn ? 'বার্তাটি মুছুন' : 'Delete message'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Inquiry View */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          {selectedMessage ? (
            <div className="space-y-6">
              {/* Message Header & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">
                      {selectedMessage.name}
                    </h3>
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => handleUpdateStatus(selectedMessage.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                        selectedMessage.status === 'unread'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : selectedMessage.status === 'replied'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : selectedMessage.status === 'read'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="unread">{isBn ? 'Mark as Unread' : 'Mark as Unread'}</option>
                      <option value="read">{isBn ? 'Mark as Read' : 'Mark as Read'}</option>
                      <option value="replied">{isBn ? 'Mark as Replied' : 'Mark as Replied'}</option>
                      <option value="archived">{isBn ? 'Archive' : 'Archive'}</option>
                    </select>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">
                    {new Date(selectedMessage.created_at).toLocaleString('bn-BD', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedMessage.email && (
                    <button
                      onClick={() => setShowReplyModal(true)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isBn ? 'ইমেইল উত্তর পাঠান' : 'Reply via Email'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => promptDeleteMessage(selectedMessage.id)}
                    className="px-3 py-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer border border-rose-200 flex items-center gap-1.5 text-xs font-bold"
                    title={isBn ? 'বার্তা মুছে ফেলুন' : 'Delete message'}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isBn ? 'মুছে ফেলুন' : 'Delete'}</span>
                  </button>
                </div>
              </div>

              {/* Customer Contact Badges (Phone & Email with One-Click Actions) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        {isBn ? 'মোবাইল নম্বর' : 'Phone'}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate block">
                        {selectedMessage.phone || (isBn ? 'উল্লেখ নেই' : 'Not provided')}
                      </span>
                    </div>
                  </div>

                  {selectedMessage.phone && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyToClipboard(selectedMessage.phone!, 'phone')}
                        className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        title={isBn ? 'কপি করুন' : 'Copy'}
                      >
                        {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title={isBn ? 'সরাসরি কল করুন' : 'Call'}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title={isBn ? 'হোয়াটসঅ্যাপ মেসেজ' : 'WhatsApp'}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        {isBn ? 'ইমেইল অ্যাড্রেস' : 'Email'}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate block">
                        {selectedMessage.email || (isBn ? 'উল্লেখ নেই' : 'Not provided')}
                      </span>
                    </div>
                  </div>

                  {selectedMessage.email && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyToClipboard(selectedMessage.email!, 'email')}
                        className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        title={isBn ? 'কপি করুন' : 'Copy'}
                      >
                        {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={isBn ? 'মেইল অ্যাপে খুলুন' : 'Open in Mail App'}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Content Body */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {isBn ? 'কাস্টমারের পাঠানো মেসেজ:' : 'Customer Inquiry Details:'}
                </span>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {isBn ? 'এডমিন ইন্টারনাল নোট (শুধুমাত্র এডমিন দেখতে পাবেন)' : 'Internal Admin Notes'}
                  </span>
                  {selectedMessage.replied_at && (
                    <span className="text-[11px] text-emerald-600 font-medium">
                      ✓ {isBn ? 'উত্তর পাঠানো হয়েছে:' : 'Replied on:'}{' '}
                      {new Date(selectedMessage.replied_at).toLocaleDateString('bn-BD')}
                    </span>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    isBn
                      ? 'এই কাস্টমারের বিষয়ে কোনো মন্তব্য বা নোট লিখে রাখুন (যেমন: ফোনে কথা হয়েছে, সমাধান দেওয়া হয়েছে)...'
                      : 'Add private staff note regarding this inquiry...'
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 resize-none"
                />
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {savingNote ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'নোট সংরক্ষণ করুন' : 'Save Note')}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                {isBn ? 'বিস্তারিত দেখতে বাম পাশের তালিকা থেকে বার্তা নির্বাচন করুন' : 'Select a message from the left to view details'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal (Send direct email to customer) */}
      {showReplyModal && selectedMessage && selectedMessage.email && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">
                  {isBn ? 'কাস্টমারকে ইমেইল উত্তর পাঠান' : 'Reply to Customer via Email'}
                </h3>
              </div>
              <button
                onClick={() => setShowReplyModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div>
                  <span className="font-bold text-slate-600">{isBn ? 'প্রাপক:' : 'To:'} </span>
                  <span className="font-semibold text-slate-900">{selectedMessage.name} ({selectedMessage.email})</span>
                </div>
              </div>

              {replyResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    replyResult.success
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {replyResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{replyResult.message}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{isBn ? 'ইমেইল বিষয় (Subject):' : 'Subject:'}</label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{isBn ? 'আপনার উত্তর বার্তা:' : 'Reply Message:'}</label>
                <textarea
                  rows={6}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={sendingReply}
                  onClick={handleSendReply}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {sendingReply ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>{isBn ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isBn ? 'ইমেইল পাঠান' : 'Send Email'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMTP / Email Settings Modal */}
      {showSmtpModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">
                  {isBn ? 'ইমেইল ও নোটিফিকেশন সেটিংস (SMTP Setup)' : 'Email & SMTP Notification Setup'}
                </h3>
              </div>
              <button
                onClick={() => setShowSmtpModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Guidance on Gmail Setup */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
                <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  {isBn ? 'জিমেইল দিয়ে কীভাবে ফ্রিতে কনফিগার করবেন?' : 'Quick Gmail Setup Guide (Free)'}
                </h4>
                <ol className="list-decimal list-inside text-amber-800 space-y-1 leading-relaxed">
                  <li>আপনার গুগল অ্যাকাউন্টে যান এবং <strong>2-Step Verification</strong> চালু করুন।</li>
                  <li>
                    <strong>myaccount.google.com/apppasswords</strong> ঠিকানায় গিয়ে 'Mail' এর জন্য একটি <strong>App Password</strong> তৈরি করুন।
                  </li>
                  <li>
                    সেই ১৬-ডিজিটের অ্যাপ পাসওয়ার্ডটি নিচের <strong>SMTP Password</strong> ঘরে বসিয়ে দিন।
                  </li>
                  <li>
                    <strong>Admin Alert Email</strong> ঘরে আপনার নিজস্ব ইমেইল (<strong>liakot911@gmail.com</strong>) রাখুন।
                  </li>
                </ol>
              </div>

              {smtpTestResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    smtpTestResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {smtpTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{smtpTestResult.message}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <label className="text-xs font-bold text-slate-900 block">
                      {isBn ? 'SMTP সার্ভিস সক্রিয় করুন' : 'Enable SMTP Service'}
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {isBn ? 'কাস্টমার মেসেজ আসলে এডমিন ইমেইলে অ্যালার্ট পাঠাবে' : 'Sends email alerts for new inquiries'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smtpConfig.smtp_enabled === '1'}
                    onChange={(e) =>
                      setSmtpConfig((prev) => ({ ...prev, smtp_enabled: e.target.checked ? '1' : '0' }))
                    }
                    className="w-5 h-5 text-amber-500 rounded-md focus:ring-amber-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isBn ? 'এডমিন অ্যালার্ট ইমেইল (যেখানে মেসেজ নোটিফিকেশন যাবে):' : 'Admin Alert Recipient Email:'}
                  </label>
                  <input
                    type="email"
                    value={smtpConfig.admin_notification_email}
                    onChange={(e) =>
                      setSmtpConfig((prev) => ({ ...prev, admin_notification_email: e.target.value }))
                    }
                    placeholder="liakot911@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    {isBn
                      ? 'কাস্টমাররা মেসেজ পাঠালে সাথে সাথে এই ইমেইলে অ্যালার্ট ইমেইল পৌঁছাবে।'
                      : 'Inquiries will be automatically forwarded to this email address.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">SMTP Host:</label>
                    <input
                      type="text"
                      value={smtpConfig.smtp_host}
                      onChange={(e) => setSmtpConfig((prev) => ({ ...prev, smtp_host: e.target.value }))}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">SMTP Port:</label>
                    <input
                      type="number"
                      value={smtpConfig.smtp_port}
                      onChange={(e) => setSmtpConfig((prev) => ({ ...prev, smtp_port: e.target.value }))}
                      placeholder="465"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    SMTP Username / Email (আপনার প্রেরক জিমেইল):
                  </label>
                  <input
                    type="text"
                    value={smtpConfig.smtp_user}
                    onChange={(e) => setSmtpConfig((prev) => ({ ...prev, smtp_user: e.target.value }))}
                    placeholder="yourshop@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    SMTP App Password (১৬ অক্ষরের গুগল অ্যাপ পাসওয়ার্ড):
                  </label>
                  <input
                    type="password"
                    value={smtpConfig.smtp_pass}
                    onChange={(e) => setSmtpConfig((prev) => ({ ...prev, smtp_pass: e.target.value }))}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{isBn ? 'প্রেরক নাম:' : 'From Name:'}</label>
                    <input
                      type="text"
                      value={smtpConfig.smtp_from_name}
                      onChange={(e) => setSmtpConfig((prev) => ({ ...prev, smtp_from_name: e.target.value }))}
                      placeholder="SHOPHATBD Support"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{isBn ? 'প্রেরক ইমেইল:' : 'From Email:'}</label>
                    <input
                      type="text"
                      value={smtpConfig.smtp_from_email}
                      onChange={(e) => setSmtpConfig((prev) => ({ ...prev, smtp_from_email: e.target.value }))}
                      placeholder="noreply@shophatbd.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Test Connection & Save */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  disabled={testingSmtp}
                  onClick={handleTestSmtp}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  {testingSmtp ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                      <span>{isBn ? 'টেস্ট হচ্ছে...' : 'Testing...'}</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isBn ? 'টেস্ট ইমেইল পাঠান' : 'Send Test Email'}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSmtpModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    disabled={savingSmtp}
                    onClick={handleSaveSmtp}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {savingSmtp ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সেটিংস সেভ করুন' : 'Save Settings')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Reliable in-app confirmation avoiding iframe browser alert suppression) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isBn ? 'বার্তাটি মুছে ফেলতে চান?' : 'Delete Message?'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'এই বার্তাটি ইনবক্স থেকে স্থায়ীভাবে মুছে ফেলা হবে।'
                    : 'This inquiry will be permanently deleted from your inbox.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800 mb-1">
                {messages.find((m) => m.id === deleteConfirmId)?.name || (isBn ? 'গ্রাহক' : 'Customer')}
              </p>
              <p className="line-clamp-3 text-slate-600 italic">
                "{messages.find((m) => m.id === deleteConfirmId)?.message}"
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deletingId === deleteConfirmId}
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirmId}
                onClick={() => confirmDeleteMessage(deleteConfirmId)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                {deletingId === deleteConfirmId ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isBn ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
