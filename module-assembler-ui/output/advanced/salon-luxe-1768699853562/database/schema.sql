-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Staff table
CREATE TABLE staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Staff services junction table
CREATE TABLE staff_services (
  staff_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  PRIMARY KEY (staff_id, service_id),
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Business hours table
CREATE TABLE business_hours (
  day_of_week INTEGER PRIMARY KEY CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TEXT NOT NULL,
  close_time TEXT NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE
);

-- Bookings table
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  staff_id INTEGER NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no-show')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_staff_date ON bookings(staff_id, date);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, phone, password_hash, name, is_admin) VALUES 
('admin@business.com', '+1234567890', '$2b$10$K7L/8Y3j3j8j3j8j3j8j3O7K7L8Y3j3j8j3j8j3j8j3j8j3j8j3j8j3', 'Administrator', TRUE);

-- Insert default services
INSERT INTO services (name, duration_minutes, price, description) VALUES 
('Consultation', 30, 50.00, 'Initial consultation service'),
('Standard Service', 60, 100.00, 'Standard service offering'),
('Premium Service', 90, 150.00, 'Premium service with extended duration');

-- Insert default staff
INSERT INTO staff (name, email) VALUES 
('Sherms', 'sherms@business.com');

-- Link staff to all services
INSERT INTO staff_services (staff_id, service_id) VALUES 
(1, 1),
(1, 2),
(1, 3);

-- Insert business hours (0=Sunday, 1=Monday, ..., 6=Saturday)
INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES 
(0, '00:00', '00:00', TRUE),   -- Sunday (closed)
(1, '09:00', '17:00', FALSE),  -- Monday
(2, '09:00', '17:00', FALSE),  -- Tuesday
(3, '09:00', '17:00', FALSE),  -- Wednesday
(4, '09:00', '17:00', FALSE),  -- Thursday
(5, '09:00', '17:00', FALSE),  -- Friday
(6, '10:00', '14:00', FALSE);  -- Saturday