/**
 * Blink Admin Module
 *
 * Comprehensive admin dashboard module for the Blink platform.
 * Provides cost tracking, analytics, alerts, and management functionality.
 */

const adminRoutes = require('./routes/admin');
const costTracker = require('./services/costTracker');
const alertService = require('./services/alertService');

/**
 * Initialize the admin module
 * @param {Object} options - Configuration options
 * @param {boolean} options.startAlerts - Whether to start the alert service (default: true)
 * @param {number} options.alertCheckInterval - Alert check interval in minutes (default: 5)
 */
function initialize(options = {}) {
  const {
    startAlerts = true,
    alertCheckInterval = 5
  } = options;

  console.log('[BlinkAdmin] Initializing admin module...');

  // Start alert monitoring service
  if (startAlerts) {
    alertService.startAlertService(alertCheckInterval);
  }

  console.log('[BlinkAdmin] Admin module initialized');

  return {
    routes: adminRoutes,
    costTracker,
    alertService
  };
}

/**
 * Shutdown the admin module
 */
function shutdown() {
  console.log('[BlinkAdmin] Shutting down admin module...');
  alertService.stopAlertService();
  console.log('[BlinkAdmin] Admin module shutdown complete');
}

module.exports = {
  initialize,
  shutdown,
  routes: adminRoutes,
  costTracker,
  alertService
};
