import React, { useState } from 'react';
import {
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  MessageCircle,
  Send,
  Music,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { PaymentBadges } from '../common/PaymentBadges.tsx';
import { api } from '../../services/api.ts';

interface FooterProps {
  onNavigate: (page: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t, isBn, setLang } = useLanguage();
  const { settings } = useSettings();
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subMessage, setSubMessage] = useState('');

  const footerBg = settings.footer_bg_color || '#F97316';
  const footerTextColor = settings.footer_text_color || '#0F172A';
  const footerBottomBg = settings.footer_bottom_bg || '#C2410C';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await api.subscribeNewsletter(emailInput.trim());
      setIsSubscribed(true);
      setSubMessage(res?.message || (isBn ? 'ধন্যবাদ! আপনি ক্লাবে যুক্ত হয়েছেন।' : 'Thank you! You are now subscribed.'));
      setEmailInput('');
      setTimeout(() => {
        setIsSubscribed(false);
        setSubMessage('');
      }, 5000);
    } catch (err: any) {
      console.error('Newsletter subscribe error:', err);
      setIsSubscribed(true);
      setSubMessage(err?.message || (isBn ? 'ধন্যবাদ! আপনি যুক্ত হয়েছেন।' : 'Thank you for subscribing.'));
      setEmailInput('');
      setTimeout(() => {
        setIsSubscribed(false);
        setSubMessage('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render platform icon
  const getPlatformIcon = (platform: string) => {
    const p = (platform || '').toLowerCase().trim();
    if (p === 'facebook') return <Facebook className="w-4 h-4" />;
    if (p === 'instagram') return <Instagram className="w-4 h-4" />;
    if (p === 'youtube') return <Youtube className="w-4 h-4" />;
    if (p === 'whatsapp') return <MessageCircle className="w-4 h-4" />;
    if (p === 'tiktok') return <Music className="w-4 h-4" />;
    if (p === 'twitter' || p === 'x') return <Twitter className="w-4 h-4" />;
    if (p === 'linkedin') return <Linkedin className="w-4 h-4" />;
    if (p === 'telegram') return <Send className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  // Helper to get platform authentic original brand styling with full original colors
  const getPlatformBrandConfig = (platform: string) => {
    const p = (platform || '').toLowerCase().trim();
    if (p === 'facebook') {
      return {
        bg: 'bg-[#1877F2]',
        color: 'text-white',
        border: 'border-[#1877F2]',
        shadow: 'hover:shadow-[0_0_15px_rgba(24,119,242,0.6)]',
        name: 'Facebook'
      };
    }
    if (p === 'instagram') {
      return {
        bg: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
        color: 'text-white',
        border: 'border-pink-500/30',
        shadow: 'hover:shadow-[0_0_15px_rgba(220,39,67,0.6)]',
        name: 'Instagram'
      };
    }
    if (p === 'youtube') {
      return {
        bg: 'bg-[#FF0000]',
        color: 'text-white',
        border: 'border-[#FF0000]',
        shadow: 'hover:shadow-[0_0_15px_rgba(255,0,0,0.6)]',
        name: 'YouTube'
      };
    }
    if (p === 'whatsapp') {
      return {
        bg: 'bg-[#25D366]',
        color: 'text-white',
        border: 'border-[#25D366]',
        shadow: 'hover:shadow-[0_0_15px_rgba(37,211,102,0.6)]',
        name: 'WhatsApp'
      };
    }
    if (p === 'tiktok') {
      return {
        bg: 'bg-[#010101]',
        color: 'text-white',
        border: 'border-slate-800',
        shadow: 'hover:shadow-[0_0_15px_rgba(0,242,254,0.5)]',
        name: 'TikTok'
      };
    }
    if (p === 'twitter' || p === 'x') {
      return {
        bg: 'bg-[#000000]',
        color: 'text-white',
        border: 'border-slate-800',
        shadow: 'hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]',
        name: 'Twitter / X'
      };
    }
    if (p === 'linkedin') {
      return {
        bg: 'bg-[#0A66C2]',
        color: 'text-white',
        border: 'border-[#0A66C2]',
        shadow: 'hover:shadow-[0_0_15px_rgba(10,102,194,0.6)]',
        name: 'LinkedIn'
      };
    }
    if (p === 'telegram') {
      return {
        bg: 'bg-[#229ED9]',
        color: 'text-white',
        border: 'border-[#229ED9]',
        shadow: 'hover:shadow-[0_0_15px_rgba(34,158,217,0.6)]',
        name: 'Telegram'
      };
    }
    return {
      bg: 'bg-amber-500',
      color: 'text-slate-950',
      border: 'border-amber-400',
      shadow: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]',
      name: 'Website'
    };
  };

  // Compute active quick navigation service links (4 links from Admin)
  const serviceLinks = (() => {
    if (settings.footer_service_links_json) {
      try {
        const parsed = JSON.parse(settings.footer_service_links_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const active = parsed.filter((item: any) => item.is_active !== false && (item.label || item.label_bn));
          if (active.length > 0) return active;
        }
      } catch (e) {}
    }

    return [
      { id: '1', label: 'About Us', label_bn: 'আমাদের সম্পর্কে', page: 'about' },
      { id: '2', label: 'Contact & Support', label_bn: 'যোগাযোগ ও সাপোর্ট', page: 'contact' }
    ];
  })();

  // Compute active social media links (4 channels)
  const socialLinks = (() => {
    if (settings.footer_social_links_json) {
      try {
        const parsed = JSON.parse(settings.footer_social_links_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const active = parsed.filter(
            (item: any) => (item.is_active === true || item.is_active === 1 || item.is_active === '1' || item.is_active === undefined) && item.url
          );
          if (active.length > 0) return active;
        }
      } catch (e) {}
    }

    // Fallbacks to individual settings or defaults
    const fallbackList = [];
    if (settings.facebook_url || !settings.footer_social_links_json) {
      fallbackList.push({ id: 'fb', platform: 'facebook', name: 'Facebook', url: settings.facebook_url || 'https://facebook.com/shophatbd' });
    }
    if (settings.instagram_url || !settings.footer_social_links_json) {
      fallbackList.push({ id: 'ig', platform: 'instagram', name: 'Instagram', url: settings.instagram_url || 'https://instagram.com/shophatbd' });
    }
    if (settings.youtube_url || !settings.footer_social_links_json) {
      fallbackList.push({ id: 'yt', platform: 'youtube', name: 'YouTube', url: settings.youtube_url || 'https://youtube.com/@shophatbd' });
    }
    if (settings.contact_whatsapp || !settings.footer_social_links_json) {
      fallbackList.push({ id: 'wa', platform: 'whatsapp', name: 'WhatsApp', url: settings.contact_whatsapp || 'https://wa.me/8801700000000' });
    }
    if (settings.tiktok_url) {
      fallbackList.push({ id: 'tt', platform: 'tiktok', name: 'TikTok', url: settings.tiktok_url });
    }
    if (settings.twitter_url) {
      fallbackList.push({ id: 'tw', platform: 'twitter', name: 'Twitter / X', url: settings.twitter_url });
    }
    return fallbackList;
  })();

  // Compute active store policies (excluding About Us and Contact which are in serviceLinks)
  const storePolicies = (() => {
    if (settings.store_policies_json) {
      try {
        const parsed = JSON.parse(settings.store_policies_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const active = parsed.filter(
            (item: any) =>
              item.is_active !== false &&
              item.id !== 'about' &&
              item.id !== 'contact' &&
              item.path !== 'about' &&
              item.path !== 'contact'
          );
          if (active.length > 0) return active;
        }
      } catch (e) {}
    }

    return [
      { id: 'shipping-policy', title: 'Shipping & Delivery Policy', title_bn: 'ডেলিভারি ও শিপিং পলিসি', path: 'shipping-policy' },
      { id: 'refund-policy', title: 'Return & Refund Policy', title_bn: 'রিটার্ন ও রিফান্ড নীতি', path: 'refund-policy' },
      { id: 'terms', title: 'Terms & Conditions', title_bn: 'ব্যবহারের শর্তাবলী', path: 'terms' },
      { id: 'privacy', title: 'Privacy Policy', title_bn: 'গোপনীয়তা ও ডাটা পলিসি', path: 'privacy' },
      { id: 'faq', title: 'Frequently Asked Questions (FAQ)', title_bn: 'সাধারণ জিজ্ঞাসা', path: 'faq' },
      { id: 'track', title: 'Live Order Tracking Portal', title_bn: 'লাইভ অর্ডার ট্র্যাকিং', path: 'track' }
    ];
  })();

  return (
    <footer
      style={{ backgroundColor: footerBg, color: footerTextColor }}
      className="pt-1 sm:pt-2 border-t border-black/10 transition-colors flex flex-col"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pt-1 pb-4">
          {/* Brand Col */}
          <div className="sm:col-span-2 lg:col-span-5 space-y-3.5">
            <div className="flex items-center gap-3">
              {settings.logo_type !== 'text' && (
                settings.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt={settings.site_name || 'Logo'}
                    style={{ maxHeight: settings.logo_height ? `${Math.min(Math.max(Number(settings.logo_height), 24), 56)}px` : '42px' }}
                    className="w-auto object-contain rounded-xl shrink-0"
                  />
                ) : (
                  <div
                    style={{ backgroundColor: footerTextColor, color: footerBg }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-black shrink-0"
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                )
              )}
              {settings.logo_type !== 'image' && (
                <div className="inline-flex flex-col justify-center min-w-0 overflow-visible py-0.5">
                  <span
                    style={{ color: footerTextColor }}
                    className="text-xl sm:text-2xl font-black tracking-tight font-heading block leading-tight uppercase whitespace-nowrap pt-1 pb-0.5 overflow-visible"
                  >
                    {isBn && settings.site_name_bn ? settings.site_name_bn : (settings.site_name || 'SHOPHATBD')}
                  </span>
                  {(() => {
                    const taglineText = isBn
                      ? (settings.site_tagline_bn || 'স্মার্ট কেনাকাটা সুন্দর জীবন')
                      : (settings.site_tagline_en || 'SHOP SMART LIVE BETTER');
                    const words = taglineText.trim().split(/\s+/);
                    return words.length > 1 ? (
                      <div
                        className={`w-full flex justify-between items-center text-[7.5px] sm:text-[8px] lg:text-[8.5px] font-extrabold uppercase opacity-90 leading-none mt-1 select-none ${
                          isBn ? 'font-bengali' : ''
                        }`}
                        style={{ color: footerTextColor }}
                      >
                        {words.map((w, idx) => (
                          <span
                            key={idx}
                            className={`shrink-0 ${
                              isBn ? '' : 'tracking-[0.03em] sm:tracking-[0.05em]'
                            }`}
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div
                        className={`w-full text-center text-[7.5px] sm:text-[8px] lg:text-[8.5px] font-extrabold uppercase opacity-90 leading-none mt-1 select-none ${
                          isBn ? 'font-bengali' : 'tracking-[0.08em]'
                        }`}
                        style={{ color: footerTextColor }}
                      >
                        {taglineText}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Address & Contact Info directly under brand */}
            <div
              style={{ color: footerTextColor }}
              className="space-y-2 text-sm font-medium pt-1"
            >
              <div className="flex items-start gap-2.5 opacity-90">
                <MapPin style={{ color: footerTextColor }} className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-bengali tracking-normal text-xs sm:text-sm">
                  {isBn
                    ? settings.company_address_bn || settings.company_address_en || 'মহেশপুর, ঝিনাইদহ, বাংলাদেশ'
                    : settings.company_address_en || settings.company_address_bn || 'Maheshpur, Jhenaidah, Bangladesh'}
                </span>
              </div>
              {settings.contact_phone && (
                <div className="flex items-center gap-2.5">
                  <Phone style={{ color: footerTextColor }} className="w-4 h-4 shrink-0" />
                  <a
                    href={`tel:${settings.contact_phone}`}
                    style={{ color: footerTextColor }}
                    className="hover:underline font-bold text-xs sm:text-sm"
                  >
                    {settings.contact_phone}
                  </a>
                </div>
              )}
              {settings.contact_email && (
                <div className="flex items-center gap-2.5">
                  <Mail style={{ color: footerTextColor }} className="w-4 h-4 shrink-0" />
                  <a
                    href={`mailto:${settings.contact_email}`}
                    style={{ color: footerTextColor }}
                    className="hover:underline font-bold text-xs sm:text-sm truncate"
                  >
                    {settings.contact_email}
                  </a>
                </div>
              )}
            </div>

            {/* Social Icons with Authentic Brand Colors */}
            {socialLinks.length > 0 && (
              <div className="pt-2">
                <p
                  style={{ color: footerTextColor }}
                  className="text-[11px] font-bold uppercase tracking-wider mb-2 opacity-80"
                >
                  {isBn ? 'সোশ্যাল মিডিয়ায় আমরা' : 'Connect With Us'}
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  {socialLinks.map((item: any, idx: number) => {
                    const brand = getPlatformBrandConfig(item.platform);
                    return (
                      <a
                        key={item.id || idx}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        title={item.name || brand.name}
                        className={`w-9 h-9 rounded-full ${brand.bg} ${brand.color} ${brand.border} border flex items-center justify-center transition-all duration-200 hover:scale-115 ${brand.shadow} cursor-pointer shadow-sm`}
                      >
                        {getPlatformIcon(item.platform)}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Customer Care / Policy Hub */}
          <div className="sm:col-span-1 lg:col-span-3">
            <p
              style={{ color: footerTextColor }}
              className={`text-xs font-black uppercase mb-3 ${isBn ? 'tracking-normal font-bengali' : 'tracking-wider'}`}
            >
              {isBn
                ? (settings.footer_policies_title_bn || 'গ্রাহক সেবা ও পলিসি')
                : (settings.footer_policies_title_en || settings.footer_policies_title || 'CUSTOMER SERVICE & POLICIES')}
            </p>
            <ul
              style={{ color: footerTextColor }}
              className="space-y-2 text-xs font-semibold font-bengali tracking-normal"
            >
              {storePolicies.map((pol: any) => (
                <li key={pol.id}>
                  <button
                    onClick={() => {
                      const cleanPath = (pol.path || '').replace(/^#/, '').replace(/^\//, '');
                      if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
                        window.open(cleanPath, '_blank');
                      } else {
                        onNavigate(cleanPath);
                      }
                    }}
                    style={{ color: footerTextColor }}
                    className="opacity-85 hover:opacity-100 hover:underline transition-all text-left cursor-pointer"
                  >
                    {isBn ? (pol.title_bn || pol.title) : (pol.title || pol.title_bn)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Newsletter Subscription & Payment Methods */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col items-start lg:items-end">
            <div className="w-full max-w-[320px] space-y-3.5">
              {/* Newsletter Title & Subtitle */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 opacity-80 shrink-0" />
                  <p
                    style={{ color: footerTextColor }}
                    className={`text-xs font-black uppercase ${isBn ? 'tracking-normal font-bengali' : 'tracking-wider'}`}
                  >
                    {isBn
                      ? (settings.footer_newsletter_title_bn || settings.footer_newsletter_title || 'শপহাটবিডি ক্লাবে যুক্ত থাকুন')
                      : (settings.footer_newsletter_title_en || settings.footer_newsletter_title || 'JOIN THE SHOPHATBD CLUB')}
                  </p>
                </div>
                <p
                  style={{ color: footerTextColor }}
                  className="text-[11px] font-medium opacity-90 leading-snug font-bengali tracking-normal"
                >
                  {isBn
                    ? (settings.footer_newsletter_sub_bn || settings.footer_newsletter_sub || 'সাবস্ক্রাইব করে প্রথম অর্ডারে ১০% বিশেষ ছাড় উপভোগ করুন।')
                    : (settings.footer_newsletter_sub_en || settings.footer_newsletter_sub || 'Subscribe to get 10% OFF your first order, exclusive Eid flash sales, and new drop alerts.')}
                </p>
              </div>

              {isSubscribed ? (
                <div
                  style={{ backgroundColor: `${footerTextColor}20`, color: footerTextColor, borderColor: `${footerTextColor}40` }}
                  className="p-2.5 border rounded-xl text-xs flex items-center gap-2 font-bold font-bengali tracking-normal"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{subMessage || (isBn ? 'ধন্যবাদ! আপনি যুক্ত হয়েছেন।' : 'Thank you! You are now subscribed.')}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={
                      isBn
                        ? (settings.footer_newsletter_placeholder_bn || 'আপনার ইমেইল লিখুন...')
                        : (settings.footer_newsletter_placeholder_en || 'Enter your email...')
                    }
                    className="w-full bg-white border border-black/15 rounded-xl py-1.5 px-3 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 font-bengali shadow-xs"
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: settings.footer_newsletter_btn_bg || footerTextColor,
                      color: settings.footer_newsletter_btn_text_color || footerBg
                    }}
                    className="w-full font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90 shadow-xs font-bengali tracking-normal cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isBn
                        ? (settings.footer_newsletter_btn_bn || 'সাবস্ক্রাইব করুন')
                        : (settings.footer_newsletter_btn_en || 'SUBSCRIBE')}
                    </span>
                  </button>
                </form>
              )}

              {/* Payment Badges */}
              {settings.show_accepted_payment_gateways !== 'false' && (
                <div className="pt-3 border-t border-black/10 space-y-1.5">
                  <p
                    style={{ color: footerTextColor }}
                    className={`text-[11px] font-black opacity-90 ${isBn ? 'font-bengali tracking-normal' : ''}`}
                  >
                    {isBn
                      ? (settings.accepted_payment_gateways_title_bn || 'গৃহীত পেমেন্ট মেথডসমূহ')
                      : (settings.accepted_payment_gateways_title_en || 'Accepted Payment Gateways')}
                  </p>
                  <PaymentBadges
                    badgesJson={settings.footer_payment_badges_json}
                    isBn={isBn}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright bar - Full Screen Width (Edge to Edge) */}
      <div
        style={{ backgroundColor: footerBottomBg, color: footerTextColor }}
        className="w-full border-t border-black/10 py-4 px-4 sm:px-6 lg:px-8 pb-20 md:pb-4 transition-colors"
      >
        <div
          style={{ color: footerTextColor }}
          className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold font-bengali tracking-normal"
        >
          <p className="opacity-90">© {new Date().getFullYear()} {(isBn ? settings.site_name_bn : settings.site_name) || (isBn ? 'শপহাটবিডি' : 'SHOPHATBD')} Bangladesh. {isBn ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All Rights Reserved.'}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
            {/* Language Switcher in Footer */}
            <div className="flex items-center bg-black/15 rounded-lg p-0.5 text-[11px] font-bold border border-black/10 shrink-0">
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  isBn
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'opacity-70 hover:opacity-100 hover:bg-black/5'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  !isBn
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'opacity-70 hover:opacity-100 hover:bg-black/5'
                }`}
              >
                EN
              </button>
            </div>

            {serviceLinks.map((link: any) => (
              <button
                key={`btm-${link.id}`}
                onClick={() => {
                  if (link.page === 'custom' && link.url) {
                    window.open(link.url, '_blank');
                  } else {
                    onNavigate(link.page || 'home');
                  }
                }}
                style={{ color: footerTextColor }}
                className="opacity-90 hover:opacity-100 hover:underline"
              >
                {isBn ? (link.label_bn || link.label) : link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

