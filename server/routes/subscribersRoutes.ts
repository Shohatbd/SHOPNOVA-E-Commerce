import express, { Request, Response } from 'express';
import { query, queryOne, run } from '../db/db.ts';
import { requireAdmin, AuthenticatedRequest, logAdminAction } from '../auth.ts';

const router = express.Router();

// 1. POST /api/subscribers - Public: Subscribe email to newsletter
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({ success: false, message: 'সঠিক ইমেইল এড্রেস প্রদান করুন (Valid email is required).' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      res.status(400).json({ success: false, message: 'অনুগ্রহ করে সঠিক ফরম্যাটের ইমেইল প্রদান করুন (Invalid email format).' });
      return;
    }

    // Check if email already exists
    const existing = queryOne<any>('SELECT * FROM subscribers WHERE email = ?', [cleanEmail]);
    if (existing) {
      res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message: 'আপনি পূর্বে থেকেই সাবস্ক্রাইব করে রেখেছেন (You are already subscribed).'
      });
      return;
    }

    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    run(
      `INSERT INTO subscribers (id, email, status, created_at) VALUES (?, ?, 'active', datetime('now'))`,
      [id, cleanEmail]
    );

    res.status(201).json({
      success: true,
      message: 'ধন্যবাদ! আপনি সফলভাবে ক্লাবে যুক্ত হয়েছেন (Successfully subscribed).'
    });
  } catch (error: any) {
    console.error('Error in newsletter subscription:', error);
    res.status(500).json({ success: false, message: 'সাবস্ক্রিপশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' });
  }
});

// 2. GET /api/subscribers - Admin: List all subscribers
router.get('/', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

    let sql = 'SELECT * FROM subscribers';
    const params: any[] = [];

    if (search) {
      sql += ' WHERE LOWER(email) LIKE ?';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const subscribers = query<any>(sql, params);
    const totalCount = subscribers.length;

    res.json({
      success: true,
      subscribers,
      totalCount
    });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ success: false, message: 'গ্রাহক তালিকা লোড করতে সমস্যা হয়েছে।' });
  }
});

// 3. DELETE /api/subscribers/:id - Admin: Delete a subscriber
router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = queryOne<any>('SELECT * FROM subscribers WHERE id = ?', [id]);

    if (!existing) {
      res.status(404).json({ success: false, message: 'সাবস্ক্রাইবার পাওয়া যায়নি।' });
      return;
    }

    run('DELETE FROM subscribers WHERE id = ?', [id]);

    logAdminAction(
      req.user?.id || 'admin',
      req.user?.username || 'Admin',
      'DELETE_SUBSCRIBER',
      `Deleted newsletter subscriber: ${existing.email}`,
      req.headers['x-forwarded-for'] as string || req.socket.remoteAddress
    );

    res.json({ success: true, message: 'সাবস্ক্রাইবার সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (error: any) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ success: false, message: 'মুছে ফেলতে ব্যর্থ হয়েছে।' });
  }
});

export default router;
