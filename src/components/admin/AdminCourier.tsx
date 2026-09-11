import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  Clock,
  PackageCheck,
  ShieldCheck,
  Wallet,
  Building2,
  ChevronDown
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';

interface ShipmentItem {
  id: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  grand_total: number;
  payment_method: string;
  order_status: string;
  courier_name: string;
  consignment_id: string;
  tracking_id: string;
  shipping_status: string;
  delivery_fee: number;
  courier_notes?: string;
  dispatched_at: string;
  delivered_at?: string;
}

export const AdminCourier: React.FC = () => {
  const { isBn } = useLanguage();
  const { formatPrice } = useSettings();

  // Courier Configs
  const [steadfastApiKey, setSteadfastApiKey] = useState('');
  const [steadfastSecretKey, setSteadfastSecretKey] = useState('');
  const [steadfastEnabled, setSteadfastEnabled] = useState(true);
  const [pathaoClientId, setPathaoClientId] = useState('');
  const [pathaoSecret, setPathaoSecret] = useState('');
  const [redxToken, setRedxToken] = useState('');

  // UI States
  const [showSteadfastSecret, setShowSteadfastSecret] = useState(false);
  const [showPathaoSecret, setShowPathaoSecret] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [liveBalance, setLiveBalance] = useState<number | null>(null);

  // Shipments & History
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [isLoadingShipments, setIsLoadingShipments] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingShipmentId, setUpdatingShipmentId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [checkingTrackingId, setCheckingTrackingId] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'history' | 'settings'>('history');

  // Load configuration & shipments on mount
  useEffect(() => {
    loadConfig();
    loadShipments();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoadingConfig(true);
      const res = await api.getCourierConfig();
      if (res.success && res.config) {
        setSteadfastApiKey(res.config.steadfast_api_key || '');
        setSteadfastSecretKey(res.config.steadfast_secret_key || '');
        setSteadfastEnabled(res.config.steadfast_enabled !== false);
        setPathaoClientId(res.config.pathao_client_id || '');
        setPathaoSecret(res.config.pathao_secret || '');
        setRedxToken(res.config.redx_token || '');
      }
    } catch (err: any) {
      console.error('Failed to load courier config:', err);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const loadShipments = async () => {
    try {
      setIsLoadingShipments(true);
      const res = await api.getShipments();
      if (res.success && Array.isArray(res.shipments)) {
        setShipments(res.shipments);
      }
    } catch (err: any) {
      console.error('Failed to load shipments:', err);
    } finally {
      setIsLoadingShipments(false);
    }
  };

  const handleSyncAllFromSteadfast = async () => {
    try {
      setIsSyncingAll(true);
      setStatusMsg(null);
      const res = await api.syncAllCouriers();
      if (res.success) {
        setStatusMsg({
          type: 'success',
          text: res.message || (isBn ? 'সমস্ত পার্সেলের লাইভ স্টেটাস সফলভাবে সিঙ্ক হয়েছে!' : 'All shipments synced successfully!')
        });
        loadShipments();
      } else {
        setStatusMsg({
          type: 'error',
          text: res.message || 'Failed to sync shipments.'
        });
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Error syncing courier statuses.'
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleCheckLiveTracking = async (item: ShipmentItem) => {
    try {
      setCheckingTrackingId(item.id);
      setStatusMsg(null);
      const res = await api.checkCourierTracking({
        shipment_id: item.id,
        tracking_id: item.tracking_id,
        consignment_id: item.consignment_id
      });
      if (res.success) {
        setStatusMsg({
          type: 'success',
          text: `[${item.order_number}] ${res.message}`
        });
        loadShipments();
      } else {
        setStatusMsg({
          type: 'error',
          text: res.message || 'Failed to fetch live tracking.'
        });
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Error checking tracking.'
      });
    } finally {
      setCheckingTrackingId(null);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    try {
      const res = await api.saveCourierConfig({
        steadfast_api_key: steadfastApiKey,
        steadfast_secret_key: steadfastSecretKey,
        steadfast_enabled: steadfastEnabled,
        pathao_client_id: pathaoClientId,
        pathao_secret: pathaoSecret,
        redx_token: redxToken
      });

      if (res.success) {
        setStatusMsg({
          type: 'success',
          text: isBn
            ? 'কুরিয়ার এপিআই কনফিগারেশন সফলভাবে সেভ হয়েছে!'
            : 'Courier API configuration saved successfully!'
        });
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'Failed to save configuration.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error saving courier configuration.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSteadfast = async () => {
    if (!steadfastApiKey.trim() || !steadfastSecretKey.trim()) {
      setStatusMsg({
        type: 'error',
        text: isBn
          ? 'অনুগ্রহ করে প্রথমে Steadfast এর API Key এবং Secret Key প্রদান করুন।'
          : 'Please provide both Steadfast API Key and Secret Key.'
      });
      return;
    }

    setIsTesting(true);
    setStatusMsg(null);

    try {
      const res = await api.testSteadfastConnection({
        api_key: steadfastApiKey,
        secret_key: steadfastSecretKey
      });

      if (res.success) {
        if (res.current_balance !== undefined) {
          setLiveBalance(res.current_balance);
        }
        setStatusMsg({
          type: 'success',
          text: res.message || 'Steadfast connection verified successfully!'
        });
      } else {
        setStatusMsg({
          type: 'error',
          text: res.message || 'Steadfast connection failed. Please check credentials.'
        });
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Error connecting to Steadfast endpoint.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateStatus = async (shipmentId: string, newStatus: string) => {
    try {
      setUpdatingShipmentId(shipmentId);
      const res = await api.syncCourierStatus({ shipment_id: shipmentId, status: newStatus });
      if (res.success) {
        setShipments((prev) =>
          prev.map((s) => (s.id === shipmentId ? { ...s, shipping_status: newStatus } : s))
        );
        setStatusMsg({
          type: 'success',
          text: res.message || (isBn ? `শিপমেন্ট স্টেটাস '${newStatus}'-এ আপডেট হয়েছে এবং অর্ডারে সিঙ্ক হয়েছে।` : `Status updated to ${newStatus} and synced to Orders.`)
        });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update status.' });
    } finally {
      setUpdatingShipmentId(null);
    }
  };

  // Filtered shipments
  const filteredShipments = shipments.filter((item) => {
    const matchesSearch =
      (item.order_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.customer_phone || '').includes(searchQuery) ||
      (item.tracking_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.consignment_id || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : item.shipping_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter((s) => s.shipping_status === 'in_transit' || s.shipping_status === 'dispatched').length;
  const deliveredCount = shipments.filter((s) => s.shipping_status === 'delivered').length;
  const cancelledCount = shipments.filter((s) => s.shipping_status === 'cancelled').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#181B23] border border-[#2C323F] p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                {isBn ? 'কুরিয়ার হিস্ট্রি ও অটোমেশন' : 'Courier History & Automation'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn
                  ? 'Steadfast Courier API দিয়ে ১-ক্লিকে পার্সেল বুকিং, লাইভ ট্র্যাকিং এবং ক্যাশ কালেকশন ম্যানেজমেন্ট।'
                  : 'Manage Steadfast Courier API, automated order booking, live parcel tracking & COD payouts.'}
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-[#12141A] p-1 rounded-xl border border-[#2C323F]">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isBn ? 'শিপমেন্ট হিস্ট্রি' : 'Shipment History'}</span>
            <span className="bg-black/30 px-1.5 py-0.2 rounded text-[10px]">
              {totalShipments}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{isBn ? 'কুরিয়ার API সেটিংস' : 'Courier API Settings'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181B23] border border-[#2C323F] p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            {isBn ? 'মোট প্রেরিত পার্সেল' : 'Total Dispatched'}
          </span>
          <p className="text-2xl font-black text-white mt-1">{totalShipments}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {isBn ? 'সমস্ত কুরিয়ারের হিস্টোরি' : 'All courier shipments'}
          </span>
        </div>

        <div className="bg-[#181B23] border border-amber-500/20 p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            {isBn ? 'চলমান পার্সেল (In Transit)' : 'In Transit'}
          </span>
          <p className="text-2xl font-black text-amber-400 mt-1">{inTransitCount}</p>
          <span className="text-[10px] text-amber-500/70 mt-1 block">
            {isBn ? 'কাস্টমারের পথে রয়েছে' : 'On the way to customer'}
          </span>
        </div>

        <div className="bg-[#181B23] border border-emerald-500/20 p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
            <PackageCheck className="w-3.5 h-3.5" />
            {isBn ? 'সফল ডেলিভারি (Delivered)' : 'Delivered'}
          </span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{deliveredCount}</p>
          <span className="text-[10px] text-emerald-500/70 mt-1 block">
            {isBn ? 'ক্যাশ কালেকশন সম্পন্ন' : 'Cash collected by courier'}
          </span>
        </div>

        <div className="bg-[#181B23] border border-cyan-500/20 p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" />
            {isBn ? 'Steadfast ব্যালেন্স' : 'Steadfast Balance'}
          </span>
          <p className="text-2xl font-black text-cyan-400 mt-1">
            {liveBalance !== null ? formatPrice(liveBalance) : '৳ ০.০০'}
          </p>
          <button
            onClick={handleTestSteadfast}
            disabled={isTesting}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-bold mt-1 inline-flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isBn ? 'লাইভ ব্যালেন্স চেক' : 'Check Live Balance'}</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* TAB 1: SHIPMENT HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-[#181B23] border border-[#2C323F] rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white">
                {isBn ? 'কুরিয়ার পার্সেল ও ডেলিভারি হিস্ট্রি' : 'Courier Parcels & Delivery History'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isBn
                  ? 'আপনার স্টোর থেকে প্রেরিত সমস্ত অর্ডারের লাইভ কনসাইনমেন্ট ও ট্র্যাকিং হিস্ট্রি।'
                  : 'Live tracking codes, consignments and COD amounts across all couriers.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isBn ? 'অর্ডার #, ফোন বা ট্র্যাকিং...' : 'Search order, phone, tracking...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#12141A] border border-[#2C323F] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">{isBn ? 'সকল স্টেটাস' : 'All Status'}</option>
                <option value="in_transit">{isBn ? 'চলমান (In Transit)' : 'In Transit'}</option>
                <option value="delivered">{isBn ? 'ডেলিভার্ড (Delivered)' : 'Delivered'}</option>
                <option value="cancelled">{isBn ? 'বাতিল (Cancelled)' : 'Cancelled'}</option>
              </select>

              <button
                onClick={handleSyncAllFromSteadfast}
                disabled={isSyncingAll}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title={isBn ? 'Steadfast থেকে সমস্ত পার্সেলের লাইভ স্টেটাস সিঙ্ক করুন' : 'Sync all from Steadfast'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                <span>{isSyncingAll ? (isBn ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (isBn ? 'লাইভ সিঙ্ক' : 'Sync All')}</span>
              </button>

              <button
                onClick={loadShipments}
                disabled={isLoadingShipments}
                className="p-2 bg-[#12141A] border border-[#2C323F] hover:border-slate-500 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isBn ? 'রিফ্রেশ করুন' : 'Refresh'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingShipments ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Sync Information Helper Banner */}
          <div className="bg-[#12141A] border border-[#2C323F] rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-white">
                {isBn ? 'অটোমেটিক ২-ওয়ে ডাটাবেজ সিঙ্ক্রোনাইজেশন:' : 'Automatic 2-Way Database Sync:'}
              </span>
              <span className="text-slate-400 hidden sm:inline">
                {isBn
                  ? 'কুরিয়ারে ডেলিভারি সম্পন্ন (Delivered) হলে অর্ডার ও পেমেন্ট স্বয়ংক্রিয়ভাবে Delivered ও Paid হবে।'
                  : 'Marking Delivered automatically marks Order as Delivered & Payment as Paid.'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 font-bold">✓ Delivered ➔ Paid</span>
              <span className="px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/60 font-bold">✕ Cancelled ➔ Stock Restored</span>
            </div>
          </div>

          {/* Table */}
          {isLoadingShipments ? (
            <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>{isBn ? 'শিপমেন্ট ডাটা লোড হচ্ছে...' : 'Loading shipments...'}</span>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs border border-dashed border-[#2C323F] rounded-xl">
              <Truck className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-slate-300">
                {isBn ? 'কোনো শিপমেন্ট হিস্ট্রি পাওয়া যায়নি।' : 'No shipment records found.'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {isBn
                  ? 'অর্ডার পেজ থেকে যেকোনো অর্ডার "Shipped" মার্ক করলে বা কুরিয়ারে পাঠালে তা এখানে স্বয়ংক্রিয়ভাবে জমা হবে।'
                  : 'Orders marked as shipped or dispatched will automatically show up here with tracking codes.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#2C323F]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#12141A] text-slate-400 font-bold border-b border-[#2C323F] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3.5">{isBn ? 'অর্ডার ও তারিখ' : 'Order & Date'}</th>
                    <th className="py-3 px-3.5">{isBn ? 'কাস্টমার ও ঠিকানা' : 'Customer & Destination'}</th>
                    <th className="py-3 px-3.5">{isBn ? 'কুরিয়ার ও পার্সেল' : 'Courier & Consignment'}</th>
                    <th className="py-3 px-3.5">{isBn ? 'ট্র্যাকিং কোড' : 'Tracking Code'}</th>
                    <th className="py-3 px-3.5">{isBn ? 'COD মূল্য' : 'COD Amount'}</th>
                    <th className="py-3 px-3.5">{isBn ? 'স্টেটাস' : 'Status'}</th>
                    <th className="py-3 px-3.5 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C323F]">
                  {filteredShipments.map((item) => {
                    const isSteadfast = item.courier_name?.toLowerCase().includes('steadfast');
                    const trackingUrl = isSteadfast
                      ? `https://steadfast.com.bd/t/${item.tracking_id}`
                      : null;

                    return (
                      <tr key={item.id} className="hover:bg-[#1C202B] transition-colors">
                        {/* Order & Date */}
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-amber-400 block font-mono">
                            #{item.order_number}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {new Date(item.dispatched_at).toLocaleString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>

                        {/* Customer & Destination */}
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-white block">
                            {item.customer_name}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            {item.customer_phone}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[200px] block">
                            {item.shipping_city ? `${item.shipping_city}, ` : ''}{item.shipping_address}
                          </span>
                        </td>

                        {/* Courier & Consignment */}
                        <td className="py-3 px-3.5">
                          <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] ${
                            isSteadfast
                              ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                          }`}>
                            <Truck className="w-3 h-3" />
                            {item.courier_name}
                          </span>
                          {item.consignment_id && (
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                              CID: {item.consignment_id}
                            </span>
                          )}
                        </td>

                        {/* Tracking Code with Copy */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-white bg-[#12141A] px-2 py-1 rounded border border-[#2C323F]">
                              {item.tracking_id}
                            </span>
                            <button
                              onClick={() => handleCopyTracking(item.tracking_id)}
                              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title={isBn ? 'কপি করুন' : 'Copy Tracking Code'}
                            >
                              {copiedId === item.tracking_id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            {trackingUrl && (
                              <a
                                href={trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                                title={isBn ? 'Steadfast পোর্টালে ট্র্যাক করুন' : 'Track on Steadfast'}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* COD Amount */}
                        <td className="py-3 px-3.5">
                          <span className="font-black text-white block">
                            {formatPrice(item.grand_total)}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase">
                            {item.payment_method === 'cod' ? 'Cash On Delivery' : item.payment_method}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              item.shipping_status === 'delivered'
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                : item.shipping_status === 'cancelled'
                                ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                                : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {item.shipping_status === 'delivered'
                              ? isBn ? 'ডেলিভার্ড' : 'Delivered'
                              : item.shipping_status === 'cancelled'
                              ? isBn ? 'বাতিল / রিটার্ন' : 'Cancelled'
                              : isBn ? 'চলমান (In Transit)' : 'In Transit'}
                          </span>
                        </td>

                        {/* Actions: Change status & Live Tracking */}
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isSteadfast && (
                              <button
                                onClick={() => handleCheckLiveTracking(item)}
                                disabled={checkingTrackingId === item.id}
                                className="px-2 py-1 bg-[#12141A] hover:bg-[#202533] border border-[#2C323F] text-amber-400 hover:text-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title={isBn ? 'Steadfast থেকে লাইভ ট্র্যাকিং চেক করুন' : 'Check live status from Steadfast'}
                              >
                                <RefreshCw className={`w-3 h-3 ${checkingTrackingId === item.id ? 'animate-spin' : ''}`} />
                                <span>{checkingTrackingId === item.id ? (isBn ? 'চেকিং...' : 'Checking...') : (isBn ? 'লাইভ চেক' : 'Live Check')}</span>
                              </button>
                            )}

                            <select
                              value={item.shipping_status}
                              disabled={updatingShipmentId === item.id}
                              onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                              className="bg-[#12141A] border border-[#2C323F] rounded-lg px-2 py-1 text-[11px] text-slate-300 hover:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                              <option value="in_transit">{isBn ? 'ইন ট্রানজিট' : 'In Transit'}</option>
                              <option value="delivered">{isBn ? 'ডেলিভার্ড' : 'Mark Delivered'}</option>
                              <option value="cancelled">{isBn ? 'বাতিল' : 'Mark Cancelled'}</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COURIER API CONFIGURATION */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. STEADFAST COURIER (FEATURED & PRIMARY) */}
            <div className="bg-[#181B23] border-2 border-amber-500/30 rounded-3xl p-6 space-y-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs">
                    STF
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">Steadfast Courier</h3>
                    <p className="text-[10px] text-slate-400">All 64 Districts • Cash On Delivery</p>
                  </div>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={steadfastEnabled}
                    onChange={(e) => setSteadfastEnabled(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-amber-400">
                    {steadfastEnabled ? 'Active' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-200/90 leading-relaxed">
                💡 Steadfast মার্চেন্ট ড্যাশবোর্ড (<code className="text-white font-mono">portal.steadfast.com.bd</code>) এর <strong>API Integration</strong> সেকশন থেকে আপনার API Key ও Secret Key কপি করে এখানে বসান।
              </div>

              <div className="space-y-3.5 text-xs">
                {/* API Key */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1 flex items-center justify-between">
                    <span>Steadfast API Key</span>
                    <span className="text-[10px] text-slate-500 font-normal">Required for booking</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={steadfastApiKey}
                      onChange={(e) => setSteadfastApiKey(e.target.value)}
                      placeholder="e.g. 2938472910abcdef..."
                      className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Secret Key */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1 flex items-center justify-between">
                    <span>Secret Key</span>
                    <span className="text-[10px] text-slate-500 font-normal">Confidential</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSteadfastSecret ? 'text' : 'password'}
                      value={steadfastSecretKey}
                      onChange={(e) => setSteadfastSecretKey(e.target.value)}
                      placeholder="e.g. 9876543210fedcba..."
                      className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl pl-3 pr-9 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSteadfastSecret(!showSteadfastSecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showSteadfastSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleTestSteadfast}
                    disabled={isTesting}
                    className="w-full bg-[#1F2430] hover:bg-[#282F3F] text-amber-400 border border-amber-500/40 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>
                      {isTesting
                        ? (isBn ? 'সংযোগ পরীক্ষা হচ্ছে...' : 'Verifying with Steadfast...')
                        : (isBn ? 'Steadfast কানেকশন ও ব্যালেন্স চেক' : 'Test Steadfast Connection')}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. PATHAO COURIER */}
            <div className="bg-[#181B23] border border-[#2C323F] rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-black text-xs">
                    PTH
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">Pathao Courier</h3>
                    <p className="text-[10px] text-slate-400">Nationwide Express Delivery</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Pathao Client ID</label>
                  <input
                    type="text"
                    value={pathaoClientId}
                    onChange={(e) => setPathaoClientId(e.target.value)}
                    placeholder="e.g. pathao_client_id"
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Pathao Client Secret</label>
                  <div className="relative">
                    <input
                      type={showPathaoSecret ? 'text' : 'password'}
                      value={pathaoSecret}
                      onChange={(e) => setPathaoSecret(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl pl-3 pr-9 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPathaoSecret(!showPathaoSecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPathaoSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. REDX DELIVERY */}
            <div className="bg-[#181B23] border border-[#2C323F] rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-black text-xs">
                    RDX
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">RedX Delivery</h3>
                    <p className="text-[10px] text-slate-400">Doorstep Delivery Network</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">RedX Production Token</label>
                  <input
                    type="text"
                    value={redxToken}
                    onChange={(e) => setRedxToken(e.target.value)}
                    placeholder="e.g. redx_production_token"
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="bg-[#181B23] border border-[#2C323F] p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {isBn
                  ? 'আপনার API ক্রেডেনশিয়ালগুলো ডাটাবেজে নিরাপদে সুরক্ষিত থাকবে।'
                  : 'Your courier credentials are encrypted and stored safely on the server.'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সেটিংস সংরক্ষণ করুন' : 'Save Courier Settings')}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
