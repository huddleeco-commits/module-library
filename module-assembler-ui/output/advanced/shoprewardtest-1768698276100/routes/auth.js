const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { verifyToken } = require('../middleware/auth');
const db = require('../database/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, referralCode } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const memberId = crypto.randomBytes(8).toString('hex').toUpperCase();
    const newReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    const stmt = db.prepare('INSERT INTO customers (member_id, name, email, phone, password, referral_code) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(memberId, name, email, phone, hashedPassword, newReferralCode);
    
    if (referralCode) {
      const referrer = db.prepare('SELECT id FROM customers WHERE referral_code = ?').get(referralCode);
      if (referrer) {
        db.prepare('INSERT INTO points_transactions (customer_id, points, description, type) VALUES (?, ?, ?, ?)').run(referrer.id, 100, 'Referral bonus', 'earned');
        db.prepare('UPDATE customers SET points = points + 100 WHERE id = ?').run(referrer.id);
      }
    }
    
    const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET);
    res.json({ token, memberId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email);
    
    if (!customer || !(await bcrypt.compare(password, customer.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: customer.id }, JWT_SECRET);
    res.json({ token, memberId: customer.member_id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', verifyToken, (req, res) => {
  const customer = db.prepare('SELECT id, member_id, name, email, phone, points, tier, referral_code FROM customers WHERE id = ?').get(req.userId);
  res.json(customer);
});

router.post('/referral', verifyToken, (req, res) => {
  const { referralCode } = req.body;
  const referrer = db.prepare('SELECT id FROM customers WHERE referral_code = ?').get(referralCode);
  
  if (!referrer) {
    return res.status(404).json({ error: 'Invalid referral code' });
  }
  
  db.prepare('INSERT INTO points_transactions (customer_id, points, description, type) VALUES (?, ?, ?, ?)').run(referrer.id, 100, 'Referral bonus', 'earned');
  db.prepare('UPDATE customers SET points = points + 100 WHERE id = ?').run(referrer.id);
  
  res.json({ message: 'Referral points added' });
});

module.exports = router;