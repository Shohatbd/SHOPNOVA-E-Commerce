import express, { Request, Response } from 'express';
import { query, queryOne, run } from '../db/db.ts';
import { requireAdmin, AuthenticatedRequest, logAdminAction } from '../auth.ts';

const router = express.Router();

// 1. GET /api/categories - Public list with subcategories and product counts
router.get('/', (_req: Request, res: Response) => {
  try {
    const categories = query<any>('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name_en ASC');

    const enriched = categories.map((cat) => {
      const subcategories = query(
        'SELECT * FROM subcategories WHERE category_id = ? AND is_active = 1 ORDER BY name_en ASC',
        [cat.id]
      );
      const stats = queryOne<any>(
        'SELECT COUNT(*) as count, COALESCE(SUM(stock_quantity), 0) as total_stock FROM products WHERE category_id = ? AND is_published = 1',
        [cat.id]
      );
      const productCount = Number(stats?.count || 0);
      const totalStock = Number(stats?.total_stock ?? stats?.totalStock ?? 0);

      return {
        ...cat,
        subcategories,
        productCount,
        totalStock,
        stock_quantity: totalStock
      };
    });

    res.json({
      success: true,
      categories: enriched
    });
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

// 2. GET /api/categories/:slug - Single category with subcategories
router.get('/:slug', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = queryOne('SELECT * FROM categories WHERE slug = ? OR id = ?', [slug, slug]);

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    const subcategories = query(
      'SELECT * FROM subcategories WHERE category_id = ? AND is_active = 1',
      [category.id]
    );

    res.json({
      success: true,
      category: {
        ...category,
        subcategories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch category details.' });
  }
});

// 3. POST /api/categories - Admin create category
router.post('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { name_en, name_bn, description_en, description_bn, image, icon, sort_order } = req.body;

    if (!name_en || !name_bn) {
      res.status(400).json({ success: false, message: 'Both English and Bengali names are required.' });
      return;
    }

    const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const slug = name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    run(
      `INSERT INTO categories (id, name_en, name_bn, slug, description_en, description_bn, image, icon, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name_en, name_bn, slug, description_en || null, description_bn || null, image || null, icon || 'Folder', Number(sort_order || 0)]
    );

    logAdminAction(admin.id, admin.name, 'CREATE_CATEGORY', 'category', id, `Created category: ${name_en}`, req.ip || '127.0.0.1');

    const created = queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'Category created successfully.', category: created });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
});

// 4. PUT /api/categories/:id - Admin update category
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { name_en, name_bn, slug, description_en, description_bn, image, icon, sort_order, is_active } = req.body;

    const existing = queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    run(
      `UPDATE categories SET
        name_en = ?, name_bn = ?, slug = ?, description_en = ?, description_bn = ?,
        image = ?, icon = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name_en || existing.name_en,
        name_bn || existing.name_bn,
        slug || existing.slug,
        description_en ?? existing.description_en,
        description_bn ?? existing.description_bn,
        image ?? existing.image,
        icon ?? existing.icon,
        sort_order !== undefined ? Number(sort_order) : existing.sort_order,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        id
      ]
    );

    logAdminAction(admin.id, admin.name, 'UPDATE_CATEGORY', 'category', id, `Updated category: ${name_en || existing.name_en}`, req.ip || '127.0.0.1');

    const updated = queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    res.json({ success: true, message: 'Category updated successfully.', category: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
});

// 5. PUT /api/categories/subcategories/:subId - Update / Rename subcategory (MUST be before /:id)
router.put('/subcategories/:subId', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { subId } = req.params;
    const { name_en, name_bn, slug, image, is_active } = req.body;

    const existing = queryOne<any>('SELECT * FROM subcategories WHERE id = ?', [subId]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Subcategory not found.' });
      return;
    }

    if (!name_en && !name_bn) {
      res.status(400).json({ success: false, message: 'Subcategory name is required.' });
      return;
    }

    const updatedNameEn = name_en ? name_en.trim() : existing.name_en;
    const updatedNameBn = name_bn ? name_bn.trim() : (name_en ? name_en.trim() : existing.name_bn);
    const updatedSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : updatedNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    run(
      `UPDATE subcategories SET
        name_en = ?,
        name_bn = ?,
        slug = ?,
        image = ?,
        is_active = ?
       WHERE id = ?`,
      [
        updatedNameEn,
        updatedNameBn,
        updatedSlug || existing.slug,
        image !== undefined ? (image || null) : existing.image,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        subId
      ]
    );

    logAdminAction(admin.id, admin.name, 'UPDATE_SUBCATEGORY', 'subcategory', subId, `Renamed subcategory to: ${updatedNameEn}`, req.ip || '127.0.0.1');

    const updated = queryOne('SELECT * FROM subcategories WHERE id = ?', [subId]);
    res.json({ success: true, message: `Subcategory updated to "${updatedNameEn}" successfully.`, subcategory: updated });
  } catch (error) {
    console.error('Update subcategory error:', error);
    res.status(500).json({ success: false, message: 'Failed to update subcategory.' });
  }
});

// 6. DELETE /api/categories/subcategories/:subId - Delete subcategory (MUST be before /:id)
router.delete('/subcategories/:subId', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { subId } = req.params;

    const existing = queryOne<any>('SELECT id, name_en FROM subcategories WHERE id = ?', [subId]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Subcategory not found.' });
      return;
    }

    // Unset subcategory on products that used it
    run('UPDATE products SET subcategory_id = NULL WHERE subcategory_id = ?', [subId]);
    run('DELETE FROM subcategories WHERE id = ?', [subId]);

    logAdminAction(admin.id, admin.name, 'DELETE_SUBCATEGORY', 'subcategory', subId, `Deleted subcategory: ${existing.name_en}`, req.ip || '127.0.0.1');

    res.json({ success: true, message: `Subcategory ${existing.name_en} deleted successfully.` });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete subcategory.' });
  }
});

// 7. POST /api/categories/:id/subcategories - Add subcategory
router.post('/:id/subcategories', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { name_en, name_bn, image } = req.body;

    if (!name_en || !name_bn) {
      res.status(400).json({ success: false, message: 'Both English and Bengali subcategory names are required.' });
      return;
    }

    const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const slug = name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    run(
      'INSERT INTO subcategories (id, category_id, name_en, name_bn, slug, image, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [subId, id, name_en, name_bn, slug, image || null]
    );

    logAdminAction(admin.id, admin.name, 'CREATE_SUBCATEGORY', 'subcategory', subId, `Added subcategory: ${name_en}`, req.ip || '127.0.0.1');

    res.status(201).json({ success: true, message: 'Subcategory added successfully.', subcategoryId: subId });
  } catch (error) {
    console.error('Add subcategory error:', error);
    res.status(500).json({ success: false, message: 'Failed to add subcategory.' });
  }
});

// 7. DELETE /api/categories/:id - Admin delete category
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;

    const existing = queryOne<any>('SELECT id, name_en FROM categories WHERE id = ? OR slug = ?', [id, id]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    const catId = existing.id;

    // Check if category has products
    const productsInCategory = query<any>('SELECT id FROM products WHERE category_id = ?', [catId]);
    if (productsInCategory.length > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete category "${existing.name_en}" because it contains ${productsInCategory.length} product(s). Please move or delete the products first.`
      });
      return;
    }

    // Delete subcategories belonging to this category
    run('DELETE FROM subcategories WHERE category_id = ?', [catId]);
    // Delete category
    run('DELETE FROM categories WHERE id = ?', [catId]);

    logAdminAction(admin.id, admin.name, 'DELETE_CATEGORY', 'category', catId, `Deleted category: ${existing.name_en}`, req.ip || '127.0.0.1');

    res.json({ success: true, message: `Category ${existing.name_en} deleted successfully.` });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
});

export default router;
