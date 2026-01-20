const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Database setup
const db = new Database('booking.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL,
    price REAL NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    available_days TEXT DEFAULT 'monday,tuesday,wednesday,thursday,friday',
    start_time TEXT DEFAULT '09:00',
    end_time TEXT DEFAULT '17:00'
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    staff_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status TEXT DEFAULT 'confirmed',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
  );
`);

// Insert default data
const insertServices = db.prepare('INSERT OR IGNORE INTO services (id, name, duration, price, description) VALUES (?, ?, ?, ?, ?)');
insertServices.run(1, 'Consultation', 30, 50, 'Initial consultation session');
insertServices.run(2, 'Standard Service', 60, 100, 'Standard consulting service');
insertServices.run(3, 'Premium Service', 90, 150, 'Premium consulting service with extended support');

const insertStaff = db.prepare('INSERT OR IGNORE INTO staff (id, name, email) VALUES (?, ?, ?)');
insertStaff.run(1, 'Sherms', 'sherms@ssconsultants.com');
insertStaff.run(2, 'Saghar', 'saghar@ssconsultants.com');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/services', require('./routes/services'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/admin', require('./routes/admin'));

// Make database available to routes
app.locals.db = db;
app.locals.JWT_SECRET = JWT_SECRET;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});