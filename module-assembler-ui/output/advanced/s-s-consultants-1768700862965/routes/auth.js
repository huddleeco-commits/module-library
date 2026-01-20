const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const db = req.app.locals.db;
    const JWT_SECRET = req.app.locals.JWT_SECRET;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    const insertUser = db.prepare('INSERT INTO users (email, password, name, phone) VALUES (?, ?, ?, ?)');
    const result = insertUser.run(email, hashedPassword, name, phone || null);

    // Generate token
    const token = jwt.sign(
      { userId: result.lastInsertRowid, email, is_admin: 0 },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.lastInsertRowid, email, name, phone }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const db = req.app.locals.db;
    const JWT_SECRET = req.app.locals.JWT_SECRET;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', verifyToken, (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = db.prepare('SELECT id, email, name, phone, is_admin FROM users WHERE id = ?').get(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

module.exports = router;