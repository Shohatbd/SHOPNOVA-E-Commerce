import React from 'react';
import { PaymentBadgeItem } from '../../types/index.ts';

export const DEFAULT_PAYMENT_BADGES: PaymentBadgeItem[] = [
  {
    id: 'badge_bkash',
    type: 'bkash',
    name: 'bKash',
    name_bn: 'বিকাশ',
    is_active: true
  },
  {
    id: 'badge_nagad',
    type: 'nagad',
    name: 'Nagad',
    name_bn: 'নগদ',
    is_active: true
  },
  {
    id: 'badge_card',
    type: 'card',
    name: 'VISA / Mastercard',
    name_bn: 'কার্ড (ভিসা / মাস্টারকার্ড)',
    is_active: true
  },
  {
    id: 'badge_cod',
    type: 'cod',
    name: 'Cash on Delivery',
    name_bn: 'ক্যাশ অন ডেলিভারি',
    is_active: true
  }
];

// High-fidelity SVG renderers for Bangladesh payment methods (matching uniform size)
export const renderPaymentLogo = (type: string, logoUrl?: string, name?: string) => {
  if (logoUrl && logoUrl.trim()) {
    return (
      <img
        src={logoUrl}
        alt={name || type}
        className="max-h-6 max-w-[62px] object-contain shrink-0"
      />
    );
  }

  const t = (type || '').toLowerCase().trim();

  // 1. bKash (Pink origami bird + bKash wordmark)
  if (t === 'bkash' || t.includes('bkash')) {
    return (
      <div className="flex items-center gap-1 shrink-0 select-none">
        <svg viewBox="0 0 32 32" className="w-4 h-4 shrink-0" fill="none">
          <path d="M19.5 3L8 14.5L16.5 17.5L25 10L19.5 3Z" fill="#E2136E" />
          <path d="M8 14.5L4 26L16.5 17.5L8 14.5Z" fill="#D10056" />
          <path d="M16.5 17.5L19 28.5L25 10L16.5 17.5Z" fill="#E2136E" />
          <path d="M25 10L29 13.5L27 7L25 10Z" fill="#D10056" />
        </svg>
        <span className="font-extrabold text-[11px] tracking-tight text-[#E2136E] leading-none font-sans">
          bKash
        </span>
      </div>
    );
  }

  // 2. Nagad (Swirl flame + 'নগদ')
  if (t === 'nagad' || t.includes('nagad')) {
    return (
      <div className="flex items-center gap-1 shrink-0 select-none">
        <svg viewBox="0 0 36 36" className="w-4 h-4 shrink-0" fill="none">
          <circle cx="18" cy="18" r="16" fill="#F7931E" fillOpacity="0.15" />
          <path
            d="M18 4C10.27 4 4 10.27 4 18C4 22.1 5.76 25.79 8.6 28.35L14.2 22.75C12.84 21.6 12 19.9 12 18C12 14.69 14.69 12 18 12C20.65 12 22.89 13.72 23.67 16.12L29.6 13.5C27.67 7.96 23.3 4 18 4Z"
            fill="#F7931E"
          />
          <path
            d="M18 12C14.69 12 12 14.69 12 18C12 19.9 12.84 21.6 14.2 22.75L8.6 28.35C11.16 30.66 14.43 32 18 32C25.73 32 32 25.73 32 18C32 16.34 31.71 14.75 31.18 13.27L24.3 16.32C24.1 17.18 23.65 17.94 22.99 18.51L27.65 24.5C25.5 26.68 22.1 27.5 18.8 26.3L20.2 20.7C19.6 20.9 18.9 21 18.2 21C16.5 21 15.2 19.7 15.2 18C15.2 16.3 16.5 15 18.2 15C19.5 15 20.6 15.8 21 17L26.5 14.5C25 13 22 12 18 12Z"
            fill="#ED1C24"
          />
        </svg>
        <span className="font-black text-[11px] text-[#ED1C24] font-bengali leading-none pt-0.5">
          নগদ
        </span>
      </div>
    );
  }

  // 3. Debit / Credit Cards (VISA + Mastercard)
  if (t === 'card' || t.includes('card') || t.includes('visa') || t.includes('mastercard')) {
    return (
      <div className="flex items-center gap-1 shrink-0 select-none">
        <span className="font-black italic text-[10px] text-[#1A1F71] tracking-tight font-serif leading-none">
          VISA
        </span>
        <div className="flex items-center -space-x-1 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#EB001B] opacity-95"></div>
          <div className="w-3 h-3 rounded-full bg-[#F79E1B] opacity-90"></div>
        </div>
      </div>
    );
  }

  // 4. Cash on Delivery (COD)
  if (t === 'cod' || t.includes('cod') || t.includes('delivery') || t.includes('cash')) {
    return (
      <div className="flex items-center gap-1 shrink-0 select-none">
        <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-current stroke-2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <circle cx="12" cy="12" r="3" />
            <path d="M6 12h.01M18 12h.01" />
          </svg>
        </div>
        <span className="font-black text-[10px] text-slate-900 tracking-tight leading-none">
          COD
        </span>
      </div>
    );
  }

  // 5. Rocket
  if (t === 'rocket' || t.includes('rocket') || t.includes('dbbl')) {
    return (
      <div className="flex items-center gap-1 shrink-0 select-none">
        <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 shrink-0" fill="none">
          <path d="M28 4L4 16.5L14 20L28 4Z" fill="#8C3494" />
          <path d="M14 20L18 28L28 4L14 20Z" fill="#6A1B7B" />
        </svg>
        <span className="font-black text-[11px] text-[#8C3494] font-bengali leading-none">
          রকেট
        </span>
      </div>
    );
  }

  // 6. OK Wallet
  if (t === 'ok_wallet' || t.includes('ok_wallet') || t.includes('okwallet')) {
    return (
      <div className="flex items-center gap-1 shrink-0 select-none">
        <div className="w-3.5 h-3.5 rounded-full bg-[#FDB813] flex items-center justify-center shrink-0 text-slate-900 font-black">
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-slate-950">
            <circle cx="9" cy="9" r="1.5" />
            <circle cx="15" cy="9" r="1.5" />
            <path d="M8 13.5C8.8 15.5 10.5 17 12 17C13.5 17 15.2 15.5 16 13.5H8Z" />
          </svg>
        </div>
        <span className="font-black text-[9.5px] text-slate-900 tracking-tight leading-none">
          OK Wallet
        </span>
      </div>
    );
  }

  // 7. Upay (UCB Fintech)
  if (t === 'upay' || t.includes('upay')) {
    return (
      <div className="flex items-center gap-1 shrink-0 select-none">
        <div className="w-3.5 h-3.5 rounded bg-[#00529B] flex items-center justify-center text-[#FFDE00] font-black text-[9px] leading-none">
          u
        </div>
        <span className="font-extrabold text-[10px] text-[#00529B] tracking-tight leading-none">upay</span>
      </div>
    );
  }

  // 8. Amarpay
  if (t === 'amarpay' || t.includes('amarpay')) {
    return (
      <div className="flex items-center shrink-0 select-none leading-none">
        <span className="font-black text-[10px] text-[#0083CA]">aamar</span>
        <span className="font-black text-[10px] text-[#F26522]">Pay</span>
      </div>
    );
  }

  // Fallback Generic Badge
  return (
    <div className="flex items-center gap-1 shrink-0 select-none">
      <div className="w-3.5 h-3.5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px] font-bold">
        ৳
      </div>
      <span className="font-bold text-[10px] text-slate-800 truncate max-w-[45px]">{name || type}</span>
    </div>
  );
};

interface PaymentBadgesProps {
  badgesJson?: string;
  isBn?: boolean;
  className?: string;
}

export const PaymentBadges: React.FC<PaymentBadgesProps> = ({ badgesJson, isBn, className = '' }) => {
  const badgeList: PaymentBadgeItem[] = (() => {
    if (badgesJson) {
      try {
        const parsed = JSON.parse(badgesJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const active = parsed.filter(b => b.is_active !== false);
          if (active.length > 0) return active;
        }
      } catch (e) {}
    }
    return DEFAULT_PAYMENT_BADGES;
  })();

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {badgeList.map((badge) => (
        <div
          key={badge.id}
          title={isBn ? (badge.name_bn || badge.name) : badge.name}
          className="bg-white rounded-lg shadow-2xs border border-black/10 w-[66px] h-[32px] flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-xs select-none cursor-default shrink-0 overflow-hidden"
        >
          {renderPaymentLogo(badge.type, badge.logo_url, isBn ? badge.name_bn : badge.name)}
        </div>
      ))}
    </div>
  );
};
