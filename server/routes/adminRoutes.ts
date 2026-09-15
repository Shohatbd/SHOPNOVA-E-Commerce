import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne, run, getDb, saveDatabase } from '../db/db.ts';
import { requireAdmin, AuthenticatedRequest, logAdminAction } from '../auth.ts';

const router = express.Router();

// 0. GET /api/admin/dashboard - Core Admin Dashboard KPI Metrics & Trends
router.get('/dashboard', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const totalRevRow = queryOne<{ total: number }>(
      `SELECT COALESCE(SUM(grand_total), 0) as total FROM orders WHERE payment_status = 'paid' OR order_status NOT IN ('cancelled', 'refunded')`
    );
    const totalOrdersRow = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders');
    const pendingOrdersRow = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM orders WHERE order_status = 'pending'");
    const customersCountRow = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE role_id = 'customer'");

    const lowStockRow = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM products WHERE stock_quantity <= low_stock_threshold AND stock_quantity > 0');
    const outOfStockRow = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM products WHERE stock_quantity = 0');

    // Today's stats (using ISO date substring or SQLite date)
    const todayStr = new Date().toISOString().split('T')[0];
    const todayStats = queryOne<{ revenue: number; orders: number }>(
      `SELECT COALESCE(SUM(grand_total), 0) as revenue, COUNT(*) as orders FROM orders WHERE created_at LIKE ?`,
      [`${todayStr}%`]
    );

    const metrics = {
      total_revenue: totalRevRow?.total || 0,
      today_revenue: todayStats?.revenue || 0,
      today_orders: todayStats?.orders || 0,
      total_orders: totalOrdersRow?.count || 0,
      pending_orders: pendingOrdersRow?.count || 0,
      total_customers: customersCountRow?.count || 0,
      low_stock_count: lowStockRow?.count || 0,
      out_of_stock_count: outOfStockRow?.count || 0
    };

    // Top selling products
    const topProducts = query(
      `SELECT p.id, p.name_en, p.name_bn, p.sku, p.thumbnail, p.stock_quantity, p.regular_price, p.sale_price,
              COALESCE(SUM(oi.quantity), 0) as units_sold,
              COALESCE(SUM(oi.total_price), 0) as total_revenue
       FROM products p
       LEFT JOIN order_items oi ON p.id = oi.product_id
       GROUP BY p.id
       ORDER BY units_sold DESC
       LIMIT 6`
    );

    // 7-day sales trend
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      const dayRow = queryOne<{ rev: number; count: number }>(
        `SELECT COALESCE(SUM(grand_total), 0) as rev, COUNT(*) as count FROM orders WHERE created_at LIKE ?`,
        [`${dateKey}%`]
      );
      salesTrend.push({
        date: dateKey,
        day: dayName,
        revenue: dayRow?.rev || 0,
        orders: dayRow?.count || 0
      });
    }

    res.json({
      success: true,
      metrics,
      topProducts,
      salesTrend
    });
  } catch (error) {
    console.error('Admin dashboard metrics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin dashboard metrics.' });
  }
});

// 1. GET /api/admin/customers - List all registered & ordering customers with spend & order stats
router.get('/customers', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Registered users with their order metrics (including all accounts who placed orders)
    const registeredCustomers = query<any>(
      `SELECT u.id, u.name, u.username, u.email, u.phone, u.role_id, u.created_at,
              COUNT(DISTINCT o.id) as total_orders,
              COALESCE(SUM(CASE WHEN o.payment_status = 'paid' OR o.order_status = 'delivered' THEN o.grand_total ELSE 0 END), 0) as total_spent,
              COALESCE(SUM(CASE WHEN o.order_status = 'delivered' THEN 1 ELSE 0 END), 0) as delivered_orders,
              MAX(o.created_at) as last_order_date
       FROM users u
       LEFT JOIN orders o ON (u.id = o.user_id) 
                          OR (u.email IS NOT NULL AND u.email != '' AND u.email = o.customer_email)
                          OR (u.phone IS NOT NULL AND u.phone != '' AND u.phone = o.customer_phone)
       GROUP BY u.id`
    );

    // 2. Orders from guest customers (who ordered without registering an account)
    const existingPhones = new Set(registeredCustomers.map((c: any) => c.phone).filter(Boolean));
    const existingEmails = new Set(registeredCustomers.map((c: any) => c.email).filter(Boolean));

    const guestOrdersSummary = query<any>(
      `SELECT 
              COALESCE(NULLIF(customer_phone, ''), NULLIF(customer_email, ''), id) as guest_key,
              MAX(customer_phone) as customer_phone,
              MAX(customer_email) as customer_email,
              MAX(customer_name) as customer_name,
              COUNT(id) as total_orders,
              COALESCE(SUM(CASE WHEN payment_status = 'paid' OR order_status = 'delivered' THEN grand_total ELSE 0 END), 0) as total_spent,
              COALESCE(SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END), 0) as delivered_orders,
              MIN(created_at) as created_at,
              MAX(created_at) as last_order_date
       FROM orders
       WHERE user_id IS NULL OR user_id = ''
       GROUP BY COALESCE(NULLIF(customer_phone, ''), NULLIF(customer_email, ''), id)`
    );

    const guestCustomers: any[] = [];
    const seenGuestIds = new Set<string>();

    for (const g of guestOrdersSummary) {
      const cleanPhone = g.customer_phone?.trim() || '';
      const cleanEmail = g.customer_email?.trim() || '';

      if (cleanPhone && existingPhones.has(cleanPhone)) continue;
      if (cleanEmail && existingEmails.has(cleanEmail)) continue;

      const rawId = cleanPhone || cleanEmail || g.guest_key || Math.random().toString();
      const guestId = `guest_${encodeURIComponent(rawId)}`;

      if (seenGuestIds.has(guestId)) continue;
      seenGuestIds.add(guestId);

      guestCustomers.push({
        id: guestId,
        name: g.customer_name || 'Guest Customer',
        username: 'guest_' + (cleanPhone ? cleanPhone.slice(-4) : 'order'),
        email: cleanEmail,
        phone: cleanPhone,
        role_id: 'guest',
        created_at: g.created_at,
        total_orders: g.total_orders,
        total_spent: g.total_spent,
        delivered_orders: g.delivered_orders,
        last_order_date: g.last_order_date,
        is_guest: true
      });
    }

    const allCustomers = [...registeredCustomers, ...guestCustomers].sort(
      (a, b) => (b.total_spent || 0) - (a.total_spent || 0)
    );

    res.json({ success: true, customers: allCustomers });
  } catch (error) {
    console.error('Fetch customers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers.' });
  }
});

// 1.1 POST /api/admin/customers - Create a new customer manually
router.post('/customers', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { name, email, phone, password, role_id } = req.body;

    if (!name || !email) {
      res.status(400).json({ success: false, message: 'Customer name and email are required.' });
      return;
    }

    const existingUser = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      res.status(400).json({ success: false, message: 'A customer with this email already exists.' });
      return;
    }

    const id = `usr_cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const passwordHash = bcrypt.hashSync(password || '12345678', 10);
    const username = email.split('@')[0] + '_' + Math.floor(100 + Math.random() * 900);

    run(
      `INSERT INTO users (id, name, username, email, password_hash, phone, role_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, username, email, passwordHash, phone || '', role_id || 'customer']
    );

    logAdminAction(admin.id, admin.name, 'CREATE_CUSTOMER', 'users', id, `Created new customer account: ${name} (${email})`, req.ip || '127.0.0.1');

    res.json({ success: true, message: 'Customer account created successfully.', id });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ success: false, message: 'Failed to create customer account.' });
  }
});

// 1.2 PUT /api/admin/customers/:id - Update existing customer details
router.put('/customers/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { name, email, phone, password, role_id } = req.body;

    const customer = queryOne<any>('SELECT * FROM users WHERE id = ?', [id]);
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer account not found.' });
      return;
    }

    // Check email conflict
    if (email && email !== customer.email) {
      const emailConflict = queryOne('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (emailConflict) {
        res.status(400).json({ success: false, message: 'This email is already in use by another user.' });
        return;
      }
    }

    const updatedName = name || customer.name;
    const updatedEmail = email || customer.email;
    const updatedPhone = phone !== undefined ? phone : customer.phone;
    const updatedRole = role_id || customer.role_id || 'customer';

    if (password && password.trim().length >= 6) {
      const newHash = bcrypt.hashSync(password.trim(), 10);
      run(
        `UPDATE users SET name = ?, email = ?, phone = ?, role_id = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [updatedName, updatedEmail, updatedPhone, updatedRole, newHash, id]
      );
    } else {
      run(
        `UPDATE users SET name = ?, email = ?, phone = ?, role_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [updatedName, updatedEmail, updatedPhone, updatedRole, id]
      );
    }

    logAdminAction(admin.id, admin.name, 'UPDATE_CUSTOMER', 'users', id, `Updated customer: ${updatedName} (${updatedEmail})`, req.ip || '127.0.0.1');

    res.json({ success: true, message: 'Customer details updated successfully.' });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer.' });
  }
});

// 1.3 DELETE /api/admin/customers/:id - Delete customer account
router.delete('/customers/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;

    if (id === admin.id) {
      res.status(400).json({ success: false, message: 'You cannot delete your own logged-in admin account.' });
      return;
    }

    const customer = queryOne<any>('SELECT * FROM users WHERE id = ?', [id]);
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer account not found.' });
      return;
    }

    if (customer.role_id === 'admin' || customer.role_id === 'super_admin') {
      res.status(400).json({ success: false, message: 'Administrator accounts cannot be deleted from customer list.' });
      return;
    }

    run('DELETE FROM users WHERE id = ?', [id]);
    logAdminAction(admin.id, admin.name, 'DELETE_CUSTOMER', 'users', id, `Deleted customer account: ${customer.name} (${customer.email})`, req.ip || '127.0.0.1');

    res.json({ success: true, message: 'Customer account deleted successfully.' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete customer.' });
  }
});

// 1.4 GET /api/admin/customers/:id/orders - View customer order history
router.get('/customers/:id/orders', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let orders: any[] = [];

    if (id.startsWith('guest_')) {
      const identifier = decodeURIComponent(id.replace('guest_', ''));
      orders = query(
        `SELECT * FROM orders 
         WHERE customer_phone = ? 
            OR customer_email = ? 
            OR REPLACE(customer_phone, ' ', '') = ?
         ORDER BY created_at DESC`,
        [identifier, identifier, identifier.replace(/\s+/g, '')]
      );
    } else {
      const customer = queryOne<any>('SELECT email, phone FROM users WHERE id = ?', [id]);
      const customerEmail = customer?.email || '';
      const customerPhone = customer?.phone || '';

      orders = query(
        `SELECT * FROM orders 
         WHERE user_id = ? 
            OR (customer_email = ? AND customer_email != '') 
            OR (customer_phone = ? AND customer_phone != '') 
         ORDER BY created_at DESC`,
        [id, customerEmail, customerPhone]
      );
    }

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch customer orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer orders.' });
  }
});

// 2. GET /api/admin/inventory - Detailed Live Stock Lifecycle & Ledger Breakdown
router.get('/inventory', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    // Auto-heal / synchronize closing stock with [Opening + Received - Delivered + Returned]
    run(
      `UPDATE products 
       SET stock_quantity = MAX(0, COALESCE(opening_stock, 0) + COALESCE(total_received, 0) - COALESCE(total_delivered, 0) + COALESCE(total_returned, 0))
       WHERE opening_stock IS NOT NULL`
    );

    const inventory = query(
      `SELECT p.id, p.sku, p.name_en, p.name_bn, p.thumbnail,
              COALESCE(p.opening_stock, p.stock_quantity) as opening_stock,
              COALESCE(p.total_received, 0) as total_received,
              COALESCE(p.total_delivered, 0) as total_delivered,
              COALESCE(p.total_returned, 0) as total_returned,
              p.stock_quantity,
              p.low_stock_threshold,
              p.regular_price, p.sale_price, c.name_en as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY COALESCE(c.sort_order, 999) ASC, p.id ASC`
    );

    const history = query(
      `SELECT ih.*, p.name_en as product_name, p.name_bn as product_name_bn, p.sku as product_sku, p.thumbnail as product_thumbnail
       FROM inventory_history ih
       LEFT JOIN products p ON ih.product_id = p.id
       ORDER BY ih.created_at DESC
       LIMIT 100`
    );

    const summaryRow = queryOne<any>(
      `SELECT
        COALESCE(SUM(COALESCE(opening_stock, stock_quantity)), 0) as total_opening_stock,
        COALESCE(SUM(total_received), 0) as total_received,
        COALESCE(SUM(total_delivered), 0) as total_delivered,
        COALESCE(SUM(total_returned), 0) as total_returned,
        COALESCE(SUM(stock_quantity), 0) as total_closing_stock,
        COUNT(CASE WHEN stock_quantity <= low_stock_threshold AND stock_quantity > 0 THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN stock_quantity <= 0 THEN 1 END) as out_of_stock_count
       FROM products`
    );

    res.json({
      success: true,
      inventory,
      history,
      summary: {
        total_opening_stock: summaryRow?.total_opening_stock ?? 0,
        total_received: summaryRow?.total_received ?? 0,
        total_delivered: summaryRow?.total_delivered ?? 0,
        total_returned: summaryRow?.total_returned ?? 0,
        total_closing_stock: summaryRow?.total_closing_stock ?? 0,
        low_stock_count: summaryRow?.low_stock_count ?? 0,
        out_of_stock_count: summaryRow?.out_of_stock_count ?? 0
      }
    });
  } catch (error) {
    console.error('Fetch inventory error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory.' });
  }
});

// 2.1 POST /api/admin/inventory/receive - Stock In / Receive Goods from Supplier or Factory
router.post('/inventory/receive', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { product_id, quantity, supplier_name, challan_no, purchase_cost, notes } = req.body;

    if (!product_id || !quantity || Number(quantity) <= 0) {
      res.status(400).json({ success: false, message: 'Valid Product and Quantity are required.' });
      return;
    }

    const product = queryOne<any>('SELECT * FROM products WHERE id = ?', [product_id]);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const receiveQty = Number(quantity);
    const prevQty = product.stock_quantity;
    const newQty = prevQty + receiveQty;
    const challanRef = challan_no?.trim() || `CHL-${Date.now().toString().slice(-6)}`;

    // Add to closing stock and add to total_received
    run(
      'UPDATE products SET stock_quantity = stock_quantity + ?, total_received = total_received + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [receiveQty, receiveQty, product_id]
    );

    const histId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const reasonText = notes?.trim()
      ? notes.trim()
      : `Goods Received: ${receiveQty} units from ${supplier_name || 'Supplier'} (Challan: ${challanRef})`;

    run(
      `INSERT INTO inventory_history (
        id, product_id, change_type, quantity_changed,
        previous_quantity, new_quantity, reference_id, reference_type, supplier_name, challan_no, reason, created_by
      ) VALUES (?, ?, 'received', ?, ?, ?, ?, 'receive_challan', ?, ?, ?, ?)`,
      [
        histId,
        product_id,
        receiveQty,
        prevQty,
        newQty,
        challanRef,
        supplier_name || 'General Supplier',
        challanRef,
        reasonText,
        admin.name
      ]
    );

    logAdminAction(
      admin.id,
      admin.name,
      'RECEIVE_STOCK',
      'product',
      product_id,
      `Received ${receiveQty} units for ${product.name_en}. (Challan: ${challanRef}, Stock: ${prevQty} -> ${newQty})`,
      req.ip || '127.0.0.1'
    );

    res.json({
      success: true,
      message: `Successfully received ${receiveQty} units into stock.`,
      new_quantity: newQty
    });
  } catch (error) {
    console.error('Receive stock error:', error);
    res.status(500).json({ success: false, message: 'Failed to receive stock.' });
  }
});

// 2.2 POST /api/admin/inventory/return - Process Customer / Courier Return into Closing Stock
router.post('/inventory/return', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { product_id, quantity, order_number, customer_name, reason, notes } = req.body;

    if (!product_id || !quantity || Number(quantity) <= 0) {
      res.status(400).json({ success: false, message: 'Valid Product and Quantity are required.' });
      return;
    }

    const product = queryOne<any>('SELECT * FROM products WHERE id = ?', [product_id]);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const returnQty = Number(quantity);
    const prevQty = product.stock_quantity;
    const newQty = prevQty + returnQty;
    const orderRef = order_number?.trim() || `RET-${Date.now().toString().slice(-6)}`;

    // Add to closing stock and add to total_returned
    run(
      'UPDATE products SET stock_quantity = stock_quantity + ?, total_returned = total_returned + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [returnQty, returnQty, product_id]
    );

    const histId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const returnReason = reason?.trim() || notes?.trim() || `Customer Return added back to closing stock (Order: ${orderRef})`;

    run(
      `INSERT INTO inventory_history (
        id, product_id, change_type, quantity_changed,
        previous_quantity, new_quantity, reference_id, reference_type, reason, created_by
      ) VALUES (?, ?, 'returned', ?, ?, ?, ?, 'customer_return', ?, ?)`,
      [
        histId,
        product_id,
        returnQty,
        prevQty,
        newQty,
        orderRef,
        returnReason,
        admin.name
      ]
    );

    logAdminAction(
      admin.id,
      admin.name,
      'RETURN_STOCK',
      'product',
      product_id,
      `Returned ${returnQty} units for ${product.name_en}. (Order: ${orderRef}, Stock: ${prevQty} -> ${newQty})`,
      req.ip || '127.0.0.1'
    );

    res.json({
      success: true,
      message: `Successfully added ${returnQty} returned units to closing stock.`,
      new_quantity: newQty
    });
  } catch (error) {
    console.error('Return stock error:', error);
    res.status(500).json({ success: false, message: 'Failed to process return.' });
  }
});

// 3. POST /api/admin/inventory/adjust - Stock Adjustment
router.post('/inventory/adjust', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { product_id, variant_id, adjustment_type = 'add', quantity, new_quantity, reason = 'Manual Restock' } = req.body;

    const product = queryOne<any>('SELECT * FROM products WHERE id = ?', [product_id]);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const prevQty = product.stock_quantity;
    let computedNewQty = prevQty;

    if (adjustment_type === 'set' && new_quantity !== undefined) {
      computedNewQty = Math.max(0, Number(new_quantity));
    } else if (adjustment_type === 'set' && quantity !== undefined) {
      computedNewQty = Math.max(0, Number(quantity));
    } else if (adjustment_type === 'remove') {
      computedNewQty = Math.max(0, prevQty - Number(quantity || 0));
    } else {
      // add
      computedNewQty = prevQty + Number(quantity || 0);
    }

    const totalReceived = product.total_received ?? 0;
    const totalDelivered = product.total_delivered ?? 0;
    const totalReturned = product.total_returned ?? 0;
    const newOpening = Math.max(0, computedNewQty - totalReceived + totalDelivered - totalReturned);
    const diff = computedNewQty - prevQty;

    run(
      'UPDATE products SET stock_quantity = ?, opening_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [computedNewQty, newOpening, product_id]
    );

    const histId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    run(
      `INSERT INTO inventory_history (id, product_id, variant_id, change_type, quantity_changed, previous_quantity, new_quantity, reason, created_by)
       VALUES (?, ?, ?, 'manual_adjustment', ?, ?, ?, ?, ?)`,
      [histId, product_id, variant_id || null, diff, prevQty, computedNewQty, reason, admin.name]
    );

    logAdminAction(admin.id, admin.name, 'ADJUST_INVENTORY', 'product', product_id, `Adjusted stock for ${product.name_en} from ${prevQty} to ${computedNewQty}`, req.ip || '127.0.0.1');

    res.json({ success: true, message: 'Stock quantity updated successfully.', new_quantity: computedNewQty });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to adjust stock.' });
  }
});

// 3.1 PUT /api/admin/inventory/quick-edit - Direct Stock & Price Quick Edit
router.put('/inventory/quick-edit', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { product_id, opening_stock, stock_quantity, low_stock_threshold, regular_price, sale_price, sku } = req.body;

    const product = queryOne<any>('SELECT * FROM products WHERE id = ?', [product_id]);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const prevQty = product.stock_quantity;
    const prevOpening = product.opening_stock ?? product.stock_quantity;
    const totalReceived = product.total_received ?? 0;
    const totalDelivered = product.total_delivered ?? 0;
    const totalReturned = product.total_returned ?? 0;

    let finalOpening = prevOpening;
    let finalClosing = prevQty;

    if (opening_stock !== undefined && Number(opening_stock) !== prevOpening) {
      finalOpening = Math.max(0, Number(opening_stock));
      finalClosing = Math.max(0, finalOpening + totalReceived - totalDelivered + totalReturned);
    } else if (stock_quantity !== undefined && Number(stock_quantity) !== prevQty) {
      finalClosing = Math.max(0, Number(stock_quantity));
      finalOpening = Math.max(0, finalClosing - totalReceived + totalDelivered - totalReturned);
    } else if (opening_stock !== undefined) {
      finalOpening = Math.max(0, Number(opening_stock));
      finalClosing = Math.max(0, finalOpening + totalReceived - totalDelivered + totalReturned);
    }

    const diff = finalClosing - prevQty;

    run(
      `UPDATE products SET
        stock_quantity = ?,
        opening_stock = ?,
        low_stock_threshold = COALESCE(?, low_stock_threshold),
        regular_price = COALESCE(?, regular_price),
        sale_price = ?,
        sku = COALESCE(?, sku),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        finalClosing,
        finalOpening,
        low_stock_threshold !== undefined ? Number(low_stock_threshold) : null,
        regular_price !== undefined ? Number(regular_price) : null,
        sale_price !== undefined && sale_price !== '' && sale_price !== null ? Number(sale_price) : null,
        sku || null,
        product_id
      ]
    );

    if (diff !== 0) {
      const histId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      run(
        `INSERT INTO inventory_history (id, product_id, change_type, quantity_changed, previous_quantity, new_quantity, reason, created_by)
         VALUES (?, ?, 'quick_edit', ?, ?, ?, 'Direct Inventory Quick Edit', ?)`,
        [histId, product_id, diff, prevQty, finalClosing, admin.name]
      );
    }

    logAdminAction(admin.id, admin.name, 'EDIT_INVENTORY', 'product', product_id, `Quick edited stock & pricing for ${product.name_en}`, req.ip || '127.0.0.1');

    res.json({ success: true, message: 'Inventory item updated successfully.', stock_quantity: finalClosing, opening_stock: finalOpening });
  } catch (error) {
    console.error('Inventory quick edit error:', error);
    res.status(500).json({ success: false, message: 'Failed to update inventory item.' });
  }
});

// 3.2 DELETE /api/admin/inventory/logs/:id - Delete single inventory log
router.delete('/inventory/logs/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    run('DELETE FROM inventory_history WHERE id = ?', [id]);
    logAdminAction(admin.id, admin.name, 'DELETE_INVENTORY_LOG', 'inventory_history', id, 'Deleted inventory history record', req.ip || '127.0.0.1');
    res.json({ success: true, message: 'Inventory log deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete inventory log.' });
  }
});

// 3.3 DELETE /api/admin/inventory/logs - Clear all inventory logs
router.delete('/inventory/logs', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    run('DELETE FROM inventory_history');
    logAdminAction(admin.id, admin.name, 'CLEAR_INVENTORY_LOGS', 'inventory_history', 'all', 'Cleared all inventory logs', req.ip || '127.0.0.1');
    res.json({ success: true, message: 'All inventory logs cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear inventory logs.' });
  }
});

// 4. GET /api/admin/logs - Admin Audit Logs
router.get('/logs', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    // Automatically purge audit logs older than 7 days
    run("DELETE FROM admin_logs WHERE created_at < datetime('now', '-7 days')");
    const logs = query('SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 200');
    res.json({ success: true, logs, retentionDays: 7 });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
});

// 4.1 DELETE /api/admin/logs/cleanup - Manually purge logs older than 7 days
router.post('/logs/cleanup', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const days = parseInt(req.body.days || '7', 10);
    const result = run(`DELETE FROM admin_logs WHERE created_at < datetime('now', '-${days} days')`);
    logAdminAction(admin.id, admin.name, 'PURGE_OLD_AUDIT_LOGS', 'admin_logs', 'all', `Purged audit logs older than ${days} days`, req.ip || '127.0.0.1');
    res.json({ success: true, message: `Successfully cleaned up audit logs older than ${days} days.`, changes: result.changes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cleanup old audit logs.' });
  }
});

// 4.2 DELETE /api/admin/logs/:id - Delete single audit log
router.delete('/logs/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    run('DELETE FROM admin_logs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Audit log deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete audit log.' });
  }
});

// =========================================================================
// 5. STORE DATA BACKUP & EXPORT ENDPOINTS
// =========================================================================

// 5.1 GET /api/admin/backup/summary - Get overview of all store data available for backup
router.get('/backup/summary', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const productsCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM products')?.count || 0;
    const categoriesCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM categories')?.count || 0;
    const subcategoriesCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM subcategories')?.count || 0;
    const ordersCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders')?.count || 0;
    const bannersCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM banners')?.count || 0;
    const couponsCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM coupons')?.count || 0;
    const reviewsCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM reviews')?.count || 0;
    const usersCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users')?.count || 0;
    const settingsRow = queryOne<{ updated_at: string }>('SELECT updated_at FROM site_settings ORDER BY updated_at DESC LIMIT 1');

    res.json({
      success: true,
      summary: {
        products_count: productsCount,
        categories_count: categoriesCount,
        subcategories_count: subcategoriesCount,
        orders_count: ordersCount,
        banners_count: bannersCount,
        coupons_count: couponsCount,
        reviews_count: reviewsCount,
        users_count: usersCount,
        last_settings_update: settingsRow?.updated_at || new Date().toISOString(),
        exported_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Backup summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate store summary.' });
  }
});

// 5.2 GET /api/admin/backup/export-json - Download full store data as structured JSON backup
router.get('/backup/export-json', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const siteSettings = query('SELECT * FROM site_settings');
    const categories = query('SELECT * FROM categories');
    const subcategories = query('SELECT * FROM subcategories');
    const products = query('SELECT * FROM products');
    const productVariants = query('SELECT * FROM product_variants');
    const productImages = query('SELECT * FROM product_images');
    const banners = query('SELECT * FROM banners');
    const coupons = query('SELECT * FROM coupons');
    const shippingMethods = query('SELECT * FROM shipping_methods');
    const orders = query('SELECT * FROM orders');
    const orderItems = query('SELECT * FROM order_items');
    const payments = query('SELECT * FROM payments');
    const reviews = query('SELECT * FROM reviews');
    const courierShipments = query('SELECT * FROM courier_shipments');
    const contactMessages = query('SELECT * FROM contact_messages');

    const backupPayload = {
      version: '2.0',
      system: 'SHOPHATBD E-Commerce Store Engine',
      exported_at: new Date().toISOString(),
      exported_by: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      },
      data: {
        site_settings: siteSettings,
        categories,
        subcategories,
        products,
        product_variants: productVariants,
        product_images: productImages,
        banners,
        coupons,
        shipping_methods: shippingMethods,
        orders,
        order_items: orderItems,
        payments,
        reviews,
        courier_shipments: courierShipments,
        contact_messages: contactMessages
      }
    };

    logAdminAction(admin.id, admin.name, 'EXPORT_STORE_DATA', 'system', 'all', 'Downloaded complete store JSON backup', req.ip || '127.0.0.1');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `shophatbd_store_backup_${timestamp}.json`;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(backupPayload, null, 2));
  } catch (error) {
    console.error('JSON Export error:', error);
    res.status(500).json({ success: false, message: 'Failed to export store data.' });
  }
});

// 5.3 GET /api/admin/backup/export-db - Download raw SQLite database binary
router.get('/backup/export-db', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const db = getDb();
    const data = db.export();
    const buffer = Buffer.from(data);

    logAdminAction(admin.id, admin.name, 'EXPORT_DATABASE_BINARY', 'database', 'sqlite', 'Downloaded full SQLite shopnova.db file', req.ip || '127.0.0.1');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `shophatbd_database_${timestamp}.db`;

    res.setHeader('Content-Type', 'application/x-sqlite3');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.end(buffer);
  } catch (error) {
    console.error('DB file export error:', error);
    res.status(500).json({ success: false, message: 'Failed to export database binary.' });
  }
});

// 5.4 GET /api/admin/backup/export-products-csv - Download products catalog as CSV spreadsheet
router.get('/backup/export-products-csv', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const products = query<any>(`
      SELECT p.id, p.name_en, p.name_bn, p.sku, p.regular_price, p.sale_price,
             p.stock_quantity, p.category_id, c.name_en as category_name,
             p.is_featured, p.is_published, p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);

    // Build CSV
    const headers = ['Product ID', 'Name (English)', 'Name (Bangla)', 'SKU', 'Regular Price', 'Sale Price', 'Stock Qty', 'Category', 'Featured', 'Published', 'Created Date'];
    const rows = products.map((p: any) => [
      `"${String(p.id || '').replace(/"/g, '""')}"`,
      `"${String(p.name_en || '').replace(/"/g, '""')}"`,
      `"${String(p.name_bn || '').replace(/"/g, '""')}"`,
      `"${String(p.sku || '').replace(/"/g, '""')}"`,
      p.regular_price || 0,
      p.sale_price || 0,
      p.stock_quantity || 0,
      `"${String(p.category_name || p.category_id || '').replace(/"/g, '""')}"`,
      p.is_featured ? 'Yes' : 'No',
      p.is_published !== 0 ? 'Yes' : 'No',
      `"${String(p.created_at || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    logAdminAction(admin.id, admin.name, 'EXPORT_PRODUCTS_CSV', 'products', 'csv', 'Downloaded products catalog spreadsheet', req.ip || '127.0.0.1');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `shophatbd_products_${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    console.error('CSV Export error:', error);
    res.status(500).json({ success: false, message: 'Failed to export products CSV.' });
  }
});

// 5.5 POST /api/admin/backup/restore-json - Restore store data from uploaded JSON backup
router.post('/backup/restore-json', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { backup } = req.body;

    if (!backup || !backup.data) {
      return res.status(400).json({ success: false, message: 'Invalid backup file format.' });
    }

    const { data } = backup;

    // Restore Settings
    const settingsData = data.site_settings || data.settings;
    if (Array.isArray(settingsData) && settingsData.length > 0) {
      for (const item of settingsData) {
        if (item.key && item.value !== undefined) {
          run(
            `INSERT OR REPLACE INTO site_settings (id, key, value, updated_at)
             VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            [item.id || `st_${item.key}`, item.key, String(item.value)]
          );
        } else if (typeof item === 'object') {
          for (const [k, v] of Object.entries(item)) {
            if (k !== 'id' && k !== 'updated_at' && v !== undefined) {
              run(
                `INSERT OR REPLACE INTO site_settings (id, key, value, updated_at)
                 VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                [`st_${k}`, k, String(v)]
              );
            }
          }
        }
      }
    } else if (settingsData && typeof settingsData === 'object') {
      for (const [k, v] of Object.entries(settingsData)) {
        if (k !== 'id' && k !== 'updated_at' && v !== undefined) {
          run(
            `INSERT OR REPLACE INTO site_settings (id, key, value, updated_at)
             VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            [`st_${k}`, k, String(v)]
          );
        }
      }
    }

    // Restore Categories
    if (Array.isArray(data.categories) && data.categories.length > 0) {
      for (const cat of data.categories) {
        run(
          `INSERT OR REPLACE INTO categories (id, name_en, name_bn, slug, description_en, description_bn, image, icon, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            cat.id, cat.name_en, cat.name_bn, cat.slug,
            cat.description_en || '', cat.description_bn || '',
            cat.image || '', cat.icon || '',
            cat.sort_order || cat.display_order || 0,
            cat.is_active !== undefined ? (cat.is_active ? 1 : 0) : 1
          ]
        );
      }
    }

    // Restore Subcategories
    if (Array.isArray(data.subcategories) && data.subcategories.length > 0) {
      for (const sub of data.subcategories) {
        run(
          `INSERT OR REPLACE INTO subcategories (id, category_id, name_en, name_bn, slug, is_active)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            sub.id, sub.category_id, sub.name_en, sub.name_bn, sub.slug,
            sub.is_active !== undefined ? (sub.is_active ? 1 : 0) : 1
          ]
        );
      }
    }

    // Restore Products
    if (Array.isArray(data.products) && data.products.length > 0) {
      for (const prod of data.products) {
        run(
          `INSERT OR REPLACE INTO products
           (id, sku, name_en, name_bn, slug, short_description_en, short_description_bn, description_en, description_bn, category_id, subcategory_id, brand, regular_price, sale_price, discount_percentage, opening_stock, total_received, total_delivered, total_returned, stock_quantity, low_stock_threshold, thumbnail, video_url, weight, is_featured, is_bestseller, is_new_arrival, is_flash_sale, flash_sale_end, is_published, rating, review_count, tags, seo_title, seo_description, seo_keywords, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            prod.id,
            prod.sku || `SKU-${prod.id}`,
            prod.name_en,
            prod.name_bn || prod.name_en,
            prod.slug,
            prod.short_description_en || '',
            prod.short_description_bn || '',
            prod.description_en || '',
            prod.description_bn || '',
            prod.category_id,
            prod.subcategory_id || null,
            prod.brand || '',
            Number(prod.regular_price) || 0,
            prod.sale_price !== null && prod.sale_price !== undefined ? Number(prod.sale_price) : null,
            Number(prod.discount_percentage) || 0,
            Number(prod.opening_stock) || 0,
            Number(prod.total_received) || 0,
            Number(prod.total_delivered) || 0,
            Number(prod.total_returned) || 0,
            Number(prod.stock_quantity) || 0,
            Number(prod.low_stock_threshold) || 5,
            prod.thumbnail || '',
            prod.video_url || '',
            prod.weight || null,
            prod.is_featured ? 1 : 0,
            prod.is_bestseller ? 1 : 0,
            prod.is_new_arrival ? 1 : 0,
            prod.is_flash_sale ? 1 : 0,
            prod.flash_sale_end || null,
            prod.is_published !== undefined ? (prod.is_published ? 1 : 0) : 1,
            Number(prod.rating) || 5.0,
            Number(prod.review_count) || 0,
            prod.tags || '',
            prod.seo_title || '',
            prod.seo_description || '',
            prod.seo_keywords || '',
            prod.created_at || new Date().toISOString(),
            prod.updated_at || new Date().toISOString()
          ]
        );
      }
    }

    // Restore Product Variants
    if (Array.isArray(data.product_variants) && data.product_variants.length > 0) {
      for (const v of data.product_variants) {
        run(
          `INSERT OR REPLACE INTO product_variants (id, product_id, sku, size, color, color_code, price_adjustment, stock_quantity, image, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            v.id,
            v.product_id,
            v.sku || null,
            v.size || null,
            v.color || v.color_name || null,
            v.color_code || null,
            Number(v.price_adjustment || v.additional_price || 0),
            Number(v.stock_quantity || 0),
            v.image || null,
            v.is_active !== undefined ? (v.is_active ? 1 : 0) : 1
          ]
        );
      }
    }

    // Restore Banners
    if (Array.isArray(data.banners) && data.banners.length > 0) {
      for (const b of data.banners) {
        run(
          `INSERT OR REPLACE INTO banners (id, title_en, title_bn, subtitle_en, subtitle_bn, image_url, button_text_en, button_text_bn, button_link, badge_en, badge_bn, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            b.id,
            b.title_en,
            b.title_bn,
            b.subtitle_en || '',
            b.subtitle_bn || '',
            b.image_url,
            b.button_text_en || 'Shop Now',
            b.button_text_bn || 'এখনই কিনুন',
            b.button_link || b.target_url || '/shop',
            b.badge_en || '',
            b.badge_bn || '',
            Number(b.sort_order || b.display_order || 0),
            b.is_active !== undefined ? (b.is_active ? 1 : 0) : 1
          ]
        );
      }
    }

    // Restore Coupons
    if (Array.isArray(data.coupons) && data.coupons.length > 0) {
      for (const c of data.coupons) {
        run(
          `INSERT OR REPLACE INTO coupons (id, code, description_en, description_bn, discount_type, discount_value, min_order_amount, max_discount_amount, start_date, end_date, usage_limit, used_count, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            c.id,
            c.code,
            c.description_en || '',
            c.description_bn || '',
            c.discount_type || 'percentage',
            Number(c.discount_value || 0),
            Number(c.min_order_amount || 0),
            c.max_discount_amount ? Number(c.max_discount_amount) : null,
            c.start_date || null,
            c.end_date || null,
            Number(c.usage_limit || 100),
            Number(c.used_count || 0),
            c.is_active !== undefined ? (c.is_active ? 1 : 0) : 1
          ]
        );
      }
    }

    // Restore Shipping Methods
    if (Array.isArray(data.shipping_methods) && data.shipping_methods.length > 0) {
      for (const sm of data.shipping_methods) {
        run(
          `INSERT OR REPLACE INTO shipping_methods (id, name_en, name_bn, description_en, description_bn, cost, estimated_days, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sm.id,
            sm.name_en,
            sm.name_bn || sm.name_en,
            sm.description_en || '',
            sm.description_bn || '',
            Number(sm.cost || 0),
            sm.estimated_days || '2-3 days',
            sm.is_active !== undefined ? (sm.is_active ? 1 : 0) : 1
          ]
        );
      }
    }

    // Restore Product Images
    if (Array.isArray(data.product_images) && data.product_images.length > 0) {
      for (const img of data.product_images) {
        run(
          `INSERT OR REPLACE INTO product_images (id, product_id, image_url, is_primary, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [
            img.id,
            img.product_id,
            img.image_url,
            img.is_primary ? 1 : 0,
            Number(img.sort_order || 0)
          ]
        );
      }
    }

    // Restore Orders
    if (Array.isArray(data.orders) && data.orders.length > 0) {
      for (const ord of data.orders) {
        run(
          `INSERT OR REPLACE INTO orders (id, order_number, user_id, customer_name, customer_phone, customer_email, shipping_address, shipping_city, shipping_area, shipping_postal_code, subtotal, discount_amount, coupon_code, shipping_cost, tax_amount, grand_total, payment_method, payment_status, order_status, courier_name, tracking_id, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ord.id,
            ord.order_number,
            ord.user_id || null,
            ord.customer_name,
            ord.customer_phone,
            ord.customer_email || null,
            ord.shipping_address,
            ord.shipping_city || 'Dhaka',
            ord.shipping_area || null,
            ord.shipping_postal_code || null,
            Number(ord.subtotal || 0),
            Number(ord.discount_amount || 0),
            ord.coupon_code || null,
            Number(ord.shipping_cost || 0),
            Number(ord.tax_amount || 0),
            Number(ord.grand_total || 0),
            ord.payment_method || 'cod',
            ord.payment_status || 'pending',
            ord.order_status || 'pending',
            ord.courier_name || null,
            ord.tracking_id || null,
            ord.notes || null,
            ord.created_at || new Date().toISOString(),
            ord.updated_at || new Date().toISOString()
          ]
        );
      }
    }

    // Restore Order Items
    if (Array.isArray(data.order_items) && data.order_items.length > 0) {
      for (const it of data.order_items) {
        run(
          `INSERT OR REPLACE INTO order_items (id, order_id, product_id, variant_id, product_name_en, product_name_bn, sku, size, color, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            it.id,
            it.order_id,
            it.product_id,
            it.variant_id || null,
            it.product_name_en,
            it.product_name_bn || it.product_name_en,
            it.sku || null,
            it.size || null,
            it.color || null,
            Number(it.quantity || 1),
            Number(it.unit_price || 0),
            Number(it.total_price || (it.unit_price * it.quantity))
          ]
        );
      }
    }

    // Restore Payments
    if (Array.isArray(data.payments) && data.payments.length > 0) {
      for (const pm of data.payments) {
        run(
          `INSERT OR REPLACE INTO payments (id, order_id, user_id, amount, payment_method, status, transaction_id, payment_details, paid_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pm.id,
            pm.order_id,
            pm.user_id || null,
            Number(pm.amount || 0),
            pm.payment_method || 'cod',
            pm.status || 'pending',
            pm.transaction_id || null,
            pm.payment_details || null,
            pm.paid_at || null,
            pm.created_at || new Date().toISOString()
          ]
        );
      }
    }

    // Restore Reviews
    if (Array.isArray(data.reviews) && data.reviews.length > 0) {
      for (const rv of data.reviews) {
        run(
          `INSERT OR REPLACE INTO reviews (id, product_id, user_id, rating, comment, is_approved, is_verified_purchase, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            rv.id,
            rv.product_id,
            rv.user_id || null,
            Number(rv.rating || 5),
            rv.comment || '',
            rv.is_approved !== undefined ? (rv.is_approved ? 1 : 0) : 1,
            rv.is_verified_purchase !== undefined ? (rv.is_verified_purchase ? 1 : 0) : 1,
            rv.created_at || new Date().toISOString()
          ]
        );
      }
    }

    // Restore Courier Shipments
    if (Array.isArray(data.courier_shipments) && data.courier_shipments.length > 0) {
      for (const cs of data.courier_shipments) {
        run(
          `INSERT OR REPLACE INTO courier_shipments (id, order_id, courier_name, consignment_id, tracking_id, shipping_status, delivery_fee, courier_notes, dispatched_at, delivered_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            cs.id,
            cs.order_id,
            cs.courier_name,
            cs.consignment_id || null,
            cs.tracking_id || null,
            cs.shipping_status || 'in_transit',
            Number(cs.delivery_fee || 0),
            cs.courier_notes || null,
            cs.dispatched_at || new Date().toISOString(),
            cs.delivered_at || null
          ]
        );
      }
    }

    // Restore Contact Messages
    if (Array.isArray(data.contact_messages) && data.contact_messages.length > 0) {
      for (const cm of data.contact_messages) {
        run(
          `INSERT OR REPLACE INTO contact_messages (id, name, email, phone, subject, message, status, admin_notes, ip_address, created_at, replied_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            cm.id,
            cm.name,
            cm.email || null,
            cm.phone || null,
            cm.subject || null,
            cm.message,
            cm.status || 'unread',
            cm.admin_notes || null,
            cm.ip_address || null,
            cm.created_at || new Date().toISOString(),
            cm.replied_at || null
          ]
        );
      }
    }

    saveDatabase();
    logAdminAction(admin.id, admin.name, 'RESTORE_STORE_DATA', 'system', 'all', 'Restored store data from JSON backup file', req.ip || '127.0.0.1');

    res.json({
      success: true,
      message: 'Store data successfully restored from backup.'
    });
  } catch (error) {
    console.error('JSON restore error:', error);
    res.status(500).json({ success: false, message: 'Failed to restore store data from backup.' });
  }
});

export default router;

