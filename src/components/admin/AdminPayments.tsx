import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Search,
  ShieldCheck,
  Edit2,
  Trash2,
  Plus,
  X,
  Check,
  AlertCircle,
  QrCode,
  Building,
  Smartphone,
  Banknote,
  Settings2,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { api } from '../../services/api.ts';
import { ImageUploadField } from './ImageUploadField.tsx';

export const AdminPayments: React.FC = () => {
  const { t, isBn } = useLanguage();
  const { formatPrice } = useSettings();

  const [activeTab, setActiveTab] = useState<'transactions' | 'gateways'>('gateways');
  const [payments, setPayments] = useState<any[]>([]);
  const [gateways, setGateways] = useState<any[]>([]);
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Gateway Modals
  const [editingGateway, setEditingGateway] = useState<any | null>(null);
  const [isAddGatewayOpen, setIsAddGatewayOpen] = useState(false);
  const [deletingGateway, setDeletingGateway] = useState<any | null>(null);
  const [gatewayForm, setGatewayForm] = useState({
    name_en: '',
    name_bn: '',
    gateway_type: 'bkash',
    account_number: '',
    account_type: 'Merchant',
    charge_percentage: 0,
    instruction_en: '',
    instruction_bn: '',
    logo_url: '',
    qr_code_url: '',
    is_active: 1,
    sort_order: 0
  });

  // Transaction Modals
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<any | null>(null);
  const [transactionForm, setTransactionForm] = useState({
    status: 'paid',
    payment_method: 'cod',
    transaction_id: '',
    amount: 0
  });

  const [isSaving, setIsSaving] = useState(false);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [gwRes, payRes] = await Promise.all([
        api.getPaymentGateways(),
        api.getAdminPayments()
      ]);
      if (gwRes.success) setGateways(gwRes.gateways || []);
      if (payRes.success) setPayments(payRes.payments || []);
    } catch (err) {
      console.error('Failed to load payments/gateways data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ---------------- GATEWAY HANDLERS ---------------- //
  const handleOpenAddGateway = () => {
    setIsAddGatewayOpen(true);
    setGatewayForm({
      name_en: '',
      name_bn: '',
      gateway_type: 'bkash',
      account_number: '',
      account_type: 'Merchant',
      charge_percentage: 0,
      instruction_en: '',
      instruction_bn: '',
      logo_url: '',
      qr_code_url: '',
      is_active: 1,
      sort_order: gateways.length + 1
    });
  };

  const handleOpenEditGateway = (gw: any) => {
    setEditingGateway(gw);
    setGatewayForm({
      name_en: gw.name_en || '',
      name_bn: gw.name_bn || '',
      gateway_type: gw.gateway_type || 'bkash',
      account_number: gw.account_number || '',
      account_type: gw.account_type || 'Merchant',
      charge_percentage: gw.charge_percentage || 0,
      instruction_en: gw.instruction_en || '',
      instruction_bn: gw.instruction_bn || '',
      logo_url: gw.logo_url || '',
      qr_code_url: gw.qr_code_url || '',
      is_active: gw.is_active ? 1 : 0,
      sort_order: gw.sort_order || 0
    });
  };

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingGateway) {
        const res = await api.updatePaymentGateway(editingGateway.id, gatewayForm);
        if (res.success) {
          showNotification('success', isBn ? 'পেমেন্ট গেটওয়ে সফলভাবে আপডেট করা হয়েছে।' : 'Payment gateway updated successfully.');
          setEditingGateway(null);
          loadAllData();
        } else {
          showNotification('error', res.message || (isBn ? 'গেটওয়ে আপডেট করতে সমস্যা হয়েছে।' : 'Failed to update gateway.'));
        }
      } else {
        const res = await api.createPaymentGateway(gatewayForm);
        if (res.success) {
          showNotification('success', isBn ? 'নতুন পেমেন্ট গেটওয়ে সফলভাবে যুক্ত হয়েছে।' : 'New payment gateway created successfully.');
          setIsAddGatewayOpen(false);
          loadAllData();
        } else {
          showNotification('error', res.message || (isBn ? 'গেটওয়ে যুক্ত করতে সমস্যা হয়েছে।' : 'Failed to add gateway.'));
        }
      }
    } catch (err: any) {
      showNotification('error', err.message || (isBn ? 'অপারেশন সম্পন্ন করা যায়নি।' : 'Operation failed.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGateway = async () => {
    if (!deletingGateway) return;
    setIsSaving(true);
    try {
      const res = await api.deletePaymentGateway(deletingGateway.id);
      if (res.success) {
        showNotification('success', isBn ? 'পেমেন্ট গেটওয়ে সফলভাবে মুছে ফেলা হয়েছে।' : 'Payment gateway deleted successfully.');
        setDeletingGateway(null);
        loadAllData();
      } else {
        showNotification('error', res.message || (isBn ? 'গেটওয়ে মুছে ফেলতে সমস্যা হয়েছে।' : 'Failed to delete gateway.'));
      }
    } catch (err: any) {
      showNotification('error', err.message || (isBn ? 'মুছে ফেলা যায়নি।' : 'Failed to delete.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleGatewayActive = async (gw: any) => {
    try {
      const newStatus = gw.is_active ? 0 : 1;
      const res = await api.updatePaymentGateway(gw.id, { is_active: newStatus });
      if (res.success) {
        showNotification('success', isBn ? `পেমেন্ট গেটওয়ে ${newStatus ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।` : `Payment gateway ${newStatus ? 'activated' : 'disabled'}.`);
        loadAllData();
      }
    } catch (err: any) {
      showNotification('error', isBn ? 'স্ট্যাটাস পরিবর্তন করা যায়নি।' : 'Failed to update status.');
    }
  };

  // ---------------- TRANSACTION HANDLERS ---------------- //
  const handleOpenEditTransaction = (tx: any) => {
    setEditingTransaction(tx);
    setTransactionForm({
      status: tx.status || 'paid',
      payment_method: tx.payment_method || 'cod',
      transaction_id: tx.transaction_id || '',
      amount: tx.amount || tx.grand_total || 0
    });
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    setIsSaving(true);
    try {
      const res = await api.updatePaymentTransaction(editingTransaction.id, transactionForm);
      if (res.success) {
        showNotification('success', isBn ? 'পেমেন্ট ট্রানজাকশন সফলভাবে আপডেট করা হয়েছে।' : 'Transaction record updated successfully.');
        setEditingTransaction(null);
        loadAllData();
      } else {
        showNotification('error', res.message || (isBn ? 'আপডেট করতে সমস্যা হয়েছে।' : 'Failed to update transaction.'));
      }
    } catch (err: any) {
      showNotification('error', err.message || (isBn ? 'অপারেশন সম্পন্ন করা যায়নি।' : 'Operation failed.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return;
    setIsSaving(true);
    try {
      const res = await api.deletePaymentTransaction(deletingTransaction.id);
      if (res.success) {
        showNotification('success', isBn ? 'পেমেন্ট ট্রানজাকশন রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।' : 'Transaction record deleted successfully.');
        setDeletingTransaction(null);
        loadAllData();
      } else {
        showNotification('error', res.message || (isBn ? 'মুছে ফেলতে সমস্যা হয়েছে।' : 'Failed to delete transaction.'));
      }
    } catch (err: any) {
      showNotification('error', err.message || (isBn ? 'মুছে ফেলা যায়নি।' : 'Failed to delete.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickTogglePaymentStatus = async (tx: any) => {
    const nextStatus = tx.status === 'paid' ? 'pending' : 'paid';
    try {
      const res = await api.updatePaymentTransaction(tx.id, {
        status: nextStatus,
        transaction_id: nextStatus === 'paid' && !tx.transaction_id ? `TXN-MANUAL-${Date.now()}` : tx.transaction_id
      });
      if (res.success) {
        showNotification('success', isBn ? `পেমেন্ট স্ট্যাটাস '${nextStatus === 'paid' ? 'পরিশোধিত' : 'অপেক্ষমান'}' করা হয়েছে।` : `Payment status changed to '${nextStatus}'.`);
        loadAllData();
      }
    } catch (err: any) {
      showNotification('error', isBn ? 'স্ট্যাটাস পরিবর্তন করা যায়নি।' : 'Failed to change status.');
    }
  };

  // Metrics
  const totalCollected = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const pendingCollection = payments
    .filter((p) => p.status !== 'paid')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Filtered transactions
  const filteredPayments = payments.filter((p) => {
    const matchesMethod = filterMethod === 'all' || p.payment_method?.toLowerCase() === filterMethod.toLowerCase();
    const matchesStatus = filterStatus === 'all' || p.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      !search ||
      p.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.customer_phone?.includes(search) ||
      p.transaction_id?.toLowerCase().includes(search.toLowerCase());
    return matchesMethod && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-800 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              {isBn ? 'মোট ট্রানজাকশন / ইনভয়েস' : 'Total Transactions & Invoices'}
            </span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {payments.length} {isBn ? 'টি রেকর্ড' : 'Records'}
          </p>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-3xl p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">
              {isBn ? 'পরিশোধিত অর্থ' : 'Settled & Paid Revenue'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-300">{formatPrice(totalCollected)}</p>
        </div>

        <div className="bg-amber-950/40 border border-amber-800/60 rounded-3xl p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400">
              {isBn ? 'বকেয়া ও অপেক্ষমান ক্যাশ' : 'Pending & Unpaid Cash'}
            </span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300">{formatPrice(pendingCollection)}</p>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('gateways')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'gateways'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>{isBn ? 'পেমেন্ট গেটওয়ে ও একাউন্ট' : 'Payment Gateways & Accounts'}</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-md bg-black/20 font-black">
            {gateways.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'transactions'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{isBn ? 'পেমেন্ট ও ইনভয়েস ট্রানজাকশন' : 'Transactions & Payment Ledger'}</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-md bg-black/20 font-black">
            {payments.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PAYMENT GATEWAYS & ACCOUNTS */}
      {/* ========================================================================= */}
      {activeTab === 'gateways' && (
        <div className="space-y-6">
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-sm">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-400" />
                <span>{isBn ? 'পেমেন্ট গেটওয়ে ও মার্চেন্ট একাউন্ট কনফিগারেশন' : 'Payment Gateways & Merchant Configuration'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isBn
                  ? 'বিকাশ, নগদ, রকেট, ব্যাংক ট্রান্সফার, ক্যাশ অন ডেলিভারি ইত্যাদি গেটওয়ের নম্বর, চার্জ এবং নির্দেশিকা পরিচালনা করুন।'
                  : 'Manage bKash, Nagad, Rocket, Bank Transfer, COD gateway numbers, charge fees, and checkout guidelines.'}
              </p>
            </div>

            <button
              onClick={handleOpenAddGateway}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন গেটওয়ে যুক্ত করুন' : 'Add New Gateway'}</span>
            </button>
          </div>

          {/* Gateways Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading ? (
              <div className="col-span-full text-center py-12 text-slate-400 text-xs font-bold">
                {isBn ? 'গেটওয়ে লোড হচ্ছে...' : 'Loading gateways...'}
              </div>
            ) : gateways.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400 text-xs">
                {isBn ? 'কোনো পেমেন্ট গেটওয়ে কনফিগার করা নেই। নতুন যোগ করুন।' : 'No payment gateways configured yet. Click above to add one.'}
              </div>
            ) : (
              gateways.map((gw) => (
                <div
                  key={gw.id}
                  className={`bg-slate-950 border rounded-3xl p-5 space-y-4 transition-all ${
                    gw.is_active
                      ? 'border-slate-800 hover:border-slate-700 shadow-sm'
                      : 'border-slate-900 opacity-60 bg-slate-950/50'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {gw.logo_url ? (
                        <img
                          src={gw.logo_url}
                          alt={gw.name_en}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-800 bg-white/5 p-1"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-sm">
                          {gw.gateway_type === 'bkash'
                            ? 'bK'
                            : gw.gateway_type === 'nagad'
                            ? 'NG'
                            : gw.gateway_type === 'rocket'
                            ? 'RK'
                            : gw.gateway_type === 'bank'
                            ? 'BK'
                            : 'GW'}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-black text-white">
                          {isBn ? (gw.name_bn || gw.name_en) : gw.name_en}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {gw.account_type || 'Account'} {gw.account_number ? `• ${gw.account_number}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleGatewayActive(gw)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase transition-colors ${
                        gw.is_active
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                          : 'bg-slate-900 text-slate-500 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {gw.is_active ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Disabled')}
                    </button>
                  </div>

                  {/* Details info */}
                  <div className="bg-[#12141A] rounded-2xl p-3.5 space-y-2 border border-slate-900 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">{isBn ? 'অ্যাকাউন্ট নম্বর:' : 'Account Number:'}</span>
                      <span className="font-mono font-bold text-white">{gw.account_number || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">{isBn ? 'টাইপ:' : 'Type:'}</span>
                      <span className="font-semibold text-slate-200">{gw.account_type || 'Merchant'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">{isBn ? 'প্রসেসিং ফি:' : 'Processing Fee:'}</span>
                      <span className="font-bold text-amber-400">{gw.charge_percentage || 0}%</span>
                    </div>

                    {(gw.instruction_bn || gw.instruction_en) && (
                      <div className="pt-2 border-t border-slate-900/80">
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          <span className="text-slate-500 font-bold">{isBn ? 'নির্দেশনা: ' : 'Instructions: '}</span>
                          {isBn ? (gw.instruction_bn || gw.instruction_en) : (gw.instruction_en || gw.instruction_bn)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: EDIT & DELETE */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                    <button
                      onClick={() => handleOpenEditGateway(gw)}
                      className="flex-1 p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs font-bold"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isBn ? 'সম্পাদনা' : 'Edit'}</span>
                    </button>

                    <button
                      onClick={() => setDeletingGateway(gw)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs font-bold px-3"
                      title={isBn ? "গেটওয়ে মুছে ফেলুন" : "Delete gateway"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isBn ? 'মুছুন' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TRANSACTIONS & SETTLEMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-4 rounded-3xl">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>{isBn ? 'পেমেন্ট ট্রানজাকশন ও ইনভয়েস রেকর্ড' : 'Payment Transactions & Invoices'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn
                  ? 'গ্রাহকদের পেমেন্ট হিস্ট্রি, ট্রানজাকশন আইডি সম্পাদনা ও রেকর্ড ব্যবস্থাপনা'
                  : 'Customer payment histories, transaction ID edits, and revenue audit tracking'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isBn ? "অর্ডার #, নাম, ফোন বা Trx ID..." : "Order #, Name, Phone or Trx ID..."}
                  className="w-full sm:w-56 bg-slate-900 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="all">{isBn ? 'সব স্ট্যাটাস' : 'All Statuses'}</option>
                <option value="paid">{isBn ? 'পরিশোধিত' : 'Paid'}</option>
                <option value="pending">{isBn ? 'অপেক্ষমান' : 'Pending'}</option>
                <option value="refunded">{isBn ? 'টাকা ফেরত' : 'Refunded'}</option>
                <option value="failed">{isBn ? 'ব্যর্থ' : 'Failed'}</option>
              </select>

              {/* Method filter */}
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="all">{isBn ? 'সকল গেটওয়ে' : 'All Gateways'}</option>
                <option value="cod">{isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</option>
                <option value="bkash">{isBn ? 'বিকাশ' : 'bKash'}</option>
                <option value="nagad">{isBn ? 'নগদ' : 'Nagad'}</option>
                <option value="rocket">{isBn ? 'রকেট' : 'Rocket'}</option>
                <option value="bank">{isBn ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</option>
                <option value="card">{isBn ? 'কার্ড পেমেন্ট' : 'Card Payment'}</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="text-center py-12 text-slate-400 text-xs font-bold">
                {isBn ? 'পেমেন্ট রেকর্ড লোড হচ্ছে...' : 'Loading payment records...'}
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                {isBn ? 'কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।' : 'No payment records found.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold">
                      <th className="pb-3">{isBn ? 'অর্ডার নম্বর' : 'Order Number'}</th>
                      <th className="pb-3">{isBn ? 'গ্রাহক' : 'Customer'}</th>
                      <th className="pb-3">{isBn ? 'পেমেন্ট মেথড' : 'Payment Method'}</th>
                      <th className="pb-3">{isBn ? 'ট্রানজাকশন আইডি' : 'Transaction ID'}</th>
                      <th className="pb-3">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                      <th className="pb-3">{isBn ? 'পেমেন্ট স্ট্যাটাস' : 'Payment Status'}</th>
                      <th className="pb-3 text-right">{isBn ? 'একশন' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                        {/* Order Number */}
                        <td className="py-3.5">
                          <span className="font-mono font-bold text-amber-400 block">
                            #{p.order_number || p.order_id}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {p.created_at?.split(' ')[0]}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 text-slate-300">
                          <div className="font-bold text-white">
                            {p.customer_name || (isBn ? 'নামহীন গ্রাহক' : 'Anonymous')}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {p.customer_phone || (isBn ? 'ফোন নম্বর নেই' : 'No phone')}
                          </div>
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-900 border border-slate-800 text-amber-400">
                            {p.payment_method === 'cod' ? (isBn ? 'ক্যাশ' : 'COD') : p.payment_method}
                          </span>
                        </td>

                        {/* Transaction ID */}
                        <td className="py-3.5">
                          <span className="font-mono text-[11px] text-slate-300">
                            {p.transaction_id || (isBn ? 'ক্যাশ পেমেন্ট' : 'N/A')}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 font-black text-white">
                          {formatPrice(p.amount || p.grand_total || 0)}
                        </td>

                        {/* Payment Status */}
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              p.status === 'paid'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                                : p.status === 'refunded'
                                ? 'bg-blue-950/60 text-blue-400 border border-blue-800'
                                : p.status === 'failed'
                                ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                                : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {p.status === 'paid'
                              ? (isBn ? 'পরিশোধিত' : 'Paid')
                              : p.status === 'refunded'
                              ? (isBn ? 'টাকা ফেরত' : 'Refunded')
                              : p.status === 'failed'
                              ? (isBn ? 'ব্যর্থ' : 'Failed')
                              : (isBn ? 'অপেক্ষমান' : 'Pending')}
                          </span>
                        </td>

                        {/* Actions: Quick Toggle, EDIT, DELETE */}
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Quick Status Toggle */}
                            <button
                              onClick={() => handleQuickTogglePaymentStatus(p)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold transition-colors ${
                                p.status === 'paid'
                                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                                  : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border-emerald-800'
                              }`}
                              title={p.status === 'paid' ? (isBn ? 'বকেয়া মার্ক করুন' : 'Mark as Unpaid') : (isBn ? 'পরিশোধিত মার্ক করুন' : 'Mark as Paid')}
                            >
                              {p.status === 'paid' ? (isBn ? 'বকেয়া' : 'Unpaid') : (isBn ? 'পরিশোধিত' : 'Paid')}
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditTransaction(p)}
                              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold px-2.5"
                              title={isBn ? "ট্রানজাকশন এডিট করুন" : "Edit transaction"}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>{isBn ? 'এডিট' : 'Edit'}</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeletingTransaction(p)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold px-2.5"
                              title={isBn ? "ট্রানজাকশন রেকর্ড মুছে ফেলুন" : "Delete transaction record"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isBn ? 'মুছুন' : 'Delete'}</span>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PAYMENT GATEWAY */}
      {/* ========================================================================= */}
      {(editingGateway || isAddGatewayOpen) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181B22] border border-[#2C323F] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-[#2C323F] sticky top-0 bg-[#181B22] z-10">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>
                  {editingGateway
                    ? (isBn ? 'পেমেন্ট গেটওয়ে সম্পাদনা' : 'Edit Payment Gateway')
                    : (isBn ? 'নতুন পেমেন্ট গেটওয়ে যোগ করুন' : 'Add New Payment Gateway')}
                </span>
              </h3>
              <button
                onClick={() => {
                  setEditingGateway(null);
                  setIsAddGatewayOpen(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGateway} className="p-6 space-y-4">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block text-xs mb-1">
                    {isBn ? 'গেটওয়ের নাম (ইংরেজি) *' : 'Gateway Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={gatewayForm.name_en}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, name_en: e.target.value })}
                    placeholder={isBn ? "যেমন: bKash Merchant" : "e.g. bKash Merchant Account"}
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block text-xs mb-1">
                    {isBn ? 'গেটওয়ের নাম (বাংলা)' : 'Gateway Name (Bengali)'}
                  </label>
                  <input
                    type="text"
                    value={gatewayForm.name_bn}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, name_bn: e.target.value })}
                    placeholder={isBn ? "যেমন: বিকাশ মার্চেন্ট পেমেন্ট" : "e.g. bKash Merchant Payment"}
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Gateway Type & Account Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block text-xs mb-1">
                    {isBn ? 'গেটওয়ে মেথড টাইপ *' : 'Gateway Method Type *'}
                  </label>
                  <select
                    value={gatewayForm.gateway_type}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, gateway_type: e.target.value })}
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="bkash">{isBn ? 'বিকাশ' : 'bKash'}</option>
                    <option value="nagad">{isBn ? 'নগদ' : 'Nagad'}</option>
                    <option value="rocket">{isBn ? 'রকেট' : 'Rocket'}</option>
                    <option value="upay">{isBn ? 'উপায়' : 'Upay'}</option>
                    <option value="bank">{isBn ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</option>
                    <option value="card">{isBn ? 'কার্ড বা অনলাইন গেটওয়ে' : 'Card / Online Payment'}</option>
                    <option value="cod">{isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</option>
                    <option value="custom">{isBn ? 'অন্যান্য কাস্টম গেটওয়ে' : 'Other Custom Gateway'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block text-xs mb-1">
                    {isBn ? 'অ্যাকাউন্ট টাইপ' : 'Account Type'}
                  </label>
                  <select
                    value={gatewayForm.account_type}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, account_type: e.target.value })}
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Merchant">{isBn ? 'মার্চেন্ট একাউন্ট' : 'Merchant Account'}</option>
                    <option value="Personal">{isBn ? 'ব্যক্তিগত একাউন্ট' : 'Personal Account'}</option>
                    <option value="Agent">{isBn ? 'এজেন্ট একাউন্ট' : 'Agent Account'}</option>
                    <option value="Current Bank">{isBn ? 'কারেন্ট ব্যাংক একাউন্ট' : 'Current Bank Account'}</option>
                    <option value="Online Gateway">{isBn ? 'অনলাইন গেটওয়ে' : 'Online Gateway'}</option>
                    <option value="Cash on Doorstep">{isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</option>
                  </select>
                </div>
              </div>

              {/* Account Number & Fee % */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block text-xs mb-1">
                    {isBn ? 'অ্যাকাউন্ট বা মোবাইল নম্বর' : 'Account / Mobile Number'}
                  </label>
                  <input
                    type="text"
                    value={gatewayForm.account_number}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, account_number: e.target.value })}
                    placeholder="e.g. 01700-123456"
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block text-xs mb-1">
                    {isBn ? 'পেমেন্ট প্রসেসিং ফি / চার্জ (%)' : 'Payment Processing Charge (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={gatewayForm.charge_percentage}
                    onChange={(e) =>
                      setGatewayForm({ ...gatewayForm, charge_percentage: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="e.g. 1.5"
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="text-slate-300 font-bold block text-xs mb-1">
                  {isBn ? 'পেমেন্ট নির্দেশিকা (বাংলা)' : 'Payment Instructions (Bengali)'}
                </label>
                <textarea
                  rows={2}
                  value={gatewayForm.instruction_bn}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, instruction_bn: e.target.value })}
                  placeholder={isBn ? "গ্রাহকের জন্য পেমেন্টের নিয়মাবলী (যেমন: মার্চেন্ট নম্বরে পেমেন্ট অপশনে টাকা পাঠিয়ে Trx ID দিন)" : "Instructions in Bengali..."}
                  className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block text-xs mb-1">
                  {isBn ? 'পেমেন্ট নির্দেশিকা (ইংরেজি)' : 'Payment Instructions (English)'}
                </label>
                <textarea
                  rows={2}
                  value={gatewayForm.instruction_en}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, instruction_en: e.target.value })}
                  placeholder="Payment instructions for customer in English..."
                  className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Logo / QR Upload with device file upload support */}
              <ImageUploadField
                label={isBn ? 'গেটওয়ে লোগো / আইকন' : 'Gateway Logo / Icon'}
                value={gatewayForm.logo_url}
                onChange={(url) => setGatewayForm({ ...gatewayForm, logo_url: url })}
                placeholder={isBn ? "https://... অথবা ডিভাইস থেকে লোগো আপলোড করুন" : "https://... or upload from your device"}
              />

              {/* Active & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                <label className="flex items-center gap-3 cursor-pointer bg-[#12141A] border border-[#2C323F] p-3 rounded-xl">
                  <input
                    type="checkbox"
                    checked={gatewayForm.is_active === 1}
                    onChange={(e) =>
                      setGatewayForm({ ...gatewayForm, is_active: e.target.checked ? 1 : 0 })
                    }
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isBn ? 'গেটওয়ে সক্রিয় রাখুন' : 'Keep Gateway Active'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isBn ? 'চেকআউট পেজে গ্রাহকরা দেখতে পারবেন' : 'Visible to customers on the checkout page'}
                    </span>
                  </div>
                </label>

                <div>
                  <label className="text-slate-300 font-bold block text-xs mb-1">
                    {isBn ? 'সিরিয়াল ক্রম' : 'Display Sort Order'}
                  </label>
                  <input
                    type="number"
                    value={gatewayForm.sort_order}
                    onChange={(e) =>
                      setGatewayForm({ ...gatewayForm, sort_order: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C323F]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingGateway(null);
                    setIsAddGatewayOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {isSaving ? (
                    <span>{isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        {editingGateway
                          ? (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')
                          : (isBn ? 'গেটওয়ে যুক্ত করুন' : 'Add Gateway')}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE GATEWAY CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingGateway && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181B22] border border-rose-900/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">
                {isBn ? 'পেমেন্ট গেটওয়ে মুছে ফেলতে চান?' : 'Delete Payment Gateway?'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn ? (
                  <>আপনি কি নিশ্চিত যে <span className="font-bold text-white">"{deletingGateway.name_bn || deletingGateway.name_en}"</span> গেটওয়েটি মুছে ফেলতে চান?</>
                ) : (
                  <>Are you sure you want to delete <span className="font-bold text-white">"{deletingGateway.name_en}"</span> gateway?</>
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingGateway(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                {isBn ? 'না, বাতিল করুন' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteGateway}
                disabled={isSaving}
                className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-xs font-black transition-colors shadow-sm"
              >
                {isSaving ? (isBn ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...') : (isBn ? 'হ্যাঁ, ডিলিট করুন' : 'Yes, Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT TRANSACTION */}
      {/* ========================================================================= */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181B22] border border-[#2C323F] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-[#2C323F]">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>{isBn ? 'পেমেন্ট ট্রানজাকশন সম্পাদনা' : 'Edit Payment Transaction'}</span>
              </h3>
              <button
                onClick={() => setEditingTransaction(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">
              <div className="bg-[#12141A] p-3 rounded-xl border border-slate-900 text-xs">
                <p className="text-slate-400 font-bold">
                  {isBn ? 'অর্ডার নম্বর:' : 'Order Number:'} <span className="text-amber-400 font-mono">#{editingTransaction.order_number || editingTransaction.order_id}</span>
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {isBn ? 'গ্রাহক:' : 'Customer:'} <span className="text-white">{editingTransaction.customer_name || (isBn ? 'নামহীন' : 'Anonymous')}</span> ({editingTransaction.customer_phone || 'N/A'})
                </p>
              </div>

              <div>
                <label className="text-slate-300 font-bold block text-xs mb-1">
                  {isBn ? 'পেমেন্ট স্ট্যাটাস *' : 'Payment Status *'}
                </label>
                <select
                  value={transactionForm.status}
                  onChange={(e) => setTransactionForm({ ...transactionForm, status: e.target.value })}
                  className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="paid">{isBn ? 'পরিশোধিত' : 'Paid'}</option>
                  <option value="pending">{isBn ? 'অপেক্ষমান' : 'Pending'}</option>
                  <option value="refunded">{isBn ? 'টাকা ফেরত' : 'Refunded'}</option>
                  <option value="failed">{isBn ? 'ব্যর্থ' : 'Failed'}</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block text-xs mb-1">
                    {isBn ? 'পেমেন্ট মেথড *' : 'Payment Method *'}
                  </label>
                  <select
                    value={transactionForm.payment_method}
                    onChange={(e) => setTransactionForm({ ...transactionForm, payment_method: e.target.value })}
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="cod">{isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</option>
                    <option value="bkash">{isBn ? 'বিকাশ' : 'bKash'}</option>
                    <option value="nagad">{isBn ? 'নগদ' : 'Nagad'}</option>
                    <option value="rocket">{isBn ? 'রকেট' : 'Rocket'}</option>
                    <option value="bank">{isBn ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</option>
                    <option value="card">{isBn ? 'কার্ড পেমেন্ট' : 'Card Payment'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block text-xs mb-1">
                    {isBn ? 'পরিমাণ (৳) *' : 'Amount (৳) *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={transactionForm.amount}
                    onChange={(e) =>
                      setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block text-xs mb-1">
                  {isBn ? 'ট্রানজাকশন আইডি' : 'Transaction ID'}
                </label>
                <input
                  type="text"
                  value={transactionForm.transaction_id}
                  onChange={(e) => setTransactionForm({ ...transactionForm, transaction_id: e.target.value })}
                  placeholder={isBn ? "যেমন: 9J28DA10K" : "e.g. 9J28DA10K"}
                  className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C323F]">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {isSaving ? (isBn ? 'আপডেট হচ্ছে...' : 'Saving...') : (isBn ? 'আপডেট সম্পন্ন করুন' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE TRANSACTION CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingTransaction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181B22] border border-rose-900/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">
                {isBn ? 'ট্রানজাকশন রেকর্ড মুছে ফেলতে চান?' : 'Delete Transaction Record?'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn ? (
                  <>অর্ডার <span className="font-bold text-white">#{deletingTransaction.order_number || deletingTransaction.order_id}</span> এর পেমেন্ট রেকর্ডটি মুছে ফেলা হবে এবং অর্ডারের স্ট্যাটাস 'pending' এ পরিবর্তিত হবে।</>
                ) : (
                  <>The payment record for order <span className="font-bold text-white">#{deletingTransaction.order_number || deletingTransaction.order_id}</span> will be deleted, and the order payment status will be marked as pending.</>
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingTransaction(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                {isBn ? 'না, বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteTransaction}
                disabled={isSaving}
                className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-xs font-black transition-colors shadow-sm"
              >
                {isSaving ? (isBn ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...') : (isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

