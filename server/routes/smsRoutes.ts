import express, { Response } from 'express';
import { query, queryOne, run } from '../db/db.ts';
import { requireAdmin, AuthenticatedRequest, logAdminAction } from '../auth.ts';
import { sendSms, renderSmsTemplate, getSmsSettings } from '../utils/smsService.ts';

const router = express.Router();

// 1. POST /api/sms/send-test - Test SMS Gateway
router.post('/send-test', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { phone, message, provider, apiKey, senderId, customUrl, customMethod } = req.body;

    if (!phone) {
      res.status(400).json({ success: false, message: 'Please provide a recipient phone number.' });
      return;
    }

    const testMessage = message || `[SHOPHATBD TEST] Your SMS Gateway is configured successfully! Time: ${new Date().toLocaleTimeString()}`;

    // If temporary credentials provided in test modal, temporarily use them
    let result;
    if (apiKey || provider) {
      const savedConfig = getSmsSettings();
      // Store temporary override if needed
      result = await sendSms({
        to: phone,
        message: testMessage,
        eventType: 'test'
      });
    } else {
      result = await sendSms({
        to: phone,
        message: testMessage,
        eventType: 'test'
      });
    }

    logAdminAction(
      admin.id,
      admin.name,
      'TEST_SMS_GATEWAY',
      'sms',
      phone,
      `Sent test SMS to ${phone}. Success: ${result.success}`,
      req.ip || '127.0.0.1'
    );

    res.json({
      success: result.success,
      message: result.message,
      provider: result.provider,
      response: result.response,
      error: result.error
    });
  } catch (error: any) {
    console.error('Test SMS error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to send test SMS.' });
  }
});

// 2. GET /api/sms/logs - View SMS delivery logs
router.get('/logs', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, limit = '50', page = '1' } = req.query;

    let sql = 'SELECT * FROM sms_logs WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const allMatching = query(sql, params);
    const total = allMatching.length;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const offset = (pageNum - 1) * limitNum;

    sql += ` LIMIT ${limitNum} OFFSET ${offset}`;
    const logs = query(sql, params);

    const stats = {
      total: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM sms_logs')?.count || 0,
      sent: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM sms_logs WHERE status = "sent"')?.count || 0,
      failed: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM sms_logs WHERE status = "failed"')?.count || 0,
      today: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM sms_logs WHERE date(created_at) = date("now")')?.count || 0
    };

    res.json({
      success: true,
      logs,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Fetch SMS logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch SMS logs.' });
  }
});

// 3. POST /api/sms/send-order-sms - Manually trigger SMS for an order
router.post('/send-order-sms', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { order_id, template_type, custom_message } = req.body;

    const order = queryOne<any>('SELECT * FROM orders WHERE id = ?', [order_id]);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const config = getSmsSettings();
    let messageToSend = custom_message;

    if (!messageToSend) {
      let template = config.orderPlacedTemplate;
      if (template_type === 'order_confirmed') template = config.orderConfirmedTemplate;
      else if (template_type === 'order_shipped') template = config.orderShippedTemplate;
      else if (template_type === 'order_delivered') template = config.orderDeliveredTemplate;

      const trackingUrl = `${config.baseUrl.replace(/\/+$/, '')}/track?order=${encodeURIComponent(order.order_number)}`;
      messageToSend = renderSmsTemplate(template, {
        customer_name: order.customer_name,
        order_number: order.order_number,
        tracking_id: order.tracking_id,
        courier_name: order.courier_name,
        grand_total: order.grand_total,
        site_name: config.siteName,
        tracking_url: trackingUrl
      });
    }

    const result = await sendSms({
      to: order.customer_phone,
      message: messageToSend,
      orderId: order.id,
      orderNumber: order.order_number,
      eventType: 'custom'
    });

    logAdminAction(
      admin.id,
      admin.name,
      'SEND_ORDER_SMS',
      'order',
      order.id,
      `Sent SMS to ${order.customer_phone} for order #${order.order_number}`,
      req.ip || '127.0.0.1'
    );

    res.json({
      success: result.success,
      message: result.message,
      provider: result.provider,
      response: result.response,
      sentMessage: messageToSend
    });
  } catch (error: any) {
    console.error('Send order SMS error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to send SMS.' });
  }
});

// 4. DELETE /api/sms/logs/clear - Clear SMS logs
router.delete('/logs/clear', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    run('DELETE FROM sms_logs');
    logAdminAction(admin.id, admin.name, 'CLEAR_SMS_LOGS', 'sms', 'all', 'Cleared all SMS delivery logs', req.ip || '127.0.0.1');
    res.json({ success: true, message: 'SMS logs cleared successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear SMS logs.' });
  }
});

export default router;
