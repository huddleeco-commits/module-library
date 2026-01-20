CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'customer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  specialization TEXT,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  FOREIGN KEY (staff_id) REFERENCES staff(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  UNIQUE(staff_id, service_id)
);

CREATE TABLE business_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_of_week INTEGER NOT NULL,
  open_time TEXT NOT NULL,
  close_time TEXT NOT NULL,
  is_closed BOOLEAN DEFAULT 0
);

CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  staff_id INTEGER NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  total_price DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

INSERT INTO users (name, email, phone, password, role) VALUES
('Admin User', 'admin@bookingsystem.com', '555-0000', 'admin123', 'admin'),
('John Doe', 'john@example.com', '555-0001', 'password123', 'customer'),
('Jane Smith', 'jane@example.com', '555-0002', 'password123', 'customer');

INSERT INTO services (name, description, duration, price) VALUES
('Hair Cut', 'Professional hair cutting service', 30, 35.00),
('Hair Color', 'Full hair coloring service', 90, 85.00),
('Manicure', 'Complete nail care and polish', 45, 25.00);

INSERT INTO staff (name, email, phone, specialization) VALUES
('Sarah Johnson', 'sarah@salon.com', '555-1001', 'Hair Stylist'),
('Mike Chen', 'mike@salon.com', '555-1002', 'Nail Technician');

INSERT INTO staff_services (staff_id, service_id) VALUES
(1, 1), (1, 2), (2, 3);

INSERT INTO business_hours (day_of_week, open_time, close_time) VALUES
(1, '09:00', '17:00'),
(2, '09:00', '17:00'),
(3, '09:00', '17:00'),
(4, '09:00', '17:00'),
(5, '09:00', '17:00'),
(6, '10:00', '16:00'),
(0, '10:00', '16:00');