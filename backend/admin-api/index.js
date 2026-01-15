/**
 * Admin API Module
 *
 * Comprehensive admin endpoints for:
 * - Competitors tracking
 * - Customer CRM
 * - Order management
 * - Analytics/metrics
 * - Inventory management
 * - Staging/Content editing
 *
 * All routes are prefixed with /api/admin
 * All routes require authentication (except health check)
 */

const express = require('express');
const router = express.Router();

// Import auth middleware
const { authenticateToken, isAdmin } = require('../auth/middleware/auth');

// Import route modules
const competitorsRoutes = require('./routes/competitors');
const customersRoutes = require('./routes/customers');
const ordersRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');
const inventoryRoutes = require('./routes/inventory');
const stagingRoutes = require('./routes/staging');

// Health check for admin API (no auth required)
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    module: 'admin-api',
    timestamp: new Date().toISOString()
  });
});

// Apply authentication middleware to all admin routes
router.use(authenticateToken);
router.use(isAdmin);

// Mount routes (all protected by auth middleware above)
router.use('/competitors', competitorsRoutes);
router.use('/customers', customersRoutes);
router.use('/orders', ordersRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/staging', stagingRoutes);

module.exports = router;
