import express from 'express';
import db from '../database/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Simple admin check - in production, use proper role-based auth
const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(req.userId);
    if (!user?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

router.get('/users', adminAuth, (req, res) => {
  const users = db.prepare(`
    SELECT id, email, name, points_balance, created_at, 
           (SELECT COUNT(*) FROM point_transactions WHERE user_id = users.id) as transaction_count
    FROM users 
    ORDER BY created_at DESC
  `).all();
  res.json(users);
});

router.get('/stats', adminAuth, (req, res) => {
  const stats = {
    totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
    totalPointsEarned: db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM point_transactions WHERE type = "earn"').get().total,
    totalPointsSpent: db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM point_transactions WHERE type = "spend"').get().total,
    totalRedemptions: db.prepare('SELECT COUNT(*) as count FROM redemptions').get().count,
    activeRewards: db.prepare('SELECT COUNT(*) as count FROM rewards WHERE active = 1').get().count
  };
  res.json(stats);
});

router.post('/users/:userId/points', adminAuth, (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;
    
    db.transaction(() => {
      db.prepare('UPDATE users SET points_balance = points_balance + ? WHERE id = ?').run(amount, userId);
      db.prepare(`
        INSERT INTO point_transactions (user_id, type, amount, description, created_at) 
        VALUES (?, ?, ?, ?, datetime('now'))
      `).run(userId, amount > 0 ? 'earn' : 'spend', Math.abs(amount), description || 'Admin adjustment');
    })();
    
    res.json({ message: 'Points updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/rewards', adminAuth, (req, res) => {
  try {
    const { name, description, points_cost, active = 1 } = req.body;
    const stmt = db.prepare(`
      INSERT INTO rewards (name, description, points_cost, active, created_at) 
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    const result = stmt.run(name, description, points_cost, active);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Reward created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/rewards/:rewardId', adminAuth, (req, res) => {
  try {
    const { rewardId } = req.params;
    const { name, description, points_cost, active } = req.body;
    
    db.prepare(`
      UPDATE rewards 
      SET name = ?, description = ?, points_cost = ?, active = ?
      WHERE id = ?
    `).run(name, description, points_cost, active, rewardId);
    
    res.json({ message: 'Reward updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;