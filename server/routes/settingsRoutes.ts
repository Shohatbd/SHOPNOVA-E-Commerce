import express, { Request, Response } from 'express';
import { query, queryOne, run, saveDatabase } from '../db/db.ts';
import { requireAdmin, AuthenticatedRequest, logAdminAction, verifyToken } from '../auth.ts';

const router = express.Router();

const SENSITIVE_KEYS = ['meta_access_token', 'meta_capi_token', 'jwt_secret', 'secret_key'];

// 1. GET /api/settings - Public website settings (Sensitive credentials stripped for public safety)
router.get('/', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const user = token ? verifyToken(token) : null;
    const isAdmin = user && ['admin', 'superadmin', 'super_admin', 'manager', 'staff'].includes(user.role_id);

    const rawSettings = query('SELECT key, value FROM site_settings');
    const settings: Record<string, string> = {};
    rawSettings.forEach((item) => {
      // If not an authenticated admin, never expose sensitive server credentials to frontend
      if (!isAdmin && SENSITIVE_KEYS.includes(item.key)) {
        return;
      }
      settings[item.key] = item.value;
    });

    const shippingMethods = query('SELECT * FROM shipping_methods WHERE is_active = 1');

    res.json({
      success: true,
      settings,
      shippingMethods
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
});

// 2. GET /api/settings/admin - Admin authorized settings fetch (Includes tracking & CAPI credentials)
router.get('/admin', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const rawSettings = query('SELECT key, value FROM site_settings');
    const settings: Record<string, string> = {};
    rawSettings.forEach((item) => {
      settings[item.key] = item.value;
    });

    const shippingMethods = query('SELECT * FROM shipping_methods');

    res.json({
      success: true,
      settings,
      shippingMethods
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin settings.' });
  }
});

// 3. PUT /api/settings - Admin update website settings
router.put('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const body = req.body || {};

    // Support both { settings: { ... } } and direct flat payload { key: value }
    const settingsData: Record<string, any> =
      body.settings && typeof body.settings === 'object' && !Array.isArray(body.settings)
        ? { ...body.settings }
        : { ...body };

    const shippingMethods = body.shippingMethods || settingsData.shippingMethods;
    delete settingsData.shippingMethods;
    delete settingsData.settings;

    for (const [key, value] of Object.entries(settingsData)) {
      if (value === undefined || value === null) continue;
      const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
      const existing = queryOne('SELECT id FROM site_settings WHERE key = ?', [key]);
      if (existing) {
        run('UPDATE site_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?', [valStr, key]);
      } else {
        run('INSERT INTO site_settings (id, key, value) VALUES (?, ?, ?)', [`st_${key}`, key, valStr]);
      }
    }

    if (Array.isArray(shippingMethods)) {
      for (const sm of shippingMethods) {
        if (sm.id) {
          run(
            'UPDATE shipping_methods SET cost = ?, estimated_days = ?, name_en = ?, name_bn = ? WHERE id = ?',
            [Number(sm.cost), sm.estimated_days, sm.name_en, sm.name_bn, sm.id]
          );
        }
      }
    }

    saveDatabase();

    logAdminAction(admin.id, admin.name, 'UPDATE_SETTINGS', 'settings', 'all', 'Website configuration updated', req.ip || '127.0.0.1');

    res.json({ success: true, message: 'Settings saved successfully.' });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
});

export default router;
