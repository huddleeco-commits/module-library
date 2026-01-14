/**
 * Admin API Module
 *
 * Comprehensive admin endpoints for:
 * - Competitors tracking
 * - Customer CRM
 * - Order management
 * - Analytics/metrics
 * - Inventory management
 *
 * All routes are prefixed with /api/admin
 */

const express = require('express');
const router = express.Router();

// Import route modules
const competitorsRoutes = require('./routes/competitors');
const customersRoutes = require('./routes/customers');
const ordersRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');
const inventoryRoutes = require('./routes/inventory');

// Mount routes
router.use('/competitors', competitorsRoutes);
router.use('/customers', customersRoutes);
router.use('/orders', ordersRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/inventory', inventoryRoutes);

// Health check for admin API
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    module: 'admin-api',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
