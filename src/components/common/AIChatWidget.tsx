import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Sparkles, MessageCircle, RotateCcw, ChevronDown, CheckCheck, Truck, ShieldAlert, Tag, PhoneCall, PackageSearch } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

interface AIChatWidgetProps {
  onNavigate?: (page: string, param?: string) => void;
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({ onNavigate }) => {
  const { isBn } = useLanguage();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initialGreeting: ChatMessage = {
    id: 'msg_welcome',
    sender: 'bot',
    text: isBn
      ? `👋 আসসালামু আলাইকুম! **${settings.site_name_bn || settings.site_name || 'শপহাটবিডি'}** স্মার্ট কাস্টমার কেয়ারে স্বাগতম।\n\nআমি কীভাবে আপনাকে সাহায্য করতে পারি? ডেলিভারি চার্জ, অর্ডার ট্র্যাকিং, ডিসকাউন্ট কুপন বা রিটার্ন পলিসি সংক্রান্ত যেকোনো প্রশ্ন করতে পারেন।`
      : `👋 Hello! Welcome to **${settings.site_name || 'SHOPHATBD'}** AI Customer Care.\n\nHow can I help you today? You can ask about delivery charges, tracking your order, promo coupons, or return policies!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setHasUnread(false);
    }
  }, [isOpen]);

  const quickQuestions = isBn
    ? [
        { label: 'ডেলিভারি চার্জ ও সময়?', icon: Truck, query: 'ডেলিভারি চার্জ ও পেতে কতদিন সময় লাগবে?' },
        { label: 'অর্ডার ট্র্যাক করব কীভাবে?', icon: PackageSearch, query: 'আমি আমার অর্ডার কীভাবে ট্র্যাক করব?' },
        { label: 'রিটার্ন বা পরিবর্তন পলিসি?', icon: ShieldAlert, query: 'সাইজ না মিললে এক্সচেঞ্জ বা রিটার্ন করার নিয়ম কী?' },
        { label: 'ডিসকাউন্ট কুপন আছে?', icon: Tag, query: 'কোনো অফার বা ডিসকাউন্ট কুপন কোড আছে কি?' },
        { label: 'হেল্পলাইনে কথা বলব', icon: PhoneCall, query: 'কাস্টমার কেয়ার ফোন নম্বর ও যোগাযোগের ঠিকানা দিন।' }
      ]
    : [
        { label: 'Delivery fees & time?', icon: Truck, query: 'What are the delivery charges and timeframe?' },
        { label: 'How to track order?', icon: PackageSearch, query: 'How can I track my order status?' },
        { label: 'Return & exchange policy?', icon: ShieldAlert, query: 'What is the return and exchange policy?' },
        { label: 'Discount coupons?', icon: Tag, query: 'Are there any active discount coupons or promo codes?' },
        { label: 'Helpline contact?', icon: PhoneCall, query: 'What is your customer support helpline phone number?' }
      ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-5).map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await api.sendChatMessage(textToSend, historyPayload);
      const botReply = res?.reply || (isBn ? 'ধন্যবাদ। আমাদের কাস্টমার হেল্পলাইনে যোগাযোগ করতে পারেন।' : 'Thank you. Please contact our helpline for further assistance.');

      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'bot',
        text: isBn
          ? 'দুঃখিত, সংযোগে সাময়িক সমস্যা হচ্ছে। সরাসরি আমাদের হেল্পলাইনে কল করতে পারেন: ' + (settings.contact_phone || '+880 1700-123456')
          : 'Sorry, connection issue. You can call our direct helpline: ' + (settings.contact_phone || '+880 1700-123456'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg_reset_${Date.now()}`,
        sender: 'bot',
        text: isBn
          ? `নতুন সেশন শুরু হয়েছে। আমি আপনাকে কীভাবে সাহায্য করতে পারি?`
          : `New conversation started. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const renderFormattedText = (text: string) => {
    // Simple markdown-like line renderer for bold, lists, and links
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-[13px] leading-relaxed break-words">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;
          
          // Replace bold markdown **text**
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <div key={idx} className={line.startsWith('•') || line.startsWith('-') || /^\d+\./.test(line) ? 'pl-2' : ''}>
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={pIdx} className="font-bold text-slate-900">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const isWhatsAppEnabled = settings.whatsapp_chat_enabled === undefined || settings.whatsapp_chat_enabled === '' || settings.whatsapp_chat_enabled === '1' || settings.whatsapp_chat_enabled === true || settings.whatsapp_chat_enabled === 'true';
  const isMessengerEnabled = settings.messenger_chat_enabled === undefined || settings.messenger_chat_enabled === '' || settings.messenger_chat_enabled === '1' || settings.messenger_chat_enabled === true || settings.messenger_chat_enabled === 'true';
  const isAIEnabled = settings.ai_chat_enabled === undefined || settings.ai_chat_enabled === '' || settings.ai_chat_enabled === '1' || settings.ai_chat_enabled === true || settings.ai_chat_enabled === 'true';

  const getWhatsAppUrl = () => {
    let rawNumber = (settings.whatsapp_chat_number || settings.contact_whatsapp || settings.contact_phone || '').replace(/[^0-9]/g, '');
    if (rawNumber.length === 11 && rawNumber.startsWith('01')) {
      rawNumber = '88' + rawNumber;
    }
    if (!rawNumber) rawNumber = '8801700000000';
    const greetingMsg = settings.whatsapp_chat_greeting || (isBn ? 'আসসালামু আলাইকুম, আমি আপনাদের পণ্য সম্পর্কে জানতে চাই।' : 'Hello SHOPHATBD, I want to know more about your products.');
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(greetingMsg)}`;
  };

  const getMessengerUrl = () => {
    const raw = (settings.messenger_page_username || settings.facebook_url || '').trim();
    if (!raw) return 'https://m.me/shophatbd';
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      if (raw.includes('m.me/')) return raw;
      if (raw.includes('facebook.com/messages/t/')) return raw;
      const match = raw.match(/facebook\.com\/([^/?#]+)/);
      if (match && match[1] && !['pages', 'profile.php', 'groups', 'share'].includes(match[1])) {
        return `https://m.me/${match[1]}`;
      }
      return raw;
    }
    const clean = raw.replace(/^@/, '').replace(/^\//, '');
    return `https://m.me/${clean}`;
  };

  // Helper to compute contrast text/icon color for custom AI button color
  const getContrastColor = (hexColor?: string) => {
    if (!hexColor) return '#0F172A';
    const hex = hexColor.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 135 ? '#0F172A' : '#FFFFFF';
    }
    return '#0F172A';
  };

  const aiBtnBg = settings.ai_chat_btn_color || '#F59E0B';
  const aiTextColor = getContrastColor(aiBtnBg);

  return (
    <>
      {/* Floating Vertical Chat Buttons Stack - Perfectly centered in the right visual pocket between Subscribe button and Footer bar */}
      {!isOpen && (
        <div className="fixed bottom-20 sm:bottom-20 md:bottom-14 right-3 sm:right-5 z-40 flex flex-col items-center gap-1.5 sm:gap-2 pointer-events-auto select-none">
          {/* 1. TOP: WhatsApp Chat Button (Circular, Authentic WhatsApp Green) */}
          {isWhatsAppEnabled && (
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              id="floating-whatsapp-btn"
              aria-label="Chat on WhatsApp"
              className="group relative w-9.5 h-9.5 sm:w-10 sm:h-10 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/90 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current text-white" viewBox="0 0 24 24">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 14.41C16.31 14.29 15.1 13.69 14.88 13.61C14.65 13.53 14.49 13.49 14.32 13.73C14.16 13.98 13.69 14.53 13.54 14.69C13.4 14.86 13.25 14.88 13 14.76C12.75 14.63 11.95 14.37 11 13.53C10.26 12.87 9.76 12.06 9.61 11.82C9.47 11.57 9.6 11.44 9.72 11.31C9.83 11.2 9.97 11.02 10.1 10.88C10.22 10.73 10.26 10.63 10.34 10.46C10.42 10.3 10.38 10.15 10.32 10.03C10.26 9.91 9.78 8.72 9.57 8.23C9.38 7.75 9.18 7.82 9.03 7.81C8.89 7.8 8.73 7.8 8.56 7.8C8.4 7.8 8.13 7.86 7.91 8.11C7.68 8.35 7.04 8.95 7.04 10.18C7.04 11.4 7.93 12.58 8.05 12.75C8.18 12.91 9.8 15.41 12.28 16.48C12.87 16.74 13.33 16.89 13.69 17.01C14.28 17.19 14.82 17.17 15.25 17.1C15.73 17.03 16.72 16.5 16.93 15.93C17.13 15.35 17.13 14.86 17.07 14.76C17.01 14.65 16.82 14.54 16.56 14.41Z" />
              </svg>
              {/* Tooltip on hover */}
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-900/95 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                {isBn ? 'হোয়াটসঅ্যাপে মেসেজ দিন' : 'Chat on WhatsApp'}
              </span>
            </a>
          )}

          {/* 2. MIDDLE: Messenger Chat Button (Circular, Authentic Messenger Brand Gradient) */}
          {isMessengerEnabled && (
            <a
              href={getMessengerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              id="floating-messenger-btn"
              aria-label="Chat on Facebook Messenger"
              className="group relative w-9.5 h-9.5 sm:w-10 sm:h-10 bg-gradient-to-tr from-[#0084FF] via-[#00B2FF] to-[#006AFF] hover:opacity-95 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/90 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current text-white" viewBox="0 0 24 24">
                <path d="M12 2C6.36 2 2 6.13 2 11.7C2 14.61 3.39 17.18 5.71 18.84V22L8.98 20.21C9.93 20.47 10.94 20.61 12 20.61C17.64 20.61 22 16.48 22 10.91C22 5.34 17.64 2 12 2ZM13.06 14.19L10.53 11.48L5.6 14.19L10.94 8.52L13.47 11.23L18.4 8.52L13.06 14.19Z" />
              </svg>
              {/* Tooltip on hover */}
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-900/95 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                {isBn ? 'মেসেঞ্জারে চ্যাট করুন' : 'Chat on Messenger'}
              </span>
            </a>
          )}

          {/* 3. BOTTOM: AI Chat Button (Circular, Fully Customizable Color in Settings) */}
          {isAIEnabled && (
            <button
              onClick={() => setIsOpen(true)}
              id="ai-chat-trigger"
              style={{ backgroundColor: aiBtnBg, color: aiTextColor }}
              aria-label="Open AI Customer Support Chat"
              className="group relative w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/90 cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 sm:w-5 sm:h-5" style={{ color: aiTextColor }} />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full animate-pulse" />
              </div>

              {/* Tooltip on hover */}
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-900/95 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBn ? 'স্মার্ট এআই চ্যাট সাপোর্ট' : 'AI Support 24/7'}</span>
                </span>
              </span>
            </button>
          )}
        </div>
      )}

      {/* Floating Chat Window Modal */}
      {isOpen && (
        <div
          id="ai-chat-window"
          className="fixed bottom-14 md:bottom-12 right-2 sm:right-5 z-50 w-[360px] sm:w-[380px] max-w-[94vw] h-[660px] sm:h-[720px] max-h-[calc(100vh-70px)] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 font-sans"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 px-4 py-3.5 text-white flex items-center justify-between shadow-md relative shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-inner">
                <Bot className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight text-white">
                    {(isBn ? settings.site_name_bn : settings.site_name) || (isBn ? 'শপহাটবিডি' : 'SHOPHATBD')} AI
                  </h3>
                  <span className="bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> 24/7
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  {isBn ? 'স্মার্ট কাস্টমার অ্যাসিস্ট্যান্ট' : 'Smart Automated Assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title={isBn ? 'নতুন চ্যাট শুরু করুন' : 'Reset Chat'}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title={isBn ? 'বন্ধ করুন' : 'Close'}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body - Maximum Vertical Space */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F8FAFC]/95 text-slate-800 text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mb-1 border border-amber-200 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                      isUser
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-[13px] leading-relaxed">{msg.text}</p>
                    ) : (
                      renderFormattedText(msg.text)
                    )}
                    <div
                      className={`text-[10px] mt-1.5 flex items-center gap-1 justify-end ${
                        isUser ? 'text-slate-900/70 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isUser && <CheckCheck className="w-3.5 h-3.5 text-slate-900" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mb-1 border border-amber-200">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                    <span className="text-[11px] text-slate-500 font-medium ml-1">
                      {isBn ? 'উত্তর তৈরি হচ্ছে...' : 'Typing answer...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions / FAQs - Restored to clear, full multi-card layout */}
          <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-200/80 shrink-0">
            <div className="text-[10.5px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isBn ? 'সচরাচর জিজ্ঞাসা (ক্লিক করে জানুন):' : 'Frequently Asked Questions:'}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
              {quickQuestions.map((q, idx) => {
                const Icon = q.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q.query)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 p-2 bg-white hover:bg-amber-50 hover:border-amber-400 border border-slate-200 text-slate-700 hover:text-amber-950 text-[11px] font-medium rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95 text-left"
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="line-clamp-2 leading-tight">{q.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isBn
                  ? 'আপনার প্রশ্ন এখানে লিখুন (যেমন: ডেলিভারি কত দিন?)...'
                  : 'Type your question here (e.g. delivery time?)...'
              }
              disabled={isLoading}
              className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Send message"
              className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 p-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
