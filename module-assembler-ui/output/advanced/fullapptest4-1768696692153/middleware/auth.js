const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fullapptest4_loyalty_secret';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Token verification error:', err.message);
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      // Verify user still exists in database
      const dbUser = db.prepare('SELECT id, email, isAdmin FROM users WHERE id = ?').get(user.userId);
      if (!dbUser) {
        return res.status(403).json({ error: 'User not found' });
      }

      req.user = {
        userId: dbUser.id,
        email: dbUser.email,
        isAdmin: dbUser.isAdmin
      };
      
      next();
    });
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Optional authentication - doesn't fail if no token provided
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        req.user = null;
      } else {
        const dbUser = db.prepare('SELECT id, email, isAdmin FROM users WHERE id = ?').get(user.userId);
        req.user = dbUser ? {
          userId: dbUser.id,
          email: dbUser.email,
          isAdmin: dbUser.isAdmin
        } : null;
      }
      next();
    });
  } catch (error) {
    console.error('Optional auth error:', error);
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};