import crypto from 'crypto';
import { queryOne } from '../db/db.ts';

export function hashData(value?: string | null): string | undefined {
  if (!value) return undefined;
  const clean = value.trim().toLowerCase();
  if (!clean) return undefined;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

export function hashPhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '88' + clean;
  }
  if (!clean.startsWith('880') && clean.length === 10) {
    clean = '880' + clean;
  }
  return hashData(clean);
}

export interface MetaCapiEventPayload {
  event_name: 'PageView' | 'ViewContent' | 'Search' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | 'Lead' | string;
  event_time?: number;
  event_id: string; // Unique deduplication ID matching browser pixel
  event_source_url?: string;
  user_data?: {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    client_ip_address?: string;
    client_user_agent?: string;
    fbp?: string;
    fbc?: string;
    [key: string]: any;
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    contents?: Array<{ id: string; quantity: number; item_price?: number }>;
    num_items?: number;
    order_id?: string;
    search_string?: string;
    [key: string]: any;
  };
}

/**
 * Sends a server-side event to Meta Conversions API (CAPI)
 */
export async function sendMetaCapiEvent(
  payload: MetaCapiEventPayload,
  overrideConfig?: { pixelId?: string; accessToken?: string; testCode?: string }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const isCapiEnabled = queryOne<any>('SELECT value FROM site_settings WHERE key = "meta_capi_enabled"')?.value;
    if (isCapiEnabled === '0' || isCapiEnabled === 'false') {
      if (!overrideConfig) {
        return { success: true, data: { status: 'disabled', message: 'Meta Conversions API is currently disabled in site settings' } };
      }
    }

    const pixelId =
      overrideConfig?.pixelId?.trim() ||
      process.env.META_PIXEL_ID ||
      queryOne<any>('SELECT value FROM site_settings WHERE key = "meta_pixel_id"')?.value;

    const accessToken =
      overrideConfig?.accessToken?.trim() ||
      process.env.META_ACCESS_TOKEN ||
      queryOne<any>('SELECT value FROM site_settings WHERE key = "meta_access_token" OR key = "meta_capi_token"')?.value;

    const testCode =
      overrideConfig?.testCode?.trim() ||
      process.env.META_TEST_EVENT_CODE ||
      queryOne<any>('SELECT value FROM site_settings WHERE key = "meta_test_event_code"')?.value;

    if (!pixelId || !accessToken) {
      // Return gracefully if Meta credentials are not configured yet
      return {
        success: true,
        data: {
          status: 'skipped',
          reason: 'Meta Pixel ID or Meta Access Token not configured yet. Server CAPI ready.'
        }
      };
    }

    const eventTime = payload.event_time || Math.floor(Date.now() / 1000);
    const uData = payload.user_data || {};

    const formattedUserData: Record<string, any> = {
      client_ip_address: uData.client_ip_address,
      client_user_agent: uData.client_user_agent,
      fbp: uData.fbp,
      fbc: uData.fbc
    };

    if (uData.email) {
      formattedUserData.em = [hashData(uData.email)];
    }
    if (uData.phone) {
      formattedUserData.ph = [hashPhone(uData.phone)];
    }
    if (uData.first_name) {
      formattedUserData.fn = [hashData(uData.first_name)];
    }
    if (uData.last_name) {
      formattedUserData.ln = [hashData(uData.last_name)];
    }
    if (uData.city) {
      formattedUserData.ct = [hashData(uData.city)];
    }
    formattedUserData.country = [hashData('bd')];

    const eventPayload: Record<string, any> = {
      event_name: payload.event_name,
      event_time: eventTime,
      event_id: payload.event_id,
      event_source_url: payload.event_source_url || process.env.APP_URL || 'https://shopnova.com',
      action_source: 'website',
      user_data: formattedUserData
    };

    if (payload.custom_data) {
      eventPayload.custom_data = payload.custom_data;
    }

    const body: Record<string, any> = {
      data: [eventPayload]
    };

    if (testCode && testCode.trim()) {
      body.test_event_code = testCode.trim();
    }

    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId.trim()}/events?access_token=${accessToken.trim()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    if (!response.ok) {
      console.warn('Meta CAPI response warning:', result);
      return { success: false, error: result.error?.message || 'Meta CAPI request failed' };
    }

    return { success: true, data: result };
  } catch (err: any) {
    console.error('Meta CAPI error:', err);
    return { success: false, error: err.message || 'Failed to send Meta CAPI event' };
  }
}
