import express, { Request, Response } from 'express';
import { query, queryOne, run } from '../db/db.ts';
import { requireAdmin, AuthenticatedRequest, logAdminAction } from '../auth.ts';
import {
  sendAdminNewMessageAlert,
  sendCustomerAutoReply,
  sendAdminDirectReply,
  testSmtpSettings
} from '../utils/emailService.ts';

const router = express.Router();

// 1. POST /api/contact - Public: Submit a quick message / inquiry
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message, subject } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, message: 'আপনার নাম প্রদান করা আবশ্যক (Name is required).' });
      return;
    }

    const cleanEmail = typeof email === 'string' ? email.trim() : '';
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
    const cleanMessage = typeof message === 'string' ? message.trim() : '';
    const cleanSubject = typeof subject === 'string' ? subject.trim() : 'Customer Inquiry';

    if (!cleanEmail && !cleanPhone) {
      res.status(400).json({
        success: false,
        message: 'মোবাইল নম্বর অথবা ইমেইল যেকোনো একটি অবশ্যই দেওয়া প্রয়োজন (Either phone or email is required).'
      });
      return;
    }

    if (!cleanMessage) {
      res.status(400).json({ success: false, message: 'আপনার বার্তা বা মেসেজটি লিখুন (Message cannot be empty).' });
      return;
    }

    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ipStr = Array.isArray(ip) ? ip[0] : ip;

    // Save inquiry to database
    run(
      `INSERT INTO contact_messages (id, name, email, phone, subject, message, status, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'unread', ?, datetime('now'))`,
      [id, name.trim(), cleanEmail || null, cleanPhone || null, cleanSubject, cleanMessage, ipStr]
    );

    // Asynchronously dispatch admin notification email & customer acknowledgement
    sendAdminNewMessageAlert({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      message: cleanMessage,
      messageId: id
    }).catch((err) => console.error('Background admin alert email error:', err));

    if (cleanEmail) {
      sendCustomerAutoReply({
        name: name.trim(),
        email: cleanEmail,
        message: cleanMessage
      }).catch((err) => console.error('Background customer auto-reply email error:', err));
    }

    res.status(201).json({
      success: true,
      message: 'আপনার বার্তা সফলভাবে জমা হয়েছে। আমাদের টিম খুব দ্রুত যোগাযোগ করবে!',
      message_id: id
    });
  } catch (error: any) {
    console.error('Failed to submit contact message:', error);
    res.status(500).json({ success: false, message: 'বার্তা পাঠানো যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' });
  }
});

// 2. GET /api/contact/stats - Admin: Unread and total stats
router.get('/stats', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = queryOne<{ total: number; unread: number; replied: number }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied
      FROM contact_messages
    `) || { total: 0, unread: 0, replied: 0 };

    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch message stats' });
  }
});

// 3. GET /api/contact - Admin: List all inquiries with filtering & search
router.get('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search } = req.query;

    let sql = 'SELECT * FROM contact_messages WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search && typeof search === 'string' && search.trim()) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY created_at DESC LIMIT 200';

    const messages = query(sql, params);
    res.json({ success: true, messages });
  } catch (error: any) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ success: false, message: 'Failed to load inquiries' });
  }
});

// 4. PATCH /api/contact/:id - Admin: Update status or admin note
router.patch('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const existing = queryOne('SELECT * FROM contact_messages WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Message not found' });
      return;
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (status && ['unread', 'read', 'replied', 'archived'].includes(status)) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'replied') {
        updates.push("replied_at = datetime('now')");
      }
    }

    if (admin_notes !== undefined) {
      updates.push('admin_notes = ?');
      params.push(admin_notes);
    }

    if (updates.length > 0) {
      params.push(id);
      run(`UPDATE contact_messages SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const updated = queryOne('SELECT * FROM contact_messages WHERE id = ?', [id]);
    res.json({ success: true, message: 'Updated successfully', inquiry: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update message' });
  }
});

// 5. POST /api/contact/:id/reply - Admin: Send email reply to customer
router.post('/:id/reply', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { subject, replyContent } = req.body;

    const existing = queryOne<any>('SELECT * FROM contact_messages WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Message not found' });
      return;
    }

    if (!existing.email) {
      res.status(400).json({ success: false, message: 'এই গ্রাহকের কোনো ইমেইল ঠিকানা নেই।' });
      return;
    }

    if (!replyContent || !replyContent.trim()) {
      res.status(400).json({ success: false, message: 'উত্তরের বিষয়বস্তু বা মেসেজ লিখুন।' });
      return;
    }

    const result = await sendAdminDirectReply({
      toEmail: existing.email,
      customerName: existing.name,
      replySubject: subject || `Re: ${existing.subject || 'Customer Inquiry'}`,
      replyContent: replyContent.trim(),
      originalMessage: existing.message
    });

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    // Mark as replied
    run("UPDATE contact_messages SET status = 'replied', replied_at = datetime('now') WHERE id = ?", [id]);

    logAdminAction(
      req.user!.id,
      req.user!.name,
      'REPLY_INQUIRY',
      'contact_message',
      id,
      `Replied to customer ${existing.name} (${existing.email})`
    );

    res.json({ success: true, message: 'ইমেইল সফলভাবে পাঠানো হয়েছে এবং স্ট্যাটাস Replied করা হয়েছে!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to send reply' });
  }
});

// 6. DELETE /api/contact/:id - Admin: Delete inquiry
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    run('DELETE FROM contact_messages WHERE id = ?', [id]);
    res.json({ success: true, message: 'বার্তাটি মুছে ফেলা হয়েছে।' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
});

// 7. POST /api/contact/test-smtp - Admin: Test SMTP connection and email delivery
router.post('/test-smtp', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, smtp_from_name, smtp_from_email, test_recipient } = req.body;

    const result = await testSmtpSettings({
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_user,
      smtp_pass,
      smtp_from_name,
      smtp_from_email,
      test_recipient
    });

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'SMTP test failed' });
  }
});

export default router;
