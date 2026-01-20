-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'Bronze',
  is_admin INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  points INTEGER NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  cost INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Redemptions table
CREATE TABLE IF NOT EXISTS redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  reward_id INTEGER NOT NULL,
  points_spent INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (reward_id) REFERENCES rewards (id)
);

-- Insert default rewards
INSERT OR IGNORE INTO rewards (name, cost, type, description) VALUES
('$5 Off', 100, 'discount', 'Get $5 off your next purchase'),
('$10 Off', 200, 'discount', 'Get $10 off your next purchase'),
('Free Item', 500, 'freebie', 'Get a free item of your choice'),
('VIP Access', 1000, 'exclusive', 'Access to VIP events and exclusive offers');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON rewards(active);