import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Trash2,
  Plus,
  Edit3,
  Sliders,
  Phone,
  Mail,
  MapPin,
  Globe,
  Truck,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Layout,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  MessageCircle,
  Send,
  Music,
  Link2,
  Check,
  X,
  Share2,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Zap,
  Search,
  Bot,
  Tag,
  Shirt,
  RotateCcw,
  HelpCircle,
  Palette,
  Headphones,
  Star,
  Award,
  Clock,
  Heart,
  Package,
  Lock,
  ThumbsUp,
  Gift,
  Code,
  Database,
  Activity,
  ArrowRight,
  Circle,
  Square
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { ImageUploadField } from './ImageUploadField.tsx';
import { StoreBackupManager } from './StoreBackupManager.tsx';
import { SUPPORTED_CURRENCIES, getAutoCurrencySymbol } from '../../utils/currency.ts';
import { WhyShopFeatureItem, PaymentBadgeItem } from '../../types/index.ts';
import { PaymentBadges, DEFAULT_PAYMENT_BADGES, renderPaymentLogo } from '../common/PaymentBadges.tsx';

// Supported social media platforms configuration with authentic brand colors & icons
export const SOCIAL_PLATFORM_OPTIONS = [
  {
    id: 'facebook',
    name: 'Facebook',
    defaultName: 'Facebook Page',
    icon: Facebook,
    color: 'text-white bg-[#1877F2] border-[#1877F2]',
    hoverBadge: 'bg-[#1877F2] text-white',
    placeholder: 'https://facebook.com/yourpage'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    defaultName: 'Instagram Profile',
    icon: Instagram,
    color: 'text-white bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] border-pink-500/40',
    hoverBadge: 'bg-[#E4405F] text-white',
    placeholder: 'https://instagram.com/yourprofile'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    defaultName: 'YouTube Channel',
    icon: Youtube,
    color: 'text-white bg-[#FF0000] border-[#FF0000]',
    hoverBadge: 'bg-[#FF0000] text-white',
    placeholder: 'https://youtube.com/@yourchannel'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    defaultName: 'WhatsApp Helpline',
    icon: MessageCircle,
    color: 'text-white bg-[#25D366] border-[#25D366]',
    hoverBadge: 'bg-[#25D366] text-white',
    placeholder: 'https://wa.me/8801700000000'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    defaultName: 'TikTok Official',
    icon: Music,
    color: 'text-white bg-black border-slate-700',
    hoverBadge: 'bg-black text-cyan-400 border border-cyan-400/40',
    placeholder: 'https://tiktok.com/@yourchannel'
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    defaultName: 'Twitter (X) Handle',
    icon: Twitter,
    color: 'text-white bg-[#0F1419] border-slate-700',
    hoverBadge: 'bg-black text-white',
    placeholder: 'https://x.com/yourhandle'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    defaultName: 'LinkedIn Page',
    icon: Linkedin,
    color: 'text-white bg-[#0A66C2] border-[#0A66C2]',
    hoverBadge: 'bg-[#0A66C2] text-white',
    placeholder: 'https://linkedin.com/company/yourbrand'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    defaultName: 'Telegram Channel',
    icon: Send,
    color: 'text-white bg-[#229ED9] border-[#229ED9]',
    hoverBadge: 'bg-[#229ED9] text-white',
    placeholder: 'https://t.me/yourchannel'
  },
  {
    id: 'custom',
    name: 'Custom Social / Website',
    defaultName: 'Official Website / Link',
    icon: Globe,
    color: 'text-slate-950 bg-amber-400 border-amber-400',
    hoverBadge: 'bg-amber-500 text-slate-950',
    placeholder: 'https://yourwebsite.com'
  }
];

import {
  DEFAULT_STORE_POLICIES,
  PolicyLinkItem,
  countWords
} from '../../data/defaultPolicies.ts';
export type { PolicyLinkItem };
export { DEFAULT_STORE_POLICIES, countWords };

export const WHY_SHOP_ICON_OPTIONS = [
  { id: 'shield', name: 'Shield / Authenticity / Warranty', icon: ShieldCheck },
  { id: 'truck', name: 'Fast Delivery / Shipping', icon: Truck },
  { id: 'rotate-ccw', name: 'Easy Return / Exchange', icon: RotateCcw },
  { id: 'sparkles', name: 'Sparkles / Premium Quality', icon: Sparkles },
  { id: 'credit-card', name: 'Secure Payment / COD / Cards', icon: CreditCard },
  { id: 'headphones', name: '24/7 Helpline / Support', icon: Headphones },
  { id: 'star', name: '5-Star Quality / Top Rated', icon: Star },
  { id: 'check', name: 'Verified / Satisfaction Guarantee', icon: CheckCircle2 },
  { id: 'award', name: 'Brand Award / Best Choice', icon: Award },
  { id: 'clock', name: 'Fast Order Processing / 24h', icon: Clock },
  { id: 'zap', name: 'Instant / Express Service', icon: Zap },
  { id: 'heart', name: 'Loved by Customers', icon: Heart },
  { id: 'package', name: 'Safe Packaging / Parcel', icon: Package },
  { id: 'lock', name: '100% Secure Checkout', icon: Lock },
  { id: 'thumbs-up', name: 'Customer Satisfaction', icon: ThumbsUp },
  { id: 'gift', name: 'Special Rewards / Gift', icon: Gift }
];

export const DEFAULT_WHY_SHOP_FEATURES: WhyShopFeatureItem[] = [
  {
    id: 'why_1',
    title: '100% Authentic Quality',
    title_bn: '১০০% খাঁটি কোয়ালিটি',
    subtitle: 'Carefully curated premium fabrics and verified original gadget warranties.',
    subtitle_bn: 'শতভাগ অরিজিনাল ব্র্যান্ড ওয়্যারেন্টি ও প্রিমিয়াম কোয়ালিটি নিশ্চিত।',
    icon: 'shield',
    is_active: true
  },
  {
    id: 'why_2',
    title: 'Super Fast Nationwide Delivery',
    title_bn: 'সারাদেশে দ্রুত হোম ডেলিভারি',
    subtitle: 'Next-day delivery in Dhaka city and 48-72h door-to-door delivery across all 64 districts.',
    subtitle_bn: 'ঢাকায় দ্রুততম ডেলিভারি এবং ৬৪ জেলায় ৪৮-৭২ ঘণ্টার মধ্যে হোম ডেলিভারি।',
    icon: 'truck',
    is_active: true
  },
  {
    id: 'why_3',
    title: '7-Day Easy Exchange',
    title_bn: '৭ দিনে সহজ এক্সচেঞ্জ সুবিধা',
    subtitle: 'Hassle-free size exchange and dedicated 24/7 customer care helpline.',
    subtitle_bn: 'ঝামেলামুক্ত সাইজ এক্সচেঞ্জ ও ২৪/৭ ডেডিকেটেড কাস্টমার হেল্পলাইন।',
    icon: 'rotate-ccw',
    is_active: true
  },
  {
    id: 'why_4',
    title: 'Flexible & Safe Payments',
    title_bn: 'নিরাপদ ও সহজ পেমেন্ট',
    subtitle: 'Cash on Delivery (COD), bKash, Nagad, Visa, Mastercard, and SSLCommerz secured.',
    subtitle_bn: 'ক্যাশ অন ডেলিভারি, বিকাশ, নগদ ও কার্ডে সম্পূর্ণ নিরাপদ পেমেন্ট।',
    icon: 'sparkles',
    is_active: true
  }
];

export const WHY_SHOP_COLOR_PRESETS = [
  {
    id: 'dark',
    name: 'Dark Luxury (Default)',
    name_bn: '🖤 ডার্ক লাক্সারি (ডিফল্ট)',
    bg: '#0F172A',
    title: '#FFFFFF',
    subtitle: '#94A3B8',
    card_bg: 'rgba(30, 41, 59, 0.6)',
    card_border: 'rgba(51, 65, 85, 0.6)',
    card_title: '#FFFFFF',
    card_desc: '#94A3B8',
    icon_bg: 'rgba(245, 158, 11, 0.2)',
    icon_color: '#FBBF24'
  },
  {
    id: 'matcha',
    name: 'Signature Matcha',
    name_bn: '🌿 সিগনেচার মাতচা',
    bg: '#141E15',
    title: '#FFFFFF',
    subtitle: '#A7E864',
    card_bg: 'rgba(24, 38, 26, 0.8)',
    card_border: 'rgba(167, 232, 100, 0.25)',
    card_title: '#FFFFFF',
    card_desc: '#94A3B8',
    icon_bg: 'rgba(167, 232, 100, 0.2)',
    icon_color: '#A7E864'
  },
  {
    id: 'white',
    name: 'Clean White Minimal',
    name_bn: '⚪ ক্লিন হোয়াইট মিনিমাল',
    bg: '#F8FAFC',
    title: '#0F172A',
    subtitle: '#64748B',
    card_bg: '#FFFFFF',
    card_border: '#E2E8F0',
    card_title: '#0F172A',
    card_desc: '#64748B',
    icon_bg: '#FEF3C7',
    icon_color: '#D97706'
  },
  {
    id: 'gold',
    name: 'Royal Amber Gold',
    name_bn: '👑 রয়্যাল গোল্ডেন',
    bg: '#18130B',
    title: '#FEF3C7',
    subtitle: '#D97706',
    card_bg: 'rgba(38, 28, 14, 0.8)',
    card_border: 'rgba(245, 158, 11, 0.3)',
    card_title: '#FFFBEB',
    card_desc: '#D1D5DB',
    icon_bg: '#F59E0B',
    icon_color: '#18130B'
  },
  {
    id: 'navy',
    name: 'Midnight Navy Blue',
    name_bn: '🌌 মিডনাইট নেভি ব্লু',
    bg: '#0A1128',
    title: '#FFFFFF',
    subtitle: '#38BDF8',
    card_bg: '#1C2541',
    card_border: 'rgba(56, 189, 248, 0.3)',
    card_title: '#FFFFFF',
    card_desc: '#94A3B8',
    icon_bg: 'rgba(56, 189, 248, 0.2)',
    icon_color: '#38BDF8'
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    name_bn: '🍃 রয়্যাল এমারেল্ড',
    bg: '#064E3B',
    title: '#ECFDF5',
    subtitle: '#6EE7B7',
    card_bg: '#065F46',
    card_border: 'rgba(110, 231, 183, 0.3)',
    card_title: '#FFFFFF',
    card_desc: '#D1FAE5',
    icon_bg: '#10B981',
    icon_color: '#FFFFFF'
  }
];

export const ANNOUNCEMENT_COLOR_PRESETS = [
  {
    id: 'espresso_orange',
    name: 'Espresso Orange (Matching)',
    name_bn: '☕ এসপ্রেসো অরেঞ্জ (ম্যাচিং)',
    bg: '#2A140A',
    text: '#FFF7ED'
  },
  {
    id: 'dark',
    name: 'Dark Slate',
    name_bn: '🖤 ডার্ক স্লেট',
    bg: '#0F172A',
    text: '#E2E8F0'
  },
  {
    id: 'matcha',
    name: 'Signature Matcha',
    name_bn: '🌿 সিগনেচার মাতচা',
    bg: '#141E15',
    text: '#A7E864'
  },
  {
    id: 'emerald',
    name: 'Royal Emerald Green',
    name_bn: '🌲 রয়্যাল এমারেল্ড',
    bg: '#064E3B',
    text: '#ECFDF5'
  },
  {
    id: 'lime',
    name: 'Vibrant Lime Green',
    name_bn: '🍋 ভাইব্রেন্ট লাইম',
    bg: '#A7E864',
    text: '#0F172A'
  },
  {
    id: 'gold',
    name: 'Amber Gold Festive',
    name_bn: '👑 ফেস্টিভ গোল্ডেন',
    bg: '#78350F',
    text: '#FEF3C7'
  },
  {
    id: 'crimson',
    name: 'Flash Sale Crimson',
    name_bn: '⚡ ফ্ল্যাশ সেল রেড',
    bg: '#881337',
    text: '#FFE4E6'
  },
  {
    id: 'navy',
    name: 'Midnight Navy Blue',
    name_bn: '🌌 মিডনাইট নেভি',
    bg: '#0B192C',
    text: '#F1F5F9'
  },
  {
    id: 'purple',
    name: 'Royal Violet Purple',
    name_bn: '💜 রয়্যাল ভায়োলেট',
    bg: '#4C1D95',
    text: '#EDE9FE'
  },
  {
    id: 'light',
    name: 'Clean Light Slate',
    name_bn: '⚪ ক্লিন লাইট স্লেট',
    bg: '#F1F5F9',
    text: '#0F172A'
  }
];

export interface FooterServiceLinkItem {
  id: string;
  label: string;
  label_bn?: string;
  short_description?: string;
  short_description_bn?: string;
  description_bn?: string;
  description_en?: string;
  page?: string;
  url?: string;
  is_active?: boolean;
}

const SAMPLE_ABOUT_US_BN = `স্বাগতম SHOPHATBD-তে!

SHOPHATBD বাংলাদেশের অন্যতম নির্ভরযোগ্য ও বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য হলো সারা দেশের প্রতিটি প্রান্তে প্রিমিয়াম কোয়ালিটির পণ্য সাশ্রয়ী মূল্যে এবং দ্রুততম সময়ে গ্রাহকের কাছে পৌঁছে দেওয়া।

আমাদের বিশেষত্বসমূহ:
১. ১০০% জেনুইন ও প্রিমিয়াম কোয়ালিটি পণ্য: প্রতিটি পণ্য অভিজ্ঞ টিম দ্বারা কঠোরভাবে মান পরীক্ষা করে ডেলিভারির জন্য প্রস্তুত করা হয়।
২. ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা: পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধের নিশ্চিন্ত সুবিধা।
৩. দ্রুততম দেশব্যাপী ডেলিভারি: ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা এবং সমগ্র বাংলাদেশে সর্বোচ্চ ২-৩ দিনের মধ্যে নিশ্চিত হোম ডেলিভারি।
৪. ৭ দিনের সহজ ও ঝামেলামুক্ত রিপ্লেসমেন্ট: পণ্য প্রাপ্তির পর কোনো সমস্যা বা অসঙ্গতি দেখা দিলে সহজ রিপ্লেসমেন্ট পলিসি।
৫. সার্বক্ষণিক ফ্রেন্ডলি কাস্টমার কেয়ার ও বিক্রয়োত্তর সেবা: যেকোনো সময় আপনার পাশে আমাদের কাস্টমার প্রতিনিধি দল।

গ্রাহকের বিশ্বস্ততা ও সন্তুষ্টিই আমাদের প্রতিটি অর্ডারের মূল প্রেরণা। SHOPHATBD-র সাথে আপনার অনলাইন কেনাকাটা হোক নিরাপদ ও আনন্দদায়ক।`;

const SAMPLE_ABOUT_US_SHORT_BN = `SHOPHATBD হলো বাংলাদেশের বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম, যেখানে প্রিমিয়াম কোয়ালিটি ও সেরা কাস্টমার সেবার নিশ্চয়তা দেওয়া হয়।`;

const SAMPLE_CONTACT_BN = `কাস্টমার সাপোর্ট ও হেল্পলাইন:

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

আমরা প্রতিটি গ্রাহকের মতামত ও মূল্যবান প্রশ্নের দ্রুততম কার্যকর সমাধান দিতে সর্বদা প্রতিশ্রুতিবদ্ধ।`;

const SAMPLE_CONTACT_SHORT_BN = `অর্ডার, ডেলিভারি বা যেকোনো সহায়তার জন্য আমাদের ২৪/৭ ডেডিকেটেড কাস্টমার সাপোর্ট সর্বদা প্রস্তুত।`;

const SAMPLE_NEW_LINK_BN = `গ্রাহক সেবা ও প্রয়োজনীয় তথ্যে আপনাকে স্বাগতম!

এখানে আপনার পেজের পূর্ণাঙ্গ বিবরণ, প্রয়োজনীয় তথ্য বা নীতিমালা বাংলায় সুন্দরভাবে লিখতে পারেন। সর্বোচ্চ ১৫০০ শব্দ পর্যন্ত যেকোনো অনুচ্ছেদ, পয়েন্ট ও তালিকা এখানে সংরক্ষণ করা যাবে।

কী কী তথ্য যুক্ত করতে পারেন:
১. আপনার সার্ভিসের বিশদ পরিচিতি ও নিয়মাবলী
২. গ্রাহকদের জন্য প্রয়োজনীয় সহায়িকা ও নির্দেশাবলী
৩. ডেলিভারি, মূল্য পরিশোধ বা অফার সংক্রান্ত দিকনির্দেশনা
৪. সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর

পরবর্তীতে যেকোনো সময় এই বিবরণটি আপনি এডিট বাটন থেকে নিজের ইচ্ছামতো পরিবর্তন ও হালনাগাদ করতে পারবেন।`;

const SAMPLE_NEW_LINK_SHORT_BN = `গ্রাহকদের জন্য প্রয়োজনীয় তথ্য ও নির্দেশিকার সংক্ষিপ্ত বিবরণ এখানে প্রদর্শিত হবে।`;

const SAMPLE_ABOUT_US_EN = `Welcome to SHOPHATBD!

SHOPHATBD is one of the most reliable and trusted online shopping destinations in Bangladesh. Our mission is to bring premium quality lifestyle and tech products at affordable prices with lightning-fast delivery to every corner of the country.

Why Choose Us:
1. 100% Genuine & Premium Products: Every product is thoroughly inspected and quality-checked by our experienced inspection team before packaging.
2. Cash on Delivery (COD): Nationwide pay-on-delivery convenience so you can inspect your package with complete peace of mind.
3. Rapid Nationwide Delivery: Express delivery within 24–48 hours inside Dhaka city and 2–3 days across all 64 districts in Bangladesh.
4. 7-Day Hassle-Free Exchange: Simple and transparent replacement process in case of sizing or manufacturing defects.
5. Dedicated 24/7 Customer Care: A warm, friendly support team always ready to assist you before and after purchase.

Your trust and satisfaction inspire every single order we package. We wish you a delightful and confident shopping experience with SHOPHATBD!`;

const SAMPLE_ABOUT_US_SHORT_EN = `SHOPHATBD is Bangladesh's premier online shopping destination, guaranteeing 100% authentic quality and attentive customer care.`;

const SAMPLE_CONTACT_EN = `Customer Support & Helpline:

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

We are committed to delivering swift, effective solutions to every valued customer question.`;

const SAMPLE_CONTACT_SHORT_EN = `Our dedicated support team is available 7 days a week to assist you with orders, delivery updates, and all questions.`;

const SAMPLE_NEW_LINK_EN = `Welcome to Customer Support & Guidelines!

Here you can publish detailed information, helpful guides, or specific instructions for our valued customers. You can organize content into sections, bullet points, and numbered lists with up to 1500 words.

Recommended Content:
1. Overview and scope of the service or topic
2. Step-by-step instructions and best practices
3. Delivery, payment, and policy information
4. Frequently asked questions and answers

You can update and refine this description anytime from the admin settings dashboard.`;

const SAMPLE_NEW_LINK_SHORT_EN = `Essential guidelines, overview, and information for our valued shoppers.`;

interface AdminSettingsProps {
  onNavigateTab?: (tab: string) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onNavigateTab }) => {
  const { t, isBn, setLang } = useLanguage();
  const { settings, updateSettings, refreshSettings } = useSettings();

  const [activeTab, setActiveTab] = useState<'branding' | 'header' | 'flash_sale' | 'why_shop' | 'footer' | 'payments' | 'shipping' | 'contact' | 'system' | 'backup'>('branding');
  const [formData, setFormData] = useState<any>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sample logos presets for quick one-click selection
  const sampleLogos = [
    { name: 'SHOPHATBD Gold Luxury', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&auto=format&fit=crop&q=60' },
    { name: 'Minimalist Monogram', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&auto=format&fit=crop&q=60' },
    { name: 'Modern Lifestyle', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&auto=format&fit=crop&q=60' },
  ];

  // Trust badges state parsed from settings or default
  const [trustBadges, setTrustBadges] = useState<Array<{ id: string; title: string; subtitle: string; icon: string }>>([]);
  // Customer service links state parsed from settings or default
  const [serviceLinks, setServiceLinks] = useState<FooterServiceLinkItem[]>([]);
  const [editingLink, setEditingLink] = useState<FooterServiceLinkItem | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkModalTab, setLinkModalTab] = useState<'bn' | 'en'>('bn');
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  // Dynamic Social Media links state
  const [socialLinks, setSocialLinks] = useState<Array<{
    id: string;
    platform: string;
    name: string;
    url: string;
    is_active: boolean;
  }>>([]);

  // Dynamic Policy Hub links state
  const [policyLinks, setPolicyLinks] = useState<PolicyLinkItem[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<PolicyLinkItem | null>(null);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null);

  // Dynamic Why Shop & Homepage Value Highlights state
  const [whyShopFeatures, setWhyShopFeatures] = useState<WhyShopFeatureItem[]>([]);
  const [editingWhyShop, setEditingWhyShop] = useState<WhyShopFeatureItem | null>(null);
  const [isWhyShopModalOpen, setIsWhyShopModalOpen] = useState(false);
  const [whyShopToDelete, setWhyShopToDelete] = useState<string | null>(null);

  // Social Media Modal & Delete state
  const [editingSocial, setEditingSocial] = useState<{
    id: string;
    platform: string;
    name: string;
    url: string;
    is_active: boolean;
  } | null>(null);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [socialToDelete, setSocialToDelete] = useState<string | null>(null);

  // Dynamic Payment Badges state
  const [paymentBadges, setPaymentBadges] = useState<PaymentBadgeItem[]>(DEFAULT_PAYMENT_BADGES);
  const [editingPaymentBadge, setEditingPaymentBadge] = useState<PaymentBadgeItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentBadgeToDelete, setPaymentBadgeToDelete] = useState<string | null>(null);

  // Google SEO & Sitemap state
  const [sitemapModalOpen, setSitemapModalOpen] = useState(false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [copiedSitemapXml, setCopiedSitemapXml] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  // Link & Policy Sharing state
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [copiedAllPolicies, setCopiedAllPolicies] = useState(false);

  // Flash Sale Timer Helpers
  const setQuickFlashDuration = (hoursToAdd: number) => {
    const d = new Date();
    d.setTime(d.getTime() + hoursToAdd * 60 * 60 * 1000);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}T${hours}:${mins}`;
    setFormData((prev: any) => ({ ...prev, flash_sale_end_time: formatted, flash_sale_enabled: '1' }));
  };

  const setQuickTonightMidnight = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}T23:59`;
    setFormData((prev: any) => ({ ...prev, flash_sale_end_time: formatted, flash_sale_enabled: '1' }));
  };

  const getAdminFlashRemaining = () => {
    if (!formData.flash_sale_end_time || !formData.flash_sale_end_time.trim()) return null;
    const target = new Date(formData.flash_sale_end_time).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    if (isNaN(target)) return null;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, isExpired: false };
  };

  useEffect(() => {
    setFormData({ ...settings });

    // Parse trust badges
    if (settings.footer_trust_badges_json) {
      try {
        const parsed = JSON.parse(settings.footer_trust_badges_json);
        if (Array.isArray(parsed)) {
          setTrustBadges(parsed.map((b: any, i: number) => ({ id: b.id || `badge_${i}`, ...b })));
        }
      } catch (e) {
        initDefaultBadges();
      }
    } else {
      initDefaultBadges();
    }

    // Parse footer service links
    if (settings.footer_service_links_json) {
      try {
        const parsed = JSON.parse(settings.footer_service_links_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setServiceLinks(
            parsed.map((l: any, i: number) => ({
              id: l.id || `link_${i}`,
              label: l.label || 'Link',
              label_bn: l.label_bn || l.label || 'লিংক',
              short_description_bn: l.short_description_bn || (l.id === '1' || l.label === 'About Us' ? SAMPLE_ABOUT_US_SHORT_BN : l.id === '2' || l.label === 'Contact & Support' ? SAMPLE_CONTACT_SHORT_BN : ''),
              short_description: l.short_description || '',
              description_bn: l.description_bn || (l.id === '1' || l.label === 'About Us' ? SAMPLE_ABOUT_US_BN : l.id === '2' || l.label === 'Contact & Support' ? SAMPLE_CONTACT_BN : ''),
              description_en: l.description_en || l.description || '',
              page: l.page || (l.id === '1' ? 'about' : l.id === '2' ? 'contact' : `page_${l.id}`),
              url: l.url || '',
              is_active: l.is_active !== false && l.is_active !== 0 && l.is_active !== '0'
            }))
          );
        } else {
          initDefaultLinks();
        }
      } catch (e) {
        initDefaultLinks();
      }
    } else {
      initDefaultLinks();
    }

    // Parse dynamic social media links
    if (settings.footer_social_links_json) {
      try {
        const parsed = JSON.parse(settings.footer_social_links_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSocialLinks(
            parsed.map((s: any, i: number) => ({
              id: s.id || `soc_${i}`,
              platform: s.platform || 'facebook',
              name: s.name || s.platform || 'Social Link',
              url: s.url || '',
              is_active: s.is_active !== false && s.is_active !== 0 && s.is_active !== '0'
            }))
          );
        } else {
          initDefaultSocials(settings);
        }
      } catch (e) {
        initDefaultSocials(settings);
      }
    } else {
      initDefaultSocials(settings);
    }

    // Parse dynamic store policy links
    if (settings.store_policies_json) {
      try {
        const parsed = JSON.parse(settings.store_policies_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPolicyLinks(
            parsed.map((p: any, i: number) => {
              const defaultMatch = DEFAULT_STORE_POLICIES.find(d => d.id === p.id || d.path === p.path);
              return {
                id: p.id || defaultMatch?.id || `pol_${i}`,
                title: p.title || defaultMatch?.title || 'Store Policy',
                title_bn: p.title_bn || p.title || defaultMatch?.title_bn || 'পলিসি',
                path: p.path || defaultMatch?.path || '',
                icon: p.icon || defaultMatch?.icon || 'file-text',
                is_active: p.is_active !== false && p.is_active !== 0 && p.is_active !== '0',
                description_bn: p.description_bn !== undefined ? p.description_bn : (defaultMatch?.description_bn || ''),
                description_en: p.description_en !== undefined ? p.description_en : (defaultMatch?.description_en || '')
              };
            })
          );
        } else {
          setPolicyLinks(DEFAULT_STORE_POLICIES);
        }
      } catch (e) {
        setPolicyLinks(DEFAULT_STORE_POLICIES);
      }
    } else {
      setPolicyLinks(DEFAULT_STORE_POLICIES);
    }

    // Parse Why Shop & Trust Highlight features
    if (settings.why_shop_features_json) {
      try {
        const parsed = JSON.parse(settings.why_shop_features_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWhyShopFeatures(
            parsed.map((f: any, i: number) => ({
              id: f.id || `why_${i}`,
              title: f.title || 'Feature Highlight',
              title_bn: f.title_bn || f.title || 'ফিচার হাইলাইট',
              subtitle: f.subtitle || '',
              subtitle_bn: f.subtitle_bn || f.subtitle || '',
              icon: f.icon || 'shield',
              is_active: f.is_active !== false && f.is_active !== 0 && f.is_active !== '0'
            }))
          );
        } else {
          setWhyShopFeatures(DEFAULT_WHY_SHOP_FEATURES);
        }
      } catch (e) {
        setWhyShopFeatures(DEFAULT_WHY_SHOP_FEATURES);
      }
    } else {
      setWhyShopFeatures(DEFAULT_WHY_SHOP_FEATURES);
    }

    // Parse dynamic footer payment badges
    if (settings.footer_payment_badges_json) {
      try {
        const parsed = JSON.parse(settings.footer_payment_badges_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPaymentBadges(
            parsed.map((b: any, i: number) => ({
              id: b.id || `badge_pm_${i}`,
              type: b.type || 'bkash',
              name: b.name || 'Payment Method',
              name_bn: b.name_bn || b.name || 'পেমেন্ট মেথড',
              logo_url: b.logo_url || '',
              is_active: b.is_active !== false && b.is_active !== 0 && b.is_active !== '0'
            }))
          );
        } else {
          setPaymentBadges(DEFAULT_PAYMENT_BADGES);
        }
      } catch (e) {
        setPaymentBadges(DEFAULT_PAYMENT_BADGES);
      }
    } else {
      setPaymentBadges(DEFAULT_PAYMENT_BADGES);
    }
  }, [settings]);

  const initDefaultBadges = () => {
    setTrustBadges([
      { id: '1', title: '100% Authentic Quality', subtitle: 'Guaranteed 100% Genuine', icon: 'shield' },
      { id: '2', title: 'Fast Home Delivery', subtitle: 'Nationwide Doorstep Delivery', icon: 'truck' },
      { id: '3', title: 'Secure Payments', subtitle: 'COD, bKash, Nagad & Cards', icon: 'card' },
      { id: '4', title: '7 Days Replacement', subtitle: 'Hassle-Free Exchange Policy', icon: 'sparkle' }
    ]);
  };

  const initDefaultLinks = () => {
    setServiceLinks([
      {
        id: '1',
        label: 'About Us',
        label_bn: 'আমাদের সম্পর্কে',
        short_description_bn: SAMPLE_ABOUT_US_SHORT_BN,
        short_description: 'SHOPHATBD is a premier online shopping platform in Bangladesh.',
        description_bn: SAMPLE_ABOUT_US_BN,
        description_en: 'Welcome to SHOPHATBD! We provide authentic premium products nationwide.',
        page: 'about',
        is_active: true
      },
      {
        id: '2',
        label: 'Contact & Support',
        label_bn: 'যোগাযোগ ও সাপোর্ট',
        short_description_bn: SAMPLE_CONTACT_SHORT_BN,
        short_description: 'Our customer support team is available 24/7 for all assistance.',
        description_bn: SAMPLE_CONTACT_BN,
        description_en: 'Customer Support & Helpline: Contact us anytime via phone, WhatsApp or email.',
        page: 'contact',
        is_active: true
      }
    ]);
  };

  const initDefaultSocials = (cur: any) => {
    const list = [
      {
        id: 'soc_fb',
        platform: 'facebook',
        name: 'Facebook Page',
        url: cur.facebook_url || 'https://facebook.com/shophatbdbd',
        is_active: true
      },
      {
        id: 'soc_ig',
        platform: 'instagram',
        name: 'Instagram Profile',
        url: cur.instagram_url || 'https://instagram.com/shophatbdbd',
        is_active: true
      },
      {
        id: 'soc_yt',
        platform: 'youtube',
        name: 'YouTube Channel',
        url: cur.youtube_url || 'https://youtube.com/@shophatbdbd',
        is_active: true
      },
      {
        id: 'soc_wa',
        platform: 'whatsapp',
        name: 'WhatsApp Helpline',
        url: cur.contact_whatsapp || 'https://wa.me/8801700000000',
        is_active: true
      }
    ];
    setSocialLinks(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload: any = {
        ...formData,
        site_name: formData.site_name || formData.site_name_en || 'SHOPHATBD',
        site_name_en: formData.site_name || formData.site_name_en || 'SHOPHATBD',
        site_name_bn: formData.site_name_bn || formData.site_name || 'শপহাটবিডি',
        default_language: formData.default_language || 'en',
        site_tagline_en: formData.site_tagline_en || formData.tagline_en || 'Bangladesh’s Premier Lifestyle & Tech Destination',
        site_tagline_bn: formData.site_tagline_bn || formData.tagline_bn || 'বাংলাদেশের বিশ্বস্ত লাইফস্টাইল ও প্রিমিয়াম গ্যাজেট হাব',
        header_badge_text_en: formData.header_badge_text_en || 'Exclusive Fashion & Tech',
        header_badge_text_bn: formData.header_badge_text_bn || 'প্রিমিয়াম লাইফস্টাইল ও গ্যাজেট',
        announcement_en: formData.announcement_en || formData.announcement_text_en || '⚡ Festive Special: Free Home Delivery on orders above ৳2,500! ⚡',
        announcement_bn: formData.announcement_bn || formData.announcement_text_bn || '⚡ বিশেষ অফার: ২৫০০ টাকার বেশি অর্ডারে ফ্রি হোম ডেলিভারি! ⚡',
        company_address_en: formData.company_address_en || 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh',
        company_address_bn: formData.company_address_bn || formData.company_address_en || 'বাড়ি ৪২, রোড ১১, বনানী, ঢাকা-১২১৩, বাংলাদেশ',
        footer_trust_badges_json: JSON.stringify(trustBadges),
        footer_service_links_json: JSON.stringify(serviceLinks),
        footer_social_links_json: JSON.stringify(socialLinks),
        store_policies_json: JSON.stringify(policyLinks),
        footer_policies_title: formData.footer_policies_title || formData.footer_policies_title_en || 'CUSTOMER SERVICE & POLICIES',
        footer_policies_title_en: formData.footer_policies_title_en || formData.footer_policies_title || 'CUSTOMER SERVICE & POLICIES',
        footer_policies_title_bn: formData.footer_policies_title_bn || 'গ্রাহক সেবা ও পলিসি',
        why_shop_features_json: JSON.stringify(whyShopFeatures),
        footer_payment_badges_json: JSON.stringify(paymentBadges),
        updated_at: new Date().toISOString()
      };

      // Keep legacy individual payment badge flags in sync with badges array
      const bkashBadge = paymentBadges.find(b => b.type === 'bkash');
      if (bkashBadge) payload.show_payment_badge_bkash = bkashBadge.is_active ? 'true' : 'false';
      const nagadBadge = paymentBadges.find(b => b.type === 'nagad');
      if (nagadBadge) payload.show_payment_badge_nagad = nagadBadge.is_active ? 'true' : 'false';
      const cardBadge = paymentBadges.find(b => b.type === 'card');
      if (cardBadge) payload.show_payment_badge_card = cardBadge.is_active ? 'true' : 'false';
      const codBadge = paymentBadges.find(b => b.type === 'cod');
      if (codBadge) payload.show_payment_badge_cod = codBadge.is_active ? 'true' : 'false';

      // Keep legacy individual social fields in sync
      const fb = socialLinks.find(s => s.platform === 'facebook' && s.is_active);
      if (fb) payload.facebook_url = fb.url;
      const ig = socialLinks.find(s => s.platform === 'instagram' && s.is_active);
      if (ig) payload.instagram_url = ig.url;
      const yt = socialLinks.find(s => s.platform === 'youtube' && s.is_active);
      if (yt) payload.youtube_url = yt.url;
      const wa = socialLinks.find(s => s.platform === 'whatsapp' && s.is_active);
      if (wa) payload.contact_whatsapp = wa.url;
      const tt = socialLinks.find(s => s.platform === 'tiktok' && s.is_active);
      if (tt) payload.tiktok_url = tt.url;
      const tw = socialLinks.find(s => (s.platform === 'twitter' || s.platform === 'x') && s.is_active);
      if (tw) payload.twitter_url = tw.url;

      // Synchronize dual SEO keys
      if (payload.meta_title_en) payload.seo_meta_title = payload.meta_title_en;
      if (payload.meta_title_bn) payload.seo_meta_title_bn = payload.meta_title_bn;
      if (payload.meta_description_en) payload.seo_description = payload.meta_description_en;
      if (payload.meta_description_bn) payload.seo_description_bn = payload.meta_description_bn;
      if (payload.meta_keywords) payload.seo_keywords = payload.meta_keywords;
      if (payload.canonical_url) payload.canonical_base_url = payload.canonical_url;

      // Do NOT overwrite tracking settings from Site Settings (managed in AdminAnalytics)
      delete payload.google_analytics_id;
      delete payload.gtm_container_id;
      delete payload.google_ads_conversion_id;
      delete payload.google_ads_purchase_label;
      delete payload.google_ads_add_to_cart_label;
      delete payload.google_ads_begin_checkout_label;
      delete payload.google_ads_lead_label;
      delete payload.google_enhanced_conversions_enabled;
      delete payload.meta_pixel_id;
      delete payload.meta_capi_enabled;
      delete payload.meta_access_token;
      delete payload.meta_test_event_code;
      delete payload.tiktok_pixel_id;

      const res = await updateSettings(payload);
      if (res.success) {
        setSuccessMsg(isBn ? 'ওয়েবসাইটের সেটিংস, সোশ্যাল মিডিয়া ও স্টোর পলিসিসমূহ সফলভাবে সংরক্ষিত হয়েছে!' : 'Website configurations, social media & store policies saved successfully!');
        await refreshSettings();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update site settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Trust badge helpers
  const handleAddBadge = () => {
    setTrustBadges([
      ...trustBadges,
      { id: `b_${Date.now()}`, title: 'New Trust Highlight', subtitle: 'Customer benefit description', icon: 'shield' }
    ]);
  };

  const handleUpdateBadge = (id: string, field: 'title' | 'subtitle', val: string) => {
    setTrustBadges(trustBadges.map((b) => (b.id === id ? { ...b, [field]: val } : b)));
  };

  const handleDeleteBadge = (id: string) => {
    setTrustBadges(trustBadges.filter((b) => b.id !== id));
  };

  // Service link helpers
  const handleOpenAddLink = () => {
    const newId = `l_${Date.now()}`;
    setEditingLink({
      id: newId,
      label: '',
      label_bn: '',
      short_description_bn: SAMPLE_NEW_LINK_SHORT_BN,
      short_description: 'Brief summary of this navigation page or guide.',
      description_bn: SAMPLE_NEW_LINK_BN,
      description_en: 'Detailed guide and customer service information.',
      page: `page_${newId}`,
      url: '',
      is_active: true
    });
    setIsLinkModalOpen(true);
  };

  const handleOpenEditLink = (item: FooterServiceLinkItem) => {
    setEditingLink({
      ...item,
      short_description_bn: item.short_description_bn !== undefined ? item.short_description_bn : (item.id === '1' || item.label === 'About Us' ? SAMPLE_ABOUT_US_SHORT_BN : item.id === '2' || item.label === 'Contact & Support' ? SAMPLE_CONTACT_SHORT_BN : SAMPLE_NEW_LINK_SHORT_BN),
      description_bn: item.description_bn !== undefined ? item.description_bn : (item.id === '1' || item.label === 'About Us' ? SAMPLE_ABOUT_US_BN : item.id === '2' || item.label === 'Contact & Support' ? SAMPLE_CONTACT_BN : SAMPLE_NEW_LINK_BN)
    });
    setIsLinkModalOpen(true);
  };

  const handleSaveLinkItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingLink) return;

    const trimmedLabel = (editingLink.label || '').trim();
    const trimmedLabelBn = (editingLink.label_bn || '').trim();

    if (!trimmedLabel && !trimmedLabelBn) {
      alert(isBn ? 'অনুগ্রহ করে লিংকের শিরোনাম লিখুন।' : 'Please enter a link title.');
      return;
    }

    const finalItem: FooterServiceLinkItem = {
      ...editingLink,
      label: trimmedLabel || trimmedLabelBn,
      label_bn: trimmedLabelBn || trimmedLabel,
      short_description_bn: (editingLink.short_description_bn || '').trim(),
      short_description: (editingLink.short_description || '').trim(),
      description_bn: (editingLink.description_bn || '').trim(),
      description_en: (editingLink.description_en || '').trim(),
      page: editingLink.page || (editingLink.id === '1' ? 'about' : editingLink.id === '2' ? 'contact' : `page_${editingLink.id}`),
      url: editingLink.url || '',
      is_active: editingLink.is_active !== false
    };

    const exists = serviceLinks.some((l) => l.id === finalItem.id);
    if (exists) {
      setServiceLinks(serviceLinks.map((l) => (l.id === finalItem.id ? finalItem : l)));
    } else {
      setServiceLinks([...serviceLinks, finalItem]);
    }

    setIsLinkModalOpen(false);
    setEditingLink(null);
  };

  const handleAddLink = () => {
    handleOpenAddLink();
  };

  const handleUpdateLink = (id: string, field: 'label' | 'label_bn' | 'page' | 'url' | 'is_active', val: any) => {
    setServiceLinks(serviceLinks.map((l) => (l.id === id ? { ...l, [field]: val } : l)));
  };

  const handleDeleteLink = (id: string) => {
    setServiceLinks(serviceLinks.filter((l) => l.id !== id));
  };

  const handleConfirmDeleteLink = () => {
    if (linkToDelete) {
      setServiceLinks(serviceLinks.filter((l) => l.id !== linkToDelete));
      setLinkToDelete(null);
    }
  };

  // Policy Hub Helpers
  const getPolicyIconComponent = () => {
    return FileText;
  };

  const getFullPageUrl = (pageKey: string, customUrl?: string) => {
    if (pageKey === 'custom' && customUrl) return customUrl;
    if (pageKey.startsWith('http://') || pageKey.startsWith('https://')) return pageKey;
    const origin = (formData.canonical_url || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');
    const cleanPath = pageKey.replace(/^#/, '').replace(/^\//, '');
    return `${origin}/#${cleanPath}`;
  };

  const handleCopyLinkUrl = (url: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLinkId(id);
      setTimeout(() => setCopiedLinkId(null), 2500);
    }
  };

  const handleShareWhatsApp = (title: string, url: string) => {
    const text = encodeURIComponent(`${title} - ${formData.site_name || 'SHOPHATBD'}:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareFacebook = (url: string) => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handleCopyAllPolicyLinks = () => {
    const origin = (formData.canonical_url || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');
    const activePolicies = policyLinks.filter(p => p.is_active !== false);
    const targetList = activePolicies.length > 0 ? activePolicies : policyLinks;
    const text = targetList.map(p => {
      const full = getFullPageUrl(p.path);
      return `• ${isBn ? p.title_bn : p.title} (${p.title}):\n  ${full}`;
    }).join('\n\n');

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedAllPolicies(true);
      setTimeout(() => setCopiedAllPolicies(false), 3000);
    }
  };

  // Policy Modal & CRUD handlers
  const handleOpenAddPolicy = () => {
    setEditingPolicy({
      id: `pol_${Date.now()}`,
      title: '',
      title_bn: '',
      path: '',
      icon: 'file-text',
      is_active: true,
      description_bn: '',
      description_en: ''
    });
    setIsPolicyModalOpen(true);
  };

  const handleOpenEditPolicy = (item: PolicyLinkItem) => {
    setEditingPolicy({ ...item });
    setIsPolicyModalOpen(true);
  };

  const handleSavePolicyItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingPolicy) return;

    const trimmedTitle = (editingPolicy.title || '').trim();
    const trimmedTitleBn = (editingPolicy.title_bn || '').trim();
    const trimmedPath = (editingPolicy.path || '').trim();

    if (!trimmedTitle && !trimmedTitleBn) {
      alert(isBn ? 'অনুগ্রহ করে পলিসির শিরোনাম প্রদান করুন।' : 'Please provide policy title.');
      return;
    }
    if (!trimmedPath) {
      alert(isBn ? 'অনুগ্রহ করে পেজ রুট / URL পাথ প্রদান করুন।' : 'Please provide page route or URL path.');
      return;
    }

    const wordsBn = countWords(editingPolicy.description_bn);
    const wordsEn = countWords(editingPolicy.description_en);

    if (wordsBn > 1000) {
      alert(isBn ? `বাংলা পলিসি বিবরণ ১০০০ শব্দের বেশি হয়েছে (${wordsBn} শব্দ)। অনুগ্রহ করে ১০০০ শব্দের মধ্যে রাখুন।` : `Bangla description exceeds 1000 words (${wordsBn} words). Please keep within 1000 words.`);
      return;
    }

    if (wordsEn > 1000) {
      alert(isBn ? `ইংরেজি পলিসি বিবরণ ১০০০ শব্দের বেশি হয়েছে (${wordsEn} শব্দ)। অনুগ্রহ করে ১০০০ শব্দের মধ্যে রাখুন।` : `English description exceeds 1000 words (${wordsEn} words). Please keep within 1000 words.`);
      return;
    }

    const updatedItem: PolicyLinkItem = {
      ...editingPolicy,
      title: trimmedTitle || trimmedTitleBn || 'Store Policy',
      title_bn: trimmedTitleBn || trimmedTitle || 'স্টোর পলিসি',
      path: trimmedPath,
      icon: editingPolicy.icon || 'file-text',
      is_active: editingPolicy.is_active !== false,
      description_bn: (editingPolicy.description_bn || '').trim(),
      description_en: (editingPolicy.description_en || '').trim()
    };

    const existingIndex = policyLinks.findIndex(p => p.id === updatedItem.id);
    if (existingIndex >= 0) {
      const updated = [...policyLinks];
      updated[existingIndex] = updatedItem;
      setPolicyLinks(updated);
    } else {
      setPolicyLinks([...policyLinks, updatedItem]);
    }

    setIsPolicyModalOpen(false);
    setEditingPolicy(null);
  };

  const handleDeletePolicy = (id: string) => {
    setPolicyLinks(policyLinks.filter(p => p.id !== id));
    setPolicyToDelete(null);
  };

  const handleTogglePolicyActive = (id: string) => {
    setPolicyLinks(policyLinks.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p));
  };

  const handleResetDefaultPolicies = () => {
    if (window.confirm(isBn ? 'আপনি কি নিশ্চিত যে সকল পলিসি লিংক ডিফল্ট সেটিংসে ফিরিয়ে আনতে চান?' : 'Are you sure you want to reset all store policy links to default?')) {
      setPolicyLinks(DEFAULT_STORE_POLICIES);
    }
  };

  // Social Media Link helpers
  const handleOpenAddSocial = (presetPlatform: string = 'facebook') => {
    const preset = SOCIAL_PLATFORM_OPTIONS.find(p => p.id === presetPlatform) || SOCIAL_PLATFORM_OPTIONS[0];
    setEditingSocial({
      id: `soc_${Date.now()}`,
      platform: preset.id,
      name: preset.defaultName,
      url: '',
      is_active: true
    });
    setIsSocialModalOpen(true);
  };

  const handleOpenEditSocial = (item: any) => {
    setEditingSocial({ ...item });
    setIsSocialModalOpen(true);
  };

  const handleSaveSocialItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingSocial) return;

    const trimmedUrl = (editingSocial.url || '').trim();
    const trimmedName = (editingSocial.name || '').trim();
    if (!trimmedUrl) {
      alert('অনুগ্রহ করে সোশ্যাল মিডিয়ার সঠিক লিংক / URL প্রদান করুন।');
      return;
    }

    const updatedItem = {
      ...editingSocial,
      name: trimmedName || editingSocial.platform,
      url: trimmedUrl,
      is_active: editingSocial.is_active !== false
    };

    const existingIndex = socialLinks.findIndex(s => s.id === updatedItem.id);
    if (existingIndex >= 0) {
      const updated = [...socialLinks];
      updated[existingIndex] = updatedItem;
      setSocialLinks(updated);
    } else {
      setSocialLinks([...socialLinks, updatedItem]);
    }

    setIsSocialModalOpen(false);
    setEditingSocial(null);
  };

  const handleDeleteSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter(s => s.id !== id));
    setSocialToDelete(null);
  };

  const handleToggleSocialActive = (id: string) => {
    setSocialLinks(socialLinks.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
  };

  const handleQuickUpdateSocialUrl = (id: string, newUrl: string) => {
    setSocialLinks(socialLinks.map(s => s.id === id ? { ...s, url: newUrl } : s));
  };

  // Why Shop & Trust Highlights helpers
  const getWhyShopIconComponent = (iconId?: string) => {
    const match = WHY_SHOP_ICON_OPTIONS.find((p) => p.id === iconId);
    return match ? match.icon : ShieldCheck;
  };

  const handleOpenAddWhyShop = () => {
    setEditingWhyShop({
      id: `why_${Date.now()}`,
      title: '',
      title_bn: '',
      subtitle: '',
      subtitle_bn: '',
      icon: 'shield',
      is_active: true
    });
    setIsWhyShopModalOpen(true);
  };

  const handleOpenEditWhyShop = (item: WhyShopFeatureItem) => {
    setEditingWhyShop({ ...item });
    setIsWhyShopModalOpen(true);
  };

  const handleSaveWhyShopItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingWhyShop) return;

    const trimmedTitle = (editingWhyShop.title || '').trim();
    const trimmedTitleBn = (editingWhyShop.title_bn || '').trim();
    const trimmedSub = (editingWhyShop.subtitle || '').trim();
    const trimmedSubBn = (editingWhyShop.subtitle_bn || '').trim();

    if (!trimmedTitle && !trimmedTitleBn) {
      alert(isBn ? 'অনুগ্রহ করে ফিচারের শিরোনাম প্রদান করুন।' : 'Please provide feature title.');
      return;
    }

    const updatedItem: WhyShopFeatureItem = {
      ...editingWhyShop,
      title: trimmedTitle || trimmedTitleBn || 'Feature Highlight',
      title_bn: trimmedTitleBn || trimmedTitle || '',
      subtitle: trimmedSub || trimmedSubBn || '',
      subtitle_bn: trimmedSubBn || trimmedSub || '',
      icon: editingWhyShop.icon || 'shield',
      is_active: editingWhyShop.is_active !== false
    };

    const existingIndex = whyShopFeatures.findIndex((f) => f.id === updatedItem.id);
    if (existingIndex >= 0) {
      const updated = [...whyShopFeatures];
      updated[existingIndex] = updatedItem;
      setWhyShopFeatures(updated);
    } else {
      setWhyShopFeatures([...whyShopFeatures, updatedItem]);
    }

    setIsWhyShopModalOpen(false);
    setEditingWhyShop(null);
  };

  const handleDeleteWhyShop = (id: string) => {
    setWhyShopFeatures(whyShopFeatures.filter((f) => f.id !== id));
    setWhyShopToDelete(null);
  };

  const handleToggleWhyShopActive = (id: string) => {
    setWhyShopFeatures(
      whyShopFeatures.map((f) => (f.id === id ? { ...f, is_active: !f.is_active } : f))
    );
  };

  const handleMoveWhyShop = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === whyShopFeatures.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...whyShopFeatures];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setWhyShopFeatures(updated);
  };

  const handleResetDefaultWhyShop = () => {
    if (window.confirm(isBn ? 'আপনি কি নিশ্চিত যে সকল ফিচার ডিফল্ট সেটিংসে ফিরিয়ে আনতে চান?' : 'Are you sure you want to reset all features to default?')) {
      setWhyShopFeatures(DEFAULT_WHY_SHOP_FEATURES);
    }
  };

  const handleApplyWhyShopColorPreset = (presetId: string) => {
    const preset = WHY_SHOP_COLOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setFormData({
      ...formData,
      why_shop_bg_color: preset.bg,
      why_shop_title_color: preset.title,
      why_shop_subtitle_color: preset.subtitle,
      why_shop_card_bg: preset.card_bg,
      why_shop_card_border: preset.card_border,
      why_shop_card_title_color: preset.card_title,
      why_shop_card_desc_color: preset.card_desc,
      why_shop_icon_bg: preset.icon_bg,
      why_shop_icon_color: preset.icon_color
    });
  };

  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      tabsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleMovePolicyLink = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === policyLinks.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...policyLinks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPolicyLinks(updated);
  };

  const handleRenamePolicyTitle = (id: string, newTitle: string) => {
    const hasBengali = /[\u0980-\u09FF]/.test(newTitle);
    setPolicyLinks((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (hasBengali || isBn) {
          return {
            ...p,
            title_bn: newTitle,
            title: !p.title || p.title === p.title_bn ? newTitle : p.title
          };
        } else {
          return {
            ...p,
            title: newTitle,
            title_bn: !p.title_bn || p.title_bn === p.title ? newTitle : p.title_bn
          };
        }
      })
    );
  };

  const handleMoveTrustBadge = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === trustBadges.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...trustBadges];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setTrustBadges(updated);
  };

  const handleMoveServiceLink = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === serviceLinks.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...serviceLinks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setServiceLinks(updated);
  };

  const handleMoveSocialLink = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === socialLinks.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...socialLinks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSocialLinks(updated);
  };

  // Payment Badge Management Handlers
  const handleOpenAddPaymentBadge = () => {
    setEditingPaymentBadge({
      id: `pm_${Date.now()}`,
      type: 'bkash',
      name: 'bKash',
      name_bn: 'বিকাশ',
      logo_url: '',
      is_active: true
    });
    setIsPaymentModalOpen(true);
  };

  const handleOpenEditPaymentBadge = (item: PaymentBadgeItem) => {
    setEditingPaymentBadge({ ...item });
    setIsPaymentModalOpen(true);
  };

  const handleSavePaymentBadgeItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingPaymentBadge) return;

    const trimmedName = (editingPaymentBadge.name || '').trim();
    const trimmedNameBn = (editingPaymentBadge.name_bn || '').trim();

    if (!trimmedName && !trimmedNameBn) {
      alert(isBn ? 'অনুগ্রহ করে পেমেন্ট মেথডের নাম লিখুন।' : 'Please enter payment method name.');
      return;
    }

    const finalItem: PaymentBadgeItem = {
      ...editingPaymentBadge,
      name: trimmedName || trimmedNameBn,
      name_bn: trimmedNameBn || trimmedName,
      is_active: editingPaymentBadge.is_active !== false
    };

    const exists = paymentBadges.some((b) => b.id === finalItem.id);
    if (exists) {
      setPaymentBadges(paymentBadges.map((b) => (b.id === finalItem.id ? finalItem : b)));
    } else {
      setPaymentBadges([...paymentBadges, finalItem]);
    }

    setIsPaymentModalOpen(false);
    setEditingPaymentBadge(null);
  };

  const handleDeletePaymentBadge = (id: string) => {
    setPaymentBadges(paymentBadges.filter((b) => b.id !== id));
    setPaymentBadgeToDelete(null);
  };

  const handleTogglePaymentBadgeActive = (id: string) => {
    setPaymentBadges(
      paymentBadges.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b))
    );
  };

  const handleMovePaymentBadge = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === paymentBadges.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...paymentBadges];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPaymentBadges(updated);
  };

  const handleResetDefaultPaymentBadges = () => {
    if (window.confirm(isBn ? 'আপনি কি নিশ্চিত যে সকল পেমেন্ট মেথড ব্যাজ ডিফল্ট ৪টি ব্যাজে ফিরিয়ে আনতে চান?' : 'Are you sure you want to reset payment badges to default 4 methods?')) {
      setPaymentBadges(DEFAULT_PAYMENT_BADGES);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-[#1E222B] border border-[#2C323F] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              {isBn ? 'সাইট সেটিংস ও কাস্টমাইজেশন স্টুডিও' : 'Site Settings & Customization Studio'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isBn
              ? 'লোগো পরিবর্তন, হেডার, ফুটার, ডেলিভারি চার্জ, পেমেন্ট ব্যাজ, যোগাযোগের তথ্য এবং স্টোরের ডিজাইন পরিবর্তন করুন।'
              : 'Change logo, edit header, footer, delivery rates, payment badges, contact details, and complete store styling.'}
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-2 text-xs self-start sm:self-auto shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>
            {isBn
              ? (isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সব পরিবর্তন সংরক্ষণ করুন')
              : (isSaving ? 'Saving Changes...' : 'Save All Changes')}
          </span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Settings Navigation Tabs with Smooth Horizontal Scroll */}
      <div className="relative group/tabs flex items-center border-b border-slate-800 pb-1">
        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={() => scrollTabs('left')}
          className="p-1.5 rounded-lg bg-[#14171E] border border-[#2C323F] text-slate-400 hover:text-amber-400 hover:bg-[#252A36] transition-all shrink-0 mr-1.5 hidden sm:flex items-center justify-center shadow-xs"
          title={isBn ? "আগের অপশনগুলো দেখুন" : "Scroll Left"}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Tabs List */}
        <div
          ref={tabsScrollRef}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full text-xs font-semibold text-slate-400 py-0.5 select-none"
        >
          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'branding'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isBn ? 'লোগো ও ব্র্যান্ডিং' : 'Logo & Branding'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('header')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'header'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>{isBn ? 'হেডার ও টপ বার' : 'Header & Top Bar'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flash_sale')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'flash_sale'
                ? 'bg-rose-500 text-white font-bold shadow-sm'
                : 'hover:text-white hover:bg-slate-800/60 text-rose-300'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-300 fill-current" />
            <span>{isBn ? 'ফ্ল্যাশ সেল ও টাইমার' : 'Flash Sale & Timer'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('why_shop')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'why_shop'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isBn ? 'হোমপেজ ট্রাস্ট ও ফিচার্স' : 'Why Choose Us / Badges'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('footer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'footer'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>{isBn ? 'ফুটার ও পলিসি হাব' : 'Footer & Policy Hub'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'shipping'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{isBn ? 'ডেলিভারি চার্জ' : 'Delivery Rates'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'payments'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{isBn ? 'পেমেন্ট গেটওয়ে' : 'Payment Gateways'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'contact'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>{isBn ? 'যোগাযোগ ও সোশ্যাল' : 'Contact & Socials'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'system'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{isBn ? 'জেনারেল ও এসইও' : 'General & SEO'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'backup'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{isBn ? 'ডেটা এক্সপোর্ট' : 'Data Export'}</span>
          </button>
        </div>

        {/* Scroll Right Button */}
        <button
          type="button"
          onClick={() => scrollTabs('right')}
          className="p-1.5 rounded-lg bg-[#14171E] border border-[#2C323F] text-slate-400 hover:text-amber-400 hover:bg-[#252A36] transition-all shrink-0 ml-1.5 hidden sm:flex items-center justify-center shadow-xs"
          title={isBn ? "পরের অপশনগুলো দেখুন" : "Scroll Right"}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* ========================================================================= */}
        {/* TAB 1: LOGO & BRANDING */}
        {/* ========================================================================= */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            {/* Logo Configuration Card */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#2C323F] pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>{isBn ? 'স্টোরফ্রন্ট ব্র্যান্ড লোগো ও ভিজ্যুয়াল আইডেন্টিটি' : 'Storefront Logo & Visual Identity'}</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isBn
                      ? 'আপনার কাস্টম ব্র্যান্ড লোগো ইমেজ ইউআরএল, ডিসপ্লে স্টাইল এবং উচ্চতা নির্ধারণ করুন।'
                      : 'Upload or specify your custom brand logo image URL, display style, and dimensions.'}
                  </p>
                </div>

                {formData.logo_url && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logo_url: '' })}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium text-[11px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isBn ? 'লোগো সরান' : 'Remove Logo'}</span>
                  </button>
                )}
              </div>

              {/* Live Logo Preview Box */}
              <div className="p-4 bg-[#14171E] border border-[#2C323F] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center p-2 shrink-0">
                    {formData.logo_url ? (
                      <img
                        src={formData.logo_url}
                        alt="Logo Preview"
                        style={{ maxHeight: `${formData.logo_height || 42}px` }}
                        className="w-auto object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/120x40/amber/white?text=LOGO';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {formData.site_name || formData.site_name_en || 'SHOPHATBD'}
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-semibold">
                        {formData.logo_url
                          ? (isBn ? 'কাস্টম লোগো সক্রিয়' : 'Custom Logo Active')
                          : (isBn ? 'ডিফল্ট আইকন ব্যাজ' : 'Default Icon Badge')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isBn
                        ? formData.site_tagline_bn || formData.tagline_bn || 'বাংলাদেশের বিশ্বস্ত লাইফস্টাইল ও প্রিমিয়াম গ্যাজেট হাব'
                        : formData.site_tagline_en || formData.tagline_en || 'Premium Lifestyle & Modern Gadget Destination'}
                    </p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  <span>{isBn ? 'প্রদর্শনের উচ্চতা: ' : 'Display Height: '}</span>
                  <span className="text-amber-400 font-bold">{formData.logo_height || 42}px</span>
                </div>
              </div>

              {/* Logo Upload / URL Component */}
              <div className="space-y-3">
                <ImageUploadField
                  label={isBn ? 'স্টোরফ্রন্ট ব্র্যান্ড লোগো' : 'Storefront Brand Logo'}
                  value={formData.logo_url || ''}
                  onChange={(url) => setFormData({ ...formData, logo_url: url })}
                  placeholder="https://example.com/your-brand-logo.png"
                  helpText={
                    isBn
                      ? 'লোগো হেডারে ক্রিস্প ও শার্প দেখাতে ২৫০×৮০ থেকে ২৫০×১৫০ px (হরাইজন্টাল) বা ১৬০×১৬০ px (স্কয়ার) সাইজের স্বচ্ছ PNG/SVG আপলোড করুন।'
                      : 'Upload transparent PNG/SVG logo. Recommended: 250×80 to 250×150 px (Horizontal) or 160×160 px (Square).'
                  }
                  recommendedSize={
                    isBn
                      ? 'হরাইজন্টাল: ২৫০ × ১০০ বা ২৫০ × ১৫০ px | স্কয়ার: ১৬০ × ১৬০ px (স্বচ্ছ PNG/SVG/WebP)'
                      : 'Horizontal: 250 × 100 to 250 × 150 px | Square: 160 × 160 px (Transparent PNG/SVG/WebP)'
                  }
                />
              </div>

              {/* Preset Sample Logos for Fast Demonstration */}
              <div className="space-y-2">
                <label className="text-slate-400 font-medium block text-[11px]">
                  {isBn ? 'নমুনা লোগো প্রিসেট (ক্লিক করে প্রয়োগ করুন):' : 'Quick Presets (Click to apply sample logo):'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {sampleLogos.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, logo_url: s.url })}
                      className="p-2 bg-[#14171E] hover:bg-[#181C25] border border-[#2C323F] hover:border-amber-500/50 rounded-xl flex items-center gap-2.5 text-left transition-colors"
                    >
                      <img src={s.url} alt={s.name} className="w-8 h-8 rounded object-cover" />
                      <span className="text-[11px] text-slate-300 truncate font-medium">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Display Mode & Height */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#2C323F]">
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5">
                    {isBn ? 'লোগো প্রদর্শন মোড' : 'Logo Display Mode'}
                  </label>
                  <select
                    value={formData.logo_type || 'both'}
                    onChange={(e) => setFormData({ ...formData, logo_type: e.target.value })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="both">{isBn ? 'লোগো ছবি ও স্টোরের নাম উভয়ই' : 'Both Logo Image & Store Name'}</option>
                    <option value="image">{isBn ? 'শুধু লোগো ছবি' : 'Logo Image Only'}</option>
                    <option value="text">{isBn ? 'শুধু স্টোরের নাম' : 'Store Name Text Only'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1.5">
                    {isBn ? 'লোগো প্রদর্শন উচ্চতা (px)' : 'Logo Display Height (px)'}
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="100"
                    value={formData.logo_height || 42}
                    onChange={(e) => setFormData({ ...formData, logo_height: e.target.value })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Store Name & Taglines */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[#2C323F] pb-3">
                {isBn ? 'স্টোরের নাম ও ট্যাগলাইন স্লোগান' : 'Store Name & Tagline Slogan'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Store Name: English (Left) vs Bangla (Right) */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'স্টোরের নাম (ইংরেজি) *' : 'Store Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.site_name || formData.site_name_en || ''}
                    onChange={(e) => setFormData({ ...formData, site_name: e.target.value, site_name_en: e.target.value })}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'স্টোরের নাম (বাংলা)' : 'Store Name (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.site_name_bn || ''}
                    onChange={(e) => setFormData({ ...formData, site_name_bn: e.target.value })}
                    placeholder="শপহাটবিডি"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 2. Tagline Slogan: English (Left) vs Bangla (Right) */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'ট্যাগলাইন স্লোগান (ইংরেজি)' : 'Tagline Slogan (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.site_tagline_en || formData.tagline_en || ''}
                    onChange={(e) => setFormData({ ...formData, site_tagline_en: e.target.value, tagline_en: e.target.value })}
                    placeholder="Premium Lifestyle & Modern Gadget Destination"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'ট্যাগলাইন স্লোগান (বাংলা)' : 'Tagline Slogan (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.site_tagline_bn || formData.tagline_bn || ''}
                    onChange={(e) => setFormData({ ...formData, site_tagline_bn: e.target.value, tagline_bn: e.target.value })}
                    placeholder="বাংলাদেশের বিশ্বস্ত লাইফস্টাইল ও প্রিমিয়াম গ্যাজেট হাব"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 3. Default Store Language & Language Switcher Control */}
                <div className="md:col-span-2 pt-4 border-t border-[#2C323F]/80">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#14171E] border border-[#2C323F] p-4 sm:p-5 rounded-2xl shadow-inner">
                    <div className="space-y-1.5 max-w-xl">
                      <label className="text-amber-400 font-bold text-sm sm:text-base flex items-center gap-2">
                        <span className="text-lg">🌐</span>
                        <span>{isBn ? 'স্টোরের প্রাথমিক/ডিফল্ট ভাষা (Primary Store Language)' : 'Primary Store Language (Audience Default)'}</span>
                      </label>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {isBn
                          ? 'ওয়েবসাইটের সাধারণ ডিফল্ট ভাষা ইংরেজি। আপনি এখান থেকে যে ভাষা নির্বাচন করে সেভ করবেন, আপনার সব অডিয়েন্স ও ভিজিটররা সাইটে প্রবেশ করলে স্বয়ংক্রিয়ভাবে সেই ভাষায় পুরো ওয়েবসাইটটি দেখতে পাবেন।'
                          : 'The website default language is English. Whichever language you select and save here will be the default language your audience and visitors see when visiting your website.'}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-xs text-amber-300 font-semibold">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>
                          {isBn
                            ? `বর্তমানে স্টোরের ভাষা: ${(formData.default_language || 'en') === 'bn' ? 'বাংলা (Bangla)' : 'English (ইংরেজি - ডিফল্ট)'}`
                            : `Active Store Language: ${(formData.default_language || 'en') === 'bn' ? 'Bangla (বাংলা)' : 'English (Default)'}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                      {/* Language Selection Buttons */}
                      <div className="flex items-center bg-[#1E222B] border border-[#2C323F] rounded-xl p-1 shadow-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, default_language: 'en' });
                          }}
                          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            (formData.default_language || 'en') === 'en'
                              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>🇬🇧</span>
                          <span>English (Default)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, default_language: 'bn' });
                          }}
                          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            formData.default_language === 'bn'
                              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>🇧🇩</span>
                          <span>বাংলা (Bangla)</span>
                        </button>
                      </div>

                      {/* Quick Save & Apply Button */}
                      <button
                        type="button"
                        onClick={async () => {
                          const chosenLang = formData.default_language || 'en';
                          setIsSaving(true);
                          try {
                            const res = await updateSettings({
                              ...formData,
                              default_language: chosenLang,
                            });
                            if (res.success) {
                              setLang(chosenLang);
                              setSuccessMsg(
                                isBn
                                  ? `স্টোরের ভাষা সফলভাবে "${chosenLang === 'bn' ? 'বাংলা' : 'English'}" হিসেবে সেভ করা হয়েছে! এখন অডিয়েন্সরা এই ভাষায় সাইট দেখতে পাবে।`
                                  : `Store language successfully saved to "${chosenLang === 'bn' ? 'Bangla' : 'English'}"! Your audience will now see the website in this language.`
                              );
                              setTimeout(() => setSuccessMsg(''), 4000);
                            }
                          } catch (err: any) {
                            setErrorMsg(err.message || 'Failed to update store language');
                          } finally {
                            setIsSaving(false);
                          }
                        }}
                        disabled={isSaving}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <span>✓</span>
                        <span>{isBn ? 'সেভ ও অ্যাপ্লাই করুন' : 'Save & Apply Now'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: HEADER & TOP BAR */}
        {/* ========================================================================= */}
        {activeTab === 'header' && (
          <div className="space-y-6">
            {/* Total Website Background Color Customizer */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2C323F] pb-3.5 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span>{isBn ? 'টোটাল ওয়েবসাইটের ব্যাকগ্রাউন্ড কালার কাস্টমাইজেশন' : 'Total Website Background Color Customizer'}</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isBn
                      ? 'সম্পূর্ণ ওয়েবসাইটের (হোমপেজ, ক্যাটাগরি, প্রোডাক্ট পেজ, চেকআউট, পলিসি ইত্যাদি সকল পেজ) মূল বডি ব্যাকগ্রাউন্ড কালার পরিবর্তন করুন।'
                      : 'Customize the overall body and canvas background color across your entire website.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, site_bg_color: '#F8F9FA' })}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 bg-[#14171E] hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                    title={isBn ? 'ডিফল্ট লাইট ব্যাকগ্রাউন্ডে ফিরে যান (#F8F9FA)' : 'Reset to Default (#F8F9FA)'}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isBn ? 'ডিফল্ট রিসেট (#F8F9FA)' : 'Reset to Default'}</span>
                  </button>
                </div>
              </div>

              {/* Live Preview Box */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  {isBn ? 'ওয়েবসাইট ব্যাকগ্রাউন্ড লাইভ প্রিভিউ:' : 'Website Background Live Preview:'}
                </span>
                <div
                  style={{ backgroundColor: formData.site_bg_color || '#F8F9FA' }}
                  className="p-4 rounded-xl border border-slate-600/50 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/90 border border-slate-300 flex items-center justify-center text-slate-900 font-bold shadow-xs">
                      🌐
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {isBn ? 'ওয়েবসাইটের বর্তমান ব্যাকগ্রাউন্ড ক্যানভাস' : 'Current Website Background Canvas'}
                      </p>
                      <p className="text-[11px] text-slate-600 font-mono">
                        {isBn ? 'কালার কোড:' : 'HEX Code:'} <span className="font-bold text-slate-900">{formData.site_bg_color || '#F8F9FA'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Sample Mock Store Card Preview */}
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xs border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800">
                      {isBn ? 'স্টোর কনটেন্ট কার্ড প্রিভিউ' : 'Store Content Card'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick One-Click Preset Buttons */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  {isBn ? '⚡ এক ক্লিকে ব্যাকগ্রাউন্ড কালার নির্বাচন করুন (বাটুন সমূহ):' : '⚡ One-Click Background Color Buttons:'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    {
                      name_bn: 'ডিফল্ট লাইট স্লেট',
                      name_en: 'Default Light Slate',
                      hex: '#F8F9FA',
                      sub: isBn ? 'আসল ডিফল্ট কালার' : 'Original Default'
                    },
                    {
                      name_bn: 'পিওর ক্লিন হোয়াইট',
                      name_en: 'Pure Clean White',
                      hex: '#FFFFFF',
                      sub: '#FFFFFF'
                    },
                    {
                      name_bn: 'সফট আইভরি / ক্রিম',
                      name_en: 'Soft Ivory Cream',
                      hex: '#FAFAF9',
                      sub: '#FAFAF9'
                    },
                    {
                      name_bn: 'কুল গ্রে পার্চমেন্ট',
                      name_en: 'Cool Slate White',
                      hex: '#F1F5F9',
                      sub: '#F1F5F9'
                    },
                    {
                      name_bn: 'ওয়ার্ম স্যান্ড বেইজ',
                      name_en: 'Warm Sand Beige',
                      hex: '#FDFBF7',
                      sub: '#FDFBF7'
                    },
                    {
                      name_bn: 'সফট মিন্ট ফ্রেশ',
                      name_en: 'Soft Fresh Mint',
                      hex: '#F0FDF4',
                      sub: '#F0FDF4'
                    },
                    {
                      name_bn: 'সফট স্কাই লাইট',
                      name_en: 'Soft Sky Mist',
                      hex: '#F0F9FF',
                      sub: '#F0F9FF'
                    },
                    {
                      name_bn: 'এলিগ্যান্ট চারকোল ডার্ক',
                      name_en: 'Midnight Slate Dark',
                      hex: '#0F172A',
                      sub: '#0F172A'
                    }
                  ].map((preset) => {
                    const isSelected = (formData.site_bg_color || '#F8F9FA').toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setFormData({ ...formData, site_bg_color: preset.hex })}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all group ${
                          isSelected
                            ? 'border-amber-500 bg-[#252A36] ring-1 ring-amber-500/50 shadow-xs'
                            : 'border-slate-700/80 bg-[#14171E] hover:bg-[#202530] hover:border-slate-600'
                        }`}
                      >
                        <div
                          style={{ backgroundColor: preset.hex }}
                          className="w-6 h-6 rounded-lg border border-black/20 shrink-0 shadow-2xs flex items-center justify-center text-[10px]"
                        >
                          {isSelected && <Check className={`w-3.5 h-3.5 ${preset.hex === '#FFFFFF' || preset.hex.startsWith('#F') ? 'text-slate-900 font-black' : 'text-white'}`} />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-amber-400' : 'text-white group-hover:text-amber-300'}`}>
                            {isBn ? preset.name_bn : preset.name_en}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{preset.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Precise Color Input */}
              <div className="pt-1">
                <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                  {isBn ? 'কাস্টম কালার পিকার ও হেক্স কোড (যেকোনো পছন্দের কালার দিন):' : 'Custom Color Picker & HEX Code:'}
                </label>
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="color"
                    value={formData.site_bg_color || '#F8F9FA'}
                    onChange={(e) => setFormData({ ...formData, site_bg_color: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.site_bg_color || '#F8F9FA'}
                    onChange={(e) => setFormData({ ...formData, site_bg_color: e.target.value })}
                    placeholder="#F8F9FA"
                    className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, site_bg_color: '#F8F9FA' })}
                    className="px-3 py-2 rounded-xl bg-[#14171E] border border-slate-700 hover:bg-[#252A36] text-slate-300 text-xs font-semibold whitespace-nowrap transition-colors"
                  >
                    {isBn ? 'রিসেট' : 'Reset'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {isBn
                    ? '💡 আপনি কালার বক্সে ক্লিক করে সরাসরি যেকোনো কালার পছন্দ করতে পারেন অথবা নির্দিষ্ট হেক্স কোড লিখুন। নিচে "সেটিংস সংরক্ষণ করুন" বাটনে ক্লিক করলে তা কার্যকর হবে।'
                    : '💡 Pick any custom color using the palette or type the exact hex code. Click "Save Settings" below to apply across the entire store.'}
                </p>
              </div>
            </div>

            {/* Header Color Customizer */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2C323F] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>{isBn ? 'হেডার ও ক্যাটাগরি বার কালার কাস্টমাইজেশন' : 'Header & Category Bar Color Customizer'}</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isBn
                      ? 'আপনার ওয়েবসাইটের হেডার ব্যাকগ্রাউন্ড, টেক্সট এবং ক্যাটাগরি বারের কালার নিজের পছন্দমতো পরিবর্তন করুন।'
                      : 'Customize your website header background, text, and category bar colors.'}
                  </p>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  {isBn ? '⚡ এক ক্লিকে থিম কালার নির্বাচন করুন:' : '⚡ One-Click Color Presets:'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        header_bg_color: '#F97316',
                        header_text_color: '#0F172A',
                        category_bar_bg: '#C2410C',
                        footer_bg_color: '#F97316',
                        footer_text_color: '#0F172A',
                        footer_bottom_bg: '#C2410C',
                        announcement_bg_color: '#2A140A',
                        announcement_text_color: '#FFF7ED'
                      })
                    }
                    className="p-2.5 rounded-xl border border-orange-500/50 bg-[#14171E] hover:bg-[#252A36] text-left flex items-center gap-2.5 transition-all group shadow-xs"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#F97316] to-[#C2410C] border border-black/20 shrink-0 shadow-xs" />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-orange-400">{isBn ? 'ডিপ ও লাইট অরেঞ্জ' : 'Deep & Warm Orange'}</p>
                      <p className="text-[10px] text-slate-400">#C2410C / #F97316 ({isBn ? 'ডিফল্ট' : 'Default'})</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        header_bg_color: '#FFFFFF',
                        header_text_color: '#0F172A',
                        category_bar_bg: '#F8FAFC',
                        footer_bg_color: '#0F172A',
                        footer_text_color: '#FFFFFF',
                        footer_bottom_bg: '#020617'
                      })
                    }
                    className="p-2.5 rounded-xl border border-slate-700 bg-[#14171E] hover:bg-[#252A36] text-left flex items-center gap-2.5 transition-all group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white border border-slate-400 shrink-0 shadow-xs" />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-400">{isBn ? 'ক্লিন হোয়াইট' : 'Modern White'}</p>
                      <p className="text-[10px] text-slate-400">#FFFFFF / #0F172A</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        header_bg_color: '#0F172A',
                        header_text_color: '#FFFFFF',
                        category_bar_bg: '#1E293B',
                        footer_bg_color: '#020617',
                        footer_text_color: '#F8FAFC',
                        footer_bottom_bg: '#000000'
                      })
                    }
                    className="p-2.5 rounded-xl border border-slate-700 bg-[#14171E] hover:bg-[#252A36] text-left flex items-center gap-2.5 transition-all group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#0F172A] border border-slate-600 shrink-0 shadow-xs" />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-400">{isBn ? 'লাক্সারি ডার্ক' : 'Midnight Slate'}</p>
                      <p className="text-[10px] text-slate-400">#0F172A</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        header_bg_color: '#F59E0B',
                        header_text_color: '#0F172A',
                        category_bar_bg: '#D97706',
                        footer_bg_color: '#F59E0B',
                        footer_text_color: '#0F172A',
                        footer_bottom_bg: '#D97706'
                      })
                    }
                    className="p-2.5 rounded-xl border border-amber-500/30 bg-[#14171E] hover:bg-[#252A36] text-left flex items-center gap-2.5 transition-all group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#F59E0B] border border-black/20 shrink-0 shadow-xs" />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-400">{isBn ? 'গোল্ডেন অ্যাম্বার' : 'Amber Gold'}</p>
                      <p className="text-[10px] text-slate-400">#F59E0B</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Precise Color Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                    {isBn ? 'হেডার ব্যাকগ্রাউন্ড কালার' : 'Header Background Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.header_bg_color || '#F97316'}
                      onChange={(e) => setFormData({ ...formData, header_bg_color: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.header_bg_color || '#F97316'}
                      onChange={(e) => setFormData({ ...formData, header_bg_color: e.target.value })}
                      placeholder="#F97316"
                      className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                    {isBn ? 'হেডার টেক্সট ও আইকন কালার' : 'Header Text & Icons Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.header_text_color || '#0F172A'}
                      onChange={(e) => setFormData({ ...formData, header_text_color: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.header_text_color || '#0F172A'}
                      onChange={(e) => setFormData({ ...formData, header_text_color: e.target.value })}
                      placeholder="#0F172A"
                      className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                    {isBn ? 'ক্যাটাগরি স্ক্রল বার ব্যাকগ্রাউন্ড' : 'Category Scroll Bar Background'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.category_bar_bg || '#C2410C'}
                      onChange={(e) => setFormData({ ...formData, category_bar_bg: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.category_bar_bg || '#C2410C'}
                      onChange={(e) => setFormData({ ...formData, category_bar_bg: e.target.value })}
                      placeholder="#C2410C"
                      className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Button & Stroke Customizer */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-5">
              <div className="border-b border-[#2C323F] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>{isBn ? 'ক্যাটাগরি বাটন ও স্ট্রোক (বর্ডার) কালার কাস্টমাইজেশন' : 'Category Button & Stroke (Border) Color Customizer'}</span>
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {isBn
                    ? 'হেডারের ক্যাটাগরি বাটনগুলোর নরমাল ও সিলেক্টেড অবস্থার বর্ডার স্ট্রোক, ব্যাকগ্রাউন্ড ও টেক্সট কালার পরিবর্তন করুন।'
                    : 'Customize category button border stroke, background, and text colors for normal and active/selected states.'}
                </p>
              </div>

              {/* Live Preview */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  {isBn ? 'লাইভ বাটন প্রিভিউ:' : 'Live Button Preview:'}
                </span>
                <div
                  style={{ backgroundColor: formData.category_bar_bg || '#C2410C' }}
                  className="p-4 rounded-xl flex items-center gap-3 overflow-x-auto shadow-inner"
                >
                  {/* Normal Button Preview */}
                  <div
                    style={{
                      backgroundColor: formData.category_btn_bg || '#FFFFFF',
                      color: formData.category_btn_text || '#1E293B',
                      borderColor: formData.category_btn_border_color || 'rgba(0,0,0,0.12)'
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 shadow-2xs whitespace-nowrap cursor-default"
                  >
                    <Shirt className="w-3.5 h-3.5" />
                    <span>{isBn ? 'নরমাল ক্যাটাগরি বাটন' : 'Normal Category Button'}</span>
                  </div>

                  {/* Active Selected Button Preview */}
                  <div
                    style={{
                      backgroundColor: formData.category_active_bg || '#0F172A',
                      color: formData.category_active_text || '#FFFFFF',
                      borderColor: formData.category_active_border || '#0F172A'
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 shadow-sm whitespace-nowrap cursor-default"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>{isBn ? '✓ সিলেক্টেড (Active) বাটন' : '✓ Selected (Active) Button'}</span>
                  </div>
                </div>
              </div>

              {/* Color pickers grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* 1. Category Button Border/Stroke Color */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                    {isBn ? 'বাটন স্ট্রোক (বর্ডার) কালার' : 'Button Stroke (Border) Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.category_btn_border_color || '#E2E8F0'}
                      onChange={(e) => setFormData({ ...formData, category_btn_border_color: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.category_btn_border_color || '#E2E8F0'}
                      onChange={(e) => setFormData({ ...formData, category_btn_border_color: e.target.value })}
                      placeholder="#E2E8F0"
                      className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 2. Category Button Background */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                    {isBn ? 'বাটন ব্যাকগ্রাউন্ড কালার' : 'Button Background Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.category_btn_bg || '#FFFFFF'}
                      onChange={(e) => setFormData({ ...formData, category_btn_bg: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.category_btn_bg || '#FFFFFF'}
                      onChange={(e) => setFormData({ ...formData, category_btn_bg: e.target.value })}
                      placeholder="#FFFFFF"
                      className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 3. Category Button Text Color */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                    {isBn ? 'বাটন টেক্সট কালার' : 'Button Text Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.category_btn_text || '#1E293B'}
                      onChange={(e) => setFormData({ ...formData, category_btn_text: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.category_btn_text || '#1E293B'}
                      onChange={(e) => setFormData({ ...formData, category_btn_text: e.target.value })}
                      placeholder="#1E293B"
                      className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 4. Active Background Color */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                    {isBn ? 'সিলেক্টেড ব্যাকগ্রাউন্ড কালার' : 'Active / Selected Background'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.category_active_bg || '#0F172A'}
                      onChange={(e) => setFormData({ ...formData, category_active_bg: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.category_active_bg || '#0F172A'}
                      onChange={(e) => setFormData({ ...formData, category_active_bg: e.target.value })}
                      placeholder="#0F172A"
                      className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 5. Active Text Color */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                    {isBn ? 'সিলেক্টেড টেক্সট কালার' : 'Active / Selected Text Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.category_active_text || '#FFFFFF'}
                      onChange={(e) => setFormData({ ...formData, category_active_text: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.category_active_text || '#FFFFFF'}
                      onChange={(e) => setFormData({ ...formData, category_active_text: e.target.value })}
                      placeholder="#FFFFFF"
                      className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 6. Active Border Color */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                    {isBn ? 'সিলেক্টেড বর্ডার কালার' : 'Active / Selected Border Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.category_active_border || '#0F172A'}
                      onChange={(e) => setFormData({ ...formData, category_active_border: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.category_active_border || '#0F172A'}
                      onChange={(e) => setFormData({ ...formData, category_active_border: e.target.value })}
                      placeholder="#0F172A"
                      className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#2C323F] pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layout className="w-4 h-4 text-amber-400" />
                    <span>{isBn ? 'টপ অ্যানাউন্সমেন্ট বার সেটিংস ও কালার কাস্টমাইজেশন' : 'Top Announcement Bar Settings & Color Customizer'}</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isBn
                      ? 'ওয়েবসাইটের একেবারে উপরে প্রদর্শিত প্রমোশনাল নোটিশ বারের ব্যাকগ্রাউন্ড কালার, টেক্সট কালার ও মেসেজ নিজের ইচ্ছামতো পরিবর্তন করুন।'
                      : 'Customize the background color, text color, promotional messages, and hotline displayed at the top announcement bar.'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.announcement_enabled !== 'false'}
                    onChange={(e) => setFormData({ ...formData, announcement_enabled: e.target.checked ? 'true' : 'false' })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  <span className="ml-2 text-xs font-bold text-slate-300">
                    {formData.announcement_enabled !== 'false'
                      ? (isBn ? 'চালু' : 'Enabled')
                      : (isBn ? 'বন্ধ' : 'Hidden')}
                  </span>
                </label>
              </div>

              {/* Live Announcement Bar Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isBn ? 'লাইভ অ্যানাউন্সমেন্ট বার প্রিভিউ (রিয়েলটাইম)' : 'Live Announcement Bar Preview (Real-time)'}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    {formData.announcement_enabled !== 'false' ? (isBn ? 'সক্রিয় অবস্থায় প্রদর্শন' : 'Previewing Active State') : (isBn ? 'বর্তমানে বন্ধ রয়েছে' : 'Currently Disabled')}
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: formData.announcement_bg_color || '#0F172A',
                    color: formData.announcement_text_color || '#E2E8F0'
                  }}
                  className="p-3 rounded-xl border border-white/10 shadow-md transition-colors text-xs overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 opacity-90" />
                        <span>{isBn ? '১০০% অরিজিনাল পণ্য' : '100% Authentic'}</span>
                      </span>
                      <span className="hidden sm:inline opacity-40">|</span>
                      <span className="font-medium opacity-95 text-center sm:text-left truncate max-w-xs sm:max-w-md">
                        {isBn
                          ? formData.announcement_bn || formData.announcement_en || '⚡ বিশেষ অফার: ২৫০০ টাকার বেশি অর্ডারে ফ্রি হোম ডেলিভারি! ⚡'
                          : formData.announcement_en || formData.announcement_bn || '⚡ Festive Special: Free Home Delivery on orders above ৳2,500! ⚡'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-black/25 border border-white/20 rounded-md p-0.5 text-[10px] font-bold">
                        <span className="px-1.5 py-0.5 bg-white/25 rounded font-black">বাংলা</span>
                        <span className="px-1.5 py-0.5 opacity-70">EN</span>
                      </div>

                      {(formData.contact_phone || settings.contact_phone) && (
                        <div className="flex items-center gap-1 opacity-90 font-medium">
                          <Phone className="w-3 h-3" />
                          <span>{formData.contact_phone || settings.contact_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcement Bar Color Presets */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block">
                  {isBn ? '⚡ এক ক্লিকে অ্যানাউন্সমেন্ট বার কালার প্রিসেট নির্বাচন করুন:' : '⚡ One-Click Announcement Bar Color Presets:'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {ANNOUNCEMENT_COLOR_PRESETS.map((preset) => {
                    const isSelected =
                      (formData.announcement_bg_color || '#0F172A').toLowerCase() === preset.bg.toLowerCase() &&
                      (formData.announcement_text_color || '#E2E8F0').toLowerCase() === preset.text.toLowerCase();

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            announcement_bg_color: preset.bg,
                            announcement_text_color: preset.text
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all group ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                            : 'border-[#2C323F] bg-[#14171E] hover:bg-[#252A36] hover:border-slate-600'
                        }`}
                      >
                        <div
                          style={{ backgroundColor: preset.bg, borderColor: preset.text }}
                          className="w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 shadow-xs"
                        >
                          <span style={{ color: preset.text }} className="text-[9px] font-black">Aa</span>
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-amber-400' : 'text-white group-hover:text-amber-400'}`}>
                            {isBn ? preset.name_bn : preset.name}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono truncate">{preset.bg}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Precise Color Inputs for Announcement Bar */}
              <div className="bg-[#14171E] border border-[#2C323F] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isBn ? 'কাস্টম কালার নির্বাচন (Hex / Color Picker)' : 'Custom Color Selection (Hex / Color Picker)'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        announcement_bg_color: '#2A140A',
                        announcement_text_color: '#FFF7ED'
                      })
                    }
                    className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isBn ? 'ডিফল্ট কালারে রিসেট' : 'Reset to Default'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                      {isBn ? 'অ্যানাউন্সমেন্ট বার ব্যাকগ্রাউন্ড কালার' : 'Announcement Bar Background Color'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.announcement_bg_color || '#2A140A'}
                        onChange={(e) => setFormData({ ...formData, announcement_bg_color: e.target.value })}
                        className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.announcement_bg_color || '#2A140A'}
                        onChange={(e) => setFormData({ ...formData, announcement_bg_color: e.target.value })}
                        placeholder="#2A140A"
                        className="flex-1 bg-[#1E222B] border border-[#2C323F] rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                      {isBn ? 'অ্যানাউন্সমেন্ট বার টেক্সট ও আইকন কালার' : 'Announcement Bar Text & Icons Color'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.announcement_text_color || '#E2E8F0'}
                        onChange={(e) => setFormData({ ...formData, announcement_text_color: e.target.value })}
                        className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.announcement_text_color || '#E2E8F0'}
                        onChange={(e) => setFormData({ ...formData, announcement_text_color: e.target.value })}
                        placeholder="#E2E8F0"
                        className="flex-1 bg-[#1E222B] border border-[#2C323F] rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Message and Contact Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#2C323F]">
                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'অ্যানাউন্সমেন্ট ব্যানার মেসেজ (ইংরেজি)' : 'Announcement Banner Message (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.announcement_en || formData.announcement_text_en || ''}
                    onChange={(e) => setFormData({ ...formData, announcement_en: e.target.value, announcement_text_en: e.target.value })}
                    placeholder="⚡ Festive Special: Free Home Delivery on orders above ৳2,500! ⚡"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'অ্যানাউন্সমেন্ট ব্যানার মেসেজ (বাংলা)' : 'Announcement Banner Message (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.announcement_bn || formData.announcement_text_bn || ''}
                    onChange={(e) => setFormData({ ...formData, announcement_bn: e.target.value, announcement_text_bn: e.target.value })}
                    placeholder="⚡ বিশেষ অফার: ২৫০০ টাকার বেশি অর্ডারে ফ্রি হোম ডেলিভারি! ⚡"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'টপ বার হটলাইন নম্বর' : 'Top Bar Hotline Number'}
                  </label>
                  <input
                    type="text"
                    value={formData.contact_phone || ''}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+880 1711-000000"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'টপ বার সাপোর্ট ইমেইল' : 'Top Bar Support Email'}
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="support@shophatbd.com"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: FLASH SALE & COUNTDOWN TIMER CONFIGURATION */}
        {/* ========================================================================= */}
        {activeTab === 'flash_sale' && (
          <div className="space-y-6">
            {/* 1. Main Campaign Status & Toggle */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C323F] pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-rose-500 fill-current" />
                    <span>{isBn ? 'ফ্ল্যাশ সেল ও কাউন্টডাউন টাইমার সেটিংস' : 'Flash Sale & Countdown Timer Settings'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isBn
                      ? 'হোমপেজের ফ্ল্যাশ সেল সেকশন এবং লাইভ কাউন্টডাউন টাইমার সময় এখান থেকে যেকোনো সময় এডিট বা বন্ধ করতে পারবেন।'
                      : 'Control the visibility, duration, and countdown timer for your storefront Flash Sale campaign.'}
                  </p>
                </div>

                {/* Campaign Master Toggle */}
                <div className="flex items-center gap-3 bg-[#14171E] border border-[#2C323F] rounded-xl px-4 py-2.5">
                  <span className="text-xs font-semibold text-slate-300">
                    {isBn ? 'ফ্ল্যাশ সেল সেকশন:' : 'Campaign Status:'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.flash_sale_enabled !== '0' && formData.flash_sale_enabled !== 'false' && formData.flash_sale_enabled !== false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          flash_sale_enabled: e.target.checked ? '1' : '0'
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      formData.flash_sale_enabled !== '0' && formData.flash_sale_enabled !== 'false' && formData.flash_sale_enabled !== false
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {formData.flash_sale_enabled !== '0' && formData.flash_sale_enabled !== 'false' && formData.flash_sale_enabled !== false
                      ? isBn ? 'সক্রিয় (Active)' : 'Active'
                      : isBn ? 'নিষ্ক্রিয় (Disabled)' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* 2. Timer Duration & Quick Presets */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>{isBn ? 'কাউন্টডাউন শেষ হওয়ার তারিখ ও সময় (End Date & Time)' : 'Flash Sale End Date & Time'}</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
                    {isBn
                      ? 'এখানে আপনার পছন্দমতো তারিখ ও সময় সেট করুন। টাইমার স্বয়ংক্রিয়ভাবে উক্ত সময় পর্যন্ত সেকেন্ড হিসাব করে কমতে থাকবে।'
                      : 'Select the precise expiration timestamp for this flash deal campaign.'}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="datetime-local"
                      value={formData.flash_sale_end_time || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          flash_sale_end_time: e.target.value,
                          flash_sale_enabled: '1'
                        })
                      }
                      className="bg-[#14171E] border border-[#2C323F] rounded-xl px-4 py-3 text-white text-sm focus:border-rose-500 focus:outline-hidden flex-1 sm:max-w-md"
                    />
                    {formData.flash_sale_end_time && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, flash_sale_end_time: '' })}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-xs font-semibold transition-colors shrink-0"
                      >
                        {isBn ? 'রিসেট / খালি করুন' : 'Clear / Reset'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Presets Buttons */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    {isBn ? '⚡ দ্রুত ১-ক্লিকে সময় নির্ধারণ করুন (Quick Presets):' : '⚡ Quick Presets (1-Click Duration):'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={setQuickTonightMidnight}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-medium border border-slate-700/60 transition-colors flex items-center gap-1.5"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{isBn ? 'আজ রাত ১১:৫৯ পর্যন্ত' : 'Tonight 11:59 PM'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickFlashDuration(6)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700/60 transition-colors flex items-center gap-1.5"
                    >
                      <span>⏱️ +৬ ঘণ্টা (+6h)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickFlashDuration(12)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700/60 transition-colors flex items-center gap-1.5"
                    >
                      <span>⏱️ +১২ ঘণ্টা (+12h)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickFlashDuration(24)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700/60 transition-colors flex items-center gap-1.5"
                    >
                      <span>⏱️ +১ দিন / ২৪ ঘণ্টা (+24h)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickFlashDuration(72)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700/60 transition-colors flex items-center gap-1.5"
                    >
                      <span>⏱️ +৩ দিন (+3 Days)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickFlashDuration(168)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700/60 transition-colors flex items-center gap-1.5"
                    >
                      <span>⏱️ +৭ দিন (+7 Days)</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview Card */}
                {(() => {
                  const remaining = getAdminFlashRemaining();
                  return (
                    <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 border border-rose-500/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                            {isBn ? 'লাইভ প্রিভিউ (ওয়েবসাইটে যেভাবে দেখাবে):' : 'Live Storefront Preview:'}
                          </span>
                          <span className="text-sm font-bold text-white mt-0.5 block">
                            {isBn
                              ? (formData.flash_sale_title_bn || 'ধামাকা ফ্ল্যাশ সেল ডিলস')
                              : (formData.flash_sale_title_en || 'Flash Sale Deals')}
                          </span>
                        </div>

                        {remaining ? (
                          remaining.isExpired ? (
                            <div className="bg-rose-900/60 border border-rose-500/50 rounded-lg px-3 py-1.5 text-rose-200 text-xs font-bold">
                              ⚠️ {isBn ? 'নির্ধারিত সময় শেষ হয়ে গেছে' : 'Campaign Expired'}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {remaining.days > 0 && (
                                <>
                                  <div className="bg-black/40 border border-white/20 rounded-lg px-2.5 py-1 text-center min-w-[42px]">
                                    <span className="text-base font-black text-amber-400 block font-mono">
                                      {String(remaining.days).padStart(2, '0')}
                                    </span>
                                    <span className="text-[8px] uppercase text-slate-300 font-bold">{isBn ? 'দিন' : 'Days'}</span>
                                  </div>
                                  <span className="text-amber-400 font-bold">:</span>
                                </>
                              )}
                              <div className="bg-black/40 border border-white/20 rounded-lg px-2.5 py-1 text-center min-w-[42px]">
                                <span className="text-base font-black text-amber-400 block font-mono">
                                  {String(remaining.hours).padStart(2, '0')}
                                </span>
                                <span className="text-[8px] uppercase text-slate-300 font-bold">{isBn ? 'ঘণ্টা' : 'Hours'}</span>
                              </div>
                              <span className="text-amber-400 font-bold">:</span>
                              <div className="bg-black/40 border border-white/20 rounded-lg px-2.5 py-1 text-center min-w-[42px]">
                                <span className="text-base font-black text-amber-400 block font-mono">
                                  {String(remaining.minutes).padStart(2, '0')}
                                </span>
                                <span className="text-[8px] uppercase text-slate-300 font-bold">{isBn ? 'মিনিট' : 'Mins'}</span>
                              </div>
                              <span className="text-amber-400 font-bold">:</span>
                              <div className="bg-black/40 border border-white/20 rounded-lg px-2.5 py-1 text-center min-w-[42px]">
                                <span className="text-base font-black text-amber-400 block font-mono">
                                  {String(remaining.seconds).padStart(2, '0')}
                                </span>
                                <span className="text-[8px] uppercase text-slate-300 font-bold">{isBn ? 'সেকেন্ড' : 'Secs'}</span>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                            ⏱️ {isBn ? 'স্বয়ংক্রিয় কাউন্টডাউন (রাত ১২টা পর্যন্ত চলবে)' : 'Automatic Rolling Countdown (Until Midnight)'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 3. Titles & Subtitles Customization */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-5">
              <h3 className="text-sm font-bold text-white border-b border-[#2C323F] pb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>{isBn ? 'শিরোনাম ও সাব-টাইটেল কাস্টমাইজেশন' : 'Section Headings & Subtitles'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isBn ? 'ফ্ল্যাশ সেল শিরোনাম (বাংলা)' : 'Flash Sale Heading (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.flash_sale_title_bn || ''}
                    onChange={(e) => setFormData({ ...formData, flash_sale_title_bn: e.target.value })}
                    placeholder="ধামাকা ফ্ল্যাশ সেল ডিলস"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isBn ? 'ফ্ল্যাশ সেল শিরোনাম (English)' : 'Flash Sale Heading (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.flash_sale_title_en || ''}
                    onChange={(e) => setFormData({ ...formData, flash_sale_title_en: e.target.value })}
                    placeholder="Flash Sale Deals"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isBn ? 'সাব-টাইটেল / অফার বার্তা (বাংলা)' : 'Subtitle / Tagline (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.flash_sale_sub_bn || ''}
                    onChange={(e) => setFormData({ ...formData, flash_sale_sub_bn: e.target.value })}
                    placeholder="সীমিত সময়ের মেগা ছাড়! স্টক শেষ হওয়ার আগেই আপনার পছন্দের পণ্যটি সংগ্রহ করুন।"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isBn ? 'সাব-টাইটেল / অফার বার্তা (English)' : 'Subtitle / Tagline (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.flash_sale_sub_en || ''}
                    onChange={(e) => setFormData({ ...formData, flash_sale_sub_en: e.target.value })}
                    placeholder="Hurry up! Grab limited-time massive discounts before stock runs out."
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* 4. Product Assignment How-To Guide */}
            <div className="bg-[#1E222B] border border-amber-500/20 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isBn ? 'কীভাবে পণ্যে ফ্ল্যাশ সেল যুক্ত করবেন?' : 'How to Add Products to Flash Sale?'}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="bg-[#14171E] border border-[#2C323F] rounded-xl p-4 space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">১</span>
                  <h4 className="font-bold text-white">{isBn ? 'পণ্য তালিকায় যান' : 'Go to Products'}</h4>
                  <p className="text-slate-400">{isBn ? 'এডমিন প্যানেলের বাম পাশের "পণ্য তালিকা (Products)" মেনুতে ক্লিক করুন।' : 'Navigate to Admin Panel > Products list.'}</p>
                </div>
                <div className="bg-[#14171E] border border-[#2C323F] rounded-xl p-4 space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">২</span>
                  <h4 className="font-bold text-white">{isBn ? 'এডিটে টিক দিন' : 'Edit & Check Flash Sale'}</h4>
                  <p className="text-slate-400">{isBn ? 'কাঙ্ক্ষিত পণ্যের Edit বাটনে ক্লিক করে "ফ্ল্যাশ সেল অফার" বক্সে টিক দিন ও ছাড়ের মূল্য দিন।' : 'Click Edit on the product and check "Flash Sale Deal" with discount price.'}</p>
                </div>
                <div className="bg-[#14171E] border border-[#2C323F] rounded-xl p-4 space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">৩</span>
                  <h4 className="font-bold text-white">{isBn ? 'স্বয়ংক্রিয় প্রদর্শন' : 'Auto Display'}</h4>
                  <p className="text-slate-400">{isBn ? 'পণ্যটি স্বয়ংক্রিয়ভাবে হোমপেজের এই ফ্ল্যাশ সেল ব্লকে কাউন্টডাউন টাইমারসহ প্রদর্শিত হবে।' : 'The item will instantly appear under the homepage Flash Sale section.'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: WHY CHOOSE US / VALUE HIGHLIGHTS */}
        {/* ========================================================================= */}
        {activeTab === 'why_shop' && (
          <div className="space-y-6">
            {/* Section Visibility & Heading Settings */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C323F] pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{isBn ? 'কেন আমাদের বেছে নেবেন (হোমপেজ ফিচার্স ও ট্রাস্ট ব্যাজ)' : 'Why Choose Us (Homepage Trust & Value Badges)'}</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isBn
                      ? 'হোমপেজে প্রদর্শিত "Why Shop with SHOPHATBD" ট্রাস্ট ও ভ্যালু কার্ডসমূহ কাস্টমাইজ করুন।'
                      : 'Customize the "Why Shop With Us" trust highlights, guarantees, and value badges on the storefront.'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300">
                    {formData.why_shop_enabled !== 'false'
                      ? (isBn ? 'সেকশন সক্রিয়' : 'Section Enabled')
                      : (isBn ? 'সেকশন নিষ্ক্রিয়' : 'Section Disabled')}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.why_shop_enabled !== 'false'}
                      onChange={(e) => setFormData({ ...formData, why_shop_enabled: e.target.checked ? 'true' : 'false' })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              {/* Title & Subtitle Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'সেকশন শিরোনাম (English)' : 'Section Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.why_shop_title_en || ''}
                    onChange={(e) => setFormData({ ...formData, why_shop_title_en: e.target.value })}
                    placeholder="Why Shop with SHOPHATBD"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'সেকশন শিরোনাম (বাংলা)' : 'Section Title (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.why_shop_title_bn || ''}
                    onChange={(e) => setFormData({ ...formData, why_shop_title_bn: e.target.value })}
                    placeholder="কেন শপহাটবিডি থেকে কেনাকাটা করবেন?"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'সেকশন সাবটাইটেল (English)' : 'Section Subtitle (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.why_shop_subtitle_en || ''}
                    onChange={(e) => setFormData({ ...formData, why_shop_subtitle_en: e.target.value })}
                    placeholder="Bangladesh's trusted e-commerce for authentic lifestyle products"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'সেকশন সাবটাইটেল (বাংলা)' : 'Section Subtitle (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.why_shop_subtitle_bn || ''}
                    onChange={(e) => setFormData({ ...formData, why_shop_subtitle_bn: e.target.value })}
                    placeholder="শতভাগ অরিজিনাল ও দ্রুত ডেলিভারির নিশ্চয়তা"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Colors & Appearance Customization Panel with Preset Palettes */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C323F] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span>{isBn ? 'কালার পরিবর্তন ও থিম সেটিংস' : 'Color Styling & Theme Presets'}</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isBn
                      ? 'এক ক্লিকে প্রিসেট কালার বেছে নিন অথবা নিজের পছন্দমতো ব্যাকগ্রাউন্ড, টেক্সট ও আইকনের রঙ দিন।'
                      : 'Choose one-click color presets or customize exact hex codes for background, cards, text, and icons.'}
                  </p>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">
                  {isBn ? '⚡ এক ক্লিকে রেডিমেড কালার থিম নির্বাচন করুন:' : '⚡ One-Click Color Theme Presets:'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {WHY_SHOP_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyWhyShopColorPreset(preset.id)}
                      className="p-2.5 rounded-xl border border-[#2C323F] bg-[#14171E] hover:border-amber-500/50 text-left transition-all group flex flex-col gap-1.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: preset.bg }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: preset.icon_color }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-amber-400 truncate">
                        {isBn ? preset.name_bn : preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2 border-t border-[#2C323F]">
                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-[11px]">
                    {isBn ? 'সেকশন ব্যাকগ্রাউন্ড কালার' : 'Section Background Color'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={formData.why_shop_bg_color || '#0F172A'}
                      onChange={(e) => setFormData({ ...formData, why_shop_bg_color: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border border-[#2C323F] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.why_shop_bg_color || '#0F172A'}
                      onChange={(e) => setFormData({ ...formData, why_shop_bg_color: e.target.value })}
                      className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-[11px]">
                    {isBn ? 'সেকশন টাইটেল কালার' : 'Section Title Color'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={formData.why_shop_title_color || '#FFFFFF'}
                      onChange={(e) => setFormData({ ...formData, why_shop_title_color: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border border-[#2C323F] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.why_shop_title_color || '#FFFFFF'}
                      onChange={(e) => setFormData({ ...formData, why_shop_title_color: e.target.value })}
                      className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-[11px]">
                    {isBn ? 'সেকশন সাবটাইটেল কালার' : 'Section Subtitle Color'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={formData.why_shop_subtitle_color || '#94A3B8'}
                      onChange={(e) => setFormData({ ...formData, why_shop_subtitle_color: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border border-[#2C323F] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.why_shop_subtitle_color || '#94A3B8'}
                      onChange={(e) => setFormData({ ...formData, why_shop_subtitle_color: e.target.value })}
                      className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-[11px]">
                    {isBn ? 'কার্ড ব্যাকগ্রাউন্ড কালার' : 'Card Background'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={formData.why_shop_card_bg?.startsWith('#') ? formData.why_shop_card_bg : '#1E293B'}
                      onChange={(e) => setFormData({ ...formData, why_shop_card_bg: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border border-[#2C323F] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.why_shop_card_bg || 'rgba(30, 41, 59, 0.6)'}
                      onChange={(e) => setFormData({ ...formData, why_shop_card_bg: e.target.value })}
                      className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-[11px]">
                    {isBn ? 'কার্ড বর্ডার কালার' : 'Card Border Color'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={formData.why_shop_card_border?.startsWith('#') ? formData.why_shop_card_border : '#334155'}
                      onChange={(e) => setFormData({ ...formData, why_shop_card_border: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border border-[#2C323F] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.why_shop_card_border || 'rgba(51, 65, 85, 0.6)'}
                      onChange={(e) => setFormData({ ...formData, why_shop_card_border: e.target.value })}
                      className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-[11px]">
                    {isBn ? 'কার্ড টাইটেল কালার' : 'Card Title Color'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={formData.why_shop_card_title_color || '#FFFFFF'}
                      onChange={(e) => setFormData({ ...formData, why_shop_card_title_color: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border border-[#2C323F] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.why_shop_card_title_color || '#FFFFFF'}
                      onChange={(e) => setFormData({ ...formData, why_shop_card_title_color: e.target.value })}
                      className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-[11px]">
                    {isBn ? 'কার্ড বিবরণ কালার' : 'Card Description Color'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={formData.why_shop_card_desc_color || '#94A3B8'}
                      onChange={(e) => setFormData({ ...formData, why_shop_card_desc_color: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border border-[#2C323F] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.why_shop_card_desc_color || '#94A3B8'}
                      onChange={(e) => setFormData({ ...formData, why_shop_card_desc_color: e.target.value })}
                      className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-[11px]">
                    {isBn ? 'আইকন ব্যাকগ্রাউন্ড কালার' : 'Icon Container Background'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={formData.why_shop_icon_bg?.startsWith('#') ? formData.why_shop_icon_bg : '#F59E0B'}
                      onChange={(e) => setFormData({ ...formData, why_shop_icon_bg: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border border-[#2C323F] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.why_shop_icon_bg || 'rgba(245, 158, 11, 0.2)'}
                      onChange={(e) => setFormData({ ...formData, why_shop_icon_bg: e.target.value })}
                      className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-[11px]">
                    {isBn ? 'আইকন কালার' : 'Icon Accent Color'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={formData.why_shop_icon_color || '#FBBF24'}
                      onChange={(e) => setFormData({ ...formData, why_shop_icon_color: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border border-[#2C323F] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.why_shop_icon_color || '#FBBF24'}
                      onChange={(e) => setFormData({ ...formData, why_shop_icon_color: e.target.value })}
                      className="w-full bg-[#14171E] border border-[#2C323F] rounded-lg p-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="pt-3 border-t border-[#2C323F]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  {isBn ? 'লাইভ প্রিভিউ (হোমপেজে যেমন দেখাবে):' : 'Live Storefront Preview:'}
                </span>
                <div
                  style={{ backgroundColor: formData.why_shop_bg_color || '#0F172A' }}
                  className="rounded-2xl p-5 border border-white/10 shadow-inner space-y-4"
                >
                  <div className="text-center space-y-1">
                    <h4
                      style={{ color: formData.why_shop_title_color || '#FFFFFF' }}
                      className="text-sm font-black tracking-tight"
                    >
                      {formData.why_shop_title_en || 'Why Shop with SHOPHATBD'}
                    </h4>
                    <p
                      style={{ color: formData.why_shop_subtitle_color || '#94A3B8' }}
                      className="text-[10px]"
                    >
                      {formData.why_shop_subtitle_en || "Bangladesh's trusted e-commerce destination"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {whyShopFeatures.filter(f => f.is_active !== false).slice(0, 4).map((feature, idx) => {
                      return (
                        <div
                          key={feature.id || idx}
                          style={{
                            backgroundColor: formData.why_shop_card_bg || 'rgba(30, 41, 59, 0.6)',
                            borderColor: formData.why_shop_card_border || 'rgba(51, 65, 85, 0.6)'
                          }}
                          className="rounded-xl p-3.5 border flex flex-col items-center justify-center text-center gap-1.5 backdrop-blur-sm min-h-[90px]"
                        >
                          <p
                            style={{ color: formData.why_shop_card_title_color || '#FFFFFF' }}
                            className="font-extrabold text-xs sm:text-sm leading-tight text-center"
                          >
                            {feature.title || 'Highlight Title'}
                          </p>
                          <p
                            style={{ color: formData.why_shop_card_desc_color || '#94A3B8' }}
                            className="text-[10px] sm:text-[11px] leading-relaxed text-center"
                          >
                            {feature.subtitle || 'Benefit description'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Cards Management List with Edit & Delete Actions */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C323F] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>{isBn ? 'ফিচার কার্ডসমূহ পরিচালনা (এডিট ও ডিলিট)' : 'Manage Feature Cards (Edit & Delete)'}</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isBn
                      ? 'প্রতিটি ফিচারের এডিট বাটনে ক্লিক করে নাম ও আইকন পরিবর্তন করুন অথবা ডিলিট বাটনে ক্লিক করে মুছে ফেলুন।'
                      : 'Click Edit button to customize titles, subtitles, and icons, or click Delete button to remove.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetDefaultWhyShop}
                    className="px-3 py-1.5 bg-[#14171E] hover:bg-[#252A36] text-slate-400 hover:text-white border border-[#2C323F] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    title={isBn ? "ডিফল্ট ফিচার রিস্টোর করুন" : "Restore default features"}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ডিফল্ট রিসেট' : 'Reset Defaults'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddWhyShop}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isBn ? 'নতুন ফিচার যোগ করুন' : 'Add New Feature'}</span>
                  </button>
                </div>
              </div>

              {/* Cards Grid / List */}
              <div className="space-y-2.5">
                {whyShopFeatures.map((feature, idx) => {
                  const IconComp = getWhyShopIconComponent(feature.icon);
                  const isItemActive = feature.is_active !== false;

                  return (
                    <div
                      key={feature.id || idx}
                      className={`p-3.5 bg-[#14171E] border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        isItemActive
                          ? 'border-[#2C323F] hover:border-slate-700'
                          : 'border-slate-800/50 opacity-60 bg-[#12141A]'
                      }`}
                    >
                      {/* Left side: Index, Up/Down, Icon, Titles */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Position & Move Up/Down */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveWhyShop(idx, 'up')}
                              className={`p-0.5 rounded hover:bg-[#252A36] transition-colors ${
                                idx === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-amber-400'
                              }`}
                              title={isBn ? "উপরে নিন" : "Move Up"}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === whyShopFeatures.length - 1}
                              onClick={() => handleMoveWhyShop(idx, 'down')}
                              className={`p-0.5 rounded hover:bg-[#252A36] transition-colors ${
                                idx === whyShopFeatures.length - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-amber-400'
                              }`}
                              title={isBn ? "নিচে নিন" : "Move Down"}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Icon Badge */}
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <IconComp className="w-5 h-5" />
                        </div>

                        {/* Titles & Descriptions */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white truncate">
                              {feature.title || (isBn ? 'শিরোনাম নেই' : 'No Title')}
                            </h4>
                            {feature.title_bn && feature.title_bn !== feature.title && (
                              <span className="text-[10px] text-amber-400/80 font-medium truncate hidden md:inline">
                                ({feature.title_bn})
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {feature.subtitle || feature.subtitle_bn || (isBn ? 'কোনো সাবটাইটেল দেওয়া নেই' : 'No subtitle description')}
                          </p>
                        </div>
                      </div>

                      {/* Right side: Action Buttons (Active Toggle, Edit Button, Delete Button) */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2C323F]/60 w-full sm:w-auto justify-end">
                        {/* Visibility Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleWhyShopActive(feature.id)}
                          className={`p-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 ${
                            isItemActive
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/40'
                              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-700'
                          }`}
                          title={isItemActive ? (isBn ? "সক্রিয় (ক্লিক করলে লুকাবে)" : "Active (Click to hide)") : (isBn ? "লুকানো (ক্লিক করলে দেখাবে)" : "Hidden (Click to show)")}
                        >
                          {isItemActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span className="text-[10px] hidden md:inline">
                            {isItemActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'বন্ধ' : 'Hidden')}
                          </span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditWhyShop(feature)}
                          className="px-3 py-1.5 rounded-xl bg-[#1E222B] hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-[#2C323F] text-xs font-bold transition-colors flex items-center gap-1.5"
                          title={isBn ? "এডিট করুন" : "Edit Feature"}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isBn ? 'এডিট' : 'Edit'}</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setWhyShopToDelete(feature.id)}
                          className="p-2 rounded-xl bg-[#1E222B] hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-[#2C323F] hover:border-rose-500/30 transition-colors"
                          title={isBn ? "ডিলিট করুন" : "Delete Feature"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: FOOTER & POLICY HUB */}
        {/* ========================================================================= */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            {/* Footer Color Customizer */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2C323F] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>{isBn ? 'ফুটার কালার ও থিম কাস্টমাইজেশন' : 'Footer Colors & Theme'}</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isBn
                      ? 'ফুটার ব্যাকগ্রাউন্ড ও কপিরাইট বারের রঙ পরিবর্তন করুন।'
                      : 'Customize footer background and copyright bar colors.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                    {isBn ? 'ফুটার ব্যাকগ্রাউন্ড কালার' : 'Footer Background Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.footer_bg_color || '#F97316'}
                      onChange={(e) => setFormData({ ...formData, footer_bg_color: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.footer_bg_color || '#F97316'}
                      onChange={(e) => setFormData({ ...formData, footer_bg_color: e.target.value })}
                      placeholder="#F97316"
                      className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                    {isBn ? 'ফুটার টেক্সট কালার' : 'Footer Text Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.footer_text_color || '#0F172A'}
                      onChange={(e) => setFormData({ ...formData, footer_text_color: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.footer_text_color || '#0F172A'}
                      onChange={(e) => setFormData({ ...formData, footer_text_color: e.target.value })}
                      placeholder="#0F172A"
                      className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                    {isBn ? 'কপিরাইট স্ট্রিপ ব্যাকগ্রাউন্ড' : 'Footer Bottom Bar BG'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.footer_bottom_bg || '#C2410C'}
                      onChange={(e) => setFormData({ ...formData, footer_bottom_bg: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.footer_bottom_bg || '#C2410C'}
                      onChange={(e) => setFormData({ ...formData, footer_bottom_bg: e.target.value })}
                      placeholder="#C2410C"
                      className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer About & Copyright */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[#2C323F] pb-3">
                {isBn ? 'ফুটার বায়ো ও কপিরাইট টেক্সট' : 'Footer Bio & Copyright'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'ফুটার বিবরণ (ইংরেজি)' : 'Footer About Description (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.footer_about_en || ''}
                    onChange={(e) => setFormData({ ...formData, footer_about_en: e.target.value })}
                    placeholder="Bangladesh’s premier destination for genuine lifestyle fashion, smart electronic gadgets, and home essentials."
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'ফুটার বিবরণ (বাংলা)' : 'Footer About Description (Bangla)'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.footer_about_bn || ''}
                    onChange={(e) => setFormData({ ...formData, footer_about_bn: e.target.value })}
                    placeholder="প্রিমিয়াম ফ্যাশন ও আধুনিক গ্যাজেটের সবচেয়ে বিশ্বস্ত অনলাইন গন্তব্য।"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'কপিরাইট নোটিশ (ইংরেজি)' : 'Copyright Notice (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.footer_copyright_en || ''}
                    onChange={(e) => setFormData({ ...formData, footer_copyright_en: e.target.value })}
                    placeholder="© 2026 SHOPHATBD Bangladesh. All Rights Reserved."
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'কপিরাইট নোটিশ (বাংলা)' : 'Copyright Notice (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.footer_copyright_bn || ''}
                    onChange={(e) => setFormData({ ...formData, footer_copyright_bn: e.target.value })}
                    placeholder="© ২০২৬ শপহাটবিডি বাংলাদেশ। সর্বস্বত্ব সংরক্ষিত।"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Dedicated Newsletter & Offer Box Editor */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C323F] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{isBn ? 'নিউজলেটার ও অফার বক্স এডিটর' : 'Newsletter & Promo Box Editor'}</span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                        {isBn ? 'সম্পূর্ণ এডিটেবল' : 'Fully Customizable'}
                      </span>
                    </h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {isBn
                        ? 'ফুটারের নিউজলেটার বক্সের শিরোনাম, অফার বিবরণ, সাবস্ক্রাইব বাটন ও রঙ নিজের মতো সাজান।'
                        : 'Customize the footer newsletter heading, promotional message, button text, and colors.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Newsletter Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'বক্সের শিরোনাম (ইংরেজি)' : 'Heading Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.footer_newsletter_title_en !== undefined ? formData.footer_newsletter_title_en : (formData.footer_newsletter_title || '')}
                    onChange={(e) => setFormData({ ...formData, footer_newsletter_title_en: e.target.value, footer_newsletter_title: e.target.value })}
                    placeholder="JOIN THE SHOPHATBD CLUB"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'বক্সের শিরোনাম (বাংলা)' : 'Heading Title (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.footer_newsletter_title_bn || ''}
                    onChange={(e) => setFormData({ ...formData, footer_newsletter_title_bn: e.target.value })}
                    placeholder="অফার ও নিউজলেটার"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'অফার মেসেজ / সাবটাইটেল (ইংরেজি)' : 'Offer / Subtitle Text (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.footer_newsletter_sub_en !== undefined ? formData.footer_newsletter_sub_en : (formData.footer_newsletter_sub || '')}
                    onChange={(e) => setFormData({ ...formData, footer_newsletter_sub_en: e.target.value, footer_newsletter_sub: e.target.value })}
                    placeholder="Subscribe to get 10% OFF your first order, exclusive Eid flash sales, and new drop alerts."
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'অফার মেসেজ / সাবটাইটেল (বাংলা)' : 'Offer / Subtitle Text (Bangla)'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.footer_newsletter_sub_bn || ''}
                    onChange={(e) => setFormData({ ...formData, footer_newsletter_sub_bn: e.target.value })}
                    placeholder="সাবস্ক্রাইব করে প্রথম অর্ডারে ১০% বিশেষ ছাড় উপভোগ করুন।"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'বাটন টেক্সট (ইংরেজি)' : 'Button Text (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.footer_newsletter_btn_en || ''}
                    onChange={(e) => setFormData({ ...formData, footer_newsletter_btn_en: e.target.value })}
                    placeholder="Subscribe"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'বাটন টেক্সট (বাংলা)' : 'Button Text (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.footer_newsletter_btn_bn || ''}
                    onChange={(e) => setFormData({ ...formData, footer_newsletter_btn_bn: e.target.value })}
                    placeholder="সাবস্ক্রাইব করুন"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'ইমেইল ইনপুট প্লেসহোল্ডার (ইংরেজি)' : 'Input Placeholder (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.footer_newsletter_placeholder_en || ''}
                    onChange={(e) => setFormData({ ...formData, footer_newsletter_placeholder_en: e.target.value })}
                    placeholder="Enter your email..."
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'ইমেইল ইনপুট প্লেসহোল্ডার (বাংলা)' : 'Input Placeholder (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.footer_newsletter_placeholder_bn || ''}
                    onChange={(e) => setFormData({ ...formData, footer_newsletter_placeholder_bn: e.target.value })}
                    placeholder="আপনার ইমেইল লিখুন..."
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                    {isBn ? 'সাবস্ক্রাইব বাটন ব্যাকগ্রাউন্ড কালার' : 'Subscribe Button BG Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.footer_newsletter_btn_bg || formData.footer_text_color || '#0F172A'}
                      onChange={(e) => setFormData({ ...formData, footer_newsletter_btn_bg: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.footer_newsletter_btn_bg || formData.footer_text_color || '#0F172A'}
                      onChange={(e) => setFormData({ ...formData, footer_newsletter_btn_bg: e.target.value })}
                      placeholder="#0F172A"
                      className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs">
                    {isBn ? 'সাবস্ক্রাইব বাটন টেক্সট কালার' : 'Subscribe Button Text Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.footer_newsletter_btn_text_color || formData.footer_bg_color || '#F97316'}
                      onChange={(e) => setFormData({ ...formData, footer_newsletter_btn_text_color: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2C323F] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.footer_newsletter_btn_text_color || formData.footer_bg_color || '#F97316'}
                      onChange={(e) => setFormData({ ...formData, footer_newsletter_btn_text_color: e.target.value })}
                      placeholder="#F97316"
                      className="flex-1 bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="pt-3 border-t border-[#2C323F]">
                <p className="text-xs font-bold text-slate-400 mb-2">
                  {isBn ? 'লাইভ প্রিভিউ (ফুটারের মতো প্রদর্শিত হবে):' : 'Live Preview (How it appears in Footer):'}
                </p>
                <div
                  style={{ backgroundColor: formData.footer_bg_color || '#F97316' }}
                  className="p-4 rounded-xl max-w-sm border border-black/10 transition-colors"
                >
                  <p
                    style={{ color: formData.footer_text_color || '#0F172A' }}
                    className="text-xs font-black uppercase tracking-wider mb-1"
                  >
                    {isBn
                      ? (formData.footer_newsletter_title_bn || 'অফার ও নিউজলেটার')
                      : (formData.footer_newsletter_title_en || formData.footer_newsletter_title || 'JOIN THE SHOPHATBD CLUB')}
                  </p>
                  <p
                    style={{ color: formData.footer_text_color || '#0F172A' }}
                    className="text-[11px] font-medium mb-2.5 opacity-90 leading-tight"
                  >
                    {isBn
                      ? (formData.footer_newsletter_sub_bn || 'সাবস্ক্রাইব করে প্রথম অর্ডারে ১০% বিশেষ ছাড় উপভোগ করুন।')
                      : (formData.footer_newsletter_sub_en || formData.footer_newsletter_sub || 'Subscribe to get 10% OFF your first order, exclusive Eid flash sales, and new drop alerts.')}
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      disabled
                      placeholder={
                        isBn
                          ? (formData.footer_newsletter_placeholder_bn || 'আপনার ইমেইল লিখুন...')
                          : (formData.footer_newsletter_placeholder_en || 'Enter your email...')
                      }
                      className="w-full bg-white border border-black/15 rounded-xl py-1.5 px-3 text-xs text-slate-900 placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      disabled
                      style={{
                        backgroundColor: formData.footer_newsletter_btn_bg || formData.footer_text_color || '#0F172A',
                        color: formData.footer_newsletter_btn_text_color || formData.footer_bg_color || '#F97316'
                      }}
                      className="w-full font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {isBn
                          ? (formData.footer_newsletter_btn_bn || 'সাবস্ক্রাইব করুন')
                          : (formData.footer_newsletter_btn_en || 'Subscribe')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Custom Service Links & Policy Links Hub */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C323F] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span>{isBn ? 'ফুটার নেভিগেশন ও পলিসি লিংক' : 'Footer Navigation & Policy Links'}</span>
                    <span className="ml-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-full text-[10px] font-mono">
                      {serviceLinks.length} {isBn ? 'টি লিংক' : 'Links'}
                    </span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isBn
                      ? 'ফুটারের নেভিগেশন লিংকসমূহ সাজান, সরাসরি টাইটেল রিনেইম করুন এবং পেজ নির্ধারণ করুন।'
                      : 'Organize footer navigation links, rename titles directly, and customize target pages.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isBn ? 'নতুন লিংক যোগ করুন' : 'Add Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={initDefaultLinks}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-[#252A36] border border-[#2C323F] rounded-lg transition-colors"
                    title={isBn ? 'ডিফল্ট ২ টি লিংক রিস্টোর করুন' : 'Reset to Default 2 Links'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Service Links Grid styled exactly like Store Policy Management Hub */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-1">
                {serviceLinks.map((link, idx) => {
                  const isActive = link.is_active !== false;

                  return (
                    <div
                      key={link.id || idx}
                      className={`p-3 bg-[#1E222B] border rounded-2xl flex flex-col justify-between gap-2.5 transition-all shadow-sm ${
                        isActive
                          ? 'border-[#2C323F] hover:border-amber-500/40 hover:shadow-md'
                          : 'border-dashed border-slate-700/60 opacity-60 bg-[#161920]'
                      }`}
                    >
                      {/* Top: Rounded Pill with Title - Directly editable & renameable */}
                      <div className="w-full">
                        <div className="rounded-full bg-[#14171E] border border-[#2C323F] hover:border-slate-500 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 px-3.5 py-1.5 flex items-center gap-2 transition-all shadow-inner group">
                          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full shrink-0">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={isBn ? (link.label_bn || link.label) : (link.label || link.label_bn)}
                            onChange={(e) => {
                              const val = e.target.value;
                              setServiceLinks((prev) =>
                                prev.map((l) =>
                                  l.id === link.id
                                    ? {
                                        ...l,
                                        [isBn ? 'label_bn' : 'label']: val,
                                        label: !isBn || !l.label ? val : l.label
                                      }
                                    : l
                                )
                              );
                            }}
                            placeholder={isBn ? 'লিংকের নাম লিখুন...' : 'Enter link label...'}
                            className="flex-1 bg-transparent text-white font-bold text-xs outline-none min-w-0 placeholder:text-slate-600 focus:text-amber-300"
                            title={isBn ? 'এখানে সরাসরি টাইটেল রিনেইম করুন' : 'Rename link label directly'}
                          />
                          <div className="flex items-center text-slate-500 group-hover:text-amber-400 group-focus-within:text-amber-400 shrink-0 transition-colors pointer-events-none pr-0.5">
                            <Edit3 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>

                      {/* Short Description Preview if available */}
                      {(link.short_description_bn || link.short_description) && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 italic px-1">
                          "{isBn ? (link.short_description_bn || link.short_description) : (link.short_description || link.short_description_bn)}"
                        </p>
                      )}

                      {/* Action & Info Row - Identical to Store Policy Management & Pages Hub */}
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        {/* Word Count & Active Status */}
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <div className="flex items-center gap-1 text-[10px] bg-[#14171E] px-2 py-1 rounded-lg border border-[#252A36]">
                            <span className="text-slate-500 font-medium">{isBn ? 'শব্দ:' : 'Words:'}</span>
                            <span className="font-mono text-amber-300 font-bold">
                              {((link.description_bn || link.description_en || '').trim().split(/\s+/).filter(Boolean).length)} {isBn ? 'শব্দ' : 'words'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleUpdateLink(link.id, 'is_active', !isActive)}
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-colors ${
                              isActive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                            title={isBn ? 'সক্রিয়/নিষ্ক্রিয় টগল' : 'Toggle Active'}
                          >
                            {isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'বন্ধ' : 'Disabled')}
                          </button>
                        </div>

                        {/* Up / Down Reorder + Edit Modal + Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="flex items-center bg-[#0E121A] border border-[#2C323F] rounded-lg p-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveServiceLink(idx, 'up')}
                              className={`p-1 rounded transition-colors ${
                                idx === 0
                                  ? 'text-slate-600 cursor-not-allowed opacity-30'
                                  : 'text-slate-300 hover:text-amber-400 hover:bg-[#252A36]'
                              }`}
                              title={isBn ? 'উপরে নিন (Move Up)' : 'Move Up'}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-[1px] h-3 bg-[#2C323F]" />
                            <button
                              type="button"
                              disabled={idx === serviceLinks.length - 1}
                              onClick={() => handleMoveServiceLink(idx, 'down')}
                              className={`p-1 rounded transition-colors ${
                                idx === serviceLinks.length - 1
                                  ? 'text-slate-600 cursor-not-allowed opacity-30'
                                  : 'text-slate-300 hover:text-amber-400 hover:bg-[#252A36]'
                              }`}
                              title={isBn ? 'নিচে নিন (Move Down)' : 'Move Down'}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenEditLink(link)}
                            className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-[#252A36] border border-[#2C323F] rounded-lg transition-colors"
                            title={isBn ? 'লিংক ও পেজ রুট এডিট করুন' : 'Edit Link & Page Route'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setLinkToDelete(link.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-[#2C323F] rounded-lg transition-colors"
                            title={isBn ? 'লিংক মুছে ফেলুন' : 'Delete Link'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Master Policy Management Hub */}
              <div className="mt-4 p-4 bg-[#14171E] border border-[#2C323F] rounded-xl space-y-3">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-[#252A36] pb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>{isBn ? 'স্টোর পলিসি ম্যানেজমেন্ট ও পেজ হাব' : 'Store Policy Management & Pages Hub'}</span>
                      <span className="ml-1.5 px-2 py-0.2 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-full text-[10px] font-mono">
                        {policyLinks.length} {isBn ? 'টি পলিসি' : 'Policies'}
                      </span>
                    </h4>

                    {/* Marked in screenshot: CUSTOMER SERVICE & POLICIES directly editable cell */}
                    <div className="mt-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-black uppercase tracking-wider">
                          {isBn ? 'ফুটার কলাম হেডিং' : 'FOOTER COLUMN TITLE'}
                        </span>
                      </div>

                      {/* English Input Cell - specifically for CUSTOMER SERVICE & POLICIES */}
                      <div className="flex-1 rounded-xl bg-[#0E121A] border border-[#2C323F] hover:border-slate-500 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 px-3 py-1.5 flex items-center gap-2 transition-all shadow-inner group">
                        <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">EN:</span>
                        <input
                          type="text"
                          value={formData.footer_policies_title_en ?? (formData.footer_policies_title || 'CUSTOMER SERVICE & POLICIES')}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev: any) => ({
                              ...prev,
                              footer_policies_title_en: val,
                              footer_policies_title: val
                            }));
                          }}
                          placeholder="CUSTOMER SERVICE & POLICIES"
                          className="flex-1 bg-transparent text-white font-black text-xs uppercase tracking-wider outline-none min-w-0 placeholder:text-slate-600 focus:text-amber-300"
                          title={isBn ? "ফুটার পলিসি কলামের ইংলিশ হেডিং সরাসরি রিনেইম করুন" : "Rename Customer Service & Policies footer heading"}
                        />
                        <div className="flex items-center text-slate-500 group-hover:text-amber-400 group-focus-within:text-amber-400 shrink-0 transition-colors pointer-events-none">
                          <Edit3 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Bengali Input Cell */}
                      <div className="flex-1 rounded-xl bg-[#0E121A] border border-[#2C323F] hover:border-slate-500 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 px-3 py-1.5 flex items-center gap-2 transition-all shadow-inner group">
                        <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">বাংলা:</span>
                        <input
                          type="text"
                          value={formData.footer_policies_title_bn ?? 'গ্রাহক সেবা ও পলিসি'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev: any) => ({
                              ...prev,
                              footer_policies_title_bn: val
                            }));
                          }}
                          placeholder="গ্রাহক সেবা ও পলিসি"
                          className="flex-1 bg-transparent text-white font-bold text-xs outline-none min-w-0 placeholder:text-slate-600 focus:text-amber-300"
                          title={isBn ? "ফুটার পলিসি কলামের বাংলা হেডিং সরাসরি রিনেইম করুন" : "Rename Customer Service & Policies Bangla heading"}
                        />
                        <div className="flex items-center text-slate-500 group-hover:text-amber-400 group-focus-within:text-amber-400 shrink-0 transition-colors pointer-events-none">
                          <Edit3 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2">
                      {isBn
                        ? 'পলিসির নাম ও ১০০০ শব্দের বিস্তারিত বিবরণ এডিট করুন, আপ/ডাউন তীর দিয়ে ক্রম পরিবর্তন করুন অথবা সরাসরি ভিউ পেজে দেখুন।'
                        : 'Edit policy titles, up to 1000 words descriptions in Bengali & English, reorder with Up/Down arrows, or preview live policy pages.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleOpenAddPolicy}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isBn ? 'নতুন পলিসি যোগ করুন' : 'Add Policy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetDefaultPolicies}
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-[#252A36] border border-[#2C323F] rounded-lg transition-colors"
                      title={isBn ? 'ডিফল্ট পলিসি রিস্টোর করুন' : 'Reset to Default Policies'}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Policy Links Grid with Top Rounded Title Cell for Direct Renaming */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-1">
                  {policyLinks.map((pol, idx) => {
                    const isActive = pol.is_active !== false;
                    const wordsBn = countWords(pol.description_bn);
                    const wordsEn = countWords(pol.description_en);

                    return (
                      <div
                        key={pol.id || idx}
                        className={`p-3 bg-[#1E222B] border rounded-2xl flex flex-col justify-between gap-2.5 transition-all shadow-sm ${
                          isActive
                            ? 'border-[#2C323F] hover:border-amber-500/40 hover:shadow-md'
                            : 'border-dashed border-slate-700/60 opacity-60 bg-[#161920]'
                        }`}
                      >
                        {/* Top: Rounded Pill with Title - Directly editable & renameable from here */}
                        <div className="w-full">
                          <div className="rounded-full bg-[#14171E] border border-[#2C323F] hover:border-slate-500 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 px-3.5 py-1.5 flex items-center gap-2 transition-all shadow-inner group">
                            <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full shrink-0">
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={isBn ? (pol.title_bn || pol.title) : (pol.title || pol.title_bn)}
                              onChange={(e) => handleRenamePolicyTitle(pol.id, e.target.value)}
                              placeholder={isBn ? "পলিসির নাম লিখুন..." : "Enter policy title..."}
                              className="flex-1 bg-transparent text-white font-bold text-xs outline-none min-w-0 placeholder:text-slate-600 focus:text-amber-300"
                              title={isBn ? "এখানে সরাসরি টাইটেল রিনেইম করুন" : "Rename policy title directly"}
                            />
                            <div className="flex items-center text-slate-500 group-hover:text-amber-400 group-focus-within:text-amber-400 shrink-0 transition-colors pointer-events-none pr-0.5">
                              <Edit3 className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>

                        {/* Action & Info Row */}
                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          {/* Route, Word Count & Active Status */}
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                            <div className="flex items-center gap-1 text-[10px] bg-[#14171E] px-2 py-1 rounded-lg border border-[#252A36]">
                              <span className="text-slate-500 font-medium">{isBn ? 'রুট:' : 'Route:'}</span>
                              <span className="font-mono text-cyan-300 truncate max-w-[100px]" title={pol.path}>
                                #{pol.path}
                              </span>
                            </div>

                            {(wordsBn > 0 || wordsEn > 0) && (
                              <span className="text-[9px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md font-mono">
                                {isBn ? `${wordsBn} শব্দ` : `${wordsEn} words`}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleTogglePolicyActive(pol.id)}
                              className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-colors ${
                                isActive
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                              title={isBn ? 'সক্রিয়/নিষ্ক্রিয় টগল' : 'Toggle Active'}
                            >
                              {isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'বন্ধ' : 'Disabled')}
                            </button>
                          </div>

                          {/* Up / Down Reorder + Edit Modal + Delete */}
                          <div className="flex items-center gap-1 shrink-0">
                            <div className="flex items-center bg-[#0E121A] border border-[#2C323F] rounded-lg p-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMovePolicyLink(idx, 'up')}
                                className={`p-1 rounded transition-colors ${
                                  idx === 0
                                    ? 'text-slate-600 cursor-not-allowed opacity-30'
                                    : 'text-slate-300 hover:text-amber-400 hover:bg-[#252A36]'
                                }`}
                                title={isBn ? 'উপরে নিন (Move Up)' : 'Move Up'}
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <div className="w-[1px] h-3 bg-[#2C323F]" />
                              <button
                                type="button"
                                disabled={idx === policyLinks.length - 1}
                                onClick={() => handleMovePolicyLink(idx, 'down')}
                                className={`p-1 rounded transition-colors ${
                                  idx === policyLinks.length - 1
                                    ? 'text-slate-600 cursor-not-allowed opacity-30'
                                    : 'text-slate-300 hover:text-amber-400 hover:bg-[#252A36]'
                                }`}
                                title={isBn ? 'নিচে নিন (Move Down)' : 'Move Down'}
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenEditPolicy(pol)}
                              className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-[#252A36] border border-[#2C323F] rounded-lg transition-colors"
                              title={isBn ? 'পলিসি ও বর্ণনা এডিট করুন' : 'Edit Policy & Description'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setPolicyToDelete(pol.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-[#2C323F] rounded-lg transition-colors"
                              title={isBn ? 'পলিসি মুছে ফেলুন' : 'Delete Policy'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SHIPPING & DELIVERY */}
        {/* ========================================================================= */}
        {activeTab === 'shipping' && (
          <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-[#2C323F] pb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>{isBn ? 'সারাদেশে ডেলিভারি চার্জ ও শিপিং পলিসি' : 'Nationwide Shipping Rates & Delivery Policy'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'ঢাকা সিটির ভিতরে ডেলিভারি চার্জ (৳)' : 'Inside Dhaka City (৳)'}
                </label>
                <input
                  type="number"
                  value={formData.shipping_inside_dhaka ?? 60}
                  onChange={(e) => setFormData({ ...formData, shipping_inside_dhaka: Number(e.target.value) })}
                  className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {isBn ? 'ঢাকা মেট্রো এলাকার ডিফল্ট ডেলিভারি চার্জ' : 'Default fee for Dhaka metro'}
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'ঢাকা সিটির বাইরে ডেলিভারি চার্জ (৳)' : 'Outside Dhaka City (৳)'}
                </label>
                <input
                  type="number"
                  value={formData.shipping_outside_dhaka ?? 120}
                  onChange={(e) => setFormData({ ...formData, shipping_outside_dhaka: Number(e.target.value) })}
                  className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {isBn ? 'সারাদেশে কুরিয়ার ডেলিভারি চার্জ' : 'Nationwide courier rate'}
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'ফ্রি ডেলিভারি পেতে সর্বনিম্ন অর্ডারের পরিমাণ (৳)' : 'Free Shipping Minimum (৳)'}
                </label>
                <input
                  type="number"
                  value={formData.free_shipping_threshold ?? 2500}
                  onChange={(e) => setFormData({ ...formData, free_shipping_threshold: Number(e.target.value) })}
                  className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {isBn ? 'এই পরিমাণের বেশি অর্ডারে কাস্টমার ফ্রি ডেলিভারি পাবেন' : 'Orders above this qualify for free shipping'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PAYMENT GATEWAYS */}
        {/* ========================================================================= */}
        {activeTab === 'payments' && (
          <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C323F] pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>{isBn ? 'ফুটার স্বীকৃত পেমেন্ট গেটওয়ে কাস্টমাইজেশন' : 'Footer Accepted Payment Gateways Customization'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isBn ? 'স্টোরফ্রন্ট ফুটারে কাস্টমারদের জন্য পেমেন্ট গেটওয়ে সেকশন ও ব্যাজসমূহ প্রদর্শন, যোগ/বিয়োগ ও ক্রম নিয়ন্ত্রণ করুন।' : 'Manage accepted payment gateway badges in storefront footer with live layout preview.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')}</span>
              </button>
            </div>

            {/* Master Toggle: Show/Hide Entire Accepted Payment Gateways Section in Footer */}
            <div className="p-4 bg-[#14171E] border border-[#2C323F] rounded-xl flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-white block text-sm">
                  {isBn ? 'ফুটারে স্বীকৃত পেমেন্ট গেটওয়ে সেকশন প্রদর্শন করুন' : 'Show Accepted Payment Gateways Section in Footer'}
                </span>
                <span className="text-xs text-slate-400">
                  {isBn ? 'চেক মার্ক দিলে স্টোরফ্রন্ট ফুটারে পেমেন্ট ব্যাজসমূহ শো করবে, চেক মার্ক তুলে দিলে হাইড হয়ে যাবে।' : 'When checked, the payment badges block will appear inside the footer newsletter & payment container.'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formData.show_accepted_payment_gateways !== 'false'}
                  onChange={(e) => setFormData({ ...formData, show_accepted_payment_gateways: e.target.checked ? 'true' : 'false' })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Live Visual Preview of Footer Payment Badges */}
            <div className="p-4 bg-[#14171E] border border-amber-500/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {isBn ? 'লাইভ ফুটার নমুনা প্রিভিউ' : 'Live Footer Badge Style Preview'}
                  </span>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                  {paymentBadges.filter(b => b.is_active).length} {isBn ? 'টি সক্রিয় ব্যাজ' : 'Active Badges'}
                </span>
              </div>

              {/* Styled Preview Container */}
              <div className="p-4 bg-[#1e2530] border border-slate-700 rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-slate-300">
                  {isBn
                    ? (formData.accepted_payment_gateways_title_bn || 'গৃহীত পেমেন্ট মেথডসমূহ')
                    : (formData.accepted_payment_gateways_title_en || 'Accepted Payment Gateways')}
                </p>
                <PaymentBadges
                  badgesJson={JSON.stringify(paymentBadges)}
                  isBn={isBn}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {isBn
                  ? 'উপরে প্রদর্শিত নমুনার মতো স্টোরফ্রন্ট ফুটারে কাস্টমারদের জন্য পেমেন্ট ব্যাজসমূহ সুন্দর বর্ডারে প্রদর্শিত হবে।'
                  : 'This shows the exact visual rendering displayed to customers in the storefront footer.'}
              </p>
            </div>

            {/* Payment Method Badges Management List */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBn ? 'পেমেন্ট মেথড ব্যাজসমূহ পরিচালনা ও কাস্টমাইজেশন:' : 'Manage Payment Method Badges:'}</span>
                </h4>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetDefaultPaymentBadges}
                    className="px-3 py-1.5 bg-[#14171E] hover:bg-slate-800 text-slate-300 border border-[#2C323F] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title={isBn ? 'ডিফল্ট ৪টি ব্যাজে ফিরিয়ে নিন' : 'Reset to default 4 badges'}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isBn ? 'ডিফল্ট ৪টি ব্যাজ' : 'Reset Defaults'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddPaymentBadge}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isBn ? 'নতুন মেথড যোগ করুন' : 'Add Payment Method'}</span>
                  </button>
                </div>
              </div>

              {/* Badges List */}
              <div className="space-y-2.5">
                {paymentBadges.map((badge, index) => (
                  <div
                    key={badge.id}
                    className={`p-3.5 bg-[#14171E] border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      badge.is_active ? 'border-[#2C323F]' : 'border-slate-800 opacity-60'
                    }`}
                  >
                    {/* Left: Badge Logo Preview & Names */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 px-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                        {renderPaymentLogo(badge.type, badge.logo_url)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {isBn ? (badge.name_bn || badge.name) : (badge.name || badge.name_bn)}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {badge.type.toUpperCase()}
                          </span>
                          {!badge.is_active && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              {isBn ? 'বন্ধ' : 'Disabled'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          EN: {badge.name} | BN: {badge.name_bn || badge.name}
                        </p>
                      </div>
                    </div>

                    {/* Right: Controls (Move Up/Down, Active Switch, Edit, Delete) */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMovePaymentBadge(index, 'up')}
                        className="w-7 h-7 rounded-lg bg-[#1E222B] hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-[#1E222B] flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                        title={isBn ? 'উপরে নিন' : 'Move Up'}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={index === paymentBadges.length - 1}
                        onClick={() => handleMovePaymentBadge(index, 'down')}
                        className="w-7 h-7 rounded-lg bg-[#1E222B] hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-[#1E222B] flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                        title={isBn ? 'নিচে নিন' : 'Move Down'}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Active Toggle Switch */}
                      <label className="relative inline-flex items-center cursor-pointer ml-1" title={isBn ? 'সক্রিয় / বন্ধ করুন' : 'Toggle Active'}>
                        <input
                          type="checkbox"
                          checked={badge.is_active !== false}
                          onChange={() => handleTogglePaymentBadgeActive(badge.id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditPaymentBadge(badge)}
                        className="p-1.5 bg-[#1E222B] hover:bg-slate-700 text-amber-400 rounded-lg transition-colors cursor-pointer ml-1"
                        title={isBn ? 'সম্পাদনা করুন' : 'Edit Badge'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setPaymentBadgeToDelete(badge.id)}
                        className="p-1.5 bg-[#1E222B] hover:bg-rose-900/40 text-rose-400 rounded-lg transition-colors cursor-pointer"
                        title={isBn ? 'মুছে ফেলুন' : 'Delete Badge'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Title Customization */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-bold block mb-1 text-xs">
                  {isBn ? 'ফুটারে পেমেন্ট সেকশন শিরোনাম (বাংলা)' : 'Footer Payment Section Title (Bengali)'}
                </label>
                <input
                  type="text"
                  value={formData.accepted_payment_gateways_title_bn || ''}
                  onChange={(e) => setFormData({ ...formData, accepted_payment_gateways_title_bn: e.target.value })}
                  placeholder="গৃহীত পেমেন্ট মেথডসমূহ"
                  className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1 text-xs">
                  {isBn ? 'ফুটারে পেমেন্ট সেকশন শিরোনাম (English)' : 'Footer Payment Section Title (English)'}
                </label>
                <input
                  type="text"
                  value={formData.accepted_payment_gateways_title_en || ''}
                  onChange={(e) => setFormData({ ...formData, accepted_payment_gateways_title_en: e.target.value })}
                  placeholder="Accepted Payment Gateways"
                  className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Dedicated Save Changes Button at Bottom of Tab */}
            <div className="pt-4 border-t border-[#2C323F] flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving Changes...') : (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CONTACT & SOCIALS */}
        {/* ========================================================================= */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            {/* Helpline and Corporate Address */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-6">
              <h3 className="text-sm font-bold text-white border-b border-[#2C323F] pb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>{isBn ? 'কাস্টমার হেল্পলাইন ও প্রাতিষ্ঠানিক ঠিকানা' : 'Customer Helpline & Corporate Addresses'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'কাস্টমার হেল্পলাইন ফোন নম্বর' : 'Customer Helpline Phone'}
                  </label>
                  <input
                    type="text"
                    value={formData.contact_phone || ''}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+880 1711-234567"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'অফিসিয়াল সাপোর্ট ইমেইল' : 'Official Support Email'}
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="contact@shophatbd.com"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'শোরুম ও কর্পোরেট অফিসের ঠিকানা (ইংরেজি)' : 'Showroom & Corporate Address (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.company_address_en || ''}
                    onChange={(e) => setFormData({ ...formData, company_address_en: e.target.value })}
                    placeholder="House 42, Road 11, Block D, Banani, Dhaka-1213"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'শোরুম ও কর্পোরেট অফিসের ঠিকানা (বাংলা)' : 'Showroom & Corporate Address (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.company_address_bn || ''}
                    onChange={(e) => setFormData({ ...formData, company_address_bn: e.target.value })}
                    placeholder="বাড়ি ৪২, রোড ১১, ব্লক ডি, বনানী, ঢাকা-১২১৩"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'সাপোর্ট কার্যঘণ্টা / কাজের সময় (English)' : 'Support Operating Hours (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.support_hours_en || ''}
                    onChange={(e) => setFormData({ ...formData, support_hours_en: e.target.value })}
                    placeholder="Sat - Thu: 9:00 AM - 10:00 PM"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'সাপোর্ট কার্যঘণ্টা / কাজের সময় (বাংলা)' : 'Support Operating Hours (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.support_hours_bn || ''}
                    onChange={(e) => setFormData({ ...formData, support_hours_bn: e.target.value })}
                    placeholder="শনিবার - বৃহস্পতিবার: সকাল ৯:০০ - রাত ১০:০০"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'রেসপন্স টাইম / উত্তর দেওয়ার সময় (English)' : 'Support Response Time (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.support_response_time_en || ''}
                    onChange={(e) => setFormData({ ...formData, support_response_time_en: e.target.value })}
                    placeholder="Response within 2 hours"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {isBn ? 'রেসপন্স টাইম / উত্তর দেওয়ার সময় (বাংলা)' : 'Support Response Time (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.support_response_time_bn || ''}
                    onChange={(e) => setFormData({ ...formData, support_response_time_bn: e.target.value })}
                    placeholder="২ ঘণ্টার মধ্যে উত্তর দেওয়া হয়"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Floating Customer Care & Chat Action Buttons (WhatsApp, Messenger, AI Support) */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C323F] pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>{isBn ? 'ভাসমান চ্যাট ও হেল্পলাইন বাটনসমূহ (Floating Chat Widgets)' : 'Floating Customer Care & Chat Buttons'}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      Storefront Action Stack
                    </span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isBn
                      ? 'স্টোরফ্রন্টের নিচের ডান কোনায় গোল ভাসমান বাটনসমূহ কাস্টমাইজ করুন। উপর থেকে নিচে ক্রমানুসারে: ১. হোয়াটসঅ্যাপ বাটন (অরিজিনাল), ২. মেসেঞ্জার বাটন (অরিজিনাল), ৩. এআই চ্যাট বাটন (কাস্টমাইজেবল কালার)।'
                      : 'Customize circular floating chat buttons in bottom-right corner. Top: WhatsApp, Middle: Messenger, Bottom: AI Chat. Only the AI Chat button color is customizable.'}
                  </p>
                </div>
              </div>

              {/* 3 Widgets Stack Grid */}
              <div className="space-y-4">
                {/* 1. WHATSAPP CHAT BUTTON (TOP) */}
                <div className="p-4 bg-[#14171E] border border-[#2C323F] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between gap-3 border-b border-[#2C323F] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md shrink-0">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 14.41C16.31 14.29 15.1 13.69 14.88 13.61C14.65 13.53 14.49 13.49 14.32 13.73C14.16 13.98 13.69 14.53 13.54 14.69C13.4 14.86 13.25 14.88 13 14.76C12.75 14.63 11.95 14.37 11 13.53C10.26 12.87 9.76 12.06 9.61 11.82C9.47 11.57 9.6 11.44 9.72 11.31C9.83 11.2 9.97 11.02 10.1 10.88C10.22 10.73 10.26 10.63 10.34 10.46C10.42 10.3 10.38 10.15 10.32 10.03C10.26 9.91 9.78 8.72 9.57 8.23C9.38 7.75 9.18 7.82 9.03 7.81C8.89 7.8 8.73 7.8 8.56 7.8C8.4 7.8 8.13 7.86 7.91 8.11C7.68 8.35 7.04 8.95 7.04 10.18C7.04 11.4 7.93 12.58 8.05 12.75C8.18 12.91 9.8 15.41 12.28 16.48C12.87 16.74 13.33 16.89 13.69 17.01C14.28 17.19 14.82 17.17 15.25 17.1C15.73 17.03 16.72 16.5 16.93 15.93C17.13 15.35 17.13 14.86 17.07 14.76C17.01 14.65 16.82 14.54 16.56 14.41Z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            1. {isBn ? 'ভাসমান হোয়াটসঅ্যাপ চ্যাট বাটন (১ম বাটন - উপরে)' : 'Floating WhatsApp Chat (1st Button - Top)'}
                          </span>
                          <span className="text-[10px] bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40 px-2 py-0.5 rounded-full font-bold">
                            {isBn ? 'স্বয়ংক্রিয় অরিজিনাল কালার' : 'Original Brand Style'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isBn
                            ? 'কাস্টমাররা সরাসরি এক ক্লিকে আপনার হোয়াটসঅ্যাপে মেসেজ পাঠাতে পারবে।'
                            : 'Customers can directly message your WhatsApp support in one click.'}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.whatsapp_chat_enabled === undefined || formData.whatsapp_chat_enabled === '' || formData.whatsapp_chat_enabled === '1' || formData.whatsapp_chat_enabled === true || formData.whatsapp_chat_enabled === 'true'}
                        onChange={(e) => setFormData({ ...formData, whatsapp_chat_enabled: e.target.checked ? '1' : '0' })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                    </label>
                  </div>

                  {(formData.whatsapp_chat_enabled === undefined || formData.whatsapp_chat_enabled === '' || formData.whatsapp_chat_enabled === '1' || formData.whatsapp_chat_enabled === true || formData.whatsapp_chat_enabled === 'true') && (
                    <div className="pt-2 space-y-3 bg-[#1a1e27] p-4 rounded-xl border border-[#2C323F]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-300 font-bold block mb-1 text-xs flex items-center justify-between">
                            <span>{isBn ? 'হোয়াটসঅ্যাপ নম্বর (WhatsApp Number)' : 'WhatsApp Phone Number'} <span className="text-rose-400">*</span></span>
                            <span className="text-[10px] text-slate-400 font-normal">017XXXXXXXX / 88017...</span>
                          </label>
                          <input
                            type="text"
                            value={formData.whatsapp_chat_number !== undefined ? formData.whatsapp_chat_number : (formData.contact_whatsapp || formData.contact_phone || '')}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData({
                                ...formData,
                                whatsapp_chat_number: val,
                                contact_whatsapp: val
                              });
                            }}
                            placeholder="017XXXXXXXX বা 88017XXXXXXXX"
                            className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#25D366]"
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 font-bold block mb-1 text-xs">
                            {isBn ? 'ডিফল্ট প্রারম্ভিক মেসেজ (Default Customer Greeting)' : 'Pre-typed Greeting Message'}
                          </label>
                          <input
                            type="text"
                            value={formData.whatsapp_chat_greeting !== undefined ? formData.whatsapp_chat_greeting : 'Hello SHOPHATBD, I want to know more about your products.'}
                            onChange={(e) => setFormData({ ...formData, whatsapp_chat_greeting: e.target.value })}
                            placeholder="Hello SHOPHATBD, I want to know more about your products."
                            className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#25D366]"
                          />
                        </div>
                      </div>

                      {/* Live WhatsApp Preview & Test */}
                      <div className="pt-2 border-t border-[#2C323F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <span className="text-[11px] text-slate-400">{isBn ? 'সরাসরি লিঙ্ক প্রিভিউ:' : 'Direct Link:'}</span>
                          <code className="bg-[#14171E] text-[#25D366] px-2 py-0.5 rounded text-[11px] font-mono truncate max-w-xs sm:max-w-md">
                            https://wa.me/{(formData.whatsapp_chat_number || formData.contact_whatsapp || formData.contact_phone || '8801700000000').replace(/[^0-9]/g, '').replace(/^01/, '8801')}
                          </code>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            let raw = (formData.whatsapp_chat_number || formData.contact_whatsapp || formData.contact_phone || '').replace(/[^0-9]/g, '');
                            if (raw.length === 11 && raw.startsWith('01')) raw = '88' + raw;
                            const greeting = formData.whatsapp_chat_greeting || 'Hello SHOPHATBD, I want to know more about your products.';
                            if (raw) {
                              window.open(`https://wa.me/${raw}?text=${encodeURIComponent(greeting)}`, '_blank');
                            }
                          }}
                          disabled={!(formData.whatsapp_chat_number || formData.contact_whatsapp || formData.contact_phone)}
                          className="bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isBn ? 'হোয়াটসঅ্যাপ টেস্ট করুন' : 'Test WhatsApp'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. MESSENGER CHAT BUTTON (MIDDLE) */}
                <div className="p-4 bg-[#14171E] border border-[#2C323F] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between gap-3 border-b border-[#2C323F] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0084FF] via-[#00B2FF] to-[#006AFF] text-white flex items-center justify-center shadow-md shrink-0">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2C6.36 2 2 6.13 2 11.7C2 14.61 3.39 17.18 5.71 18.84V22L8.98 20.21C9.93 20.47 10.94 20.61 12 20.61C17.64 20.61 22 16.48 22 10.91C22 5.34 17.64 2 12 2ZM13.06 14.19L10.53 11.48L5.6 14.19L10.94 8.52L13.47 11.23L18.4 8.52L13.06 14.19Z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            2. {isBn ? 'ভাসমান ফেসবুক মেসেঞ্জার বাটন (২য় বাটন - মাঝে)' : 'Floating Facebook Messenger (2nd Button - Middle)'}
                          </span>
                          <span className="text-[10px] bg-[#0084FF]/20 text-[#00B2FF] border border-[#0084FF]/40 px-2 py-0.5 rounded-full font-bold">
                            {isBn ? 'স্বয়ংক্রিয় অরিজিনাল কালার' : 'Original Brand Style'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isBn
                            ? 'কাস্টমাররা বাটনে ক্লিক করে সরাসরি ফেসবুক মেসেঞ্জারে আপনার পেজের সাথে ইনবক্স করতে পারবে।'
                            : 'Customers can click to start an instant Facebook Messenger chat with your Page.'}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.messenger_chat_enabled === undefined || formData.messenger_chat_enabled === '' || formData.messenger_chat_enabled === '1' || formData.messenger_chat_enabled === true || formData.messenger_chat_enabled === 'true'}
                        onChange={(e) => setFormData({ ...formData, messenger_chat_enabled: e.target.checked ? '1' : '0' })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0084FF]"></div>
                    </label>
                  </div>

                  {(formData.messenger_chat_enabled === undefined || formData.messenger_chat_enabled === '' || formData.messenger_chat_enabled === '1' || formData.messenger_chat_enabled === true || formData.messenger_chat_enabled === 'true') && (
                    <div className="pt-2 space-y-3 bg-[#1a1e27] p-4 rounded-xl border border-[#2C323F]">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1 text-xs flex items-center justify-between">
                          <span>{isBn ? 'ফেসবুক পেজ ইউজারনেম বা লিঙ্ক (Facebook Page Username or URL)' : 'Facebook Page Username / m.me Link'} <span className="text-rose-400">*</span></span>
                          <span className="text-[10px] text-slate-400 font-normal">e.g. shophatbdbd / https://m.me/shophatbdbd</span>
                        </label>
                        <input
                          type="text"
                          value={formData.messenger_page_username !== undefined ? formData.messenger_page_username : (formData.facebook_url || '')}
                          onChange={(e) => setFormData({ ...formData, messenger_page_username: e.target.value })}
                          placeholder="shophatbdbd বা https://m.me/shophatbdbd বা https://facebook.com/shophatbdbd"
                          className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#0084FF]"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          {isBn
                            ? '💡 আপনার ফেসবুক পেজের নাম বা লিঙ্ক দিলে স্বয়ংক্রিয়ভাবে সরাসরি মেসেঞ্জার লিঙ্ক m.me/... তৈরি হয়ে যাবে।'
                            : '💡 Entering your Page username or URL creates a direct m.me link automatically.'}
                        </p>
                      </div>

                      {/* Live Messenger Preview & Test */}
                      <div className="pt-2 border-t border-[#2C323F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <span className="text-[11px] text-slate-400">{isBn ? 'মেসেঞ্জার লিঙ্ক প্রিভিউ:' : 'Direct Messenger Link:'}</span>
                          <code className="bg-[#14171E] text-[#00B2FF] px-2 py-0.5 rounded text-[11px] font-mono truncate max-w-xs sm:max-w-md">
                            {(() => {
                              const raw = (formData.messenger_page_username || formData.facebook_url || 'shophatbdbd').trim();
                              if (raw.startsWith('http://') || raw.startsWith('https://')) {
                                if (raw.includes('m.me/')) return raw;
                                const match = raw.match(/facebook\.com\/([^/?#]+)/);
                                if (match && match[1]) return `https://m.me/${match[1]}`;
                                return raw;
                              }
                              return `https://m.me/${raw.replace(/^@/, '')}`;
                            })()}
                          </code>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const raw = (formData.messenger_page_username || formData.facebook_url || '').trim();
                            let targetUrl = '';
                            if (raw.startsWith('http://') || raw.startsWith('https://')) {
                              if (raw.includes('m.me/')) targetUrl = raw;
                              else {
                                const match = raw.match(/facebook\.com\/([^/?#]+)/);
                                if (match && match[1]) targetUrl = `https://m.me/${match[1]}`;
                                else targetUrl = raw;
                              }
                            } else if (raw) {
                              targetUrl = `https://m.me/${raw.replace(/^@/, '')}`;
                            }
                            if (targetUrl) window.open(targetUrl, '_blank');
                          }}
                          disabled={!(formData.messenger_page_username || formData.facebook_url)}
                          className="bg-gradient-to-r from-[#0084FF] to-[#006AFF] hover:opacity-90 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-opacity shrink-0 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isBn ? 'মেসেঞ্জার টেস্ট করুন' : 'Test Messenger'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. AI CHAT BUTTON (BOTTOM - COLOR CUSTOMIZABLE) */}
                <div className="p-4 bg-[#14171E] border-2 border-amber-500/40 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between gap-3 border-b border-[#2C323F] pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: formData.ai_chat_btn_color || '#F59E0B' }}
                        className="w-10 h-10 rounded-full text-slate-950 flex items-center justify-center shadow-md shrink-0 border-2 border-white/60 relative"
                      >
                        <Bot className="w-5 h-5" />
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            3. {isBn ? 'ভাসমান এআই চ্যাট বাটন (৩য় বাটন - নিচে)' : 'Floating AI Customer Care Chat (3rd Button - Bottom)'}
                          </span>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                            {isBn ? 'কাস্টমাইজেবল কালার' : 'Customizable Color'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isBn
                            ? 'স্মার্ট এআই চ্যাটবট যা ২৪/৭ কাস্টমারদের প্রশ্নের উত্তর দেয়, পণ্য খুঁজে দেয় এবং অর্ডার ট্র্যাকিং করতে সাহায্য করে। এই বাটনটির কালার আপনি নিজের ইচ্ছামতো পছন্দ করতে পারবেন।'
                            : '24/7 AI Smart Bot for customer queries, product discovery, and order status. The button color is fully customizable.'}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.ai_chat_enabled === undefined || formData.ai_chat_enabled === '' || formData.ai_chat_enabled === '1' || formData.ai_chat_enabled === true || formData.ai_chat_enabled === 'true'}
                        onChange={(e) => setFormData({ ...formData, ai_chat_enabled: e.target.checked ? '1' : '0' })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {(formData.ai_chat_enabled === undefined || formData.ai_chat_enabled === '' || formData.ai_chat_enabled === '1' || formData.ai_chat_enabled === true || formData.ai_chat_enabled === 'true') && (
                    <div className="pt-2 space-y-4 bg-[#1a1e27] p-4 rounded-xl border border-[#2C323F]">
                      <div>
                        <label className="text-slate-300 font-bold block mb-2 text-xs flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Palette className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isBn ? 'এআই চ্যাট বাটনের কালার সিলেক্ট করুন (AI Chat Button Color)' : 'Select AI Chat Button Color'}</span>
                          </span>
                          <span className="text-[11px] font-mono text-amber-400 font-bold">
                            {formData.ai_chat_btn_color || '#F59E0B'}
                          </span>
                        </label>

                        {/* Quick Presets Palette */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {[
                            { name: 'Amber Gold', hex: '#F59E0B' },
                            { name: 'Emerald Green', hex: '#10B981' },
                            { name: 'Royal Blue', hex: '#2563EB' },
                            { name: 'Violet Purple', hex: '#7C3AED' },
                            { name: 'Rose Pink', hex: '#F43F5E' },
                            { name: 'Sunset Orange', hex: '#EA580C' },
                            { name: 'Matcha Lime', hex: '#84CC16' },
                            { name: 'Cyan Teal', hex: '#06B6D4' },
                            { name: 'Dark Slate', hex: '#0F172A' },
                          ].map((color) => {
                            const isSelected = (formData.ai_chat_btn_color || '#F59E0B').toLowerCase() === color.hex.toLowerCase();
                            return (
                              <button
                                key={color.hex}
                                type="button"
                                onClick={() => setFormData({ ...formData, ai_chat_btn_color: color.hex })}
                                title={color.name}
                                style={{ backgroundColor: color.hex }}
                                className={`w-8 h-8 rounded-full border-2 transition-transform duration-150 flex items-center justify-center cursor-pointer shadow-sm ${
                                  isSelected ? 'border-white scale-110 ring-2 ring-amber-400' : 'border-slate-700 hover:scale-105'
                                }`}
                              >
                                {isSelected && (
                                  <Check className={`w-4 h-4 ${['#0f172a', '#2563eb', '#7c3aed'].includes(color.hex.toLowerCase()) ? 'text-white' : 'text-slate-950'}`} />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Color Input & Hex Code */}
                        <div className="flex items-center gap-3">
                          <div className="relative flex items-center gap-2 bg-[#14171E] border border-[#2C323F] rounded-xl p-1.5 px-3">
                            <input
                              type="color"
                              value={formData.ai_chat_btn_color || '#F59E0B'}
                              onChange={(e) => setFormData({ ...formData, ai_chat_btn_color: e.target.value })}
                              className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer"
                            />
                            <span className="text-xs text-slate-400 font-mono">
                              {isBn ? 'কালার পিকার' : 'Picker'}
                            </span>
                          </div>

                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={formData.ai_chat_btn_color || '#F59E0B'}
                              onChange={(e) => setFormData({ ...formData, ai_chat_btn_color: e.target.value })}
                              placeholder="#F59E0B"
                              maxLength={7}
                              className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          {/* Live Mini Preview */}
                          <div className="flex items-center gap-2 bg-[#14171E] border border-[#2C323F] rounded-xl px-3 py-1.5">
                            <span className="text-[11px] text-slate-400">{isBn ? 'লাইভ প্রিভিউ:' : 'Live Preview:'}</span>
                            <div
                              style={{ backgroundColor: formData.ai_chat_btn_color || '#F59E0B' }}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-950 shadow-sm border border-white/60 relative"
                            >
                              <Bot className="w-4 h-4" />
                              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media Channels Management with Add, Edit, Delete */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C323F] pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>{isBn ? 'সোশ্যাল মিডিয়া পেজ ও চ্যানেল ম্যানেজমেন্ট' : 'Social Media Channels & Handles'}</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isBn
                      ? 'আপনার ফেসবুক, ইনস্টাগ্রাম, ইউটিউব, হোয়াটসঅ্যাপ, টিকটক বা অন্যান্য সোশ্যাল মিডিয়া লিংক যোগ, এডিট ও ডিলিট করুন।'
                      : 'Add, edit, delete, and manage links for your Facebook, Instagram, YouTube, WhatsApp, and TikTok channels.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAddSocial('facebook')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-xs shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isBn ? 'নতুন সোশ্যাল মিডিয়া যোগ করুন' : 'Add Social Media'}</span>
                </button>
              </div>

              {/* Step-by-Step Guidance Box on How to Paste Channel Links */}
              <div className="bg-[#14171E] border-2 border-amber-500/40 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Link2 className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-black text-amber-400 text-xs flex items-center gap-1.5">
                    <span>📌</span>
                    <span>
                      {isBn
                        ? 'আপনার চ্যানেলের লিংক কোন সেলের ভেতর পেস্ট করবেন?'
                        : 'Where to paste your channel link?'}
                    </span>
                  </p>
                  <p className="text-slate-200 leading-relaxed text-[11.5px]">
                    {isBn ? (
                      <>
                        <strong className="text-white">১. লিংক কপি করুন:</strong> আপনার ইউটিউব চ্যানেল, ফেসবুক পেজ বা অ্যাকাউন্টের সম্পূর্ণ লিংক ব্রাউজার থেকে কপি (Copy) করুন।<br />
                        <strong className="text-white">২. সরাসরি নিচের সেলে পেস্ট করুন:</strong> নিচে সংশ্লিষ্ট প্ল্যাটফর্মের কার্ডে দেওয়া <span className="bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/40">"চ্যানেলের লিংক পেস্ট করার ঘর (URL Cell)"</span> এর মধ্যে পেস্ট (Paste / Ctrl+V) করে দিন।<br />
                        <strong className="text-white">৩. সংরক্ষণ করুন:</strong> পেজের নিচে <span className="text-amber-400 font-bold">"সেটিংস সংরক্ষণ করুন"</span> বাটনে চাপুন। সাথে সাথে আপনার ওয়েবসাইটের ফুটারে অরিজিনাল ব্র‍্যান্ড কালারসহ চ্যানেল আইকন দৃশ্যমান হবে।
                      </>
                    ) : (
                      <>
                        <strong className="text-white">1. Copy Link:</strong> Copy your YouTube channel or Facebook page URL from the browser.<br />
                        <strong className="text-white">2. Paste in Cell:</strong> Paste it directly into the <span className="bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/40">"Channel Link Input Cell (URL)"</span> inside the platform card below.<br />
                        <strong className="text-white">3. Save Settings:</strong> Click "Save Settings" at the bottom to publish live with original brand colors.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Quick Add Presets */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  {isBn ? '⚡ দ্রুত নতুন প্ল্যাটফর্ম যোগ করুন:' : '⚡ Quick Add Preset Platform:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SOCIAL_PLATFORM_OPTIONS.map((plat) => {
                    const Icon = plat.icon;
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => handleOpenAddSocial(plat.id)}
                        className="bg-[#14171E] hover:bg-[#252A36] border border-[#2C323F] hover:border-amber-500/50 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all"
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${plat.color}`}>
                          <Icon className="w-2.5 h-2.5" />
                        </div>
                        <span>+ {plat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Social Links List */}
              {socialLinks.length === 0 ? (
                <div className="text-center py-8 bg-[#14171E] border border-dashed border-[#2C323F] rounded-xl p-6">
                  <Share2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-300 font-bold text-sm">
                    {isBn ? 'কোন সোশ্যাল মিডিয়া লিঙ্ক যোগ করা হয়নি' : 'No Social Media Channels Added'}
                  </p>
                  <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                    {isBn
                      ? 'আপনার ফেসবুক, ইনস্টাগ্রাম, ইউটিউব বা হোয়াটসঅ্যাপ লিংক যুক্ত করতে উপরের বাটনে চাপুন।'
                      : 'Click the button above to add your Facebook, Instagram, YouTube, or WhatsApp links.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenAddSocial('facebook')}
                    className="mt-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isBn ? 'প্রথম সোশ্যাল চ্যানেল যোগ করুন' : 'Add First Social Channel'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {socialLinks.map((item, idx) => {
                    const platConfig =
                      SOCIAL_PLATFORM_OPTIONS.find((p) => p.id === item.platform) ||
                      SOCIAL_PLATFORM_OPTIONS.find((p) => p.id === 'custom') ||
                      SOCIAL_PLATFORM_OPTIONS[0];
                    const Icon = platConfig.icon;

                    return (
                      <div
                        key={item.id || idx}
                        className={`p-4 bg-[#14171E] border-2 transition-all rounded-2xl flex flex-col justify-between gap-3.5 shadow-sm ${
                          item.is_active
                            ? 'border-[#2C323F] hover:border-amber-500/50'
                            : 'border-slate-800/60 opacity-60'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${platConfig.color}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-black text-white truncate max-w-[180px]">
                                  {item.name || platConfig.name}
                                </h4>
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#1E222B] text-slate-400 border border-[#2C323F]">
                                  {platConfig.name}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-slate-400 mt-0.5">
                                {isBn ? 'ওয়েবসাইটে অরিজিনাল কালারে দেখাবে' : 'Displayed in original brand color'}
                              </p>
                            </div>
                          </div>

                          {/* Toggle Active status */}
                          <button
                            type="button"
                            onClick={() => handleToggleSocialActive(item.id)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors shrink-0 ${
                              item.is_active
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                            }`}
                            title={isBn ? "স্টোর ও ফুটারে ভিজিবিলিটি অন/অফ করতে ক্লিক করুন" : "Click to toggle visibility on store & footer"}
                          >
                            {item.is_active ? (isBn ? '● সক্রিয়' : '● Active') : (isBn ? '○ নিষ্ক্রিয়' : '○ Inactive')}
                          </button>
                        </div>

                        {/* Dedicated Channel URL Input Cell */}
                        <div className="bg-[#0E121A] p-3 rounded-xl border border-[#2C323F] focus-within:border-amber-400 space-y-1.5 transition-colors">
                          <div className="flex items-center justify-between text-[11px]">
                            <label className="font-bold text-amber-400 flex items-center gap-1.5">
                              <Link2 className="w-3.5 h-3.5" />
                              <span>{isBn ? 'চ্যানেলের লিংক পেস্ট করার ঘর (URL Cell):' : 'Channel Link Input Cell (URL):'}</span>
                            </label>
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 hover:underline"
                                title={isBn ? "লিংক ওপেন করে টেস্ট করুন" : "Open link to verify"}
                              >
                                <span>{isBn ? 'ভিজিট করুন' : 'Test Link'}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          <div className="relative">
                            <input
                              type="url"
                              value={item.url || ''}
                              onChange={(e) => handleQuickUpdateSocialUrl(item.id, e.target.value)}
                              placeholder={platConfig.placeholder || 'https://...'}
                              className="w-full bg-[#14171E] border border-[#30363D] focus:border-amber-400 focus:bg-[#181D27] rounded-lg px-3 py-2 text-xs text-white font-mono outline-none placeholder:text-slate-500 transition-all shadow-inner"
                            />
                          </div>

                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span>💡</span>
                            <span>
                              {isBn
                                ? 'আপনার চ্যানেলের লিংক কপি করে সরাসরি এই সেলে পেস্ট (Ctrl+V) করুন।'
                                : 'Paste your copied channel URL directly inside this input cell.'}
                            </span>
                          </p>
                        </div>

                        {/* Action buttons: Move, Edit & Delete */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#1E222B] gap-2">
                          {/* Move Up/Down Order */}
                          <div className="flex items-center gap-1 bg-[#1E222B] border border-[#2C323F] rounded-lg p-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSocialLink(idx, 'up')}
                              className={`p-1 rounded hover:bg-[#282E3B] transition-colors ${
                                idx === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-amber-400'
                              }`}
                              title={isBn ? "উপরে নিন" : "Move Up"}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === socialLinks.length - 1}
                              onClick={() => handleMoveSocialLink(idx, 'down')}
                              className={`p-1 rounded hover:bg-[#282E3B] transition-colors ${
                                idx === socialLinks.length - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-amber-400'
                              }`}
                              title={isBn ? "নিচে নিন" : "Move Down"}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditSocial(item)}
                              className="px-2.5 py-1 bg-[#1E222B] hover:bg-amber-500 hover:text-slate-950 text-slate-300 hover:border-amber-500 border border-[#2C323F] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                              title={isBn ? "সোশ্যাল মিডিয়া চ্যানেল এডিট করুন" : "Edit Social Channel"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isBn ? 'এডিট' : 'Edit'}</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => setSocialToDelete(item.id)}
                              className="px-2.5 py-1 bg-[#1E222B] hover:bg-rose-600 hover:text-white text-rose-400 hover:border-rose-600 border border-rose-500/20 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                              title={isBn ? "সোশ্যাল মিডিয়া চ্যানেল মুছে ফেলুন" : "Delete Social Channel"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isBn ? 'মুছুন' : 'Delete'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: GENERAL & SEO */}
        {/* ========================================================================= */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            {/* Google Search Indexing & Crawling Master Control Card */}
            <div className="bg-[#1E222B] border border-emerald-500/40 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C323F] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <Globe className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {isBn ? 'গুগল সার্চ ইনডেক্সিং ও র‍্যাংকিং' : 'Google Search Indexing & Ranking'}
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {isBn
                          ? 'গুগল এবং অন্যান্য সার্চ ইঞ্জিনে আপনার স্টোর ও প্রোডাক্টগুলোর ইনডেক্সিং, রোবট ডিরেক্টিভস ও সাইটম্যাপ নিয়ন্ত্রণ করুন।'
                          : 'Control store indexing, search ranking, robots directives, and sitemap.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Indexing Status Badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {formData.google_index_enabled !== '0' && formData.google_index_enabled !== false && formData.google_index_enabled !== 'false' ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {isBn ? '🟢 গুগল ইনডেক্স চালু' : '🟢 Indexing Active'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      {isBn ? '🔴 গুগল ইনডেক্স বন্ধ' : '🔴 Noindex Active'}
                    </span>
                  )}
                </div>
              </div>

              {/* Master Indexing Toggle Switch Box */}
              <div className="p-4 bg-[#14171E] border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    {isBn ? 'গুগল সার্চ ইঞ্জিন ইনডেক্সিং সক্রিয় রাখুন' : 'Enable Google Search Engine Indexing'}
                  </span>
                  <p className="text-xs text-slate-300">
                    {isBn
                      ? 'এটি চালু রাখলে গুগল সার্চ বট (Googlebot) আপনার ওয়েবসাইট, সব প্রোডাক্ট, ক্যাটাগরি এবং পেজ স্ক্যান করে গুগল সার্চ রেজাল্টে সবার উপরে নিয়ে আসবে।'
                      : 'When enabled, Googlebot indexes all products, categories, and pages for maximum search visibility.'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.google_index_enabled !== '0' && formData.google_index_enabled !== false && formData.google_index_enabled !== 'false'}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        google_index_enabled: e.target.checked ? '1' : '0'
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                </label>
              </div>

              {/* Robots Meta Tag Directive Options */}
              <div className="space-y-3">
                <label className="text-slate-300 font-bold block text-xs flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  {isBn ? 'রোবটস মেটা ট্যাগ ও ডিরেক্টিভ সেটিংস:' : 'Robots Meta Tag & Directives:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
                      title: '⚡ Index & Follow + HD Previews (Recommended)',
                      titleBn: 'সর্বোচ্চ গুগল র‍্যাংকিং ও গুগল ডিসকভার সাপোর্ট (সুপারিশকৃত)',
                      desc: isBn
                        ? 'সাইটের সকল পেজ ইনডেক্স হবে, বড় ছবি ও স্নাইপেট গুগল ডিসকভারে শো করবে।'
                        : 'All pages indexed, HD rich previews on Google Discover.'
                    },
                    {
                      id: 'index, follow',
                      title: '🌐 Standard Index & Follow',
                      titleBn: 'স্ট্যান্ডার্ড ইনডেক্স ও লিংক ট্র্যাকিং',
                      desc: isBn
                        ? 'সাধারণ পদ্ধতিতে গুগল সার্চে পেজ ও লিংকগুলো ইনডেক্স করা হবে।'
                        : 'Standard index directives for crawlers to crawl all pages and links.'
                    },
                    {
                      id: 'index, nofollow',
                      title: '🔍 Index Only (No Follow Links)',
                      titleBn: 'শুধু ইনডেক্স, এক্সটার্নাল লিংক ফলো হবে না',
                      desc: isBn
                        ? 'পেজ ইনডেক্স হবে কিন্তু পেজের বাইরের লিংকগুলো বট ট্র্যাক করবে না।'
                        : 'Pages are indexed but outward links will not be followed.'
                    },
                    {
                      id: 'noindex, nofollow',
                      title: '🚫 Noindex, Nofollow (Private Mode)',
                      titleBn: 'সার্চ ইঞ্জিন থেকে সম্পূর্ণ গোপন রাখুন (টেস্টিং মোড)',
                      desc: isBn
                        ? 'গুগল সার্চ ফলাফলে কোনো পেজ বা প্রোডাক্ট প্রদর্শিত হবে না।'
                        : 'Completely hide pages and products from search engines.'
                    }
                  ].map((option) => {
                    const isSelected = (formData.seo_robots_directive || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1') === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, seo_robots_directive: option.id })}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                            : 'bg-[#14171E] border-[#2C323F] text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {isBn ? option.titleBn : option.title}
                          </span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600'}`}>
                            {isSelected && <span className="w-1.5 h-1.5 bg-slate-950 rounded-full"></span>}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{option.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Google SEO & Sitemap Tools Bar */}
              <div className="p-4 bg-[#14171E] border border-slate-700/60 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    {isBn ? 'গুগল এক্সএমএল সাইটম্যাপ ও রোবটস টুলস' : 'Google XML Sitemap & Robots Tools'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSitemapModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isBn ? 'সাইটম্যাপ এক্সএমএল দেখুন' : 'View Sitemap XML'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const sitemapUrl = `${formData.canonical_url || window.location.origin}/sitemap.xml`;
                        navigator.clipboard?.writeText(sitemapUrl);
                        setCopiedSitemap(true);
                        setTimeout(() => setCopiedSitemap(false), 2500);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 flex items-center gap-1 transition-colors"
                    >
                      {copiedSitemap ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">{isBn ? 'কপি হয়েছে!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          {isBn ? 'সাইটম্যাপ লিংক কপি করুন' : 'Copy Sitemap Link'}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-slate-500">Live Sitemap URL:</span>
                    <code className="bg-slate-900 px-2 py-0.5 rounded text-emerald-400 font-mono text-[11px]">
                      {formData.canonical_url || window.location.origin}/sitemap.xml
                    </code>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPingSuccess(true);
                        setTimeout(() => setPingSuccess(false), 3000);
                      }}
                      className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {pingSuccess
                        ? (isBn ? '✅ গুগলবট পিং সফল!' : '✅ Googlebot Pinged!')
                        : (isBn ? 'গুগলবট পিং ও ইনডেক্স রিকোয়েস্ট' : 'Ping Googlebot & Request Index')}
                    </button>

                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Google Search Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Live Google Search Snippet Preview */}
              <div className="p-4 bg-[#14171E] border border-slate-700/60 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  {isBn ? 'গুগল সার্চ লাইভ প্রিভিউ:' : 'Google Search Live Preview:'}
                </span>

                <div className="p-3 bg-white text-slate-900 rounded-lg shadow-sm font-sans max-w-xl">
                  <div className="flex items-center gap-2 text-xs text-slate-700 mb-1">
                    <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] text-white font-bold">
                      G
                    </div>
                    <span className="text-[11px] text-slate-800 truncate">
                      {formData.canonical_url || 'https://www.shophatbd.com.bd'}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                    {formData.meta_title_bn || formData.meta_title_en || formData.site_name || 'SHOPHATBD Bangladesh | সেরা অনলাইন শপিং ও ট্রেন্ডি কালেকশন'}
                  </h4>
                  <p className="text-xs text-[#4d5156] mt-1 leading-relaxed line-clamp-2">
                    {formData.meta_description_bn || formData.meta_description_en || 'বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম। প্রিমিয়াম পাঞ্জাবি, শার্ট, স্মার্টওয়াচ ও গ্যাজেট দ্রুত হোম ডেলিভারিতে অর্ডার করুন।'}
                  </p>
                </div>
              </div>

              {/* Meta Titles & Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'গুগল মেটা টাইটেল (ইংরেজি)' : 'Google Meta Title (English)'} <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title_en || ''}
                    onChange={(e) => setFormData({ ...formData, meta_title_en: e.target.value })}
                    placeholder="SHOPHATBD Bangladesh | Premier Online Shopping"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isBn ? 'গুগল ট্যাবে প্রদর্শিত ইংরেজি টাইটেল (৫০-৬০ অক্ষর)' : 'Meta title in English (50-60 chars)'}
                  </p>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'গুগল মেটা টাইটেল (বাংলা)' : 'Google Meta Title (Bangla)'} <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title_bn || ''}
                    onChange={(e) => setFormData({ ...formData, meta_title_bn: e.target.value })}
                    placeholder="শপহাটবিডি বাংলাদেশ | সেরা অনলাইন শপিং ও ট্রেন্ডি কালেকশন"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isBn ? 'গুগল ট্যাবে প্রদর্শিত বাংলা টাইটেল' : 'Meta title in Bengali'}
                  </p>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'মেটা ডেসক্রিপশন (ইংরেজি)' : 'Meta Description (English)'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.meta_description_en || ''}
                    onChange={(e) => setFormData({ ...formData, meta_description_en: e.target.value })}
                    placeholder="Shop the best lifestyle products, clothing, and smart gadgets in Bangladesh with cash on delivery and fast shipping."
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isBn ? 'গুগল সার্চ রেজাল্টের নিচে থাকা ইংরেজি সারাংশ' : 'Meta description snippet in English'}
                  </p>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'মেটা ডেসক্রিপশন (বাংলা)' : 'Meta Description (Bangla)'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.meta_description_bn || ''}
                    onChange={(e) => setFormData({ ...formData, meta_description_bn: e.target.value })}
                    placeholder="বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম। প্রিমিয়াম পোশাক, ঘড়ি ও গ্যাজেট দ্রুত হোম ডেলিভারিতে অর্ডার করুন।"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isBn ? 'গুগল সার্চ ফলাফলে থাকা বাংলা ডেসক্রিপশন' : 'Meta description snippet in Bengali'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'এসইও কী-ওয়ার্ড ও সার্চ ট্যাগসমূহ' : 'SEO Keywords & Search Tags'}
                  </label>
                  <input
                    type="text"
                    value={formData.meta_keywords || ''}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    placeholder="online shopping bd, buy panjabi online, smart watches dhaka, clothing brand bangladesh, gadgets online bd"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isBn
                      ? 'কমা (,) দিয়ে আলাদা করে কী-ওয়ার্ডগুলো লিখুন। যেমন: অনলাইন শপিং, পাঞ্জাবি, স্মার্ট ওয়াচ'
                      : 'Comma separated keywords: e.g. online shopping bd, panjabi, smartwatch'}
                  </p>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'গুগল সাইট ভেরিফিকেশন মেটা ট্যাগ' : 'Google Site Verification Tag'}
                  </label>
                  <input
                    type="text"
                    value={formData.google_site_verification || ''}
                    onChange={(e) => setFormData({ ...formData, google_site_verification: e.target.value })}
                    placeholder="google-site-verification=abc123xyz"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isBn ? 'গুগল সার্চ কনসোল ও ইনডেক্সিং ভেরিফিকেশন মেটা কোড' : 'Google Search Console verification code'}
                  </p>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'ক্যানোনিকাল ডোমেইন / ওয়েবসাইট লিংক' : 'Canonical Domain / Live Website URL'}
                  </label>
                  <input
                    type="url"
                    value={formData.canonical_url || ''}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                    placeholder="https://www.yourdomain.com"
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isBn ? 'আপনার মূল লাইভ ডোমেইন লিংক' : 'Primary live domain address'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <ImageUploadField
                    label={isBn ? 'সোশ্যাল শেয়ার / ওপেন গ্রাফ (OG) ইমেজ' : 'Social Media Share / Open Graph (OG) Image'}
                    value={formData.og_image_url || ''}
                    onChange={(url) => setFormData({ ...formData, og_image_url: url })}
                    placeholder="https://... image url for Facebook/WhatsApp sharing"
                    helpText={
                      isBn
                        ? 'ফেসবুক বা হোয়াটসঅ্যাপে ওয়েবসাইটের লিংক শেয়ার করলে এই ছবিটি প্রিভিউ হিসেবে ভেসে উঠবে।'
                        : 'This image preview will show when website links are shared on Facebook/WhatsApp.'
                    }
                    recommendedSize="1200 x 630 px (HD)"
                  />
                </div>
              </div>
            </div>

            {/* Analytics & Currency Section */}
            <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#2C323F] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    {isBn ? 'স্টোর কারেন্সি ও প্রতীক সেটিংস' : 'Store Currency & Symbol Settings'}
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isBn
                      ? 'যেকোনো কারেন্সি সিলেক্ট করলে কারেন্সি সিম্বল স্বয়ংক্রিয়ভাবে পরিবর্তিত হবে এবং পুরো ওয়েবসাইটে কার্যকর হবে।'
                      : 'Selecting a currency automatically updates symbols throughout the storefront.'}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold flex items-center gap-1.5">
                  <span>{isBn ? 'লাইভ প্রিভিউ:' : 'Live Preview:'}</span>
                  <span className="text-white font-bold bg-black/40 px-2 py-0.5 rounded-md">
                    {formData.currency_symbol || getAutoCurrencySymbol(formData.currency || 'BDT')}1,250
                  </span>
                </div>
              </div>

              {/* Quick Currency Select Chips */}
              <div>
                <label className="text-slate-300 font-bold block mb-2 text-xs">
                  {isBn ? '⚡ দ্রুত কারেন্সি নির্বাচন করুন:' : '⚡ Quick Select Currency:'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { code: 'BDT', symbol: '৳', label: isBn ? '🇧🇩 BDT (৳ টাকা)' : '🇧🇩 BDT (৳ Taka)' },
                    { code: 'USD', symbol: '$', label: '🇺🇸 USD ($ Dollar)' },
                    { code: 'EUR', symbol: '€', label: '🇪🇺 EUR (€ Euro)' },
                    { code: 'GBP', symbol: '£', label: '🇬🇧 GBP (£ Pound)' },
                    { code: 'INR', symbol: '₹', label: '🇮🇳 INR (₹ Rupee)' },
                    { code: 'SAR', symbol: '﷼', label: '🇸🇦 SAR (﷼ Riyal)' },
                    { code: 'AED', symbol: 'د.إ', label: '🇦🇪 AED (Dirham)' },
                    { code: 'MYR', symbol: 'RM', label: '🇲🇾 MYR (RM Ringgit)' },
                    { code: 'CAD', symbol: 'CA$', label: '🇨🇦 CAD (CA$)' },
                    { code: 'AUD', symbol: 'AU$', label: '🇦🇺 AUD (AU$)' }
                  ].map((cur) => {
                    const isSelected = (formData.currency || '').toUpperCase() === cur.code;
                    return (
                      <button
                        key={cur.code}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            currency: cur.code,
                            currency_symbol: cur.symbol
                          });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-[#14171E] text-slate-300 border-[#2C323F] hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        <span>{cur.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Store Currency Dropdown & Code */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    {isBn ? 'স্টোর কারেন্সি' : 'Store Currency'} <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.currency || 'BDT'}
                    onChange={(e) => {
                      const selectedCode = e.target.value;
                      const autoSymbol = getAutoCurrencySymbol(selectedCode, '৳');
                      setFormData({
                        ...formData,
                        currency: selectedCode,
                        currency_symbol: autoSymbol
                      });
                    }}
                    className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {SUPPORTED_CURRENCIES.map((cur) => (
                      <option key={cur.code} value={cur.code} className="bg-[#1E222B] text-white">
                        {cur.flag || '🌐'} {cur.code} - {cur.name} ({cur.symbol})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isBn
                      ? 'লিস্ট থেকে কারেন্সি নির্বাচন করলে প্রতীক (Symbol) অটোমেটিক আপডেট হয়ে যাবে।'
                      : 'Currency symbol will automatically sync with selection.'}
                  </p>
                </div>

                {/* Currency Symbol with Auto Sync */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-bold text-xs">
                      {isBn ? 'কারেন্সি প্রতীক' : 'Currency Symbol'} <span className="text-amber-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const autoSym = getAutoCurrencySymbol(formData.currency || 'BDT', '৳');
                        setFormData({ ...formData, currency_symbol: autoSym });
                      }}
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                      title={isBn ? "অটোমেটিক ডিফল্ট প্রতীকে রিসেট করুন" : "Reset to default symbol"}
                    >
                      <RefreshCw className="w-3 h-3" />
                      {isBn ? 'অটো রিসেট' : 'Auto Reset'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.currency_symbol || ''}
                      onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                      placeholder="৳, $, €, £"
                      className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                    <div className="absolute right-3 top-2.5 text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded">
                      {isBn ? 'প্রতীক: ' : 'Symbol: '} {formData.currency_symbol || getAutoCurrencySymbol(formData.currency || 'BDT')}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isBn ? 'প্রয়োজনে আপনি ম্যানুয়ালি নিজের পছন্দের সিম্বলও দিতে পারবেন।' : 'You can also specify a custom currency symbol manually.'}
                  </p>
                </div>
              </div>

              {/* Dedicated Tracking & Analytics Notice & Quick-Link */}
              <div className="p-4 bg-[#14171E] border border-amber-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400 mt-0.5">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{isBn ? 'অ্যানালিটিক্স ও কনভার্সন ট্র্যাকিং সেটিংস' : 'Analytics & Conversion Tracking Settings'}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-normal">
                        {isBn ? 'সেন্ট্রালাইজড' : 'Dedicated'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed max-w-xl">
                      {isBn
                        ? 'গুগল অ্যানালিটিক্স ৪ (GA4), গুগল ট্যাগ ম্যানেজার (GTM), গুগল অ্যাডস কনভার্সন, মেটা পিক্সেল (Facebook/Instagram), মেটা CAPI ও টিকটক পিক্সেল ট্র্যাকিং কনফিগার করার জন্য ডেডিকেটেড "অ্যানালিটিক্স ও ট্র্যাকিং" মেনু ব্যবহার করুন।'
                        : 'Manage Google Analytics 4 (GA4), Google Tag Manager (GTM), Google Ads, Meta Pixel, Meta CAPI & TikTok Pixel in the dedicated Analytics & Tracking section.'}
                    </p>
                  </div>
                </div>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('analytics')}
                    className="flex-shrink-0 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>{isBn ? 'অ্যানালিটিক্স ও ট্র্যাকিং এ যান' : 'Go to Analytics & Tracking'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Chatbot & Custom Header/Footer Script Injection Box */}
              <div className="pt-4 border-t border-[#2C323F] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span>{isBn ? 'কাস্টম হেডার স্ক্রিপ্ট, চ্যাটবট উইজেট ও ট্র্যাকিং কোড' : 'Custom Header/Footer Scripts & Chatbot Code'}</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                    HTML / JS Script Injection
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  {isBn
                    ? 'কোনো ডেভেলপার বা আপনি নিজে ফেসবুক পিক্সেল বেস কোড, গুগল ট্যাগ ম্যানেজার, লাইভ চ্যাটবট (Tawk.to, Crisp, Messenger) বা কাস্টম CSS কোড সরাসরি এখানে পেস্ট করতে পারবেন।'
                    : 'Paste Custom Header scripts (GTM, Pixel, CSS) and Footer scripts/Chatbots (Tawk.to, Crisp, Messenger widget) directly.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">
                      {isBn ? 'কাস্টম হেডার কোড (<head> ... </head>)' : 'Custom Header Code (<head>)'}
                    </label>
                    <textarea
                      rows={4}
                      value={formData.custom_header_code || ''}
                      onChange={(e) => setFormData({ ...formData, custom_header_code: e.target.value })}
                      placeholder="<!-- Google Tag Manager / Custom Header Script -->&#10;<script>...</script>"
                      className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isBn ? 'হেড সেকশনে ইনজেক্ট হওয়া স্ক্রিপ্ট বা স্টাইল' : 'Injected into the <head> of the storefront'}
                    </p>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">
                      {isBn ? 'কাস্টম ফুটার / চ্যাটবট উইজেট স্ক্রিপ্ট (</body>)' : 'Custom Footer / Chatbot Widget (</body>)'}
                    </label>
                    <textarea
                      rows={4}
                      value={formData.custom_footer_code || ''}
                      onChange={(e) => setFormData({ ...formData, custom_footer_code: e.target.value })}
                      placeholder="<!-- Tawk.to, Crisp Chat, or Live Messenger Widget Script -->&#10;<script>...</script>"
                      className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl p-2.5 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isBn ? 'বডি সেকশনের নিচে ইনজেক্ট হওয়া চ্যাটবট বা এক্সটার্নাল লাইব্রেরি' : 'Injected before closing </body> tag for widgets'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: STORE DATA BACKUP & EXPORT */}
        {/* ========================================================================= */}
        {activeTab === 'backup' && (
          <StoreBackupManager />
        )}

        {/* Global Save Button at Bottom (Hidden on Backup tab) */}
        {activeTab !== 'backup' && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={refreshSettings}
              className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isBn ? 'পরিবর্তন বাতিল করুন' : 'Reset Unsaved Changes'}</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-3 rounded-xl shadow-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>
                {isBn
                  ? (isSaving ? 'সব সেটিংস সংরক্ষণ হচ্ছে...' : 'সব সেটিংস সংরক্ষণ করুন')
                  : (isSaving ? 'Saving All Settings...' : 'Save All Settings')}
              </span>
            </button>
          </div>
        )}
      </form>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SOCIAL MEDIA CHANNEL */}
      {/* ========================================================================= */}
      {isSocialModalOpen && editingSocial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleIn flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#2C323F] flex items-center justify-between bg-[#14171E] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {socialLinks.some((s) => s.id === editingSocial.id)
                      ? (isBn ? 'সোশ্যাল মিডিয়া চ্যানেল এডিট করুন' : 'Edit Social Media Channel')
                      : (isBn ? 'নতুন সোশ্যাল মিডিয়া যোগ করুন' : 'Add New Social Media')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'ফুটার সেকশনের সোশ্যাল মিডিয়া লিঙ্ক ও আইকন কনফিগার করুন' : 'Configure social media link and icon for footer'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSocialModalOpen(false);
                  setEditingSocial(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveSocialItem} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar max-h-[calc(85vh-130px)]">
                {/* Select Platform */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isBn ? 'প্ল্যাটফর্ম নির্বাচন করুন' : 'Select Social Platform'} <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {SOCIAL_PLATFORM_OPTIONS.map((plat) => {
                      const Icon = plat.icon;
                      const isSelected = editingSocial.platform === plat.id;
                      return (
                        <button
                          key={plat.id}
                          type="button"
                          onClick={() => {
                            setEditingSocial({
                              ...editingSocial,
                              platform: plat.id,
                              name:
                                editingSocial.name === '' ||
                                SOCIAL_PLATFORM_OPTIONS.some((p) => p.defaultName === editingSocial.name)
                                  ? plat.defaultName
                                  : editingSocial.name
                            });
                          }}
                          className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold shadow-sm'
                              : 'bg-[#14171E] border-[#2C323F] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${plat.color.split(' ')[0]}`} />
                          <span className="truncate">{plat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Display Label */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isBn ? 'প্রদর্শিত নাম / টাইটেল' : 'Display Label / Name'} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSocial.name}
                    onChange={(e) => setEditingSocial({ ...editingSocial, name: e.target.value })}
                    placeholder={isBn ? "যেমন: অফিসিয়াল ফেসবুক পেজ" : "e.g. Official Facebook Page"}
                    className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none"
                  />
                </div>

                {/* URL Input Cell with High Visibility */}
                <div className="bg-[#0E121A] border-2 border-amber-500/50 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-amber-400" />
                      <span>{isBn ? 'চ্যানেলের লিংক পেস্ট করার ঘর (URL Cell)' : 'Channel Link Input Cell (Target URL)'}</span> <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                      {isBn ? 'বাধ্যতামূলক' : 'Required'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isBn
                      ? 'আপনার ইউটিউব চ্যানেল, ফেসবুক পেজ বা অ্যাকাউন্টের সম্পূর্ণ লিংকটি কপি করে নিচের সেলে পেস্ট (Ctrl+V) করুন:'
                      : 'Copy and paste the full link to your channel or page in the cell below:'}
                  </p>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      required
                      value={editingSocial.url}
                      onChange={(e) => setEditingSocial({ ...editingSocial, url: e.target.value })}
                      placeholder={
                        SOCIAL_PLATFORM_OPTIONS.find((p) => p.id === editingSocial.platform)?.placeholder ||
                        'https://...'
                      }
                      className="w-full bg-[#14171E] border-2 border-[#30363D] focus:border-amber-400 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs font-mono outline-none shadow-inner"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">
                    <span className="text-slate-400">{isBn ? 'উদাহরণ (Example): ' : 'Example: '}</span>
                    <span className="text-amber-400/90 font-mono">
                      {SOCIAL_PLATFORM_OPTIONS.find((p) => p.id === editingSocial.platform)?.placeholder}
                    </span>
                  </p>
                </div>

                {/* Active Toggle */}
                <div className="p-3 bg-[#14171E] border border-[#2C323F] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isBn ? 'ফুটার সেকশনে প্রদর্শন করুন' : 'Show in Footer'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {isBn ? 'বন্ধ থাকলে ফুটারের সোশ্যাল বার থেকে লুকানো থাকবে' : 'When disabled, this will be hidden from footer social bar'}
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSocial.is_active}
                      onChange={(e) => setEditingSocial({ ...editingSocial, is_active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 p-4 border-t border-[#2C323F] bg-[#14171E] shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsSocialModalOpen(false);
                    setEditingSocial(null);
                  }}
                  className="px-4 py-2 bg-[#1E222B] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors border border-[#2C323F]"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>{isBn ? 'সংরক্ষণ করুন' : 'Save Channel'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GOOGLE XML SITEMAP VIEWER */}
      {/* ========================================================================= */}
      {sitemapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E222B] border border-emerald-500/40 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-[#2C323F] flex items-center justify-between bg-[#14171E]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {isBn ? 'লাইভ গুগল এক্সএমএল সাইটম্যাপ (sitemap.xml)' : 'Live Google XML Sitemap (sitemap.xml)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isBn
                      ? 'গুগল সার্চ কনসোলে সাইটম্যাপ সাবমিট করার জন্য এই XML কোডটি ব্যবহার করতে পারেন।'
                      : 'You can use this XML code to submit your sitemap in Google Search Console.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSitemapModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-3 bg-[#0E1015]">
              {(() => {
                const baseUrl = formData.canonical_url || window.location.origin;
                const today = new Date().toISOString().split('T')[0];
                const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Shop Catalog -->
  <url>
    <loc>${baseUrl}/shop</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Categories -->
  <url>
    <loc>${baseUrl}/category/panjabi</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/category/smart-watches</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/category/shirts-polos</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Store Info & Support -->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms-conditions</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>`;

                return (
                  <div>
                    <pre className="p-4 bg-[#14171E] rounded-xl border border-slate-800 text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed text-[11px]">
                      {sitemapXml}
                    </pre>

                    <div className="mt-3 flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">
                        {isBn ? 'মোট ইনডেক্সড ইউআরএল: ' : 'Total Indexed URLs: '}<strong className="text-white">{isBn ? '৯টি পেজ' : '9 pages'}</strong> + {isBn ? 'অটো প্রোডাক্ট ফিডস' : 'Auto Product Feeds'}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(sitemapXml);
                          setCopiedSitemapXml(true);
                          setTimeout(() => setCopiedSitemapXml(false), 2500);
                        }}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-lg"
                      >
                        {copiedSitemapXml ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-slate-950" />
                            <span>{isBn ? 'XML কপি সম্পন্ন হয়েছে!' : 'XML Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>{isBn ? 'সম্পূর্ণ XML কোড কপি করুন' : 'Copy Entire XML Code'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE SOCIAL MEDIA CONFIRMATION */}
      {/* ========================================================================= */}
      {socialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E222B] border border-rose-500/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">
                {isBn ? 'সোশ্যাল চ্যানেল মুছে ফেলতে চান?' : 'Delete Social Channel?'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'আপনি কি নিশ্চিত যে এই সোশ্যাল মিডিয়া লিংকটি ফুটার থেকে মুছে ফেলতে চান?'
                  : 'Are you sure you want to delete this social media channel from footer?'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSocialToDelete(null)}
                className="flex-1 py-2 bg-[#14171E] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-[#2C323F] transition-colors"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={() => handleDeleteSocialLink(socialToDelete)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-950/40"
              >
                {isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE FOOTER NAVIGATION LINK CONFIRMATION */}
      {/* ========================================================================= */}
      {linkToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E222B] border border-rose-500/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">
                {isBn ? 'লিংক মুছে ফেলতে চান?' : 'Delete Navigation Link?'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'আপনি কি নিশ্চিত যে এই নেভিগেশন লিংকটি ফুটার থেকে মুছে ফেলতে চান?'
                  : 'Are you sure you want to delete this navigation link from footer?'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLinkToDelete(null)}
                className="flex-1 py-2 bg-[#14171E] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-[#2C323F] transition-colors"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteLink}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-950/40"
              >
                {isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT FOOTER NAVIGATION LINK & DESCRIPTIONS */}
      {/* ========================================================================= */}
      {isLinkModalOpen && editingLink && (() => {
        const wordCountBn = (editingLink.description_bn || '').trim().split(/\s+/).filter(Boolean).length;
        const isNewLink = editingLink.id.startsWith('l_') && !editingLink.label && !editingLink.label_bn;

        const handleLoadSampleDescription = () => {
          const lbl = (editingLink.label || editingLink.label_bn || '').toLowerCase();
          if (lbl.includes('about') || lbl.includes('সম্পর্কে')) {
            setEditingLink({
              ...editingLink,
              short_description_bn: SAMPLE_ABOUT_US_SHORT_BN,
              description_bn: SAMPLE_ABOUT_US_BN,
              description_en: 'Welcome to SHOPHATBD! Your premium online shopping destination in Bangladesh.'
            });
          } else if (lbl.includes('contact') || lbl.includes('যোগাযোগ') || lbl.includes('সাপোর্ট')) {
            setEditingLink({
              ...editingLink,
              short_description_bn: SAMPLE_CONTACT_SHORT_BN,
              description_bn: SAMPLE_CONTACT_BN,
              description_en: 'Customer Support & Helpline: Contact us anytime via phone, WhatsApp or email.'
            });
          } else {
            setEditingLink({
              ...editingLink,
              short_description_bn: SAMPLE_NEW_LINK_SHORT_BN,
              description_bn: SAMPLE_NEW_LINK_BN,
              description_en: 'Comprehensive guidelines, information and store details.'
            });
          }
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#1E222B] border border-amber-500/30 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-scaleIn flex flex-col max-h-[92vh]">
              {/* Modal Header */}
              <div className="p-4 border-b border-[#2C323F] flex items-center justify-between bg-[#14171E] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {isNewLink
                        ? (isBn ? 'নতুন নেভিগেশন লিংক ও ডেসক্রিপশন যোগ করুন' : 'Add New Navigation Link & Description')
                        : (isBn ? 'নেভিগেশন লিংক ও ডেসক্রিপশন এডিট করুন' : 'Edit Navigation Link & Description')}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {isBn
                        ? 'লিংকের শিরোনাম, শর্ট ডেসক্রিপশন এবং সর্বোচ্চ ১৫০০ শব্দের বাংলা পূর্ণাঙ্গ বিবরণ সেট করুন'
                        : 'Set link titles, short description, and up to 1500 words Bengali full description'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsLinkModalOpen(false);
                    setEditingLink(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSaveLinkItem} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                  {/* Titles: Bangla & English in 2 Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        {isBn ? 'লিংকের নাম / শিরোনাম (বাংলা)' : 'Link Title (Bangla)'} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingLink.label_bn || ''}
                        onChange={(e) => setEditingLink({ ...editingLink, label_bn: e.target.value })}
                        placeholder={isBn ? 'যেমন: আমাদের সম্পর্কে' : 'e.g. আমাদের সম্পর্কে'}
                        className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        {isBn ? 'লিংকের নাম / শিরোনাম (English)' : 'Link Title (English)'} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingLink.label || ''}
                        onChange={(e) => setEditingLink({ ...editingLink, label: e.target.value })}
                        placeholder="e.g. About Us"
                        className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Short Description (শর্ট ডেসক্রিপশন) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <span>{isBn ? 'সংক্ষিপ্ত বিবরণ / শর্ট ডেসক্রিপশন (বাংলা)' : 'Short Description (Bangla)'}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {isBn ? '(১-২ লাইনে মূল সারসংক্ষেপ)' : '(1-2 lines brief summary)'}
                        </span>
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      value={editingLink.short_description_bn || ''}
                      onChange={(e) => setEditingLink({ ...editingLink, short_description_bn: e.target.value })}
                      placeholder={isBn ? 'যেমন: SHOPHATBD হলো বাংলাদেশের নির্ভরযোগ্য ও দ্রুততম অনলাইন শপিং প্ল্যাটফর্ম...' : 'e.g. SHOPHATBD is a reliable online shopping platform...'}
                      className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none leading-relaxed resize-none"
                    />
                  </div>

                  {/* 1500-Word Bengali Description Cell (১৫০০ শব্দের বাংলা বিস্তারিত ডেসক্রিপশন লেখার সেল) */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <span>{isBn ? 'বিস্তারিত বিবরণ / ডেসক্রিপশন (বাংলা)' : 'Detailed Description (Bangla)'}</span>
                        <span className="text-[10px] text-amber-400/90 font-medium">
                          {isBn ? '(সর্বোচ্চ ১৫০০ শব্দ)' : '(Max 1500 words)'}
                        </span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleLoadSampleDescription}
                          className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                          title={isBn ? 'একটি মানসম্মত নমুনা ডেসক্রিপশন লোড করুন' : 'Load sample description template'}
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>{isBn ? 'নমুনা ডেসক্রিপশন লোড করুন' : 'Load Sample'}</span>
                        </button>

                        <div className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 border ${
                          wordCountBn > 1500
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-[#14171E] text-slate-300 border-[#2C323F]'
                        }`}>
                          <span className={wordCountBn > 1500 ? 'text-rose-300 font-black' : 'text-amber-300 font-black'}>
                            {wordCountBn}
                          </span>
                          <span className="text-slate-500">/ ১৫০০ {isBn ? 'শব্দ' : 'words'}</span>
                        </div>
                      </div>
                    </div>

                    <textarea
                      rows={10}
                      value={editingLink.description_bn || ''}
                      onChange={(e) => setEditingLink({ ...editingLink, description_bn: e.target.value })}
                      placeholder={isBn ? 'এখানে আপনার পেজের পূর্ণাঙ্গ ১৫০০ শব্দের বাংলা বিবরণ লিখুন (অনুচ্ছেদ, বুলেট পয়েন্ট, পয়েন্ট তালিকা ইত্যাদি যুক্ত করা যাবে)...' : 'Write up to 1500 words detailed Bengali description here...'}
                      className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-3.5 text-white text-xs leading-relaxed outline-none font-siliguri custom-scrollbar shadow-inner"
                    />

                    {wordCountBn > 1500 && (
                      <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-medium bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{isBn ? 'শব্দ সংখ্যা ১৫০০ অতিক্রম করেছে। অনুগ্রহ করে বিবরণ কিছুটা সংক্ষেপ করুন।' : 'Word count exceeds 1500 words. Please shorten the text.'}</span>
                      </div>
                    )}
                  </div>

                  {/* Optional English Detailed Description (Collapsible) */}
                  <details className="border border-[#2C323F] rounded-xl p-3 bg-[#161920] group">
                    <summary className="text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer flex items-center justify-between select-none">
                      <span>{isBn ? '🌐 বিস্তারিত বিবরণ (English - ঐচ্ছিক)' : '🌐 Detailed Description (English - Optional)'}</span>
                      <span className="text-[10px] text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="pt-3 space-y-2">
                      <input
                        type="text"
                        value={editingLink.short_description || ''}
                        onChange={(e) => setEditingLink({ ...editingLink, short_description: e.target.value })}
                        placeholder="Short summary in English (1-2 lines)..."
                        className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none"
                      />
                      <textarea
                        rows={4}
                        value={editingLink.description_en || ''}
                        onChange={(e) => setEditingLink({ ...editingLink, description_en: e.target.value })}
                        placeholder="Write detailed description in English (Optional)..."
                        className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-3 text-white text-xs leading-relaxed outline-none"
                      />
                    </div>
                  </details>

                  {/* Active Status Toggle */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editingLink.is_active !== false}
                        onChange={(e) => setEditingLink({ ...editingLink, is_active: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-[#14171E] border-[#2C323F] accent-amber-500"
                      />
                      <span className="text-xs font-bold text-white">
                        {isBn ? 'এই লিংক ও পেজটি ফুটারে সক্রিয় রাখুন (Active in Footer)' : 'Keep this link and page active in footer'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-[#2C323F] bg-[#14171E] flex items-center justify-end gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLinkModalOpen(false);
                      setEditingLink(null);
                    }}
                    className="px-4 py-2 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-lg"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isBn ? 'লিংক ও ডেসক্রিপশন সংরক্ষণ করুন' : 'Save Link & Description'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT STORE POLICY & DESCRIPTION */}
      {/* ========================================================================= */}
      {isPolicyModalOpen && editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E222B] border border-amber-500/30 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-scaleIn flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#2C323F] flex items-center justify-between bg-[#14171E] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingPolicy.id.startsWith('pol_') && editingPolicy.title === ''
                      ? (isBn ? 'নতুন স্টোর পলিসি ও বিস্তারিত বিবরণ যুক্ত করুন' : 'Add New Store Policy & Description')
                      : (isBn ? 'স্টোর পলিসি ও বিস্তারিত বিবরণ এডিট করুন' : 'Edit Store Policy & Description')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'পলিসির শিরোনাম, রুট এবং সর্বোচ্চ ১০০০ শব্দের বাংলা ও ইংরেজি বিবরণ সেট করুন' : 'Set policy titles, route, and up to 1000 words descriptions in Bengali and English'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPolicyModalOpen(false);
                  setEditingPolicy(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePolicyItem} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                {/* Titles: Bangla & English in 2 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      {isBn ? 'পলিসির নাম / শিরোনাম (বাংলা)' : 'Policy Title (Bangla)'} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingPolicy.title_bn || ''}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, title_bn: e.target.value })}
                      placeholder={isBn ? "যেমন: রিটার্ন ও রিফান্ড নীতি" : "e.g. রিটার্ন ও রিফান্ড নীতি"}
                      className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      {isBn ? 'পলিসির নাম / শিরোনাম (English)' : 'Policy Title (English)'} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingPolicy.title || ''}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
                      placeholder="e.g. Return & Refund Policy"
                      className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Route / Path */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isBn ? 'পেজ হ্যাশ রুট / পেজ আইডি' : 'Page Hash Route / Page ID'} <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
                      #
                    </div>
                    <input
                      type="text"
                      required
                      value={editingPolicy.path || ''}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, path: e.target.value })}
                      placeholder="shipping-policy, refund-policy, terms, privacy, faq, etc."
                      className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl pl-7 pr-3 py-2 text-cyan-300 font-mono text-xs outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isBn
                      ? 'স্ট্যান্ডার্ড পেজ আইডি: shipping-policy, refund-policy, terms, privacy, faq, about, contact, track'
                      : 'Standard page IDs: shipping-policy, refund-policy, terms, privacy, faq, about, contact, track'}
                  </p>
                </div>

                {/* Description Cell 1: Bangla Description with 1000-word limit counter */}
                <div className="p-3.5 bg-[#14171E] border border-[#2C323F] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span>{isBn ? 'পলিসি ডেসক্রিপশন / বিস্তারিত বিবরণ (বাংলা)' : 'Policy Description (Bangla)'}</span>
                    </label>

                    {(() => {
                      const words = countWords(editingPolicy.description_bn);
                      const isOver = words > 1000;
                      return (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                            isOver
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                              : words > 800
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-[#1E222B] text-slate-300 border-[#2C323F]'
                          }`}
                        >
                          {words} / ১০০০ {isBn ? 'শব্দ' : 'words'}
                        </span>
                      );
                    })()}
                  </div>

                  <textarea
                    rows={6}
                    value={editingPolicy.description_bn || ''}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, description_bn: e.target.value })}
                    placeholder={isBn ? "এখানে বাংলায় আপনার স্টোরের পলিসি বিস্তারিত ধারা, নিয়মাবলী ও শর্তসমূহ লিখুন (সর্বোচ্চ ১০০০ শব্দ)..." : "Write detailed policy clauses, terms, and rules in Bengali (max 1000 words)..."}
                    className="w-full bg-[#1A1E27] border border-[#2C323F] focus:border-amber-500 rounded-xl p-3 text-white text-xs leading-relaxed outline-none resize-y min-h-[130px] placeholder:text-slate-600 font-siliguri"
                  />
                  <p className="text-[10px] text-slate-400">
                    {isBn ? 'গ্রাহকরা ওয়েবসাইটের এই পলিসি পেজে ঢুকলে এই বাংলা বিবরণ দেখতে পাবেন।' : 'Customers reading this policy on the website will view this Bengali description.'}
                  </p>
                </div>

                {/* Description Cell 2: English Description with 1000-word limit counter */}
                <div className="p-3.5 bg-[#14171E] border border-[#2C323F] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span>{isBn ? 'পলিসি ডেসক্রিপশন / বিস্তারিত বিবরণ (English)' : 'Policy Description (English)'}</span>
                    </label>

                    {(() => {
                      const words = countWords(editingPolicy.description_en);
                      const isOver = words > 1000;
                      return (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                            isOver
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                              : words > 800
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-[#1E222B] text-slate-300 border-[#2C323F]'
                          }`}
                        >
                          {words} / 1000 words
                        </span>
                      );
                    })()}
                  </div>

                  <textarea
                    rows={6}
                    value={editingPolicy.description_en || ''}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, description_en: e.target.value })}
                    placeholder="Write detailed policy clauses, timelines, customer guarantees, and return instructions in English (max 1000 words)..."
                    className="w-full bg-[#1A1E27] border border-[#2C323F] focus:border-amber-500 rounded-xl p-3 text-white text-xs leading-relaxed outline-none resize-y min-h-[130px] placeholder:text-slate-600"
                  />
                  <p className="text-[10px] text-slate-400">
                    {isBn ? 'ইংরেজি ভাষায় স্টোর ভিজিটকারীদের জন্য এই বিস্তারিত বিবরণ প্রদর্শিত হবে।' : 'Displayed to English language visitors on the store policy page.'}
                  </p>
                </div>

                {/* Active Toggle */}
                <div className="p-3 bg-[#14171E] border border-[#2C323F] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isBn ? 'পলিসি সক্রিয় রাখুন' : 'Policy Active & Visible'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {isBn ? 'সক্রিয় থাকলে ওয়েবসাইটে এই পলিসি পেজ দেখা যাবে' : 'When enabled, policy is viewable on the storefront'}
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPolicy.is_active !== false}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, is_active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 p-4 border-t border-[#2C323F] bg-[#14171E] shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsPolicyModalOpen(false);
                    setEditingPolicy(null);
                  }}
                  className="px-4 py-2 bg-[#1E222B] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors border border-[#2C323F]"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>{isBn ? 'পলিসি ও বিবরণ সংরক্ষণ করুন' : 'Save Policy & Description'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE POLICY CONFIRMATION */}
      {/* ========================================================================= */}
      {policyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E222B] border border-rose-500/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">
                {isBn ? 'পলিসি লিংক মুছে ফেলতে চান?' : 'Delete Policy Link?'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'আপনি কি নিশ্চিত যে এই পলিসি লিংকটি স্টোর সেটিংস থেকে মুছে ফেলতে চান? প্রয়োজনে ডিফল্ট রিস্টোর করা যাবে।'
                  : 'Are you sure you want to delete this policy link? You can always restore defaults.'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPolicyToDelete(null)}
                className="flex-1 py-2 bg-[#14171E] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-[#2C323F] transition-colors"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={() => handleDeletePolicy(policyToDelete)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-950/40"
              >
                {isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT WHY SHOP FEATURE CARD */}
      {/* ========================================================================= */}
      {isWhyShopModalOpen && editingWhyShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2C323F] bg-[#14171E] shrink-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {editingWhyShop.id && whyShopFeatures.some((f) => f.id === editingWhyShop.id)
                    ? (isBn ? 'ফিচার কার্ড এডিট করুন' : 'Edit Trust / Feature Card')
                    : (isBn ? 'নতুন ফিচার কার্ড যোগ করুন' : 'Add New Trust / Feature Card')}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsWhyShopModalOpen(false);
                  setEditingWhyShop(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveWhyShopItem} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Title (English & Bengali) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isBn ? 'ফিচার শিরোনাম (English)' : 'Feature Title (English)'} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingWhyShop.title || ''}
                    onChange={(e) => setEditingWhyShop({ ...editingWhyShop, title: e.target.value })}
                    placeholder="e.g. 100% Authentic Quality"
                    className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isBn ? 'ফিচার শিরোনাম (বাংলা)' : 'Feature Title (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={editingWhyShop.title_bn || ''}
                    onChange={(e) => setEditingWhyShop({ ...editingWhyShop, title_bn: e.target.value })}
                    placeholder="যেমন: ১০০% আসল কোয়ালিটি"
                    className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none"
                  />
                </div>
              </div>

              {/* Subtitle / Description (English & Bengali) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isBn ? 'সংক্ষিপ্ত বিবরণ (English)' : 'Subtitle / Benefit (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={editingWhyShop.subtitle || ''}
                    onChange={(e) => setEditingWhyShop({ ...editingWhyShop, subtitle: e.target.value })}
                    placeholder="e.g. Carefully curated premium fabrics & original gadget warranties."
                    className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isBn ? 'সংক্ষিপ্ত বিবরণ (বাংলা)' : 'Subtitle / Benefit (Bangla)'}
                  </label>
                  <textarea
                    rows={2}
                    value={editingWhyShop.subtitle_bn || ''}
                    onChange={(e) => setEditingWhyShop({ ...editingWhyShop, subtitle_bn: e.target.value })}
                    placeholder="যেমন: শতভাগ অরিজিনাল ব্র্যান্ড ওয়্যারেন্টি ও প্রিমিয়াম কোয়ালিটি।"
                    className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none resize-none"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="p-3 bg-[#14171E] border border-[#2C323F] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    {isBn ? 'হোমপেজে ফিচারটি সক্রিয় রাখুন' : 'Feature Card Active on Homepage'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {isBn ? 'বন্ধ থাকলে হোমপেজ ভ্যালু সেকশন থেকে লুকানো থাকবে' : 'When disabled, this card is hidden on the storefront'}
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingWhyShop.is_active !== false}
                    onChange={(e) => setEditingWhyShop({ ...editingWhyShop, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2C323F]">
                <button
                  type="button"
                  onClick={() => {
                    setIsWhyShopModalOpen(false);
                    setEditingWhyShop(null);
                  }}
                  className="px-4 py-2 bg-[#14171E] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors border border-[#2C323F]"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>{isBn ? 'সংরক্ষণ করুন' : 'Save Feature'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE WHY SHOP FEATURE CONFIRMATION */}
      {/* ========================================================================= */}
      {whyShopToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E222B] border border-rose-500/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">
                {isBn ? 'ফিচার কার্ডটি মুছে ফেলতে চান?' : 'Delete Feature Card?'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'আপনি কি নিশ্চিত যে এই ট্রাস্ট ফিচার কার্ডটি মুছে ফেলতে চান? প্রয়োজনে ডিফল্ট রিস্টোর বাটনে ক্লিক করে পুনরায় আনা যাবে।'
                  : 'Are you sure you want to delete this feature card? You can always restore defaults.'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWhyShopToDelete(null)}
                className="flex-1 py-2 bg-[#14171E] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-[#2C323F] transition-colors"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={() => handleDeleteWhyShop(whyShopToDelete)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-950/40"
              >
                {isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PAYMENT BADGE METHOD */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && editingPaymentBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E222B] border border-[#2C323F] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2C323F] bg-[#14171E]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingPaymentBadge.id.startsWith('pm_') && !paymentBadges.some(b => b.id === editingPaymentBadge.id)
                    ? (isBn ? 'নতুন পেমেন্ট মেথড যোগ করুন' : 'Add New Payment Method')
                    : (isBn ? 'পেমেন্ট মেথড সম্পাদনা করুন' : 'Edit Payment Method')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setEditingPaymentBadge(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePaymentBadgeItem} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Payment Method Preset Type Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {isBn ? 'পেমেন্ট মেথড ধরণ (লোগো ও স্টাইল নির্বাচন করুন)' : 'Payment Method Type & Preset Logo'} <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'bkash', name: 'bKash', bn: 'বিকাশ' },
                    { id: 'nagad', name: 'Nagad', bn: 'নগদ' },
                    { id: 'card', name: 'Debit/Credit Card', bn: 'কার্ড (VISA/Mastercard)' },
                    { id: 'cod', name: 'Cash on Delivery', bn: 'ক্যাশ অন ডেলিভারি' },
                    { id: 'rocket', name: 'Rocket', bn: 'রকেট' },
                    { id: 'ok_wallet', name: 'OK Wallet', bn: 'ওকে ওয়ালেট' },
                    { id: 'upay', name: 'Upay', bn: 'উপায়' },
                    { id: 'custom', name: 'Custom', bn: 'কাস্টম' }
                  ].map((preset) => {
                    const isSelected = editingPaymentBadge.type === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setEditingPaymentBadge({
                            ...editingPaymentBadge,
                            type: preset.id,
                            name: preset.id === 'custom' ? editingPaymentBadge.name : preset.name,
                            name_bn: preset.id === 'custom' ? editingPaymentBadge.name_bn : preset.bn
                          });
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-sm'
                            : 'bg-[#14171E] border-[#2C323F] text-slate-400 hover:border-slate-600 hover:text-white'
                        }`}
                      >
                        <div className="h-6 flex items-center justify-center pointer-events-none">
                          {renderPaymentLogo(preset.id)}
                        </div>
                        <span className="text-[10px] font-bold block truncate w-full">
                          {preset.id.toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Names (English & Bengali) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isBn ? 'মেথডের নাম (English)' : 'Method Name (English)'} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPaymentBadge.name || ''}
                    onChange={(e) => setEditingPaymentBadge({ ...editingPaymentBadge, name: e.target.value })}
                    placeholder="e.g. bKash"
                    className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isBn ? 'মেথডের নাম (বাংলা)' : 'Method Name (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={editingPaymentBadge.name_bn || ''}
                    onChange={(e) => setEditingPaymentBadge({ ...editingPaymentBadge, name_bn: e.target.value })}
                    placeholder="যেমন: বিকাশ"
                    className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none"
                  />
                </div>
              </div>

              {/* Custom Logo URL (Optional) */}
              {editingPaymentBadge.type === 'custom' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isBn ? 'কাস্টম লোগো ইমেজ URL (ঐচ্ছিক)' : 'Custom Logo Image URL (Optional)'}
                  </label>
                  <input
                    type="url"
                    value={editingPaymentBadge.logo_url || ''}
                    onChange={(e) => setEditingPaymentBadge({ ...editingPaymentBadge, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-[#14171E] border border-[#2C323F] focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none"
                  />
                </div>
              )}

              {/* Active Toggle */}
              <div className="p-3 bg-[#14171E] border border-[#2C323F] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    {isBn ? 'ফুটারে মেথডটি দৃশ্যমান রাখুন' : 'Show Badge in Footer'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {isBn ? 'বন্ধ থাকলে স্টোরফ্রন্ট ফুটারে দেখানো হবে না' : 'When disabled, this badge is hidden on the storefront'}
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPaymentBadge.is_active !== false}
                    onChange={(e) => setEditingPaymentBadge({ ...editingPaymentBadge, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Live Preview Card */}
              <div className="p-3 bg-[#14171E] border border-amber-500/20 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  {isBn ? 'ব্যাজ প্রিভিউ:' : 'Badge Preview:'}
                </span>
                <div className="inline-flex items-center justify-center p-1.5 bg-white rounded-md border border-slate-200 shadow-xs">
                  {renderPaymentLogo(editingPaymentBadge.type, editingPaymentBadge.logo_url)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2C323F]">
                <button
                  type="button"
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setEditingPaymentBadge(null);
                  }}
                  className="px-4 py-2 bg-[#14171E] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors border border-[#2C323F] cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isBn ? 'সংরক্ষণ করুন' : 'Save Method'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE PAYMENT BADGE CONFIRMATION */}
      {/* ========================================================================= */}
      {paymentBadgeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E222B] border border-rose-500/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">
                {isBn ? 'পেমেন্ট মেথডটি মুছে ফেলতে চান?' : 'Delete Payment Method?'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'আপনি কি নিশ্চিত যে এই পেমেন্ট মেথডটি তালিকা থেকে মুছে ফেলতে চান? প্রয়োজনে ডিফল্ট ৪টি ব্যাজ বাটনে ক্লিক করে পুনরায় ফিরিয়ে আনা যাবে।'
                  : 'Are you sure you want to delete this payment badge? You can always restore defaults.'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaymentBadgeToDelete(null)}
                className="flex-1 py-2 bg-[#14171E] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-[#2C323F] transition-colors cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={() => handleDeletePaymentBadge(paymentBadgeToDelete)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-950/40 cursor-pointer"
              >
                {isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
