const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'shopreward4_secret';

const generateMemberId = () => 'SR' + Date.now().toString().slice(-8);
const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, referralCode } = req.body;
    
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const memberId = generateMemberId();
    const userReferralCode = generateReferralCode();
    
    const insert = db.prepare(`
      INSERT INTO users (name, email, phone, password, member_id, referral_code, points, tier)
      VALUES (?, ?, ?, ?, ?, ?, 0, 'Bronze')
    `);
    
    const result = insert.run(name, email, phone, hashedPassword, memberId, userReferralCode);
    
    // Handle referral bonus
    if (referralCode) {
      const referrer = db.prepare('SELECT id FROM users WHERE referral_code = ?').get(referralCode);
      if (referrer) {
        db.prepare('UPDATE users SET points = points + 100 WHERE id = ?').run(referrer.id);
        db.prepare('INSERT INTO point_history (user_id, type, amount, description) VALUES (?, "earn", 100, "Referral bonus")')
          .run(referrer.id);
      }
    }
    
    const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, memberId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, memberId: user.member_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', verifyToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, phone, member_id, referral_code, points, tier FROM users WHERE id = ?')
      .get(req.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Use referral code
router.post('/referral', verifyToken, (req, res) => {
  try {
    const { code } = req.body;
    
    const referrer = db.prepare('SELECT id FROM users WHERE referral_code = ?').get(code);
    if (!referrer) return res.status(404).json({ error: 'Invalid referral code' });
    
    if (referrer.id === req.userId) return res.status(400).json({ error: 'Cannot use own referral code' });
    
    db.prepare('UPDATE users SET points = points + 50 WHERE id = ?').run(req.userId);
    db.prepare('INSERT INTO point_history (user_id, type, amount, description) VALUES (?, "earn", 50, "Used referral code")')
      .run(req.userId);
    
    res.json({ message: 'Referral bonus added', points: 50 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;