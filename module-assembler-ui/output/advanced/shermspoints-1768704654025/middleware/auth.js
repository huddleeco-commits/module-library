const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await pool.query(
      'SELECT id, is_admin FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.userId = decoded.userId;
    req.isAdmin = result.rows[0].is_admin;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { verifyToken, requireAdmin };