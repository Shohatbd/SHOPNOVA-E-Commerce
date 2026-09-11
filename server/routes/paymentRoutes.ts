import express, { Request, Response } from 'express';
import { query, queryOne, run } from '../db/db.ts';
import { requireAdmin, AuthenticatedRequest, logAdminAction } from '../auth.ts';

const router = express.Router();

// 1. POST /api/payments/process - Process payment (bKash, Nagad, Card, SSLCommerz)
router.post('/process', (req: Request, res: Response) => {
  try {
    const { order_id, payment_method, account_number, pin_or_otp } = req.body;

    const order = queryOne<any>('SELECT * FROM orders WHERE id = ?', [order_id]);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const transactionId = `TXN-${payment_method.toUpperCase()}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update payment record
    run(
      `UPDATE payments SET
        transaction_id = ?,
        status = 'paid',
        paid_at = CURRENT_TIMESTAMP,
        gateway_response = ?
       WHERE order_id = ?`,
      [transactionId, JSON.stringify({ verified: true, account: account_number || 'demo_account', gateway: payment_method }), order_id]
    );

    // Update order payment status
    run(
      "UPDATE orders SET payment_status = 'paid', payment_method = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [payment_method, order_id]
    );

    res.json({
      success: true,
      message: `Payment of ৳${order.grand_total} processed successfully via ${payment_method.toUpperCase()}!`,
      transactionId
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ success: false, message: 'Payment processing failed.' });
  }
});

// 2. GET /api/payments/admin/all - List all transactions
router.get('/admin/all', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = query(
      `SELECT p.*, o.order_number, o.customer_name, o.customer_phone, o.grand_total, o.order_status
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       ORDER BY p.created_at DESC LIMIT 100`
    );

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
});

// 3. GET /api/payments/gateways - List all configured payment gateways
router.get('/gateways', (_req: Request, res: Response) => {
  try {
    const gateways = query('SELECT * FROM payment_gateways ORDER BY sort_order ASC, created_at ASC');
    res.json({ success: true, gateways });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment gateways.' });
  }
});

// 4. POST /api/payments/gateways - Add new payment gateway
router.post('/gateways', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const {
      name_en,
      name_bn,
      gateway_type,
      account_number,
      account_type,
      charge_percentage,
      instruction_en,
      instruction_bn,
      logo_url,
      qr_code_url,
      is_active,
      sort_order
    } = req.body;

    if (!name_en || !gateway_type) {
      res.status(400).json({ success: false, message: 'Gateway name and type are required.' });
      return;
    }

    const id = `gw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    run(
      `INSERT INTO payment_gateways (
        id, name_en, name_bn, gateway_type, account_number, account_type,
        charge_percentage, instruction_en, instruction_bn, logo_url, qr_code_url,
        is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name_en,
        name_bn || name_en,
        gateway_type,
        account_number || '',
        account_type || 'Merchant',
        Number(charge_percentage) || 0,
        instruction_en || '',
        instruction_bn || '',
        logo_url || '',
        qr_code_url || '',
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        Number(sort_order) || 0
      ]
    );

    logAdminAction(admin.id, admin.name, 'CREATE_PAYMENT_GATEWAY', 'payment_gateways', id, `Created payment gateway: ${name_en}`, req.ip || '127.0.0.1');

    res.json({ success: true, message: 'Payment gateway added successfully.', id });
  } catch (error) {
    console.error('Create payment gateway error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment gateway.' });
  }
});

// 5. PUT /api/payments/gateways/:id - Edit payment gateway
router.put('/gateways/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const {
      name_en,
      name_bn,
      gateway_type,
      account_number,
      account_type,
      charge_percentage,
      instruction_en,
      instruction_bn,
      logo_url,
      qr_code_url,
      is_active,
      sort_order
    } = req.body;

    const existing = queryOne('SELECT * FROM payment_gateways WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Payment gateway not found.' });
      return;
    }

    run(
      `UPDATE payment_gateways SET
        name_en = ?,
        name_bn = ?,
        gateway_type = ?,
        account_number = ?,
        account_type = ?,
        charge_percentage = ?,
        instruction_en = ?,
        instruction_bn = ?,
        logo_url = ?,
        qr_code_url = ?,
        is_active = ?,
        sort_order = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name_en || existing.name_en,
        name_bn !== undefined ? name_bn : existing.name_bn,
        gateway_type || existing.gateway_type,
        account_number !== undefined ? account_number : existing.account_number,
        account_type !== undefined ? account_type : existing.account_type,
        charge_percentage !== undefined ? Number(charge_percentage) : existing.charge_percentage,
        instruction_en !== undefined ? instruction_en : existing.instruction_en,
        instruction_bn !== undefined ? instruction_bn : existing.instruction_bn,
        logo_url !== undefined ? logo_url : existing.logo_url,
        qr_code_url !== undefined ? qr_code_url : existing.qr_code_url,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        sort_order !== undefined ? Number(sort_order) : existing.sort_order,
        id
      ]
    );

    logAdminAction(admin.id, admin.name, 'UPDATE_PAYMENT_GATEWAY', 'payment_gateways', id, `Updated payment gateway: ${name_en || existing.name_en}`, req.ip || '127.0.0.1');

    res.json({ success: true, message: 'Payment gateway updated successfully.' });
  } catch (error) {
    console.error('Update payment gateway error:', error);
    res.status(500).json({ success: false, message: 'Failed to update payment gateway.' });
  }
});

// 6. DELETE /api/payments/gateways/:id - Delete payment gateway
router.delete('/gateways/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;

    const existing = queryOne<any>('SELECT * FROM payment_gateways WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Payment gateway not found.' });
      return;
    }

    run('DELETE FROM payment_gateways WHERE id = ?', [id]);
    logAdminAction(admin.id, admin.name, 'DELETE_PAYMENT_GATEWAY', 'payment_gateways', id, `Deleted payment gateway: ${existing.name_en}`, req.ip || '127.0.0.1');

    res.json({ success: true, message: 'Payment gateway deleted successfully.' });
  } catch (error) {
    console.error('Delete payment gateway error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete payment gateway.' });
  }
});

// 7. PUT /api/payments/transactions/:id - Edit payment transaction
router.put('/transactions/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { status, payment_method, transaction_id, amount, notes } = req.body;

    const payment = queryOne<any>('SELECT * FROM payments WHERE id = ?', [id]);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found.' });
      return;
    }

    const newStatus = status || payment.status;
    const newMethod = payment_method || payment.payment_method;
    const newTxnId = transaction_id !== undefined ? transaction_id : payment.transaction_id;
    const newAmount = amount !== undefined ? Number(amount) : payment.amount;

    run(
      `UPDATE payments SET
        status = ?,
        payment_method = ?,
        transaction_id = ?,
        amount = ?,
        paid_at = ${newStatus === 'paid' ? 'CURRENT_TIMESTAMP' : 'paid_at'}
       WHERE id = ?`,
      [newStatus, newMethod, newTxnId, newAmount, id]
    );

    // Sync order payment status and method
    run(
      `UPDATE orders SET
        payment_status = ?,
        payment_method = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newStatus, newMethod, payment.order_id]
    );

    logAdminAction(admin.id, admin.name, 'UPDATE_PAYMENT_TRANSACTION', 'payments', id, `Updated transaction ${id} status to ${newStatus}`, req.ip || '127.0.0.1');

    res.json({ success: true, message: 'Payment transaction updated successfully.' });
  } catch (error) {
    console.error('Update payment transaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to update payment transaction.' });
  }
});

// 8. DELETE /api/payments/transactions/:id - Delete payment transaction record
router.delete('/transactions/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;

    const payment = queryOne<any>('SELECT * FROM payments WHERE id = ?', [id]);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found.' });
      return;
    }

    run('DELETE FROM payments WHERE id = ?', [id]);
    // Reset order payment status to unpaid/pending
    run("UPDATE orders SET payment_status = 'pending' WHERE id = ?", [payment.order_id]);

    logAdminAction(admin.id, admin.name, 'DELETE_PAYMENT_TRANSACTION', 'payments', id, `Deleted transaction record ${id}`, req.ip || '127.0.0.1');

    res.json({ success: true, message: 'Payment transaction record deleted.' });
  } catch (error) {
    console.error('Delete payment transaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete payment transaction.' });
  }
});

export default router;
