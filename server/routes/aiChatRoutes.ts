import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { query, queryOne } from '../db/db.ts';

const router = Router();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Fallback intelligent intent matcher for offline or missing API key scenarios
function getIntelligentFallbackResponse(userMessage: string, isBengali: boolean, storeName: string, contactPhone: string, contactEmail: string): string {
  const msg = userMessage.toLowerCase().trim();
  const phone = contactPhone || '+880 1700-123456';
  const email = contactEmail || 'support@shophatbd.com';
  const name = storeName || 'SHOPHATBD';

  // 1. Delivery & Shipping
  if (msg.includes('ডেলিভারি') || msg.includes('চার্জ') || msg.includes('কত দিন') || msg.includes('সময়') || msg.includes('delivery') || msg.includes('shipping') || msg.includes('cost')) {
    if (isBengali) {
      return `📦 **ডেলিভারি সংক্রান্ত তথ্য:**\n\n• **ঢাকা সিটির ভেতরে:** ডেলিভারি চার্জ ৬০ টাকা (১-২ কার্যদিবসের মধ্যে হোম ডেলিভারি)।\n• **ঢাকার বাইরে (সমগ্র বাংলাদেশ):** ডেলিভারি চার্জ ১২০ টাকা (২-৪ কার্যদিবসের মধ্যে জেলা/উপজেলায় ডেলিভারি)।\n• **ক্যাশ অন ডেলিভারি (COD):** সমগ্র বাংলাদেশের ৬৪ জেলাতেই পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা রয়েছে!`;
    }
    return `📦 **Delivery Information:**\n\n• **Inside Dhaka:** Delivery charge ৳60 (1-2 business days express delivery).\n• **Outside Dhaka (All Bangladesh):** Delivery charge ৳120 (2-4 business days).\n• **Cash on Delivery (COD):** Available across all 64 districts in Bangladesh!`;
  }

  // 2. Order Tracking
  if (msg.includes('ট্র্যাক') || msg.includes('ট্র্যাকিং') || msg.includes('অর্ডার কোথায়') || msg.includes('অবস্থা') || msg.includes('track') || msg.includes('tracking') || msg.includes('status') || msg.includes('where is my order')) {
    if (isBengali) {
      return `🔍 **অর্ডার ট্র্যাক করার নিয়ম:**\n\n১. ওয়েবসাইটের উপরে বা ফুটারে থাকা **"Track Order / অর্ডার ট্র্যাকিং"** অপশনে যান।\n২. আপনার **অর্ডার নম্বর** (অথবা অর্ডারে ব্যবহৃত মোবাইল নম্বর) দিন।\n৩. সাথে সাথে আপনার পার্সেলের লাইভ অবস্থান ও কুরিয়ার আপডেট দেখতে পাবেন।\n\nপ্রয়োজনে আমাদের হেল্পলাইনে কল করতে পারেন: ${phone}।`;
    }
    return `🔍 **How to Track Your Order:**\n\n1. Visit the **"Track Order"** page on the top header or footer.\n2. Enter your **Order Number** or **Customer Phone Number**.\n3. Instantly view real-time courier dispatch and shipment status.`;
  }

  // 3. Return & Exchange Policy
  if (msg.includes('রিটার্ন') || msg.includes('ফেরত') || msg.includes('এক্সচেঞ্জ') || msg.includes('পরিবর্তন') || msg.includes('সাইজ না মিললে') || msg.includes('return') || msg.includes('exchange') || msg.includes('refund')) {
    if (isBengali) {
      return `🔄 **সহজ এক্সচেঞ্জ ও রিটার্ন পলিসি:**\n\n• পণ্য হাতে পাওয়ার পর **৭ দিনের মধ্যে** সাইজ বা কালার সংক্রান্ত সমস্যা থাকলে ঝামেলামুক্তভাবে এক্সচেঞ্জ করতে পারবেন।\n• কোনো ডিফেক্ট বা ত্রুটি থাকলে সাথে সাথে আমাদের হটলাইন বা WhatsApp-এ ছবি/ভিডিও পাঠিয়ে জানালে সম্পূর্ণ ফ্রি-তে রিপ্লেসমেন্ট প্রদান করা হবে।`;
    }
    return `🔄 **Return & Exchange Policy:**\n\n• We offer a straightforward **7-day exchange window** for sizing or variant replacements.\n• In case of any manufacturing defect, reach out to our customer care for an immediate free replacement!`;
  }

  // 4. Coupons & Discounts
  if (msg.includes('কুপন') || msg.includes('অফার') || msg.includes('ডিসকাউন্ট') || msg.includes('coupon') || msg.includes('discount') || msg.includes('promo') || msg.includes('voucher')) {
    if (isBengali) {
      return `🎁 **চলতি স্পেশাল অফার ও কুপন:**\n\n• **NOVA20** - ২০০০ টাকার বেশি অর্ডারে সরাসরি ২০% মেগা ছাড়!\n• **EID500** - ৩০০০ টাকার অর্ডারে সরাসরি ৫০০ টাকা ফ্ল্যাট ডিসকাউন্ট!\n• **WELCOME10** - প্রথম অর্ডারে ১০% ওয়েলকাম ডিসকাউন্ট!\n\nচেকআউট পেজে কুপন কোডটি দিয়ে "Apply" বাটনে ক্লিক করুন।`;
    }
    return `🎁 **Active Promo Codes:**\n\n• **NOVA20** - 20% OFF on orders over ৳2,000!\n• **EID500** - Flat ৳500 OFF on orders over ৳3,000!\n• **WELCOME10** - 10% OFF on your first purchase!\n\nApply the code in the Checkout page to redeem!`;
  }

  // 5. Payment Methods
  if (msg.includes('পেমেন্ট') || msg.includes('টাকা') || msg.includes('বিকাশ') || msg.includes('নগদ') || msg.includes('payment') || msg.includes('bkash') || msg.includes('cod')) {
    if (isBengali) {
      return `💳 **পেমেন্ট পদ্ধতি:**\n\n১. **ক্যাশ অন ডেলিভারি (Cash on Delivery):** পণ্য হাতে পেয়ে ডেলিভারিম্যানকে টাকা দিন।\n২. **বিকাশ / নগদ / রকেট:** চেকআউটে সরাসরি অথবা ম্যানুয়াল ট্রান্সফারে পেমেন্ট করার সুবিধা রয়েছে।`;
    }
    return `💳 **Payment Methods:**\n\n1. **Cash on Delivery (COD):** Pay securely when receiving the parcel.\n2. **bKash / Nagad / Rocket:** Instant mobile banking payment available at checkout.`;
  }

  // 6. Contact & Helpline
  if (msg.includes('যোগাযোগ') || msg.includes('হেল্পলাইন') || msg.includes('ফোন') || msg.includes('কাস্টমার কেয়ার') || msg.includes('contact') || msg.includes('phone') || msg.includes('number') || msg.includes('help')) {
    if (isBengali) {
      return `📞 **আমাদের হেল্পলাইন ও কাস্টমার কেয়ার:**\n\n• **হটলাইন কল:** ${phone}\n• **ইমেইল:** ${email}\n• **অফিস সময়:** প্রতিদিন সকাল ৯টা থেকে রাত ১০টা পর্যন্ত।\n• সাইটের নিচে থাকা WhatsApp আইকনে ক্লিক করেও সরাসরি চ্যাট করতে পারেন!`;
    }
    return `📞 **Customer Care & Helpline:**\n\n• **Hotline:** ${phone}\n• **Email:** ${email}\n• **Hours:** 9:00 AM - 10:00 PM Daily.\n• You can also click the WhatsApp widget below to chat directly with our team!`;
  }

  // 7. Generic Greeting
  if (msg.includes('হাই') || msg.includes('হ্যালো') || msg.includes('সালাম') || msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('assalamu')) {
    if (isBengali) {
      return `👋 আসসালামু আলাইকুম! **${name}** কাস্টমার কেয়ারে আপনাকে স্বাগতম।\n\nআমি আপনাকে কীভাবে সাহায্য করতে পারি? ডেলিভারি চার্জ, অর্ডার ট্র্যাকিং, প্রোডাক্ট স্টক, ডিসকাউন্ট অফার বা রিটার্ন পলিসি সংক্রান্ত যেকোনো প্রশ্ন করতে পারেন।`;
    }
    return `👋 Hello! Welcome to **${name}** Customer Support.\n\nHow can I help you today? Feel free to ask about our products, delivery charges, active coupons, order tracking, or return policies!`;
  }

  // Default helpful message
  if (isBengali) {
    return `ধন্যবাদ আপনার প্রশ্নের জন্য। আপনি আমাদের ডেলিভারি চার্জ, অর্ডার ট্র্যাকিং, ডিসকাউন্ট কুপন, সাইজ ও স্টক বা রিটার্ন পলিসি সম্পর্কে জানতে চাইতে পারেন। অথবা সরাসরি আমাদের কাস্টমার কেয়ারে কল করতে পারেন: ${phone}।`;
  }
  return `Thank you for reaching out! You can ask about delivery timeframes, tracking orders, promo discounts, sizing, or return policies. You can also reach our customer helpline at ${phone}.`;
}

// POST /api/chat/message
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({ success: false, message: 'Message is required.' });
      return;
    }

    const trimmedMsg = message.trim();
    const isBengali = /[\u0980-\u09FF]/.test(trimmedMsg) || !/[a-zA-Z]/.test(trimmedMsg);

    // Fetch live store context
    const settingsRows = query<{ key: string; value: string }>('SELECT key, value FROM site_settings');
    const settingsMap: Record<string, string> = {};
    for (const row of settingsRows) {
      settingsMap[row.key] = row.value;
    }

    const categories = query<any>('SELECT name_en, name_bn, slug FROM categories WHERE is_active = 1 LIMIT 10');
    const popularProducts = query<any>('SELECT name_en, name_bn, sale_price, regular_price, stock_quantity FROM products WHERE is_published = 1 ORDER BY total_delivered DESC LIMIT 8');
    const coupons = query<any>('SELECT code, discount_value, discount_type, min_order_amount FROM coupons WHERE is_active = 1 LIMIT 5');

    const storeContext = `
Store Name: ${settingsMap.site_name || 'SHOPHATBD'}
Contact Phone / Hotline: ${settingsMap.contact_phone || '+880 1700-123456'}
Contact Email: ${settingsMap.contact_email || 'support@shophatbd.com'}
Delivery:
- Inside Dhaka: 60 BDT, 24-48 hours delivery.
- Outside Dhaka: 120 BDT, 2-4 working days delivery across all 64 districts in Bangladesh.
- Cash on Delivery (COD) is 100% available nationwide.
- Return/Exchange: 7-day hassle-free replacement for sizing or defects.
Available Coupons: ${coupons.map((c: any) => `${c.code} (${c.discount_type === 'percentage' ? c.discount_value + '%' : c.discount_value + ' TK'} off on min order ৳${c.min_order_amount})`).join(', ')}
Main Categories: ${categories.map((c: any) => `${c.name_en} (${c.name_bn || ''})`).join(', ')}
Sample Featured Products: ${popularProducts.map((p: any) => `${p.name_en} - ৳${p.sale_price || p.regular_price} (Stock: ${p.stock_quantity > 0 ? 'Available' : 'Out of stock'})`).join(', ')}
`;

    const ai = getAI();

    if (ai) {
      try {
        const systemPrompt = `You are a polite, helpful, and highly intelligent e-commerce customer care assistant for "${settingsMap.site_name || 'SHOPHATBD'}" (an e-commerce store in Bangladesh).
Language instruction:
- If the user writes in Bengali (বাংলা) or Banglish, reply in warm, polite, natural Bengali.
- If the user writes in English, reply in English.
- Use clear bullet points and bold headers where appropriate.
- Keep replies concise, helpful, and friendly (maximum 2-3 short paragraphs or bullet list).
- Guide customers on how to place orders, delivery fees, tracking parcels, sizing, and applying discount coupons.
- Live Store Context:
${storeContext}
`;

        const contents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          for (const item of history.slice(-6)) {
            contents.push({
              role: item.sender === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }]
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: trimmedMsg }]
        });

        // Fast generation with timeout race so customer never experiences lag
        const generatePromise = ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.5,
            maxOutputTokens: 400,
          }
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timeout')), 3000)
        );

        const response: any = await Promise.race([generatePromise, timeoutPromise]);
        const aiText = response?.text;
        if (aiText && aiText.trim()) {
          res.json({
            success: true,
            reply: aiText.trim(),
            source: 'gemini'
          });
          return;
        }
      } catch (geminiError: any) {
        console.warn('Gemini fast fallback triggered:', geminiError?.message);
      }
    }

    // Fallback response if Gemini isn't configured or failed
    const fallbackText = getIntelligentFallbackResponse(
      trimmedMsg,
      isBengali,
      settingsMap.site_name || 'SHOPHATBD',
      settingsMap.contact_phone || '+880 1700-123456',
      settingsMap.contact_email || 'support@shophatbd.com'
    );
    res.json({
      success: true,
      reply: fallbackText,
      source: 'smart_engine'
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message.',
      reply: 'আমাদের কাস্টমার কেয়ারে সংযোগ করতে কিছুটা সমস্যা হচ্ছে। অনুগ্রহ করে আমাদের হটলাইনে যোগাযোগ করুন।'
    });
  }
});

export default router;
