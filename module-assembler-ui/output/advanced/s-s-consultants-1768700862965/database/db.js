const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class BookingDatabase {
  constructor() {
    this.db = new Database('booking_system.db');
    this.initializeDatabase();
  }

  initializeDatabase() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      this.db.exec(schema);
    }
  }

  // User methods
  createUser(userData) {
    const stmt = this.db.prepare('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)');
    return stmt.run(userData.name, userData.email, userData.phone, userData.password, userData.role || 'customer');
  }

  getUserByEmail(email) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  getUserById(id) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  // Service methods
  getAllServices() {
    const stmt = this.db.prepare('SELECT * FROM services WHERE active = 1');
    return stmt.all();
  }

  getServiceById(id) {
    const stmt = this.db.prepare('SELECT * FROM services WHERE id = ?');
    return stmt.get(id);
  }

  // Staff methods
  getAllStaff() {
    const stmt = this.db.prepare('SELECT * FROM staff WHERE active = 1');
    return stmt.all();
  }

  getStaffByService(serviceId) {
    const stmt = this.db.prepare(`
      SELECT s.* FROM staff s
      JOIN staff_services ss ON s.id = ss.staff_id
      WHERE ss.service_id = ? AND s.active = 1
    `);
    return stmt.all(serviceId);
  }

  // Booking methods
  createBooking(bookingData) {
    const stmt = this.db.prepare(`
      INSERT INTO bookings (user_id, service_id, staff_id, booking_date, booking_time, notes, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      bookingData.user_id,
      bookingData.service_id,
      bookingData.staff_id,
      bookingData.booking_date,
      bookingData.booking_time,
      bookingData.notes || null,
      bookingData.total_price
    );
  }

  getBookingsByUser(userId) {
    const stmt = this.db.prepare(`
      SELECT b.*, s.name as service_name, st.name as staff_name, s.duration, s.price
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN staff st ON b.staff_id = st.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `);
    return stmt.all(userId);
  }

  getAllBookings() {
    const stmt = this.db.prepare(`
      SELECT b.*, u.name as user_name, u.email, s.name as service_name, st.name as staff_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      JOIN staff st ON b.staff_id = st.id
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `);
    return stmt.all();
  }

  getBookingById(id) {
    const stmt = this.db.prepare(`
      SELECT b.*, u.name as user_name, u.email, s.name as service_name, st.name as staff_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      JOIN staff st ON b.staff_id = st.id
      WHERE b.id = ?
    `);
    return stmt.get(id);
  }

  updateBookingStatus(id, status) {
    const stmt = this.db.prepare('UPDATE bookings SET status = ? WHERE id = ?');
    return stmt.run(status, id);
  }

  deleteBooking(id) {
    const stmt = this.db.prepare('DELETE FROM bookings WHERE id = ?');
    return stmt.run(id);
  }

  // Business hours methods
  getBusinessHours() {
    const stmt = this.db.prepare('SELECT * FROM business_hours ORDER BY day_of_week');
    return stmt.all();
  }

  // Utility methods
  checkAvailability(staffId, date, time, duration) {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM bookings
      WHERE staff_id = ? AND booking_date = ? AND booking_time = ? AND status != 'cancelled'
    `);
    const result = stmt.get(staffId, date, time);
    return result.count === 0;
  }

  close() {
    this.db.close();
  }
}

module.exports = BookingDatabase;