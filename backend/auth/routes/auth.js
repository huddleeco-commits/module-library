const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

// ===========================================
// SECURITY CONFIGURATION
// ===========================================
const JWT_EXPIRES = '24h';
const PASSWORD_MIN_LENGTH = 8;

// Validate JWT_SECRET at startup
if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET environment variable is required');
} else if (process.env.JWT_SECRET.length < 32) {
  console.error('❌ CRITICAL: JWT_SECRET is too weak (min 32 characters required)');
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
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

// Rate limiting (protect against brute force)
let rateLimiters = {};
try {
  rateLimiters = require('../middleware/rateLimiter');
} catch (e) {
  // Rate limiter not available, create no-op middleware
  const noOp = (req, res, next) => next();
  rateLimiters = { loginLimiter: noOp, registerLimiter: noOp, passwordResetLimiter: noOp };
}

// ===========================================
// DEMO ACCOUNTS (fallback when no database)
// ===========================================
// Pre-hashed passwords for demo accounts (bcrypt, 12 rounds)
// demo1234 and admin1234
const DEMO_ACCOUNTS = {
  'demo@demo.com': {
    id: 1,
    email: 'demo@demo.com',
    password_hash: '$2b$12$2DvySykdVXjd2bqVsRzByuzrd9GgCMsSXT2mdNJIsWreGfgPQoUgS', // demo1234
    full_name: 'Demo User',
    subscription_tier: 'free',
    is_admin: false,
    scans_used: 0,
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
    scans_used: 0,
    points: 500,
    tier: 'gold'
  }
};

/**
 * Check if this is a demo account and validate credentials
 * @returns {Object|null} Demo user if valid, null otherwise
 */
async function checkDemoAccount(email, password) {
  const demoUser = DEMO_ACCOUNTS[email?.toLowerCase()];
  if (!demoUser) return null;

  const validPassword = await bcrypt.compare(password, demoUser.password_hash);
  return validPassword ? demoUser : null;
}

router.post('/register', rateLimiters.registerLimiter, async (req, res) => {
    try {
        const { email, password, fullName, referralCode } = req.body;

        // Validate password strength FIRST
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                error: 'Password does not meet requirements',
                details: passwordValidation.errors
            });
        }

        // Check if user exists
        const existingResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingResult.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        // Hash password (using 12 rounds for extra security)
        const passwordHash = await bcrypt.hash(password, 12);

        // Check referral code if provided
        let referralCodeId = null;
        let referralCodeValue = null;
        if (referralCode) {
            const refResult = await db.query(
                'SELECT id, code FROM referral_codes WHERE code = $1 AND active = true',
                [referralCode.toLowerCase()]
            );
            if (refResult.rows.length > 0) {
                referralCodeId = refResult.rows[0].id;
                referralCodeValue = refResult.rows[0].code;
            }
        }

        // Insert user with referral tracking
        const insertResult = await db.query(
            `INSERT INTO users (email, password_hash, full_name, referred_by, referral_code_id, referred_at) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [email, passwordHash, fullName, referralCodeValue, referralCodeId, referralCodeId ? new Date() : null]
        );

        // Get user ID
        const userId = insertResult.rows[0]?.id;

        if (!userId) {
            throw new Error('Failed to create user - no ID returned');
        }

        // Fetch created user
        const userResult = await db.query(
            'SELECT id, email, full_name, subscription_tier, is_admin FROM users WHERE id = $1',
            [userId]
        );
        const user = userResult.rows[0];

        // Generate JWT - INCLUDE BOTH id AND userId
        const token = jwt.sign(
            { 
                id: user.id,
                userId: user.id, 
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        // Update referral stats if user was referred
        if (referralCodeId) {
            await db.query(
                'UPDATE referral_codes SET total_signups = total_signups + 1, updated_at = NOW() WHERE id = $1',
                [referralCodeId]
            );
        }

        // Send new user email notification (NON-BLOCKING)
        const { sendNewUserEmail } = require('../services/email-service');
        sendNewUserEmail({
            fullName: fullName,
            email: email,
            subscriptionTier: 'free'
        }).catch(() => {
            // Email send failed silently - non-critical
        });

        // Respond
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                subscriptionTier: user.subscription_tier,
                isAdmin: user.is_admin || false,
                scansUsed: user.scans_used || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

router.post('/login', rateLimiters.loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = null;

        // Try database first
        try {
            const userResult = await db.query(
                'SELECT id, email, password_hash, full_name, subscription_tier, is_admin, scans_used FROM users WHERE email = $1',
                [email]
            );
            user = userResult.rows[0];
        } catch (dbError) {
            // Database not available, will try demo accounts
            console.log('Database not available, checking demo accounts');
        }

        // If no user from database, check demo accounts
        if (!user) {
            const demoUser = await checkDemoAccount(email, password);
            if (demoUser) {
                // Demo account login successful
                const token = jwt.sign(
                    {
                        id: demoUser.id,
                        userId: demoUser.id,
                        email: demoUser.email
                    },
                    process.env.JWT_SECRET || 'demo-secret-key-for-testing-only',
                    { expiresIn: JWT_EXPIRES }
                );

                return res.json({
                    success: true,
                    token,
                    user: {
                        id: demoUser.id,
                        email: demoUser.email,
                        fullName: demoUser.full_name,
                        subscriptionTier: demoUser.subscription_tier,
                        isAdmin: demoUser.is_admin || false,
                        scansUsed: demoUser.scans_used || 0,
                        points: demoUser.points || 0,
                        tier: demoUser.tier || 'bronze'
                    }
                });
            }
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Verify password for database user
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Generate JWT - INCLUDE BOTH id AND userId
        const token = jwt.sign(
            {
                id: user.id,
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                subscriptionTier: user.subscription_tier,
                isAdmin: user.is_admin || false,
                scansUsed: user.scans_used || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// Get current user info
const { authenticateToken } = require('../middleware/auth');

// Get current user info - supports both /me and /profile endpoints
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const userEmail = req.user.email;

        let user = null;

        // Try database first
        try {
            const userResult = await db.query(
                'SELECT id, email, full_name, subscription_tier, is_admin, scans_used, created_at FROM users WHERE id = $1',
                [userId]
            );
            user = userResult.rows[0];
        } catch (dbError) {
            // Database not available, will check demo accounts
            console.log('Database not available for profile, checking demo accounts');
        }

        // If no user from database, check demo accounts
        if (!user && userEmail) {
            const demoUser = DEMO_ACCOUNTS[userEmail.toLowerCase()];
            if (demoUser) {
                return res.json({
                    success: true,
                    user: {
                        id: demoUser.id,
                        email: demoUser.email,
                        name: demoUser.full_name,
                        fullName: demoUser.full_name,
                        subscriptionTier: demoUser.subscription_tier,
                        is_admin: demoUser.is_admin || false,
                        isAdmin: demoUser.is_admin || false,
                        scansUsed: demoUser.scans_used || 0,
                        points: demoUser.points || 0,
                        tier: demoUser.tier || 'bronze',
                        createdAt: new Date().toISOString()
                    }
                });
            }
        }

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name,
                fullName: user.full_name,
                subscriptionTier: user.subscription_tier,
                is_admin: user.is_admin || false,
                isAdmin: user.is_admin || false,
                scansUsed: user.scans_used || 0,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

router.get('/me', authenticateToken, getUserProfile);
router.get('/profile', authenticateToken, getUserProfile);

// Forgot Password - Request reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Find user - FIXED QUERY SYNTAX
        const userResult = await db.query('SELECT id, email FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            // Don't reveal if email exists (security best practice)
            return res.json({ 
                success: true, 
                message: 'If that email exists, we sent a reset link' 
            });
        }

        const user = userResult.rows[0];

        // Generate reset token (random 32 character string)
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Set expiration (1 hour from now)
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        // Save token to database - FIXED QUERY SYNTAX
        await db.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
            [resetToken, expiresAt, user.id]
        );

        // Send email
        const { sendPasswordResetEmail } = require('../services/password-reset-email');
        await sendPasswordResetEmail(user.email, resetToken);

        res.json({ 
            success: true, 
            message: 'Password reset link sent to your email' 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to process request' });
    }
});

// Verify Reset Token
router.get('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // FIXED QUERY SYNTAX
        const userResult = await db.query(
            'SELECT id, email FROM users WHERE reset_token = $1 AND reset_token_expires > $2',
            [token, new Date()]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid or expired reset token' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Token is valid',
            email: userResult.rows[0].email 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to verify token' });
    }
});

// Reset Password - Set new password
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Find user with valid token - FIXED QUERY SYNTAX
        const userResult = await db.query(
            'SELECT id, email FROM users WHERE reset_token = $1 AND reset_token_expires > $2',
            [token, new Date()]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid or expired reset token' 
            });
        }

        const user = userResult.rows[0];

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 10);

        // Update password and clear reset token - FIXED QUERY SYNTAX
        await db.query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
            [passwordHash, user.id]
        );

        res.json({
            success: true,
            message: 'Password reset successful! You can now login.'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to reset password' });
    }
});

module.exports = router;