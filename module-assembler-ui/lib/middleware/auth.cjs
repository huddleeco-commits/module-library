/**
 * Auth Middleware - SlabTrack Pattern
 * JWT authentication and role-based access control
 *
 * Features:
 * - Token extraction from Authorization header
 * - JWT verification with configurable secret
 * - User data population on req.user
 * - Admin role check middleware
 */

const jwt = require('jsonwebtoken');

// Must match the secret used in auth routes
const JWT_SECRET = process.env.JWT_SECRET || 'blink-default-secret';

/**
 * Authenticate JWT token
 * Validates Bearer token from Authorization header
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('[Auth] Token verification failed:', err.message);
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Populate user data from JWT payload
    req.user = {
      id: decoded.id,
      userId: decoded.id,
      email: decoded.email,
      isAdmin: decoded.is_admin || decoded.isAdmin || false,
      is_admin: decoded.is_admin || decoded.isAdmin || false, // Keep both formats
      subscriptionTier: decoded.subscription_tier || 'free'
    };

    next();
  });
}

/**
 * Check if user is admin
 * Must be used AFTER authenticateToken middleware
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (!req.user.isAdmin && !req.user.is_admin) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
}

/**
 * Check subscription tier
 * Factory function to check if user has required subscription level
 *
 * @param {string[]} allowedTiers - Array of allowed tier names
 * @returns {Function} Express middleware
 */
function requireTier(allowedTiers) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userTier = req.user.subscriptionTier || 'free';

    if (!allowedTiers.includes(userTier)) {
      return res.status(403).json({
        success: false,
        error: `This feature requires one of: ${allowedTiers.join(', ')}`,
        requiredTiers: allowedTiers,
        currentTier: userTier
      });
    }

    next();
  };
}

/**
 * Optional authentication
 * Populates req.user if token is present, but doesn't fail if missing
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = {
        id: decoded.id,
        userId: decoded.id,
        email: decoded.email,
        isAdmin: decoded.is_admin || decoded.isAdmin || false,
        is_admin: decoded.is_admin || decoded.isAdmin || false,
        subscriptionTier: decoded.subscription_tier || 'free'
      };
    }
    next();
  });
}

module.exports = {
  authenticateToken,
  isAdmin,
  requireTier,
  optionalAuth,
  JWT_SECRET
};
