const express = require('express');

const router = express.Router();

// Get all staff
router.get('/list', (req, res) => {
  try {
    const db = req.app.locals.db;
    const staff = db.prepare('SELECT id, name, email, available_days, start_time, end_time FROM staff').all();
    
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get staff' });
  }
});

// Get staff availability
router.get('/:id/availability', (req, res) => {
  try {
    const db = req.app.locals.db;
    const staffId = req.params.id;
    const { date } = req.query;
    
    const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staffId);
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    
    let availability = {
      id: staff.id,
      name: staff.name,
      available_days: staff.available_days.split(','),
      start_time: staff.start_time,
      end_time: staff.end_time,
      is_available: true
    };
    
    // If specific date is provided, check if available that day
    if (date) {
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
      const availableDays = staff.available_days.split(',');
      
      availability.is_available = availableDays.includes(dayOfWeek);
      
      // Get existing bookings for that date
      const bookings = db.prepare(`
        SELECT booking_time, s.duration
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.staff_id = ? AND b.booking_date = ? AND b.status != 'cancelled'
        ORDER BY b.booking_time
      `).all(staffId, date);
      
      availability.bookings = bookings;
    }
    
    res.json({ availability });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get staff availability' });
  }
});

module.exports = router;