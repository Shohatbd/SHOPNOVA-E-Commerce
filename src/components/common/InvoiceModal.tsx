import React, { useRef, useState, useEffect } from 'react';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Order } from '../../types/index.ts';
import { useSettings } from '../../context/SettingsContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface InvoiceModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  autoPrint?: boolean;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
  autoPrint = false
}) => {
  const { settings, formatPrice } = useSettings();
  const { isBn } = useLanguage();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [printBlockedNotice, setPrintBlockedNotice] = useState(false);

  useEffect(() => {
    if (isOpen && autoPrint) {
      // Small timeout to allow modal DOM rendering
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint]);

  if (!isOpen || !order) return null;

  const invoiceNumber = `INV-${order.order_number}`;
  const orderDate = order.created_at || new Date().toISOString().split('T')[0];

  const getPaymentMethodText = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'cod':
        return isBn ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : 'Cash on Delivery (COD)';
      case 'bkash':
        return isBn ? 'বিকাশ পেমেন্ট (bKash Online)' : 'bKash Online Payment';
      case 'nagad':
        return isBn ? 'নগদ পেমেন্ট (Nagad Online)' : 'Nagad Online Payment';
      case 'card':
        return isBn ? 'ক্রেডিট / ডেবিট কার্ড' : 'Credit / Debit Card';
      default:
        return method?.toUpperCase() || 'COD';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === 'paid') {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
          {isBn ? 'পরিশোধিত (PAID)' : 'PAID'}
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
        {isBn ? 'অপরিশোধিত - ক্যাশ অন ডেলিভারি' : 'UNPAID - CASH ON DELIVERY'}
      </span>
    );
  };

  // Generate self-contained HTML for instant offline print / download
  const generateInvoiceHTML = () => {
    const siteName = settings.site_name || 'SHOPNOVA';
    const siteTagline = isBn ? (settings.site_tagline_bn || 'প্রিমিয়াম লাইফস্টাইল ও আধুনিক গ্যাজেট') : (settings.site_tagline_en || 'Premium Lifestyle & Gadget Destination');
    const phone = settings.contact_phone || '+880 1700-000000';
    const email = settings.contact_email || 'support@shopnova.com';
    const address = isBn
      ? (settings.company_address_bn || 'বাড়ি ৪৫, রোড ১১, ব্লক ডি, বনানী, ঢাকা-১২১৩, বাংলাদেশ')
      : (settings.company_address_en || 'House 45, Road 11, Block D, Banani, Dhaka-1213, Bangladesh');

    const itemsRows = (order.items || []).map((item, idx) => {
      const name = isBn && item.product_name_bn ? item.product_name_bn : (item.product_name_en || item.product_name_bn || 'Product');
      const variantInfo = [item.size ? `Size: ${item.size}` : '', item.color ? `Color: ${item.color}` : ''].filter(Boolean).join(', ');
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 8px; text-align: center; color: #64748b; font-size: 12px;">${idx + 1}</td>
          <td style="padding: 10px 8px;">
            <div style="font-weight: 700; color: #0f172a; font-size: 13px;">${name}</div>
            ${variantInfo ? `<div style="font-size: 11px; color: #64748b;">${variantInfo}</div>` : ''}
          </td>
          <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: #1e293b; font-size: 13px;">${formatPrice(item.unit_price)}</td>
          <td style="padding: 10px 8px; text-align: center; font-weight: 700; color: #0f172a; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: 800; color: #0f172a; font-size: 13px;">${formatPrice(item.total_price)}</td>
        </tr>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="${isBn ? 'bn' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${order.order_number}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&family=Montserrat:wght@600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Noto Sans Bengali', 'Roboto', sans-serif;
      color: #1e293b;
      background: #f8fafc;
      padding: 24px;
      font-size: 13px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 26px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .invoice-badge {
      text-align: right;
    }
    .inv-title {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
    }
    .inv-meta {
      font-size: 12px;
      color: #334155;
      margin-top: 4px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .section-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .section-content {
      font-size: 13px;
      color: #0f172a;
      line-height: 1.6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      padding: 10px 8px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    .totals-table {
      width: 280px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px solid #e2e8f0;
    }
    .grand-total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
      border-top: 2px solid #0f172a;
      border-bottom: 2px solid #0f172a;
    }
    .footer-note {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 24px;
      border-top: 1px dashed #cbd5e1;
      margin-top: 24px;
    }
    .terms {
      max-width: 450px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }
    .sig-box {
      text-align: center;
      width: 180px;
      border-top: 1px solid #0f172a;
      padding-top: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    @media print {
      body { padding: 0 !important; background: #fff !important; }
      .invoice-card { border: none !important; padding: 0 !important; max-width: 100% !important; box-shadow: none !important; }
      .no-print { display: none !important; }
      @page { size: A4 portrait; margin: 10mm 12mm; }
    }
  </style>
</head>
<body>
  <!-- Print Control Bar (Hidden when printing) -->
  <div class="no-print" style="max-width: 800px; margin: 0 auto 16px auto; background: #0f172a; color: #ffffff; padding: 12px 20px; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <div style="font-weight: 700; font-size: 13px;">
      📄 ${isBn ? 'ইনভয়েস প্রিন্ট প্রিভিউ' : 'Official Invoice Print Preview'}
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" style="background: #f59e0b; color: #0f172a; font-weight: 800; border: none; padding: 8px 18px; border-radius: 8px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
        🖨️ ${isBn ? 'প্রিন্ট করুন (Print)' : 'Print Invoice'}
      </button>
      <button onclick="window.close()" style="background: #334155; color: #ffffff; font-weight: 700; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px;">
        ✖ ${isBn ? 'ট্যাব বন্ধ করুন' : 'Close Tab'}
      </button>
    </div>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-title">${siteName}</div>
        <div class="brand-sub">${siteTagline}</div>
        <div style="margin-top: 8px; font-size: 11px; color: #475569;">
          <div>📞 ${phone} | ✉️ ${email}</div>
          <div>📍 ${address}</div>
        </div>
      </div>
      <div class="invoice-badge">
        <div class="inv-title">${isBn ? 'ইনভয়েস / ক্যাশ মেমো' : 'INVOICE / BILL'}</div>
        <div class="inv-meta"><strong>${isBn ? 'অর্ডার নং' : 'Order #'}:</strong> ${order.order_number}</div>
        <div class="inv-meta"><strong>${isBn ? 'তারিখ' : 'Date'}:</strong> ${orderDate}</div>
        <div style="margin-top: 6px;">
          <span style="display: inline-block; padding: 3px 8px; font-size: 10px; font-weight: 800; border-radius: 4px; background: ${order.payment_status === 'paid' ? '#dcfce7' : '#fef3c7'}; color: ${order.payment_status === 'paid' ? '#166534' : '#92400e'}; border: 1px solid #cbd5e1;">
            ${order.payment_status === 'paid' ? (isBn ? 'পরিশোধিত (PAID)' : 'PAID') : (isBn ? 'ক্যাশ অন ডেলিভারি (COD)' : 'CASH ON DELIVERY')}
          </span>
        </div>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div class="section-label">${isBn ? 'ডেলিভারি গ্রাহক (Billed To):' : 'Billed & Shipped To:'}</div>
        <div class="section-content">
          <div style="font-weight: 800; font-size: 14px;">${order.customer_name}</div>
          <div>📞 <strong>${order.customer_phone}</strong></div>
          ${order.customer_email ? `<div>✉️ ${order.customer_email}</div>` : ''}
          <div style="margin-top: 4px;">📍 ${order.shipping_address}, ${order.shipping_city}</div>
          ${order.notes ? `<div style="font-style: italic; color: #64748b; margin-top: 4px;">Note: ${order.notes}</div>` : ''}
        </div>
      </div>

      <div>
        <div class="section-label">${isBn ? 'পেমেন্ট ও ডেলিভারি তথ্য:' : 'Payment & Delivery Info:'}</div>
        <div class="section-content">
          <div><strong>${isBn ? 'পেমেন্ট মেথড:' : 'Payment Method:'}</strong> ${getPaymentMethodText(order.payment_method)}</div>
          ${order.payment?.transaction_id ? `<div><strong>${isBn ? 'ট্রানজেকশন আইডি (TrxID):' : 'Transaction ID:'}</strong> <span style="font-family: monospace; font-weight: 800; color: #b91c1c;">${order.payment.transaction_id}</span></div>` : ''}
          <div><strong>${isBn ? 'ডেলিভারি টাইপ:' : 'Delivery Method:'}</strong> ${order.courier_name || (isBn ? 'স্ট্যান্ডার্ড হোম ডেলিভারি' : 'Standard Home Delivery')}</div>
          ${order.tracking_id ? `<div><strong>${isBn ? 'ট্র্যাকিং আইডি:' : 'Tracking ID:'}</strong> ${order.tracking_id}</div>` : ''}
          <div><strong>${isBn ? 'অর্ডার স্ট্যাটাস:' : 'Order Status:'}</strong> ${order.order_status?.toUpperCase()}</div>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th style="text-align: left;">${isBn ? 'পণ্যের বিবরণ' : 'Item Description'}</th>
          <th style="width: 110px; text-align: right;">${isBn ? 'একক মূল্য' : 'Unit Price'}</th>
          <th style="width: 60px; text-align: center;">${isBn ? 'পরিমাণ' : 'Qty'}</th>
          <th style="width: 120px; text-align: right;">${isBn ? 'মোট' : 'Total'}</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals-area">
      <div class="totals-table">
        <div class="totals-row">
          <span style="color: #64748b;">${isBn ? 'সাবটোটাল (Subtotal):' : 'Subtotal:'}</span>
          <span style="font-weight: 700;">${formatPrice(order.subtotal || order.grand_total)}</span>
        </div>
        <div class="totals-row">
          <span style="color: #64748b;">${isBn ? 'ডেলিভারি চার্জ:' : 'Delivery Fee:'}</span>
          <span style="font-weight: 700;">${order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : (isBn ? 'ফ্রি' : 'FREE')}</span>
        </div>
        ${order.discount_amount > 0 ? `
        <div class="totals-row" style="color: #16a34a;">
          <span>${isBn ? 'ডিসকাউন্ট / ছাড়:' : 'Discount:'}</span>
          <span style="font-weight: 700;">-${formatPrice(order.discount_amount)}</span>
        </div>` : ''}
        <div class="grand-total-row">
          <span>${isBn ? 'সর্বমোট প্রদেয়:' : 'Total Payable:'}</span>
          <span>${formatPrice(order.grand_total)}</span>
        </div>
      </div>
    </div>

    <div class="footer-note">
      <div class="terms">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">${isBn ? 'গুরুত্বপূর্ণ নির্দেশনাবলী:' : 'Notice & Instructions:'}</div>
        <div>• ${isBn ? 'পণ্য ডেলিভারিম্যানের সামনে চেক করে গ্রহণ করবেন।' : 'Please inspect package contents upon delivery.'}</div>
        <div>• ${isBn ? 'যেকোনো পরিবর্তন বা রিটার্নের ক্ষেত্রে ইনভয়েসটি সাথে রাখুন।' : 'Keep this invoice memo for 7-day hassle-free return or exchange.'}</div>
        <div>• ${isBn ? 'আমাদের সাথে থাকার জন্য আপনাকে আন্তরিক ধন্যবাদ!' : 'Thank you for shopping with us!'}</div>
      </div>
      <div class="sig-box">
        <div>${isBn ? 'কর্তৃপক্ষের অনুমোদিত স্বাক্ষর' : 'Authorized Signature'}</div>
      </div>
    </div>
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.focus();
          window.print();
        } catch(e) {}
      }, 350);
    });
  </script>
</body>
</html>`;
  };

  // Robust Multi-Strategy Print Handler
  const handlePrint = () => {
    const htmlContent = generateInvoiceHTML();

    // Strategy 1: Hidden iframe print
    try {
      const oldFrame = document.getElementById('shopnova-print-frame');
      if (oldFrame && oldFrame.parentNode) {
        oldFrame.parentNode.removeChild(oldFrame);
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'shopnova-print-frame';
      iframe.setAttribute(
        'style',
        'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;z-index:-1;'
      );
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (err) {
            console.warn('Iframe print restricted, trying direct print:', err);
            try {
              window.print();
            } catch (wErr) {
              handleOpenNewTab();
            }
          } finally {
            setTimeout(() => {
              try {
                if (document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                }
              } catch (e) {}
            }, 5000);
          }
        }, 300);

        return;
      }
    } catch (e) {
      console.warn('Iframe print setup error:', e);
    }

    // Strategy 2: Direct window.print()
    try {
      window.print();
    } catch (err) {
      console.warn('window.print failed, opening in new tab:', err);
      handleOpenNewTab();
    }
  };

  // Instant HTML/Printable invoice download
  const handleDownload = () => {
    try {
      const htmlContent = generateInvoiceHTML();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${order.order_number}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download invoice:', err);
    }
  };

  // Open in new window/tab for 100% native printing (completely bypasses iframe restrictions)
  const handleOpenNewTab = () => {
    try {
      const htmlContent = generateInvoiceHTML();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const newWin = window.open(url, '_blank');
      if (!newWin) {
        // Fallback for popup blockers: use hidden anchor click
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      console.error('Failed to open invoice in new tab:', e);
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 invoice-modal-backdrop">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-4 flex flex-col max-h-[92vh] invoice-modal-card">
        
        {/* Action Header / Toolbar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-black tracking-tight">
                {isBn ? 'অফিসিয়াল ইনভয়েস ও মেমো' : 'Official Invoice & Cash Memo'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {invoiceNumber} • {orderDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title={isBn ? 'ইনভয়েস সরাসরি প্রিন্ট করুন' : 'Print Invoice'}
            >
              <Printer className="w-4 h-4" />
              <span>{isBn ? 'প্রিন্ট করুন' : 'Print'}</span>
            </button>

            {/* Open in New Tab & Print Button */}
            <button
              onClick={handleOpenNewTab}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title={isBn ? 'নতুন ট্যাবে খুলুন (যেকোনো ডিভাইসে ১০০% কাজ করবে)' : 'Open in New Tab & Print'}
            >
              <ExternalLink className="w-4 h-4" />
              <span>{isBn ? 'নতুন ট্যাবে প্রিন্ট' : 'Open in New Tab'}</span>
            </button>

            {/* Instant HTML/PDF Download Button */}
            <button
              onClick={handleDownload}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title={isBn ? 'ইনভয়েস ফাইল ডাউনলোড করুন' : 'Download Invoice Memo'}
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'ডাউনলোড' : 'Download'}</span>
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={isBn ? 'বন্ধ করুন' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Helpful Tip Banner for Iframe / Preview Users */}
        <div className="no-print bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-xs text-amber-900 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {isBn
                ? 'টিপস: ব্রাউজার বা প্রিভিউতে সরাসরি প্রিন্ট ডায়ালগ ওপেন না হলে পাশে থাকা "নতুন ট্যাবে প্রিন্ট" বা "ডাউনলোড" বাটনে চাপুন।'
                : 'Tip: If browser print dialog does not open directly, click "Open in New Tab" or "Download".'}
            </span>
          </div>
          <button
            onClick={handleOpenNewTab}
            className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1 shrink-0"
          >
            <span>{isBn ? 'নতুন ট্যাবে খুলুন' : 'Open in Tab'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Printable Invoice Container */}
        <div className="overflow-y-auto p-6 sm:p-10 printable-invoice-area bg-white text-slate-900">
          <div ref={invoiceRef} className="space-y-6 max-w-2xl mx-auto border border-slate-200 sm:border-slate-300 rounded-xl p-6 sm:p-8 bg-white shadow-xs">
            
            {/* Header: Company + Invoice Title */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {settings.site_logo ? (
                    <img src={settings.site_logo} alt={settings.site_name} className="h-10 w-auto object-contain" />
                  ) : null}
                  <span className="text-2xl font-black tracking-tight font-heading text-slate-950">
                    {settings.site_name || 'SHOPNOVA'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {isBn ? (settings.site_tagline_bn || 'প্রিমিয়াম লাইফস্টাইল ও গ্যাজেট ডেস্টিনেশন') : (settings.site_tagline_en || 'Premium Lifestyle & Gadget Destination')}
                </p>
                <div className="pt-2 text-[11px] text-slate-600 space-y-0.5">
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{settings.contact_phone || '+880 1700-000000'}</span>
                    <span className="text-slate-300 mx-1">•</span>
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{settings.contact_email || 'support@shopnova.com'}</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {isBn
                        ? (settings.company_address_bn || 'বাড়ি ৪৫, রোড ১১, ব্লক ডি, বনানী, ঢাকা-১২১৩, বাংলাদেশ')
                        : (settings.company_address_en || 'House 45, Road 11, Block D, Banani, Dhaka-1213, Bangladesh')}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1 shrink-0">
                <div className="inline-block bg-slate-950 text-white px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider">
                  {isBn ? 'ক্যাশ মেমো / ইনভয়েস' : 'CASH MEMO / INVOICE'}
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1 font-mono">
                  #{order.order_number}
                </p>
                <p className="text-[11px] text-slate-500 flex items-center sm:justify-end gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{orderDate}</span>
                </p>
                <div className="mt-2">
                  {getPaymentStatusBadge(order.payment_status)}
                </div>
              </div>
            </div>

            {/* Bill To & Order Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  {isBn ? 'ডেলিভারি গ্রাহকের তথ্য (Bill & Ship To):' : 'Billed & Shipped To:'}
                </p>
                <p className="font-bold text-slate-900 text-sm">{order.customer_name}</p>
                <p className="font-semibold text-slate-700 mt-0.5">📞 {order.customer_phone}</p>
                {order.customer_email && <p className="text-slate-500">✉️ {order.customer_email}</p>}
                <p className="text-slate-600 mt-1 leading-relaxed">
                  📍 {order.shipping_address}, {order.shipping_city}
                  {order.shipping_postal_code ? ` - ${order.shipping_postal_code}` : ''}
                </p>
                {order.notes && (
                  <p className="text-amber-800 font-medium italic mt-1 bg-amber-50/80 p-1.5 rounded border border-amber-200/50">
                    Note: {order.notes}
                  </p>
                )}
              </div>

              <div className="sm:border-l sm:border-slate-200 sm:pl-4 space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  {isBn ? 'অর্ডার ও পেমেন্ট বিবরণ:' : 'Payment & Delivery Info:'}
                </p>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? 'পেমেন্ট মাধ্যম:' : 'Payment:'}</span>
                  <span className="font-bold text-slate-900">{getPaymentMethodText(order.payment_method)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? 'ডেলিভারি পদ্ধতি:' : 'Delivery:'}</span>
                  <span className="font-semibold text-slate-800">
                    {order.courier_name || (isBn ? 'স্ট্যান্ডার্ড হোম ডেলিভারি' : 'Standard Home Delivery')}
                  </span>
                </div>
                {order.tracking_id && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isBn ? 'ট্র্যাকিং আইডি:' : 'Tracking ID:'}</span>
                    <span className="font-mono font-bold text-slate-900">{order.tracking_id}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? 'অর্ডার স্ট্যাটাস:' : 'Status:'}</span>
                  <span className="font-bold text-emerald-700 capitalize">{order.order_status}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">#</th>
                    <th className="py-2.5 px-3">{isBn ? 'পণ্যের বিবরণ' : 'Item Description'}</th>
                    <th className="py-2.5 px-3 text-right w-24">{isBn ? 'একক মূল্য' : 'Unit Price'}</th>
                    <th className="py-2.5 px-3 text-center w-14">{isBn ? 'পরিমাণ' : 'Qty'}</th>
                    <th className="py-2.5 px-3 text-right w-24">{isBn ? 'মোট' : 'Total'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(order.items || []).map((item, idx) => {
                    const name = isBn && item.product_name_bn ? item.product_name_bn : (item.product_name_en || item.product_name_bn || 'Product');
                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">{name}</p>
                          {(item.size || item.color) && (
                            <p className="text-[11px] text-slate-500">
                              {item.size ? `Size: ${item.size}` : ''}
                              {item.size && item.color ? ' • ' : ''}
                              {item.color ? `Color: ${item.color}` : ''}
                            </p>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                          {formatPrice(item.unit_price)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-950">
                          {formatPrice(item.total_price)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculations & Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between py-1 text-slate-600">
                  <span>{isBn ? 'সাবটোটাল (Subtotal):' : 'Subtotal:'}</span>
                  <span className="font-bold text-slate-900">{formatPrice(order.subtotal || order.grand_total)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>{isBn ? 'ডেলিভারি চার্জ:' : 'Delivery Fee:'}</span>
                  <span className="font-bold text-slate-900">
                    {order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : (isBn ? 'ফ্রি' : 'FREE')}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between py-1 text-emerald-600 font-semibold">
                    <span>{isBn ? 'ডিসকাউন্ট / ছাড়:' : 'Discount:'}</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t-2 border-slate-900 font-black text-sm text-slate-950">
                  <span>{isBn ? 'সর্বমোট প্রদেয়:' : 'Total Payable:'}</span>
                  <span className="text-base">{formatPrice(order.grand_total)}</span>
                </div>
              </div>
            </div>

            {/* Barcode & Signatures */}
            <div className="pt-6 border-t border-dashed border-slate-300 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 text-xs text-slate-500">
              {/* Barcode simulation */}
              <div className="text-center sm:text-left space-y-1">
                <div className="inline-block py-1 px-3 bg-slate-100 rounded border border-slate-200">
                  {/* Decorative Barcode */}
                  <div className="flex items-center gap-[2px] h-7 w-40 justify-center">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2].map((w, i) => (
                      <span
                        key={i}
                        className="bg-slate-900 h-full inline-block"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-mono tracking-widest text-slate-600 mt-1">
                    {order.order_number}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400">
                  {isBn ? 'চালানপত্রটি পণ্যের সাথে নিশ্চিত করুন' : 'Keep this slip with order'}
                </p>
              </div>

              {/* Signature line */}
              <div className="text-center w-48 border-t border-slate-900 pt-1">
                <p className="font-bold text-slate-900 text-[11px]">
                  {isBn ? 'অনুমোদিত স্বাক্ষর ও সিল' : 'Authorized Signature & Seal'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {settings.site_name || 'SHOPNOVA'}
                </p>
              </div>
            </div>

            {/* Terms note */}
            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-0.5">
              <p className="font-bold text-slate-700">
                {isBn ? 'শর্তাবলী ও গ্রাহক সেবা:' : 'Terms & Support:'}
              </p>
              <p>• {isBn ? 'ডেলিভারি পাওয়ার পর পণ্য চেক করে নিন। কোনো ত্রুটি পেলে ৭ দিনের মধ্যে আমাদের জানান।' : 'Please inspect items on delivery. Notify us within 7 days for exchange.'}</p>
              <p>• {isBn ? `যেকোনো সহযোগিতায় কল করুন: ${settings.contact_phone || '+880 1700-000000'}` : `For support call: ${settings.contact_phone || '+880 1700-000000'}`}</p>
            </div>

          </div>
        </div>

        {/* Modal Bottom Footer (No-print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 p-3.5 px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <span className="hidden sm:inline">
            {isBn ? '© SHOPNOVA অফিসিয়াল ইনভয়েস সিস্টেম' : '© Official Invoice System'}
          </span>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs text-xs"
              title={isBn ? 'ইনভয়েস সরাসরি প্রিন্ট করুন' : 'Print Invoice'}
            >
              <Printer className="w-4 h-4" />
              <span>{isBn ? 'প্রিন্ট করুন' : 'Print'}</span>
            </button>
            <button
              onClick={handleOpenNewTab}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs text-xs"
              title={isBn ? 'নতুন ট্যাবে খুলুন (যেকোনো ব্রাউজারে ঝামেলা ছাড়া প্রিন্ট করুন)' : 'Open in New Tab & Print'}
            >
              <ExternalLink className="w-4 h-4" />
              <span>{isBn ? 'নতুন ট্যাবে প্রিন্ট' : 'Open in New Tab'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
              title={isBn ? 'ইনভয়েস ফাইল ডাউনলোড করুন' : 'Download Invoice Memo'}
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'ডাউনলোড' : 'Download'}</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer text-xs"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
