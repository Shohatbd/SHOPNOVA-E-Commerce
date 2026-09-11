import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Minus,
  Search,
  History,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Save,
  AlertCircle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  PackagePlus,
  RotateCcw,
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  SlidersHorizontal,
  FileText,
  Filter,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { Product, InventoryHistoryItem, InventorySummary } from '../../types/index.ts';
import { api } from '../../services/api.ts';

export const AdminInventory: React.FC = () => {
  const { t, isBn } = useLanguage();
  const { formatPrice } = useSettings();

  const [products, setProducts] = useState<Product[]>([]);
  const [stockLogs, setStockLogs] = useState<InventoryHistoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary>({
    total_opening_stock: 0,
    total_received: 0,
    total_delivered: 0,
    total_returned: 0,
    total_closing_stock: 0,
    low_stock_count: 0,
    out_of_stock_count: 0
  });

  const [activeView, setActiveView] = useState<'stock' | 'logs'>('stock');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [logTypeFilter, setLogTypeFilter] = useState<string>('all');
  const [logSearch, setLogSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Categories for filtering in Goods Receive
  const [categories, setCategories] = useState<any[]>([]);
  const [receiveCategoryFilter, setReceiveCategoryFilter] = useState('all');
  const [receiveSubcategoryFilter, setReceiveSubcategoryFilter] = useState('all');

  // Receive Goods Modal
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [receiveData, setReceiveData] = useState({
    product_id: '',
    quantity: 10,
    supplier_name: '',
    challan_no: '',
    purchase_cost: '',
    notes: ''
  });
  const [isSubmittingReceive, setIsSubmittingReceive] = useState(false);
  const [receiveMsg, setReceiveMsg] = useState('');
  const [receiveError, setReceiveError] = useState('');

  // Return Goods Modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnData, setReturnData] = useState({
    product_id: '',
    quantity: 1,
    order_number: '',
    customer_name: '',
    reason: isBn ? 'কাস্টমার রিটার্ন / ফেরত' : 'Customer Return / Damaged Replacement',
    notes: ''
  });
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnMsg, setReturnMsg] = useState('');
  const [returnError, setReturnError] = useState('');

  // Quick Edit Modal
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
  const [quickEditData, setQuickEditData] = useState<any>({});
  const [isSavingQuickEdit, setIsSavingQuickEdit] = useState(false);
  const [quickEditMsg, setQuickEditMsg] = useState('');
  const [quickEditError, setQuickEditError] = useState('');

  // Stock Adjustment Modal
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove' | 'set'>('add');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState(isBn ? 'স্টক গণনা ও যাচাইকরণ' : 'Stock Count Verification');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);
  const [adjustMessage, setAdjustMessage] = useState('');

  // Log Deletion Modals
  const [logToDelete, setLogToDelete] = useState<InventoryHistoryItem | null>(null);
  const [isDeletingLog, setIsDeletingLog] = useState(false);
  const [isClearLogsOpen, setIsClearLogsOpen] = useState(false);
  const [isClearingAllLogs, setIsClearingAllLogs] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [res, catRes] = await Promise.all([
        api.getInventory(),
        api.getCategories()
      ]);
      if (res.success) {
        setProducts(res.inventory || []);
        setStockLogs(res.history || []);
        if (res.summary) {
          setSummary(res.summary);
        }
      }
      if (catRes && catRes.success) {
        setCategories(catRes.categories || []);
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Receive Modal (Optionally preselect product)
  const handleOpenReceive = (product?: Product) => {
    setReceiveCategoryFilter(product?.category_id || product?.category?.id || 'all');
    setReceiveSubcategoryFilter(product?.subcategory_id || product?.subcategory?.id || 'all');
    setReceiveData({
      product_id: product ? product.id : (products[0]?.id || ''),
      quantity: 10,
      supplier_name: '',
      challan_no: `CHL-${Date.now().toString().slice(-6)}`,
      purchase_cost: '',
      notes: ''
    });
    setReceiveMsg('');
    setReceiveError('');
    setIsReceiveModalOpen(true);
  };

  const handleSubmitReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveData.product_id || receiveData.quantity <= 0) {
      setReceiveError(isBn ? 'অনুগ্রহ করে একটি প্রোডাক্ট ও সঠিক পরিমাণ নির্বাচন করুন।' : 'Please select a product and valid quantity.');
      return;
    }

    setIsSubmittingReceive(true);
    setReceiveError('');
    setReceiveMsg('');

    try {
      const res = await api.receiveStock({
        product_id: receiveData.product_id,
        quantity: Number(receiveData.quantity),
        supplier_name: receiveData.supplier_name.trim(),
        challan_no: receiveData.challan_no.trim(),
        purchase_cost: receiveData.purchase_cost ? Number(receiveData.purchase_cost) : null,
        notes: receiveData.notes.trim()
      });

      if (res.success) {
        setReceiveMsg(isBn ? 'পণ্য সফলভাবে রিসিভ করা হয়েছে এবং স্টক আপডেট হয়েছে।' : (res.message || 'Goods received and stock updated successfully.'));
        loadData();
        setTimeout(() => {
          setIsReceiveModalOpen(false);
        }, 1200);
      }
    } catch (err: any) {
      setReceiveError(isBn ? 'পণ্য রিসিভ করতে সমস্যা হয়েছে।' : (err.message || 'Failed to receive goods.'));
    } finally {
      setIsSubmittingReceive(false);
    }
  };

  // Open Return Modal (Optionally preselect product)
  const handleOpenReturn = (product?: Product) => {
    setReturnData({
      product_id: product ? product.id : (products[0]?.id || ''),
      quantity: 1,
      order_number: '',
      customer_name: '',
      reason: isBn ? 'কাস্টমার রিটার্ন / কুরিয়ার ফেরত' : 'Customer Return / Courier Return',
      notes: ''
    });
    setReturnMsg('');
    setReturnError('');
    setIsReturnModalOpen(true);
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnData.product_id || returnData.quantity <= 0) {
      setReturnError(isBn ? 'অনুগ্রহ করে একটি প্রোডাক্ট ও সঠিক পরিমাণ নির্বাচন করুন।' : 'Please select a product and valid quantity.');
      return;
    }

    setIsSubmittingReturn(true);
    setReturnError('');
    setReturnMsg('');

    try {
      const res = await api.returnStock({
        product_id: returnData.product_id,
        quantity: Number(returnData.quantity),
        order_number: returnData.order_number.trim(),
        customer_name: returnData.customer_name.trim(),
        reason: returnData.reason.trim(),
        notes: returnData.notes.trim()
      });

      if (res.success) {
        setReturnMsg(isBn ? 'পণ্য রিটার্ন সফলভাবে ক্লোজিং স্টকে যুক্ত হয়েছে।' : (res.message || 'Product return added to closing stock successfully.'));
        loadData();
        setTimeout(() => {
          setIsReturnModalOpen(false);
        }, 1200);
      }
    } catch (err: any) {
      setReturnError(isBn ? 'রিটার্ন প্রসেস করতে সমস্যা হয়েছে।' : (err.message || 'Failed to process return.'));
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleOpenQuickEdit = (p: Product) => {
    setQuickEditProduct(p);
    setQuickEditData({
      product_id: p.id,
      opening_stock: p.opening_stock ?? p.stock_quantity,
      stock_quantity: p.stock_quantity,
      low_stock_threshold: p.low_stock_threshold || 5,
      sku: p.sku || '',
      regular_price: p.regular_price,
      sale_price: p.sale_price ?? ''
    });
    setQuickEditMsg('');
    setQuickEditError('');
  };

  const handleSaveQuickEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditProduct) return;

    setIsSavingQuickEdit(true);
    setQuickEditError('');
    setQuickEditMsg('');

    try {
      const res = await api.quickEditInventory({
        product_id: quickEditProduct.id,
        opening_stock: Number(quickEditData.opening_stock ?? 0),
        stock_quantity: Number(quickEditData.stock_quantity),
        low_stock_threshold: Number(quickEditData.low_stock_threshold),
        sku: quickEditData.sku,
        regular_price: Number(quickEditData.regular_price),
        sale_price: quickEditData.sale_price !== '' && quickEditData.sale_price !== null ? Number(quickEditData.sale_price) : null
      });

      if (res.success) {
        setQuickEditMsg(isBn ? 'স্টক ও প্রোডাক্ট তথ্য সফলভাবে আপডেট হয়েছে।' : 'Stock ledger & product details updated successfully.');
        loadData();
        setTimeout(() => {
          setQuickEditProduct(null);
        }, 1000);
      }
    } catch (err: any) {
      setQuickEditError(isBn ? 'স্টক আপডেট করতে সমস্যা হয়েছে।' : (err.message || 'Failed to update stock.'));
    } finally {
      setIsSavingQuickEdit(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    setIsSubmittingAdjust(true);
    setAdjustMessage('');

    try {
      const res = await api.adjustInventory({
        product_id: adjustingProduct.id,
        adjustment_type: adjustmentType,
        quantity: Number(quantity),
        reason: reason.trim()
      });

      if (res.success) {
        setAdjustMessage(isBn ? 'স্টক সফলভাবে পরিবর্তন করা হয়েছে।' : 'Inventory adjusted successfully.');
        loadData();
        setTimeout(() => {
          setAdjustingProduct(null);
          setAdjustMessage('');
        }, 1000);
      }
    } catch (err: any) {
      setAdjustMessage(isBn ? 'স্টক পরিবর্তন করতে সমস্যা হয়েছে।' : (err.message || 'Failed to adjust stock.'));
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const handleDeleteSingleLog = async () => {
    if (!logToDelete) return;
    setIsDeletingLog(true);
    try {
      await api.deleteInventoryLog(logToDelete.id);
      setLogToDelete(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete log entry:', err);
    } finally {
      setIsDeletingLog(false);
    }
  };

  const handleClearAllLogs = async () => {
    setIsClearingAllLogs(true);
    try {
      await api.clearInventoryLogs();
      setIsClearLogsOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to clear logs:', err);
    } finally {
      setIsClearingAllLogs(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name_en.toLowerCase().includes(query) ||
      p.name_bn.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      (p.category_name && p.category_name.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (statusFilter === 'in_stock') return p.stock_quantity > (p.low_stock_threshold || 5);
    if (statusFilter === 'low_stock') return p.stock_quantity <= (p.low_stock_threshold || 5) && p.stock_quantity > 0;
    if (statusFilter === 'out_of_stock') return p.stock_quantity <= 0;

    return true;
  });

  // Filtered Logs
  const filteredLogs = stockLogs.filter((lg) => {
    if (logTypeFilter !== 'all' && lg.change_type !== logTypeFilter) return false;
    if (!logSearch.trim()) return true;
    const q = logSearch.toLowerCase().trim();
    return (
      (lg.product_name && lg.product_name.toLowerCase().includes(q)) ||
      (lg.product_sku && lg.product_sku.toLowerCase().includes(q)) ||
      (lg.reference_id && lg.reference_id.toLowerCase().includes(q)) ||
      (lg.reason && lg.reason.toLowerCase().includes(q)) ||
      (lg.created_by && lg.created_by.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Live Stock Formula Banner */}
      <div className="bg-gradient-to-r from-[#1A1F2C] via-[#1E222B] to-[#1A1F2C] border border-amber-500/20 rounded-2xl p-4 sm:p-5 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {isBn ? 'লাইভ স্টক হিসাব ও প্রোডাক্ট লাইফসাইকেল' : 'Live Stock Calculation & Product Lifecycle'}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {isBn
                  ? '[প্রারম্ভিক স্টক + পণ্য রিসিভ - পণ্য ডেলিভারী + পণ্য রিটার্ন = ক্লোজিং স্টক]'
                  : '[Opening Stock + Received Product - Delivered Product + Returned Product = Closing Stock]'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => handleOpenReceive()}
              className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <PackagePlus className="w-4 h-4" />
              <span>{isBn ? '+ পণ্য রিসিভ' : '+ Stock In'}</span>
            </button>

            <button
              onClick={() => handleOpenReturn()}
              className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isBn ? '↩ পণ্য রিটার্ন' : '↩ Customer Return'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 KPI Metric Cards: Opening + Received - Delivered + Returned = Closing */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Opening Stock */}
        <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>{isBn ? 'প্রারম্ভিক স্টক' : 'Opening Stock'}</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-200">{summary.total_opening_stock}</p>
          <span className="text-[10px] text-slate-500 block">
            {isBn ? 'মোট প্রারম্ভিক ইউনিট' : 'Opening Stock Units'}
          </span>
        </div>

        {/* 2. Received */}
        <div className="bg-[#1E222B] border border-emerald-900/40 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
            <span className="flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> {isBn ? 'পণ্য রিসিভ (+)' : 'Goods Received (+)'}
            </span>
            <span className="text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded text-emerald-300 font-mono">IN</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400">+{summary.total_received}</p>
          <span className="text-[10px] text-slate-500 block">
            {isBn ? 'মোট রিসিভকৃত পণ্য' : 'Total Goods Received'}
          </span>
        </div>

        {/* 3. Delivered */}
        <div className="bg-[#1E222B] border border-rose-900/40 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-rose-400 text-xs font-bold">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> {isBn ? 'ডেলিভারি ও বিক্রি (-)' : 'Delivered & Sold (-)'}
            </span>
            <span className="text-[10px] bg-rose-950/80 px-1.5 py-0.5 rounded text-rose-300 font-mono">OUT</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-400">-{summary.total_delivered}</p>
          <span className="text-[10px] text-slate-500 block">
            {isBn ? 'মোট ডেলিভারি অর্ডার' : 'Total Delivered Orders'}
          </span>
        </div>

        {/* 4. Returned */}
        <div className="bg-[#1E222B] border border-indigo-900/40 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-indigo-400 text-xs font-bold">
            <span className="flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" /> {isBn ? 'পণ্য রিটার্ন (+)' : 'Customer Returns (+)'}
            </span>
            <span className="text-[10px] bg-indigo-950/80 px-1.5 py-0.5 rounded text-indigo-300 font-mono">RETURN</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-400">+{summary.total_returned}</p>
          <span className="text-[10px] text-slate-500 block">
            {isBn ? 'রিটার্ন পণ্য স্টকে যুক্ত' : 'Customer Returns Restocked'}
          </span>
        </div>

        {/* 5. Live Closing Stock */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1 bg-gradient-to-br from-amber-950/30 to-[#1E222B] border border-amber-500/40 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
            <span className="flex items-center gap-1">
              <Boxes className="w-3.5 h-3.5" /> {isBn ? 'ক্লোজিং স্টক (=)' : 'Closing Stock (=)'}
            </span>
            <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-mono font-bold">LIVE</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400">{summary.total_closing_stock}</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>{isBn ? 'লো স্টক:' : 'Low:'} <strong className="text-amber-300">{summary.low_stock_count}</strong></span>
            <span>•</span>
            <span>{isBn ? 'স্টক আউট:' : 'Out:'} <strong className="text-rose-400">{summary.out_of_stock_count}</strong></span>
          </div>
        </div>
      </div>

      {/* View Switcher & Action Header */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#1E222B] border border-[#2C323F] p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('stock')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeView === 'stock'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-[#14171E] text-slate-400 hover:text-white border border-[#2C323F]'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>{isBn ? `প্রোডাক্ট স্টক লাইভ টেবিল (${products.length})` : `Live Product Stock (${products.length})`}</span>
          </button>
          <button
            onClick={() => setActiveView('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeView === 'logs'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-[#14171E] text-slate-400 hover:text-white border border-[#2C323F]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{isBn ? `স্টক খতিয়ান ও অডিট লগ (${stockLogs.length})` : `Stock Audit & Ledger (${stockLogs.length})`}</span>
          </button>
        </div>

        {activeView === 'stock' ? (
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center bg-[#14171E] border border-[#2C323F] rounded-xl p-1 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  statusFilter === 'all' ? 'bg-[#2C323F] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isBn ? 'সব' : 'All'}
              </button>
              <button
                onClick={() => setStatusFilter('in_stock')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  statusFilter === 'in_stock' ? 'bg-emerald-950 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isBn ? 'স্টকে আছে' : 'In Stock'}
              </button>
              <button
                onClick={() => setStatusFilter('low_stock')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  statusFilter === 'low_stock' ? 'bg-amber-950 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isBn ? `লো স্টক (${summary.low_stock_count})` : `Low Stock (${summary.low_stock_count})`}
              </button>
              <button
                onClick={() => setStatusFilter('out_of_stock')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  statusFilter === 'out_of_stock' ? 'bg-rose-950 text-rose-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isBn ? `স্টক আউট (${summary.out_of_stock_count})` : `Out of Stock (${summary.out_of_stock_count})`}
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isBn ? "SKU বা প্রোডাক্ট সার্চ..." : "Search by SKU or product name..."}
                className="bg-[#14171E] border border-[#2C323F] rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-amber-500 w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={loadData}
              className="p-2 bg-[#14171E] hover:bg-[#181C25] text-slate-300 border border-[#2C323F] rounded-xl text-xs font-semibold"
              title={isBn ? "রিফ্রেশ" : "Refresh Data"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {/* Log Type Filter */}
            <select
              value={logTypeFilter}
              onChange={(e) => setLogTypeFilter(e.target.value)}
              className="bg-[#14171E] border border-[#2C323F] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">{isBn ? 'সকল লেনদেন' : 'All Transaction Types'}</option>
              <option value="received">{isBn ? 'পণ্য রিসিভ (+)' : 'Goods Received (+)'}</option>
              <option value="delivered">{isBn ? 'অর্ডার ডেলিভারী (-)' : 'Orders Delivered (-)'}</option>
              <option value="returned">{isBn ? 'কাস্টমার রিটার্ন (+)' : 'Customer Returns (+)'}</option>
              <option value="opening">{isBn ? 'প্রারম্ভিক স্টক' : 'Opening Stock'}</option>
              <option value="manual_adjustment">{isBn ? 'ম্যানুয়াল এডজাস্ট' : 'Manual Adjustment'}</option>
              <option value="quick_edit">{isBn ? 'কুইক এডিট' : 'Quick Edit'}</option>
            </select>

            <div className="relative">
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder={isBn ? "অর্ডার বা চালান সার্চ..." : "Search order or challan..."}
                className="bg-[#14171E] border border-[#2C323F] rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-amber-500 w-44"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={() => setIsClearLogsOpen(true)}
              disabled={stockLogs.length === 0}
              className="px-3 py-2 bg-rose-950/40 hover:bg-rose-950/80 text-rose-400 border border-rose-900/60 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'লগ মুছুন' : 'Clear Logs'}</span>
            </button>
          </div>
        )}
      </div>

      {/* View 1: Live Stock Table */}
      {activeView === 'stock' ? (
        <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2C323F] text-slate-400 font-bold">
                  <th className="pb-3">{isBn ? 'প্রোডাক্ট' : 'Product'}</th>
                  <th className="pb-3">SKU</th>
                  <th className="pb-3 text-center">{isBn ? 'প্রারম্ভিক' : 'Opening'}</th>
                  <th className="pb-3 text-center text-emerald-400">{isBn ? 'রিসিভ (+)' : 'Received (+)'}</th>
                  <th className="pb-3 text-center text-rose-400">{isBn ? 'ডেলিভারী (-)' : 'Delivered (-)'}</th>
                  <th className="pb-3 text-center text-indigo-400">{isBn ? 'রিটার্ন (+)' : 'Returned (+)'}</th>
                  <th className="pb-3 text-center text-amber-400">{isBn ? 'ক্লোজিং স্টক (=)' : 'Closing Stock (=)'}</th>
                  <th className="pb-3">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="pb-3 text-right">{isBn ? 'একশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C323F]/80">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      {isBn ? 'কোনো প্রোডাক্ট পাওয়া যায়নি।' : 'No products found matching criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const opening = p.opening_stock ?? p.stock_quantity;
                    const received = p.total_received ?? 0;
                    const delivered = p.total_delivered ?? 0;
                    const returned = p.total_returned ?? 0;
                    const closing = p.stock_quantity;

                    return (
                      <tr key={p.id} className="hover:bg-[#14171E]/50 transition-colors">
                        {/* Product Info */}
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.thumbnail}
                              alt={p.name_en}
                              className="w-10 h-10 rounded-xl object-cover border border-[#2C323F] shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate max-w-xs">{isBn ? (p.name_bn || p.name_en) : p.name_en}</span>
                              {p.category_name && (
                                <span className="text-[11px] text-slate-400 block truncate">{p.category_name}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3 font-mono font-bold text-amber-400">{p.sku}</td>

                        {/* Opening Stock */}
                        <td className="py-3 text-center font-bold text-slate-300 font-mono">
                          {opening}
                        </td>

                        {/* Received (+) */}
                        <td className="py-3 text-center font-bold text-emerald-400 font-mono">
                          +{received}
                        </td>

                        {/* Delivered (-) */}
                        <td className="py-3 text-center font-bold text-rose-400 font-mono">
                          -{delivered}
                        </td>

                        {/* Returned (+) */}
                        <td className="py-3 text-center font-bold text-indigo-400 font-mono">
                          +{returned}
                        </td>

                        {/* Live Closing Stock (=) */}
                        <td className="py-3 text-center">
                          <span className="text-sm font-black text-amber-400 font-mono block">
                            {closing}
                          </span>
                          <span className="text-[9px] text-slate-500 block">
                            {isBn ? 'এলার্ট সীমা ≤' : 'Alert ≤'} {p.low_stock_threshold || 5}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              closing <= 0
                                ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                                : closing <= (p.low_stock_threshold || 5)
                                ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                                : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            }`}
                          >
                            {closing <= 0
                              ? (isBn ? 'স্টক আউট' : 'Out of Stock')
                              : closing <= (p.low_stock_threshold || 5)
                              ? (isBn ? 'লো স্টক' : 'Low Stock')
                              : (isBn ? 'স্টকে আছে' : 'In Stock')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Receive button */}
                            <button
                              onClick={() => handleOpenReceive(p)}
                              className="p-1.5 text-emerald-400 hover:text-slate-950 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 rounded-lg transition-colors font-bold text-[11px]"
                              title={isBn ? "পণ্য রিসিভ করুন" : "Receive Goods"}
                            >
                              <PackagePlus className="w-3.5 h-3.5" />
                            </button>

                            {/* Return button */}
                            <button
                              onClick={() => handleOpenReturn(p)}
                              className="p-1.5 text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/30 rounded-lg transition-colors font-bold text-[11px]"
                              title={isBn ? "পণ্য রিটার্ন গ্রহণ করুন" : "Accept Customer Return"}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Edit */}
                            <button
                              onClick={() => handleOpenQuickEdit(p)}
                              className="p-1.5 text-amber-400 hover:text-slate-950 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/30 rounded-lg transition-colors font-bold text-[11px]"
                              title={isBn ? "স্টক ও প্রাইস দ্রুত সম্পাদনা" : "Quick Edit Stock & Price"}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Adjust */}
                            <button
                              onClick={() => {
                                setAdjustingProduct(p);
                                setQuantity(10);
                                setAdjustMessage('');
                              }}
                              className="px-2 py-1 text-slate-300 hover:text-white bg-[#14171E] hover:bg-[#2C323F] border border-[#2C323F] rounded-lg transition-colors font-bold text-[10px]"
                              title={isBn ? "ম্যানুয়াল এডজাস্ট" : "Manual Adjust"}
                            >
                              {isBn ? 'এডজাস্ট' : 'Adjust'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View 2: Detailed Inventory History & Audit Ledger */
        <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              {isBn ? 'কোনো স্টক লেনদেন রেকর্ড পাওয়া যায়নি।' : 'No inventory transaction records found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2C323F] text-slate-400 font-bold">
                    <th className="pb-3">{isBn ? 'তারিখ ও ব্যবহারকারী' : 'Timestamp & User'}</th>
                    <th className="pb-3">{isBn ? 'প্রোডাক্ট' : 'Product'}</th>
                    <th className="pb-3">{isBn ? 'লেনদেন টাইপ' : 'Transaction Type'}</th>
                    <th className="pb-3 text-center">{isBn ? 'পরিমাণ পরিবর্তন' : 'Change Qty'}</th>
                    <th className="pb-3 text-center">{isBn ? 'স্টক ট্রানজিশন' : 'Stock Balance'}</th>
                    <th className="pb-3">{isBn ? 'চালান / রেফারেন্স' : 'Ref / Document'}</th>
                    <th className="pb-3">{isBn ? 'কারণ ও বিবরণ' : 'Reason / Details'}</th>
                    <th className="pb-3 text-right">{isBn ? 'একশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C323F]/80">
                  {filteredLogs.map((lg) => {
                    const isPositive = lg.quantity_changed > 0;
                    const typeLabel =
                      lg.change_type === 'received'
                        ? (isBn ? 'পণ্য রিসিভ' : 'Goods Received')
                        : lg.change_type === 'delivered'
                        ? (isBn ? 'অর্ডার ডেলিভারী' : 'Order Delivered')
                        : lg.change_type === 'returned'
                        ? (isBn ? 'কাস্টমার রিটার্ন' : 'Customer Return')
                        : lg.change_type === 'order_cancelled'
                        ? (isBn ? 'অর্ডার বাতিল' : 'Order Cancelled')
                        : lg.change_type === 'opening'
                        ? (isBn ? 'প্রারম্ভিক স্টক' : 'Opening Stock')
                        : lg.change_type === 'quick_edit'
                        ? (isBn ? 'কুইক এডিট' : 'Quick Edit')
                        : (isBn ? 'ম্যানুয়াল এডজাস্ট' : 'Manual Adjustment');

                    const badgeColor =
                      lg.change_type === 'received'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : lg.change_type === 'delivered'
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                        : lg.change_type === 'returned'
                        ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-800'
                        : lg.change_type === 'order_cancelled'
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700';

                    return (
                      <tr key={lg.id} className="hover:bg-[#14171E]/50 transition-colors">
                        {/* Timestamp & User */}
                        <td className="py-3 text-[11px]">
                          <span className="text-slate-300 font-mono block">{lg.created_at}</span>
                          <span className="text-slate-500 text-[10px] block font-semibold">{lg.created_by || (isBn ? 'সিস্টেম' : 'System')}</span>
                        </td>

                        {/* Product */}
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {lg.product_thumbnail && (
                              <img
                                src={lg.product_thumbnail}
                                alt={lg.product_name || ''}
                                className="w-8 h-8 rounded-lg object-cover border border-[#2C323F] shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate max-w-xs">{lg.product_name || lg.product_id}</span>
                              {lg.product_sku && (
                                <span className="text-[10px] font-mono text-amber-400 block">{lg.product_sku}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Transaction Type */}
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-block ${badgeColor}`}>
                            {typeLabel}
                          </span>
                        </td>

                        {/* Change Qty */}
                        <td className="py-3 text-center font-bold font-mono">
                          <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                            {isPositive ? `+${lg.quantity_changed}` : lg.quantity_changed}
                          </span>
                        </td>

                        {/* Balance Transition */}
                        <td className="py-3 text-center font-mono text-xs">
                          <span className="text-slate-400">{lg.previous_quantity}</span>
                          <span className="text-slate-600 mx-1">&rarr;</span>
                          <span className="font-bold text-amber-400">{lg.new_quantity}</span>
                        </td>

                        {/* Ref / Document */}
                        <td className="py-3 text-slate-300 font-mono text-[11px]">
                          {lg.reference_id ? (
                            <span className="bg-[#14171E] border border-[#2C323F] px-1.5 py-0.5 rounded text-amber-300">
                              {lg.reference_id}
                            </span>
                          ) : (
                            '—'
                          )}
                          {lg.supplier_name && (
                            <span className="text-[10px] text-slate-500 block">{lg.supplier_name}</span>
                          )}
                        </td>

                        {/* Reason */}
                        <td className="py-3 text-slate-300 max-w-xs truncate text-[11px]">
                          {lg.reason || '—'}
                        </td>

                        {/* Delete Log */}
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setLogToDelete(lg)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-900/60 rounded-lg transition-colors"
                            title={isBn ? "লগ এন্ট্রি মুছুন" : "Delete Log Entry"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* MODAL 1: Receive Stock (Stock In) */}
      {isReceiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => setIsReceiveModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C323F]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <PackagePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isBn ? 'পণ্য রিসিভ এন্ট্রি' : 'Goods Received Entry'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'সাপ্লায়ার বা ফ্যাক্টরি থেকে স্টক যোগ করুন' : 'Add inventory received from supplier or factory'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsReceiveModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {receiveError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{receiveError}</span>
              </div>
            )}

            {receiveMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{receiveMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReceive} className="space-y-4">
              {/* Category & Subcategory Filter for Goods Receive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-[#14171E] border border-[#2C323F] rounded-xl">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    {isBn ? 'ক্যাটাগরি অনুযায়ী ফিল্টার (ঐচ্ছিক)' : 'Filter by Category (Optional)'}
                  </label>
                  <select
                    value={receiveCategoryFilter}
                    onChange={(e) => {
                      setReceiveCategoryFilter(e.target.value);
                      setReceiveSubcategoryFilter('all');
                    }}
                    className="w-full bg-[#1A1E27] border border-[#2C323F] rounded-lg p-2 text-slate-200 text-xs focus:border-amber-500"
                  >
                    <option value="all">{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isBn ? (c.name_bn || c.name_en) : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    {isBn ? 'সাব-ক্যাটাগরি অনুযায়ী ফিল্টার (ঐচ্ছিক)' : 'Filter by Subcategory (Optional)'}
                  </label>
                  <select
                    value={receiveSubcategoryFilter}
                    onChange={(e) => setReceiveSubcategoryFilter(e.target.value)}
                    disabled={receiveCategoryFilter === 'all'}
                    className="w-full bg-[#1A1E27] border border-[#2C323F] rounded-lg p-2 text-slate-200 text-xs focus:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="all">{isBn ? 'সকল সাব-ক্যাটাগরি' : 'All Subcategories'}</option>
                    {(categories.find((c) => c.id === receiveCategoryFilter)?.subcategories || []).map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        {isBn ? (sub.name_bn || sub.name_en) : sub.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  {isBn ? 'প্রোডাক্ট নির্বাচন করুন *' : 'Select Product *'}
                </label>
                <select
                  required
                  value={receiveData.product_id}
                  onChange={(e) => setReceiveData({ ...receiveData, product_id: e.target.value })}
                  className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2.5 text-white font-medium focus:border-amber-500"
                >
                  <option value="">-- {isBn ? 'প্রোডাক্ট নির্বাচন করুন' : 'Select Product'} --</option>
                  {products
                    .filter((p) => {
                      if (receiveCategoryFilter !== 'all') {
                        const matchCat = p.category_id === receiveCategoryFilter || p.category?.id === receiveCategoryFilter;
                        if (!matchCat) return false;
                      }
                      if (receiveSubcategoryFilter !== 'all') {
                        const matchSub = p.subcategory_id === receiveSubcategoryFilter || p.subcategory?.id === receiveSubcategoryFilter;
                        if (!matchSub) return false;
                      }
                      return true;
                    })
                    .map((p) => {
                      const catName = isBn ? (p.category?.name_bn || p.category?.name_en) : p.category?.name_en;
                      const subName = isBn ? (p.subcategory?.name_bn || p.subcategory?.name_en) : p.subcategory?.name_en;
                      const catLabel = catName ? ` [${catName}${subName ? ` > ${subName}` : ''}]` : '';
                      return (
                        <option key={p.id} value={p.id}>
                          {isBn ? (p.name_bn || p.name_en) : p.name_en}{catLabel} ({p.sku}) — {isBn ? 'স্টক:' : 'Stock:'} {p.stock_quantity}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    {isBn ? 'রিসিভ পরিমাণ (ইউনিট) *' : 'Received Quantity (Units) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={receiveData.quantity}
                    onChange={(e) => setReceiveData({ ...receiveData, quantity: Number(e.target.value) })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-white font-bold font-mono focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    {isBn ? 'চালান নম্বর' : 'Challan / PO Number'}
                  </label>
                  <input
                    type="text"
                    value={receiveData.challan_no}
                    onChange={(e) => setReceiveData({ ...receiveData, challan_no: e.target.value })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-amber-400 font-mono font-bold focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    {isBn ? 'সাপ্লায়ার / ফ্যাক্টরির নাম' : 'Supplier / Factory Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={isBn ? "যেমন: ড্রিম টেক্সটাইল লিমিটেড" : "e.g. Dream Apparels Ltd"}
                    value={receiveData.supplier_name}
                    onChange={(e) => setReceiveData({ ...receiveData, supplier_name: e.target.value })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    {isBn ? 'একক ক্রয় মূল্য (ঐচ্ছিক)' : 'Unit Cost / Purchase Price (Optional)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={isBn ? "৳ একক ক্রয় মূল্য" : "৳ Unit Purchase Price"}
                    value={receiveData.purchase_cost}
                    onChange={(e) => setReceiveData({ ...receiveData, purchase_cost: e.target.value })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  {isBn ? 'মন্তব্য ও বিবরণ' : 'Remarks / Notes'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isBn ? "অতিরিক্ত বিবরণ লিখুন..." : "Additional receipt details..."}
                  value={receiveData.notes}
                  onChange={(e) => setReceiveData({ ...receiveData, notes: e.target.value })}
                  className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-white focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2C323F]">
                <button
                  type="button"
                  onClick={() => setIsReceiveModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReceive}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>
                    {isSubmittingReceive
                      ? (isBn ? 'প্রসেসিং হচ্ছে...' : 'Processing...')
                      : (isBn ? 'রিসিভ কনফার্ম করুন' : 'Confirm Stock In')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Product Return (Return In) */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => setIsReturnModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C323F]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isBn ? 'পণ্য রিটার্ন এন্ট্রি' : 'Customer Return Entry'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'কুরিয়ার বা কাস্টমার রিটার্ন ক্লোজিং স্টকে যোগ করুন' : 'Restock units returned by customer or courier'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsReturnModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {returnError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{returnError}</span>
              </div>
            )}

            {returnMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{returnMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  {isBn ? 'প্রোডাক্ট নির্বাচন করুন *' : 'Select Product *'}
                </label>
                <select
                  required
                  value={returnData.product_id}
                  onChange={(e) => setReturnData({ ...returnData, product_id: e.target.value })}
                  className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2.5 text-white font-medium focus:border-amber-500"
                >
                  <option value="">-- {isBn ? 'প্রোডাক্ট নির্বাচন করুন' : 'Select Product'} --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {isBn ? (p.name_bn || p.name_en) : p.name_en} ({p.sku}) — {isBn ? 'বর্তমান স্টক:' : 'Current Stock:'} {p.stock_quantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    {isBn ? 'রিটার্ন পরিমাণ (ইউনিট) *' : 'Return Quantity (Units) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={returnData.quantity}
                    onChange={(e) => setReturnData({ ...returnData, quantity: Number(e.target.value) })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-white font-bold font-mono focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    {isBn ? 'অর্ডার নম্বর' : 'Order Number (Ref #)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SN-849201"
                    value={returnData.order_number}
                    onChange={(e) => setReturnData({ ...returnData, order_number: e.target.value })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-amber-400 font-mono font-bold focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    {isBn ? 'কাস্টমারের নাম ও ফোন' : 'Customer Name / Contact'}
                  </label>
                  <input
                    type="text"
                    placeholder={isBn ? "কাস্টমারের বিবরণ" : "Customer details"}
                    value={returnData.customer_name}
                    onChange={(e) => setReturnData({ ...returnData, customer_name: e.target.value })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    {isBn ? 'রিটার্নের কারণ' : 'Return Reason'}
                  </label>
                  <select
                    value={returnData.reason}
                    onChange={(e) => setReturnData({ ...returnData, reason: e.target.value })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-white focus:border-amber-500"
                  >
                    <option value="Customer Return / Changed Mind">
                      {isBn ? 'কাস্টমার মাইন্ড পরিবর্তন / ফেরত' : 'Customer Return / Changed Mind'}
                    </option>
                    <option value="Size / Color Exchange">
                      {isBn ? 'সাইজ বা কালার এক্সচেঞ্জ' : 'Size / Color Exchange'}
                    </option>
                    <option value="Courier Return / Delivery Failed">
                      {isBn ? 'কুরিয়ার রিটার্ন / ডেলিভারি ব্যর্থ' : 'Courier Return / Delivery Failed'}
                    </option>
                    <option value="Damaged / Replacement Return">
                      {isBn ? 'ত্রুটিপূর্ণ / রিপ্লেসমেন্ট রিটার্ন' : 'Damaged / Replacement Return'}
                    </option>
                    <option value="Wrong Item Delivered">
                      {isBn ? 'ভুল পণ্য পাঠানো হয়েছে' : 'Wrong Item Delivered'}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  {isBn ? 'অতিরিক্ত মন্তব্য ও বিবরণ' : 'Additional Notes'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isBn ? "রিটার্নের কারণ ও বিবরণ..." : "Additional return notes..."}
                  value={returnData.notes}
                  onChange={(e) => setReturnData({ ...returnData, notes: e.target.value })}
                  className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-white focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2C323F]">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>
                    {isSubmittingReturn
                      ? (isBn ? 'প্রসেসিং হচ্ছে...' : 'Processing...')
                      : (isBn ? 'রিটার্ন গ্রহণ করুন' : 'Accept Return')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Quick Edit Product Details & Opening Stock */}
      {quickEditProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => setQuickEditProduct(null)} />
          <div className="relative w-full max-w-lg bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C323F]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isBn ? 'প্রোডাক্ট স্টক ও প্রাইস সম্পাদনা' : 'Quick Edit Product Stock & Price'}
                  </h3>
                  <p className="text-[11px] text-slate-400">{isBn ? (quickEditProduct.name_bn || quickEditProduct.name_en) : quickEditProduct.name_en}</p>
                </div>
              </div>
              <button onClick={() => setQuickEditProduct(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {quickEditError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{quickEditError}</span>
              </div>
            )}

            {quickEditMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{quickEditMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuickEdit} className="space-y-4">
              {/* Formula & Live Calculation Box */}
              <div className="bg-[#14171E] border border-amber-500/30 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-1 text-xs">
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {isBn ? 'স্বয়ংক্রিয় লাইভ স্টক হিসাব:' : 'Live Automated Calculation:'}
                  </span>
                  <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {quickEditData.opening_stock ?? 0} (ওপেনিং) + {quickEditProduct.total_received || 0} (রিসিভ) - {quickEditProduct.total_delivered || 0} (ডেলিভারী) + {quickEditProduct.total_returned || 0} (রিটার্ন) = {quickEditData.stock_quantity ?? 0} (ক্লোজিং)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isBn
                    ? 'প্রারম্ভিক স্টক অথবা ক্লোজিং স্টকের যেকোনো একটি পরিবর্তন করলে সিস্টেম স্বয়ংক্রিয়ভাবে হিসাব সমন্বয় করবে।'
                    : 'Changing either Opening or Closing Stock will automatically synchronize the full stock balance in real-time.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'প্রারম্ভিক স্টক (Opening Stock) *' : 'Opening Stock (Units) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quickEditData.opening_stock ?? 0}
                    onChange={(e) => {
                      const newOp = Math.max(0, Number(e.target.value));
                      const newCl = Math.max(
                        0,
                        newOp + (quickEditProduct.total_received || 0) - (quickEditProduct.total_delivered || 0) + (quickEditProduct.total_returned || 0)
                      );
                      setQuickEditData({ ...quickEditData, opening_stock: newOp, stock_quantity: newCl });
                    }}
                    className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-lg p-2.5 text-white font-bold font-mono text-sm"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">{isBn ? 'ব্যবসায়িক শুরুর মোট ইনভেন্টরি' : 'Initial business stock'}</span>
                </div>

                <div>
                  <label className="text-amber-400 font-bold block mb-1">
                    {isBn ? 'বর্তমান মোট ক্লোজিং স্টক (Closing Stock) *' : 'Current Closing Stock (Units) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quickEditData.stock_quantity ?? 0}
                    onChange={(e) => {
                      const newCl = Math.max(0, Number(e.target.value));
                      const newOp = Math.max(
                        0,
                        newCl - (quickEditProduct.total_received || 0) + (quickEditProduct.total_delivered || 0) - (quickEditProduct.total_returned || 0)
                      );
                      setQuickEditData({ ...quickEditData, stock_quantity: newCl, opening_stock: newOp });
                    }}
                    className="w-full bg-[#14171E] border border-amber-500/50 focus:border-amber-400 rounded-lg p-2.5 text-amber-400 font-bold font-mono text-sm shadow-inner"
                  />
                  <span className="text-[10px] text-amber-400/80 block mt-0.5">{isBn ? 'ওয়েবসাইট ও কাস্টমারদের জন্য সক্রিয় মজুদ' : 'Active stock available to customers'}</span>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    {isBn ? 'লো স্টক অ্যালার্ট সীমা' : 'Low Stock Alert Threshold'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quickEditData.low_stock_threshold ?? 5}
                    onChange={(e) => setQuickEditData({ ...quickEditData, low_stock_threshold: Number(e.target.value) })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    {isBn ? 'বারকোড বা এসকেইউ কোড' : 'SKU / Barcode'}
                  </label>
                  <input
                    type="text"
                    value={quickEditData.sku || ''}
                    onChange={(e) => setQuickEditData({ ...quickEditData, sku: e.target.value })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-amber-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    {isBn ? 'নিয়মিত মূল্য (৳) *' : 'Regular Price (৳) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quickEditData.regular_price ?? 0}
                    onChange={(e) => setQuickEditData({ ...quickEditData, regular_price: Number(e.target.value) })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    {isBn ? 'অফার মূল্য (৳)' : 'Sale Price (৳)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={isBn ? "ঐচ্ছিক" : "Optional"}
                    value={quickEditData.sale_price ?? ''}
                    onChange={(e) => setQuickEditData({ ...quickEditData, sale_price: e.target.value })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-amber-400 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2C323F]">
                <button
                  type="button"
                  onClick={() => setQuickEditProduct(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuickEdit}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingQuickEdit ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Updates')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => setAdjustingProduct(null)} />
          <div className="relative w-full max-w-md bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C323F]">
              <h3 className="text-base font-bold text-white">
                {isBn ? `স্টক এডজাস্ট: ${adjustingProduct.name_bn || adjustingProduct.name_en}` : `Adjust Stock: ${adjustingProduct.name_en}`}
              </h3>
              <button onClick={() => setAdjustingProduct(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {adjustMessage && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{adjustMessage}</span>
              </div>
            )}

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">{isBn ? 'এডজাস্টমেন্ট একশন' : 'Adjustment Action'}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('add')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1 ${
                      adjustmentType === 'add'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                        : 'bg-[#14171E] text-slate-400 border-[#2C323F]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isBn ? 'স্টক যোগ (+)' : 'Add Stock'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustmentType('remove')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1 ${
                      adjustmentType === 'remove'
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-[#14171E] text-slate-400 border-[#2C323F]'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>{isBn ? 'কমানো (-)' : 'Remove'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustmentType('set')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1 ${
                      adjustmentType === 'set'
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-[#14171E] text-slate-400 border-[#2C323F]'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{isBn ? 'নির্দিষ্ট মান (=)' : 'Set Exact'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  {adjustmentType === 'set'
                    ? (isBn ? 'নতুন মোট স্টক সংখ্যা' : 'New Total Quantity')
                    : (isBn ? 'পরিমাণ (ইউনিট)' : 'Quantity (Units)')}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  {isBn ? 'কারণ ও বিবরণ' : 'Reason / Note for Audit Log'}
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2C323F]">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl shadow-md transition-colors"
                >
                  {isSubmittingAdjust
                    ? (isBn ? 'প্রসেসিং হচ্ছে...' : 'Processing...')
                    : (isBn ? 'স্টক পরিবর্তন প্রয়োগ করুন' : 'Apply Stock Change')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Single Log Delete Confirmation */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => setLogToDelete(null)} />
          <div className="relative w-full max-w-md bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">
                {isBn ? 'ইনভেন্টরি লগ রেকর্ড মুছবেন?' : 'Delete Inventory Log Entry?'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn ? (
                  <>আপনি কি নিশ্চিত যে <span className="text-white font-semibold">{logToDelete.created_at}</span> তারিখের এই রেকর্ডটি মুছে ফেলতে চান?</>
                ) : (
                  <>Are you sure you want to remove this log record from <span className="text-white font-semibold">{logToDelete.created_at}</span>?</>
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#2C323F]">
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                className="px-4 py-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeletingLog}
                onClick={handleDeleteSingleLog}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingLog ? (isBn ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...') : (isBn ? 'হ্যাঁ, মুছুন' : 'Confirm Delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Clear All Logs Confirmation */}
      {isClearLogsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => setIsClearLogsOpen(false)} />
          <div className="relative w-full max-w-md bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">
                {isBn ? 'সকল স্টক অডিট লগ মুছবেন?' : 'Clear All Stock Logs?'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn ? (
                  <>আপনি কি নিশ্চিত যে সকল <span className="text-white font-bold">{stockLogs.length}</span> টি অডিট লগ রেকর্ড স্থায়ীভাবে মুছে ফেলতে চান? বর্তমান প্রোডাক্টের স্টক সংখ্যা অপরিবর্তিত থাকবে।</>
                ) : (
                  <>Are you sure you want to permanently clear all <span className="text-white font-bold">{stockLogs.length}</span> inventory audit log records? Current product stock counts will remain intact.</>
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#2C323F]">
              <button
                type="button"
                onClick={() => setIsClearLogsOpen(false)}
                className="px-4 py-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isClearingAllLogs}
                onClick={handleClearAllLogs}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearingAllLogs ? (isBn ? 'পরিষ্কার করা হচ্ছে...' : 'Clearing...') : (isBn ? 'হ্যাঁ, সকল লগ মুছুন' : 'Yes, Clear All Logs')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
