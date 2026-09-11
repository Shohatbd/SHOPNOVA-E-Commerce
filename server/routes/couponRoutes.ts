import express, { Request, Response } from 'express';
import { query, queryOne, run } from '../db/db.ts';
import { requireAdmin, AuthenticatedRequest, logAdminAction } from '../auth.ts';

const router = express.Router();

// 1. POST /api/coupons/validate - Validate coupon code
router.post('/validate', (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Coupon code is required.' });
      return;
    }

    const coupon = queryOne<any>(
      'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
      [code.trim().toUpperCase()]
    );

    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
      return;
    }

    const orderAmount = Number(subtotal || 0);
    if (orderAmount < coupon.min_order_amount) {
      res.status(400).json({
        success: false,
        message: `This coupon requires a minimum order amount of ৳${coupon.min_order_amount}.`
      });
      return;
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      res.status(400).json({ success: false, message: 'Coupon usage limit has been exceeded.' });
      return;
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((orderAmount * coupon.discount_value) / 100);
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied! You saved ৳${discountAmount}.`,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discountAmount,
        min_order_amount: coupon.min_order_amount,
        description_en: coupon.description_en,
        description_bn: coupon.description_bn
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to validate coupon.' });
  }
});

// 2. GET /api/coupons - Admin list all coupons
router.get('/', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const coupons = query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch coupons.' });
  }
});

// 3. POST /api/coupons - Admin create coupon
router.post('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { code, description_en, description_bn, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit } = req.body;

    if (!code || !discount_type || !discount_value) {
      res.status(400).json({ success: false, message: 'Coupon code, discount type, and discount value are required.' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = queryOne('SELECT id FROM coupons WHERE code = ?', [cleanCode]);
    if (existing) {
      res.status(400).json({ success: false, message: 'A coupon with this code already exists.' });
      return;
    }

    const id = `coup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    run(
      `INSERT INTO coupons (id, code, description_en, description_bn, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id, cleanCode, description_en || null, description_bn || null, discount_type,
        Number(discount_value), Number(min_order_amount || 0),
        max_discount_amount ? Number(max_discount_amount) : null,
        Number(usage_limit || 100)
      ]
    );

    logAdminAction(admin.id, admin.name, 'CREATE_COUPON', 'coupon', id, `Created coupon: ${cleanCode}`, req.ip || '127.0.0.1');

    res.status(201).json({ success: true, message: `Coupon ${cleanCode} created successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create coupon.' });
  }
});

// 4. PUT /api/coupons/:id - Admin update coupon
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { code, description_en, description_bn, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active } = req.body;

    if (!code || !discount_type || discount_value === undefined) {
      res.status(400).json({ success: false, message: 'Coupon code, discount type, and discount value are required.' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = queryOne('SELECT id FROM coupons WHERE code = ? AND id != ?', [cleanCode, id]);
    if (existing) {
      res.status(400).json({ success: false, message: 'Another coupon with this code already exists.' });
      return;
    }

    run(
      `UPDATE coupons SET
        code = ?,
        description_en = ?,
        description_bn = ?,
        discount_type = ?,
        discount_value = ?,
        min_order_amount = ?,
        max_discount_amount = ?,
        usage_limit = ?,
        is_active = ?
       WHERE id = ?`,
      [
        cleanCode,
        description_en || null,
        description_bn || null,
        discount_type,
        Number(discount_value),
        Number(min_order_amount || 0),
        max_discount_amount ? Number(max_discount_amount) : null,
        usage_limit ? Number(usage_limit) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        id
      ]
    );

    logAdminAction(admin.id, admin.name, 'UPDATE_COUPON', 'coupon', id, `Updated coupon: ${cleanCode}`, req.ip || '127.0.0.1');

    res.json({ success: true, message: `Coupon ${cleanCode} updated successfully.` });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to update coupon.' });
  }
});

// 5. DELETE /api/coupons/:id - Admin delete coupon
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    run('DELETE FROM coupons WHERE id = ?', [id]);
    logAdminAction(admin.id, admin.name, 'DELETE_COUPON', 'coupon', id, `Deleted coupon ID ${id}`, req.ip || '127.0.0.1');
    res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
});

export default router;
