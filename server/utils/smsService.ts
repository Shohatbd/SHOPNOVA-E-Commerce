import { query, queryOne, run } from '../db/db.ts';

export interface SmsSendOptions {
  to: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  eventType?: 'order_placed' | 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'test' | 'custom';
}

export interface SmsSendResult {
  success: boolean;
  provider: string;
  message: string;
  response?: any;
  error?: string;
}

/**
 * Clean and format Bangladeshi phone numbers
 * e.g., "01712345678" -> "8801712345678" or "01712345678" depending on provider
 */
export function formatPhoneNumber(rawPhone: string, format: '880' | 'local' = '880'): string {
  let cleaned = rawPhone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.startsWith('880')) {
    if (format === 'local') {
      return '0' + cleaned.substring(3);
    }
    return cleaned;
  }
  if (cleaned.startsWith('0')) {
    if (format === '880') {
      return '88' + cleaned;
    }
    return cleaned;
  }
  if (format === '880') {
    return '880' + cleaned;
  }
  return '0' + cleaned;
}

/**
 * Replace placeholders in template
 */
export function renderSmsTemplate(template: string, data: {
  customer_name?: string;
  order_number?: string;
  tracking_id?: string;
  courier_name?: string;
  grand_total?: number | string;
  site_name?: string;
  tracking_url?: string;
}): string {
  let result = template;
  result = result.replace(/\{customer_name\}/g, data.customer_name || 'Customer');
  result = result.replace(/\{order_number\}/g, data.order_number || '');
  result = result.replace(/\{tracking_id\}/g, data.tracking_id || 'N/A');
  result = result.replace(/\{courier_name\}/g, data.courier_name || 'Courier');
  result = result.replace(/\{grand_total\}/g, data.grand_total ? `৳${data.grand_total}` : '');
  result = result.replace(/\{site_name\}/g, data.site_name || 'SHOPHATBD');
  result = result.replace(/\{tracking_url\}/g, data.tracking_url || '');
  return result;
}

/**
 * Log SMS to the database
 */
export function logSms(data: {
  phone: string;
  message: string;
  provider: string;
  status: 'sent' | 'failed' | 'disabled';
  response_data?: string;
  order_id?: string;
  order_number?: string;
  event_type?: string;
}) {
  try {
    const logId = `sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    run(
      `INSERT INTO sms_logs (id, phone, message, provider, status, response_data, order_id, order_number, event_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logId,
        data.phone,
        data.message,
        data.provider,
        data.status,
        data.response_data || null,
        data.order_id || null,
        data.order_number || null,
        data.event_type || 'custom'
      ]
    );
  } catch (err) {
    console.error('Error writing to sms_logs table:', err);
  }
}

/**
 * Get configured SMS settings from site_settings table
 */
export function getSmsSettings() {
  const raw = query('SELECT key, value FROM site_settings WHERE key LIKE "sms_%" OR key IN ("site_name", "site_name_bn", "canonical_base_url", "canonical_url")');
  const settings: Record<string, string> = {};
  raw.forEach((item) => {
    settings[item.key] = item.value;
  });

  return {
    enabled: settings['sms_enabled'] === '1' || settings['sms_enabled'] === 'true',
    provider: settings['sms_provider'] || 'greenweb', // greenweb, bulksmsbd, elitbuzz, sslwireless, mimsms, smsnoc, custom
    apiKey: settings['sms_api_key'] || '',
    senderId: settings['sms_sender_id'] || '',
    clientId: settings['sms_client_id'] || '',
    password: settings['sms_password'] || '',
    customUrl: settings['sms_custom_url'] || '',
    customMethod: settings['sms_custom_method'] || 'GET',
    
    // Automation Toggles
    orderPlacedEnabled: settings['sms_order_placed_enabled'] !== '0' && settings['sms_order_placed_enabled'] !== 'false',
    orderConfirmedEnabled: settings['sms_order_confirmed_enabled'] === '1' || settings['sms_order_confirmed_enabled'] === 'true',
    orderShippedEnabled: settings['sms_order_shipped_enabled'] !== '0' && settings['sms_order_shipped_enabled'] !== 'false',
    orderDeliveredEnabled: settings['sms_order_delivered_enabled'] === '1' || settings['sms_order_delivered_enabled'] === 'true',

    // Templates
    orderPlacedTemplate: settings['sms_template_order_placed'] || 
      'Dear {customer_name}, your order #{order_number} of {grand_total} has been received at {site_name}! Track here: {tracking_url}',
    
    orderConfirmedTemplate: settings['sms_template_order_confirmed'] ||
      'Dear {customer_name}, your order #{order_number} has been confirmed and is being processed for delivery. {site_name}',

    orderShippedTemplate: settings['sms_template_order_shipped'] ||
      'Dear {customer_name}, your order #{order_number} has been shipped via {courier_name}. Tracking ID: {tracking_id}. {site_name}',

    orderDeliveredTemplate: settings['sms_template_order_delivered'] ||
      'Dear {customer_name}, your order #{order_number} has been delivered successfully! Thank you for shopping with {site_name}.',

    siteName: settings['site_name'] || 'SHOPHATBD',
    baseUrl: settings['canonical_base_url'] || settings['canonical_url'] || process.env.APP_URL || 'https://shophatbd.com'
  };
}

/**
 * Core function to send SMS via configured Gateway
 */
export async function sendSms(options: SmsSendOptions): Promise<SmsSendResult> {
  const config = getSmsSettings();

  if (!config.enabled && options.eventType !== 'test') {
    return {
      success: false,
      provider: config.provider,
      message: 'SMS gateway is disabled in settings.',
      error: 'SMS_DISABLED'
    };
  }

  if (!config.apiKey && config.provider !== 'custom') {
    const errorMsg = 'SMS API Key / Token is not configured in Admin Settings.';
    logSms({
      phone: options.to,
      message: options.message,
      provider: config.provider,
      status: 'failed',
      response_data: errorMsg,
      order_id: options.orderId,
      order_number: options.orderNumber,
      event_type: options.eventType
    });
    return {
      success: false,
      provider: config.provider,
      message: errorMsg,
      error: 'NO_API_KEY'
    };
  }

  const phone880 = formatPhoneNumber(options.to, '880');
  const phoneLocal = formatPhoneNumber(options.to, 'local');

  try {
    let responseText = '';
    let isSuccess = false;

    switch (config.provider) {
      case 'greenweb': {
        // Greenweb BD: http://api.greenweb.com.bd/api.php?token=TOKEN&to=88017XXXXXXXX&message=MSG
        const url = `http://api.greenweb.com.bd/api.php?token=${encodeURIComponent(config.apiKey)}&to=${encodeURIComponent(phone880)}&message=${encodeURIComponent(options.message)}`;
        const res = await fetch(url);
        responseText = await res.text();
        isSuccess = !responseText.toLowerCase().includes('error') && !responseText.toLowerCase().includes('invalid');
        break;
      }

      case 'bulksmsbd': {
        // BulkSMSBD: http://bulksmsbd.net/api/smsapi?api_key=KEY&type=text&number=88017XXXXXXXX&senderid=SENDER&message=MSG
        const url = `http://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(config.apiKey)}&type=text&number=${encodeURIComponent(phone880)}&senderid=${encodeURIComponent(config.senderId)}&message=${encodeURIComponent(options.message)}`;
        const res = await fetch(url);
        responseText = await res.text();
        isSuccess = responseText.includes('1101') || responseText.toLowerCase().includes('success');
        break;
      }

      case 'elitbuzz': {
        // Elitbuzz: https://portal.elitbuzz-bd.com/smsapi?api_key=KEY&type=text&contacts=88017XXXXXXXX&senderid=SENDER&msg=MSG
        const url = `https://portal.elitbuzz-bd.com/smsapi?api_key=${encodeURIComponent(config.apiKey)}&type=text&contacts=${encodeURIComponent(phone880)}&senderid=${encodeURIComponent(config.senderId)}&msg=${encodeURIComponent(options.message)}`;
        const res = await fetch(url);
        responseText = await res.text();
        isSuccess = !responseText.toLowerCase().includes('error') && !responseText.toLowerCase().includes('invalid');
        break;
      }

      case 'sslwireless': {
        // SSL Wireless: POST https://smsplus.sslwireless.com/api/v3/send-sms
        const csmsId = `CSMS${Date.now()}`;
        const payload = {
          api_token: config.apiKey,
          sid: config.senderId,
          msisdn: phone880,
          sms: options.message,
          csms_id: csmsId
        };
        const res = await fetch('https://smsplus.sslwireless.com/api/v3/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        responseText = await res.text();
        isSuccess = res.ok && !responseText.toLowerCase().includes('failed');
        break;
      }

      case 'mimsms': {
        // MimSMS: POST https://api.mimsms.com/api/v3/send-sms
        const payload = {
          api_token: config.apiKey,
          sender_id: config.senderId,
          recipient: phone880,
          message: options.message
        };
        const res = await fetch('https://api.mimsms.com/api/v3/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        responseText = await res.text();
        isSuccess = res.ok;
        break;
      }

      case 'smsnoc': {
        // SMSNOC: POST https://app.smsnoc.com/api/v3/sms/send
        const payload = {
          recipient: phone880,
          sender_id: config.senderId,
          type: 'plain',
          message: options.message
        };
        const res = await fetch('https://app.smsnoc.com/api/v3/sms/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        responseText = await res.text();
        isSuccess = res.ok;
        break;
      }

      case 'custom': {
        // Generic / Custom Webhook
        let endpoint = config.customUrl
          .replace(/\{apiKey\}/g, encodeURIComponent(config.apiKey))
          .replace(/\{senderId\}/g, encodeURIComponent(config.senderId))
          .replace(/\{phone\}/g, encodeURIComponent(phone880))
          .replace(/\{phoneLocal\}/g, encodeURIComponent(phoneLocal))
          .replace(/\{message\}/g, encodeURIComponent(options.message));

        if (config.customMethod === 'POST') {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: config.apiKey,
              senderId: config.senderId,
              phone: phone880,
              message: options.message
            })
          });
          responseText = await res.text();
          isSuccess = res.ok;
        } else {
          const res = await fetch(endpoint);
          responseText = await res.text();
          isSuccess = res.ok;
        }
        break;
      }

      default: {
        responseText = `Unknown provider: ${config.provider}`;
        isSuccess = false;
      }
    }

    // Log the result
    logSms({
      phone: options.to,
      message: options.message,
      provider: config.provider,
      status: isSuccess ? 'sent' : 'failed',
      response_data: responseText.substring(0, 1000),
      order_id: options.orderId,
      order_number: options.orderNumber,
      event_type: options.eventType
    });

    return {
      success: isSuccess,
      provider: config.provider,
      message: isSuccess ? 'SMS sent successfully.' : `SMS dispatch response: ${responseText}`,
      response: responseText
    };
  } catch (error: any) {
    const errMsg = error?.message || 'Network error sending SMS';
    console.error('SMS send error:', error);
    logSms({
      phone: options.to,
      message: options.message,
      provider: config.provider,
      status: 'failed',
      response_data: errMsg,
      order_id: options.orderId,
      order_number: options.orderNumber,
      event_type: options.eventType
    });

    return {
      success: false,
      provider: config.provider,
      message: errMsg,
      error: errMsg
    };
  }
}

/**
 * Convenience helper to dispatch automated order placement SMS
 */
export async function sendOrderPlacedSms(order: {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  grand_total: number | string;
  tracking_id?: string;
  courier_name?: string;
}) {
  const config = getSmsSettings();
  if (!config.enabled || !config.orderPlacedEnabled) {
    return;
  }

  const trackingUrl = `${config.baseUrl.replace(/\/+$/, '')}/track?order=${encodeURIComponent(order.order_number)}`;
  const message = renderSmsTemplate(config.orderPlacedTemplate, {
    customer_name: order.customer_name,
    order_number: order.order_number,
    tracking_id: order.tracking_id,
    courier_name: order.courier_name,
    grand_total: order.grand_total,
    site_name: config.siteName,
    tracking_url: trackingUrl
  });

  return sendSms({
    to: order.customer_phone,
    message,
    orderId: order.id,
    orderNumber: order.order_number,
    eventType: 'order_placed'
  });
}

/**
 * Convenience helper to dispatch automated order status SMS
 */
export async function sendOrderStatusSms(order: {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  grand_total: number | string;
  order_status: string;
  tracking_id?: string;
  courier_name?: string;
}) {
  const config = getSmsSettings();
  if (!config.enabled) return;

  let template = '';
  let eventType: 'order_confirmed' | 'order_shipped' | 'order_delivered' | null = null;

  if (order.order_status === 'confirmed' && config.orderConfirmedEnabled) {
    template = config.orderConfirmedTemplate;
    eventType = 'order_confirmed';
  } else if (order.order_status === 'shipped' && config.orderShippedEnabled) {
    template = config.orderShippedTemplate;
    eventType = 'order_shipped';
  } else if (order.order_status === 'delivered' && config.orderDeliveredEnabled) {
    template = config.orderDeliveredTemplate;
    eventType = 'order_delivered';
  }

  if (!template || !eventType) return;

  const trackingUrl = `${config.baseUrl.replace(/\/+$/, '')}/track?order=${encodeURIComponent(order.order_number)}`;
  const message = renderSmsTemplate(template, {
    customer_name: order.customer_name,
    order_number: order.order_number,
    tracking_id: order.tracking_id,
    courier_name: order.courier_name,
    grand_total: order.grand_total,
    site_name: config.siteName,
    tracking_url: trackingUrl
  });

  return sendSms({
    to: order.customer_phone,
    message,
    orderId: order.id,
    orderNumber: order.order_number,
    eventType
  });
}
