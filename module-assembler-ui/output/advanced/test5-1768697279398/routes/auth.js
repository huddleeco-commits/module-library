import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'test5_loyalty_secret';

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare('INSERT INTO users (email, password, name, points_balance, created_at) VALUES (?, ?, ?, 0, datetime("now"))');
    const result = stmt.run(email, hashedPassword, name);
    
    const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET);
    res.status(201).json({ token, message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, email, name, points_balance, created_at FROM users WHERE id = ?').get(req.userId);
  res.json(user);
});

export default router;