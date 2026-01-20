const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const Database = require('better-sqlite3');

const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const serviceRoutes = require('./routes/services');
const staffRoutes = require('./routes/staff');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Database initialization
const db = new Database('salon_luxe.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS staff_services (
    staff_id INTEGER,
    service_id INTEGER,
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    PRIMARY KEY (staff_id, service_id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    service_id INTEGER NOT NULL,
    staff_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'confirmed',
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
  );

  CREATE TABLE IF NOT EXISTS business_hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week TEXT NOT NULL,
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT 0
  );
`);

// Insert default data
const insertServices = db.prepare(`
  INSERT OR IGNORE INTO services (id, name, duration, price, description) 
  VALUES (?, ?, ?, ?, ?)
`);

const insertStaff = db.prepare(`
  INSERT OR IGNORE INTO staff (id, name, email) 
  VALUES (?, ?, ?)
`);

const insertStaffServices = db.prepare(`
  INSERT OR IGNORE INTO staff_services (staff_id, service_id) 
  VALUES (?, ?)
`);

const insertBusinessHours = db.prepare(`
  INSERT OR IGNORE INTO business_hours (day_of_week, open_time, close_time, is_closed) 
  VALUES (?, ?, ?, ?)
`);

// Default services
insertServices.run(1, 'Consultation', 30, 50.00, 'Professional consultation service');
insertServices.run(2, 'Standard Service', 60, 100.00, 'Our standard premium service');
insertServices.run(3, 'Premium Service', 90, 150.00, 'Luxury premium service experience');

// Default staff
insertStaff.run(1, 'Sherms', 'sherms@salonluxe.com');

// Assign all services to Sherms
insertStaffServices.run(1, 1);
insertStaffServices.run(1, 2);
insertStaffServices.run(1, 3);

// Business hours
insertBusinessHours.run('monday', '09:00', '17:00', 0);
insertBusinessHours.run('tuesday', '09:00', '17:00', 0);
insertBusinessHours.run('wednesday', '09:00', '17:00', 0);
insertBusinessHours.run('thursday', '09:00', '17:00', 0);
insertBusinessHours.run('friday', '09:00', '17:00', 0);
insertBusinessHours.run('saturday', '10:00', '14:00', 0);
insertBusinessHours.run('sunday', '00:00', '00:00', 1);

// Make database available to routes
app.locals.db = db;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Salon Luxe server running on port ${PORT}`);
});

module.exports = app;