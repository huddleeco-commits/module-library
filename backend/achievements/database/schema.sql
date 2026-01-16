-- Achievements & Challenges Schema
-- Tables for gamification: badges, achievements, and user challenges

-- ============================================
-- ACHIEVEMENT TABLES
-- ============================================

-- Achievement definitions (configurable badges)
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  achievement_key VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  points INTEGER DEFAULT 0,
  category VARCHAR(50),
  requirement_type VARCHAR(50), -- 'count', 'threshold', 'streak', 'manual'
  requirement_value INTEGER,
  reward_amount DECIMAL(10, 2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User unlocked achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress_value INTEGER DEFAULT 0,
  reward_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Achievement progress tracking (for incremental achievements)
CREATE TABLE IF NOT EXISTS achievement_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  achievement_key VARCHAR(50) NOT NULL,
  current_value INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_key)
);

-- User showcase badges (displayed on profile)
CREATE TABLE IF NOT EXISTS user_showcase (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  badge_ids INTEGER[] DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CHALLENGE TABLES
-- ============================================

-- Challenge definitions
CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  challenge_type VARCHAR(50) NOT NULL, -- 'portfolio_returns', 'trade_count', 'accuracy', 'custom'
  metric VARCHAR(50), -- What's being measured
  target_value DECIMAL(15, 4),
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  prize_pool DECIMAL(10, 2) DEFAULT 0,
  max_participants INTEGER,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'completed', 'cancelled'
  winner_id INTEGER,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenge participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER NOT NULL REFERENCES challenges(id),
  user_id INTEGER NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  current_score DECIMAL(15, 4) DEFAULT 0,
  starting_value DECIMAL(15, 4), -- Starting portfolio value for returns challenges
  final_score DECIMAL(15, 4),
  rank INTEGER,
  prize_won DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'withdrawn'
  UNIQUE(challenge_id, user_id)
);

-- Challenge activity log
CREATE TABLE IF NOT EXISTS challenge_activity (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER NOT NULL REFERENCES challenges(id),
  user_id INTEGER,
  activity_type VARCHAR(50) NOT NULL, -- 'joined', 'score_update', 'completed', 'prize_awarded'
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DEFAULT ACHIEVEMENTS
-- ============================================

INSERT INTO achievements (achievement_key, name, description, icon, points, category, requirement_type, requirement_value, reward_amount, sort_order)
VALUES
  ('first_trade', 'First Trade', 'Make your first trade', '🎯', 10, 'trading', 'count', 1, 0.10, 1),
  ('hot_streak', 'Hot Streak', 'Make 5 winning trades in a row', '🔥', 25, 'trading', 'streak', 5, 0.25, 2),
  ('diversified', 'Diversified', 'Own 10+ different positions', '📊', 50, 'portfolio', 'threshold', 10, 0.50, 3),
  ('diamond_hands', 'Diamond Hands', 'Hold a position for 30 days', '💎', 100, 'holding', 'threshold', 30, 1.00, 4),
  ('market_mover', 'Market Mover', 'Trade $100,000 in volume', '🚀', 200, 'trading', 'threshold', 100000, 2.00, 5),
  ('profit_king', 'Profit King', 'Achieve 50% portfolio returns', '👑', 500, 'performance', 'threshold', 50, 5.00, 6),
  ('social_butterfly', 'Social Butterfly', 'Follow 10 traders', '🦋', 15, 'social', 'threshold', 10, 0.15, 7),
  ('challenger', 'Challenger', 'Join your first challenge', '⚔️', 20, 'challenges', 'count', 1, 0.20, 8),
  ('champion', 'Champion', 'Win a challenge', '🏆', 250, 'challenges', 'count', 1, 2.50, 9),
  ('early_bird', 'Early Bird', 'Trade before 9:30 AM', '🌅', 10, 'trading', 'count', 1, 0.10, 10),
  ('weekly_warrior', 'Weekly Warrior', 'Trade every day for a week', '⚡', 30, 'consistency', 'streak', 7, 0.30, 11),
  ('survey_starter', 'Survey Starter', 'Complete your first survey', '📝', 10, 'surveys', 'count', 1, 0.10, 12),
  ('survey_master', 'Survey Master', 'Complete 50 surveys', '🎓', 100, 'surveys', 'count', 50, 1.00, 13),
  ('referral_rookie', 'Referral Rookie', 'Refer your first friend', '🤝', 25, 'referrals', 'count', 1, 0.25, 14),
  ('referral_master', 'Referral Master', 'Refer 10 friends', '🌟', 150, 'referrals', 'count', 10, 1.50, 15)
ON CONFLICT (achievement_key) DO NOTHING;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user ON achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_key ON achievement_progress(achievement_key);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_challenges_creator ON challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_score ON challenge_participants(challenge_id, current_score DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to auto-update timestamp
CREATE OR REPLACE FUNCTION update_achievement_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for challenges
DROP TRIGGER IF EXISTS update_challenge_timestamp ON challenges;
CREATE TRIGGER update_challenge_timestamp
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_achievement_timestamp();
