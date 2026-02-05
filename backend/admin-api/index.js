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
 * - Menu management (with real-time sync)
 * - Reservations management
 * - AI Agents with action execution
 *
 * All routes are prefixed with /api/admin
 * All routes require authentication (except health check and SSE events)
 * CORS restricted to allowed origins
 */

const express = require('express');
const router = express.Router();
const cors = require('cors');

// CORS configuration for admin API
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (same-origin, mobile apps, curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean);

    // In development, allow localhost
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push('http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173');
    }

    if (allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

// Apply CORS to all admin routes
router.use(cors(corsOptions));

// Import auth middleware
const { authenticateToken, isAdmin } = require('../auth/middleware/auth');

// Import route modules
const competitorsRoutes = require('./routes/competitors');
const customersRoutes = require('./routes/customers');
const ordersRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');
const inventoryRoutes = require('./routes/inventory');
const stagingRoutes = require('./routes/staging');
const aiRoutes = require('./routes/ai');
const menuRoutes = require('./routes/menu');
const reservationsRoutes = require('./routes/reservations');
const eventsRoutes = require('./routes/events');

// Import services
const { createNotificationService } = require('./services/notification-service');

// Health check for admin API (no auth required)
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    module: 'admin-api',
    timestamp: new Date().toISOString()
  });
});

// Initialize services and store references
function initializeServices(app) {
  // Initialize SSE clients
  eventsRoutes.initSSEClients(app);

  // Store route references for cross-module access
  app.locals.menuRoutes = menuRoutes;
  app.locals.reservationRoutes = reservationsRoutes;

  // Initialize notification service
  const brain = app.locals.brain || {};
  app.locals.notificationService = createNotificationService({
    businessName: brain.business?.name || 'Our Business'
  });

  console.log('[Admin API] Services initialized');
}

// Export initialization function
router.initializeServices = initializeServices;

// SSE Events routes - no auth required for real-time updates
// Mount at /api/events (outside /api/admin)
router.eventsRoutes = eventsRoutes;

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
router.use('/ai', aiRoutes);
router.use('/menu', menuRoutes);
router.use('/reservations', reservationsRoutes);

module.exports = router;
