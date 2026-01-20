const express = require('express');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(verifyToken);
router.use(requireAdmin);

// Get all bookings
router.get('/bookings', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status, date, staffId } = req.query;
    
    let query = `
      SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
             s.name as service_name, s.duration, s.price,
             st.name as staff_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      JOIN staff st ON b.staff_id = st.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    
    if (date) {
      query += ' AND b.booking_date = ?';
      params.push(date);
    }
    
    if (staffId) {
      query += ' AND b.staff_id = ?';
      params.push(staffId);
    }
    
    query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';
    
    const bookings = db.prepare(query).all(...params);
    
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Update booking status
router.post('/bookings/:id/status', (req, res) => {
  try {
    const db = req.app.locals.db;
    const bookingId = req.params.id;
    const { status } = req.body;
    
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const booking = db.prepare('SELECT id FROM bookings WHERE id = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const updateBooking = db.prepare('UPDATE bookings SET status = ? WHERE id = ?');
    updateBooking.run(status, bookingId);
    
    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Get calendar view
router.get('/calendar', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT b.booking_date, b.booking_time, b.status,
             s.name as service_name, s.duration,
             st.name as staff_name,
             u.name as user_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN staff st ON b.staff_id = st.id
      JOIN users u ON b.user_id = u.id
      WHERE b.status != 'cancelled'
    `;
    
    const params = [];
    
    if (startDate) {
      query += ' AND b.booking_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND b.booking_date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY b.booking_date, b.booking_time';
    
    const events = db.prepare(query).all(...params);
    
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get calendar data' });
  }
});

// Get dashboard stats
router.get('/stats', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Today's stats
    const today = new Date().toISOString().split('T')[0];
    
    const todayBookings = db.prepare(
      'SELECT COUNT(*) as count FROM bookings WHERE booking_date = ? AND status != "cancelled"'
    ).get(today);
    
    const todayRevenue = db.prepare(`
      SELECT SUM(s.price) as total
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.booking_date = ? AND b.status = 'completed'
    `).get(today);
    
    // This month stats
    const thisMonth = new Date().toISOString().slice(0, 7);
    
    const monthlyBookings = db.prepare(
      'SELECT COUNT(*) as count FROM bookings WHERE booking_date LIKE ? AND status != "cancelled"'
    ).get(thisMonth + '%');
    
    const monthlyRevenue = db.prepare(`
      SELECT SUM(s.price) as total
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.booking_date LIKE ? AND b.status = 'completed'
    `).get(thisMonth + '%');
    
    // Service popularity
    const serviceStats = db.prepare(`
      SELECT s.name, COUNT(*) as booking_count, SUM(s.price) as revenue
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.status != 'cancelled'
      GROUP BY s.id, s.name
      ORDER BY booking_count DESC
    `).all();
    
    // Staff performance
    const staffStats = db.prepare(`
      SELECT st.name, COUNT(*) as booking_count, SUM(s.price) as revenue
      FROM bookings b
      JOIN staff st ON b.staff_id = st.id
      JOIN services s ON b.service_id = s.id
      WHERE b.status != 'cancelled'
      GROUP BY st.id, st.name
      ORDER BY booking_count DESC
    `).all();
    
    res.json({
      today: {
        bookings: todayBookings.count,
        revenue: todayRevenue.total || 0
      },
      monthly: {
        bookings: monthlyBookings.count,
        revenue: monthlyRevenue.total || 0
      },
      services: serviceStats,
      staff: staffStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;