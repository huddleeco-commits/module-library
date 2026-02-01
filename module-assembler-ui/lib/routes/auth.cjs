/**
 * Authentication Routes - SlabTrack Pattern
 * Complete auth system with JWT, registration, password reset
 *
 * Features:
 * - Dual-mode: Database + Test mode fallback
 * - JWT authentication with 24h expiration
 * - Password strength validation
 * - Rate limiting integration
 * - Profile management
 */

const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ===========================================
// CONFIGURATION
// ===========================================
const JWT_SECRET = process.env.JWT_SECRET || 'blink-default-secret';
const JWT_EXPIRES = '24h';
const PASSWORD_MIN_LENGTH = 8;

console.log('[Auth] Routes loaded with secret:', JWT_SECRET.substring(0, 10) + '...');

// ===========================================
// TEST MODE: In-Memory User Storage
// ===========================================
const testUsers = new Map();
let testUserIdCounter = 100;

// Pre-populate with demo accounts
const DEMO_ACCOUNTS = {
  'demo@demo.com': {
    id: 1,
    email: 'demo@demo.com',
    password_hash: '$2b$12$2DvySykdVXjd2bqVsRzByuzrd9GgCMsSXT2mdNJIsWreGfgPQoUgS', // demo1234
    full_name: 'Demo User',
    subscription_tier: 'free',
    is_admin: false,
    points: 150,
    tier: 'bronze'
  },
  'admin@demo.com': {
    id: 2,
    email: 'admin@demo.com',
    password_hash: '$2b$12$aFbQI3CcYTrf4Zz/2hVWtOKwf4H8FatjiL.8Tpqwi9lh96V9Jr8Qi', // admin1234
    full_name: 'Admin Demo',
    subscription_tier: 'premium',
    is_admin: true,
    points: 500,
    tier: 'gold'
  }
};

// Initialize test users
Object.values(DEMO_ACCOUNTS).forEach(user => {
  testUsers.set(user.email.toLowerCase(), { ...user });
});

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

function isDatabaseAvailable(db) {
  return db && typeof db.query === 'function';
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      userId: user.id,
      email: user.email,
      is_admin: user.is_admin || false,
      subscription_tier: user.subscription_tier || 'free'
    },
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

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

/**
 * Create auth routes
 * @param {Object} deps - Dependencies
 * @param {Object} deps.db - Database connection (can be null for test mode)
 * @param {Object} deps.rateLimiters - Rate limiter middleware (optional)
 * @param {Function} deps.sendPasswordResetEmail - Email service (optional)
 */
function createAuthRoutes(deps) {
  const router = express.Router();
  const { db, rateLimiters = {}, sendPasswordResetEmail } = deps;

  // ===========================================
  // HEALTH CHECK
  // ===========================================
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: isDatabaseAvailable(db) ? 'connected' : 'test-mode'
    });
  });

  // ===========================================
  // REGISTER
  // ===========================================
  router.post('/auth/register',
    rateLimiters.register || ((req, res, next) => next()),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isString().isLength({ min: PASSWORD_MIN_LENGTH })
      .withMessage(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
    body('fullName').optional().isString(),
    handleValidationErrors,
    async (req, res) => {
      try {
        const { email, password, fullName, name } = req.body;
        const userName = fullName || name || 'User';
        const userEmail = email?.toLowerCase();

        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
          return res.status(400).json({
            success: false,
            error: 'Password does not meet requirements',
            details: passwordValidation.errors
          });
        }

        if (isDatabaseAvailable(db)) {
          // DATABASE MODE
          const existingResult = await db.query(
            'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
            [userEmail]
          );
          if (existingResult.rows?.length > 0) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
          }

          const passwordHash = await bcrypt.hash(password, 12);
          const insertResult = await db.query(
            `INSERT INTO users (email, password_hash, full_name, subscription_tier, is_admin)
             VALUES ($1, $2, $3, 'free', false) RETURNING id`,
            [userEmail, passwordHash, userName]
          );

          const userId = insertResult.rows[0]?.id;
          const userResult = await db.query(
            'SELECT id, email, full_name, subscription_tier, is_admin FROM users WHERE id = $1',
            [userId]
          );

          const user = userResult.rows[0];
          const token = generateToken(user);

          console.log('[Auth] User registered:', userEmail);

          res.json({
            success: true,
            token,
            user: formatUserResponse(user),
            source: 'database'
          });
        } else {
          // TEST MODE
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

          console.log('[Auth] Test user registered:', userEmail);

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
    }
  );

  // ===========================================
  // LOGIN
  // ===========================================
  router.post('/auth/login',
    rateLimiters.login || ((req, res, next) => next()),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
    handleValidationErrors,
    async (req, res) => {
      try {
        const { email, password, requireAdmin = false } = req.body;
        const userEmail = email?.toLowerCase();

        let user = null;
        let source = 'database';

        // Try database first
        if (isDatabaseAvailable(db)) {
          try {
            const userResult = await db.query(
              `SELECT id, email, password_hash, full_name, name, subscription_tier, is_admin, points, tier
               FROM users WHERE LOWER(email) = LOWER($1)`,
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

        // Optional admin check
        if (requireAdmin && !user.is_admin) {
          return res.status(403).json({ success: false, error: 'Admin access required' });
        }

        const token = generateToken(user);
        console.log('[Auth] Login successful:', userEmail);

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
    }
  );

  // ===========================================
  // VALIDATE (Legacy - for simple password check)
  // ===========================================
  router.post('/auth/validate',
    body('password').isString().notEmpty().withMessage('Password is required'),
    handleValidationErrors,
    (req, res) => {
      const { password } = req.body;
      const adminPassword = process.env.BLINK_ADMIN_PASSWORD;

      if (!adminPassword) {
        console.error('[Auth] BLINK_ADMIN_PASSWORD not configured');
        return res.status(500).json({ success: false, error: 'Server configuration error' });
      }

      if (password === adminPassword) {
        res.json({ success: true });
      } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
      }
    }
  );

  // ===========================================
  // VALIDATE DEV
  // ===========================================
  router.post('/auth/validate-dev',
    body('password').isString().notEmpty().withMessage('Password is required'),
    handleValidationErrors,
    (req, res) => {
      const { password } = req.body;
      const devPassword = process.env.BLINK_DEV_PASSWORD || 'abc123';

      if (password === devPassword) {
        const devToken = jwt.sign(
          { id: 0, email: 'dev@blink.local', is_admin: true, isDev: true },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        console.log('[Auth] Dev token created');
        res.json({ success: true, devToken });
      } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
      }
    }
  );

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

  router.get('/auth/me', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      const userEmail = req.user.email?.toLowerCase();

      let user = null;
      let source = 'database';

      if (isDatabaseAvailable(db)) {
        try {
          const userResult = await db.query(
            `SELECT id, email, full_name, subscription_tier, is_admin, points, tier, created_at
             FROM users WHERE id = $1`,
            [userId]
          );
          user = userResult.rows?.[0];
        } catch (dbError) {
          console.log('[Auth] Database not available for profile');
        }
      }

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
  });

  router.get('/auth/profile', authenticateToken, async (req, res) => {
    // Alias for /auth/me
    req.url = '/auth/me';
    router.handle(req, res);
  });

  // ===========================================
  // UPDATE PROFILE (Protected)
  // ===========================================
  router.put('/auth/profile', authenticateToken,
    rateLimiters.sensitive || ((req, res, next) => next()),
    async (req, res) => {
      try {
        const userId = req.user.userId || req.user.id;
        const userEmail = req.user.email?.toLowerCase();
        const { fullName, name, phone } = req.body;
        const newName = fullName || name;

        if (isDatabaseAvailable(db)) {
          await db.query(
            `UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), updated_at = NOW()
             WHERE id = $3`,
            [newName, phone, userId]
          );

          const userResult = await db.query(
            'SELECT id, email, full_name, subscription_tier, is_admin, points, tier FROM users WHERE id = $1',
            [userId]
          );

          res.json({
            success: true,
            user: formatUserResponse(userResult.rows[0]),
            source: 'database'
          });
        } else {
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
    }
  );

  // ===========================================
  // CHANGE PASSWORD (Protected)
  // ===========================================
  router.post('/auth/change-password', authenticateToken,
    rateLimiters.sensitive || ((req, res, next) => next()),
    body('currentPassword').isString().notEmpty(),
    body('newPassword').isString().isLength({ min: PASSWORD_MIN_LENGTH }),
    handleValidationErrors,
    async (req, res) => {
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

        if (isDatabaseAvailable(db)) {
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
          await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);

          console.log('[Auth] Password changed for user:', userId);
          res.json({ success: true, message: 'Password changed successfully', source: 'database' });
        } else {
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
    }
  );

  // ===========================================
  // FORGOT PASSWORD
  // ===========================================
  router.post('/auth/forgot-password',
    rateLimiters.passwordReset || ((req, res, next) => next()),
    body('email').isEmail(),
    handleValidationErrors,
    async (req, res) => {
      try {
        const { email } = req.body;
        const userEmail = email?.toLowerCase();

        // Always return success to prevent email enumeration
        res.json({
          success: true,
          message: 'If that email exists, we sent a reset link'
        });

        // Actually process reset if database available
        if (isDatabaseAvailable(db)) {
          const userResult = await db.query('SELECT id, email FROM users WHERE LOWER(email) = LOWER($1)', [userEmail]);
          if (userResult.rows.length > 0) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour

            await db.query(
              'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
              [resetToken, expiresAt, userResult.rows[0].id]
            );

            // Send email if service available
            if (sendPasswordResetEmail) {
              sendPasswordResetEmail(userEmail, resetToken).catch(err => {
                console.error('[Auth] Failed to send reset email:', err);
              });
            }

            console.log('[Auth] Password reset requested for:', userEmail);
          }
        }
      } catch (error) {
        // Still return success to not reveal info
        console.error('[Auth] Forgot password error:', error);
        res.json({ success: true, message: 'If that email exists, we sent a reset link' });
      }
    }
  );

  // ===========================================
  // RESET PASSWORD
  // ===========================================
  router.post('/auth/reset-password',
    body('token').isString().notEmpty(),
    body('newPassword').isString().isLength({ min: PASSWORD_MIN_LENGTH }),
    handleValidationErrors,
    async (req, res) => {
      try {
        const { token, newPassword } = req.body;

        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.valid) {
          return res.status(400).json({
            success: false,
            error: 'Password does not meet requirements',
            details: passwordValidation.errors
          });
        }

        if (!isDatabaseAvailable(db)) {
          return res.status(400).json({ success: false, error: 'Password reset not available in test mode' });
        }

        const userResult = await db.query(
          `SELECT id, email FROM users
           WHERE reset_token = $1 AND reset_token_expires > NOW()`,
          [token]
        );

        if (userResult.rows.length === 0) {
          return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
        }

        const userId = userResult.rows[0].id;
        const newHash = await bcrypt.hash(newPassword, 12);

        await db.query(
          `UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW()
           WHERE id = $2`,
          [newHash, userId]
        );

        console.log('[Auth] Password reset completed for user:', userId);
        res.json({ success: true, message: 'Password reset successfully' });
      } catch (error) {
        console.error('[Auth] Reset password error:', error);
        res.status(500).json({ success: false, error: 'Failed to reset password' });
      }
    }
  );

  // ===========================================
  // LOGOUT (JWT is stateless, but provided for completeness)
  // ===========================================
  router.post('/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // ===========================================
  // VERIFY TOKEN
  // ===========================================
  router.get('/auth/verify', authenticateToken, (req, res) => {
    res.json({
      success: true,
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        isAdmin: req.user.is_admin
      }
    });
  });

  return router;
}

module.exports = { createAuthRoutes };
