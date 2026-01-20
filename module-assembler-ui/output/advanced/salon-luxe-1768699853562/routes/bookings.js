const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to generate time slots
function generateTimeSlots(openTime, closeTime, duration) {
  const slots = [];
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);
  
  let currentHour = openHour;
  let currentMinute = openMinute;
  
  while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Calculate end time
    let endMinute = currentMinute + duration;
    let endHour = currentHour;
    
    if (endMinute >= 60) {
      endHour += Math.floor(endMinute / 60);
      endMinute = endMinute % 60;
    }
    
    // Check if slot fits within business hours
    if (endHour < closeHour || (endHour === closeHour && endMinute <= closeMinute)) {
      slots.push({
        time: timeString,
        endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
      });
    }
    
    // Move to next 30-minute slot
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute = 0;
    }
  }
  
  return slots;
}

// Get available time slots
router.get('/available-slots', (req, res) => {
  try {
    const { date, serviceId, staffId } = req.query;
    const db = req.app.locals.db;

    if (!date || !serviceId || !staffId) {
      return res.status(400).json({ error: 'Date, serviceId, and staffId are required' });
    }

    // Validate date (min 2hrs advance, max 30 days)
    const bookingDate = new Date(date);
    const now = new Date();
    const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    const maxTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    if (bookingDate < minTime) {
      return res.status(400).json({ error: 'Booking must be at least 2 hours in advance' });
    }

    if (bookingDate > maxTime) {
      return res.status(400).json({ error: 'Cannot book more than 30 days in advance' });
    }

    // Get service duration
    const service = db.prepare('SELECT duration FROM services WHERE id = ? AND active = 1').get(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Get day of week
    const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    // Get business hours for the day
    const businessHours = db.prepare(`
      SELECT open_time, close_time, is_closed 
      FROM business_hours 
      WHERE day_of_week = ?
    `).get(dayOfWeek);

    if (!businessHours || businessHours.is_closed) {
      return res.json({ availableSlots: [] });
    }

    // Generate all possible time slots
    const allSlots = generateTimeSlots(
      businessHours.open_time,
      businessHours.close_time,
      service.duration
    );

    // Get existing bookings for the date and staff
    const existingBookings = db.prepare(`
      SELECT booking_time, end_time 
      FROM bookings 
      WHERE staff_id = ? AND booking_date = ? AND status != 'cancelled'
    `).all(staffId, date);

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => {
      return !existingBookings.some(booking => {
        return (slot.time >= booking.booking_time && slot.time < booking.end_time) ||
               (slot.endTime > booking.booking_time && slot.endTime <= booking.end_time) ||
               (slot.time <= booking.booking_time && slot.endTime >= booking.end_time);
      });
    });

    res.json({ availableSlots: availableSlots.map(slot => slot.time) });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

// Book appointment
router.post('/book', (req, res) => {
  try {
    const { date, time, serviceId, staffId, customerInfo } = req.body;
    const db = req.app.locals.db;

    if (!date || !time || !serviceId || !staffId || !customerInfo) {
      return res.status(400).json({ error: 'All booking details are required' });
    }

    const { name, email, phone } = customerInfo;
    if (!name || !email) {
      return res.status(400).json({ error: 'Customer name and email are required' });
    }

    // Get service details
    const service = db.prepare('SELECT duration FROM services WHERE id = ? AND active = 1').get(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Calculate end time
    const [hour, minute] = time.split(':').map(Number);
    let endMinute = minute + service.duration;
    let endHour = hour;
    
    if (endMinute >= 60) {
      endHour += Math.floor(endMinute / 60);
      endMinute = endMinute % 60;
    }
    
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

    // Check for conflicts
    const conflict = db.prepare(`
      SELECT id FROM bookings 
      WHERE staff_id = ? AND booking_date = ? 
      AND status != 'cancelled'
      AND (
        (booking_time <= ? AND end_time > ?) OR
        (booking_time < ? AND end_time >= ?) OR
        (booking_time >= ? AND end_time <= ?)
      )
    `).get(staffId, date, time, time, endTime, endTime, time, endTime);

    if (conflict) {
      return res.status(400).json({ error: 'Time slot is no longer available' });
    }

    // Create booking
    const insertBooking = db.prepare(`
      INSERT INTO bookings (
        service_id, staff_id, booking_date, booking_time, end_time,
        customer_name, customer_email, customer_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertBooking.run(
      serviceId, staffId, date, time, endTime, name, email, phone
    );

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get customer's bookings
router.get('/my-bookings', verifyToken, (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const bookings = db.prepare(`
      SELECT 
        b.*,
        s.name as service_name,
        s.price,
        st.name as staff_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN staff st ON b.staff_id = st.id
      WHERE b.customer_id = ?
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `).all(req.user.userId);

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Cancel booking
router.post('/cancel/:id', verifyToken, (req, res) => {
  try {
    const bookingId = req.params.id;
    const db = req.app.locals.db;

    // Get booking details
    const booking = db.prepare(`
      SELECT booking_date, booking_time, customer_id 
      FROM bookings WHERE id = ?
    `).get(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.customer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    // Check 24-hour cancellation policy
    const bookingDateTime = new Date(`${booking.booking_date} ${booking.booking_time}`);
    const now = new Date();
    const timeDiff = bookingDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 24) {
      return res.status(400).json({ 
        error: 'Cannot cancel booking less than 24 hours before appointment' 
      });
    }

    // Cancel booking
    const updateBooking = db.prepare(`
      UPDATE bookings SET status = 'cancelled' WHERE id = ?
    `);
    
    updateBooking.run(bookingId);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Get upcoming bookings (next 7 days)
router.get('/upcoming', verifyToken, (req, res) => {
  try {
    const db = req.app.locals.db;
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const bookings = db.prepare(`
      SELECT 
        b.*,
        s.name as service_name,
        s.price,
        st.name as staff_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN staff st ON b.staff_id = st.id
      WHERE b.customer_id = ? 
      AND b.booking_date BETWEEN ? AND ?
      AND b.status = 'confirmed'
      ORDER BY b.booking_date ASC, b.booking_time ASC
    `).all(req.user.userId, today, nextWeek);

    res.json({ bookings });
  } catch (error) {
    console.error('Get upcoming bookings error:', error);
    res.status(500).json({ error: 'Failed to get upcoming bookings' });
  }
});

module.exports = router;