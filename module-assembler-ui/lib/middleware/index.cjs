/**
 * Middleware Index - SlabTrack Pattern
 * Re-exports all middleware functions
 */

const {
  authenticateToken,
  isAdmin,
  requireTier,
  optionalAuth,
  JWT_SECRET
} = require('./auth.cjs');

const {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  sensitiveLimiter,
  createLimiter
} = require('./rateLimiter.cjs');

module.exports = {
  // Auth middleware
  authenticateToken,
  isAdmin,
  requireTier,
  optionalAuth,
  JWT_SECRET,
  // Rate limiters
  apiLimiter,
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  sensitiveLimiter,
  createLimiter
};
