const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields required' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password, name, points_balance, tier) VALUES ($1, $2, $3, 0, $4) RETURNING id, email, name, points_balance, tier',
      [email, hashedPassword, name, 'Bronze']
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    
    res.json({ token, user });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, points_balance, tier, is_admin FROM users WHERE id = $1',
      [req.userId]
    );
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;