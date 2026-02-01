/**
 * Rate Limiting Middleware - SlabTrack Pattern
 * Protects auth routes from brute force attacks
 *
 * Features:
 * - Configurable rate limits per endpoint type
 * - Standard rate limit headers
 * - Skip successful requests option for login
 * - In-memory store (use Redis for production scaling)
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Broad protection for all API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false   // Disable X-RateLimit-* headers
});

/**
 * Strict limiter for login attempts
 * Protects against credential stuffing and brute force
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: {
    success: false,
    error: 'Too many login attempts. Please try again in 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful logins toward limit
});

/**
 * Strict limiter for registration
 * Prevents mass account creation
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registration attempts per hour per IP
  message: {
    success: false,
    error: 'Too many accounts created. Please try again in an hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Password reset limiter
 * Prevents enumeration and spam
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour
  message: {
    success: false,
    error: 'Too many password reset requests. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Sensitive operation limiter
 * For operations like password change, email change
 */
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 sensitive operations per hour
  message: {
    success: false,
    error: 'Too many attempts. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Create custom rate limiter
 * Factory function for endpoint-specific limits
 *
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Max requests per window
 * @param {string} options.message - Error message
 * @returns {Function} Rate limiter middleware
 */
function createLimiter(options) {
  const { windowMs, max, message, skipSuccessful = false } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      retryAfter: `${Math.round(windowMs / 60000)} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: skipSuccessful
  });
}

module.exports = {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  sensitiveLimiter,
  createLimiter
};
