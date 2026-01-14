/**
 * Retail/E-commerce Industry Schema
 *
 * Additional tables for retail stores, boutiques, e-commerce
 */

module.exports = {
  tables: {
    // Product variants (size, color, etc.)
    product_variants: `
      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        price_modifier DECIMAL(10, 2) DEFAULT 0,
        quantity INTEGER DEFAULT 0,
        attributes JSONB DEFAULT '{}',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Shopping carts
    shopping_carts: `
      CREATE TABLE IF NOT EXISTS shopping_carts (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        session_id VARCHAR(100),
        items JSONB NOT NULL DEFAULT '[]',
        subtotal DECIMAL(10, 2) DEFAULT 0,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Wishlists
    wishlists: `
      CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(customer_id, product_id)
      )
    `,

    // Promotions/coupons
    promotions: `
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        discount_type VARCHAR(50) NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL,
        min_purchase DECIMAL(10, 2) DEFAULT 0,
        max_uses INTEGER,
        uses_count INTEGER DEFAULT 0,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Product reviews
    product_reviews: `
      CREATE TABLE IF NOT EXISTS product_reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        customer_id INTEGER REFERENCES customers(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        content TEXT,
        verified_purchase BOOLEAN DEFAULT false,
        helpful_count INTEGER DEFAULT 0,
        approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Shipping zones
    shipping_zones: `
      CREATE TABLE IF NOT EXISTS shipping_zones (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        countries TEXT[],
        states TEXT[],
        zip_codes TEXT[],
        base_rate DECIMAL(10, 2) DEFAULT 0,
        per_item_rate DECIMAL(10, 2) DEFAULT 0,
        free_shipping_threshold DECIMAL(10, 2),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
  },

  indexes: [
    'CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id)',
    'CREATE INDEX IF NOT EXISTS idx_carts_customer ON shopping_carts(customer_id)',
    'CREATE INDEX IF NOT EXISTS idx_carts_session ON shopping_carts(session_id)',
    'CREATE INDEX IF NOT EXISTS idx_wishlists_customer ON wishlists(customer_id)',
    'CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code)',
    'CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(active)',
    'CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id)'
  ]
};
