/**
 * Salon/Spa Industry Schema
 *
 * Additional tables for salons, spas, barbershops
 */

module.exports = {
  tables: {
    // Staff members/stylists
    staff_members: `
      CREATE TABLE IF NOT EXISTS staff_members (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        title VARCHAR(100),
        bio TEXT,
        specialties TEXT[],
        image_url TEXT,
        hourly_rate DECIMAL(10, 2),
        commission_rate DECIMAL(5, 2),
        hire_date DATE,
        schedule JSONB DEFAULT '{}',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Service categories
    service_categories: `
      CREATE TABLE IF NOT EXISTS service_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image_url TEXT,
        sort_order INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Staff services (which staff can do which services)
    staff_services: `
      CREATE TABLE IF NOT EXISTS staff_services (
        id SERIAL PRIMARY KEY,
        staff_id INTEGER REFERENCES staff_members(id) ON DELETE CASCADE,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        price_override DECIMAL(10, 2),
        duration_override INTEGER,
        active BOOLEAN DEFAULT true,
        UNIQUE(staff_id, service_id)
      )
    `,

    // Appointments (extends bookings)
    appointments: `
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id),
        staff_id INTEGER REFERENCES staff_members(id),
        service_id INTEGER REFERENCES services(id),
        add_on_services INTEGER[],
        total_duration INTEGER,
        total_price DECIMAL(10, 2),
        notes TEXT,
        reminder_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Client preferences
    client_preferences: `
      CREATE TABLE IF NOT EXISTS client_preferences (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        preferred_staff_id INTEGER REFERENCES staff_members(id),
        allergies TEXT,
        product_preferences TEXT,
        service_history JSONB DEFAULT '[]',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Product inventory (salon retail)
    salon_products: `
      CREATE TABLE IF NOT EXISTS salon_products (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        brand VARCHAR(100),
        size VARCHAR(50),
        professional_only BOOLEAN DEFAULT false,
        reorder_point INTEGER DEFAULT 5,
        supplier VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
  },

  indexes: [
    'CREATE INDEX IF NOT EXISTS idx_staff_active ON staff_members(active)',
    'CREATE INDEX IF NOT EXISTS idx_staff_services_staff ON staff_services(staff_id)',
    'CREATE INDEX IF NOT EXISTS idx_appointments_booking ON appointments(booking_id)',
    'CREATE INDEX IF NOT EXISTS idx_appointments_staff ON appointments(staff_id)',
    'CREATE INDEX IF NOT EXISTS idx_client_prefs_customer ON client_preferences(customer_id)'
  ]
};
