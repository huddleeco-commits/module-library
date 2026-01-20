const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT id, email, is_admin FROM customers WHERE id = $1', [decoded.id]);
    
    if (!result.rows[0]) return res.status(401).json({ error: 'Invalid token' });
    
    req.user = { ...result.rows[0], isAdmin: result.rows[0].is_admin };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { verifyToken, requireAdmin };
