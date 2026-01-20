-- Premium Loyalty System Database Schema

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

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_member_id ON users(member_id);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_redemptions_user_id ON redemptions(user_id);
CREATE INDEX idx_redemptions_status ON redemptions(status);

-- Insert default rewards
INSERT INTO rewards (name, description, points_cost, type) VALUES
('$5 Off', '$5 discount on your next purchase', 100, 'discount'),
('$10 Off', '$10 discount on your next purchase', 200, 'discount'),
('Free Item', 'Get a free item of your choice', 500, 'freebie'),
('VIP Access', 'Exclusive VIP access and benefits', 1000, 'exclusive');

-- Insert admin user
-- Password hash for 'admin123' using bcrypt (rounds=10)
INSERT INTO users (
    member_id, 
    email, 
    password_hash, 
    name, 
    referral_code, 
    is_admin
) VALUES (
    'ADM00001',
    'admin@example.com',
    '$2b$10$rBV2kzM1Q8GvA/KJ5YtHOuFHdOwBQZYLZBzEwQOhK5T9f.QW9mGFu',
    'System Administrator',
    'ADMIN001',
    1
);