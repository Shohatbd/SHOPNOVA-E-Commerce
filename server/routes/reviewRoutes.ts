import express, { Request, Response } from 'express';
import { query, queryOne, run } from '../db/db.ts';
import { authenticateToken, requireAdmin, AuthenticatedRequest, logAdminAction } from '../auth.ts';

const router = express.Router();

// 1. POST /api/reviews - Customer submit review
router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { product_id, rating, comment, user_name } = req.body;

    if (!product_id || !rating) {
      res.status(400).json({ success: false, message: 'Product and rating (1-5) are required.' });
      return;
    }

    const ratingNum = Math.min(5, Math.max(1, Number(rating)));
    const revId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const finalUserName = user.name?.trim() || user.username?.trim() || user_name?.trim() || 'Valued Customer';

    // Check if user bought product
    const purchase = queryOne(
      `SELECT oi.id FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.product_id = ? AND (o.user_id = ? OR o.customer_email = ?)`,
      [product_id, user.id, user.email]
    );

    const isVerified = purchase ? 1 : 0;

    run(
      `INSERT INTO reviews (id, product_id, user_id, user_name, rating, comment, is_verified_purchase, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')`,
      [revId, product_id, user.id, finalUserName, ratingNum, comment?.trim() || null, isVerified]
    );

    // Update product rating and review count
    const stats = queryOne<{ avg_rating: number; count: number }>(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ? AND status = "approved"',
      [product_id]
    );

    if (stats) {
      run(
        'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
        [Math.round((stats.avg_rating || 5) * 10) / 10, stats.count || 1, product_id]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your verified review has been published.'
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// 2. GET /api/reviews/admin/all - Admin list all reviews
router.get('/admin/all', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const rawReviews = query(
      `SELECT r.*, p.name_en as product_name, p.thumbnail as product_thumbnail
       FROM reviews r
       LEFT JOIN products p ON r.product_id = p.id
       ORDER BY r.created_at DESC`
    );
    const reviews = rawReviews.map((r: any) => ({
      ...r,
      is_approved: r.status === 'approved' ? 1 : 0
    }));
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// 3. PUT /api/reviews/admin/:id/status - Approve/Reject review
router.put('/admin/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { status, is_approved } = req.body;

    let finalStatus = status;
    if (!finalStatus && is_approved !== undefined) {
      finalStatus = (is_approved === 1 || is_approved === '1' || is_approved === true || is_approved === 'approved') ? 'approved' : 'rejected';
    }
    if (!finalStatus) {
      finalStatus = 'approved';
    }

    run('UPDATE reviews SET status = ? WHERE id = ?', [finalStatus, id]);

    // Recalculate rating and review count for product
    const rev = queryOne<{ product_id: string }>('SELECT product_id FROM reviews WHERE id = ?', [id]);
    if (rev && rev.product_id) {
      const stats = queryOne<{ avg_rating: number; count: number }>(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ? AND status = "approved"',
        [rev.product_id]
      );
      const avg = stats && stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : 5.0;
      const count = stats && stats.count ? stats.count : 0;
      run('UPDATE products SET rating = ?, review_count = ? WHERE id = ?', [avg, count, rev.product_id]);
    }

    logAdminAction(admin.id, admin.name, 'MODERATE_REVIEW', 'review', id, `Updated review status to ${finalStatus}`, req.ip || '127.0.0.1');

    res.json({
      success: true,
      message: `Review status updated to ${finalStatus}.`,
      status: finalStatus,
      is_approved: finalStatus === 'approved' ? 1 : 0
    });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update review status.' });
  }
});

// 4. DELETE /api/reviews/admin/:id - Delete review
router.delete('/admin/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const rev = queryOne<{ product_id: string }>('SELECT product_id FROM reviews WHERE id = ?', [id]);

    run('DELETE FROM reviews WHERE id = ?', [id]);

    if (rev && rev.product_id) {
      const stats = queryOne<{ avg_rating: number; count: number }>(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ? AND status = "approved"',
        [rev.product_id]
      );
      const avg = stats && stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : 5.0;
      const count = stats && stats.count ? stats.count : 0;
      run('UPDATE products SET rating = ?, review_count = ? WHERE id = ?', [avg, count, rev.product_id]);
    }

    logAdminAction(admin.id, admin.name, 'DELETE_REVIEW', 'review', id, 'Deleted review', req.ip || '127.0.0.1');
    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});

export default router;
