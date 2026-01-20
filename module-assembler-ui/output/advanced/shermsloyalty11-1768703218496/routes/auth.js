const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 12);
    
    const result = await pool.query(
      'INSERT INTO customers (email, password, name, phone, points, tier) VALUES ($1, $2, $3, $4, 0, $5) RETURNING id, email, name, phone, points, tier, created_at',
      [email, hashedPassword, name, phone, 'Bronze']
    );
    
    const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET);
    res.json({ token, customer: result.rows[0] });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
    if (!result.rows[0]) return res.status(400).json({ error: 'Invalid credentials' });
    
    const validPassword = await bcryptjs.compare(password, result.rows[0].password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET);
    const { password: _, ...customer } = result.rows[0];
    res.json({ token, customer });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, phone, points, tier, created_at FROM customers WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Failed to get user' });
  }
});

module.exports = router;