const express = require('express');
const { verifyToken } = require('../middleware/auth');
const db = require('../database/db');

const router = express.Router();

router.get('/list', verifyToken, (req, res) => {
  const rewards = db.prepare('SELECT * FROM rewards WHERE is_active = 1 ORDER BY points_required ASC').all();
  res.json(rewards);
});

router.post('/redeem/:id', verifyToken, (req, res) => {
  try {
    const rewardId = req.params.id;
    const customer = db.prepare('SELECT points FROM customers WHERE id = ?').get(req.userId);
    const reward = db.prepare('SELECT * FROM rewards WHERE id = ? AND is_active = 1').get(rewardId);
    
    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    
    if (customer.points < reward.points_required) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    
    const redemptionCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    db.transaction(() => {
      db.prepare('INSERT INTO redemptions (customer_id, reward_id, points_spent, redemption_code) VALUES (?, ?, ?, ?)').run(req.userId, rewardId, reward.points_required, redemptionCode);
      db.prepare('UPDATE customers SET points = points - ? WHERE id = ?').run(reward.points_required, req.userId);
      db.prepare('INSERT INTO points_transactions (customer_id, points, description, type) VALUES (?, ?, ?, ?)').run(req.userId, -reward.points_required, `Redeemed: ${reward.name}`, 'spent');
    })();
    
    res.json({ 
      success: true, 
      message: 'Reward redeemed successfully!', 
      redemptionCode,
      confetti: true,
      reward: reward.name
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;