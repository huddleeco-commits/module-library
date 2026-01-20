const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class BookingDatabase {
  constructor(dbPath = 'booking.db') {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initDatabase();
  }

  initDatabase() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      this.db.exec(schema);
    }
  }

  // User management
  getUser(email) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  createUser(userData) {
    const { email, phone, password_hash, name, is_admin = false } = userData;
    const stmt = this.db.prepare(`
      INSERT INTO users (email, phone, password_hash, name, is_admin) 
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(email, phone, password_hash, name, is_admin);
    return result.lastInsertRowid;
  }

  // Service management
  getServices(activeOnly = true) {
    const query = activeOnly 
      ? 'SELECT * FROM services WHERE active = TRUE ORDER BY name'
      : 'SELECT * FROM services ORDER BY name';
    const stmt = this.db.prepare(query);
    return stmt.all();
  }

  // Staff management
  getStaff(activeOnly = true) {
    const query = activeOnly 
      ? 'SELECT * FROM staff WHERE active = TRUE ORDER BY name'
      : 'SELECT * FROM staff ORDER BY name';
    const stmt = this.db.prepare(query);
    return stmt.all();
  }

  getStaffServices(staffId) {
    const stmt = this.db.prepare(`
      SELECT s.* FROM services s
      JOIN staff_services ss ON s.id = ss.service_id
      WHERE ss.staff_id = ? AND s.active = TRUE
      ORDER BY s.name
    `);
    return stmt.all(staffId);
  }

  // Business hours
  getBusinessHours() {
    const stmt = this.db.prepare('SELECT * FROM business_hours ORDER BY day_of_week');
    return stmt.all();
  }

  // Available slots calculation
  getAvailableSlots(date, serviceId, staffId) {
    // Get service duration
    const serviceStmt = this.db.prepare('SELECT duration_minutes FROM services WHERE id = ?');
    const service = serviceStmt.get(serviceId);
    if (!service) return [];

    // Get business hours for the day
    const dayOfWeek = new Date(date).getDay();
    const hoursStmt = this.db.prepare('SELECT * FROM business_hours WHERE day_of_week = ?');
    const businessHours = hoursStmt.get(dayOfWeek);
    
    if (!businessHours || businessHours.is_closed) return [];

    // Get existing bookings for the date and staff
    const bookingsStmt = this.db.prepare(`
      SELECT start_time, end_time FROM bookings 
      WHERE date = ? AND staff_id = ? AND status NOT IN ('cancelled', 'no-show')
      ORDER BY start_time
    `);
    const existingBookings = bookingsStmt.all(date, staffId);

    // Generate available slots
    const slots = [];
    const openTime = this.parseTime(businessHours.open_time);
    const closeTime = this.parseTime(businessHours.close_time);
    const duration = service.duration_minutes;

    for (let time = openTime; time + duration <= closeTime; time += 15) { // 15-minute intervals
      const startTime = this.formatTime(time);
      const endTime = this.formatTime(time + duration);
      
      // Check if slot conflicts with existing bookings
      const hasConflict = existingBookings.some(booking => {
        const bookingStart = this.parseTime(booking.start_time);
        const bookingEnd = this.parseTime(booking.end_time);
        return (time < bookingEnd && time + duration > bookingStart);
      });

      if (!hasConflict) {
        slots.push({ start_time: startTime, end_time: endTime });
      }
    }

    return slots;
  }

  // Booking management
  createBooking(bookingData) {
    const { customer_id, service_id, staff_id, date, start_time, end_time, notes = null } = bookingData;
    const stmt = this.db.prepare(`
      INSERT INTO bookings (customer_id, service_id, staff_id, date, start_time, end_time, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(customer_id, service_id, staff_id, date, start_time, end_time, notes);
    return result.lastInsertRowid;
  }

  getBookings(filters = {}) {
    let query = `
      SELECT 
        b.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        s.name as service_name,
        s.price as service_price,
        st.name as staff_name
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN services s ON b.service_id = s.id
      JOIN staff st ON b.staff_id = st.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.customer_id) {
      query += ' AND b.customer_id = ?';
      params.push(filters.customer_id);
    }
    
    if (filters.staff_id) {
      query += ' AND b.staff_id = ?';
      params.push(filters.staff_id);
    }
    
    if (filters.date) {
      query += ' AND b.date = ?';
      params.push(filters.date);
    }
    
    if (filters.status) {
      query += ' AND b.status = ?';
      params.push(filters.status);
    }
    
    query += ' ORDER BY b.date DESC, b.start_time DESC';
    
    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  updateBookingStatus(bookingId, status, notes = null) {
    const stmt = this.db.prepare(`
      UPDATE bookings 
      SET status = ?, notes = COALESCE(?, notes)
      WHERE id = ?
    `);
    const result = stmt.run(status, notes, bookingId);
    return result.changes > 0;
  }

  // Statistics
  getStats() {
    const totalBookings = this.db.prepare('SELECT COUNT(*) as count FROM bookings').get();
    const todayBookings = this.db.prepare(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE date = date('now') AND status NOT IN ('cancelled', 'no-show')
    `).get();
    const monthlyRevenue = this.db.prepare(`
      SELECT SUM(s.price) as revenue FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.date >= date('now', 'start of month') 
      AND b.status IN ('confirmed', 'completed')
    `).get();
    const popularServices = this.db.prepare(`
      SELECT s.name, COUNT(*) as booking_count
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.status NOT IN ('cancelled', 'no-show')
      GROUP BY s.id, s.name
      ORDER BY booking_count DESC
      LIMIT 5
    `).all();

    return {
      totalBookings: totalBookings.count,
      todayBookings: todayBookings.count,
      monthlyRevenue: monthlyRevenue.revenue || 0,
      popularServices
    };
  }

  // Utility methods
  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  close() {
    this.db.close();
  }
}

module.exports = BookingDatabase;