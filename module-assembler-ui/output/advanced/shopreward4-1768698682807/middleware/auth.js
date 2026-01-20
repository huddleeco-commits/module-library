const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'shopreward4_secret';

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    
    // Check if user exists and get role
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.isAdmin = user.role === 'admin';
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { verifyToken, requireAdmin };