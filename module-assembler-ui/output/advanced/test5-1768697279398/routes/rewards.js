import express from 'express';
import db from '../database/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/list', auth, (req, res) => {
  const rewards = db.prepare('SELECT * FROM rewards WHERE active = 1 ORDER BY points_cost ASC').all();
  res.json(rewards);
});

router.post('/redeem/:rewardId', auth, (req, res) => {
  try {
    const { rewardId } = req.params;
    const user = db.prepare('SELECT points_balance FROM users WHERE id = ?').get(req.userId);
    const reward = db.prepare('SELECT * FROM rewards WHERE id = ? AND active = 1').get(rewardId);
    
    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    
    if (user.points_balance < reward.points_cost) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    
    db.transaction(() => {
      db.prepare('UPDATE users SET points_balance = points_balance - ? WHERE id = ?').run(reward.points_cost, req.userId);
      
      db.prepare(`
        INSERT INTO point_transactions (user_id, type, amount, description, created_at) 
        VALUES (?, 'spend', ?, ?, datetime('now'))
      `).run(req.userId, reward.points_cost, `Redeemed: ${reward.name}`);
      
      db.prepare(`
        INSERT INTO redemptions (user_id, reward_id, points_spent, status, created_at) 
        VALUES (?, ?, ?, 'pending', datetime('now'))
      `).run(req.userId, rewardId, reward.points_cost);
    })();
    
    const newBalance = db.prepare('SELECT points_balance FROM users WHERE id = ?').get(req.userId).points_balance;
    res.json({ message: 'Reward redeemed successfully', balance: newBalance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/my-redemptions', auth, (req, res) => {
  const redemptions = db.prepare(`
    SELECT r.*, rw.name as reward_name, rw.description as reward_description
    FROM redemptions r
    JOIN rewards rw ON r.reward_id = rw.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `).all(req.userId);
  res.json(redemptions);
});

export default router;