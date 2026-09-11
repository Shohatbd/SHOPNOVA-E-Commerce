import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  HelpCircle,
  FileText,
  CheckCircle2,
  Share2,
  ExternalLink,
  MessageCircle,
  Facebook,
  Instagram,
  Youtube,
  Send,
  Music,
  Twitter,
  Linkedin,
  Globe,
  Home,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { tracker } from '../../utils/analytics.ts';
import {
  DEFAULT_STORE_POLICIES,
  DEFAULT_ABOUT_POLICY,
  DEFAULT_CONTACT_POLICY,
  DEFAULT_PRIVACY_POLICY,
  PolicyLinkItem
} from '../../data/defaultPolicies.ts';

interface PolicyProps {
  type: string;
  onNavigate: (page: string) => void;
}

export const PolicyPages: React.FC<PolicyProps> = ({ type, onNavigate }) => {
  const { isBn } = useLanguage();
  const { settings } = useSettings();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const name = contactName.trim();
    const email = contactEmail.trim();
    const phone = contactPhone.trim();
    const message = contactMessage.trim();

    if (!name) {
      setSubmitError(isBn ? 'আপনার নাম প্রদান করুন।' : 'Please enter your name.');
      return;
    }

    if (!email && !phone) {
      setSubmitError(
        isBn
          ? 'মোবাইল নম্বর অথবা ইমেইল যেকোনো একটি অবশ্যই দেওয়া প্রয়োজন।'
          : 'Please provide either a phone number or an email address.'
      );
      return;
    }

    if (!message) {
      setSubmitError(isBn ? 'আপনার বার্তা বা জিজ্ঞাসা লিখুন।' : 'Please enter your inquiry or message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          subject: 'Customer Care Inquiry'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || (isBn ? 'বার্তা পাঠানো ব্যর্থ হয়েছে।' : 'Failed to send message.'));
      }

      tracker.trackLead({
        name,
        email,
        phone,
        message
      });

      setIsSent(true);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMessage('');
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setSubmitError(err.message || (isBn ? 'সার্ভার সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Network error. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const policyTitles: Record<string, { en: string; bn: string }> = {
    about: { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
    contact: { en: 'Contact Support', bn: 'যোগাযোগ ও কাস্টমার কেয়ার' },
    'shipping-policy': { en: 'Shipping & Delivery Policy', bn: 'ডেলিভারি ও শিপিং পলিসি' },
    'refund-policy': { en: 'Return & Refund Policy', bn: 'রিটার্ন ও রিফান্ড নীতি' },
    terms: { en: 'Terms & Conditions', bn: 'ব্যবহারের শর্তাবলী' },
    privacy: { en: 'Privacy Policy', bn: 'গোপনীয়তা ও প্রাইভেসি পলিসি' },
    faq: { en: 'Frequently Asked Questions (FAQ)', bn: 'সচরাচর জিজ্ঞাসা' },
    track: { en: 'Order Tracking Help', bn: 'অর্ডার ট্র্যাকিং তথ্য' }
  };

  // Parse policies from settings with default fallback
  const policyList: PolicyLinkItem[] = useMemo(() => {
    if (settings.store_policies_json) {
      try {
        const parsed = JSON.parse(settings.store_policies_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => {
            const defaultMatch = DEFAULT_STORE_POLICIES.find(
              (d) => d.path === item.path || d.id === item.id
            );
            return {
              ...defaultMatch,
              ...item,
              description_bn: item.description_bn !== undefined ? item.description_bn : (defaultMatch?.description_bn || ''),
              description_en: item.description_en !== undefined ? item.description_en : (defaultMatch?.description_en || '')
            };
          });
        }
      } catch (e) {}
    }
    return DEFAULT_STORE_POLICIES;
  }, [settings.store_policies_json]);

  // Parse footer service links
  const serviceLinksList = useMemo(() => {
    if (settings.footer_service_links_json) {
      try {
        const parsed = JSON.parse(settings.footer_service_links_json);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  }, [settings.footer_service_links_json]);

  // Find matching footer service link if route is from footer links
  const currentServiceLink = useMemo(() => {
    const cleanType = type.replace(/^#/, '');
    return serviceLinksList.find(
      (l: any) =>
        l.id === cleanType ||
        l.page === cleanType ||
        l.page === `#${cleanType}` ||
        l.label?.toLowerCase() === cleanType.toLowerCase() ||
        (cleanType === 'about' && (l.id === '1' || l.label === 'About Us' || l.page === 'about')) ||
        (cleanType === 'contact' && (l.id === '2' || l.label === 'Contact & Support' || l.page === 'contact')) ||
        ((cleanType === 'privacy' || cleanType === 'privacy-policy') && (l.id === '3' || l.label === 'Privacy Policy' || l.page === 'privacy'))
    );
  }, [serviceLinksList, type]);

  const cleanType = type.replace(/^#/, '');
  const isAbout = cleanType === 'about' || cleanType === '1' || currentServiceLink?.page === 'about';
  const isContact = cleanType === 'contact' || cleanType === '2' || currentServiceLink?.page === 'contact';
  const isPrivacy = cleanType === 'privacy' || cleanType === '3' || cleanType === 'privacy-policy' || currentServiceLink?.page === 'privacy';

  // Find the active policy matching current route/type
  const currentPolicy = useMemo(() => {
    if (isAbout) return DEFAULT_ABOUT_POLICY;
    if (isContact) return DEFAULT_CONTACT_POLICY;
    if (isPrivacy) return DEFAULT_PRIVACY_POLICY;
    return (
      policyList.find((p) => p.path === cleanType || p.id === cleanType || p.id === `pol_${cleanType}`) ||
      DEFAULT_STORE_POLICIES.find((d) => d.path === cleanType || d.id === cleanType)
    );
  }, [policyList, cleanType, isAbout, isContact, isPrivacy]);

  const displayTitle = isBn
    ? (currentServiceLink?.label_bn || currentPolicy?.title_bn || policyTitles[cleanType]?.bn || currentServiceLink?.label || currentPolicy?.title || cleanType)
    : (currentServiceLink?.label || currentPolicy?.title || policyTitles[cleanType]?.en || (isAbout ? 'About Us' : isContact ? 'Contact & Support' : isPrivacy ? 'Privacy Policy' : cleanType));

  const siteName = settings.site_name || 'SHOPNOVA';
  const siteNameBn = settings.site_name_bn || settings.site_name || 'শপনোভা';

  const replaceStoreName = (content: string) => {
    if (!content) return content;
    // Replace hardcoded legacy names with dynamic store name
    return content
      .replace(/SHOPNOVA/g, siteName)
      .replace(/Shopnova/g, siteName)
      .replace(/শপনোভা/g, siteNameBn);
  };

  const rawShortDescription = replaceStoreName(
    isBn
      ? (currentServiceLink?.short_description_bn || currentPolicy?.short_description_bn || currentServiceLink?.short_description || '')
      : (currentServiceLink?.short_description?.trim() || currentPolicy?.short_description_en || currentPolicy?.short_description || (isAbout ? DEFAULT_ABOUT_POLICY.short_description_en : isContact ? DEFAULT_CONTACT_POLICY.short_description_en : isPrivacy ? DEFAULT_PRIVACY_POLICY.short_description_en : ''))
  );

  const rawDescription = replaceStoreName(
    isBn
      ? (currentServiceLink?.description_bn || currentPolicy?.description_bn || currentServiceLink?.description_en || currentPolicy?.description_en || '')
      : (currentServiceLink?.description_en?.trim() || currentPolicy?.description_en || (isAbout ? DEFAULT_ABOUT_POLICY.description_en : isContact ? DEFAULT_CONTACT_POLICY.description_en : isPrivacy ? DEFAULT_PRIVACY_POLICY.description_en : '') || currentServiceLink?.description_bn || currentPolicy?.description_bn || '')
  );

  // Render paragraphs helper
  const renderFormattedDescription = (text: string) => {
    if (!text.trim()) return null;
    const paragraphs = text.split('\n\n');

    return (
      <div className="space-y-4 text-slate-700 font-noto leading-relaxed text-sm sm:text-base">
        {paragraphs.map((p, pIdx) => {
          const lines = p.split('\n');
          return (
            <div key={pIdx} className="space-y-1.5">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2.5 pl-2">
                      <span className="text-amber-500 font-bold shrink-0 mt-1">•</span>
                      <span className="text-slate-800">{trimmed.replace(/^[•\-]\s*/, '')}</span>
                    </div>
                  );
                }
                if (/^\d+\.\s/.test(trimmed)) {
                  const numMatch = trimmed.match(/^(\d+\.)\s*(.*)$/);
                  return (
                    <div key={lIdx} className="flex items-start gap-2.5 pl-2">
                      <span className="text-amber-600 font-bold shrink-0">{numMatch ? numMatch[1] : ''}</span>
                      <span className="text-slate-800">{numMatch ? numMatch[2] : trimmed}</span>
                    </div>
                  );
                }
                return (
                  <p key={lIdx} className="text-slate-700">
                    {line}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb Bar with Home / [Policy Title] and Return to Home */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-3.5 shadow-xs flex items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-sm font-semibold overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-slate-500 hover:text-amber-600 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Home</span>
          </button>
          <span className="text-slate-300 font-normal">/</span>
          <span className="text-slate-900 font-bold truncate">
            {displayTitle}
          </span>
        </nav>

        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border border-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isBn ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
        {/* Dynamic Header */}
        <div className="border-b border-slate-100 pb-5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-siliguri tracking-tight">
            {displayTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {settings.site_name || 'SHOPNOVA'} • {isBn ? 'সর্বশেষ হালনাগাদ পলিসি ও নির্দেশিকা' : 'Official Store Policy & Guidelines'}
          </p>
        </div>

        {/* Short Description Lead Callout */}
        {rawShortDescription && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-800 text-sm sm:text-base font-siliguri font-semibold leading-relaxed">
            {rawShortDescription}
          </div>
        )}

        {/* Render Dynamic Policy Description (Bangla / English) */}
        {rawDescription ? (
          <div className="font-description prose-headings:font-siliguri">
            {renderFormattedDescription(rawDescription)}
          </div>
        ) : null}

        {/* Special About Us Highlights */}
        {isAbout && (
          <div className="space-y-6 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-siliguri">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
                <p className="font-bold text-slate-900 text-sm">{isBn ? '১০০% আসল পণ্য' : '100% Authentic'}</p>
                <p className="text-xs text-slate-500">{isBn ? 'যাচাইকৃত ব্র্যান্ড ও মানসম্মত কোয়ালিটি' : 'Verified manufacturer quality'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <Truck className="w-6 h-6 text-amber-500" />
                <p className="font-bold text-slate-900 text-sm">{isBn ? 'দেশব্যাপী দ্রুত ডেলিভারি' : 'Nationwide Delivery'}</p>
                <p className="text-xs text-slate-500">{isBn ? 'সকল ৬৪ জেলায় দ্রুততম সময়ে হোম ডেলিভারি' : 'Fast home delivery in all 64 districts'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <RotateCcw className="w-6 h-6 text-amber-500" />
                <p className="font-bold text-slate-900 text-sm">{isBn ? '৭ দিনের সহজ রিটার্ন' : '7-Day Return'}</p>
                <p className="text-xs text-slate-500">{isBn ? 'ঝামেলামুক্ত এক্সচেঞ্জ পলিসি' : 'Hassle-free exchange policy'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Special Contact Details & Form */}
        {isContact && (
          <div className="space-y-6 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <Phone className="w-4 h-4" />
                  <span>{isBn ? 'হটলাইন নাম্বার' : 'Helpline'}</span>
                </div>
                <a
                  href={`tel:${(settings.contact_phone || '+880 1700-000000').replace(/\s+/g, '')}`}
                  className="text-base font-black text-slate-900 hover:text-amber-600 transition-colors block"
                >
                  {settings.contact_phone || '+880 1700-000000'}
                </a>
                <p className="text-slate-500 text-xs">
                  {isBn
                    ? (settings.support_hours_bn || settings.support_hours_en || 'শনিবার - বৃহস্পতিবার: সকাল ৯:০০ - রাত ১০:০০')
                    : (settings.support_hours_en || 'Sat - Thu: 9:00 AM - 10:00 PM')}
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <Mail className="w-4 h-4" />
                  <span>{isBn ? 'ইমেইল সাপোর্ট' : 'Email Support'}</span>
                </div>
                <a
                  href={`mailto:${settings.contact_email || 'support@shopnova.com'}`}
                  className="text-base font-black text-slate-900 hover:text-amber-600 transition-colors block"
                >
                  {settings.contact_email || 'support@shopnova.com'}
                </a>
                <p className="text-slate-500 text-xs">
                  {isBn
                    ? (settings.support_response_time_bn || settings.support_response_time_en || '২ ঘণ্টার মধ্যে উত্তর দেওয়া হয়')
                    : (settings.support_response_time_en || 'Response within 2 hours')}
                </p>
              </div>

              <div className="sm:col-span-2 p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <MapPin className="w-4 h-4" />
                  <span>{isBn ? 'অফিস ঠিকানা' : 'Corporate Office'}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                  {isBn
                    ? (settings.company_address_bn || settings.company_address_en || 'বাড়ি ৪৫, রোড ১১, ব্লক ডি, বনানী, ঢাকা-১২১৩, বাংলাদেশ')
                    : (settings.company_address_en || settings.company_address_bn || 'House 45, Road 11, Block D, Banani, Dhaka-1213, Bangladesh')}
                </p>
              </div>

              {/* Official Social Channels */}
              {(() => {
                let channels: any[] = [];
                if (settings.footer_social_links_json) {
                  try {
                    const parsed = JSON.parse(settings.footer_social_links_json);
                    if (Array.isArray(parsed)) {
                      channels = parsed.filter((item) => item.is_active !== false && item.url);
                    }
                  } catch (e) {}
                }

                if (channels.length === 0) return null;

                const getBrand = (platform: string) => {
                  const p = (platform || '').toLowerCase().trim();
                  if (p === 'facebook') return { bg: 'bg-[#1877F2]', text: 'text-white', icon: Facebook, name: 'Facebook' };
                  if (p === 'instagram') return { bg: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]', text: 'text-white', icon: Instagram, name: 'Instagram' };
                  if (p === 'youtube') return { bg: 'bg-[#FF0000]', text: 'text-white', icon: Youtube, name: 'YouTube' };
                  if (p === 'whatsapp') return { bg: 'bg-[#25D366]', text: 'text-white', icon: MessageCircle, name: 'WhatsApp' };
                  if (p === 'tiktok') return { bg: 'bg-[#010101]', text: 'text-white', icon: Music, name: 'TikTok' };
                  if (p === 'twitter' || p === 'x') return { bg: 'bg-[#0F1419]', text: 'text-white', icon: Twitter, name: 'Twitter / X' };
                  if (p === 'linkedin') return { bg: 'bg-[#0A66C2]', text: 'text-white', icon: Linkedin, name: 'LinkedIn' };
                  if (p === 'telegram') return { bg: 'bg-[#229ED9]', text: 'text-white', icon: Send, name: 'Telegram' };
                  return { bg: 'bg-amber-500', text: 'text-slate-950', icon: Globe, name: 'Website' };
                };

                return (
                  <div className="sm:col-span-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                      <Share2 className="w-4 h-4 text-amber-600" />
                      <span>{isBn ? 'আমাদের সোশ্যাল মিডিয়া ও চ্যানেলসমূহ' : 'Our Social Media Channels'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {channels.map((ch, idx) => {
                        const b = getBrand(ch.platform);
                        const IconComp = b.icon;
                        return (
                          <a
                            key={ch.id || idx}
                            href={ch.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-3.5 py-2 rounded-xl ${b.bg} ${b.text} font-bold text-xs flex items-center gap-2 transition-transform hover:scale-105 shadow-xs`}
                          >
                            <IconComp className="w-4 h-4" />
                            <span>{ch.name || b.name}</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Quick Contact & Lead Form */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500" />
                  {isBn ? 'আমাদের সরাসরি বার্তা পাঠান' : 'Send Us a Quick Message'}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {isBn ? 'সরাসরি ইনবক্স ও সাপোর্ট টিমে পৌঁছাবে' : 'Delivered directly to support inbox'}
                </span>
              </div>

              {submitError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                  <span>⚠️ {submitError}</span>
                </div>
              )}

              {isSent ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900">
                        {isBn ? 'বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Message Submitted Successfully!'}
                      </h4>
                      <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                        {isBn
                          ? 'আপনার বার্তাটি আমাদের কাস্টমার সাপোর্ট ইনবক্সে জমা হয়েছে। আমাদের প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবেন।'
                          : 'Your inquiry has been recorded in our support inbox. Our representative will get back to you shortly.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSent(false)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline transition-colors cursor-pointer"
                  >
                    {isBn ? 'আরেকটি বার্তা পাঠান' : 'Send another message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder={isBn ? 'আপনার নাম *' : 'Your Name *'}
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="tel"
                      placeholder={isBn ? 'মোবাইল নাম্বার' : 'Phone Number'}
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="email"
                      placeholder={isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder={isBn ? 'আপনার জিজ্ঞাসা বা বার্তা বিস্তারিত লিখুন... *' : 'Your inquiry or message details... *'}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 resize-none"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-slate-500">
                      * {isBn ? 'নাম এবং মোবাইল বা ইমেইল প্রদান করুন।' : 'Name & phone/email required.'}
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>{isBn ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{isBn ? 'বার্তা পাঠান' : 'Submit Message'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Navigation to other Policy Pages */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-xs font-black text-slate-900">
            {isBn ? 'অন্যান্য পলিসি ও হেল্প পেজসমূহ' : 'Other Store Policies & Information'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isBn ? 'যেকোনো পেজে দ্রুত যেতে নিচের বাটনে ক্লিক করুন' : 'Click to quickly jump to any other store policy'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {policyList
            .filter((p) => p.is_active !== false)
            .map((item) => {
              const itemTitle = isBn ? (item.title_bn || item.title) : (item.title || item.title_bn);
              const isCurrent = type === item.path || type === `#${item.path}`;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.path)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-slate-950 text-amber-400 shadow-xs'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {itemTitle}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};
