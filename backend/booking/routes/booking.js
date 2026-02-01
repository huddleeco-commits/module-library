/**
 * Booking Routes - Universal Booking System
 * API endpoints for appointment/reservation management
 *
 * Used by:
 * - Website (booking widget)
 * - Companion App (schedule appointments)
 * - Admin Dashboard (manage bookings)
 *
 * Features:
 * - Database mode: Uses PostgreSQL when DATABASE_URL is set
 * - Test mode: Returns industry-specific mock data when no database
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// ============================================
// INDUSTRY-SPECIFIC TEST DATA
// ============================================

const TEST_SERVICES = {
  'spa': [
    { id: 1, name: 'Swedish Massage', description: '60 minutes of relaxation', price: 95, duration: 60, category: 'Massage', is_popular: true },
    { id: 2, name: 'Deep Tissue Massage', description: 'Targeted muscle relief', price: 115, duration: 60, category: 'Massage', is_popular: true },
    { id: 3, name: 'Hot Stone Massage', description: 'Heated stones, full body', price: 125, duration: 75, category: 'Massage' },
    { id: 4, name: 'Signature Facial', description: 'Deep cleanse, hydration', price: 85, duration: 60, category: 'Facial', is_popular: true },
    { id: 5, name: 'Anti-Aging Facial', description: 'Collagen boost treatment', price: 120, duration: 75, category: 'Facial' },
    { id: 6, name: 'Body Scrub', description: 'Exfoliation, moisturize', price: 75, duration: 45, category: 'Body' },
    { id: 7, name: 'Couples Massage', description: 'Side by side relaxation', price: 180, duration: 60, category: 'Packages', is_popular: true },
    { id: 8, name: 'Spa Day Package', description: 'Massage + Facial + Lunch', price: 250, duration: 180, category: 'Packages' }
  ],

  'salon': [
    { id: 1, name: 'Haircut & Style', description: 'Cut, wash, blow dry', price: 55, duration: 45, category: 'Hair', is_popular: true },
    { id: 2, name: 'Color Service', description: 'Full color application', price: 95, duration: 90, category: 'Hair', is_popular: true },
    { id: 3, name: 'Highlights', description: 'Partial or full', price: 125, duration: 120, category: 'Hair' },
    { id: 4, name: 'Balayage', description: 'Hand-painted highlights', price: 175, duration: 150, category: 'Hair', is_popular: true },
    { id: 5, name: 'Blowout', description: 'Wash and style', price: 45, duration: 45, category: 'Hair' },
    { id: 6, name: 'Manicure', description: 'Shape, polish, massage', price: 35, duration: 30, category: 'Nails' },
    { id: 7, name: 'Pedicure', description: 'Full spa pedicure', price: 55, duration: 45, category: 'Nails', is_popular: true },
    { id: 8, name: 'Gel Manicure', description: 'Long-lasting gel polish', price: 50, duration: 45, category: 'Nails' }
  ],

  'barbershop': [
    { id: 1, name: 'Classic Cut', description: 'Haircut with clippers and scissors', price: 30, duration: 30, category: 'Cuts', is_popular: true },
    { id: 2, name: 'Fade', description: 'Precision fade haircut', price: 35, duration: 30, category: 'Cuts', is_popular: true },
    { id: 3, name: 'Cut & Beard Trim', description: 'Haircut plus beard shaping', price: 45, duration: 45, category: 'Cuts', is_popular: true },
    { id: 4, name: 'Hot Towel Shave', description: 'Classic straight razor shave', price: 35, duration: 30, category: 'Shave' },
    { id: 5, name: 'Beard Trim', description: 'Shape and line up', price: 20, duration: 15, category: 'Beard' },
    { id: 6, name: 'Beard Treatment', description: 'Trim, oil, hot towel', price: 35, duration: 30, category: 'Beard' },
    { id: 7, name: 'Kids Cut', description: 'Ages 12 and under', price: 20, duration: 20, category: 'Cuts' },
    { id: 8, name: 'Senior Cut', description: '65 and over', price: 25, duration: 30, category: 'Cuts' }
  ],

  'dental': [
    { id: 1, name: 'Dental Cleaning', description: 'Routine cleaning and exam', price: 150, duration: 60, category: 'Preventive', is_popular: true },
    { id: 2, name: 'Comprehensive Exam', description: 'Full exam with X-rays', price: 200, duration: 60, category: 'Preventive' },
    { id: 3, name: 'Teeth Whitening', description: 'In-office whitening treatment', price: 350, duration: 90, category: 'Cosmetic', is_popular: true },
    { id: 4, name: 'Filling', description: 'Composite filling', price: 200, duration: 45, category: 'Restorative' },
    { id: 5, name: 'Crown', description: 'Porcelain crown', price: 1200, duration: 90, category: 'Restorative' },
    { id: 6, name: 'Root Canal', description: 'Single tooth', price: 900, duration: 90, category: 'Restorative' },
    { id: 7, name: 'Emergency Visit', description: 'Same-day urgent care', price: 175, duration: 30, category: 'Emergency', is_popular: true },
    { id: 8, name: 'Invisalign Consult', description: 'Free consultation', price: 0, duration: 30, category: 'Cosmetic' }
  ],

  'healthcare': [
    { id: 1, name: 'Annual Physical', description: 'Comprehensive health exam', price: 250, duration: 60, category: 'Preventive', is_popular: true },
    { id: 2, name: 'Sick Visit', description: 'Same-day illness appointment', price: 125, duration: 30, category: 'Urgent', is_popular: true },
    { id: 3, name: 'Follow-Up Visit', description: 'Check progress on treatment', price: 100, duration: 20, category: 'General' },
    { id: 4, name: 'Lab Work', description: 'Blood tests and analysis', price: 75, duration: 15, category: 'Diagnostic' },
    { id: 5, name: 'Vaccination', description: 'Flu, COVID, other vaccines', price: 45, duration: 15, category: 'Preventive' },
    { id: 6, name: 'Telehealth Visit', description: 'Virtual consultation', price: 75, duration: 20, category: 'Virtual', is_popular: true }
  ],

  'fitness': [
    { id: 1, name: 'Personal Training (1 hr)', description: 'One-on-one training session', price: 75, duration: 60, category: 'Training', is_popular: true },
    { id: 2, name: 'PT Package (5 sessions)', description: 'Save $50', price: 325, duration: 60, category: 'Packages', is_popular: true },
    { id: 3, name: 'Group Fitness Class', description: 'Drop-in class', price: 20, duration: 45, category: 'Classes' },
    { id: 4, name: 'Nutrition Consultation', description: 'Personalized meal planning', price: 100, duration: 60, category: 'Nutrition' },
    { id: 5, name: 'Body Composition Analysis', description: 'InBody scan and review', price: 50, duration: 30, category: 'Assessment' },
    { id: 6, name: 'Free Trial', description: 'First session free', price: 0, duration: 60, category: 'Consultation', is_popular: true }
  ],

  'yoga': [
    { id: 1, name: 'Drop-In Class', description: 'Single class visit', price: 25, duration: 60, category: 'Classes', is_popular: true },
    { id: 2, name: 'Class Pack (10)', description: '10 classes, use anytime', price: 200, duration: 60, category: 'Packages', is_popular: true },
    { id: 3, name: 'Monthly Unlimited', description: 'All classes included', price: 150, duration: 0, category: 'Membership' },
    { id: 4, name: 'Private Session', description: 'One-on-one instruction', price: 85, duration: 60, category: 'Private', is_popular: true },
    { id: 5, name: 'First Class Free', description: 'New students only', price: 0, duration: 60, category: 'Trial' }
  ],

  'plumber': [
    { id: 1, name: 'Emergency Service', description: '24/7 emergency plumbing', price: 150, duration: 60, category: 'Emergency', is_popular: true },
    { id: 2, name: 'Drain Cleaning', description: 'Clear clogged drains', price: 125, duration: 60, category: 'Drains', is_popular: true },
    { id: 3, name: 'Water Heater Service', description: 'Repair or replace', price: 200, duration: 90, category: 'Water Heater' },
    { id: 4, name: 'Leak Detection', description: 'Find and fix leaks', price: 175, duration: 60, category: 'Repairs' },
    { id: 5, name: 'Fixture Installation', description: 'Faucet, toilet, etc.', price: 150, duration: 60, category: 'Installation' },
    { id: 6, name: 'Free Estimate', description: 'On-site estimate', price: 0, duration: 30, category: 'Consultation', is_popular: true }
  ],

  'electrician': [
    { id: 1, name: 'Emergency Service', description: '24/7 electrical emergency', price: 175, duration: 60, category: 'Emergency', is_popular: true },
    { id: 2, name: 'Outlet Installation', description: 'New outlet or upgrade', price: 125, duration: 45, category: 'Installation' },
    { id: 3, name: 'Panel Upgrade', description: 'Electrical panel replacement', price: 500, duration: 180, category: 'Panel' },
    { id: 4, name: 'Lighting Installation', description: 'Fixtures, recessed lights', price: 150, duration: 60, category: 'Lighting', is_popular: true },
    { id: 5, name: 'Ceiling Fan Install', description: 'New fan installation', price: 125, duration: 60, category: 'Installation' },
    { id: 6, name: 'Free Estimate', description: 'On-site evaluation', price: 0, duration: 30, category: 'Consultation', is_popular: true }
  ],

  'restaurant': [
    { id: 1, name: 'Table for 2', description: 'Reservation for 2 guests', price: 0, duration: 90, category: 'Dining', is_popular: true },
    { id: 2, name: 'Table for 4', description: 'Reservation for 4 guests', price: 0, duration: 90, category: 'Dining', is_popular: true },
    { id: 3, name: 'Private Dining', description: 'Private room (6-10 guests)', price: 100, duration: 180, category: 'Private' },
    { id: 4, name: 'Large Party', description: 'Groups of 10+ guests', price: 0, duration: 180, category: 'Groups' },
    { id: 5, name: 'Special Occasion', description: 'Birthday, anniversary, etc.', price: 0, duration: 120, category: 'Events', is_popular: true }
  ]
};

// Business hours by industry (start hour, end hour, slot duration in minutes)
const BUSINESS_HOURS = {
  'spa': { open: 9, close: 19, slotDuration: 60 },
  'salon': { open: 9, close: 19, slotDuration: 30 },
  'barbershop': { open: 9, close: 19, slotDuration: 30 },
  'dental': { open: 8, close: 17, slotDuration: 30 },
  'healthcare': { open: 8, close: 17, slotDuration: 30 },
  'fitness': { open: 5, close: 21, slotDuration: 60 },
  'yoga': { open: 6, close: 20, slotDuration: 60 },
  'plumber': { open: 7, close: 19, slotDuration: 60 },
  'electrician': { open: 7, close: 18, slotDuration: 60 },
  'restaurant': { open: 11, close: 22, slotDuration: 60 },
  'default': { open: 9, close: 18, slotDuration: 60 }
};

// In-memory bookings for test mode
const testBookings = [];

// Get industry from brain.json or environment
function getIndustry() {
  try {
    const brainPath = path.join(__dirname, '../../../brain.json');
    if (fs.existsSync(brainPath)) {
      const brain = JSON.parse(fs.readFileSync(brainPath, 'utf8'));
      return brain.industry || 'general';
    }
    return process.env.INDUSTRY || 'general';
  } catch (e) {
    return 'general';
  }
}

// Get test services for the current industry
function getTestServices() {
  const industry = getIndustry().toLowerCase();

  // Direct match
  if (TEST_SERVICES[industry]) {
    return TEST_SERVICES[industry];
  }

  // Fuzzy match
  if (industry.includes('spa') || industry.includes('massage')) return TEST_SERVICES['spa'];
  if (industry.includes('salon') || industry.includes('hair') || industry.includes('beauty')) return TEST_SERVICES['salon'];
  if (industry.includes('barber')) return TEST_SERVICES['barbershop'];
  if (industry.includes('dental') || industry.includes('dentist')) return TEST_SERVICES['dental'];
  if (industry.includes('health') || industry.includes('medical') || industry.includes('clinic')) return TEST_SERVICES['healthcare'];
  if (industry.includes('fitness') || industry.includes('gym')) return TEST_SERVICES['fitness'];
  if (industry.includes('yoga') || industry.includes('pilates')) return TEST_SERVICES['yoga'];
  if (industry.includes('plumb')) return TEST_SERVICES['plumber'];
  if (industry.includes('electric')) return TEST_SERVICES['electrician'];
  if (industry.includes('restaurant') || industry.includes('dining')) return TEST_SERVICES['restaurant'];

  // Default to spa (most common booking-based business)
  return TEST_SERVICES['spa'];
}

// Get business hours for the current industry
function getBusinessHours() {
  const industry = getIndustry().toLowerCase();

  for (const key of Object.keys(BUSINESS_HOURS)) {
    if (industry.includes(key)) {
      return BUSINESS_HOURS[key];
    }
  }

  return BUSINESS_HOURS['default'];
}

// Generate time slots for a given date
function generateTimeSlots(date) {
  const hours = getBusinessHours();
  const slots = [];

  for (let hour = hours.open; hour < hours.close; hour++) {
    for (let min = 0; min < 60; min += hours.slotDuration) {
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const displayTime = `${displayHour}:${min.toString().padStart(2, '0')} ${ampm}`;

      // Check if slot is booked (in test mode, randomize some as unavailable)
      const isBooked = testBookings.some(b =>
        b.booking_date === date && b.start_time === time && b.status !== 'cancelled'
      );

      slots.push({
        time,
        displayTime,
        available: !isBooked
      });
    }
  }

  return slots;
}

// Helper to get database
const getDb = (req) => {
  return req.db || null;
};

// ============================================
// PUBLIC ROUTES
// ============================================

// GET /api/booking - Get all bookings (with filters)
router.get('/', async (req, res) => {
  try {
    const db = getDb(req);
    const { status, date, startDate, endDate, userId } = req.query;

    if (db && typeof db.query === 'function') {
      let query = 'SELECT * FROM bookings WHERE 1=1';
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push(status);
      }
      if (userId) {
        paramCount++;
        query += ` AND user_id = $${paramCount}`;
        params.push(userId);
      }
      if (date) {
        paramCount++;
        query += ` AND DATE(booking_date) = $${paramCount}`;
        params.push(date);
      } else if (startDate && endDate) {
        paramCount++;
        query += ` AND booking_date >= $${paramCount}`;
        params.push(startDate);
        paramCount++;
        query += ` AND booking_date <= $${paramCount}`;
        params.push(endDate);
      }

      query += ' ORDER BY booking_date ASC, start_time ASC';

      const result = await db.query(query, params);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        source: 'database'
      });
    } else {
      // Test mode - filter in-memory bookings
      let filtered = [...testBookings];

      if (status) filtered = filtered.filter(b => b.status === status);
      if (userId) filtered = filtered.filter(b => b.user_id === userId);
      if (date) filtered = filtered.filter(b => b.booking_date === date);

      res.json({
        success: true,
        count: filtered.length,
        data: filtered,
        source: 'test-data'
      });
    }
  } catch (error) {
    console.error('[Booking] Error fetching bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// GET /api/booking/services - Get available services for booking
router.get('/services', async (req, res) => {
  try {
    const db = getDb(req);

    if (db && typeof db.query === 'function') {
      const result = await db.query('SELECT * FROM services WHERE is_active = 1 ORDER BY category, name');
      res.json({
        success: true,
        services: result.rows || result,
        source: 'database'
      });
    } else {
      const services = getTestServices();
      res.json({
        success: true,
        services,
        industry: getIndustry(),
        source: 'test-data'
      });
    }
  } catch (error) {
    console.error('[Booking] Error fetching services:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch services' });
  }
});

// GET /api/booking/slots/:date - Get available time slots for a date
router.get('/slots/:date', async (req, res) => {
  try {
    const db = getDb(req);
    const { date } = req.params;
    const { service_id, duration } = req.query;

    const hours = getBusinessHours();

    if (db && typeof db.query === 'function') {
      // Get booked slots for this date
      const bookedResult = await db.query(
        `SELECT start_time, end_time FROM bookings
         WHERE DATE(booking_date) = $1 AND status != 'cancelled'`,
        [date]
      );

      const bookedTimes = bookedResult.rows.map(b => b.start_time);

      // Generate available slots
      const slots = [];
      for (let hour = hours.open; hour < hours.close; hour++) {
        for (let min = 0; min < 60; min += hours.slotDuration) {
          const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          if (!bookedTimes.includes(time)) {
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            slots.push({
              time,
              displayTime: `${displayHour}:${min.toString().padStart(2, '0')} ${ampm}`,
              available: true
            });
          }
        }
      }

      res.json({
        success: true,
        date,
        businessHours: hours,
        slots,
        bookedCount: bookedTimes.length,
        source: 'database'
      });
    } else {
      // Test mode - generate slots with some randomly unavailable
      const slots = generateTimeSlots(date);

      res.json({
        success: true,
        date,
        businessHours: hours,
        slots,
        industry: getIndustry(),
        source: 'test-data'
      });
    }
  } catch (error) {
    console.error('[Booking] Error fetching slots:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch available slots' });
  }
});

// GET /api/booking/:id - Get single booking
router.get('/:id', async (req, res) => {
  try {
    const db = getDb(req);
    const bookingId = req.params.id;

    if (db && typeof db.query === 'function') {
      const result = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      res.json({ success: true, data: result.rows[0], source: 'database' });
    } else {
      const booking = testBookings.find(b => b.id === bookingId || b.id === parseInt(bookingId));

      if (!booking) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      res.json({ success: true, data: booking, source: 'test-data' });
    }
  } catch (error) {
    console.error('[Booking] Error fetching booking:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch booking' });
  }
});

// POST /api/booking - Create new booking
router.post('/', async (req, res) => {
  try {
    const db = getDb(req);
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      serviceType,
      serviceId,
      bookingDate,
      startTime,
      endTime,
      notes,
      partySize
    } = req.body;

    // Validation
    if (!bookingDate || !startTime) {
      return res.status(400).json({ success: false, error: 'Date and time are required' });
    }
    if (!customerName && !customerEmail) {
      return res.status(400).json({ success: false, error: 'Customer name or email is required' });
    }

    if (db && typeof db.query === 'function') {
      // Check for conflicts
      const conflictResult = await db.query(
        `SELECT id FROM bookings
         WHERE DATE(booking_date) = $1
         AND start_time = $2
         AND status != 'cancelled'`,
        [bookingDate, startTime]
      );

      if (conflictResult.rows.length > 0) {
        return res.status(400).json({ success: false, error: 'This time slot is already booked' });
      }

      // Create booking
      const result = await db.query(
        `INSERT INTO bookings (
          user_id, customer_name, customer_email, customer_phone,
          service_type, booking_date, start_time, end_time,
          notes, party_size, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'confirmed', NOW())
        RETURNING *`,
        [
          userId || null,
          customerName,
          customerEmail,
          customerPhone,
          serviceType || 'general',
          bookingDate,
          startTime,
          endTime || null,
          notes || null,
          partySize || 1
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: result.rows[0],
        source: 'database'
      });
    } else {
      // Test mode - create in-memory booking
      const booking = {
        id: 'BK-' + Date.now(),
        user_id: userId || null,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        service_type: serviceType || 'general',
        service_id: serviceId || null,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime || null,
        notes: notes || null,
        party_size: partySize || 1,
        status: 'confirmed',
        created_at: new Date().toISOString()
      };

      testBookings.push(booking);

      res.status(201).json({
        success: true,
        message: 'Booking created (test mode)',
        data: booking,
        source: 'test-data'
      });
    }
  } catch (error) {
    console.error('[Booking] Error creating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to create booking' });
  }
});

// PUT /api/booking/:id - Update booking
router.put('/:id', async (req, res) => {
  try {
    const db = getDb(req);
    const bookingId = req.params.id;
    const { serviceType, bookingDate, startTime, endTime, notes, partySize } = req.body;

    if (db && typeof db.query === 'function') {
      const result = await db.query(
        `UPDATE bookings SET
          service_type = COALESCE($1, service_type),
          booking_date = COALESCE($2, booking_date),
          start_time = COALESCE($3, start_time),
          end_time = COALESCE($4, end_time),
          notes = COALESCE($5, notes),
          party_size = COALESCE($6, party_size),
          updated_at = NOW()
        WHERE id = $7
        RETURNING *`,
        [serviceType, bookingDate, startTime, endTime, notes, partySize, bookingId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      res.json({
        success: true,
        message: 'Booking updated successfully',
        data: result.rows[0],
        source: 'database'
      });
    } else {
      // Test mode - update in-memory
      const idx = testBookings.findIndex(b => b.id === bookingId || b.id === parseInt(bookingId));

      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      testBookings[idx] = {
        ...testBookings[idx],
        service_type: serviceType || testBookings[idx].service_type,
        booking_date: bookingDate || testBookings[idx].booking_date,
        start_time: startTime || testBookings[idx].start_time,
        end_time: endTime || testBookings[idx].end_time,
        notes: notes !== undefined ? notes : testBookings[idx].notes,
        party_size: partySize || testBookings[idx].party_size,
        updated_at: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Booking updated (test mode)',
        data: testBookings[idx],
        source: 'test-data'
      });
    }
  } catch (error) {
    console.error('[Booking] Error updating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
});

// PATCH /api/booking/:id/status - Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const db = getDb(req);
    const bookingId = req.params.id;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    if (db && typeof db.query === 'function') {
      const result = await db.query(
        `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, bookingId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      res.json({
        success: true,
        message: 'Booking status updated',
        data: result.rows[0],
        source: 'database'
      });
    } else {
      const idx = testBookings.findIndex(b => b.id === bookingId || b.id === parseInt(bookingId));

      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      testBookings[idx].status = status;
      testBookings[idx].updated_at = new Date().toISOString();

      res.json({
        success: true,
        message: 'Booking status updated (test mode)',
        data: testBookings[idx],
        source: 'test-data'
      });
    }
  } catch (error) {
    console.error('[Booking] Error updating status:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// POST /api/booking/:id/cancel - Cancel booking
router.post('/:id/cancel', async (req, res) => {
  try {
    const db = getDb(req);
    const bookingId = req.params.id;
    const { reason } = req.body;

    if (db && typeof db.query === 'function') {
      const result = await db.query(
        `UPDATE bookings SET
          status = 'cancelled',
          cancellation_reason = $1,
          cancelled_at = NOW(),
          updated_at = NOW()
        WHERE id = $2
        RETURNING *`,
        [reason || null, bookingId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      res.json({
        success: true,
        message: 'Booking cancelled',
        data: result.rows[0],
        source: 'database'
      });
    } else {
      const idx = testBookings.findIndex(b => b.id === bookingId || b.id === parseInt(bookingId));

      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      testBookings[idx].status = 'cancelled';
      testBookings[idx].cancellation_reason = reason || null;
      testBookings[idx].cancelled_at = new Date().toISOString();

      res.json({
        success: true,
        message: 'Booking cancelled (test mode)',
        data: testBookings[idx],
        source: 'test-data'
      });
    }
  } catch (error) {
    console.error('[Booking] Error cancelling booking:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel booking' });
  }
});

// DELETE /api/booking/:id - Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb(req);
    const bookingId = req.params.id;

    if (db && typeof db.query === 'function') {
      const result = await db.query(
        'DELETE FROM bookings WHERE id = $1 RETURNING id',
        [bookingId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      res.json({ success: true, message: 'Booking deleted successfully', source: 'database' });
    } else {
      const idx = testBookings.findIndex(b => b.id === bookingId || b.id === parseInt(bookingId));

      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      testBookings.splice(idx, 1);

      res.json({
        success: true,
        message: 'Booking deleted (test mode)',
        source: 'test-data'
      });
    }
  } catch (error) {
    console.error('[Booking] Error deleting booking:', error);
    res.status(500).json({ success: false, error: 'Failed to delete booking' });
  }
});

// GET /api/booking/user/:userId - Get user's bookings
router.get('/user/:userId', async (req, res) => {
  try {
    const db = getDb(req);
    const userId = req.params.userId;

    if (db && typeof db.query === 'function') {
      const result = await db.query(
        `SELECT * FROM bookings WHERE user_id = $1 ORDER BY booking_date DESC`,
        [userId]
      );

      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        source: 'database'
      });
    } else {
      const userBookings = testBookings.filter(b => b.user_id === userId);

      res.json({
        success: true,
        count: userBookings.length,
        data: userBookings,
        source: 'test-data'
      });
    }
  } catch (error) {
    console.error('[Booking] Error fetching user bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

module.exports = router;
