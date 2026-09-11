import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  ShieldCheck,
  Edit2,
  Trash2,
  UserPlus,
  X,
  Check,
  AlertCircle,
  Key,
  ExternalLink,
  Eye
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { api } from '../../services/api.ts';
import { formatBilingualName, getAvatarInitial } from '../../utils/formatters.ts';

export const AdminCustomers: React.FC = () => {
  const { t, isBn } = useLanguage();
  const { formatPrice } = useSettings();

  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal States
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<any | null>(null);
  const [viewingOrdersCustomer, setViewingOrdersCustomer] = useState<any | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role_id: 'customer',
    password: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminCustomers();
      if (res.success) setCustomers(res.customers || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open Edit Modal
  const handleOpenEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      role_id: customer.role_id || 'customer',
      password: ''
    });
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setIsAddModalOpen(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role_id: 'customer',
      password: ''
    });
  };

  // Save Customer (Create or Edit)
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingCustomer) {
        // Update
        const res = await api.updateCustomer(editingCustomer.id, formData);
        if (res.success) {
          showNotification('success', res.message || (isBn ? 'গ্রাহকের তথ্য সফলভাবে আপডেট করা হয়েছে।' : 'Customer profile updated successfully.'));
          setEditingCustomer(null);
          loadCustomers();
        } else {
          showNotification('error', res.message || (isBn ? 'আপডেট করতে সমস্যা হয়েছে।' : 'Failed to update customer.'));
        }
      } else {
        // Create
        const res = await api.createCustomer(formData);
        if (res.success) {
          showNotification('success', res.message || (isBn ? 'নতুন গ্রাহক সফলভাবে যুক্ত করা হয়েছে।' : 'New customer added successfully.'));
          setIsAddModalOpen(false);
          loadCustomers();
        } else {
          showNotification('error', res.message || (isBn ? 'গ্রাহক যুক্ত করতে সমস্যা হয়েছে।' : 'Failed to add customer.'));
        }
      }
    } catch (err: any) {
      showNotification('error', err.message || (isBn ? 'অপারেশন সম্পন্ন করা যায়নি।' : 'Operation failed.'));
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    setIsSaving(true);
    try {
      const res = await api.deleteCustomer(deletingCustomer.id);
      if (res.success) {
        showNotification('success', isBn ? 'গ্রাহকের অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।' : 'Customer account deleted successfully.');
        setDeletingCustomer(null);
        loadCustomers();
      } else {
        showNotification('error', res.message || (isBn ? 'মুছে ফেলতে সমস্যা হয়েছে।' : 'Failed to delete customer.'));
      }
    } catch (err: any) {
      showNotification('error', err.message || (isBn ? 'গ্রাহক মুছে ফেলা যায়নি।' : 'Could not delete customer.'));
    } finally {
      setIsSaving(false);
    }
  };

  // View Customer Orders
  const handleViewOrders = async (customer: any) => {
    setViewingOrdersCustomer(customer);
    setIsLoadingOrders(true);
    try {
      const res = await api.getCustomerOrders(customer.id);
      if (res.success) {
        setCustomerOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

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

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>{isBn ? 'গ্রাহক তালিকা ও অ্যাকাউন্ট ব্যবস্থাপনা' : 'Customer Directory & Accounts'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isBn
              ? 'রেজিস্টার্ড গ্রাহকদের নাম, ইমেইল, ফোন নম্বর পরিবর্তন, নতুন গ্রাহক যুক্ত এবং অ্যাকাউন্ট মুছে ফেলার সুবিধা'
              : 'Manage registered customer profiles, contact info, roles, and order history'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isBn ? 'নাম, ইমেইল বা ফোন দিয়ে খুঁজুন...' : 'Search by name, email or phone...'}
              className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isBn ? 'নতুন গ্রাহক' : 'Add Customer'}</span>
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold">
            {isBn ? 'গ্রাহক তালিকা লোড হচ্ছে...' : 'Loading customer directory...'}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            {isBn ? 'কোনো গ্রাহক পাওয়া যায়নি।' : 'No customers found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3">{isBn ? 'গ্রাহকের নাম' : 'Customer Name'}</th>
                  <th className="pb-3">{isBn ? 'যোগাযোগ' : 'Contact'}</th>
                  <th className="pb-3">{isBn ? 'রোল' : 'Role'}</th>
                  <th className="pb-3">{isBn ? 'মোট অর্ডার' : 'Total Orders'}</th>
                  <th className="pb-3">{isBn ? 'মোট কেনাকাটা' : 'Total Spent'}</th>
                  <th className="pb-3">{isBn ? 'নিবন্ধন তারিখ' : 'Registration Date'}</th>
                  <th className="pb-3 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                    {/* Name */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-xs">
                          {getAvatarInitial(c.name, isBn)}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{formatBilingualName(c.name, isBn)}</span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {c.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{c.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{c.phone || (isBn ? 'ফোন নম্বর নেই' : 'No phone number')}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          c.role_id === 'super_admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : c.role_id === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : c.role_id === 'staff'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : c.is_guest || c.role_id === 'guest'
                            ? 'bg-slate-800 text-slate-300 border border-slate-700'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {c.role_id === 'super_admin'
                          ? (isBn ? 'সুপার অ্যাডমিন' : 'Super Admin')
                          : c.role_id === 'admin'
                          ? (isBn ? 'অ্যাডমিন' : 'Admin')
                          : c.role_id === 'staff'
                          ? (isBn ? 'স্টাফ' : 'Staff')
                          : c.is_guest || c.role_id === 'guest'
                          ? (isBn ? 'গেস্ট কাস্টমার' : 'Guest Order')
                          : (isBn ? 'নিবন্ধিত গ্রাহক' : 'Registered')}
                      </span>
                    </td>

                    {/* Orders Count */}
                    <td className="py-3.5 font-bold text-white">
                      <button
                        onClick={() => handleViewOrders(c)}
                        className="hover:text-amber-400 flex items-center gap-1 transition-colors text-left"
                        title={isBn ? "অর্ডার হিস্ট্রি দেখুন" : "View order history"}
                      >
                        <span>{c.total_orders || 0} {isBn ? 'টি অর্ডার' : 'orders'}</span>
                        <Eye className="w-3 h-3 text-slate-500" />
                      </button>
                    </td>

                    {/* Spent */}
                    <td className="py-3.5 font-black text-amber-400">
                      {formatPrice(c.total_spent || 0)}
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                      {c.created_at ? c.created_at.split(' ')[0] : 'N/A'}
                    </td>

                    {/* Actions: EDIT & DELETE */}
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Order History */}
                        <button
                          onClick={() => handleViewOrders(c)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors"
                          title={isBn ? "অর্ডার হিস্ট্রি দেখুন" : "View order history"}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold px-2.5"
                          title={isBn ? "গ্রাহকের তথ্য এডিট করুন" : "Edit customer"}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{isBn ? 'এডিট' : 'Edit'}</span>
                        </button>

                        {/* Delete Button */}
                        {c.role_id !== 'admin' && (
                          <button
                            onClick={() => setDeletingCustomer(c)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold px-2.5"
                            title={isBn ? "গ্রাহক মুছে ফেলুন" : "Delete customer"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isBn ? 'ডিলিট' : 'Delete'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CUSTOMER */}
      {/* ========================================================================= */}
      {(editingCustomer || isAddModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181B22] border border-[#2C323F] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-[#2C323F]">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>
                  {editingCustomer
                    ? (isBn ? 'গ্রাহকের তথ্য সম্পাদনা' : 'Edit Customer Profile')
                    : (isBn ? 'নতুন গ্রাহক যুক্ত করুন' : 'Add New Customer')}
                </span>
              </h3>
              <button
                onClick={() => {
                  setEditingCustomer(null);
                  setIsAddModalOpen(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              <div>
                <label className="text-slate-300 font-bold block text-xs mb-1">
                  {isBn ? 'গ্রাহকের সম্পূর্ণ নাম *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isBn ? "যেমন: মোঃ সাকিব হাসান" : "e.g. Shakib Hasan"}
                  className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block text-xs mb-1">
                    {isBn ? 'ইমেইল ঠিকানা *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="customer@example.com"
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block text-xs mb-1">
                    {isBn ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block text-xs mb-1">
                    {isBn ? 'অ্যাকাউন্ট রোল' : 'Account Role'}
                  </label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="customer">{isBn ? 'সাধারণ গ্রাহক' : 'Customer'}</option>
                    <option value="staff">{isBn ? 'ম্যানেজার / স্টাফ' : 'Staff / Manager'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block text-xs mb-1">
                    {editingCustomer
                      ? (isBn ? 'নতুন পাসওয়ার্ড (ঐচ্ছিক)' : 'New Password (Optional)')
                      : (isBn ? 'পাসওয়ার্ড *' : 'Password *')}
                  </label>
                  <input
                    type="password"
                    required={!editingCustomer}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={
                      editingCustomer
                        ? (isBn ? 'পরিবর্তন না করতে খালি রাখুন' : 'Leave blank to keep unchanged')
                        : (isBn ? 'কমপক্ষে ৬ ডিজিট' : 'Min 6 characters')
                    }
                    className="w-full bg-[#12141A] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C323F]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCustomer(null);
                    setIsAddModalOpen(false);
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
                        {editingCustomer
                          ? (isBn ? 'আপডেট করুন' : 'Save Changes')
                          : (isBn ? 'গ্রাহক যুক্ত করুন' : 'Create Customer')}
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
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181B22] border border-rose-900/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">
                {isBn ? 'গ্রাহক অ্যাকাউন্ট মুছে ফেলতে চান?' : 'Delete Customer Account?'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn ? (
                  <>
                    আপনি কি নিশ্চিত যে <span className="font-bold text-white">"{formatBilingualName(deletingCustomer.name, isBn)}"</span> ({deletingCustomer.email}) এর অ্যাকাউন্টটি স্থায়ীভাবে ডিলিট করতে চান?
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently delete the account of <span className="font-bold text-white">"{formatBilingualName(deletingCustomer.name, isBn)}"</span> ({deletingCustomer.email})?
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                {isBn ? 'না, বাতিল করুন' : 'No, Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                disabled={isSaving}
                className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-xs font-black transition-colors shadow-sm"
              >
                {isSaving
                  ? (isBn ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...')
                  : (isBn ? 'হ্যাঁ, ডিলিট করুন' : 'Yes, Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CUSTOMER ORDER HISTORY */}
      {/* ========================================================================= */}
      {viewingOrdersCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181B22] border border-[#2C323F] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-[#2C323F]">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>
                    {isBn
                      ? `${formatBilingualName(viewingOrdersCustomer.name, isBn)} - এর অর্ডার হিস্ট্রি`
                      : `Order History - ${formatBilingualName(viewingOrdersCustomer.name, isBn)}`}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{viewingOrdersCustomer.email}</p>
              </div>
              <button
                onClick={() => setViewingOrdersCustomer(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              {isLoadingOrders ? (
                <div className="text-center py-8 text-slate-400 text-xs font-bold">
                  {isBn ? 'অর্ডার লোড হচ্ছে...' : 'Loading orders...'}
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {isBn ? 'এই গ্রাহকের কোনো পূর্ববর্তী অর্ডার রেকর্ড নেই।' : 'No previous orders found for this customer.'}
                </div>
              ) : (
                customerOrders.map((ord) => (
                  <div key={ord.id} className="bg-[#12141A] border border-[#2C323F] rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-amber-400 text-xs">#{ord.order_number}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {isBn ? 'তারিখ:' : 'Date:'} {ord.created_at?.split(' ')[0]} | {isBn ? 'পেমেন্ট মেথড:' : 'Payment:'}{' '}
                        <span className="uppercase text-white font-bold">{ord.payment_method}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {isBn ? 'ডেলিভারি ঠিকানা:' : 'Shipping Address:'} {ord.shipping_address}, {ord.shipping_city}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="text-xs font-black text-white">{formatPrice(ord.grand_total)}</p>
                      <div className="flex items-center gap-1 justify-end">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          ord.payment_status === 'paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {ord.payment_status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-900 text-slate-300 border border-slate-800">
                          {ord.order_status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-[#2C323F] text-right">
              <button
                onClick={() => setViewingOrdersCustomer(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
