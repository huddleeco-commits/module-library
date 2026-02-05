/**
 * Reservations Management API Routes
 *
 * Full CRUD operations for reservations with confirmation/cancellation flows.
 * Broadcasts updates via SSE for real-time notifications.
 *
 * Endpoints:
 *   GET    /api/admin/reservations           - List with filters
 *   GET    /api/admin/reservations/today     - Today's bookings
 *   GET    /api/admin/reservations/stats     - Reservation statistics
 *   GET    /api/admin/reservations/:id       - Single reservation
 *   POST   /api/admin/reservations           - Create reservation (admin)
 *   PUT    /api/admin/reservations/:id       - Update reservation
 *   PUT    /api/admin/reservations/:id/confirm  - Confirm + notify
 *   PUT    /api/admin/reservations/:id/cancel   - Cancel + notify
 *   POST   /api/admin/reservations/:id/reminder - Send reminder
 *   DELETE /api/admin/reservations/:id       - Delete reservation
 */

const express = require('express');
const router = express.Router();

// Generate reference code
function generateRefCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'RES-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Format date for display
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// In-memory store for demo
let reservationsStore = {
  reservations: [
    {
      id: 1,
      reference_code: 'RES-A7X9',
      customer_name: 'John Smith',
      customer_email: 'john@example.com',
      customer_phone: '(555) 123-4567',
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      party_size: 4,
      status: 'confirmed',
      special_requests: 'Window seat preferred',
      internal_notes: 'VIP customer',
      confirmed_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      reference_code: 'RES-B3K2',
      customer_name: 'Sarah Johnson',
      customer_email: 'sarah@example.com',
      customer_phone: '(555) 987-6543',
      date: new Date().toISOString().split('T')[0],
      time: '18:30',
      party_size: 2,
      status: 'pending',
      special_requests: 'Anniversary dinner',
      internal_notes: '',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      reference_code: 'RES-C9M4',
      customer_name: 'Mike Wilson',
      customer_email: 'mike@example.com',
      customer_phone: '(555) 456-7890',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '20:00',
      party_size: 6,
      status: 'pending',
      special_requests: 'Birthday cake',
      internal_notes: '',
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ],
  nextId: 4
};

// Get SSE broadcaster
function broadcast(req, type, data) {
  const broadcaster = req.app.locals.sseClients?.reservations;
  if (broadcaster) {
    broadcaster.forEach(client => {
      client.write(`data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`);
    });
  }
}

// Get notification service
function getNotificationService(req) {
  return req.app.locals.notificationService;
}

// GET /api/admin/reservations - List with filters
router.get('/', (req, res) => {
  try {
    const { date, status, search, from, to, limit = 50, offset = 0 } = req.query;

    let filtered = [...reservationsStore.reservations];

    // Filter by date
    if (date) {
      filtered = filtered.filter(r => r.date === date);
    }

    // Filter by date range
    if (from) {
      filtered = filtered.filter(r => r.date >= from);
    }
    if (to) {
      filtered = filtered.filter(r => r.date <= to);
    }

    // Filter by status
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }

    // Search by name, email, or reference
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.customer_name.toLowerCase().includes(searchLower) ||
        r.customer_email.toLowerCase().includes(searchLower) ||
        r.reference_code.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    const total = filtered.length;
    const paginated = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      reservations: paginated,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/reservations/today - Today's bookings
router.get('/today', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayReservations = reservationsStore.reservations
      .filter(r => r.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));

    const stats = {
      total: todayReservations.length,
      pending: todayReservations.filter(r => r.status === 'pending').length,
      confirmed: todayReservations.filter(r => r.status === 'confirmed').length,
      cancelled: todayReservations.filter(r => r.status === 'cancelled').length,
      totalGuests: todayReservations
        .filter(r => r.status !== 'cancelled')
        .reduce((sum, r) => sum + r.party_size, 0)
    };

    res.json({
      success: true,
      date: today,
      reservations: todayReservations,
      stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/reservations/stats - Statistics
router.get('/stats', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const all = reservationsStore.reservations;

    res.json({
      success: true,
      stats: {
        today: {
          total: all.filter(r => r.date === today).length,
          pending: all.filter(r => r.date === today && r.status === 'pending').length,
          confirmed: all.filter(r => r.date === today && r.status === 'confirmed').length
        },
        tomorrow: {
          total: all.filter(r => r.date === tomorrow).length,
          pending: all.filter(r => r.date === tomorrow && r.status === 'pending').length
        },
        thisWeek: {
          total: all.filter(r => r.date >= today && r.date <= weekFromNow).length,
          pending: all.filter(r => r.date >= today && r.date <= weekFromNow && r.status === 'pending').length
        },
        needsAction: all.filter(r => r.date >= today && r.status === 'pending').length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/reservations/:id - Single reservation
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reservation = reservationsStore.reservations.find(r => r.id === id);

    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    res.json({ success: true, reservation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/reservations - Create reservation (admin)
router.post('/', (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, date, time, party_size, special_requests, internal_notes } = req.body;

    if (!customer_name || !customer_email || !date || !time || !party_size) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: customer_name, customer_email, date, time, party_size'
      });
    }

    const newReservation = {
      id: reservationsStore.nextId++,
      reference_code: generateRefCode(),
      customer_name,
      customer_email,
      customer_phone: customer_phone || '',
      date,
      time,
      party_size: parseInt(party_size),
      status: 'pending',
      special_requests: special_requests || '',
      internal_notes: internal_notes || '',
      created_at: new Date().toISOString()
    };

    reservationsStore.reservations.push(newReservation);
    broadcast(req, 'reservation_created', newReservation);

    res.status(201).json({ success: true, reservation: newReservation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/reservations/:id - Update reservation
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reservation = reservationsStore.reservations.find(r => r.id === id);

    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    const { customer_name, customer_email, customer_phone, date, time, party_size, special_requests, internal_notes, status } = req.body;

    if (customer_name !== undefined) reservation.customer_name = customer_name;
    if (customer_email !== undefined) reservation.customer_email = customer_email;
    if (customer_phone !== undefined) reservation.customer_phone = customer_phone;
    if (date !== undefined) reservation.date = date;
    if (time !== undefined) reservation.time = time;
    if (party_size !== undefined) reservation.party_size = parseInt(party_size);
    if (special_requests !== undefined) reservation.special_requests = special_requests;
    if (internal_notes !== undefined) reservation.internal_notes = internal_notes;
    if (status !== undefined) reservation.status = status;
    reservation.updated_at = new Date().toISOString();

    broadcast(req, 'reservation_updated', reservation);

    res.json({ success: true, reservation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/reservations/:id/confirm - Confirm reservation
router.put('/:id/confirm', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reservation = reservationsStore.reservations.find(r => r.id === id);

    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    reservation.status = 'confirmed';
    reservation.confirmed_at = new Date().toISOString();
    reservation.updated_at = new Date().toISOString();

    // Send confirmation notification
    const notificationService = getNotificationService(req);
    if (notificationService && req.body.send_notification !== false) {
      await notificationService.sendReservationConfirmation(reservation);
    }

    broadcast(req, 'reservation_confirmed', reservation);

    res.json({
      success: true,
      reservation,
      notification_sent: req.body.send_notification !== false
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/reservations/:id/cancel - Cancel reservation
router.put('/:id/cancel', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reservation = reservationsStore.reservations.find(r => r.id === id);

    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    reservation.status = 'cancelled';
    reservation.cancelled_at = new Date().toISOString();
    reservation.updated_at = new Date().toISOString();

    if (req.body.reason) {
      reservation.internal_notes = (reservation.internal_notes ? reservation.internal_notes + '\n' : '') +
        `Cancelled: ${req.body.reason}`;
    }

    // Send cancellation notification
    const notificationService = getNotificationService(req);
    if (notificationService && req.body.notify !== false) {
      await notificationService.sendReservationCancellation(reservation, req.body.reason);
    }

    broadcast(req, 'reservation_cancelled', reservation);

    res.json({
      success: true,
      reservation,
      notification_sent: req.body.notify !== false
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/reservations/:id/reminder - Send reminder
router.post('/:id/reminder', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reservation = reservationsStore.reservations.find(r => r.id === id);

    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Cannot send reminder for cancelled reservation' });
    }

    // Send reminder notification
    const notificationService = getNotificationService(req);
    if (notificationService) {
      await notificationService.sendReservationReminder(reservation);
    }

    res.json({
      success: true,
      message: 'Reminder sent',
      reservation
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/admin/reservations/:id - Delete reservation
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = reservationsStore.reservations.findIndex(r => r.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    reservationsStore.reservations.splice(index, 1);
    broadcast(req, 'reservation_deleted', { id });

    res.json({ success: true, message: 'Reservation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export store for use by other modules
router.getStore = () => reservationsStore;
router.setStore = (store) => { reservationsStore = store; };

module.exports = router;
