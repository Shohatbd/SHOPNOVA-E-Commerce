import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Truck,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  X,
  AlertCircle,
  DollarSign,
  User,
  MapPin,
  FileText,
  Save,
  Plus,
  MessageSquare,
  Send
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatBilingualName } from '../../utils/formatters.ts';
import { InvoiceModal } from '../common/InvoiceModal.tsx';

const STATUS_OPTIONS: { key: string; labelEn: string; labelBn: string; color: string }[] = [
  { key: 'all', labelEn: 'All Orders', labelBn: 'সব অর্ডার', color: 'text-slate-400' },
  { key: 'pending', labelEn: 'Pending', labelBn: 'পেন্ডিং', color: 'text-amber-400' },
  { key: 'confirmed', labelEn: 'Confirmed', labelBn: 'কনফার্মড', color: 'text-blue-400' },
  { key: 'processing', labelEn: 'Processing', labelBn: 'প্রসেসিং', color: 'text-indigo-400' },
  { key: 'packed', labelEn: 'Packed', labelBn: 'প্যাকড', color: 'text-purple-400' },
  { key: 'shipped', labelEn: 'Shipped', labelBn: 'শিফ্ট / পাঠানো', color: 'text-cyan-400' },
  { key: 'out_for_delivery', labelEn: 'Out for Delivery', labelBn: 'ডেলিভারিতে আছে', color: 'text-amber-400' },
  { key: 'delivered', labelEn: 'Delivered', labelBn: 'ডেলিভার্ড', color: 'text-emerald-400' },
  { key: 'cancelled', labelEn: 'Cancelled', labelBn: 'বাতিল', color: 'text-rose-400' },
  { key: 'returned', labelEn: 'Returned', labelBn: 'ফেরত', color: 'text-red-400' }
];

export const AdminOrders: React.FC = () => {
  const { t, isBn } = useLanguage();
  const { formatPrice } = useSettings();

  const [orders, setOrders] = useState<Order[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Quick Dispatch / Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [courierName, setCourierName] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Full Edit Order Modal
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Order State
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Invoice Print / Download Modal State
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);

  // Send Order SMS State
  const [smsModalOrder, setSmsModalOrder] = useState<Order | null>(null);
  const [smsTemplateType, setSmsTemplateType] = useState<string>('order_placed');
  const [smsCustomMessage, setSmsCustomMessage] = useState<string>('');
  const [isSendingSms, setIsSendingSms] = useState<boolean>(false);
  const [smsResult, setSmsResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendOrderSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsModalOrder) return;
    setIsSendingSms(true);
    setSmsResult(null);
    try {
      const data = await api.sendOrderSms({
        order_id: smsModalOrder.id,
        template_type: smsTemplateType,
        custom_message: smsCustomMessage.trim() || undefined
      });
      setSmsResult({
        success: data.success,
        message: data.message || (data.success ? 'SMS sent successfully!' : 'Failed to send SMS')
      });
      if (data.success) {
        setTimeout(() => {
          setSmsModalOrder(null);
          setSmsResult(null);
        }, 2500);
      }
    } catch (err: any) {
      setSmsResult({
        success: false,
        message: err?.message || 'Failed to dispatch SMS'
      });
    } finally {
      setIsSendingSms(false);
    }
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminOrders({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchQuery || undefined
      });
      if (res.success) {
        setOrders(res.orders || []);
        if (res.statusCounts) {
          setStatusCounts(res.statusCounts);
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const handleOpenDetails = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.order_status);
    setCourierName(ord.courier_name || 'Steadfast Courier');
    setTrackingId(ord.tracking_id || '');
    setStatusMsg('');
  };

  const handleOpenEdit = (ord: Order) => {
    setEditingOrder(ord);
    setEditFormData({
      customer_name: ord.customer_name || '',
      customer_phone: ord.customer_phone || '',
      customer_email: ord.customer_email || '',
      shipping_address: ord.shipping_address || '',
      shipping_city: ord.shipping_city || 'Dhaka',
      order_status: ord.order_status || 'pending',
      payment_status: ord.payment_status || 'unpaid',
      payment_method: ord.payment_method || 'cod',
      courier_name: ord.courier_name || '',
      tracking_id: ord.tracking_id || '',
      shipping_cost: ord.shipping_cost ?? 60,
      discount_amount: ord.discount_amount ?? 0,
      grand_total: ord.grand_total,
      notes: ord.notes || ''
    });
    setEditError('');
  };

  const handleQuickStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdatingStatus(true);
    setStatusMsg('');

    try {
      const res = await api.updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        courier_name: courierName,
        tracking_id: trackingId
      });

      if (res.success) {
        setStatusMsg('Order status updated successfully.');
        loadOrders();
        setTimeout(() => {
          setSelectedOrder(null);
        }, 1000);
      }
    } catch (err: any) {
      setStatusMsg(err.message || 'Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveOrderEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setIsSavingEdit(true);
    setEditError('');

    try {
      const res = await api.editOrder(editingOrder.id, editFormData);
      if (res.success) {
        setEditingOrder(null);
        loadOrders();
      }
    } catch (err: any) {
      setEditError(err.message || 'Failed to save order details.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteOrder(orderToDelete.id);
      setOrderToDelete(null);
      if (selectedOrder?.id === orderToDelete.id) setSelectedOrder(null);
      if (editingOrder?.id === orderToDelete.id) setEditingOrder(null);
      loadOrders();
    } catch (err) {
      console.error('Failed to delete order:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-[#1E222B] border border-[#2C323F] p-4 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadOrders();
            }}
            className="flex-1 relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Customer Name, Phone, or Courier ID..."
              className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <button
            onClick={loadOrders}
            className="px-4 py-2.5 bg-[#14171E] hover:bg-[#181C25] text-slate-300 border border-[#2C323F] rounded-xl text-xs font-semibold"
          >
            Refresh
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {STATUS_OPTIONS.map((st) => {
            const count = statusCounts[st.key] ?? 0;
            const isSelected = selectedStatus === st.key;
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setSelectedStatus(st.key)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-[#14171E] text-slate-400 border-[#2C323F] hover:text-white hover:bg-[#181C25]'
                }`}
              >
                <span>{isBn ? st.labelBn : st.labelEn}</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                    isSelected
                      ? 'bg-slate-950 text-amber-400'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No customer orders found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2C323F] text-slate-400 font-bold">
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Customer Details</th>
                  <th className="pb-3">Grand Total</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Courier / Tracking</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C323F]/80">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#14171E]/50 transition-colors">
                    <td className="py-3">
                      <span className="font-mono text-white font-bold block">{ord.order_number}</span>
                      <span className="text-[10px] text-slate-500">{ord.created_at}</span>
                    </td>

                    <td className="py-3">
                      <div className="font-bold text-white">{formatBilingualName(ord.customer_name, isBn)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ord.customer_phone}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">{ord.shipping_address}, {ord.shipping_city}</div>
                    </td>

                    <td className="py-3 font-black text-amber-400">
                      {formatPrice(ord.grand_total)}
                    </td>

                    <td className="py-3">
                      <span className="font-bold text-slate-300 block">
                        {ord.payment_method === 'card' ? '💳 Card' : ord.payment_method?.toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold ${ord.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {ord.payment_status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3">
                      {ord.courier_name ? (
                        <div>
                          <span className="font-bold text-slate-300 uppercase block">{ord.courier_name}</span>
                          <span className="font-mono text-[10px] text-amber-400 font-bold">{ord.tracking_id || 'Pending ID'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {ord.order_status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Prominent Action Buttons */}
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInvoiceModalOrder(ord)}
                          className="p-1.5 text-amber-400 hover:text-white bg-[#14171E] hover:bg-[#2C323F] border border-[#2C323F] rounded-lg transition-colors cursor-pointer"
                          title={isBn ? "ইনভয়েস প্রিন্ট / ডাউনলোড করুন" : "Print / Download Invoice"}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDetails(ord)}
                          className="p-1.5 text-slate-300 hover:text-white bg-[#14171E] hover:bg-[#2C323F] border border-[#2C323F] rounded-lg transition-colors cursor-pointer"
                          title="View Details & Quick Dispatch"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(ord)}
                          className="px-2 py-1.5 text-amber-400 hover:text-slate-950 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/30 rounded-lg transition-colors font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          title="Edit Order"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setOrderToDelete(ord)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-900/60 rounded-lg transition-colors cursor-pointer"
                          title="Delete Order"
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

      {/* 1. Quick View & Status / Courier Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => setSelectedOrder(null)} />

          <div className="relative w-full max-w-2xl bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#2C323F]">
              <div>
                <h3 className="text-base font-bold text-white">Order Details: {selectedOrder.order_number}</h3>
                <p className="text-xs text-slate-400">Placed on {selectedOrder.created_at}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInvoiceModalOrder(selectedOrder)}
                  className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={isBn ? "ইনভয়েস প্রিন্ট / ডাউনলোড করুন" : "Print / Download Invoice"}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ইনভয়েস প্রিন্ট' : 'Print Invoice'}</span>
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#14171E] border border-[#2C323F] rounded-xl">
              <div>
                <span className="text-slate-400 font-bold block mb-1">Customer Info</span>
                <p className="text-white font-bold">{formatBilingualName(selectedOrder.customer_name, isBn)}</p>
                <p className="text-slate-300 font-mono">{selectedOrder.customer_phone}</p>
                {selectedOrder.customer_email && <p className="text-slate-400">{selectedOrder.customer_email}</p>}
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-1">Delivery Address</span>
                <p className="text-slate-200">{selectedOrder.shipping_address}</p>
                <p className="text-amber-400 font-semibold">{selectedOrder.shipping_city}</p>
              </div>
            </div>

            {/* Payment & Transaction Details */}
            <div className="p-4 bg-[#14171E] border border-[#2C323F] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold block text-xs">Payment Information</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white uppercase text-sm">
                    {selectedOrder.payment_method}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    selectedOrder.payment_status === 'paid'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {selectedOrder.payment_status === 'paid' ? 'PAID / পরিশোধিত' : 'PENDING / অপরিশোধিত'}
                  </span>
                </div>
                {selectedOrder.payment?.transaction_id && (
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="text-slate-400">TrxID:</span>
                    <code className="bg-black/40 px-2 py-0.5 rounded text-amber-400 font-mono font-bold select-all">
                      {selectedOrder.payment.transaction_id}
                    </code>
                  </div>
                )}
                {selectedOrder.notes && (
                  <p className="text-[11px] text-slate-400 italic">
                    {selectedOrder.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedOrder.payment_status !== 'paid' && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await api.updateOrderStatus(selectedOrder.id, {
                          order_status: selectedOrder.order_status,
                          payment_status: 'paid'
                        });
                        loadOrders();
                        setSelectedOrder({
                          ...selectedOrder,
                          payment_status: 'paid'
                        });
                      } catch (e) {}
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    ✓ Mark as Paid
                  </button>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <span className="text-slate-300 font-bold block mb-2">Purchased Items ({selectedOrder.items?.length || 0})</span>
              <div className="border border-[#2C323F] rounded-xl overflow-hidden divide-y divide-[#2C323F]">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 bg-[#14171E] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{item.product_name}</p>
                      {(item.size || item.color || item.variant_name) && (
                        <p className="text-[11px] text-amber-400 font-semibold">
                          {item.size ? `Size: ${item.size}` : ''}
                          {item.size && item.color ? ' • ' : ''}
                          {item.color ? `Color: ${item.color}` : ''}
                          {item.variant_name && !item.size && !item.color ? `Variant: ${item.variant_name}` : ''}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-500">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                    </div>
                    <span className="font-bold text-amber-400">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status & Courier Dispatch Form */}
            <form onSubmit={handleQuickStatusSubmit} className="space-y-4 p-4 bg-[#14171E] border border-[#2C323F] rounded-xl">
              <span className="text-slate-300 font-bold block">Update Status & Dispatch Courier</span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Order Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full bg-[#1E222B] border border-[#2C323F] rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {STATUS_OPTIONS.filter((s) => s.key !== 'all').map((s) => (
                      <option key={s.key} value={s.key}>{isBn ? s.labelBn : s.labelEn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Courier Partner</label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full bg-[#1E222B] border border-[#2C323F] rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Steadfast Courier">Steadfast Courier (স্টেডফাস্ট)</option>
                    <option value="Pathao Courier">Pathao Courier (পাঠাও)</option>
                    <option value="RedX Delivery">RedX (রেডএক্স)</option>
                    <option value="Paperfly">Paperfly</option>
                    <option value="Sundarban Courier">Sundarban Courier</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Tracking ID / Consignment</label>
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="e.g. PTH-892301"
                    className="w-full bg-[#1E222B] border border-[#2C323F] rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {statusMsg && (
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{statusMsg}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2C323F]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const ord = selectedOrder;
                      setSelectedOrder(null);
                      handleOpenEdit(ord);
                    }}
                    className="text-amber-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Full Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSmsModalOrder(selectedOrder);
                      setSmsTemplateType(selectedOrder.order_status === 'shipped' ? 'order_shipped' : 'order_placed');
                    }}
                    className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send SMS</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {isUpdatingStatus ? 'Updating...' : 'Save Dispatch & Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Full Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in" onClick={() => setEditingOrder(null)} />

          <div className="relative w-full max-w-2xl bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#2C323F]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Edit Order: {editingOrder.order_number}</h3>
              </div>
              <button onClick={() => setEditingOrder(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveOrderEdit} className="space-y-4">
              {/* Customer Info Section */}
              <div className="space-y-3 p-4 bg-[#14171E] border border-[#2C323F] rounded-xl">
                <span className="text-slate-300 font-bold block flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Customer Contact & Shipping Address
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.customer_name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, customer_name: e.target.value })}
                      className="w-full bg-[#1E222B] border border-[#2C323F] rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Contact Phone *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.customer_phone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, customer_phone: e.target.value })}
                      className="w-full bg-[#1E222B] border border-[#2C323F] rounded-lg p-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editFormData.customer_email || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, customer_email: e.target.value })}
                      className="w-full bg-[#1E222B] border border-[#2C323F] rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">City / Division</label>
                    <input
                      type="text"
                      value={editFormData.shipping_city || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, shipping_city: e.target.value })}
                      className="w-full bg-[#1E222B] border border-[#2C323F] rounded-lg p-2 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-slate-400 font-semibold block mb-1">Full Delivery Address</label>
                    <textarea
                      rows={2}
                      value={editFormData.shipping_address || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, shipping_address: e.target.value })}
                      className="w-full bg-[#1E222B] border border-[#2C323F] rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Payment Settings */}
              <div className="space-y-3 p-4 bg-[#14171E] border border-[#2C323F] rounded-xl">
                <span className="text-slate-300 font-bold block flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  Order & Payment Status
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Order Status</label>
                    <select
                      value={editFormData.order_status}
                      onChange={(e) => setEditFormData({ ...editFormData, order_status: e.target.value })}
                      className="w-full bg-[#1E222B] border border-[#2C323F] rounded-lg p-2 text-white"
                    >
                      {STATUS_OPTIONS.filter((s) => s.key !== 'all').map((s) => (
                        <option key={s.key} value={s.key}>{isBn ? s.labelBn : s.labelEn}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Payment Status</label>
                    <select
                      value={editFormData.payment_status}
                      onChange={(e) => setEditFormData({ ...editFormData, payment_status: e.target.value })}
                      className="w-full bg-[#1E222B] border border-[#2C323F] rounded-lg p-2 text-white"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Payment Method</label>
                    <select
                      value={editFormData.payment_method}
                      onChange={(e) => setEditFormData({ ...editFormData, payment_method: e.target.value })}
                      className="w-full bg-[#1E222B] border border-[#2C323F] rounded-lg p-2 text-white"
                    >
                      <option value="cod">Cash on Delivery</option>
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="card">Card / Online</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Courier Partner</label>
                    <input
                      type="text"
                      value={editFormData.courier_name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, courier_name: e.target.value })}
                      placeholder="e.g. Pathao"
                      className="w-full bg-[#1E222B] border border-[#2C323F] rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Tracking ID</label>
                    <input
                      type="text"
                      value={editFormData.tracking_id || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, tracking_id: e.target.value })}
                      placeholder="e.g. TRK-99238"
                      className="w-full bg-[#1E222B] border border-[#2C323F] rounded-lg p-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Grand Total (৳)</label>
                    <input
                      type="number"
                      value={editFormData.grand_total ?? 0}
                      onChange={(e) => setEditFormData({ ...editFormData, grand_total: Number(e.target.value) })}
                      className="w-full bg-[#1E222B] border border-[#2C323F] rounded-lg p-2 text-amber-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#2C323F]">
                <button
                  type="button"
                  onClick={() => {
                    const ord = editingOrder;
                    setEditingOrder(null);
                    setOrderToDelete(ord);
                  }}
                  className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-rose-950/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Order</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 text-slate-400 hover:text-white font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingEdit ? 'Saving...' : 'Save Order Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Order Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in"
            onClick={() => setOrderToDelete(null)}
          />
          <div className="relative w-full max-w-md bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">Delete Order?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently delete order <span className="text-white font-mono font-bold">{orderToDelete.order_number}</span> for customer <span className="text-white font-semibold">{orderToDelete.customer_name}</span>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#2C323F]">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 4. Send Order SMS Modal */}
      {smsModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in"
            onClick={() => setSmsModalOrder(null)}
          />
          <div className="relative w-full max-w-lg bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C323F]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Send SMS to Customer</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Order #{smsModalOrder.order_number} • {smsModalOrder.customer_phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSmsModalOrder(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {smsResult && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 font-bold ${
                  smsResult.success
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-800 text-rose-300'
                }`}
              >
                {smsResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{smsResult.message}</span>
              </div>
            )}

            <form onSubmit={handleSendOrderSms} className="space-y-4">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Select SMS Type / Template</label>
                <select
                  value={smsTemplateType}
                  onChange={(e) => setSmsTemplateType(e.target.value)}
                  className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
                >
                  <option value="order_placed">📦 Order Placed & Instant Tracking ID SMS</option>
                  <option value="order_confirmed">✅ Order Confirmed SMS</option>
                  <option value="order_shipped">🚚 Courier Handover & Tracking ID SMS</option>
                  <option value="order_delivered">🎉 Order Delivered & Thank You SMS</option>
                  <option value="custom">✍️ Custom Message</option>
                </select>
              </div>

              {smsTemplateType === 'custom' && (
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Custom Message Text</label>
                  <textarea
                    rows={4}
                    value={smsCustomMessage}
                    onChange={(e) => setSmsCustomMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>
              )}

              <div className="bg-[#14171E] p-3 rounded-xl border border-[#2C323F] text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Recipient:</span>
                  <span className="text-white font-bold font-mono">{smsModalOrder.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="text-white font-semibold">{smsModalOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Total:</span>
                  <span className="text-amber-400 font-bold">৳{smsModalOrder.grand_total}</span>
                </div>
                {smsModalOrder.tracking_id && (
                  <div className="flex justify-between">
                    <span>Tracking ID:</span>
                    <span className="text-emerald-400 font-bold font-mono">{smsModalOrder.tracking_id}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C323F]">
                <button
                  type="button"
                  onClick={() => setSmsModalOrder(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingSms}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingSms ? 'Sending SMS...' : 'Send SMS Now 🚀'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {invoiceModalOrder && (
        <InvoiceModal
          order={invoiceModalOrder}
          isOpen={Boolean(invoiceModalOrder)}
          onClose={() => setInvoiceModalOrder(null)}
        />
      )}
    </div>
  );
};
