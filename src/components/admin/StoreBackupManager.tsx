import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  Database,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  Package,
  Layers,
  ShoppingBag,
  Sliders,
  FolderArchive,
  ArrowDownToLine,
  Info,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { getAuthToken } from '../../services/api.ts';

interface BackupSummary {
  products_count: number;
  categories_count: number;
  subcategories_count: number;
  orders_count: number;
  banners_count: number;
  coupons_count: number;
  reviews_count: number;
  users_count: number;
  last_settings_update: string;
  exported_at: string;
}

export const StoreBackupManager: React.FC = () => {
  const { isBn } = useLanguage();
  const { refreshSettings } = useSettings();

  const [summary, setSummary] = useState<BackupSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isExportingDb, setIsExportingDb] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getToken = () => {
    return getAuthToken() || localStorage.getItem('shophatbd_token') || localStorage.getItem('shopnova_token') || localStorage.getItem('token') || '';
  };

  const fetchSummary = async () => {
    try {
      setIsLoadingSummary(true);
      const token = getToken();
      const res = await fetch('/api/admin/backup/summary', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch backup summary:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // 1. Export JSON
  const handleExportJson = async () => {
    try {
      setIsExportingJson(true);
      const token = getToken();
      const res = await fetch('/api/admin/backup/export-json', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to export JSON backup');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `shophatbd_store_backup_${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Export JSON error:', error);
      alert(isBn ? (error.message || 'ব্যাকআপ ডাউনলোড করতে সমস্যা হয়েছে।') : (error.message || 'Failed to download JSON backup.'));
    } finally {
      setIsExportingJson(false);
    }
  };

  // 2. Export Raw DB
  const handleExportDb = async () => {
    try {
      setIsExportingDb(true);
      const token = getToken();
      const res = await fetch('/api/admin/backup/export-db', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to export DB file');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `shophatbd_database_${timestamp}.db`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Export DB error:', error);
      alert(isBn ? (error.message || 'ডাটাবেজ ফাইল ডাউনলোড করতে সমস্যা হয়েছে।') : (error.message || 'Failed to download DB file.'));
    } finally {
      setIsExportingDb(false);
    }
  };

  // 3. Export Products CSV
  const handleExportCsv = async () => {
    try {
      setIsExportingCsv(true);
      const token = getToken();
      const res = await fetch('/api/admin/backup/export-products-csv', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to export CSV');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `shophatbd_products_${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Export CSV error:', error);
      alert(isBn ? (error.message || 'প্রোডাক্ট এক্সেল / CSV ডাউনলোড করতে সমস্যা হয়েছে।') : (error.message || 'Failed to download products CSV.'));
    } finally {
      setIsExportingCsv(false);
    }
  };

  // 4. Handle JSON File Selection & Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setRestoreStatus(null);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedFile) {
      alert(isBn ? 'অনুগ্রহ করে একটি .json ব্যাকআপ ফাইল সিলেক্ট করুন।' : 'Please select a .json backup file.');
      return;
    }

    const confirmMsg = isBn
      ? 'আপনি কি নিশ্চিত যে এই ব্যাকআপ ফাইলটি থেকে স্টোরের ডেটা রিস্টোর করতে চান? এতে নতুন ডেটা আপডেট হবে।'
      : 'Are you sure you want to restore store data from this backup file? Existing data will be updated.';

    if (!window.confirm(confirmMsg)) return;

    try {
      setIsRestoring(true);
      setRestoreStatus(null);

      const fileText = await selectedFile.text();
      const parsedJson = JSON.parse(fileText);

      const token = getToken();
      const res = await fetch('/api/admin/backup/restore-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ backup: parsedJson })
      });

      const result = await res.json();
      if (result.success) {
        setRestoreStatus({
          success: true,
          message: isBn
            ? 'অভিনন্দন! আপনার ব্যাকআপ ফাইল থেকে সকল প্রোডাক্ট, ক্যাটাগরি ও সেটিংস সফলভাবে রিস্টোর হয়েছে।'
            : 'Store backup data restored successfully.'
        });
        fetchSummary();
        refreshSettings();
        setSelectedFile(null);
      } else {
        setRestoreStatus({
          success: false,
          message: result.message || (isBn ? 'রিস্টোর করতে সমস্যা হয়েছে।' : 'Failed to restore.')
        });
      }
    } catch (err: any) {
      console.error('Restore error:', err);
      setRestoreStatus({
        success: false,
        message: err.message || (isBn ? 'ভুল ফরম্যাটের ফাইল বা ফাইলটি ক্ষতিগ্রস্ত।' : 'Invalid or corrupted JSON file.')
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isBn ? 'দোকানের ডেটা এক্সপোর্ট (Export Store Data)' : 'Store Data Export'}</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  {isBn ? '১০০% সুরক্ষিত' : 'Secure'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn
                  ? 'আপনার স্টোরের সমস্ত প্রোডাক্ট, ক্যাটাগরি, ব্যানার, সেটিংস ও অর্ডারের সম্পূর্ণ ডেটা এক্সপোর্ট ফাইল ডাউনলোড করুন।'
                  : 'Download complete export of all products, categories, banners, settings, and orders.'}
              </p>
            </div>
          </div>

          <button
            id="btn-backup-refresh"
            type="button"
            onClick={fetchSummary}
            disabled={isLoadingSummary}
            className="p-2 rounded-xl bg-[#14171E] border border-[#2C323F] text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSummary ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
          </button>
        </div>

        {/* Live Store Stats Grid */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#2C323F]">
            <div className="bg-[#14171E] border border-[#2C323F]/70 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBn ? 'মোট প্রোডাক্ট' : 'Total Products'}</span>
              </div>
              <p className="text-lg font-black text-white">{summary.products_count}</p>
            </div>

            <div className="bg-[#14171E] border border-[#2C323F]/70 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>{isBn ? 'ক্যাটাগরি ও সাব' : 'Categories'}</span>
              </div>
              <p className="text-lg font-black text-white">
                {summary.categories_count + summary.subcategories_count}
              </p>
            </div>

            <div className="bg-[#14171E] border border-[#2C323F]/70 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBn ? 'মোট অর্ডার' : 'Total Orders'}</span>
              </div>
              <p className="text-lg font-black text-white">{summary.orders_count}</p>
            </div>

            <div className="bg-[#14171E] border border-[#2C323F]/70 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>{isBn ? 'সেটিংস স্ট্যাটাস' : 'Settings'}</span>
              </div>
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <Check className="w-3.5 h-3.5" />
                <span>{isBn ? 'সম্পূর্ণ সক্রিয়' : 'Active & Synced'}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Export Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Full Store JSON Backup */}
        <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-md">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {isBn ? 'পূর্ণাঙ্গ স্টোর ডেটা ব্যাকআপ (JSON)' : 'Complete Store Backup (JSON)'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {isBn
                  ? 'সব প্রোডাক্ট, ভ্যারিয়েন্ট, ক্যাটাগরি, ব্যানার, কুপন, সেটিংস ও অর্ডার একটি সমন্বিত ফাইলে ডাউনলোড হবে।'
                  : 'Exports all products, variants, categories, banners, coupons, settings, and orders into one file.'}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#2C323F]">
            <button
              id="btn-export-store-json"
              type="button"
              onClick={handleExportJson}
              disabled={isExportingJson}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {isExportingJson ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isBn ? 'ডাউনলোড হচ্ছে...' : 'Exporting...'}</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>{isBn ? 'Store Data (JSON) ডাউনলোড' : 'Download Store JSON'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Raw SQLite Database File */}
        <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-md">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {isBn ? 'ডাটাবেজ ফাইল (.db / SQLite)' : 'Database Binary (.db / SQLite)'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {isBn
                  ? 'সার্ভারের আসল ডাটাবেজ ফাইল (.db)। হোস্টিংয়ে সরাসরি ব্যবহারের জন্য উপযুক্ত।'
                  : 'Direct server database file (.db), ready for direct VPS or cPanel deployment.'}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#2C323F]">
            <button
              id="btn-export-sqlite-db"
              type="button"
              onClick={handleExportDb}
              disabled={isExportingDb}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {isExportingDb ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isBn ? 'ডাউনলোড হচ্ছে...' : 'Exporting...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isBn ? 'Database (.db) ডাউনলোড' : 'Download Database (.db)'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 3: Products Catalog CSV */}
        <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-md">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {isBn ? 'প্রোডাক্ট ক্যাটালগ (Excel / CSV)' : 'Products Catalog (CSV)'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {isBn
                  ? 'মাইক্রোসফট এক্সেল বা গুগল শিটসে প্রোডাক্টের স্টক, দাম ও SKU দেখার জন্য এক্সেল স্প্রেডশিট।'
                  : 'Spreadsheet format for viewing stock, price, and SKU in Microsoft Excel or Google Sheets.'}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#2C323F]">
            <button
              id="btn-export-products-csv"
              type="button"
              onClick={handleExportCsv}
              disabled={isExportingCsv}
              className="w-full py-2.5 px-4 bg-[#14171E] hover:bg-slate-800 border border-[#2C323F] hover:border-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {isExportingCsv ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isBn ? 'ডাউনলোড হচ্ছে...' : 'Exporting...'}</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                  <span>{isBn ? 'Products CSV ডাউনলোড' : 'Download Products CSV'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Restore Store Data Section */}
      <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {isBn ? 'ব্যাকআপ থেকে ডেটা রিস্টোর / ফিরিয়ে আনুন (Restore Store Data)' : 'Restore Store Data from Backup'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBn
                ? 'পূর্বে ডাউনলোড করা .json ব্যাকআপ ফাইল আপলোড করে ১ ক্লিকে সমস্ত প্রোডাক্ট ও সেটিংস রিস্টোর করুন।'
                : 'Upload a previously downloaded .json backup file to restore all products and settings in one click.'}
            </p>
          </div>
        </div>

        {/* Restore File Input Box */}
        <div className="p-4 bg-[#14171E] border border-dashed border-[#2C323F] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="file"
              accept=".json"
              id="backupFileInput"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="backupFileInput"
              className="cursor-pointer px-4 py-2 bg-[#1E222B] hover:bg-slate-800 text-slate-300 border border-[#2C323F] rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isBn ? 'ব্যাকআপ ফাইল (.json) সিলেক্ট করুন' : 'Choose JSON Backup File'}</span>
            </label>

            <span className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {selectedFile ? selectedFile.name : (isBn ? 'কোনো ফাইল সিলেক্ট করা হয়নি' : 'No file selected')}
            </span>
          </div>

          <button
            id="btn-restore-backup"
            type="button"
            onClick={handleRestoreBackup}
            disabled={!selectedFile || isRestoring}
            className="w-full sm:w-auto px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 shadow-md shrink-0 cursor-pointer"
          >
            {isRestoring ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{isBn ? 'রিস্টোর হচ্ছে...' : 'Restoring...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isBn ? 'এখনই রিস্টোর করুন' : 'Restore Backup Now'}</span>
              </>
            )}
          </button>
        </div>

        {/* Status Alert */}
        {restoreStatus && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
              restoreStatus.success
                ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/70 border border-rose-800 text-rose-300'
            }`}
          >
            {restoreStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{restoreStatus.message}</span>
          </div>
        )}
      </div>

      {/* Helpful Guide on Full Website ZIP Export */}
      <div className="bg-[#14171E] border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs text-slate-300">
          <p className="font-bold text-white flex items-center gap-2">
            <span>{isBn ? 'সম্পূর্ণ ওয়েবসাইটের কোড (Full Project ZIP) কোথায় পাবেন?' : 'Where to get Full Website Source Code (ZIP)?'}</span>
          </p>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {isBn
              ? 'ওয়েবসাইটের সম্পূর্ণ ডিজাইন, ফ্রন্টএন্ড ও ব্যাকএন্ডের সোর্স কোড ডাউনলোড করতে স্ক্রিনের উপরের ডানদিকের সেটিংস / মেনু (Three Dots ...) থেকে "Export as ZIP" অপশন ব্যবহার করুন। আর আপনার দোকানের পণ্য ও অর্ডার ব্যাকআপ রাখতে ওপরের "Download Store JSON" বাটন ব্যবহার করুন।'
              : 'To download the entire frontend & backend project code, use "Export as ZIP" from the top-right AI Studio settings menu. To backup your store products and orders, use the "Download Store JSON" button above.'}
          </p>
        </div>
      </div>
    </div>
  );
};
