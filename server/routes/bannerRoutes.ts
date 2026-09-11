import express, { Request, Response } from 'express';
import { query, queryOne, run } from '../db/db.ts';
import { requireAdmin, AuthenticatedRequest, logAdminAction } from '../auth.ts';

const router = express.Router();

// 1. GET /api/banners - Public active banners
router.get('/', (_req: Request, res: Response) => {
  try {
    const banners = query('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC');
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch banners.' });
  }
});

// 2. GET /api/banners/admin/all - Admin all banners
router.get('/admin/all', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const banners = query('SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC');
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch banners.' });
  }
});

// 3. POST /api/banners - Admin create banner
router.post('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { title_en, title_bn, subtitle_en, subtitle_bn, image_url, button_text_en, button_text_bn, button_link, badge_en, badge_bn, sort_order } = req.body;

    if (!title_en || !image_url) {
      res.status(400).json({ success: false, message: 'Banner title and image URL are required.' });
      return;
    }

    const id = `ban_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    run(
      `INSERT INTO banners (id, title_en, title_bn, subtitle_en, subtitle_bn, image_url, button_text_en, button_text_bn, button_link, badge_en, badge_bn, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id, title_en, title_bn || title_en, subtitle_en || null, subtitle_bn || null,
        image_url, button_text_en || 'Shop Now', button_text_bn || 'এখনই কিনুন',
        button_link || '/shop', badge_en || null, badge_bn || null, Number(sort_order || 1)
      ]
    );

    logAdminAction(admin.id, admin.name, 'CREATE_BANNER', 'banner', id, `Created banner: ${title_en}`, req.ip || '127.0.0.1');

    res.status(201).json({ success: true, message: 'Banner created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create banner.' });
  }
});

// 4. PUT /api/banners/:id - Admin update banner
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;

    const existing: any = queryOne('SELECT * FROM banners WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Banner not found.' });
      return;
    }

    const title_en = req.body.title_en !== undefined ? req.body.title_en : existing.title_en;
    const title_bn = req.body.title_bn !== undefined ? req.body.title_bn : existing.title_bn;
    const subtitle_en = req.body.subtitle_en !== undefined ? req.body.subtitle_en : existing.subtitle_en;
    const subtitle_bn = req.body.subtitle_bn !== undefined ? req.body.subtitle_bn : existing.subtitle_bn;
    const image_url = req.body.image_url !== undefined ? req.body.image_url : existing.image_url;
    const button_text_en = req.body.button_text_en !== undefined ? req.body.button_text_en : existing.button_text_en;
    const button_text_bn = req.body.button_text_bn !== undefined ? req.body.button_text_bn : existing.button_text_bn;
    const button_link = req.body.button_link || req.body.link_url || existing.button_link || '/shop';
    const badge_en = req.body.badge_en !== undefined ? req.body.badge_en : existing.badge_en;
    const badge_bn = req.body.badge_bn !== undefined ? req.body.badge_bn : existing.badge_bn;
    const sort_order = req.body.sort_order !== undefined ? Number(req.body.sort_order) : existing.sort_order;
    const is_active = req.body.is_active !== undefined ? (req.body.is_active ? 1 : 0) : existing.is_active;

    run(
      `UPDATE banners SET
        title_en = ?, title_bn = ?, subtitle_en = ?, subtitle_bn = ?, image_url = ?,
        button_text_en = ?, button_text_bn = ?, button_link = ?, badge_en = ?, badge_bn = ?,
        sort_order = ?, is_active = ?
       WHERE id = ?`,
      [
        title_en || existing.title_en || 'Banner',
        title_bn || existing.title_bn || title_en || 'ব্যানার',
        subtitle_en ?? null,
        subtitle_bn ?? null,
        image_url || existing.image_url,
        button_text_en || 'Explore Collection',
        button_text_bn || 'এখনই কিনুন',
        button_link,
        badge_en ?? null,
        badge_bn ?? null,
        sort_order || 1,
        is_active,
        id
      ]
    );

    logAdminAction(admin.id, admin.name, 'UPDATE_BANNER', 'banner', id, `Updated banner: ${title_en || existing.title_en}`, req.ip || '127.0.0.1');

    res.json({ success: true, message: 'Banner updated successfully.' });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to update banner.' });
  }
});

// 5. DELETE /api/banners/:id - Admin delete banner
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    run('DELETE FROM banners WHERE id = ?', [id]);
    logAdminAction(admin.id, admin.name, 'DELETE_BANNER', 'banner', id, 'Deleted banner', req.ip || '127.0.0.1');
    res.json({ success: true, message: 'Banner deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete banner.' });
  }
});

export default router;
