import express from 'express';
import db from '../database/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/balance', auth, (req, res) => {
  const user = db.prepare('SELECT points_balance FROM users WHERE id = ?').get(req.userId);
  res.json({ balance: user.points_balance });
});

router.get('/history', auth, (req, res) => {
  const transactions = db.prepare(`
    SELECT * FROM point_transactions 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50
  `).all(req.userId);
  res.json(transactions);
});

router.post('/earn', auth, (req, res) => {
  try {
    const { amount, description = 'Points earned' } = req.body;
    
    db.transaction(() => {
      db.prepare('UPDATE users SET points_balance = points_balance + ? WHERE id = ?').run(amount, req.userId);
      db.prepare(`
        INSERT INTO point_transactions (user_id, type, amount, description, created_at) 
        VALUES (?, 'earn', ?, ?, datetime('now'))
      `).run(req.userId, amount, description);
    })();
    
    const newBalance = db.prepare('SELECT points_balance FROM users WHERE id = ?').get(req.userId).points_balance;
    res.json({ message: 'Points earned', balance: newBalance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/spend', auth, (req, res) => {
  try {
    const { amount, description = 'Points spent' } = req.body;
    const user = db.prepare('SELECT points_balance FROM users WHERE id = ?').get(req.userId);
    
    if (user.points_balance < amount) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    
    db.transaction(() => {
      db.prepare('UPDATE users SET points_balance = points_balance - ? WHERE id = ?').run(amount, req.userId);
      db.prepare(`
        INSERT INTO point_transactions (user_id, type, amount, description, created_at) 
        VALUES (?, 'spend', ?, ?, datetime('now'))
      `).run(req.userId, amount, description);
    })();
    
    const newBalance = db.prepare('SELECT points_balance FROM users WHERE id = ?').get(req.userId).points_balance;
    res.json({ message: 'Points spent', balance: newBalance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;