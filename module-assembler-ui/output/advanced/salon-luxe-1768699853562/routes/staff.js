const express = require('express');

const router = express.Router();

// Get list of staff with their services
router.get('/list', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const staffList = db.prepare(`
      SELECT id, name, email, phone
      FROM staff 
      WHERE active = 1
      ORDER BY name ASC
    `).all();

    // Get services for each staff member
    const staffWithServices = staffList.map(staff => {
      const services = db.prepare(`
        SELECT s.id, s.name, s.duration, s.price
        FROM services s
        JOIN staff_services ss ON s.id = ss.service_id
        WHERE ss.staff_id = ? AND s.active = 1
        ORDER BY s.price ASC
      `).all(staff.id);

      return {
        ...staff,
        services
      };
    });

    res.json({ staff: staffWithServices });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Failed to get staff list' });
  }
});

// Get staff availability for a specific date
router.get('/:id/availability', (req, res) => {
  try {
    const staffId = req.params.id;
    const { date } = req.query;
    const db = req.app.locals.db;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // Check if staff exists
    const staff = db.prepare(`
      SELECT id, name FROM staff WHERE id = ? AND active = 1
    `).get(staffId);

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Get day of week
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    // Get business hours for the day
    const businessHours = db.prepare(`
      SELECT open_time, close_time, is_closed 
      FROM business_hours 
      WHERE day_of_week = ?
    `).get(dayOfWeek);

    if (!businessHours || businessHours.is_closed) {
      return res.json({ 
        staff,
        date,
        available: false,
        businessHours: null,
        bookings: []
      });
    }

    // Get existing bookings for the staff on this date
    const bookings = db.prepare(`
      SELECT 
        b.booking_time,
        b.end_time,
        b.status,
        b.customer_name,
        s.name as service_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.staff_id = ? AND b.booking_date = ? AND b.status != 'cancelled'
      ORDER BY b.booking_time ASC
    `).all(staffId, date);

    res.json({
      staff,
      date,
      available: true,
      businessHours: {
        open: businessHours.open_time,
        close: businessHours.close_time
      },
      bookings
    });
  } catch (error) {
    console.error('Get staff availability error:', error);
    res.status(500).json({ error: 'Failed to get staff availability' });
  }
});

module.exports = router;