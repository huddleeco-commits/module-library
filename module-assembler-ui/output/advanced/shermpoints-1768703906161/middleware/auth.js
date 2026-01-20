const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({error: 'Access denied. No token provided'});
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    req.user = result.rows[0];
    
    next();
  } catch (error) {
    res.status(401).json({error: 'Invalid token'});
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({error: 'Admin access required'});
  }
  next();
};

module.exports = { verifyToken, requireAdmin };