/**
 * Restaurant Industry Schema
 *
 * Additional tables for restaurant, cafe, bakery, bar businesses
 */

module.exports = {
  tables: {
    // Menu items
    menu_items: `
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        image_url TEXT,
        calories INTEGER,
        allergens TEXT[],
        dietary_tags TEXT[],
        available BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Menu categories
    menu_categories: `
      CREATE TABLE IF NOT EXISTS menu_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image_url TEXT,
        sort_order INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Tables/seating
    restaurant_tables: `
      CREATE TABLE IF NOT EXISTS restaurant_tables (
        id SERIAL PRIMARY KEY,
        table_number VARCHAR(20) NOT NULL,
        capacity INTEGER NOT NULL,
        location VARCHAR(100),
        status VARCHAR(50) DEFAULT 'available',
        notes TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Reservations (extends bookings)
    reservations: `
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id),
        table_id INTEGER REFERENCES restaurant_tables(id),
        special_requests TEXT,
        occasion VARCHAR(100),
        dietary_requirements TEXT,
        confirmation_sent BOOLEAN DEFAULT false,
        reminder_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Daily specials
    daily_specials: `
      CREATE TABLE IF NOT EXISTS daily_specials (
        id SERIAL PRIMARY KEY,
        menu_item_id INTEGER REFERENCES menu_items(id),
        special_price DECIMAL(10, 2),
        day_of_week INTEGER,
        start_date DATE,
        end_date DATE,
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Kitchen orders
    kitchen_orders: `
      CREATE TABLE IF NOT EXISTS kitchen_orders (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        table_id INTEGER REFERENCES restaurant_tables(id),
        items JSONB NOT NULL DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'pending',
        priority INTEGER DEFAULT 0,
        notes TEXT,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
  },

  indexes: [
    'CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category)',
    'CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available)',
    'CREATE INDEX IF NOT EXISTS idx_tables_status ON restaurant_tables(status)',
    'CREATE INDEX IF NOT EXISTS idx_reservations_booking ON reservations(booking_id)',
    'CREATE INDEX IF NOT EXISTS idx_kitchen_orders_status ON kitchen_orders(status)'
  ]
};
