const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get available slots
router.get('/available-slots', (req, res) => {
  try {
    const { date, serviceId, staffId } = req.query;
    const db = req.app.locals.db;

    if (!date || !serviceId || !staffId) {
      return res.status(400).json({ error: 'Date, serviceId and staffId are required' });
    }

    // Get service duration
    const service = db.prepare('SELECT duration FROM services WHERE id = ?').get(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Get staff availability
    const staff = db.prepare('SELECT start_time, end_time, available_days FROM staff WHERE id = ?').get(staffId);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Check if date is available for staff
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const availableDays = staff.available_days.split(',');
    
    if (!availableDays.includes(dayOfWeek)) {
      return res.json({ slots: [] });
    }

    // Generate time slots
    const startHour = parseInt(staff.start_time.split(':')[0]);
    const startMinute = parseInt(staff.start_time.split(':')[1]);
    const endHour = parseInt(staff.end_time.split(':')[0]);
    const endMinute = parseInt(staff.end_time.split(':')[1]);

    const slots = [];
    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Check if enough time remaining for service
      const slotEndMinutes = currentHour * 60 + currentMinute + service.duration;
      const dayEndMinutes = endHour * 60 + endMinute;
      
      if (slotEndMinutes <= dayEndMinutes) {
        // Check if slot is available (no existing booking)
        const existingBooking = db.prepare(
          'SELECT id FROM bookings WHERE staff_id = ? AND booking_date = ? AND booking_time = ? AND status != "cancelled"'
        ).get(staffId, date, timeSlot);

        if (!existingBooking) {
          slots.push({ time: timeSlot, available: true });
        }
      }

      // Increment by 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    res.json({ slots });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

// Book appointment
router.post('/book', verifyToken, (req, res) => {
  try {
    const { serviceId, staffId, bookingDate, bookingTime, notes } = req.body;
    const db = req.app.locals.db;
    const userId = req.user.userId;

    if (!serviceId || !staffId || !bookingDate || !bookingTime) {
      return res.status(400).json({ error: 'All booking details are required' });
    }

    // Check if slot is still available
    const existingBooking = db.prepare(
      'SELECT id FROM bookings WHERE staff_id = ? AND booking_date = ? AND booking_time = ? AND status != "cancelled"'
    ).get(staffId, bookingDate, bookingTime);

    if (existingBooking) {
      return res.status(400).json({ error: 'Time slot is no longer available' });
    }

    // Create booking
    const insertBooking = db.prepare(
      'INSERT INTO bookings (user_id, service_id, staff_id, booking_date, booking_time, notes) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = insertBooking.run(userId, serviceId, staffId, bookingDate, bookingTime, notes || null);

    // Get booking details
    const booking = db.prepare(`
      SELECT b.*, s.name as service_name, s.price, st.name as staff_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN staff st ON b.staff_id = st.id
      WHERE b.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user's bookings
router.get('/my-bookings', verifyToken, (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;

    const bookings = db.prepare(`
      SELECT b.*, s.name as service_name, s.duration, s.price, st.name as staff_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN staff st ON b.staff_id = st.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `).all(userId);

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Cancel booking
router.post('/cancel/:id', verifyToken, (req, res) => {
  try {
    const db = req.app.locals.db;
    const bookingId = req.params.id;
    const userId = req.user.userId;

    // Check if booking exists and belongs to user
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(bookingId, userId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    // Update booking status
    const updateBooking = db.prepare('UPDATE bookings SET status = "cancelled" WHERE id = ?');
    updateBooking.run(bookingId);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;