-- Streaks Schema
-- Tables for tracking user daily login streaks and milestones

-- User streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  total_checkins INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Streak history (daily check-ins)
CREATE TABLE IF NOT EXISTS streak_checkins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  checkin_date DATE NOT NULL,
  streak_count INTEGER NOT NULL, -- Streak count at time of check-in
  bonus_awarded DECIMAL(10, 2) DEFAULT 0,
  milestone_reached INTEGER, -- NULL or milestone day (7, 14, 30, etc.)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, checkin_date) -- One check-in per day per user
);

-- Milestone definitions (configurable)
CREATE TABLE IF NOT EXISTS streak_milestones (
  id SERIAL PRIMARY KEY,
  days_required INTEGER NOT NULL UNIQUE,
  bonus_amount DECIMAL(10, 2) NOT NULL,
  badge_name VARCHAR(100),
  badge_icon VARCHAR(50),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default milestones
INSERT INTO streak_milestones (days_required, bonus_amount, badge_name, badge_icon, description)
VALUES
  (7, 0.50, 'Week Warrior', '🔥', 'Complete a 7-day streak'),
  (14, 1.00, 'Fortnight Fighter', '⚡', 'Complete a 14-day streak'),
  (30, 2.50, 'Monthly Master', '🏆', 'Complete a 30-day streak'),
  (60, 5.00, 'Dedication King', '👑', 'Complete a 60-day streak'),
  (100, 10.00, 'Century Legend', '💎', 'Complete a 100-day streak'),
  (365, 50.00, 'Year Champion', '🎖️', 'Complete a full year streak')
ON CONFLICT (days_required) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_current ON user_streaks(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_streak_checkins_user_id ON streak_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_checkins_date ON streak_checkins(checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_streak_checkins_user_date ON streak_checkins(user_id, checkin_date DESC);

-- Function to auto-update timestamp
CREATE OR REPLACE FUNCTION update_streak_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-update
DROP TRIGGER IF EXISTS update_user_streak_timestamp ON user_streaks;
CREATE TRIGGER update_user_streak_timestamp
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_streak_timestamp();
