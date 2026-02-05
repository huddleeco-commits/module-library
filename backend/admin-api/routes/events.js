/**
 * Server-Sent Events (SSE) Routes
 *
 * Real-time event streams for admin dashboard and public frontends.
 * Enables instant sync when menu items change or reservations come in.
 *
 * Endpoints:
 *   GET /api/events/menu          - Menu updates stream
 *   GET /api/events/reservations  - Reservation notifications stream
 *   GET /api/events/content       - Website content updates stream
 *   GET /api/events/all           - Combined stream for all events
 */

const express = require('express');
const router = express.Router();

// Initialize SSE client stores in app.locals
function initSSEClients(app) {
  if (!app.locals.sseClients) {
    app.locals.sseClients = {
      menu: new Set(),
      reservations: new Set(),
      content: new Set(),
      all: new Set()
    };
  }
  return app.locals.sseClients;
}

// Common SSE setup
function setupSSE(res, req, channel) {
  const clients = initSSEClients(req.app);

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    channel,
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Add to clients set
  clients[channel].add(res);

  // Keep connection alive with heartbeat
  const heartbeat = setInterval(() => {
    res.write(`:heartbeat ${new Date().toISOString()}\n\n`);
  }, 30000);

  // Cleanup on close
  req.on('close', () => {
    clearInterval(heartbeat);
    clients[channel].delete(res);
  });
}

// GET /api/events/menu - Menu updates stream
router.get('/menu', (req, res) => {
  setupSSE(res, req, 'menu');

  // Send current menu state on connect
  const menuRoutes = req.app.locals.menuRoutes;
  if (menuRoutes?.getStore) {
    const store = menuRoutes.getStore();
    res.write(`data: ${JSON.stringify({
      type: 'initial_state',
      data: {
        categories: store.categories.filter(c => c.active),
        items: store.items
      },
      timestamp: new Date().toISOString()
    })}\n\n`);
  }
});

// GET /api/events/reservations - Reservation notifications
router.get('/reservations', (req, res) => {
  setupSSE(res, req, 'reservations');

  // Send today's pending count on connect
  const reservationRoutes = req.app.locals.reservationRoutes;
  if (reservationRoutes?.getStore) {
    const store = reservationRoutes.getStore();
    const today = new Date().toISOString().split('T')[0];
    const pending = store.reservations.filter(r =>
      r.date === today && r.status === 'pending'
    ).length;

    res.write(`data: ${JSON.stringify({
      type: 'initial_state',
      data: { pendingToday: pending },
      timestamp: new Date().toISOString()
    })}\n\n`);
  }
});

// GET /api/events/content - Website content updates
router.get('/content', (req, res) => {
  setupSSE(res, req, 'content');
});

// GET /api/events/all - Combined stream
router.get('/all', (req, res) => {
  setupSSE(res, req, 'all');
});

// Broadcast helper - can be imported by other modules
function createBroadcaster(app) {
  return {
    /**
     * Broadcast to specific channel
     */
    broadcast(channel, type, data) {
      const clients = app.locals.sseClients?.[channel];
      if (!clients) return;

      const message = JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString()
      });

      clients.forEach(client => {
        client.write(`data: ${message}\n\n`);
      });

      // Also broadcast to 'all' channel
      if (channel !== 'all') {
        const allClients = app.locals.sseClients?.all;
        if (allClients) {
          const allMessage = JSON.stringify({
            type,
            channel,
            data,
            timestamp: new Date().toISOString()
          });
          allClients.forEach(client => {
            client.write(`data: ${allMessage}\n\n`);
          });
        }
      }
    },

    /**
     * Broadcast menu update
     */
    menuUpdate(type, data) {
      this.broadcast('menu', type, data);
    },

    /**
     * Broadcast reservation update
     */
    reservationUpdate(type, data) {
      this.broadcast('reservations', type, data);
    },

    /**
     * Broadcast content update
     */
    contentUpdate(type, data) {
      this.broadcast('content', type, data);
    },

    /**
     * Get connected client counts
     */
    getClientCounts() {
      const clients = app.locals.sseClients || {};
      return {
        menu: clients.menu?.size || 0,
        reservations: clients.reservations?.size || 0,
        content: clients.content?.size || 0,
        all: clients.all?.size || 0
      };
    }
  };
}

// Health/status endpoint
router.get('/status', (req, res) => {
  const clients = req.app.locals.sseClients || {};
  res.json({
    success: true,
    connected: {
      menu: clients.menu?.size || 0,
      reservations: clients.reservations?.size || 0,
      content: clients.content?.size || 0,
      all: clients.all?.size || 0
    },
    timestamp: new Date().toISOString()
  });
});

// Export router and broadcaster factory
router.createBroadcaster = createBroadcaster;
router.initSSEClients = initSSEClients;

module.exports = router;
