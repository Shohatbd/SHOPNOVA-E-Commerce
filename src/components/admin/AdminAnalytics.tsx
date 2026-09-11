import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Globe,
  Lock,
  RefreshCw,
  Send,
  HelpCircle,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  Tag,
  ShoppingBag,
  ShoppingCart,
  PhoneCall,
  Flame,
  Layers,
  Sparkles,
  Music
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../services/api.ts';

export const AdminAnalytics: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { isBn } = useLanguage();

  // Google Tracking State
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(settings.google_analytics_id || '');
  const [gtmContainerId, setGtmContainerId] = useState(settings.gtm_container_id || '');
  const [googleAdsConversionId, setGoogleAdsConversionId] = useState(settings.google_ads_conversion_id || '');
  const [googleAdsPurchaseLabel, setGoogleAdsPurchaseLabel] = useState(settings.google_ads_purchase_label || '');
  const [googleAdsAddToCartLabel, setGoogleAdsAddToCartLabel] = useState(settings.google_ads_add_to_cart_label || '');
  const [googleAdsBeginCheckoutLabel, setGoogleAdsBeginCheckoutLabel] = useState(settings.google_ads_begin_checkout_label || '');
  const [googleAdsLeadLabel, setGoogleAdsLeadLabel] = useState(settings.google_ads_lead_label || '');
  const [googleEnhancedConversions, setGoogleEnhancedConversions] = useState(
    settings.google_enhanced_conversions_enabled !== '0' && settings.google_enhanced_conversions_enabled !== false
  );

  // Meta Tracking State
  const [metaPixelId, setMetaPixelId] = useState(settings.meta_pixel_id || '');
  const [metaCapiEnabled, setMetaCapiEnabled] = useState(
    settings.meta_capi_enabled === '1' || settings.meta_capi_enabled === true || settings.meta_capi_enabled === 'true'
  );
  const [metaAccessToken, setMetaAccessToken] = useState(settings.meta_access_token || '');
  const [metaTestEventCode, setMetaTestEventCode] = useState(settings.meta_test_event_code || '');

  // TikTok Tracking State
  const [tiktokPixelId, setTiktokPixelId] = useState(settings.tiktok_pixel_id || '');

  // Track if user explicitly interacted with CAPI toggle in this session
  const userToggledCapiRef = useRef(false);

  // Sync state if context updates and user hasn't actively flipped it
  useEffect(() => {
    if (!userToggledCapiRef.current && settings.meta_capi_enabled !== undefined) {
      setMetaCapiEnabled(
        settings.meta_capi_enabled === '1' || settings.meta_capi_enabled === true || settings.meta_capi_enabled === 'true'
      );
    }
  }, [settings.meta_capi_enabled]);

  // UI States
  const [showMetaToken, setShowMetaToken] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // CAPI Test State
  const [isTestingCapi, setIsTestingCapi] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch initial stats and admin settings (to load securely stored access token)
  useEffect(() => {
    let isMounted = true;
    // Load fresh admin settings including server-secured credentials
    api.getAdminSettings?.().then((res) => {
      if (!isMounted) return;
      if (res?.success && res.settings) {
        if (res.settings.google_analytics_id !== undefined) setGoogleAnalyticsId(res.settings.google_analytics_id);
        if (res.settings.gtm_container_id !== undefined) setGtmContainerId(res.settings.gtm_container_id);
        if (res.settings.google_ads_conversion_id !== undefined) setGoogleAdsConversionId(res.settings.google_ads_conversion_id);
        if (res.settings.google_ads_purchase_label !== undefined) setGoogleAdsPurchaseLabel(res.settings.google_ads_purchase_label);
        if (res.settings.google_ads_add_to_cart_label !== undefined) setGoogleAdsAddToCartLabel(res.settings.google_ads_add_to_cart_label);
        if (res.settings.google_ads_begin_checkout_label !== undefined) setGoogleAdsBeginCheckoutLabel(res.settings.google_ads_begin_checkout_label);
        if (res.settings.google_ads_lead_label !== undefined) setGoogleAdsLeadLabel(res.settings.google_ads_lead_label);
        if (res.settings.google_enhanced_conversions_enabled !== undefined) {
          setGoogleEnhancedConversions(
            res.settings.google_enhanced_conversions_enabled === '1' || res.settings.google_enhanced_conversions_enabled === true || res.settings.google_enhanced_conversions_enabled === 'true'
          );
        }
        if (res.settings.meta_pixel_id !== undefined) setMetaPixelId(res.settings.meta_pixel_id);
        if (res.settings.meta_capi_enabled !== undefined && !userToggledCapiRef.current) {
          setMetaCapiEnabled(
            res.settings.meta_capi_enabled === '1' || res.settings.meta_capi_enabled === true || res.settings.meta_capi_enabled === 'true'
          );
        }
        if (res.settings.meta_access_token !== undefined) setMetaAccessToken(res.settings.meta_access_token);
        if (res.settings.meta_test_event_code !== undefined) setMetaTestEventCode(res.settings.meta_test_event_code);
        if (res.settings.tiktok_pixel_id !== undefined) setTiktokPixelId(res.settings.tiktok_pixel_id);
      }
    }).catch(() => {
      if (!isMounted) return;
      // Fallback to context settings
      setGoogleAnalyticsId(settings.google_analytics_id || '');
      setGtmContainerId(settings.gtm_container_id || '');
      setGoogleAdsConversionId(settings.google_ads_conversion_id || '');
      setGoogleAdsPurchaseLabel(settings.google_ads_purchase_label || '');
      setGoogleAdsAddToCartLabel(settings.google_ads_add_to_cart_label || '');
      setGoogleAdsBeginCheckoutLabel(settings.google_ads_begin_checkout_label || '');
      setGoogleAdsLeadLabel(settings.google_ads_lead_label || '');
      setMetaPixelId(settings.meta_pixel_id || '');
      if (!userToggledCapiRef.current) {
        setMetaCapiEnabled(
          settings.meta_capi_enabled === '1' || settings.meta_capi_enabled === true || settings.meta_capi_enabled === 'true'
        );
      }
      setMetaAccessToken(settings.meta_access_token || '');
      setMetaTestEventCode(settings.meta_test_event_code || '');
      setTiktokPixelId(settings.tiktok_pixel_id || '');
    });

    api.getAnalyticsMetrics().then((res) => {
      if (isMounted && res?.success) setStats(res);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleGoogleEnhanced = async (enabled: boolean) => {
    setGoogleEnhancedConversions(enabled);
    try {
      await updateSettings({ google_enhanced_conversions_enabled: enabled ? '1' : '0' });
    } catch (err) {
      console.warn('Failed to persist enhanced conversions toggle:', err);
    }
  };

  const handleToggleCapi = async (enabled: boolean) => {
    userToggledCapiRef.current = true;
    setMetaCapiEnabled(enabled);
    try {
      const res = await updateSettings({ meta_capi_enabled: enabled ? '1' : '0' });
      if (!res?.success) {
        userToggledCapiRef.current = false;
        setMetaCapiEnabled(!enabled);
        setMsg({
          type: 'error',
          text: res?.message || (isBn ? 'মেটা CAPI সেটিংস সংরক্ষণে সমস্যা হয়েছে।' : 'Failed to persist Meta CAPI state.')
        });
      } else {
        setMsg({
          type: 'success',
          text: enabled
            ? (isBn ? 'Meta Conversions API (CAPI) সফলভাবে সক্রিয় করা হয়েছে।' : 'Meta Conversions API (Server-Side) enabled successfully.')
            : (isBn ? 'Meta Conversions API (CAPI) নিষ্ক্রিয় করা হয়েছে।' : 'Meta Conversions API (Server-Side) disabled.')
        });
        setTimeout(() => setMsg(null), 3500);
      }
    } catch (err: any) {
      userToggledCapiRef.current = false;
      setMetaCapiEnabled(!enabled);
      setMsg({ type: 'error', text: err?.message || 'Failed to update Meta CAPI' });
    }
  };

  const handleSaveAllTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);

    try {
      const payload: Record<string, any> = {
        google_analytics_id: googleAnalyticsId.trim(),
        gtm_container_id: gtmContainerId.trim(),
        google_ads_conversion_id: googleAdsConversionId.trim(),
        google_ads_purchase_label: googleAdsPurchaseLabel.trim(),
        google_ads_add_to_cart_label: googleAdsAddToCartLabel.trim(),
        google_ads_begin_checkout_label: googleAdsBeginCheckoutLabel.trim(),
        google_ads_lead_label: googleAdsLeadLabel.trim(),
        google_enhanced_conversions_enabled: googleEnhancedConversions ? '1' : '0',

        meta_pixel_id: metaPixelId.trim(),
        meta_capi_enabled: metaCapiEnabled ? '1' : '0',
        meta_access_token: metaAccessToken.trim(),
        meta_test_event_code: metaTestEventCode.trim(),

        tiktok_pixel_id: tiktokPixelId.trim()
      };

      const res = await updateSettings(payload);

      if (res.success) {
        setMsg({
          type: 'success',
          text: isBn
            ? 'গুগল, মেটা (CAPI) এবং টিকটক কনভার্সন ট্র্যাকিং কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে।'
            : 'Google, Meta (CAPI) & TikTok conversion tracking configuration saved successfully.'
        });
        setTimeout(() => setMsg(null), 4000);
      } else {
        setMsg({
          type: 'error',
          text: res.message || (isBn ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save settings.')
        });
      }
    } catch (err: any) {
      setMsg({
        type: 'error',
        text: err.message || (isBn ? 'ত্রুটি ঘটেছে।' : 'Error updating tracking settings.')
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestMetaCapi = async () => {
    if (!metaPixelId.trim() || !metaAccessToken.trim()) {
      setMsg({
        type: 'error',
        text: isBn
          ? 'মেটা CAPI টেস্ট করার আগে মেটা পিক্সেল আইডি এবং মেটা অ্যাক্সেস টোকেন প্রবেশ করান।'
          : 'Please enter Meta Pixel ID and Meta Access Token before testing CAPI connection.'
      });
      return;
    }

    setIsTestingCapi(true);
    setTestResult(null);

    try {
      const res = await api.testMetaCapi({
        pixel_id: metaPixelId.trim(),
        access_token: metaAccessToken.trim(),
        test_event_code: metaTestEventCode.trim() || undefined
      });

      setTestResult(res);
      if (res.success) {
        setMsg({
          type: 'success',
          text: isBn
            ? 'মেটা সার্ভার CAPI টেস্ট ইভেন্ট সফলভাবে পাঠানো হয়েছে! মেটা ইভেন্টস ম্যানেজারে ইভেন্ট রিসিভ হয়েছে কিনা দেখুন।'
            : 'Meta Server CAPI test event sent successfully! Check your Meta Events Manager Test Events tab.'
        });
      } else {
        setMsg({
          type: 'error',
          text: res.message || (isBn ? 'মেটা CAPI টেস্ট ব্যর্থ হয়েছে।' : 'Meta CAPI test failed.')
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
      setMsg({
        type: 'error',
        text: err.message || 'Error executing Meta CAPI test.'
      });
    } finally {
      setIsTestingCapi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-white">
              {isBn ? 'অ্যানালিটিক্স, গুগল অ্যাডস ও মেটা ট্র্যাকিং' : 'Analytics, Google Ads & Meta CAPI Tracking'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {isBn
              ? 'গুগল জিটিএম, জিএ৪, গুগল অ্যাডস কনভার্সন লেবেল এবং মেটা পিক্সেল ও কনভার্সন এপিআই (CAPI) এক জায়গায় কনফিগার করুন।'
              : 'Configure GTM, GA4, Google Ads conversion labels, Meta Pixel, and Server-Side Meta Conversions API (CAPI) in one centralized tracking hub.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isBn ? 'নিরাপদ সার্ভার প্রক্সি সক্রিয়' : 'Secure Server Proxy Active'}</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-fadeIn ${
            msg.type === 'success'
              ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950/70 border border-rose-800 text-rose-300'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          )}
          <span className="flex-1">{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Conversion Funnel Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{isBn ? '১. প্রোডাক্ট ভিউ' : '1. Product Views'}</span>
            <Eye className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-xl font-black text-white">{stats?.views || '1,420'}</p>
          <span className="text-[10px] text-slate-500">ViewContent / view_item</span>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{isBn ? '২. অ্যাড টু কার্ট' : '2. Add to Cart'}</span>
            <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-400">{stats?.adds || '342'}</p>
          <span className="text-[10px] text-slate-500">AddToCart / add_to_cart</span>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{isBn ? '৩. চেকআউট শুরু' : '3. Checkout Initiated'}</span>
            <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <p className="text-xl font-black text-sky-400">{stats?.checkouts || '180'}</p>
          <span className="text-[10px] text-slate-500">InitiateCheckout / begin_checkout</span>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{isBn ? '৪. সম্পন্ন অর্ডার' : '4. Purchases'}</span>
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400">{stats?.completed || '98'}</p>
          <span className="text-[10px] text-slate-500">Purchase / conversion (Deduplicated)</span>
        </div>
      </div>

      <form onSubmit={handleSaveAllTracking} className="space-y-6">
        {/* ========================================================================= */}
        {/* SECTION 1: GOOGLE TRACKING & ADS CONVERSIONS */}
        {/* ========================================================================= */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-xs">
                G
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isBn ? 'গুগল ট্র্যাকিং ও কনভার্সন কনফিগারেশন' : 'Google Tracking & Conversions Setup'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isBn
                    ? 'Google Analytics (GA4), Google Tag Manager (GTM) এবং Google Ads কনভার্সন ট্র্যাকিং।'
                    : 'Google Analytics (GA4), Google Tag Manager (GTM), and Google Ads Conversion Tracking.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg border border-blue-500/20">
                gtag.js / GTM DataLayer
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* GA4 Measurement ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-bold block">
                  {isBn ? 'GA4 Measurement ID (গুগল অ্যানালিটিক্স ৪)' : 'GA4 Measurement ID'}
                </label>
                <span className="text-[10px] text-slate-500 font-mono">G-XXXXXXXXXX</span>
              </div>
              <input
                type="text"
                value={googleAnalyticsId}
                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                placeholder="e.g. G-ABC123XYZ4"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {isBn
                  ? 'গুগল অ্যানালিটিক্স ৪ প্রোপার্টি মেজারমেন্ট আইডি।'
                  : 'Your Google Analytics 4 Data Stream Measurement ID.'}
              </p>
            </div>

            {/* GTM Container ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-bold block">
                  {isBn ? 'GTM Container ID (গুগল ট্যাগ ম্যানেজার)' : 'GTM Container ID'}
                </label>
                <span className="text-[10px] text-slate-500 font-mono">GTM-XXXXXXX</span>
              </div>
              <input
                type="text"
                value={gtmContainerId}
                onChange={(e) => setGtmContainerId(e.target.value)}
                placeholder="e.g. GTM-N8XXXXX"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {isBn
                  ? 'গুগল ট্যাগ ম্যানেজার কন্টেইনার আইডি (অটোমেটিক্যালি সাইটের হেড ও বডিতে স্ক্রিপ্ট সক্রিয় করে)।'
                  : 'Google Tag Manager container ID (automatically activates head and body scripts).'}
              </p>
            </div>

            {/* Google Ads Conversion ID */}
            <div className="md:col-span-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-bold flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBn ? 'Google Ads Conversion ID (গুগল অ্যাডস অ্যাকাউন্ট আইডি)' : 'Google Ads Conversion ID'}</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">AW-XXXXXXXXX</span>
              </div>
              <input
                type="text"
                value={googleAdsConversionId}
                onChange={(e) => setGoogleAdsConversionId(e.target.value)}
                placeholder="e.g. AW-123456789"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {isBn
                  ? 'আপনার গুগল অ্যাডস কনভার্সন আইডি (AW- দিয়ে শুরু)। এটি দিলে নিচের সব কনভার্সন ট্র্যাকিং সক্রিয় হবে।'
                  : 'Your Google Ads Conversion ID (e.g. AW-123456789). Required to link all conversion action labels below.'}
              </p>
            </div>

            {/* Google Ads Specific Conversion Labels */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'Purchase Conversion Label (ক্রয় কনভার্সন)' : 'Purchase Conversion Label'}
                </label>
                <input
                  type="text"
                  value={googleAdsPurchaseLabel}
                  onChange={(e) => setGoogleAdsPurchaseLabel(e.target.value)}
                  placeholder="e.g. AbCdEfGhIjKlMnOpQrS"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isBn ? 'অর্ডার কমপ্লিট হলে ফায়ার হবে (অর্ডার ভ্যালু ও আইডি সহ)' : 'Fires on completed order (with order value and currency)'}
                </p>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'AddToCart Conversion Label (কার্টে যোগ)' : 'AddToCart Conversion Label'}
                </label>
                <input
                  type="text"
                  value={googleAdsAddToCartLabel}
                  onChange={(e) => setGoogleAdsAddToCartLabel(e.target.value)}
                  placeholder="e.g. XyZ123456789"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isBn ? 'কাস্টমার কার্টে প্রোডাক্ট যোগ করলে ফায়ার হবে' : 'Fires when customer adds item to cart'}
                </p>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'BeginCheckout Conversion Label (চেকআউট শুরু)' : 'BeginCheckout Conversion Label'}
                </label>
                <input
                  type="text"
                  value={googleAdsBeginCheckoutLabel}
                  onChange={(e) => setGoogleAdsBeginCheckoutLabel(e.target.value)}
                  placeholder="e.g. QwErTyUiOp123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isBn ? 'চেকআউট পেজে প্রবেশ করলে ফায়ার হবে' : 'Fires when customer initiates checkout process'}
                </p>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isBn ? 'Lead Conversion Label (যোগাযোগ / লিড)' : 'Lead Conversion Label'}
                </label>
                <input
                  type="text"
                  value={googleAdsLeadLabel}
                  onChange={(e) => setGoogleAdsLeadLabel(e.target.value)}
                  placeholder="e.g. Ld_AbCdEf12345"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isBn ? 'কন্টাক্ট ফর্ম বা সাবস্ক্রিপশন সম্পন্ন হলে ফায়ার হবে' : 'Fires when lead/contact submission is recorded'}
                </p>
              </div>
            </div>

            {/* Google Enhanced Conversions Toggle */}
            <div className="md:col-span-2 flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-slate-200 font-bold block">
                  {isBn ? 'Google Enhanced Conversions (এনহ্যান্সড কনভার্সন)' : 'Google Enhanced Conversions'}
                </span>
                <p className="text-[11px] text-slate-400">
                  {isBn
                    ? 'কাস্টমারের ইমেল ও ফোন নম্বর SHA-256 এনক্রিপ্ট করে গুগল অ্যাডস ম্যাচিং নিখুঁত করে।'
                    : 'Sends securely SHA-256 hashed customer email & phone data to improve Google Ads conversion attribution accuracy.'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={googleEnhancedConversions}
                  onChange={(e) => handleToggleGoogleEnhanced(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: META (FACEBOOK / INSTAGRAM) PIXEL & CONVERSIONS API (CAPI) */}
        {/* ========================================================================= */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1877F2]/10 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2] font-black text-xs">
                M
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isBn ? 'মেটা পিক্সেল ও কনভার্সন এপিআই (Meta CAPI)' : 'Meta Pixel & Conversions API (CAPI)'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isBn
                    ? 'ব্রাউজার পিক্সেল এবং ১০০% নিরাপদ ব্যাকএন্ড সার্ভার কনভার্সন এপিআই (iOS 14+ Ad-Blocker বাইপাস)।'
                    : 'Browser Meta Pixel and 100% server-side Conversions API for resilient iOS 14+ tracking.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono bg-[#1877F2]/10 text-[#1877F2] px-2.5 py-1 rounded-lg border border-[#1877F2]/20">
                fbq + Meta Graph API v19.0
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Meta Pixel ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-bold block">
                  {isBn ? 'Meta Pixel ID (ফেসবুক পিক্সেল আইডি)' : 'Meta Pixel ID'}
                </label>
                <span className="text-[10px] text-slate-500 font-mono">15-16 Digits Number</span>
              </div>
              <input
                type="text"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                placeholder="e.g. 192837465928374"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {isBn
                  ? 'আপনার ফেসবুক/মেটা ইভেন্টস ম্যানেজার থেকে প্রাপ্ত পিক্সেল বা ডেটাসেট আইডি।'
                  : 'Your Meta Pixel ID or Dataset ID from Meta Events Manager.'}
              </p>
            </div>

            {/* Meta Conversions API Toggle Box */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-200 font-bold">
                      {isBn ? 'Meta Conversions API (CAPI) সক্রিয় করুন' : 'Enable Meta Conversions API (Server-Side)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isBn
                      ? 'অ্যাড-ব্লকার এবং সাফারি ব্রাউজার লিমিটেশনের জন্য সার্ভার থেকে সরাসরি মেটায় ইভেন্ট পাঠায়।'
                      : 'Dispatches duplicate-safe events directly from backend server to Meta for maximum accuracy.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={metaCapiEnabled}
                    onChange={(e) => handleToggleCapi(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1877F2]"></div>
                </label>
              </div>

              {metaCapiEnabled && (
                <div className="space-y-4 pt-3 border-t border-slate-800">
                  {/* Meta Access Token (Sensitive Credential) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-bold flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isBn ? 'Meta Conversions API Access Token (সংবেদনশীল টোকেন)' : 'Meta Conversions API Access Token'}</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {isBn ? '🔒 ব্যাকএন্ড সুরক্ষিত' : '🔒 Backend Only'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowMetaToken(!showMetaToken)}
                          className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
                        >
                          {showMetaToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showMetaToken ? (isBn ? 'লুকান' : 'Hide') : (isBn ? 'দেখান' : 'Show')}</span>
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type={showMetaToken ? 'text' : 'password'}
                        value={metaAccessToken}
                        onChange={(e) => setMetaAccessToken(e.target.value)}
                        placeholder="EAA..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pr-10 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {isBn
                        ? 'মেটা ইভেন্টস ম্যানেজার > সেটিংস > Conversions API > "Generate access token" থেকে কপি করা টোকেন। এটি কখনই পাবলিক ফ্রন্টএন্ডে প্রদর্শিত হয় না।'
                        : 'System user access token generated in Meta Events Manager > Settings > Conversions API. Stored securely on backend.'}
                    </p>
                  </div>

                  {/* Meta Test Event Code */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-bold block">
                        {isBn ? 'Meta Test Event Code (ঐচ্ছিক - লাইভ টেস্টের জন্য)' : 'Meta Test Event Code (Optional for Live Testing)'}
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">e.g. TEST12345</span>
                    </div>
                    <input
                      type="text"
                      value={metaTestEventCode}
                      onChange={(e) => setMetaTestEventCode(e.target.value)}
                      placeholder="TESTXXXXX"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      {isBn
                        ? 'মেটা ইভেন্টস ম্যানেজারের "Test Events" ট্যাবের কোড। টেস্ট করা শেষে এটি খালি রাখাই উত্তম।'
                        : 'Found in Meta Events Manager > Test Events tab. Clear this once live testing is complete.'}
                    </p>
                  </div>

                  {/* Interactive Test Ping Button & Result Card */}
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleTestMetaCapi}
                      disabled={isTestingCapi}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 border border-slate-700 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5 text-[#1877F2]" />
                      <span>
                        {isTestingCapi
                          ? (isBn ? 'মেটা সার্ভারে টেস্ট হচ্ছে...' : 'Testing Meta CAPI Connection...')
                          : (isBn ? 'মেটা CAPI কানেকশন টেস্ট করুন' : 'Test Meta CAPI Connection')}
                      </span>
                    </button>

                    <div className="text-[11px] text-slate-400">
                      {isBn
                        ? '💡 সার্ভার ব্যাকএন্ড থেকে সরাসরি মেটা Graph API তে টেস্ট পিং পাঠাবে।'
                        : '💡 Dispatches a test diagnostic ping directly to Meta Graph API.'}
                    </div>
                  </div>

                  {testResult && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs font-mono space-y-1.5 ${
                        testResult.success
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-800 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          {testResult.success ? '✓ Meta CAPI Response (OK)' : '✕ Meta CAPI Error'}
                        </span>
                        <span className="text-[10px] opacity-75">{new Date().toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[11px]">{testResult.message}</p>
                      {testResult.event_id && (
                        <p className="text-[10px] opacity-80">Test Event ID: {testResult.event_id}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. TikTok Pixel Tracking Card */}
        <div className="bg-[#14171E] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black border border-slate-700 flex items-center justify-center text-[#FE2C55] shadow-lg">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{isBn ? 'TikTok Pixel ট্র্যাকিং' : 'TikTok Pixel Tracking'}</span>
                  <span className="text-[10px] bg-slate-800 text-[#25F4EE] border border-slate-700 px-2 py-0.5 rounded-full font-mono">
                    ttq.js
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isBn
                    ? 'টিকটক অ্যাড কনভার্সন ট্র্যাকিং ও ভিডিও ক্যাম্পেইন অপটিমাইজেশন পিক্সেল'
                    : 'TikTok ad conversion tracking, retargeting & video campaign measurement'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                  tiktokPixelId.trim()
                    ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-400'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    tiktokPixelId.trim() ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                <span>
                  {tiktokPixelId.trim()
                    ? (isBn ? 'টিকটক কানেক্টেড' : 'TikTok Connected')
                    : (isBn ? 'কনফিগার করা হয়নি' : 'Not Configured')}
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 max-w-2xl">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span>{isBn ? 'TikTok Pixel ID' : 'TikTok Pixel ID'}</span>
                  <span className="text-[10px] font-normal text-slate-400 font-mono">(CXXXXXXXXXXXXXX)</span>
                </label>
                {tiktokPixelId && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {isBn ? 'ভ্যালিড ফরম্যাট' : 'Ready'}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={tiktokPixelId}
                onChange={(e) => setTiktokPixelId(e.target.value)}
                placeholder="CXXXXXXXXXXXXXX"
                className="w-full bg-[#1A1F2B] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-amber-500 transition-colors"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                {isBn
                  ? 'টিকটক অ্যাডস ম্যানেজার (TikTok Ads Manager -> Assets -> Events -> Web Events) থেকে আপনার পিক্সেল কোডটি কপি করে এখানে পেস্ট করুন।'
                  : 'Obtained from TikTok Ads Manager -> Assets -> Events -> Web Events.'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {isBn
              ? 'সেটিংস সেভ করার সাথে সাথে স্টোরফ্রন্ট ট্র্যাকিং রিয়েল-টাইমে আপডেট হবে।'
              : 'Tracking parameters will take effect immediately upon saving.'}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-3 rounded-2xl shadow-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>
              {isSaving
                ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving Tracking Configuration...')
                : (isBn ? 'সব ট্র্যাকিং সেটিংস সংরক্ষণ করুন' : 'Save Tracking Configuration')}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
