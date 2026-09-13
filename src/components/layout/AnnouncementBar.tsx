import React from 'react';
import { Phone, Mail, ShieldCheck, Globe } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useSettings();
  const { isBn, setLang } = useLanguage();

  if (settings.announcement_enabled === 'false') {
    return null;
  }

  const announcementText = isBn
    ? settings.announcement_bn || settings.announcement_en || '২৫০০ টাকার বেশি অর্ডারে সমগ্র বাংলাদেশে ফ্রি হোম ডেলিভারি!'
    : settings.announcement_en || settings.announcement_bn || 'Free delivery on orders over ৳2,500 across Bangladesh';

  const barBg = settings.announcement_bg_color || '#2A140A';
  const barTextColor = settings.announcement_text_color || '#FFF7ED';

  return (
    <div
      style={{ backgroundColor: barBg, color: barTextColor }}
      className="border-b border-black/10 transition-colors min-h-[38px] sm:min-h-[40px] flex items-center py-1 sm:py-1.5"
    >
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-1.5 sm:gap-4 text-[12.5px] sm:text-[13.5px] font-medium">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="hidden md:inline-flex items-center gap-1.5 font-bold tracking-tight whitespace-nowrap shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 opacity-90 shrink-0" />
            <span>{isBn ? '১০০% অরিজিনাল পণ্য' : '100% Authentic'}</span>
          </span>
          <span className="hidden md:inline-block w-1 h-1 rounded-full bg-current opacity-40 shrink-0" />
          <span className="text-center sm:text-left font-medium sm:font-semibold opacity-95 leading-normal whitespace-normal sm:whitespace-nowrap">
            {announcementText}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-[12px] sm:text-[13px] shrink-0 whitespace-nowrap">
          {settings.contact_email && (
            <a
              href={`mailto:${settings.contact_email}`}
              className="hidden lg:flex items-center gap-1.5 hover:opacity-80 transition-opacity font-medium"
              title="Support Email"
            >
              <Mail className="w-3.5 h-3.5 opacity-90 shrink-0" />
              <span>{settings.contact_email}</span>
            </a>
          )}

          {settings.contact_phone && (
            <a
              href={`tel:${settings.contact_phone}`}
              className="hidden sm:flex items-center gap-1.5 hover:opacity-80 transition-opacity font-medium"
              title="Customer Helpline"
            >
              <Phone className="w-3.5 h-3.5 opacity-90 shrink-0" />
              <span>{settings.contact_phone}</span>
            </a>
          )}

          {/* Top Bar Quick Language Switcher */}
          <div className="flex items-center bg-black/25 backdrop-blur-xs rounded-full p-0.5 text-[11px] sm:text-xs font-bold border border-white/15 shrink-0">
            <button
              type="button"
              onClick={() => setLang('bn')}
              className={`px-2 sm:px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                isBn
                  ? 'bg-white text-slate-950 font-black shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="font-siliguri">বাংলা</span>
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 sm:px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                !isBn
                  ? 'bg-white text-slate-950 font-black shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>ENG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

