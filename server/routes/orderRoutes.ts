import express, { Request, Response } from 'express';
import { query, queryOne, run } from '../db/db.ts';
import { authenticateToken, requireAdmin, AuthenticatedRequest, logAdminAction } from '../auth.ts';
import { sendMetaCapiEvent } from '../utils/metaCapi.ts';
import { sendOrderPlacedSms, sendOrderStatusSms } from '../utils/smsService.ts';

const router = express.Router();

function enrichOrder(order: any) {
  if (!order) return null;
  const items = query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
  const payment = queryOne('SELECT * FROM payments WHERE order_id = ?', [order.id]);
  const shipment = queryOne('SELECT * FROM courier_shipments WHERE order_id = ?', [order.id]);
  return {
    ...order,
    items,
    payment,
    shipment
  };
}

// 1. POST /api/orders - Create new order
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      shipping_city,
      shipping_area,
      shipping_postal_code,
      items,
      coupon_code,
      payment_method = 'cod',
      payment_status,
      transaction_id,
      sender_phone,
      shipping_method_id,
      notes
    } = req.body;

    if (!customer_name || !customer_phone || !shipping_address || !shipping_city) {
      res.status(400).json({ success: false, message: 'Please provide customer name, phone, address, and city.' });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Your cart is empty. Please add items to checkout.' });
      return;
    }

    // Step 1: Validate stock & compute subtotal
    let computedSubtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const product = queryOne<any>('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (!product) {
        res.status(400).json({ success: false, message: `Product ${item.product_id} no longer exists.` });
        return;
      }

      let variant = null;
      if (item.variant_id) {
        variant = queryOne<any>('SELECT * FROM product_variants WHERE id = ?', [item.variant_id]);
        if (!variant) {
          res.status(400).json({ success: false, message: `Selected variant for ${product.name_en} not found.` });
          return;
        }
        if (variant.stock_quantity < item.quantity) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name_en} (${variant.size || variant.color}). Only ${variant.stock_quantity} remaining.`
          });
          return;
        }
      } else {
        if (product.stock_quantity < item.quantity) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name_en}. Only ${product.stock_quantity} left in stock.`
          });
          return;
        }
      }

      const unitPrice = (product.sale_price ?? product.regular_price) + (variant?.price_adjustment ?? 0);
      const totalPrice = unitPrice * item.quantity;
      computedSubtotal += totalPrice;

      validatedItems.push({
        product_id: product.id,
        variant_id: variant?.id || null,
        product_name_en: product.name_en,
        product_name_bn: product.name_bn,
        sku: variant?.sku || product.sku,
        size: variant?.size || null,
        color: variant?.color || null,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        thumbnail: product.thumbnail
      });
    }

    // Step 2: Validate coupon if present
    let discountAmount = 0;
    let validCoupon: any = null;
    if (coupon_code) {
      const coupon = queryOne<any>('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [coupon_code.trim().toUpperCase()]);
      if (coupon && computedSubtotal >= coupon.min_order_amount) {
        validCoupon = coupon;
        if (coupon.discount_type === 'percentage') {
          discountAmount = Math.round((computedSubtotal * coupon.discount_value) / 100);
          if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
            discountAmount = coupon.max_discount_amount;
          }
        } else {
          discountAmount = coupon.discount_value;
        }
      }
    }

    // Step 3: Calculate Shipping
    let shippingCost = 60; // default inside Dhaka
    if (shipping_city.toLowerCase().includes('dhaka')) {
      shippingCost = 60;
    } else {
      shippingCost = 120;
    }

    const freeThreshold = 2500;
    if (computedSubtotal >= freeThreshold) {
      shippingCost = 0; // Free shipping threshold met
    }

    const grandTotal = Math.max(0, computedSubtotal - discountAmount + shippingCost);

    // Step 4: Create Order Record
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const orderNumber = `SN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingId = `PTH-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const authHeader = req.headers['authorization'];
    let authUserId: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Optional authenticated customer
      try {
        const decoded = JSON.parse(Buffer.from(authHeader.split('.')[1], 'base64').toString());
        authUserId = decoded.id || null;
      } catch (e) {}
    }

    // Payment status & Transaction details
    let finalPaymentStatus = 'pending';
    let txId: string | null = null;

    if (payment_method === 'cod') {
      finalPaymentStatus = 'pending';
      txId = null;
    } else {
      // Advance digital payment (bKash, Nagad, Rocket, etc.)
      if (payment_status === 'paid') {
        finalPaymentStatus = 'paid';
      } else {
        // Manual advance payment requires merchant verification
        finalPaymentStatus = 'pending';
      }
      txId = transaction_id ? String(transaction_id).trim().toUpperCase() : `TXN-${payment_method.toUpperCase()}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Build comprehensive notes if advance payment info was provided
    let combinedNotes = notes ? String(notes).trim() : '';
    if (payment_method === 'card') {
      const cardBrand = req.body.card_brand || 'Card';
      const cardLast4 = req.body.card_last4 || '';
      const cardHolder = req.body.card_holder || customer_name;
      const cardNote = `[CARD Payment: ${cardBrand} ${cardLast4 ? `•••• ${cardLast4}` : ''}, Holder: ${cardHolder}, TrxID: ${txId}]`;
      combinedNotes = combinedNotes ? `${combinedNotes} | ${cardNote}` : cardNote;
    } else if (payment_method !== 'cod' && (sender_phone || transaction_id)) {
      const pInfo = `[${payment_method.toUpperCase()} Payment: Sender ${sender_phone || 'N/A'}, TrxID: ${txId}]`;
      combinedNotes = combinedNotes ? `${combinedNotes} | ${pInfo}` : pInfo;
    }

    run(
      `INSERT INTO orders (
        id, order_number, user_id, customer_name, customer_phone, customer_email,
        shipping_address, shipping_city, shipping_area, shipping_postal_code,
        subtotal, discount_amount, coupon_code, shipping_cost, grand_total,
        payment_method, payment_status, order_status, courier_name, tracking_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, orderNumber, authUserId, customer_name.trim(), customer_phone.trim(),
        customer_email?.trim() || null, shipping_address.trim(), shipping_city.trim(),
        shipping_area || null, shipping_postal_code || null,
        computedSubtotal, discountAmount, validCoupon?.code || null, shippingCost, grandTotal,
        payment_method,
        finalPaymentStatus,
        'pending',
        'Pathao Courier',
        trackingId,
        combinedNotes || null
      ]
    );

    // Step 5: Insert Order Items and Decrement Inventory (Track as Delivered/Sold)
    for (const vItem of validatedItems) {
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      run(
        `INSERT INTO order_items (
          id, order_id, product_id, variant_id, product_name_en, product_name_bn,
          sku, size, color, quantity, unit_price, total_price, thumbnail
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId, orderId, vItem.product_id, vItem.variant_id, vItem.product_name_en,
          vItem.product_name_bn, vItem.sku, vItem.size, vItem.color,
          vItem.quantity, vItem.unit_price, vItem.total_price, vItem.thumbnail
        ]
      );

      const prod = queryOne<any>('SELECT stock_quantity FROM products WHERE id = ?', [vItem.product_id]);
      const prevProdStock = prod?.stock_quantity ?? 0;
      const newProdStock = Math.max(0, prevProdStock - vItem.quantity);

      // Decrement product stock and increment total delivered
      run('UPDATE products SET stock_quantity = ?, total_delivered = total_delivered + ? WHERE id = ?', [newProdStock, vItem.quantity, vItem.product_id]);

      // Decrement variant stock if applicable
      if (vItem.variant_id) {
        run('UPDATE product_variants SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ?', [vItem.quantity, vItem.variant_id]);
      }

      // Record in inventory audit ledger
      const histId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      run(
        `INSERT INTO inventory_history (
          id, product_id, variant_id, change_type, quantity_changed,
          previous_quantity, new_quantity, reference_id, reference_type, reason, created_by
        ) VALUES (?, ?, ?, 'delivered', ?, ?, ?, ?, 'order', ?, 'Customer / System')`,
        [
          histId,
          vItem.product_id,
          vItem.variant_id || null,
          -vItem.quantity,
          prevProdStock,
          newProdStock,
          orderNumber,
          `Order #${orderNumber} placed by ${customer_name}`
        ]
      );
    }

    // Step 6: Create Payment Record
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    run(
      `INSERT INTO payments (id, order_id, transaction_id, payment_method, amount, status, paid_at, gateway_response)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paymentId,
        orderId,
        txId,
        payment_method,
        grandTotal,
        finalPaymentStatus,
        finalPaymentStatus === 'paid' ? new Date().toISOString() : null,
        JSON.stringify({
          sender_phone: sender_phone || null,
          transaction_id: txId,
          payment_method,
          verified: finalPaymentStatus === 'paid',
          card_brand: req.body.card_brand || null,
          card_last4: req.body.card_last4 || null,
          card_holder: req.body.card_holder || null,
          account: sender_phone || (req.body.card_last4 ? `Card ending in ${req.body.card_last4}` : 'customer')
        })
      ]
    );

    // Step 7: Create Courier Shipment Record
    const shipmentId = `ship_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    run(
      `INSERT INTO courier_shipments (id, order_id, courier_name, consignment_id, tracking_id, shipping_status, delivery_fee)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [shipmentId, orderId, 'Pathao Courier', `CSG-${orderNumber}`, trackingId, 'in_transit', shippingCost]
    );

    // Update coupon used count
    if (validCoupon) {
      run('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [validCoupon.id]);
    }

    const createdOrder = enrichOrder(queryOne('SELECT * FROM orders WHERE id = ?', [orderId]));

    // Server-side Meta Conversions API (CAPI) Purchase Event (Asynchronous & Deduplicated)
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const clientUserAgent = req.headers['user-agent'] || '';
    sendMetaCapiEvent({
      event_name: 'Purchase',
      event_id: `purchase_${orderNumber}`,
      event_source_url: `${process.env.APP_URL || 'https://shopnova.com'}/order-success/${orderNumber}`,
      user_data: {
        email: customer_email?.trim() || undefined,
        phone: customer_phone?.trim() || undefined,
        first_name: customer_name?.trim()?.split(' ')[0] || undefined,
        last_name: customer_name?.trim()?.split(' ').slice(1).join(' ') || undefined,
        city: shipping_city?.trim() || undefined,
        client_ip_address: clientIp,
        client_user_agent: clientUserAgent
      },
      custom_data: {
        value: grandTotal,
        currency: 'BDT',
        order_id: orderNumber,
        num_items: validatedItems.reduce((sum, item) => sum + item.quantity, 0),
        content_ids: validatedItems.map((item) => item.product_id),
        contents: validatedItems.map((item) => ({
          id: item.product_id,
          quantity: item.quantity,
          item_price: item.unit_price
        }))
      }
    }).catch((err) => console.warn('Meta CAPI purchase background warning:', err));

    // Automated Order Confirmation & Tracking SMS to Customer Phone
    sendOrderPlacedSms({
      id: orderId,
      order_number: orderNumber,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      grand_total: grandTotal,
      tracking_id: trackingId,
      courier_name: 'Pathao Courier'
    }).catch((err) => console.warn('Order SMS background dispatch warning:', err));

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: createdOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order.' });
  }
});

// 2. GET /api/orders/my-orders - Customer order history
router.get('/my-orders', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const rawOrders = query(
      'SELECT * FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC',
      [user.id, user.email]
    );
    const orders = rawOrders.map(enrichOrder);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch your orders.' });
  }
});

// 3. GET /api/orders/track/:query - Public Order Tracking
router.get('/track/:query', (req: Request, res: Response) => {
  try {
    const { query: trackQuery } = req.params;
    const clean = trackQuery.trim();

    const order = queryOne(
      `SELECT * FROM orders
       WHERE order_number = ? OR tracking_id = ? OR customer_phone = ?
       ORDER BY created_at DESC LIMIT 1`,
      [clean, clean, clean]
    );

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'No order found matching this tracking ID, order number, or phone number.'
      });
      return;
    }

    const enriched = enrichOrder(order);
    res.json({ success: true, order: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to track order.' });
  }
});

// 4. GET /api/orders/details/:idOrNumber - Order details
router.get('/details/:idOrNumber', (req: Request, res: Response) => {
  try {
    const { idOrNumber } = req.params;
    const order = queryOne('SELECT * FROM orders WHERE id = ? OR order_number = ?', [idOrNumber, idOrNumber]);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    res.json({ success: true, order: enrichOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
});

// ==================== ADMIN ORDER MANAGEMENT ====================

// 5. GET /api/orders/admin/all - Admin order list with filters & stats
router.get('/admin/all', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search, payment_status, limit = '50', page = '1' } = req.query;

    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ' AND order_status = ?';
      params.push(status);
    }

    if (payment_status && payment_status !== 'all') {
      sql += ' AND payment_status = ?';
      params.push(payment_status);
    }

    if (search) {
      sql += ` AND (
        order_number LIKE ? OR
        customer_name LIKE ? OR
        customer_phone LIKE ? OR
        tracking_id LIKE ?
      )`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY created_at DESC';

    const allMatching = query(sql, params);
    const total = allMatching.length;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const offset = (pageNum - 1) * limitNum;

    sql += ` LIMIT ${limitNum} OFFSET ${offset}`;
    const rawOrders = query(sql, params);
    const orders = rawOrders.map(enrichOrder);

    // Status breakdown counts
    const statusCounts = {
      all: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders')?.count || 0,
      pending: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders WHERE order_status = "pending"')?.count || 0,
      confirmed: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders WHERE order_status = "confirmed"')?.count || 0,
      processing: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders WHERE order_status = "processing"')?.count || 0,
      packed: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders WHERE order_status = "packed"')?.count || 0,
      shipped: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders WHERE order_status = "shipped"')?.count || 0,
      out_for_delivery: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders WHERE order_status = "out_for_delivery"')?.count || 0,
      delivered: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders WHERE order_status = "delivered"')?.count || 0,
      cancelled: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders WHERE order_status = "cancelled"')?.count || 0,
      returned: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders WHERE order_status = "returned"')?.count || 0,
      refunded: queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders WHERE order_status = "refunded"')?.count || 0
    };

    res.json({
      success: true,
      orders,
      statusCounts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Admin fetch orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin orders.' });
  }
});

// 6. PUT /api/orders/admin/:id/status - Update order status
router.put('/admin/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { order_status, status, payment_status, courier_name, tracking_id, notes } = req.body;

    const order = queryOne<any>('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const prevStatus = order.order_status;
    const newStatus = order_status || status || prevStatus;

    // Handle inventory restock if order is being cancelled or returned
    if (newStatus !== prevStatus) {
      const items = query<any>('SELECT * FROM order_items WHERE order_id = ?', [id]);

      if (newStatus === 'returned' && prevStatus !== 'returned') {
        // Product returned: Add back to stock and increment total_returned
        for (const it of items) {
          const prod = queryOne<any>('SELECT stock_quantity FROM products WHERE id = ?', [it.product_id]);
          const prevProdStock = prod?.stock_quantity ?? 0;
          const newProdStock = prevProdStock + it.quantity;

          run('UPDATE products SET stock_quantity = stock_quantity + ?, total_returned = total_returned + ? WHERE id = ?', [it.quantity, it.quantity, it.product_id]);
          if (it.variant_id) {
            run('UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?', [it.quantity, it.variant_id]);
          }

          const histId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          run(
            `INSERT INTO inventory_history (
              id, product_id, variant_id, change_type, quantity_changed,
              previous_quantity, new_quantity, reference_id, reference_type, reason, created_by
            ) VALUES (?, ?, ?, 'returned', ?, ?, ?, ?, 'customer_return', ?, ?)`,
            [
              histId,
              it.product_id,
              it.variant_id || null,
              it.quantity,
              prevProdStock,
              newProdStock,
              order.order_number,
              `Order #${order.order_number} returned by customer (${order.customer_name})`,
              admin.name
            ]
          );
        }
      } else if (newStatus === 'cancelled' && prevStatus !== 'cancelled' && prevStatus !== 'returned') {
        // Order cancelled: Revert delivered quantity and add back to stock
        for (const it of items) {
          const prod = queryOne<any>('SELECT stock_quantity FROM products WHERE id = ?', [it.product_id]);
          const prevProdStock = prod?.stock_quantity ?? 0;
          const newProdStock = prevProdStock + it.quantity;

          run('UPDATE products SET stock_quantity = stock_quantity + ?, total_delivered = MAX(0, total_delivered - ?) WHERE id = ?', [it.quantity, it.quantity, it.product_id]);
          if (it.variant_id) {
            run('UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?', [it.quantity, it.variant_id]);
          }

          const histId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          run(
            `INSERT INTO inventory_history (
              id, product_id, variant_id, change_type, quantity_changed,
              previous_quantity, new_quantity, reference_id, reference_type, reason, created_by
            ) VALUES (?, ?, ?, 'cancelled', ?, ?, ?, ?, 'order_cancel', ?, ?)`,
            [
              histId,
              it.product_id,
              it.variant_id || null,
              it.quantity,
              prevProdStock,
              newProdStock,
              order.order_number,
              `Order #${order.order_number} cancelled`,
              admin.name
            ]
          );
        }
      } else if ((prevStatus === 'cancelled' || prevStatus === 'returned') && (newStatus !== 'cancelled' && newStatus !== 'returned')) {
        // Re-activating a previously cancelled or returned order: Deduct from stock again
        for (const it of items) {
          const prod = queryOne<any>('SELECT stock_quantity FROM products WHERE id = ?', [it.product_id]);
          const prevProdStock = prod?.stock_quantity ?? 0;
          const newProdStock = Math.max(0, prevProdStock - it.quantity);

          if (prevStatus === 'returned') {
            run('UPDATE products SET stock_quantity = ?, total_returned = MAX(0, total_returned - ?) WHERE id = ?', [newProdStock, it.quantity, it.product_id]);
          } else {
            run('UPDATE products SET stock_quantity = ?, total_delivered = total_delivered + ? WHERE id = ?', [newProdStock, it.quantity, it.product_id]);
          }
          if (it.variant_id) {
            run('UPDATE product_variants SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ?', [it.quantity, it.variant_id]);
          }

          const histId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          run(
            `INSERT INTO inventory_history (
              id, product_id, variant_id, change_type, quantity_changed,
              previous_quantity, new_quantity, reference_id, reference_type, reason, created_by
            ) VALUES (?, ?, ?, 'delivered', ?, ?, ?, ?, 'order_reactivated', ?, ?)`,
            [
              histId,
              it.product_id,
              it.variant_id || null,
              -it.quantity,
              prevProdStock,
              newProdStock,
              order.order_number,
              `Order #${order.order_number} status changed back from ${prevStatus} to ${newStatus}`,
              admin.name
            ]
          );
        }
      }
    }

    run(
      `UPDATE orders SET
        order_status = ?,
        payment_status = COALESCE(?, payment_status),
        courier_name = COALESCE(?, courier_name),
        tracking_id = COALESCE(?, tracking_id),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newStatus, payment_status || null, courier_name || null, tracking_id || null, notes || null, id]
    );

    // Update payment record status if specified
    if (payment_status) {
      run('UPDATE payments SET status = ? WHERE order_id = ?', [payment_status, id]);
    }

    // Synchronize courier_shipments table
    const targetCourier = courier_name || order.courier_name || 'Steadfast Courier';
    const targetTracking = tracking_id || order.tracking_id || `STF-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const shipStatus = newStatus === 'delivered' ? 'delivered' : newStatus === 'cancelled' ? 'cancelled' : 'in_transit';
    const deliveredAt = newStatus === 'delivered' ? 'CURRENT_TIMESTAMP' : null;

    const existingShipment = queryOne('SELECT id FROM courier_shipments WHERE order_id = ?', [id]);
    if (existingShipment) {
      run(
        `UPDATE courier_shipments SET
          courier_name = COALESCE(?, courier_name),
          tracking_id = COALESCE(?, tracking_id),
          shipping_status = ?,
          delivered_at = COALESCE(?, delivered_at)
         WHERE order_id = ?`,
        [courier_name || null, tracking_id || null, shipStatus, deliveredAt, id]
      );
    } else if (newStatus === 'shipped' || newStatus === 'delivered' || courier_name || tracking_id) {
      const shipId = `ship_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      run(
        `INSERT INTO courier_shipments (id, order_id, courier_name, consignment_id, tracking_id, shipping_status, delivery_fee)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [shipId, id, targetCourier, `CSG-${order.order_number}`, targetTracking, shipStatus, order.shipping_cost || 60]
      );
    }

    logAdminAction(
      admin.id,
      admin.name,
      'UPDATE_ORDER_STATUS',
      'order',
      id,
      `Changed order ${order.order_number} status from ${prevStatus} to ${newStatus}`,
      req.ip || '127.0.0.1'
    );

    // If status changed, send status update SMS to customer
    if (newStatus !== prevStatus) {
      sendOrderStatusSms({
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        grand_total: order.grand_total,
        order_status: newStatus,
        tracking_id: tracking_id || order.tracking_id,
        courier_name: courier_name || order.courier_name
      }).catch((err) => console.warn('Order status SMS warning:', err));
    }

    const updated = enrichOrder(queryOne('SELECT * FROM orders WHERE id = ?', [id]));
    res.json({ success: true, message: `Order status updated to ${newStatus}.`, order: updated });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

// 7. PUT /api/orders/admin/:id - Full edit order details
router.put('/admin/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const {
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      shipping_city,
      order_status,
      status,
      payment_status,
      payment_method,
      courier_name,
      tracking_id,
      notes,
      delivery_charge,
      shipping_cost,
      discount_amount,
      grand_total
    } = req.body;

    const existing = queryOne<any>('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const prevStatus = existing.order_status;
    const newStatus = order_status || status || prevStatus;

    if (newStatus !== prevStatus) {
      const items = query<any>('SELECT * FROM order_items WHERE order_id = ?', [id]);

      if (newStatus === 'returned' && prevStatus !== 'returned') {
        for (const it of items) {
          const prod = queryOne<any>('SELECT stock_quantity FROM products WHERE id = ?', [it.product_id]);
          const prevProdStock = prod?.stock_quantity ?? 0;
          const newProdStock = prevProdStock + it.quantity;

          run('UPDATE products SET stock_quantity = stock_quantity + ?, total_returned = total_returned + ? WHERE id = ?', [it.quantity, it.quantity, it.product_id]);
          if (it.variant_id) {
            run('UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?', [it.quantity, it.variant_id]);
          }

          const histId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          run(
            `INSERT INTO inventory_history (
              id, product_id, variant_id, change_type, quantity_changed,
              previous_quantity, new_quantity, reference_id, reference_type, reason, created_by
            ) VALUES (?, ?, ?, 'returned', ?, ?, ?, ?, 'customer_return', ?, ?)`,
            [
              histId,
              it.product_id,
              it.variant_id || null,
              it.quantity,
              prevProdStock,
              newProdStock,
              existing.order_number,
              `Order #${existing.order_number} marked as returned via edit`,
              admin.name
            ]
          );
        }
      } else if (newStatus === 'cancelled' && prevStatus !== 'cancelled' && prevStatus !== 'returned') {
        for (const it of items) {
          const prod = queryOne<any>('SELECT stock_quantity FROM products WHERE id = ?', [it.product_id]);
          const prevProdStock = prod?.stock_quantity ?? 0;
          const newProdStock = prevProdStock + it.quantity;

          run('UPDATE products SET stock_quantity = stock_quantity + ?, total_delivered = MAX(0, total_delivered - ?) WHERE id = ?', [it.quantity, it.quantity, it.product_id]);
          if (it.variant_id) {
            run('UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?', [it.quantity, it.variant_id]);
          }

          const histId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          run(
            `INSERT INTO inventory_history (
              id, product_id, variant_id, change_type, quantity_changed,
              previous_quantity, new_quantity, reference_id, reference_type, reason, created_by
            ) VALUES (?, ?, ?, 'cancelled', ?, ?, ?, ?, 'order_cancel', ?, ?)`,
            [
              histId,
              it.product_id,
              it.variant_id || null,
              it.quantity,
              prevProdStock,
              newProdStock,
              existing.order_number,
              `Order #${existing.order_number} marked as cancelled via edit`,
              admin.name
            ]
          );
        }
      } else if ((prevStatus === 'cancelled' || prevStatus === 'returned') && (newStatus !== 'cancelled' && newStatus !== 'returned')) {
        for (const it of items) {
          const prod = queryOne<any>('SELECT stock_quantity FROM products WHERE id = ?', [it.product_id]);
          const prevProdStock = prod?.stock_quantity ?? 0;
          const newProdStock = Math.max(0, prevProdStock - it.quantity);

          if (prevStatus === 'returned') {
            run('UPDATE products SET stock_quantity = ?, total_returned = MAX(0, total_returned - ?) WHERE id = ?', [newProdStock, it.quantity, it.product_id]);
          } else {
            run('UPDATE products SET stock_quantity = ?, total_delivered = total_delivered + ? WHERE id = ?', [newProdStock, it.quantity, it.product_id]);
          }
          if (it.variant_id) {
            run('UPDATE product_variants SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ?', [it.quantity, it.variant_id]);
          }

          const histId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          run(
            `INSERT INTO inventory_history (
              id, product_id, variant_id, change_type, quantity_changed,
              previous_quantity, new_quantity, reference_id, reference_type, reason, created_by
            ) VALUES (?, ?, ?, 'delivered', ?, ?, ?, ?, 'order_reactivated', ?, ?)`,
            [
              histId,
              it.product_id,
              it.variant_id || null,
              -it.quantity,
              prevProdStock,
              newProdStock,
              existing.order_number,
              `Order #${existing.order_number} re-activated via edit`,
              admin.name
            ]
          );
        }
      }
    }

    const shipCostVal = shipping_cost !== undefined ? Number(shipping_cost) : (delivery_charge !== undefined ? Number(delivery_charge) : null);

    run(
      `UPDATE orders SET
        customer_name = COALESCE(?, customer_name),
        customer_phone = COALESCE(?, customer_phone),
        customer_email = COALESCE(?, customer_email),
        shipping_address = COALESCE(?, shipping_address),
        shipping_city = COALESCE(?, shipping_city),
        order_status = ?,
        payment_status = COALESCE(?, payment_status),
        payment_method = COALESCE(?, payment_method),
        courier_name = COALESCE(?, courier_name),
        tracking_id = COALESCE(?, tracking_id),
        notes = COALESCE(?, notes),
        shipping_cost = COALESCE(?, shipping_cost),
        discount_amount = COALESCE(?, discount_amount),
        grand_total = COALESCE(?, grand_total),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        customer_name || null,
        customer_phone || null,
        customer_email || null,
        shipping_address || null,
        shipping_city || null,
        newStatus,
        payment_status || null,
        payment_method || null,
        courier_name || null,
        tracking_id || null,
        notes || null,
        shipCostVal,
        discount_amount !== undefined ? Number(discount_amount) : null,
        grand_total !== undefined ? Number(grand_total) : null,
        id
      ]
    );

    logAdminAction(
      admin.id,
      admin.name,
      'EDIT_ORDER',
      'order',
      id,
      `Edited order ${existing.order_number} details`,
      req.ip || '127.0.0.1'
    );

    const updated = enrichOrder(queryOne('SELECT * FROM orders WHERE id = ?', [id]));
    res.json({ success: true, message: 'Order details updated successfully.', order: updated });
  } catch (error) {
    console.error('Edit order error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order details.' });
  }
});

// 8. DELETE /api/orders/admin/:id - Delete order
router.delete('/admin/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;

    const existing = queryOne<any>('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    // If order was active (not returned or cancelled), return stock so deletion doesn't cause phantom stock reduction
    if (existing.order_status !== 'cancelled' && existing.order_status !== 'returned') {
      const items = query<any>('SELECT * FROM order_items WHERE order_id = ?', [id]);
      for (const it of items) {
        run('UPDATE products SET stock_quantity = stock_quantity + ?, total_delivered = MAX(0, total_delivered - ?) WHERE id = ?', [it.quantity, it.quantity, it.product_id]);
        if (it.variant_id) {
          run('UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?', [it.quantity, it.variant_id]);
        }
      }
    }

    // Delete associated order items, payments, shipments, and order
    run('DELETE FROM order_items WHERE order_id = ?', [id]);
    run('DELETE FROM payments WHERE order_id = ?', [id]);
    run('DELETE FROM courier_shipments WHERE order_id = ?', [id]);
    run('DELETE FROM orders WHERE id = ?', [id]);

    logAdminAction(
      admin.id,
      admin.name,
      'DELETE_ORDER',
      'order',
      id,
      `Deleted order ${existing.order_number} (Customer: ${existing.customer_name})`,
      req.ip || '127.0.0.1'
    );

    res.json({ success: true, message: `Order ${existing.order_number} deleted successfully.` });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete order.' });
  }
});

export default router;
