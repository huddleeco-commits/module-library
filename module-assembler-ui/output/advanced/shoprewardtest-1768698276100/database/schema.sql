-- Premium Loyalty System Database Schema

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'Bronze',
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'bonus', 'referral')),
    amount INTEGER NOT NULL,
    description TEXT,
    admin_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Rewards table
CREATE TABLE rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    points_cost INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('discount', 'freebie', 'exclusive')),
    image_url TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Redemptions table
CREATE TABLE redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reward_id INTEGER NOT NULL,
    points_spent INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reward_id) REFERENCES rewards(id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_member_id ON users(member_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_redemptions_user_id ON redemptions(user_id);

-- Insert default rewards
INSERT INTO rewards (name, description, points_cost, type) VALUES
('$5 Off', 'Get $5 off your next purchase', 100, 'discount'),
('$10 Off', 'Get $10 off your next purchase', 200, 'discount'),
('Free Item', 'Get a free item of your choice', 500, 'freebie'),
('VIP Access', 'Exclusive VIP access and benefits', 1000, 'exclusive');

-- Insert admin user
INSERT INTO users (member_id, email, password_hash, name, is_admin, referral_code) VALUES
('ADMIN001', 'admin@example.com', '$2b$10$K8pLm7Qx9VvZy1nGf2HjAeX3Rj5Wc8Tp6Kl4Ms9Nb7Vx2Qw5Ez8Y', 'Administrator', 1, 'ADM001');