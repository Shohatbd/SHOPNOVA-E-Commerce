import express, { Request, Response } from 'express';
import { query, queryOne, run } from '../db/db.ts';
import { requireAdmin, AuthenticatedRequest, logAdminAction } from '../auth.ts';

const router = express.Router();

// Helper to attach variants & images to product objects
function enrichProduct(product: any) {
  if (!product) return null;
  const variants = query(
    'SELECT id, sku, size, color, color_code, price_adjustment, stock_quantity, image, is_active FROM product_variants WHERE product_id = ? ORDER BY size ASC',
    [product.id]
  );
  const images = query(
    'SELECT id, image_url, is_primary, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, is_primary DESC',
    [product.id]
  );
  const category = queryOne(
    'SELECT id, name_en, name_bn, slug FROM categories WHERE id = ?',
    [product.category_id]
  );
  const subcategory = product.subcategory_id
    ? queryOne('SELECT id, name_en, name_bn, slug FROM subcategories WHERE id = ?', [product.subcategory_id])
    : null;

  return {
    ...product,
    variants,
    images: images.map((img: any) => img.image_url),
    category,
    subcategory
  };
}

// 1. GET /api/products - Search, Filter, Sort, Paginate
router.get('/', (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      subcategory,
      minPrice,
      maxPrice,
      brand,
      size,
      color,
      rating,
      inStock,
      featured,
      is_featured,
      bestseller,
      is_bestseller,
      newArrival,
      is_new_arrival,
      flashSale,
      is_flash_sale,
      sort,
      page = '1',
      limit = '12',
      includeUnpublished
    } = req.query;

    let sql = 'SELECT p.* FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN subcategories s ON p.subcategory_id = s.id WHERE 1=1';
    const params: any[] = [];

    if (includeUnpublished !== 'true') {
      sql += ' AND p.is_published = 1';
    }

    if (search) {
      sql += ` AND (
        p.name_en LIKE ? OR
        p.name_bn LIKE ? OR
        p.sku LIKE ? OR
        p.brand LIKE ? OR
        p.tags LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      sql += ' AND (p.category_id = ? OR p.category_id IN (SELECT id FROM categories WHERE slug = ?))';
      params.push(category, category);
    }

    if (subcategory) {
      sql += ' AND (p.subcategory_id = ? OR p.subcategory_id IN (SELECT id FROM subcategories WHERE slug = ?))';
      params.push(subcategory, subcategory);
    }

    if (brand) {
      sql += ' AND p.brand = ?';
      params.push(brand);
    }

    if (minPrice) {
      sql += ' AND COALESCE(p.sale_price, p.regular_price) >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      sql += ' AND COALESCE(p.sale_price, p.regular_price) <= ?';
      params.push(Number(maxPrice));
    }

    if (rating) {
      sql += ' AND p.rating >= ?';
      params.push(Number(rating));
    }

    if (inStock === 'true' || inStock === '1') {
      sql += ' AND p.stock_quantity > 0';
    }

    const isFeat = featured === 'true' || featured === '1' || is_featured === 'true' || is_featured === '1';
    if (isFeat) {
      sql += ' AND p.is_featured = 1';
    }

    const isBest = bestseller === 'true' || bestseller === '1' || is_bestseller === 'true' || is_bestseller === '1';
    if (isBest) {
      sql += ' AND p.is_bestseller = 1';
    }

    const isNew = newArrival === 'true' || newArrival === '1' || is_new_arrival === 'true' || is_new_arrival === '1';
    if (isNew) {
      sql += ' AND p.is_new_arrival = 1';
    }

    const isFlash = flashSale === 'true' || flashSale === '1' || is_flash_sale === 'true' || is_flash_sale === '1';
    if (isFlash) {
      sql += ' AND p.is_flash_sale = 1';
    }

    if (size) {
      sql += ' AND p.id IN (SELECT product_id FROM product_variants WHERE size LIKE ?)';
      params.push(`%${size}%`);
    }

    if (color) {
      sql += ' AND p.id IN (SELECT product_id FROM product_variants WHERE color LIKE ?)';
      params.push(`%${color}%`);
    }

    // Sorting
    switch (sort) {
      case 'category':
      case 'admin_category':
        sql += ' ORDER BY COALESCE(c.sort_order, 999) ASC, c.name_en ASC, p.category_id ASC, COALESCE(s.name_en, \'\') ASC, p.id ASC';
        break;
      case 'price_asc':
        sql += ' ORDER BY COALESCE(p.sale_price, p.regular_price) ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY COALESCE(p.sale_price, p.regular_price) DESC';
        break;
      case 'rating':
        sql += ' ORDER BY p.rating DESC, p.review_count DESC';
        break;
      case 'bestseller':
        sql += ' ORDER BY p.is_bestseller DESC, p.review_count DESC';
        break;
      case 'discount':
        sql += ' ORDER BY p.discount_percentage DESC';
        break;
      case 'newest':
      default:
        sql += ' ORDER BY p.is_featured DESC, p.created_at DESC';
        break;
    }

    // Count total matching
    const allMatching = query(sql, params);
    const total = allMatching.length;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const offset = (pageNum - 1) * limitNum;

    sql += ` LIMIT ${limitNum} OFFSET ${offset}`;
    const rawProducts = query(sql, params);

    const products = rawProducts.map(enrichProduct);

    res.json({
      success: true,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
});

// 2. GET /api/products/flash-sale
router.get('/flash-sale', (_req: Request, res: Response) => {
  try {
    const raw = query('SELECT * FROM products WHERE is_flash_sale = 1 AND is_published = 1 LIMIT 8');
    const products = raw.map(enrichProduct);
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch flash sale products.' });
  }
});

// 3. GET /api/products/:slugOrId - Single product details
router.get('/:slugOrId', (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    const raw = queryOne(
      'SELECT * FROM products WHERE slug = ? OR id = ?',
      [slugOrId, slugOrId]
    );

    if (!raw) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const product = enrichProduct(raw);

    // Get related products from same category
    const relatedRaw = query(
      'SELECT * FROM products WHERE category_id = ? AND id != ? AND is_published = 1 LIMIT 4',
      [product.category_id, product.id]
    );
    const relatedProducts = relatedRaw.map(enrichProduct);

    // Get approved reviews
    const reviews = query(
      'SELECT * FROM reviews WHERE product_id = ? AND status = "approved" ORDER BY created_at DESC',
      [product.id]
    );

    res.json({
      success: true,
      product,
      relatedProducts,
      reviews
    });
  } catch (error) {
    console.error('Fetch single product error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product details.' });
  }
});

// ==================== ADMIN PRODUCT MANAGEMENT ====================

// 4. POST /api/products - Create product
router.post('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const {
      name_en,
      name_bn,
      sku,
      category_id,
      subcategory_id,
      brand,
      regular_price,
      sale_price,
      stock_quantity,
      low_stock_threshold,
      thumbnail,
      images = [],
      variants = [],
      short_description_en,
      short_description_bn,
      description_en,
      description_bn,
      weight,
      is_featured,
      is_bestseller,
      is_new_arrival,
      is_flash_sale,
      tags,
      seo_title,
      seo_description,
      seo_keywords
    } = req.body;

    if (!name_en || !category_id || !regular_price || !thumbnail) {
      res.status(400).json({ success: false, message: 'English name, Category, Regular price, and Thumbnail are required.' });
      return;
    }

    const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const finalSku = sku?.trim() || `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const slug = name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${productId.slice(-4)}`;

    const regular = Number(regular_price);
    const sale = sale_price ? Number(sale_price) : null;
    const discount = sale && sale < regular ? Math.round(((regular - sale) / regular) * 100) : 0;
    const stock = Number(stock_quantity || 0);

    run(
      `INSERT INTO products (
        id, sku, name_en, name_bn, slug, short_description_en, short_description_bn,
        description_en, description_bn, category_id, subcategory_id, brand,
        regular_price, sale_price, discount_percentage,
        opening_stock, total_received, total_delivered, total_returned, stock_quantity, low_stock_threshold,
        thumbnail, weight, is_featured, is_bestseller, is_new_arrival, is_flash_sale,
        tags, seo_title, seo_description, seo_keywords
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId, finalSku, name_en, name_bn || name_en, slug,
        short_description_en || null, short_description_bn || null,
        description_en || null, description_bn || null,
        category_id, subcategory_id || null, brand || 'SHOPNOVA',
        regular, sale, discount,
        stock, stock, Number(low_stock_threshold || 5),
        thumbnail, Number(weight || 0.3),
        is_featured ? 1 : 0, is_bestseller ? 1 : 0, is_new_arrival ? 1 : 0, is_flash_sale ? 1 : 0,
        tags || '', seo_title || name_en, seo_description || short_description_en || '', seo_keywords || ''
      ]
    );

    // Insert initial opening stock record into inventory history
    if (stock > 0) {
      const histId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      run(
        `INSERT INTO inventory_history (
          id, product_id, change_type, quantity_changed,
          previous_quantity, new_quantity, reference_id, reference_type, reason, created_by
        ) VALUES (?, ?, 'opening', ?, 0, ?, ?, 'opening_stock', 'Initial Opening Stock on Product Creation', ?)`,
        [histId, productId, stock, stock, finalSku, admin.name]
      );
    }

    // Insert images
    const allImages = Array.isArray(images) && images.length > 0 ? images : [thumbnail];
    allImages.forEach((imgUrl: string, idx: number) => {
      run(
        `INSERT INTO product_images (id, product_id, image_url, is_primary, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [`img_${Date.now()}_${idx}`, productId, imgUrl, idx === 0 ? 1 : 0, idx]
      );
    });

    // Insert variants
    if (Array.isArray(variants) && variants.length > 0) {
      variants.forEach((v: any, idx: number) => {
        const varId = `var_${Date.now()}_${idx}`;
        const varSku = v.sku || `${finalSku}-${idx + 1}`;
        run(
          `INSERT INTO product_variants (id, product_id, sku, size, color, color_code, price_adjustment, stock_quantity, image)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [varId, productId, varSku, v.size || null, v.color || null, v.color_code || null, Number(v.price_adjustment || 0), Number(v.stock_quantity || stock), v.image || null]
        );
      });
    }

    logAdminAction(admin.id, admin.name, 'CREATE_PRODUCT', 'product', productId, `Created product: ${name_en} (${finalSku})`, req.ip || '127.0.0.1');

    const created = enrichProduct(queryOne('SELECT * FROM products WHERE id = ?', [productId]));

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product: created
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
});

// 5. PUT /api/products/:id - Update product
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const existing = queryOne('SELECT * FROM products WHERE id = ?', [id]);

    if (!existing) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const {
      name_en,
      name_bn,
      sku,
      category_id,
      subcategory_id,
      brand,
      regular_price,
      sale_price,
      stock_quantity,
      low_stock_threshold,
      thumbnail,
      images = [],
      variants = [],
      short_description_en,
      short_description_bn,
      description_en,
      description_bn,
      weight,
      is_featured,
      is_bestseller,
      is_new_arrival,
      is_flash_sale,
      is_published,
      tags,
      seo_title,
      seo_description,
      seo_keywords
    } = req.body;

    const regular = Number(regular_price ?? existing.regular_price);
    const sale = sale_price !== undefined ? (sale_price ? Number(sale_price) : null) : existing.sale_price;
    const discount = sale && sale < regular ? Math.round(((regular - sale) / regular) * 100) : 0;
    const stock = Number(stock_quantity ?? existing.stock_quantity);
    const updatedOpening = Math.max(0, stock - Number(existing.total_received || 0) + Number(existing.total_delivered || 0) - Number(existing.total_returned || 0));

    run(
      `UPDATE products SET
        name_en = ?, name_bn = ?, sku = ?, category_id = ?, subcategory_id = ?, brand = ?,
        regular_price = ?, sale_price = ?, discount_percentage = ?, opening_stock = ?, stock_quantity = ?, low_stock_threshold = ?,
        thumbnail = ?, short_description_en = ?, short_description_bn = ?, description_en = ?, description_bn = ?,
        weight = ?, is_featured = ?, is_bestseller = ?, is_new_arrival = ?, is_flash_sale = ?, is_published = ?,
        tags = ?, seo_title = ?, seo_description = ?, seo_keywords = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name_en || existing.name_en,
        name_bn || existing.name_bn,
        sku || existing.sku,
        category_id || existing.category_id,
        subcategory_id !== undefined ? (subcategory_id || null) : existing.subcategory_id,
        brand || existing.brand,
        regular,
        sale,
        discount,
        updatedOpening,
        stock,
        Number(low_stock_threshold ?? existing.low_stock_threshold),
        thumbnail || existing.thumbnail,
        short_description_en ?? existing.short_description_en,
        short_description_bn ?? existing.short_description_bn,
        description_en ?? existing.description_en,
        description_bn ?? existing.description_bn,
        Number(weight ?? existing.weight),
        is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
        is_bestseller !== undefined ? (is_bestseller ? 1 : 0) : existing.is_bestseller,
        is_new_arrival !== undefined ? (is_new_arrival ? 1 : 0) : existing.is_new_arrival,
        is_flash_sale !== undefined ? (is_flash_sale ? 1 : 0) : existing.is_flash_sale,
        is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published,
        tags ?? existing.tags,
        seo_title ?? existing.seo_title,
        seo_description ?? existing.seo_description,
        seo_keywords ?? existing.seo_keywords,
        id
      ]
    );

    const prevStock = existing.stock_quantity;
    const diffStock = stock - prevStock;

    if (diffStock !== 0) {
      const histId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      run(
        `INSERT INTO inventory_history (
          id, product_id, change_type, quantity_changed,
          previous_quantity, new_quantity, reference_id, reference_type, reason, created_by
        ) VALUES (?, ?, 'product_update', ?, ?, ?, ?, 'product_edit', 'Stock changed via Products Management', ?)`,
        [histId, id, diffStock, prevStock, stock, existing.sku || sku || id, admin.name]
      );
    }
    if (Array.isArray(images)) {
      run('DELETE FROM product_images WHERE product_id = ?', [id]);
      images.forEach((imgUrl: string, idx: number) => {
        if (imgUrl) {
          run(
            `INSERT INTO product_images (id, product_id, image_url, is_primary, sort_order)
             VALUES (?, ?, ?, ?, ?)`,
            [`img_${Date.now()}_${idx}`, id, imgUrl, idx === 0 ? 1 : 0, idx]
          );
        }
      });
    }

    // Update variants if provided
    if (Array.isArray(variants)) {
      run('DELETE FROM product_variants WHERE product_id = ?', [id]);
      variants.forEach((v: any, idx: number) => {
        const varId = v.id || `var_${Date.now()}_${idx}`;
        const varSku = v.sku || `${sku || existing.sku}-${idx + 1}`;
        run(
          `INSERT INTO product_variants (id, product_id, sku, size, color, color_code, price_adjustment, stock_quantity, image)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [varId, id, varSku, v.size || null, v.color || null, v.color_code || null, Number(v.price_adjustment || 0), Number(v.stock_quantity || stock), v.image || null]
        );
      });
    }

    logAdminAction(admin.id, admin.name, 'UPDATE_PRODUCT', 'product', id, `Updated product: ${name_en || existing.name_en}`, req.ip || '127.0.0.1');

    const updated = enrichProduct(queryOne('SELECT * FROM products WHERE id = ?', [id]));

    res.json({
      success: true,
      message: 'Product updated successfully!',
      product: updated
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

// 6. DELETE /api/products/:id - Delete product
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const existing = queryOne<any>('SELECT name_en, sku FROM products WHERE id = ?', [id]);

    if (!existing) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    run('DELETE FROM inventory_history WHERE product_id = ?', [id]);
    run('DELETE FROM product_variants WHERE product_id = ?', [id]);
    run('DELETE FROM product_images WHERE product_id = ?', [id]);
    run('DELETE FROM reviews WHERE product_id = ?', [id]);
    run('DELETE FROM wishlists WHERE product_id = ?', [id]);
    run('DELETE FROM products WHERE id = ?', [id]);

    logAdminAction(admin.id, admin.name, 'DELETE_PRODUCT', 'product', id, `Deleted product: ${existing.name_en} (${existing.sku})`, req.ip || '127.0.0.1');

    res.json({
      success: true,
      message: `Product ${existing.name_en} deleted successfully.`
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

// 7. POST /api/products/:id/duplicate - Duplicate product
router.post('/:id/duplicate', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const orig = queryOne<any>('SELECT * FROM products WHERE id = ?', [id]);

    if (!orig) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSku = `${orig.sku}-COPY-${Math.floor(Math.random() * 1000)}`;
    const newNameEn = `${orig.name_en} (Copy)`;
    const newNameBn = `${orig.name_bn} (কপি)`;
    const newSlug = orig.slug + `-copy-${Date.now()}`;

    run(
      `INSERT INTO products (
        id, sku, name_en, name_bn, slug, short_description_en, short_description_bn,
        description_en, description_bn, category_id, subcategory_id, brand,
        regular_price, sale_price, discount_percentage, stock_quantity, low_stock_threshold,
        thumbnail, weight, is_featured, is_bestseller, is_new_arrival, is_flash_sale,
        is_published, rating, review_count, tags, seo_title, seo_description, seo_keywords
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 5.0, 0, ?, ?, ?, ?)`,
      [
        newId, newSku, newNameEn, newNameBn, newSlug,
        orig.short_description_en, orig.short_description_bn,
        orig.description_en, orig.description_bn,
        orig.category_id, orig.subcategory_id, orig.brand,
        orig.regular_price, orig.sale_price, orig.discount_percentage,
        orig.stock_quantity, orig.low_stock_threshold,
        orig.thumbnail, orig.weight, 0, 0, 1, 0,
        orig.tags, newNameEn, orig.seo_description, orig.seo_keywords
      ]
    );

    // Duplicate images
    const origImages = query<any>('SELECT * FROM product_images WHERE product_id = ?', [id]);
    origImages.forEach((img, idx) => {
      run(
        'INSERT INTO product_images (id, product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)',
        [`img_${Date.now()}_${idx}`, newId, img.image_url, img.is_primary, img.sort_order]
      );
    });

    logAdminAction(admin.id, admin.name, 'DUPLICATE_PRODUCT', 'product', newId, `Duplicated product from ${orig.sku} to ${newSku}`, req.ip || '127.0.0.1');

    const duplicated = enrichProduct(queryOne('SELECT * FROM products WHERE id = ?', [newId]));

    res.status(201).json({
      success: true,
      message: 'Product duplicated successfully as unpublished draft.',
      product: duplicated
    });
  } catch (error) {
    console.error('Duplicate product error:', error);
    res.status(500).json({ success: false, message: 'Failed to duplicate product.' });
  }
});

// 8. POST /api/products/bulk - Bulk Operations
router.post('/bulk', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { action, ids = [], payload } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, message: 'No product IDs provided.' });
      return;
    }

    const placeholders = ids.map(() => '?').join(',');

    switch (action) {
      case 'publish':
        run(`UPDATE products SET is_published = 1 WHERE id IN (${placeholders})`, ids);
        break;
      case 'unpublish':
        run(`UPDATE products SET is_published = 0 WHERE id IN (${placeholders})`, ids);
        break;
      case 'delete':
        run(`DELETE FROM product_variants WHERE product_id IN (${placeholders})`, ids);
        run(`DELETE FROM product_images WHERE product_id IN (${placeholders})`, ids);
        run(`DELETE FROM products WHERE id IN (${placeholders})`, ids);
        break;
      case 'change_category':
        if (payload?.category_id) {
          run(`UPDATE products SET category_id = ? WHERE id IN (${placeholders})`, [payload.category_id, ...ids]);
        }
        break;
      case 'adjust_price_percent':
        if (payload?.percent) {
          const factor = 1 + Number(payload.percent) / 100;
          run(`UPDATE products SET regular_price = ROUND(regular_price * ${factor}, 0) WHERE id IN (${placeholders})`, ids);
        }
        break;
      default:
        res.status(400).json({ success: false, message: 'Invalid bulk action.' });
        return;
    }

    logAdminAction(admin.id, admin.name, 'BULK_ACTION_PRODUCTS', 'product', null, `Bulk action ${action} performed on ${ids.length} products`, req.ip || '127.0.0.1');

    res.json({
      success: true,
      message: `Bulk action "${action}" successfully executed on ${ids.length} products.`
    });
  } catch (error) {
    console.error('Bulk product error:', error);
    res.status(500).json({ success: false, message: 'Failed to perform bulk action.' });
  }
});

// 9. POST /api/products/clear-demo-products - Remove all default/sample demo products in 1 click
router.post('/clear-demo-products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    
    // Select all demo products (either flagged as is_demo = 1 or matching initial demo IDs)
    const demoProducts = query<{ id: string; name_en: string }>(
      `SELECT id, name_en FROM products WHERE is_demo = 1 OR id LIKE 'prod_men_%' OR id LIKE 'prod_w_%' OR id LIKE 'prod_k_%' OR id LIKE 'prod_wat_%' OR id LIKE 'prod_gad_%'`
    );

    if (demoProducts.length === 0) {
      res.json({
        success: true,
        message: 'কোনো ডেমো পণ্য খুঁজে পাওয়া যায়নি। আপনার স্টোরে এখন কেবল নিজস্ব পণ্য রয়েছে।',
        deleted_count: 0
      });
      return;
    }

    const demoIds = demoProducts.map(p => p.id);
    const placeholders = demoIds.map(() => '?').join(',');

    run(`DELETE FROM inventory_history WHERE product_id IN (${placeholders})`, demoIds);
    run(`DELETE FROM product_variants WHERE product_id IN (${placeholders})`, demoIds);
    run(`DELETE FROM product_images WHERE product_id IN (${placeholders})`, demoIds);
    run(`DELETE FROM reviews WHERE product_id IN (${placeholders})`, demoIds);
    run(`DELETE FROM wishlists WHERE product_id IN (${placeholders})`, demoIds);
    run(`DELETE FROM products WHERE id IN (${placeholders})`, demoIds);

    logAdminAction(
      admin.id,
      admin.name,
      'CLEAR_DEMO_PRODUCTS',
      'product',
      null,
      `Removed ${demoIds.length} sample demo products cleanly to keep store strictly authentic`,
      req.ip || '127.0.0.1'
    );

    res.json({
      success: true,
      message: `সাফল্যের সাথে ${demoIds.length}টি ডেমো পণ্য মুছে ফেলা হয়েছে। আপনার আপলোড করা নিজস্ব পণ্য ১০০% নিরাপদ ও অপরিবর্তিত রয়েছে।`,
      deleted_count: demoIds.length
    });
  } catch (error) {
    console.error('Clear demo products error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear demo products.' });
  }
});

export default router;
