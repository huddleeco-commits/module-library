-- ===========================================
-- Auth System Database Schema - SlabTrack Pattern
-- ===========================================
--
-- Run this schema against your PostgreSQL database to set up the auth tables.
-- Compatible with Railway, Supabase, and other PostgreSQL providers.

-- ===========================================
-- USERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,

    -- Subscription and access
    subscription_tier VARCHAR(50) DEFAULT 'free',
    is_admin BOOLEAN DEFAULT false,

    -- Gamification (optional, for SlabTrack-style apps)
    points INTEGER DEFAULT 0,
    tier VARCHAR(50) DEFAULT 'bronze',

    -- Password reset
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,

    -- Email verification (optional)
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Index for email lookups (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

-- Index for reset token lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users (reset_token) WHERE reset_token IS NOT NULL;

-- ===========================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- ===========================================
CREATE OR REPLACE FUNCTION update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_timestamp();

-- ===========================================
-- SESSIONS TABLE (Optional - for session-based auth)
-- ===========================================
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);

-- ===========================================
-- LOGIN ATTEMPTS TABLE (For rate limiting and security)
-- ===========================================
CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    ip_address INET,
    success BOOLEAN DEFAULT false,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts (email, attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts (ip_address, attempted_at);

-- Cleanup old login attempts (run periodically)
-- DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '7 days';

-- ===========================================
-- INITIAL ADMIN USER (Optional)
-- ===========================================
-- Password: admin1234 (change in production!)
-- Hash generated with: bcrypt.hash('admin1234', 12)
INSERT INTO users (email, password_hash, full_name, is_admin, subscription_tier)
VALUES ('admin@demo.com', '$2b$12$aFbQI3CcYTrf4Zz/2hVWtOKwf4H8FatjiL.8Tpqwi9lh96V9Jr8Qi', 'Admin User', true, 'premium')
ON CONFLICT (email) DO NOTHING;

-- Demo user
-- Password: demo1234
INSERT INTO users (email, password_hash, full_name, is_admin, subscription_tier)
VALUES ('demo@demo.com', '$2b$12$2DvySykdVXjd2bqVsRzByuzrd9GgCMsSXT2mdNJIsWreGfgPQoUgS', 'Demo User', false, 'free')
ON CONFLICT (email) DO NOTHING;
