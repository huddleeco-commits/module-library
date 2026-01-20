const express = require('express');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(verifyToken, requireAdmin);

// Get all bookings with filters
router.get('/bookings', (req, res) => {
  try {
    const { date, status, staffId } = req.query;
    const db = req.app.locals.db;
    
    let query = `
      SELECT 
        b.*,
        s.name as service_name,
        s.price,
        st.name as staff_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN staff st ON b.staff_id = st.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (date) {
      query += ' AND b.booking_date = ?';
      params.push(date);
    }
    
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    
    if (staffId) {
      query += ' AND b.staff_id = ?';
      params.push(staffId);
    }
    
    query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';
    
    const bookings = db.prepare(query).all(...params);

    res.json({ bookings });
  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Update booking status
router.post('/bookings/:id/status', (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;
    const db = req.app.locals.db;

    const validStatuses = ['confirmed', 'completed', 'no-show', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateBooking = db.prepare(`
      UPDATE bookings SET status = ? WHERE id = ?
    `);
    
    const result = updateBooking.run(status, bookingId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Get calendar view data
router.get('/calendar', (req, res) => {
  try {
    const { startDate, endDate, view = 'week' } = req.query;
    const db = req.app.locals.db;

    let start, end;
    
    if (startDate && endDate) {
      start = startDate;
      end = endDate;
    } else {
      // Default to current week
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      
      start = startOfWeek.toISOString().split('T')[0];
      end = endOfWeek.toISOString().split('T')[0];
    }

    const bookings = db.prepare(`
      SELECT 
        b.*,
        s.name as service_name,
        s.duration,
        s.price,
        st.name as staff_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN staff st ON b.staff_id = st.id
      WHERE b.booking_date BETWEEN ? AND ?
      AND b.status != 'cancelled'
      ORDER BY b.booking_date ASC, b.booking_time ASC
    `).all(start, end);

    // Get business hours
    const businessHours = db.prepare(`
      SELECT * FROM business_hours ORDER BY 
      CASE day_of_week
        WHEN 'monday' THEN 1
        WHEN 'tuesday' THEN 2
        WHEN 'wednesday' THEN 3
        WHEN 'thursday' THEN 4
        WHEN 'friday' THEN 5
        WHEN 'saturday' THEN 6
        WHEN 'sunday' THEN 7
      END
    `).all();

    res.json({ 
      bookings,
      businessHours,
      period: { start, end, view }
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: 'Failed to get calendar data' });
  }
});

// Get dashboard statistics
router.get('/stats', (req, res) => {
  try {
    const db = req.app.locals.db;
    const today = new Date().toISOString().split('T')[0];

    // Bookings today
    const bookingsToday = db.prepare(`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE booking_date = ? AND status != 'cancelled'
    `).get(today);

    // Revenue today
    const revenueToday = db.prepare(`
      SELECT COALESCE(SUM(s.price), 0) as total
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.booking_date = ? AND b.status = 'completed'
    `).get(today);

    // This week's stats
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const weekStart = startOfWeek.toISOString().split('T')[0];

    const weeklyBookings = db.prepare(`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE booking_date >= ? AND status != 'cancelled'
    `).get(weekStart);

    // Utilization (booked hours vs available hours today)
    const businessHoursToday = db.prepare(`
      SELECT open_time, close_time, is_closed
      FROM business_hours
      WHERE day_of_week = ?
    `).get(new Date().toLocaleDateString('en-US', { weekday: 'lowercase' }));

    let utilizationRate = 0;
    if (businessHoursToday && !businessHoursToday.is_closed) {
      // Calculate total available hours
      const [openHour] = businessHoursToday.open_time.split(':').map(Number);
      const [closeHour] = businessHoursToday.close_time.split(':').map(Number);
      const availableHours = closeHour - openHour;
      
      // Calculate booked hours
      const bookedMinutes = db.prepare(`
        SELECT COALESCE(SUM(s.duration), 0) as total
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.booking_date = ? AND b.status != 'cancelled'
      `).get(today);
      
      utilizationRate = Math.round((bookedMinutes.total / (availableHours * 60)) * 100);
    }

    res.json({
      bookingsToday: bookingsToday.count,
      revenueToday: revenueToday.total,
      weeklyBookings: weeklyBookings.count,
      utilizationRate
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// CRUD operations for services
router.post('/services', (req, res) => {
  try {
    const { name, duration, price, description } = req.body;
    const db = req.app.locals.db;

    if (!name || !duration || !price) {
      return res.status(400).json({ error: 'Name, duration, and price are required' });
    }

    const insertService = db.prepare(`
      INSERT INTO services (name, duration, price, description)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = insertService.run(name, duration, price, description);

    res.status(201).json({
      message: 'Service created successfully',
      serviceId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// CRUD operations for staff
router.post('/staff', (req, res) => {
  try {
    const { name, email, phone, serviceIds } = req.body;
    const db = req.app.locals.db;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const insertStaff = db.prepare(`
      INSERT INTO staff (name, email, phone)
      VALUES (?, ?, ?)
    `);
    
    const result = insertStaff.run(name, email, phone);
    const staffId = result.lastInsertRowid;

    // Assign services to staff
    if (serviceIds && serviceIds.length > 0) {
      const insertStaffService = db.prepare(`
        INSERT INTO staff_services (staff_id, service_id) VALUES (?, ?)
      `);
      
      serviceIds.forEach(serviceId => {
        insertStaffService.run(staffId, serviceId);
      });
    }

    res.status(201).json({
      message: 'Staff member created successfully',
      staffId
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

// Update business hours
router.post('/hours', (req, res) => {
  try {
    const { businessHours } = req.body;
    const db = req.app.locals.db;

    if (!businessHours || typeof businessHours !== 'object') {
      return res.status(400).json({ error: 'Business hours object is required' });
    }

    const updateHours = db.prepare(`
      UPDATE business_hours 
      SET open_time = ?, close_time = ?, is_closed = ?
      WHERE day_of_week = ?
    `);

    Object.keys(businessHours).forEach(day => {
      const hours = businessHours[day];
      updateHours.run(
        hours.closed ? '00:00' : hours.open,
        hours.closed ? '00:00' : hours.close,
        hours.closed ? 1 : 0,
        day
      );
    });

    res.json({ message: 'Business hours updated successfully' });
  } catch (error) {
    console.error('Update business hours error:', error);
    res.status(500).json({ error: 'Failed to update business hours' });
  }
});

module.exports = router;