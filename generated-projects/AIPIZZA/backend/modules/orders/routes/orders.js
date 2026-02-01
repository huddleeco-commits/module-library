/**
 * Orders Routes
 * API endpoints for order management
 *
 * Used by:
 * - Companion App (place orders, view order history)
 * - Website (place orders)
 * - Admin Dashboard (manage orders)
 */

const express = require('express');
const router = express.Router();

// In-memory orders for test mode (SQLite in production)
let orders = [];
let orderIdCounter = 1000;

// Helper to get database (supports both PostgreSQL and SQLite)
const getDb = (req) => {
  return req.db || null;
};

// ============================================
// PUBLIC ROUTES
// ============================================

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
  try {
    const { items, total, source, customerName, customerEmail, customerPhone, notes, paymentType } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order must contain items' });
    }

    const db = getDb(req);
    const orderData = {
      items: JSON.stringify(items),
      total: total || items.reduce((sum, item) => sum + (item.price * (item.quantity || item.qty || 1)), 0),
      source: source || 'app',
      status: 'pending',
      payment_type: paymentType || 'cash',
      customer_name: customerName || 'Guest',
      customer_email: customerEmail || null,
      customer_phone: customerPhone || null,
      notes: notes || null,
      created_at: new Date().toISOString()
    };

    let orderId;

    if (db && typeof db.query === 'function') {
      // PostgreSQL or SQLite with query interface
      const result = await db.query(`
        INSERT INTO orders (user_id, items, total, source, status, payment_type, customer_name, customer_email, customer_phone, notes, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [
        req.user?.id || null,
        orderData.items,
        orderData.total,
        orderData.source,
        orderData.status,
        orderData.payment_type,
        orderData.customer_name,
        orderData.customer_email,
        orderData.customer_phone,
        orderData.notes,
        orderData.created_at
      ]);
      orderId = result.rows?.[0]?.id || result[0]?.id;
    } else {
      // In-memory fallback for testing
      orderId = ++orderIdCounter;
      orders.push({
        id: orderId,
        user_id: req.user?.id || null,
        ...orderData,
        items: items // Keep as array for in-memory
      });
    }

    console.log(`[Orders] New order #${orderId} created from ${source} - Total: $${orderData.total}`);

    res.json({
      success: true,
      order: {
        id: orderId,
        status: 'pending',
        total: orderData.total,
        items: items,
        created_at: orderData.created_at
      },
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('[Orders] Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// GET /api/orders/my-orders - Get orders for current user
router.get('/my-orders', async (req, res) => {
  try {
    const db = getDb(req);
    const userId = req.user?.id;

    let userOrders = [];

    if (db && typeof db.query === 'function') {
      const result = await db.query(`
        SELECT * FROM orders
        WHERE user_id = $1 OR user_id IS NULL
        ORDER BY created_at DESC
        LIMIT 50
      `, [userId || 0]);
      userOrders = result.rows || result;

      // Parse items JSON
      userOrders = userOrders.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      }));
    } else {
      // In-memory fallback
      userOrders = orders
        .filter(o => !userId || o.user_id === userId || o.user_id === null)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 50);
    }

    res.json({
      success: true,
      orders: userOrders
    });
  } catch (error) {
    console.error('[Orders] Error fetching user orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get specific order
router.get('/:id', async (req, res) => {
  try {
    const db = getDb(req);
    const orderId = parseInt(req.params.id);

    let order = null;

    if (db && typeof db.query === 'function') {
      const result = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      order = result.rows?.[0] || result[0];
      if (order && typeof order.items === 'string') {
        order.items = JSON.parse(order.items);
      }
    } else {
      order = orders.find(o => o.id === orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('[Orders] Error fetching order:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/orders - Get all orders (admin)
router.get('/', async (req, res) => {
  try {
    const db = getDb(req);
    const { status, source, limit = 100, offset = 0 } = req.query;

    let allOrders = [];

    if (db && typeof db.query === 'function') {
      let query = 'SELECT * FROM orders';
      const params = [];
      const conditions = [];

      if (status) {
        params.push(status);
        conditions.push(`status = $${params.length}`);
      }
      if (source) {
        params.push(source);
        conditions.push(`source = $${params.length}`);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';
      params.push(parseInt(limit));
      query += ` LIMIT $${params.length}`;
      params.push(parseInt(offset));
      query += ` OFFSET $${params.length}`;

      const result = await db.query(query, params);
      allOrders = result.rows || result;

      // Parse items JSON
      allOrders = allOrders.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      }));
    } else {
      // In-memory fallback
      allOrders = [...orders]
        .filter(o => (!status || o.status === status) && (!source || o.source === source))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(offset, offset + limit);
    }

    // Get stats
    const stats = {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === 'pending').length,
      confirmed: allOrders.filter(o => o.status === 'confirmed').length,
      preparing: allOrders.filter(o => o.status === 'preparing').length,
      ready: allOrders.filter(o => o.status === 'ready').length,
      completed: allOrders.filter(o => o.status === 'completed').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length
    };

    res.json({
      success: true,
      orders: allOrders,
      stats
    });
  } catch (error) {
    console.error('[Orders] Error fetching all orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// PUT /api/orders/:id/status - Update order status (admin)
router.put('/:id/status', async (req, res) => {
  try {
    const db = getDb(req);
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    if (db && typeof db.query === 'function') {
      await db.query('UPDATE orders SET status = $1, updated_at = $2 WHERE id = $3', [
        status,
        new Date().toISOString(),
        orderId
      ]);
    } else {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        order.updated_at = new Date().toISOString();
      }
    }

    console.log(`[Orders] Order #${orderId} status updated to: ${status}`);

    res.json({
      success: true,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('[Orders] Error updating order status:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

// DELETE /api/orders/:id - Cancel/delete order
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb(req);
    const orderId = parseInt(req.params.id);

    if (db && typeof db.query === 'function') {
      await db.query('UPDATE orders SET status = $1, updated_at = $2 WHERE id = $3', [
        'cancelled',
        new Date().toISOString(),
        orderId
      ]);
    } else {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = 'cancelled';
        order.updated_at = new Date().toISOString();
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled'
    });
  } catch (error) {
    console.error('[Orders] Error cancelling order:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel order' });
  }
});

module.exports = router;
