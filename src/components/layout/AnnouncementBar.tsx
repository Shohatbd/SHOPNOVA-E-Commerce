import React from 'react';
import { Phone, Mail, ShieldCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useSettings();
  const { isBn } = useLanguage();

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
      className="border-b border-black/10 transition-colors min-h-[38px] flex items-center py-1"
    >
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-medium">
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 opacity-90 shrink-0" /> {isBn ? '১০০% অরিজিনাল পণ্য' : '100% Authentic'}
          </span>
          <span className="text-center sm:text-left font-medium opacity-95">
            {announcementText}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {settings.contact_email && (
            <a
              href={`mailto:${settings.contact_email}`}
              className="hidden md:flex items-center gap-1.5 hover:opacity-80 transition-opacity font-medium"
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
        </div>
      </div>
    </div>
  );
};

