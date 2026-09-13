import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings,
  Sparkles,
  RefreshCw,
  Trash2,
  Key,
  Shield,
  Phone,
  Sliders,
  Eye,
  EyeOff,
  Radio,
  ExternalLink,
  ChevronRight,
  FileText,
  Truck,
  ShoppingBag,
  Info
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { api } from '../../services/api.ts';

interface SmsLog {
  id: string;
  phone: string;
  message: string;
  provider: string;
  status: 'sent' | 'failed' | 'disabled';
  response_data: string | null;
  order_id: string | null;
  order_number: string | null;
  event_type: string;
  created_at: string;
}

interface SmsStats {
  total: number;
  sent: number;
  failed: number;
  today: number;
}

const SMS_PROVIDERS = [
  {
    id: 'greenweb',
    name: 'Greenweb Bangladesh',
    badge: 'Popular BD Gateway',
    color: 'border-emerald-500 bg-emerald-50 text-emerald-950',
    iconColor: 'text-emerald-600',
    website: 'https://greenweb.com.bd',
    fields: ['apiKey'],
    apiKeyLabel: 'Greenweb API Token',
    apiKeyPlaceholder: 'e.g. 10293847561029384756...',
    desc: 'Instant delivery, non-masking & masking support across Grameenphone, Banglalink, Robi, Teletalk.'
  },
  {
    id: 'bulksmsbd',
    name: 'BulkSMS BD',
    badge: 'Fast Delivery',
    color: 'border-blue-500 bg-blue-50 text-blue-950',
    iconColor: 'text-blue-600',
    website: 'https://bulksmsbd.net',
    fields: ['apiKey', 'senderId'],
    apiKeyLabel: 'BulkSMSBD API Key',
    apiKeyPlaceholder: 'e.g. dshf89234jsdf...',
    senderIdLabel: 'Sender ID / Masking',
    senderIdPlaceholder: 'e.g. 8809612345678 or SHOPHATBD',
    desc: 'Widely used SMS gateway with HTTP API and real-time DLR.'
  },
  {
    id: 'elitbuzz',
    name: 'Elitbuzz BD',
    badge: 'Enterprise Gateway',
    color: 'border-purple-500 bg-purple-50 text-purple-950',
    iconColor: 'text-purple-600',
    website: 'https://elitbuzz-bd.com',
    fields: ['apiKey', 'senderId'],
    apiKeyLabel: 'Elitbuzz API Key',
    apiKeyPlaceholder: 'e.g. eltbz_key_...',
    senderIdLabel: 'Sender ID / Masking Name',
    senderIdPlaceholder: 'e.g. SHOPHATBD',
    desc: 'High-throughput bulk messaging with operator level routing.'
  },
  {
    id: 'sslwireless',
    name: 'SSL Wireless (SMS Plus)',
    badge: 'Tier-1 Aggregator',
    color: 'border-amber-500 bg-amber-50 text-amber-950',
    iconColor: 'text-amber-600',
    website: 'https://sslwireless.com',
    fields: ['apiKey', 'senderId'],
    apiKeyLabel: 'SSL Wireless API Token (api_token)',
    apiKeyPlaceholder: 'e.g. your_bearer_token',
    senderIdLabel: 'Stakeholder ID (SID)',
    senderIdPlaceholder: 'e.g. SHOPHATBDNONMASK',
    desc: 'Direct telco integration with maximum reliability and bank-grade infrastructure.'
  },
  {
    id: 'mimsms',
    name: 'MimSMS BD',
    badge: 'Cloud SMS',
    color: 'border-rose-500 bg-rose-50 text-rose-950',
    iconColor: 'text-rose-600',
    website: 'https://mimsms.com',
    fields: ['apiKey', 'senderId'],
    apiKeyLabel: 'MimSMS API Token',
    apiKeyPlaceholder: 'e.g. mim_token_...',
    senderIdLabel: 'Sender ID',
    senderIdPlaceholder: 'e.g. SHOPHATBD',
    desc: 'Fast JSON API with simple masking setup.'
  },
  {
    id: 'smsnoc',
    name: 'SMSNOC Gateway',
    badge: 'Developer Friendly',
    color: 'border-cyan-500 bg-cyan-50 text-cyan-950',
    iconColor: 'text-cyan-600',
    website: 'https://smsnoc.com',
    fields: ['apiKey', 'senderId'],
    apiKeyLabel: 'Bearer Token / API Key',
    apiKeyPlaceholder: 'e.g. smsnoc_key...',
    senderIdLabel: 'Sender ID',
    senderIdPlaceholder: 'e.g. 88096...',
    desc: 'Modern REST API with international and local SMS delivery.'
  },
  {
    id: 'custom',
    name: 'Custom HTTP Webhook / Any API',
    badge: 'Custom URL',
    color: 'border-slate-500 bg-slate-50 text-slate-950',
    iconColor: 'text-slate-600',
    website: '',
    fields: ['customUrl', 'apiKey', 'senderId'],
    apiKeyLabel: 'API Key (Optional)',
    apiKeyPlaceholder: 'Key to replace in URL',
    senderIdLabel: 'Sender ID (Optional)',
    senderIdPlaceholder: 'Sender to replace in URL',
    desc: 'Connect any other SMS gateway by providing their API URL template.'
  }
];

const TEMPLATE_TAGS = [
  { tag: '{customer_name}', label: 'Customer Name', bn: 'কাস্টমার নাম' },
  { tag: '{order_number}', label: 'Order #', bn: 'অর্ডার নম্বর' },
  { tag: '{tracking_id}', label: 'Tracking Code', bn: 'ট্র্যাকিং কোড' },
  { tag: '{courier_name}', label: 'Courier Name', bn: 'কুরিয়ারের নাম' },
  { tag: '{grand_total}', label: 'Total Amount', bn: 'মোট মূল্য' },
  { tag: '{site_name}', label: 'Store Name', bn: 'দোকানের নাম' },
  { tag: '{tracking_url}', label: 'Live Tracking Link', bn: 'ট্র্যাকিং লিঙ্ক' }
];

export const AdminSmsSettings: React.FC = () => {
  const { isBn } = useLanguage();
  const { settings, refreshSettings } = useSettings();

  // Form states
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [provider, setProvider] = useState('greenweb');
  const [apiKey, setApiKey] = useState('');
  const [senderId, setSenderId] = useState('');
  const [clientId, setClientId] = useState('');
  const [password, setPassword] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customMethod, setCustomMethod] = useState<'GET' | 'POST'>('GET');

  // Event toggles
  const [orderPlacedEnabled, setOrderPlacedEnabled] = useState(true);
  const [orderConfirmedEnabled, setOrderConfirmedEnabled] = useState(true);
  const [orderShippedEnabled, setOrderShippedEnabled] = useState(true);
  const [orderDeliveredEnabled, setOrderDeliveredEnabled] = useState(true);

  // Templates
  const [orderPlacedTemplate, setOrderPlacedTemplate] = useState('');
  const [orderConfirmedTemplate, setOrderConfirmedTemplate] = useState('');
  const [orderShippedTemplate, setOrderShippedTemplate] = useState('');
  const [orderDeliveredTemplate, setOrderDeliveredTemplate] = useState('');

  // UI helpers
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'templates' | 'test' | 'logs'>('config');

  // Test SMS State
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; response?: any } | null>(null);

  // Logs State
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [stats, setStats] = useState<SmsStats>({ total: 0, sent: 0, failed: 0, today: 0 });
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logsFilter, setLogsFilter] = useState<'all' | 'sent' | 'failed'>('all');

  // Initialize values from settings
  useEffect(() => {
    if (settings) {
      setSmsEnabled(settings.sms_enabled === '1' || settings.sms_enabled === 'true');
      setProvider(settings.sms_provider || 'greenweb');
      setApiKey(settings.sms_api_key || '');
      setSenderId(settings.sms_sender_id || '');
      setClientId(settings.sms_client_id || '');
      setPassword(settings.sms_password || '');
      setCustomUrl(settings.sms_custom_url || '');
      setCustomMethod((settings.sms_custom_method as 'GET' | 'POST') || 'GET');

      setOrderPlacedEnabled(settings.sms_order_placed_enabled !== '0' && settings.sms_order_placed_enabled !== 'false');
      setOrderConfirmedEnabled(settings.sms_order_confirmed_enabled === '1' || settings.sms_order_confirmed_enabled === 'true');
      setOrderShippedEnabled(settings.sms_order_shipped_enabled !== '0' && settings.sms_order_shipped_enabled !== 'false');
      setOrderDeliveredEnabled(settings.sms_order_delivered_enabled === '1' || settings.sms_order_delivered_enabled === 'true');

      setOrderPlacedTemplate(
        settings.sms_template_order_placed ||
          'Dear {customer_name}, your order #{order_number} of {grand_total} has been received at {site_name}! Track here: {tracking_url}'
      );
      setOrderConfirmedTemplate(
        settings.sms_template_order_confirmed ||
          'Dear {customer_name}, your order #{order_number} has been confirmed and is being processed for delivery. {site_name}'
      );
      setOrderShippedTemplate(
        settings.sms_template_order_shipped ||
          'Dear {customer_name}, your order #{order_number} has been shipped via {courier_name}. Tracking ID: {tracking_id}. {site_name}'
      );
      setOrderDeliveredTemplate(
        settings.sms_template_order_delivered ||
          'Dear {customer_name}, your order #{order_number} has been delivered successfully! Thank you for shopping with {site_name}.'
      );
    }
  }, [settings]);

  // Fetch SMS Logs
  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const data = await api.getSmsLogs(logsFilter);
      if (data.success) {
        setLogs(data.logs || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching SMS logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab, logsFilter]);

  // Save SMS Configuration
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        sms_enabled: smsEnabled ? '1' : '0',
        sms_provider: provider,
        sms_api_key: apiKey.trim(),
        sms_sender_id: senderId.trim(),
        sms_client_id: clientId.trim(),
        sms_password: password.trim(),
        sms_custom_url: customUrl.trim(),
        sms_custom_method: customMethod,
        sms_order_placed_enabled: orderPlacedEnabled ? '1' : '0',
        sms_order_confirmed_enabled: orderConfirmedEnabled ? '1' : '0',
        sms_order_shipped_enabled: orderShippedEnabled ? '1' : '0',
        sms_order_delivered_enabled: orderDeliveredEnabled ? '1' : '0',
        sms_template_order_placed: orderPlacedTemplate,
        sms_template_order_confirmed: orderConfirmedTemplate,
        sms_template_order_shipped: orderShippedTemplate,
        sms_template_order_delivered: orderDeliveredTemplate
      };

      const data = await api.updateSettings(payload);
      if (data.success) {
        setSaveSuccess(true);
        refreshSettings();
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(data.message || 'Failed to save SMS settings');
      }
    } catch (err) {
      console.error('Save SMS settings error:', err);
      alert('Error saving SMS configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  // Send Test SMS
  const handleSendTestSms = async () => {
    if (!testPhone.trim()) {
      alert(isBn ? 'অনুগ্রহ করে প্রাপকের মোবাইল নম্বর দিন।' : 'Please enter a recipient phone number.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const data = await api.sendTestSms({
        phone: testPhone.trim(),
        message: testMessage.trim() || undefined,
        provider,
        apiKey: apiKey.trim(),
        senderId: senderId.trim(),
        customUrl: customUrl.trim(),
        customMethod
      });

      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Test SMS sent!' : 'Failed to send SMS'),
        response: data.response || data.error
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Network error occurred while testing SMS.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Clear Logs
  const handleClearLogs = async () => {
    if (!window.confirm(isBn ? 'আপনি কি সব এসএমএস লগ মুছে ফেলতে চান?' : 'Are you sure you want to clear all SMS logs?')) {
      return;
    }
    try {
      const data = await api.clearSmsLogs();
      if (data.success) {
        fetchLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectedProviderInfo = SMS_PROVIDERS.find((p) => p.id === provider) || SMS_PROVIDERS[0];

  const insertTagToTemplate = (tag: string, target: 'placed' | 'confirmed' | 'shipped' | 'delivered') => {
    if (target === 'placed') setOrderPlacedTemplate((prev) => prev + ' ' + tag);
    else if (target === 'confirmed') setOrderConfirmedTemplate((prev) => prev + ' ' + tag);
    else if (target === 'shipped') setOrderShippedTemplate((prev) => prev + ' ' + tag);
    else if (target === 'delivered') setOrderDeliveredTemplate((prev) => prev + ' ' + tag);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight font-heading">
                  {isBn ? 'এসএমএস গেটওয়ে ও অটোমেশন' : 'SMS Gateway & Order Notifications'}
                </h1>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {isBn
                    ? 'অর্ডার প্লেস, কুরিয়ার ট্র্যাকিং ও ডেলিভারি স্ট্যাটাসের স্বয়ংক্রিয় এসএমএস নোটিফিকেশন সিস্টেম।'
                    : 'Automate order tracking IDs, confirmation SMS, and delivery updates directly to customer phones.'}
                </p>
              </div>
            </div>
          </div>

          {/* Master Enable Toggle */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 shrink-0">
            <div className="text-right">
              <span className="block text-xs font-bold text-white">
                {isBn ? 'এসএমএস সার্ভিস' : 'SMS Service'}
              </span>
              <span className={`text-[11px] font-semibold ${smsEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                {smsEnabled ? (isBn ? 'সক্রিয় (Active)' : 'Active') : (isBn ? 'বন্ধ (Disabled)' : 'Disabled')}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smsEnabled}
                onChange={(e) => setSmsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-slate-400 text-[11px] block">{isBn ? 'মোট প্রেরিত এসএমএস' : 'Total Sent SMS'}</span>
            <span className="text-lg font-black text-white font-mono mt-0.5">{stats.sent}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-slate-400 text-[11px] block">{isBn ? 'আজকের এসএমএস' : 'Sent Today'}</span>
            <span className="text-lg font-black text-emerald-400 font-mono mt-0.5">{stats.today}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-slate-400 text-[11px] block">{isBn ? 'ব্যর্থ / এরর' : 'Failed Attempts'}</span>
            <span className="text-lg font-black text-rose-400 font-mono mt-0.5">{stats.failed}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-slate-400 text-[11px] block">{isBn ? 'বর্তমান প্রোভাইডার' : 'Active Gateway'}</span>
            <span className="text-sm font-bold text-amber-300 truncate mt-1 block">
              {selectedProviderInfo.name}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl px-2 py-1.5 shadow-xs overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'config'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>{isBn ? '১. গেটওয়ে কনফিগারেশন' : '1. Gateway Config'}</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isBn ? '২. এসএমএস টেমপ্লেট ও ইভেন্ট' : '2. Templates & Events'}</span>
        </button>

        <button
          onClick={() => setActiveTab('test')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'test'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isBn ? '৩. লাইভ টেস্ট এসএমএস' : '3. Live Test Console'}</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{isBn ? '৪. ডেলিভারি হিস্ট্রি লগ' : '4. Delivery Logs'}</span>
        </button>
      </div>

      {/* TAB 1: GATEWAY CONFIG */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isBn ? 'এসএমএস গেটওয়ে প্রোভাইডার নির্বাচন করুন' : 'Select SMS Gateway Provider'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBn
                ? 'বাংলাদেশের যেকোনো নির্ভরযোগ্য এসএমএস গেটওয়ে অথবা কাস্টম API এর সাথে সহজেই কানেক্ট করুন।'
                : 'Choose your desired SMS provider to dispatch automated tracking IDs and status updates.'}
            </p>
          </div>

          {/* Provider Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SMS_PROVIDERS.map((p) => {
              const isSelected = provider === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all relative ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">{p.name}</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full inline-block mt-1">
                        {p.badge}
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">{p.desc}</p>
                  {p.website && (
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-2"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Provider Credentials Input Form */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {selectedProviderInfo.name} - {isBn ? 'API ক্রেডেনশিয়ালস' : 'API Credentials'}
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* API Key */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {selectedProviderInfo.apiKeyLabel || 'API Key / Token'}
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={selectedProviderInfo.apiKeyPlaceholder}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Sender ID */}
              {selectedProviderInfo.fields.includes('senderId') && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {selectedProviderInfo.senderIdLabel || 'Sender ID / Masking Name'}
                  </label>
                  <input
                    type="text"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    placeholder={selectedProviderInfo.senderIdPlaceholder || 'e.g. SHOPHATBD'}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {isBn ? 'অনুমোদিত মাস্কিং নাম বা নন-মাস্কিং নম্বর' : 'Approved Masking Name or Sender Number'}
                  </span>
                </div>
              )}
            </div>

            {/* Custom URL Endpoint if provider is custom */}
            {provider === 'custom' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Custom API Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://api.gateway.com/send?key={apiKey}&to={phone}&msg={message}&sender={senderId}"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-slate-500 mt-1 space-x-2">
                    <span>Available URL tokens:</span>
                    <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">{'{apiKey}'}</code>
                    <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">{'{phone}'}</code>
                    <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">{'{message}'}</code>
                    <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">{'{senderId}'}</code>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">HTTP Method</label>
                  <div className="flex gap-4 text-xs font-bold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={customMethod === 'GET'}
                        onChange={() => setCustomMethod('GET')}
                        className="text-amber-500"
                      />
                      <span>GET Request</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={customMethod === 'POST'}
                        onChange={() => setCustomMethod('POST')}
                        className="text-amber-500"
                      />
                      <span>POST Request (JSON)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES & AUTOMATION TRIGGERS */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isBn ? 'স্বয়ংক্রিয় এসএমএস ইভেন্ট ও টেমপ্লেট' : 'Automated SMS Events & Templates'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBn
                ? 'অর্ডার প্রসেসের বিভিন্ন ধাপে কাস্টমারকে এসএমএস পাঠানোর নিয়ম ও টেক্সট কাস্টমাইজ করুন।'
                : 'Configure automated SMS messages triggered at different stages of customer order lifecycle.'}
            </p>
          </div>

          {/* Placeholders helper chip bar */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
              {isBn ? 'ক্লিক করে টেমপ্লেটে ভেরিয়েবল যোগ করুন:' : 'Click a tag to insert into template:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_TAGS.map((t) => (
                <button
                  key={t.tag}
                  type="button"
                  className="bg-white hover:bg-amber-50 hover:border-amber-400 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-700 font-bold transition-all shadow-2xs"
                  onClick={() => insertTagToTemplate(t.tag, 'placed')}
                >
                  <span className="text-amber-700 font-black">{t.tag}</span>
                  <span className="text-[10px] text-slate-400 ml-1">({isBn ? t.bn : t.label})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Event 1: Order Placed (Instant Tracking ID SMS) */}
          <div className="border border-slate-200 rounded-xl p-4.5 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  {isBn ? '১. অর্ডার প্লেস হওয়ার সাথে সাথে এসএমএস' : '1. Instant Order Placement SMS (with Tracking Link)'}
                </h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={orderPlacedEnabled}
                  onChange={(e) => setOrderPlacedEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <textarea
              rows={2}
              value={orderPlacedTemplate}
              onChange={(e) => setOrderPlacedTemplate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Characters: {orderPlacedTemplate.length} (Approx {Math.ceil(orderPlacedTemplate.length / 160) || 1} SMS)</span>
              <button
                type="button"
                onClick={() =>
                  setOrderPlacedTemplate(
                    'Dear {customer_name}, your order #{order_number} of {grand_total} has been received at {site_name}! Track here: {tracking_url}'
                  )
                }
                className="text-amber-700 hover:underline font-bold"
              >
                Reset to Default
              </button>
            </div>
          </div>

          {/* Event 2: Order Confirmed */}
          <div className="border border-slate-200 rounded-xl p-4.5 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  {isBn ? '২. অর্ডার কনফার্মেশন এসএমএস' : '2. Order Confirmed SMS'}
                </h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={orderConfirmedEnabled}
                  onChange={(e) => setOrderConfirmedEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <textarea
              rows={2}
              value={orderConfirmedTemplate}
              onChange={(e) => setOrderConfirmedTemplate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Characters: {orderConfirmedTemplate.length}</span>
              <button
                type="button"
                onClick={() =>
                  setOrderConfirmedTemplate(
                    'Dear {customer_name}, your order #{order_number} has been confirmed and is being processed for delivery. {site_name}'
                  )
                }
                className="text-amber-700 hover:underline font-bold"
              >
                Reset to Default
              </button>
            </div>
          </div>

          {/* Event 3: Order Shipped (Courier Handover + Tracking ID) */}
          <div className="border border-slate-200 rounded-xl p-4.5 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  {isBn ? '৩. কুরিয়ার শিপমেন্ট ও ট্র্যাকিং আইডি এসএমএস' : '3. Courier Dispatched & Tracking ID SMS'}
                </h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={orderShippedEnabled}
                  onChange={(e) => setOrderShippedEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <textarea
              rows={2}
              value={orderShippedTemplate}
              onChange={(e) => setOrderShippedTemplate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Characters: {orderShippedTemplate.length}</span>
              <button
                type="button"
                onClick={() =>
                  setOrderShippedTemplate(
                    'Dear {customer_name}, your order #{order_number} has been shipped via {courier_name}. Tracking ID: {tracking_id}. {site_name}'
                  )
                }
                className="text-amber-700 hover:underline font-bold"
              >
                Reset to Default
              </button>
            </div>
          </div>

          {/* Event 4: Order Delivered */}
          <div className="border border-slate-200 rounded-xl p-4.5 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  {isBn ? '৪. সফল ডেলিভারি সম্পন্ন এসএমএস' : '4. Order Delivered Successfully SMS'}
                </h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={orderDeliveredEnabled}
                  onChange={(e) => setOrderDeliveredEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <textarea
              rows={2}
              value={orderDeliveredTemplate}
              onChange={(e) => setOrderDeliveredTemplate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Characters: {orderDeliveredTemplate.length}</span>
              <button
                type="button"
                onClick={() =>
                  setOrderDeliveredTemplate(
                    'Dear {customer_name}, your order #{order_number} has been delivered successfully! Thank you for shopping with {site_name}.'
                  )
                }
                className="text-amber-700 hover:underline font-bold"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE TEST CONSOLE */}
      {activeTab === 'test' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isBn ? 'লাইভ টেস্ট এসএমএস পাঠান' : 'Send Live Test SMS'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBn
                ? 'আপনার ফোন নম্বর লিখে টেস্ট এসএমএস পাঠিয়ে গেটওয়ে কানেকশন ও ব্যালেন্স চেক করুন।'
                : 'Enter your phone number to test gateway connectivity and balance in real-time.'}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 max-w-xl space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isBn ? 'প্রাপকের মোবাইল নম্বর' : 'Recipient Phone Number'}
              </label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="017XXXXXXXX or +88017XXXXXXXX"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isBn ? 'টেস্ট মেসেজ (ঐচ্ছিক)' : 'Test Message (Optional)'}
              </label>
              <textarea
                rows={3}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder={`[${settings.site_name || 'SHOPHATBD'}] Your SMS Gateway is connected successfully! Order tracking & notifications are active.`}
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleSendTestSms}
              disabled={isTesting || !testPhone.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isBn ? 'মেসেজ পাঠানো হচ্ছে...' : 'Sending Test SMS...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isBn ? 'টেস্ট এসএমএস পাঠান 🚀' : 'Send Test SMS 🚀'}</span>
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`p-4 rounded-xl border text-xs ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
                {testResult.response && (
                  <pre className="bg-white/80 p-2 rounded mt-2 text-[10px] font-mono overflow-x-auto">
                    {typeof testResult.response === 'object'
                      ? JSON.stringify(testResult.response, null, 2)
                      : String(testResult.response)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DELIVERY LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isBn ? 'এসএমএস ডেলিভারি লগ' : 'SMS Delivery Logs'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isBn ? 'সাম্প্রতিক পাঠানো সকল এসএমএস এবং গেটওয়ের রেসপন্স।' : 'Audit history of all dispatched messages and operator responses.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold">
                <button
                  onClick={() => setLogsFilter('all')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    logsFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setLogsFilter('sent')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    logsFilter === 'sent' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Sent ({stats.sent})
                </button>
                <button
                  onClick={() => setLogsFilter('failed')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    logsFilter === 'failed' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Failed ({stats.failed})
                </button>
              </div>

              <button
                onClick={fetchLogs}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Refresh logs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleClearLogs}
                className="p-2 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                title="Clear logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Event / Order</th>
                    <th className="py-2.5 px-3">Message Content</th>
                    <th className="py-2.5 px-3">Provider</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.length > 0 ? (
                    logs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {new Date(l.created_at).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {l.phone}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-slate-800 capitalize text-[11px]">
                            {l.event_type.replace('_', ' ')}
                          </span>
                          {l.order_number && (
                            <span className="block text-[10px] text-amber-700 font-mono font-bold">
                              #{l.order_number}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-slate-600" title={l.message}>
                          {l.message}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap uppercase text-[10px] font-bold text-slate-500">
                          {l.provider}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase inline-block ${
                              l.status === 'sent'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        {isLoadingLogs ? 'Loading SMS logs...' : 'No SMS logs found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Action Bar */}
      <div className="sticky bottom-4 z-20 bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {saveSuccess ? (
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isBn ? 'এসএমএস কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!' : 'SMS Configuration saved successfully!'}
              </span>
            </span>
          ) : (
            <span className="text-slate-300 text-xs font-medium">
              {isBn
                ? 'পরিবর্তন করার পর অবশ্যই নিচের বাটন চেপে সেভ করুন।'
                : 'Make sure to save your changes to apply gateway settings.'}
            </span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all shrink-0"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{isBn ? 'সেটিংস সংরক্ষণ করুন' : 'Save SMS Configuration'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
