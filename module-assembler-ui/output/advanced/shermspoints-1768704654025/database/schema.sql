-- Loyalty Program Schema for ShermsPoints
-- PostgreSQL

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  ShermCoin INTEGER DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'Bronze',
  referral_code VARCHAR(20) UNIQUE,
  referred_by INTEGER REFERENCES users(id),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('earn', 'spend')),
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rewards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cost INTEGER NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(50),
  active BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT -1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS redemptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reward_id INTEGER REFERENCES rewards(id) ON DELETE SET NULL,
  cost INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);
CREATE INDEX IF NOT EXISTS idx_users_referral ON users(referral_code);

-- Insert rewards
INSERT INTO rewards (name, description, cost, category) VALUES ('$5 Off', '', 100, 'General') ON CONFLICT DO NOTHING;
INSERT INTO rewards (name, description, cost, category) VALUES ('$10 Off', '', 200, 'General') ON CONFLICT DO NOTHING;
INSERT INTO rewards (name, description, cost, category) VALUES ('Free Item', '', 500, 'General') ON CONFLICT DO NOTHING;
INSERT INTO rewards (name, description, cost, category) VALUES ('VIP Access', '', 1000, 'General') ON CONFLICT DO NOTHING;

-- Insert admin user (credentials set during generation)
INSERT INTO users (email, password_hash, name, is_admin, referral_code) VALUES ('huddleeco@gmail.com', '$2a$10$yCrWWJfVi49zQtQWI0NMqOwBjnJXuQGOxlMUpGlEgV3XPe3N06Jbm', 'Admin', true, 'ADMIN001') ON CONFLICT (email) DO NOTHING;
