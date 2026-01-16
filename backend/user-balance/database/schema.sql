-- User Balance Schema
-- Tables for tracking user wallet balances and transactions

-- User balances table (wallet)
CREATE TABLE IF NOT EXISTS user_balances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  available_balance DECIMAL(10, 2) DEFAULT 0.00,
  pending_balance DECIMAL(10, 2) DEFAULT 0.00,
  lifetime_earnings DECIMAL(10, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table (all credits and debits)
CREATE TABLE IF NOT EXISTS balance_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'survey', 'spin', 'streak_bonus', 'achievement', 'referral', 'cashout', 'adjustment'
  amount DECIMAL(10, 2) NOT NULL, -- Positive for credits, negative for debits
  description TEXT,
  reference_id VARCHAR(100), -- External reference (survey ID, spin ID, etc.)
  status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'reversed'
  balance_after DECIMAL(10, 2), -- Balance snapshot after transaction
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_type ON balance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_created ON balance_transactions(user_id, created_at DESC);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_balance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp on balance changes
DROP TRIGGER IF EXISTS update_user_balance_timestamp ON user_balances;
CREATE TRIGGER update_user_balance_timestamp
  BEFORE UPDATE ON user_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_balance_timestamp();
