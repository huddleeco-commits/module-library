/**
 * Public Menu & Reservations API
 *
 * Public-facing endpoints for generated frontends.
 * No authentication required.
 *
 * Endpoints:
 *   GET  /api/menu                    - Full menu (public)
 *   GET  /api/menu/:categoryId        - Items in category
 *   GET  /api/menu/item/:id           - Single item details
 *   POST /api/reservations            - Create booking
 *   GET  /api/reservations/availability - Check available slots
 *   GET  /api/reservations/:reference - Check booking status
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

// Get menu store from admin routes
function getMenuStore(req) {
  const menuRoutes = req.app.locals.menuRoutes;
  if (menuRoutes?.getStore) {
    return menuRoutes.getStore();
  }
  // Fallback empty store
  return { categories: [], items: [] };
}

// Get reservations store from admin routes
function getReservationsStore(req) {
  const reservationRoutes = req.app.locals.reservationRoutes;
  if (reservationRoutes?.getStore) {
    return reservationRoutes.getStore();
  }
  // Fallback empty store
  return { reservations: [], nextId: 1 };
}

// Broadcast to SSE clients
function broadcast(req, channel, type, data) {
  const clients = req.app.locals.sseClients?.[channel];
  if (clients) {
    clients.forEach(client => {
      client.write(`data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`);
    });
  }
}

// ============================================
// MENU ENDPOINTS
// ============================================

// GET /api/menu - Full menu (public)
router.get('/menu', (req, res) => {
  try {
    const store = getMenuStore(req);

    const categories = store.categories
      .filter(c => c.active)
      .sort((a, b) => a.display_order - b.display_order)
      .map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        items: store.items
          .filter(item => item.category_id === category.id && item.available)
          .sort((a, b) => a.display_order - b.display_order)
          .map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image_url: item.image_url,
            dietary_flags: item.dietary_flags,
            popular: item.popular
          }))
      }));

    res.json({
      success: true,
      categories,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/menu/:categoryId - Items in category
router.get('/menu/category/:categoryId', (req, res) => {
  try {
    const store = getMenuStore(req);
    const categoryId = parseInt(req.params.categoryId);

    const category = store.categories.find(c => c.id === categoryId && c.active);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const items = store.items
      .filter(item => item.category_id === categoryId && item.available)
      .sort((a, b) => a.display_order - b.display_order)
      .map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        dietary_flags: item.dietary_flags,
        popular: item.popular
      }));

    res.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        description: category.description
      },
      items
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/menu/item/:id - Single item details
router.get('/menu/item/:id', (req, res) => {
  try {
    const store = getMenuStore(req);
    const id = parseInt(req.params.id);

    const item = store.items.find(i => i.id === id && i.available);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const category = store.categories.find(c => c.id === item.category_id);

    res.json({
      success: true,
      item: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        dietary_flags: item.dietary_flags,
        popular: item.popular,
        category: category ? { id: category.id, name: category.name } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// RESERVATIONS ENDPOINTS
// ============================================

// POST /api/reservations - Create booking
router.post('/reservations', (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, date, time, party_size, special_requests } = req.body;

    // Validation
    if (!customer_name || !customer_email || !date || !time || !party_size) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: customer_name, customer_email, date, time, party_size'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address' });
    }

    // Date validation (must be today or future)
    const reservationDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (reservationDate < today) {
      return res.status(400).json({ success: false, error: 'Cannot book for past dates' });
    }

    // Party size validation
    const size = parseInt(party_size);
    if (size < 1 || size > 20) {
      return res.status(400).json({ success: false, error: 'Party size must be between 1 and 20' });
    }

    const store = getReservationsStore(req);

    const newReservation = {
      id: store.nextId++,
      reference_code: generateRefCode(),
      customer_name,
      customer_email,
      customer_phone: customer_phone || '',
      date,
      time,
      party_size: size,
      status: 'pending',
      special_requests: special_requests || '',
      internal_notes: '',
      created_at: new Date().toISOString()
    };

    store.reservations.push(newReservation);

    // Broadcast to admin dashboard
    broadcast(req, 'reservations', 'new_reservation', {
      id: newReservation.id,
      reference_code: newReservation.reference_code,
      customer_name: newReservation.customer_name,
      date: newReservation.date,
      time: newReservation.time,
      party_size: newReservation.party_size
    });

    res.status(201).json({
      success: true,
      message: 'Reservation request received',
      reference_code: newReservation.reference_code,
      status: 'pending',
      details: {
        date,
        time,
        party_size: size,
        name: customer_name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/reservations/availability - Check available slots
router.get('/reservations/availability', (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, error: 'Date required' });
    }

    const store = getReservationsStore(req);

    // Get existing reservations for the date
    const dateReservations = store.reservations.filter(r =>
      r.date === date && r.status !== 'cancelled'
    );

    // Define available time slots (restaurant hours)
    const allSlots = [
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
    ];

    // Count reservations per slot
    const slotCounts = {};
    dateReservations.forEach(r => {
      slotCounts[r.time] = (slotCounts[r.time] || 0) + 1;
    });

    // Max reservations per slot (could be configurable)
    const maxPerSlot = 5;

    const availability = allSlots.map(time => ({
      time,
      available: (slotCounts[time] || 0) < maxPerSlot,
      remaining: maxPerSlot - (slotCounts[time] || 0)
    }));

    res.json({
      success: true,
      date,
      slots: availability,
      totalBooked: dateReservations.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/reservations/:reference - Check booking status
router.get('/reservations/:reference', (req, res) => {
  try {
    const reference = req.params.reference.toUpperCase();
    const store = getReservationsStore(req);

    const reservation = store.reservations.find(r =>
      r.reference_code === reference
    );

    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    res.json({
      success: true,
      reservation: {
        reference_code: reservation.reference_code,
        status: reservation.status,
        date: reservation.date,
        time: reservation.time,
        party_size: reservation.party_size,
        customer_name: reservation.customer_name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
