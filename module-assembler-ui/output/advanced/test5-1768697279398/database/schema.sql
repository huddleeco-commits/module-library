-- Loyalty Program Database Schema

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'Bronze',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table for tracking point earning activities
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    points INTEGER NOT NULL,
    transaction_type TEXT NOT NULL, -- 'earned' or 'spent'
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Rewards catalog
CREATE TABLE rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL,
    reward_type TEXT NOT NULL, -- 'discount', 'freeitem', 'vip'
    value TEXT, -- '$5', '$10', 'Free Item', 'VIP Access'
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Redemptions table for tracking reward usage
CREATE TABLE redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reward_id INTEGER NOT NULL,
    points_spent INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'used', 'expired'
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    used_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reward_id) REFERENCES rewards(id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_points ON users(points);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_redemptions_user_id ON redemptions(user_id);
CREATE INDEX idx_redemptions_status ON redemptions(status);

-- Seed default rewards
INSERT INTO rewards (name, description, points_required, reward_type, value) VALUES
('$5 Off', 'Get $5 off your next purchase', 100, 'discount', '$5'),
('$10 Off', 'Get $10 off your next purchase', 200, 'discount', '$10'),
('Free Item', 'Get a free item of your choice', 500, 'freeitem', 'Free Item'),
('VIP Access', 'Get exclusive VIP access and benefits', 1000, 'vip', 'VIP Access');

-- Trigger to update user tier when points change
CREATE TRIGGER update_user_tier
AFTER UPDATE OF points ON users
FOR EACH ROW
BEGIN
    UPDATE users SET 
        tier = CASE 
            WHEN NEW.points >= 5000 THEN 'Platinum'
            WHEN NEW.points >= 2000 THEN 'Gold'
            WHEN NEW.points >= 500 THEN 'Silver'
            ELSE 'Bronze'
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

-- Trigger to update user tier on insert
CREATE TRIGGER set_initial_user_tier
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    UPDATE users SET 
        tier = CASE 
            WHEN NEW.points >= 5000 THEN 'Platinum'
            WHEN NEW.points >= 2000 THEN 'Gold'
            WHEN NEW.points >= 500 THEN 'Silver'
            ELSE 'Bronze'
        END
    WHERE id = NEW.id;
END;