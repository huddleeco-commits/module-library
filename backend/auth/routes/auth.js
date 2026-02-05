/**
 * Auth Routes - Universal Authentication System
 * API endpoints for user authentication
 *
 * Features:
 * - Database mode: Full PostgreSQL user management
 * - Test mode: Demo accounts + in-memory user storage
 *
 * Used by:
 * - Website (login/register)
 * - Companion App (auth)
 * - Admin Dashboard (admin auth)
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// ===========================================
// CONFIGURATION
// ===========================================
const JWT_EXPIRES = '24h';
const PASSWORD_MIN_LENGTH = 8;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

// Try to load database module
let db = null;
try {
  db = require('../database/db');
} catch (e) {
  console.log('[Auth] Database module not available, using test mode');
}

// ===========================================
// TEST MODE: In-Memory User Storage
// ===========================================
const testUsers = new Map();

// Pre-populate with demo accounts
const DEMO_ACCOUNTS = {
  'demo@demo.com': {
    id: 1,
    email: 'demo@demo.com',
    password_hash: process.env.DEMO_PASSWORD_HASH || '$2a$12$eBQLfuGeiFOT8x/n.z1G2e4L5LDXz8tNMP9CvufFVJUtUxHnPg42m',
    full_name: 'Demo User',
    subscription_tier: 'free',
    is_admin: false,
    points: 150,
    tier: 'bronze'
  },
  'admin@demo.com': {
    id: 2,
    email: 'admin@demo.com',
    password_hash: process.env.DEMO_PASSWORD_HASH || '$2a$12$eBQLfuGeiFOT8x/n.z1G2e4L5LDXz8tNMP9CvufFVJUtUxHnPg42m',
    full_name: 'Admin Demo',
    subscription_tier: 'premium',
    is_admin: true,
    points: 500,
    tier: 'gold'
  }
};

// Initialize test users with demo accounts
Object.values(DEMO_ACCOUNTS).forEach(user => {
  testUsers.set(user.email.toLowerCase(), { ...user });
});

let testUserIdCounter = 100;

// ===========================================
// HELPERS
// ===========================================

function validatePasswordStrength(password) {
  const errors = [];
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  return { valid: errors.length === 0, errors };
}

function isDatabaseAvailable() {
  return db && typeof db.query === 'function';
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function formatUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name || user.fullName || user.name,
    name: user.full_name || user.fullName || user.name,
    subscriptionTier: user.subscription_tier || 'free',
    isAdmin: user.is_admin || false,
    points: user.points || 0,
    tier: user.tier || 'bronze'
  };
}

// ===========================================
// REGISTER
// ===========================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, name } = req.body;
    const userName = fullName || name || 'User';
    const userEmail = email?.toLowerCase();

    // Validate
    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    if (isDatabaseAvailable()) {
      // DATABASE MODE
      const existingResult = await db.query('SELECT * FROM users WHERE email = $1', [userEmail]);
      if (existingResult.rows?.length > 0) {
        return res.status(400).json({ success: false, error: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const insertResult = await db.query(
        `INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id`,
        [userEmail, passwordHash, userName]
      );

      const userId = insertResult.rows[0]?.id;
      const userResult = await db.query(
        'SELECT id, email, full_name, subscription_tier, is_admin FROM users WHERE id = $1',
        [userId]
      );

      const user = userResult.rows[0];
      const token = generateToken(user);

      res.json({
        success: true,
        token,
        user: formatUserResponse(user),
        source: 'database'
      });
    } else {
      // TEST MODE - In-memory registration
      if (testUsers.has(userEmail)) {
        return res.status(400).json({ success: false, error: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const newUser = {
        id: ++testUserIdCounter,
        email: userEmail,
        password_hash: passwordHash,
        full_name: userName,
        subscription_tier: 'free',
        is_admin: false,
        points: 0,
        tier: 'bronze',
        created_at: new Date().toISOString()
      };

      testUsers.set(userEmail, newUser);

      const token = generateToken(newUser);

      res.json({
        success: true,
        token,
        user: formatUserResponse(newUser),
        source: 'test-data',
        message: 'Account created (test mode - will reset on server restart)'
      });
    }
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// ===========================================
// LOGIN
// ===========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userEmail = email?.toLowerCase();

    if (!userEmail || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    let user = null;
    let source = 'database';

    // Try database first
    if (isDatabaseAvailable()) {
      try {
        const userResult = await db.query(
          'SELECT id, email, password_hash, full_name, subscription_tier, is_admin FROM users WHERE email = $1',
          [userEmail]
        );
        user = userResult.rows?.[0];
      } catch (dbError) {
        console.log('[Auth] Database query failed, falling back to test mode');
      }
    }

    // Fallback to test users
    if (!user) {
      user = testUsers.get(userEmail);
      source = 'test-data';
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: formatUserResponse(user),
      source
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ===========================================
// GET CURRENT USER (Protected)
// ===========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userEmail = req.user.email?.toLowerCase();

    let user = null;
    let source = 'database';

    // Try database
    if (isDatabaseAvailable()) {
      try {
        const userResult = await db.query(
          'SELECT id, email, full_name, subscription_tier, is_admin, created_at FROM users WHERE id = $1',
          [userId]
        );
        user = userResult.rows?.[0];
      } catch (dbError) {
        console.log('[Auth] Database not available for profile');
      }
    }

    // Fallback to test users
    if (!user && userEmail) {
      user = testUsers.get(userEmail);
      source = 'test-data';
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      user: formatUserResponse(user),
      source
    });
  } catch (error) {
    console.error('[Auth] Profile error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

router.get('/me', authenticateToken, getUserProfile);
router.get('/profile', authenticateToken, getUserProfile);

// ===========================================
// UPDATE PROFILE (Protected)
// ===========================================
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userEmail = req.user.email?.toLowerCase();
    const { fullName, name, phone } = req.body;
    const newName = fullName || name;

    if (isDatabaseAvailable()) {
      await db.query(
        'UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone) WHERE id = $3',
        [newName, phone, userId]
      );

      const userResult = await db.query(
        'SELECT id, email, full_name, subscription_tier, is_admin FROM users WHERE id = $1',
        [userId]
      );

      res.json({
        success: true,
        user: formatUserResponse(userResult.rows[0]),
        source: 'database'
      });
    } else {
      // Test mode
      const user = testUsers.get(userEmail);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      if (newName) user.full_name = newName;
      if (phone) user.phone = phone;

      res.json({
        success: true,
        user: formatUserResponse(user),
        source: 'test-data'
      });
    }
  } catch (error) {
    console.error('[Auth] Update profile error:', error);
    res.status(500).json({ success: false, error: 'Update failed' });
  }
});

// ===========================================
// CHANGE PASSWORD (Protected)
// ===========================================
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userEmail = req.user.email?.toLowerCase();
    const { currentPassword, newPassword } = req.body;

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'New password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    if (isDatabaseAvailable()) {
      const userResult = await db.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const validPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
      if (!validPassword) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect' });
      }

      const newHash = await bcrypt.hash(newPassword, 12);
      await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);

      res.json({ success: true, message: 'Password changed successfully', source: 'database' });
    } else {
      // Test mode
      const user = testUsers.get(userEmail);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect' });
      }

      user.password_hash = await bcrypt.hash(newPassword, 12);

      res.json({
        success: true,
        message: 'Password changed (test mode)',
        source: 'test-data'
      });
    }
  } catch (error) {
    console.error('[Auth] Change password error:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
});

// ===========================================
// FORGOT PASSWORD
// ===========================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const userEmail = email?.toLowerCase();

    // Always return success (don't reveal if email exists)
    res.json({
      success: true,
      message: 'If that email exists, we sent a reset link'
    });

    // Actually send email if database available
    if (isDatabaseAvailable()) {
      const userResult = await db.query('SELECT id, email FROM users WHERE email = $1', [userEmail]);
      if (userResult.rows.length > 0) {
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000);

        await db.query(
          'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
          [resetToken, expiresAt, userResult.rows[0].id]
        );

        // Send email (non-blocking)
        try {
          const { sendPasswordResetEmail } = require('../services/password-reset-email');
          sendPasswordResetEmail(userEmail, resetToken).catch(() => {});
        } catch (e) {}
      }
    }
  } catch (error) {
    // Still return success to not reveal info
    res.json({ success: true, message: 'If that email exists, we sent a reset link' });
  }
});

// ===========================================
// LOGOUT (just for completeness - JWT is stateless)
// ===========================================
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ===========================================
// VERIFY TOKEN
// ===========================================
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: { id: req.user.id, email: req.user.email }
  });
});

module.exports = router;
