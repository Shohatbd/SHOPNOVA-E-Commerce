import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteSettings, ShippingMethod, Banner } from '../types/index.ts';
import { api } from '../services/api.ts';
import { getAutoCurrencySymbol } from '../utils/currency.ts';

interface SettingsContextType {
  settings: Partial<SiteSettings>;
  shippingMethods: ShippingMethod[];
  banners: Banner[];
  formatPrice: (amount: number) => string;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<{ success: boolean; message?: string }>;
  isLoading: boolean;
}

const defaultSettings: Partial<SiteSettings> = {
  site_name: 'SHOPHATBD',
  site_name_bn: 'শপহাটবিডি',
  default_language: 'bn',
  site_tagline_en: 'SHOP SMART LIVE BETTER',
  site_tagline_bn: 'স্মার্ট কেনাকাটা সুন্দর জীবন',
  currency: 'BDT',
  currency_symbol: '৳',
  contact_phone: '01724709454',
  contact_email: 'liakot911@gmail.com',
  company_address_en: 'Maheshpur, Jhenaidah, Bangladesh',
  company_address_bn: 'মহেশপুর, ঝিনাইদহ, বাংলাদেশ',
  logo_url: '/logo.png',
  announcement_enabled: 'true',
  announcement_en: '⚡ Welcome to Shophatbd! Free Home Delivery on orders above ৳2,500! Call: 01724709454 ⚡',
  announcement_bn: '⚡ শপহাটবিডি-তে স্বাগতম! যেকোনো তথ্যে সরাসরি কল করুন: ০১৭২৪৭০৯৪৫৪ ⚡',
  announcement_bg_color: '#2A140A',
  announcement_text_color: '#FFF7ED',
  free_shipping_threshold: '2500',
  flash_sale_enabled: '1',
  flash_sale_end_time: '',
  flash_sale_title_en: 'Flash Sale Deals',
  flash_sale_title_bn: 'ধামাকা ফ্ল্যাশ সেল ডিলস',
  flash_sale_sub_en: 'Hurry up! Grab limited-time massive discounts before stock runs out.',
  flash_sale_sub_bn: 'সীমিত সময়ের মেগা ছাড়! স্টক শেষ হওয়ার আগেই আপনার পছন্দের পণ্যটি সংগ্রহ করুন।',
  side_banner_top_enabled: '1',
  side_banner_top_image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
  side_banner_top_badge_en: 'HOT DEAL • 50% OFF',
  side_banner_top_badge_bn: 'হট ডিল • ৫০% ছাড়',
  side_banner_top_title_en: 'Modern Tech & Watches',
  side_banner_top_title_bn: 'স্মার্ট গ্যাজেট ও ঘড়ি',
  side_banner_top_subtitle_en: 'Premium Gear at Best Value',
  side_banner_top_subtitle_bn: 'সেরা মূল্যে প্রিমিয়াম ব্র্যান্ড',
  side_banner_top_button_en: 'Shop Now',
  side_banner_top_button_bn: 'এখনই কিনুন',
  side_banner_top_link: '/shop',
  side_banner_bottom_enabled: '1',
  side_banner_bottom_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
  side_banner_bottom_badge_en: 'FREE HOME DELIVERY',
  side_banner_bottom_badge_bn: 'ফ্রি ডেলিভারি অফার',
  side_banner_bottom_title_en: 'Latest Lifestyle Fashion',
  side_banner_bottom_title_bn: 'লেটেস্ট ট্রেন্ডি ফ্যাশন',
  side_banner_bottom_subtitle_en: 'Curated Apparel & Lifestyle',
  side_banner_bottom_subtitle_bn: 'নতুন প্রিমিয়াম পোশাক কালেকশন',
  side_banner_bottom_button_en: 'Explore Deals',
  side_banner_bottom_button_bn: 'অফার দেখুন',
  side_banner_bottom_link: '/shop',
  meta_capi_enabled: '0',
  google_enhanced_conversions_enabled: '1',
  site_bg_color: '#F8F9FA',
  header_bg_color: '#F97316',
  header_text_color: '#0F172A',
  category_bar_bg: '#C2410C',
  category_bar_text_color: '#0F172A',
  category_btn_border_color: '#00000020',
  category_btn_bg: 'transparent',
  category_btn_text: '#0F172A',
  category_active_bg: '#0F172A',
  category_active_text: '#F97316',
  category_active_border: '#0F172A',
  category_view_shape: 'circle',
  footer_bg_color: '#F97316',
  footer_text_color: '#0F172A',
  footer_bottom_bg: '#C2410C',
  contact_whatsapp: 'https://wa.me/8801724709454',
  whatsapp_chat_number: '01724709454',
  facebook_url: 'https://facebook.com/shophatbd',
  instagram_url: 'https://instagram.com/shophatbd',
  youtube_url: 'https://youtube.com/@shophatbd',
  footer_service_links_json: JSON.stringify([
    {
      id: '1',
      label: 'About Us',
      label_bn: 'আমাদের সম্পর্কে',
      page: 'about',
      is_active: true,
      short_description_bn: 'SHOPNOVA হলো বাংলাদেশের বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম, যেখানে প্রিমিয়াম কোয়ালিটি ও সেরা কাস্টমার সেবার নিশ্চয়তা দেওয়া হয়।',
      short_description: "SHOPNOVA is Bangladesh's premier online shopping destination, guaranteeing 100% authentic quality and attentive customer care.",
      description_bn: `স্বাগতম SHOPNOVA-তে!

SHOPNOVA বাংলাদেশের অন্যতম নির্ভরযোগ্য ও বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য হলো সারা দেশের প্রতিটি প্রান্তে প্রিমিয়াম কোয়ালিটির পণ্য সাশ্রয়ী মূল্যে এবং দ্রুততম সময়ে গ্রাহকের কাছে পৌঁছে দেওয়া।

আমাদের বিশেষত্বসমূহ:
১. ১০০% জেনুইন ও প্রিমিয়াম কোয়ালিটি পণ্য: প্রতিটি পণ্য অভিজ্ঞ টিম দ্বারা কঠোরভাবে মান পরীক্ষা করে ডেলিভারির জন্য প্রস্তুত করা হয়।
২. ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা: পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধের নিশ্চিন্ত সুবিধা।
৩. দ্রুততম দেশব্যাপী ডেলিভারি: ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা এবং সমগ্র বাংলাদেশে সর্বোচ্চ ২-৩ দিনের মধ্যে নিশ্চিত হোম ডেলিভারি।
৪. ৭ দিনের সহজ ও ঝামেলামুক্ত রিপ্লেসমেন্ট: পণ্য প্রাপ্তির পর কোনো সমস্যা বা অসঙ্গতি দেখা দিলে সহজ রিপ্লেসমেন্ট পলিসি।
৫. সার্বক্ষণিক ফ্রেন্ডলি কাস্টমার কেয়ার ও বিক্রয়োত্তর সেবা: যেকোনো সময় আপনার পাশে আমাদের কাস্টমার প্রতিনিধি দল।

গ্রাহকের বিশ্বস্ততা ও সন্তুষ্টিই আমাদের প্রতিটি অর্ডারের মূল প্রেরণা। SHOPNOVA-র সাথে আপনার অনলাইন কেনাকাটা হোক নিরাপদ ও আনন্দদায়ক।`,
      description_en: `Welcome to SHOPNOVA!

SHOPNOVA is one of the most reliable and trusted online shopping destinations in Bangladesh. Our mission is to bring premium quality lifestyle and tech products at affordable prices with lightning-fast delivery to every corner of the country.

Why Choose Us:
1. 100% Genuine & Premium Products: Every product is thoroughly inspected and quality-checked by our experienced inspection team before packaging.
2. Cash on Delivery (COD): Nationwide pay-on-delivery convenience so you can inspect your package with complete peace of mind.
3. Rapid Nationwide Delivery: Express delivery within 24–48 hours inside Dhaka city and 2–3 days across all 64 districts in Bangladesh.
4. 7-Day Hassle-Free Exchange: Simple and transparent replacement process in case of sizing or manufacturing defects.
5. Dedicated 24/7 Customer Care: A warm, friendly support team always ready to assist you before and after purchase.

Your trust and satisfaction inspire every single order we package. We wish you a delightful and confident shopping experience with SHOPNOVA!`
    },
    {
      id: '2',
      label: 'Contact & Support',
      label_bn: 'যোগাযোগ ও সাপোর্ট',
      page: 'contact',
      is_active: true,
      short_description_bn: 'অর্ডার, ডেলিভারি বা যেকোনো সহায়তার জন্য আমাদের ২৪/৭ ডেডিকেটেড কাস্টমার সাপোর্ট সর্বদা প্রস্তুত।',
      short_description: 'Our dedicated support team is available 7 days a week to assist you with orders, delivery updates, and all questions.',
      description_bn: `কাস্টমার সাপোর্ট ও হেল্পলাইন:

যেকোনো অর্ডার সংক্রান্ত তথ্য, ডেলিভারি আপডেট বা যেকোনো সহযোগিতার জন্য আমাদের ডেডিকেটেড সাপোর্ট টিম সর্বদা প্রস্তুত রয়েছে।

যেভাবে আমাদের সাথে যোগাযোগ করবেন:
১. হটলাইন ও হেল্পডেস্ক: সকাল ৯:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত আমাদের হেল্পলাইনে সরাসরি ফোন করতে পারেন।
২. অফিশিয়াল হোয়াটসঅ্যাপ: যেকোনো তথ্য ও দ্রুত উত্তরের জন্য হোয়াটসঅ্যাপে মেসেজ দিন।
৩. ইমেইল সাপোর্ট: যেকোনো অভিযোগ বা বিস্তারিত অনুসন্ধানের জন্য আমাদের অফিশিয়াল ইমেইলে লিখুন, আমরা সর্বোচ্চ ২৪ ঘণ্টার মধ্যে রিপ্লাই প্রদান করি।
৪. অফিশিয়াল শোরুম ও প্রধান অফিস: সরাসরি সাক্ষাৎ বা যেকোনো অনুসন্ধানের জন্য আমাদের কেন্দ্রীয় করপোরেট অফিসে আসার আন্তরিক আমন্ত্রণ রইল।

আমাদের বিশেষ সেবা ও সুবিধাসমূহ:
• লাইভ অর্ডার ট্র্যাকিং ও তাৎক্ষণিক ডেলিভারি স্ট্যাটাস আপডেট
• পেমেন্ট, রিফান্ড ও ইনভয়েস সংক্রান্ত পূর্ণাঙ্গ সহায়তা
• ওয়ারেন্টি ও রিপ্লেসমেন্ট ক্লেইমে সর্বোচ্চ অগ্রাধিকার

আমরা প্রতিটি গ্রাহকের মতামত ও মূল্যবান প্রশ্নের দ্রুততম কার্যকর সমাধান দিতে সর্বদা প্রতিশ্রুতিবদ্ধ।`,
      description_en: `Customer Support & Helpline:

Our dedicated support team is at your service 7 days a week for order updates, shipping questions, or any shopping assistance.

Ways to Connect With Us:
1. Hotline & Helpdesk: Call our helpline directly between 9:00 AM and 10:00 PM for instant voice assistance.
2. Official WhatsApp: Message our team on WhatsApp for quick inquiries, image sharing, and order confirmation.
3. Email Support: Send your detailed queries or feedback to our official email—we reply within 24 hours.
4. Corporate Office: You are always welcome to visit our central corporate office in Dhaka for in-person support.

Our Commitments to You:
• Live parcel tracking and instant courier status alerts
• Comprehensive payment, billing, and invoice assistance
• Priority warranty and return/replacement fulfillment

We are committed to delivering swift, effective solutions to every valued customer question.`
    },
    {
      id: '3',
      label: 'Privacy Policy',
      label_bn: 'গোপনীয়তা ও ডাটা পলিসি',
      page: 'privacy',
      is_active: true,
      short_description_bn: 'আমরা আপনার ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা ও আধুনিক এনক্রিপশন প্রযুক্তিতে প্রতিশ্রুতিবদ্ধ।',
      short_description: 'We prioritize your personal data security and privacy through robust 256-bit encryption.',
      description_bn: `১. ব্যক্তিগত তথ্যের সুরক্ষা:
আমরা আপনার ব্যক্তিগত তথ্যের সর্বোচ্চ সুরক্ষা ও গোপনীয়তা রক্ষা করতে অঙ্গীকারবদ্ধ। আপনার নাম, মোবাইল নম্বর, ইমেইল এবং ডেলিভারি ঠিকানা শুধুমাত্র আপনার অর্ডার প্রসেসিং ও পার্সেল প্রেরণের উদ্দেশ্যে সংগ্রহ করা হয়।

২. পেমেন্ট ও আর্থিক তথ্যের শতভাগ নিরাপত্তা:
অনলাইন পেমেন্টের ক্ষেত্রে আমাদের প্ল্যাটফর্ম আন্তর্জাতিক মানসম্পন্ন ২৫৬-বিট SSL এনক্রিপশন প্রযুক্তি ব্যবহার করে। আপনার ক্রেডিট/ডেবিট কার্ড নাম্বার, CVV কিংবা বিকাশ-নগদ পিন কখনোই আমাদের নিজস্ব সার্ভারে সংরক্ষিত হয় না।

৩. তথ্য তৃতীয় পক্ষের সাথে শেয়ার না করার নীতি:
কুরিয়ার ডেলিভারি পার্টনার ছাড়া কোনো অননুমোদিত তৃতীয় পক্ষের কাছে আমরা কখনোই গ্রাহকের ব্যক্তিগত তথ্য বিক্রি, ভাড়া বা বাণিজ্যিক উদ্দেশ্যে হস্তান্তর করি না।

৪. গ্রাহকের অধিকার ও তথ্য সংশোধন:
আপনার ব্যক্তিগত অ্যাকাউন্ট বা প্রোফাইল সংক্রান্ত যেকোনো তথ্য আপডেট, সংশোধন কিংবা স্থায়ীভাবে মুছে ফেলার অনুরোধের জন্য আমাদের ডেডিকেটেড সাপোর্ট টিমের সাথে যেকোনো সময় সরাসরি যোগাযোগ করতে পারেন।`,
      description_en: `1. Privacy Commitment & Personal Data Protection:
We are dedicated to safeguarding your personal data and respect your confidentiality. We collect essential information such as customer name, contact phone, delivery address, and email solely for order fulfillment and logistics tracking.

2. Financial & Payment Security:
Online payments are conducted through PCI-DSS compliant, 256-bit SSL encrypted gateways. We never store credit/debit card numbers, CVVs, or mobile banking PINs on our servers.

3. Zero Third-Party Data Selling:
Customer data is strictly never rented, sold, or disclosed to unauthorized third parties, except as required by designated logistics partners solely to complete doorstep delivery.

4. Customer Rights & Data Management:
You retain full rights to request verification, amendment, or removal of your personal information from our active databases by contacting our privacy support desk.`
    }
  ]),
  footer_social_links_json: JSON.stringify([
    { id: 'soc_fb', platform: 'facebook', name: 'Facebook Page', url: 'https://facebook.com/shopnovabd', is_active: true },
    { id: 'soc_ig', platform: 'instagram', name: 'Instagram Profile', url: 'https://instagram.com/shopnovabd', is_active: true },
    { id: 'soc_yt', platform: 'youtube', name: 'YouTube Channel', url: 'https://youtube.com/@shopnovabd', is_active: true },
    { id: 'soc_wa', platform: 'whatsapp', name: 'WhatsApp Helpline', url: 'https://wa.me/8801700000000', is_active: true }
  ]),
  store_policies_json: JSON.stringify([
    { id: 'shipping-policy', title: 'Shipping & Delivery Policy', title_bn: 'ডেলিভারি ও শিপিং পলিসি', path: 'shipping-policy', icon: 'truck', is_active: true },
    { id: 'refund-policy', title: 'Return & Refund Policy', title_bn: 'রিটার্ন ও রিফান্ড নীতি', path: 'refund-policy', icon: 'rotate-ccw', is_active: true },
    { id: 'terms', title: 'Terms & Conditions', title_bn: 'ব্যবহারের শর্তাবলী', path: 'terms', icon: 'file-text', is_active: true },
    { id: 'faq', title: 'Frequently Asked Questions (FAQ)', title_bn: 'সাধারণ জিজ্ঞাসা', path: 'faq', icon: 'help', is_active: true },
    { id: 'track', title: 'Live Order Tracking Portal', title_bn: 'লাইভ অর্ডার ট্র্যাকিং', path: 'track', icon: 'map-pin', is_active: true }
  ]),
  footer_policies_title: 'CUSTOMER SERVICE & POLICIES',
  footer_policies_title_en: 'CUSTOMER SERVICE & POLICIES',
  footer_policies_title_bn: 'গ্রাহক সেবা ও পলিসি',
  seo_meta_title: "SHOPNOVA - Bangladesh's Premier Lifestyle & Tech Destination",
  seo_meta_title_bn: 'শপনোভা - প্রিমিয়াম লাইফস্টাইল ও আধুনিক গ্যাজেট অনলাইন শপিং বাংলাদেশ',
  seo_description: 'Shop authentic fashion, watches, electronics, and lifestyle products with fast nationwide home delivery, easy returns, and secure payments across Bangladesh.',
  seo_description_bn: 'সেরা মানের পোশাক, ঘড়ি ও ট্রেন্ডিং গ্যাজেট কিনুন সুলভ মূল্যে। দ্রুত হোম ডেলিভারি ও সহজ রিটার্ন সুবিধা সমগ্র বাংলাদেশে।'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Partial<SiteSettings>>(() => {
    try {
      const cached = localStorage.getItem('shopnova_cached_settings');
      if (cached) {
        return { ...defaultSettings, ...JSON.parse(cached) };
      }
    } catch (_) {}
    return defaultSettings;
  });

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const cached = localStorage.getItem('shopnova_cached_banners');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (_) {}
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSettings = useCallback(async () => {
    try {
      const [settingsRes, bannersRes] = await Promise.all([
        api.getSettings().catch(() => null),
        api.getBanners().catch(() => null)
      ]);

      if (settingsRes?.success && settingsRes.settings) {
        setSettings((prev) => {
          const merged = { ...prev, ...settingsRes.settings };
          try {
            localStorage.setItem('shopnova_cached_settings', JSON.stringify(merged));
          } catch (_) {}
          return merged;
        });
        if (settingsRes.shippingMethods) {
          setShippingMethods(settingsRes.shippingMethods);
        }
      }

      if (bannersRes?.success && bannersRes.banners) {
        setBanners(bannersRes.banners);
        try {
          localStorage.setItem('shopnova_cached_banners', JSON.stringify(bannersRes.banners));
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const formatPrice = (amount: number): string => {
    const symbol = settings.currency_symbol || getAutoCurrencySymbol(settings.currency || 'BDT', '৳');
    const num = Math.round(Number(amount) || 0);
    return `${symbol}${num.toLocaleString('en-US')}`;
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      // Optimistically update localStorage and state immediately
      setSettings((prev) => {
        const merged = { ...prev, ...newSettings };
        try {
          localStorage.setItem('shopnova_cached_settings', JSON.stringify(merged));
        } catch (_) {}
        return merged;
      });

      const res = await api.updateSettings(newSettings);
      if (res.success) {
        refreshSettings();
        return { success: true };
      }
      return { success: false, message: res.message || 'Failed to update settings' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error updating settings' };
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        shippingMethods,
        banners,
        formatPrice,
        refreshSettings,
        updateSettings,
        isLoading
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
