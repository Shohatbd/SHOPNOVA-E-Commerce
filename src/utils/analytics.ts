import { Product, ProductVariant, CartItem, Order, SiteSettings } from '../types/index.ts';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _shophatbd_settings?: Partial<SiteSettings>;
    _shopnova_settings?: Partial<SiteSettings>;
  }
}

// --------------------------------------------------------------------------
// 1. Marketing Attribution & Click Identifiers
// --------------------------------------------------------------------------

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  fbp?: string;
  fbc?: string;
  referrer?: string;
  landing_page?: string;
}

export function initAttribution(): AttributionData {
  if (typeof window === 'undefined') return {};

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');
  const utmTerm = urlParams.get('utm_term');
  const utmContent = urlParams.get('utm_content');
  const gclid = urlParams.get('gclid');
  const fbclid = urlParams.get('fbclid');
  const ttclid = urlParams.get('ttclid');

  // Generate or retrieve _fbp
  let fbp = getCookie('_fbp');
  if (!fbp) {
    fbp = `fb.1.${Date.now()}.${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setCookie('_fbp', fbp, 90);
  }

  // Generate or retrieve _fbc
  let fbc = getCookie('_fbc');
  if (fbclid) {
    fbc = `fb.1.${Date.now()}.${fbclid}`;
    setCookie('_fbc', fbc, 90);
  }

  let savedAttr: AttributionData = {};
  try {
    const raw = sessionStorage.getItem('shophatbd_attribution') || localStorage.getItem('shophatbd_attribution') || sessionStorage.getItem('shopnova_attribution') || localStorage.getItem('shopnova_attribution');
    if (raw) savedAttr = JSON.parse(raw);
  } catch {}

  const currentAttr: AttributionData = {
    utm_source: utmSource || savedAttr.utm_source || undefined,
    utm_medium: utmMedium || savedAttr.utm_medium || undefined,
    utm_campaign: utmCampaign || savedAttr.utm_campaign || undefined,
    utm_term: utmTerm || savedAttr.utm_term || undefined,
    utm_content: utmContent || savedAttr.utm_content || undefined,
    gclid: gclid || savedAttr.gclid || undefined,
    fbclid: fbclid || savedAttr.fbclid || undefined,
    ttclid: ttclid || savedAttr.ttclid || undefined,
    fbp: fbp || savedAttr.fbp || undefined,
    fbc: fbc || savedAttr.fbc || undefined,
    referrer: document.referrer || savedAttr.referrer || undefined,
    landing_page: window.location.href
  };

  try {
    sessionStorage.setItem('shophatbd_attribution', JSON.stringify(currentAttr));
    localStorage.setItem('shophatbd_attribution', JSON.stringify(currentAttr));
  } catch {}

  return currentAttr;
}

export function getAttribution(): AttributionData {
  try {
    const raw = sessionStorage.getItem('shophatbd_attribution') || localStorage.getItem('shophatbd_attribution') || sessionStorage.getItem('shopnova_attribution') || localStorage.getItem('shopnova_attribution');
    if (raw) return JSON.parse(raw);
  } catch {}
  return initAttribution();
}

function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};path=/;expires=${date.toUTCString()};SameSite=Lax`;
}

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : undefined;
}

// --------------------------------------------------------------------------
// 2. Client-side SHA-256 Hashing for Google Enhanced Conversions & Meta
// --------------------------------------------------------------------------

export async function sha256(value?: string | null): Promise<string | undefined> {
  if (!value) return undefined;
  const clean = value.trim().toLowerCase();
  if (!clean) return undefined;

  try {
    if (window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(clean);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('Crypto subtle hashing unavailable:', e);
  }
  return undefined;
}

// --------------------------------------------------------------------------
// 3. Unique Event ID Generator for Deduplication
// --------------------------------------------------------------------------

export function generateEventId(prefix = 'evt'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// --------------------------------------------------------------------------
// 4. Server-Side Meta CAPI Dispatcher
// --------------------------------------------------------------------------

async function dispatchMetaCapi(payload: any) {
  try {
    await fetch('/api/analytics/meta-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // Non-blocking background log
    console.warn('Background Meta CAPI dispatch note:', err);
  }
}

// --------------------------------------------------------------------------
// 5. Unified Tracker Engine
// --------------------------------------------------------------------------

const getActiveSettings = (settings?: Partial<SiteSettings>): Partial<SiteSettings> => {
  return settings || window._shophatbd_settings || window._shopnova_settings || {};
};

export const tracker = {
  /**
   * Track Page View
   */
  trackPageView(pageUrl = window.location.pathname, pageTitle = document.title, settings?: Partial<SiteSettings>) {
    const s = getActiveSettings(settings);
    const eventId = generateEventId('pv');
    const attr = getAttribution();

    // 1. Google Tag Manager (DataLayer)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_location: window.location.href,
      page_path: pageUrl,
      page_title: pageTitle,
      event_id: eventId,
      ...attr
    });

    // 2. Google Analytics 4 (GA4)
    if (s.google_analytics_id && window.gtag) {
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_path: pageUrl,
        page_title: pageTitle,
        send_to: s.google_analytics_id
      });
    }

    // 3. Meta Pixel
    if (s.meta_pixel_id && window.fbq) {
      window.fbq('track', 'PageView', {}, { eventID: eventId });
    }

    // 4. Meta Conversions API (CAPI)
    dispatchMetaCapi({
      event_name: 'PageView',
      event_id: eventId,
      event_source_url: window.location.href,
      user_data: {
        fbp: attr.fbp,
        fbc: attr.fbc
      }
    });
  },

  /**
   * Track View Item (Product Details View)
   */
  trackViewItem(product: Product, settings?: Partial<SiteSettings>) {
    if (!product) return;
    const s = getActiveSettings(settings);
    const eventId = generateEventId(`vi_${product.id}`);
    const price = product.sale_price ?? product.regular_price;
    const currency = s.currency || 'BDT';
    const attr = getAttribution();

    // 1. GTM DataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'view_item',
      event_id: eventId,
      ecommerce: {
        currency,
        value: price,
        items: [
          {
            item_id: product.sku || product.id,
            item_name: product.name_en,
            price,
            item_category: product.category_id,
            item_brand: product.brand || s.site_name || 'SHOPHATBD',
            quantity: 1
          }
        ]
      }
    });

    // 2. GA4
    if (s.google_analytics_id && window.gtag) {
      window.gtag('event', 'view_item', {
        currency,
        value: price,
        items: [
          {
            item_id: product.sku || product.id,
            item_name: product.name_en,
            price,
            item_category: product.category_id,
            quantity: 1
          }
        ]
      });
    }

    // 3. Meta Pixel
    if (s.meta_pixel_id && window.fbq) {
      window.fbq(
        'track',
        'ViewContent',
        {
          content_name: product.name_en,
          content_ids: [product.sku || product.id],
          content_type: 'product',
          value: price,
          currency
        },
        { eventID: eventId }
      );
    }

    // 4. Meta Conversions API (CAPI)
    dispatchMetaCapi({
      event_name: 'ViewContent',
      event_id: eventId,
      event_source_url: window.location.href,
      user_data: { fbp: attr.fbp, fbc: attr.fbc },
      custom_data: {
        content_name: product.name_en,
        content_ids: [product.sku || product.id],
        value: price,
        currency
      }
    });
  },

  /**
   * Track Search
   */
  trackSearch(searchTerm: string, settings?: Partial<SiteSettings>) {
    if (!searchTerm?.trim()) return;
    const s = getActiveSettings(settings);
    const eventId = generateEventId('search');
    const cleanQuery = searchTerm.trim();

    // 1. GTM DataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'search',
      event_id: eventId,
      search_term: cleanQuery
    });

    // 2. GA4
    if (s.google_analytics_id && window.gtag) {
      window.gtag('event', 'search', {
        search_term: cleanQuery
      });
    }

    // 3. Meta Pixel
    if (s.meta_pixel_id && window.fbq) {
      window.fbq(
        'track',
        'Search',
        {
          search_string: cleanQuery
        },
        { eventID: eventId }
      );
    }

    // 4. Meta CAPI
    dispatchMetaCapi({
      event_name: 'Search',
      event_id: eventId,
      custom_data: { search_string: cleanQuery }
    });
  },

  /**
   * Track Add To Cart
   */
  trackAddToCart(product: Product, quantity = 1, variant?: ProductVariant, settings?: Partial<SiteSettings>) {
    if (!product) return;
    const s = getActiveSettings(settings);
    const eventId = generateEventId(`atc_${product.id}`);
    const unitPrice = (product.sale_price ?? product.regular_price) + (variant?.price_adjustment ?? 0);
    const totalPrice = unitPrice * quantity;
    const currency = s.currency || 'BDT';
    const attr = getAttribution();

    // 1. GTM DataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'add_to_cart',
      event_id: eventId,
      ecommerce: {
        currency,
        value: totalPrice,
        items: [
          {
            item_id: variant?.sku || product.sku || product.id,
            item_name: product.name_en,
            item_variant: variant?.size || variant?.color || undefined,
            price: unitPrice,
            quantity
          }
        ]
      }
    });

    // 2. GA4
    if (s.google_analytics_id && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency,
        value: totalPrice,
        items: [
          {
            item_id: variant?.sku || product.sku || product.id,
            item_name: product.name_en,
            price: unitPrice,
            quantity
          }
        ]
      });
    }

    // 3. Google Ads Conversion
    if (s.google_ads_conversion_id && s.google_ads_add_to_cart_label && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `${s.google_ads_conversion_id}/${s.google_ads_add_to_cart_label}`,
        value: totalPrice,
        currency
      });
    }

    // 4. Meta Pixel
    if (s.meta_pixel_id && window.fbq) {
      window.fbq(
        'track',
        'AddToCart',
        {
          content_name: product.name_en,
          content_ids: [variant?.sku || product.sku || product.id],
          content_type: 'product',
          value: totalPrice,
          currency
        },
        { eventID: eventId }
      );
    }

    // 5. Meta Conversions API (CAPI)
    dispatchMetaCapi({
      event_name: 'AddToCart',
      event_id: eventId,
      user_data: { fbp: attr.fbp, fbc: attr.fbc },
      custom_data: {
        content_name: product.name_en,
        content_ids: [variant?.sku || product.sku || product.id],
        value: totalPrice,
        currency,
        num_items: quantity
      }
    });
  },

  /**
   * Track Remove From Cart
   */
  trackRemoveFromCart(product: Product, quantity = 1, variant?: ProductVariant, settings?: Partial<SiteSettings>) {
    if (!product) return;
    const s = getActiveSettings(settings);
    const unitPrice = (product.sale_price ?? product.regular_price) + (variant?.price_adjustment ?? 0);
    const totalPrice = unitPrice * quantity;
    const currency = s.currency || 'BDT';

    // GTM DataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'remove_from_cart',
      ecommerce: {
        currency,
        value: totalPrice,
        items: [
          {
            item_id: variant?.sku || product.sku || product.id,
            item_name: product.name_en,
            price: unitPrice,
            quantity
          }
        ]
      }
    });

    // GA4
    if (s.google_analytics_id && window.gtag) {
      window.gtag('event', 'remove_from_cart', {
        currency,
        value: totalPrice,
        items: [
          {
            item_id: variant?.sku || product.sku || product.id,
            item_name: product.name_en,
            price: unitPrice,
            quantity
          }
        ]
      });
    }
  },

  /**
   * Track View Cart
   */
  trackViewCart(items: CartItem[], subtotal: number, settings?: Partial<SiteSettings>) {
    const s = getActiveSettings(settings);
    const currency = s.currency || 'BDT';

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'view_cart',
      ecommerce: {
        currency,
        value: subtotal,
        items: items.map((it) => ({
          item_id: it.variant?.sku || it.product.sku || it.product.id,
          item_name: it.product.name_en,
          price: it.unit_price,
          quantity: it.quantity
        }))
      }
    });

    if (s.google_analytics_id && window.gtag) {
      window.gtag('event', 'view_cart', {
        currency,
        value: subtotal,
        items: items.map((it) => ({
          item_id: it.variant?.sku || it.product.sku || it.product.id,
          item_name: it.product.name_en,
          price: it.unit_price,
          quantity: it.quantity
        }))
      });
    }
  },

  /**
   * Track Begin Checkout / Initiate Checkout
   */
  trackBeginCheckout(items: CartItem[], grandTotal: number, coupon?: string, settings?: Partial<SiteSettings>) {
    const s = getActiveSettings(settings);
    const eventId = generateEventId('ic');
    const currency = s.currency || 'BDT';
    const attr = getAttribution();

    // 1. GTM DataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'begin_checkout',
      event_id: eventId,
      ecommerce: {
        currency,
        value: grandTotal,
        coupon: coupon || undefined,
        items: items.map((it) => ({
          item_id: it.variant?.sku || it.product.sku || it.product.id,
          item_name: it.product.name_en,
          price: it.unit_price,
          quantity: it.quantity
        }))
      }
    });

    // 2. GA4
    if (s.google_analytics_id && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency,
        value: grandTotal,
        coupon: coupon || undefined,
        items: items.map((it) => ({
          item_id: it.variant?.sku || it.product.sku || it.product.id,
          item_name: it.product.name_en,
          price: it.unit_price,
          quantity: it.quantity
        }))
      });
    }

    // 3. Google Ads Conversion
    if (s.google_ads_conversion_id && s.google_ads_begin_checkout_label && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `${s.google_ads_conversion_id}/${s.google_ads_begin_checkout_label}`,
        value: grandTotal,
        currency
      });
    }

    // 4. Meta Pixel
    if (s.meta_pixel_id && window.fbq) {
      window.fbq(
        'track',
        'InitiateCheckout',
        {
          content_ids: items.map((it) => it.variant?.sku || it.product.sku || it.product.id),
          num_items: items.reduce((sum, it) => sum + it.quantity, 0),
          value: grandTotal,
          currency
        },
        { eventID: eventId }
      );
    }

    // 5. Meta CAPI
    dispatchMetaCapi({
      event_name: 'InitiateCheckout',
      event_id: eventId,
      user_data: { fbp: attr.fbp, fbc: attr.fbc },
      custom_data: {
        content_ids: items.map((it) => it.variant?.sku || it.product.sku || it.product.id),
        num_items: items.reduce((sum, it) => sum + it.quantity, 0),
        value: grandTotal,
        currency
      }
    });
  },

  /**
   * Track Purchase (with strict Deduplication & Enhanced Conversions)
   */
  async trackPurchase(order: Order, items: any[] = [], settings?: Partial<SiteSettings>) {
    if (!order || !order.order_number) return;
    const s = getActiveSettings(settings);
    const orderNumber = order.order_number;

    // Strict Purchase Deduplication Check
    const dedupeKey = `tracked_purchase_${orderNumber}`;
    try {
      if (sessionStorage.getItem(dedupeKey) || localStorage.getItem(dedupeKey)) {
        return; // Prevent duplicate conversion firing
      }
      sessionStorage.setItem(dedupeKey, '1');
      localStorage.setItem(dedupeKey, '1');
    } catch {}

    const eventId = `purchase_${orderNumber}`;
    const currency = s.currency || 'BDT';
    const grandTotal = Number(order.grand_total) || 0;
    const shippingCost = Number(order.shipping_cost) || 0;
    const discountAmount = Number(order.discount_amount) || 0;
    const attr = getAttribution();

    const orderItems = (items && items.length > 0 ? items : order.items) || [];
    const formattedItems = orderItems.map((it: any) => ({
      item_id: it.sku || it.product_id || it.id,
      item_name: it.product_name_en || it.product?.name_en || 'Product',
      price: it.unit_price || (it.total_price && it.quantity ? it.total_price / it.quantity : grandTotal),
      quantity: it.quantity || 1
    }));

    // Google Enhanced Conversions Data
    const enhancedUserData: Record<string, any> = {};
    if (order.customer_email) enhancedUserData.email = order.customer_email.trim().toLowerCase();
    if (order.customer_phone) enhancedUserData.phone_number = order.customer_phone.replace(/[^0-9]/g, '');
    if (order.customer_name) {
      const parts = order.customer_name.trim().split(' ');
      enhancedUserData.first_name = parts[0];
      if (parts.length > 1) enhancedUserData.last_name = parts.slice(1).join(' ');
    }
    if (order.shipping_city) enhancedUserData.city = order.shipping_city;
    enhancedUserData.country = 'BD';

    // 1. GTM DataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'purchase',
      event_id: eventId,
      ecommerce: {
        transaction_id: orderNumber,
        value: grandTotal,
        tax: 0,
        shipping: shippingCost,
        currency,
        coupon: order.coupon_code || undefined,
        discount: discountAmount,
        items: formattedItems
      },
      user_data: enhancedUserData,
      ...attr
    });

    // 2. Google Analytics 4 (GA4)
    if (s.google_analytics_id && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: orderNumber,
        value: grandTotal,
        currency,
        shipping: shippingCost,
        coupon: order.coupon_code || undefined,
        items: formattedItems
      });
    }

    // 3. Google Ads Conversion Tracking (with Enhanced Conversions)
    if (s.google_ads_conversion_id && s.google_ads_purchase_label && window.gtag) {
      const conversionPayload: Record<string, any> = {
        send_to: `${s.google_ads_conversion_id}/${s.google_ads_purchase_label}`,
        value: grandTotal,
        currency,
        transaction_id: orderNumber
      };

      if (s.google_enhanced_conversions_enabled !== '0' && s.google_enhanced_conversions_enabled !== false) {
        conversionPayload.user_data = enhancedUserData;
      }

      window.gtag('event', 'conversion', conversionPayload);
    }

    // 4. Meta Pixel (Browser Event)
    if (s.meta_pixel_id && window.fbq) {
      window.fbq(
        'track',
        'Purchase',
        {
          content_ids: formattedItems.map((it: any) => it.item_id),
          content_type: 'product',
          value: grandTotal,
          currency,
          num_items: formattedItems.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0),
          order_id: orderNumber
        },
        { eventID: eventId }
      );
    }

    // 5. Meta Conversions API (CAPI)
    dispatchMetaCapi({
      event_name: 'Purchase',
      event_id: eventId,
      event_source_url: window.location.href,
      user_data: {
        email: order.customer_email || undefined,
        phone: order.customer_phone || undefined,
        first_name: enhancedUserData.first_name,
        last_name: enhancedUserData.last_name,
        city: order.shipping_city || undefined,
        fbp: attr.fbp,
        fbc: attr.fbc
      },
      custom_data: {
        value: grandTotal,
        currency,
        order_id: orderNumber,
        num_items: formattedItems.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0),
        content_ids: formattedItems.map((it: any) => it.item_id),
        contents: formattedItems.map((it: any) => ({
          id: it.item_id,
          quantity: it.quantity,
          item_price: it.price
        }))
      }
    });
  },

  /**
   * Track Lead (e.g. Contact Form or Newsletter)
   */
  trackLead(leadData: { name?: string; email?: string; phone?: string; message?: string }, settings?: Partial<SiteSettings>) {
    const s = getActiveSettings(settings);
    const eventId = generateEventId('lead');
    const attr = getAttribution();

    // 1. GTM DataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'generate_lead',
      event_id: eventId,
      lead_email: leadData.email ? 'provided' : 'none',
      ...attr
    });

    // 2. GA4
    if (s.google_analytics_id && window.gtag) {
      window.gtag('event', 'generate_lead', {
        event_label: leadData.name || 'Lead submission'
      });
    }

    // 3. Google Ads Lead Conversion
    if (s.google_ads_conversion_id && s.google_ads_lead_label && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `${s.google_ads_conversion_id}/${s.google_ads_lead_label}`,
        value: 1.0,
        currency: s.currency || 'BDT'
      });
    }

    // 4. Meta Pixel
    if (s.meta_pixel_id && window.fbq) {
      window.fbq('track', 'Lead', { content_name: 'Contact Lead' }, { eventID: eventId });
    }

    // 5. Meta CAPI
    dispatchMetaCapi({
      event_name: 'Lead',
      event_id: eventId,
      user_data: {
        email: leadData.email,
        phone: leadData.phone,
        fbp: attr.fbp,
        fbc: attr.fbc
      },
      custom_data: { content_name: 'Contact Lead' }
    });
  }
};
