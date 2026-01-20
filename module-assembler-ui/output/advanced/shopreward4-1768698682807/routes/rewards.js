const express = require('express');
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Get available rewards
router.get('/list', verifyToken, (req, res) => {
  try {
    const rewards = db.prepare('SELECT * FROM rewards WHERE active = 1 ORDER BY points_cost ASC').all();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Redeem reward
router.post('/redeem/:id', verifyToken, (req, res) => {
  try {
    const rewardId = req.params.id;
    
    const reward = db.prepare('SELECT * FROM rewards WHERE id = ? AND active = 1').get(rewardId);
    if (!reward) return res.status(404).json({ error: 'Reward not found' });
    
    const user = db.prepare('SELECT points, name, email FROM users WHERE id = ?').get(req.userId);
    if (user.points < reward.points_cost) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    
    // Start transaction
    const transaction = db.transaction(() => {
      // Deduct points
      db.prepare('UPDATE users SET points = points - ? WHERE id = ?')
        .run(reward.points_cost, req.userId);
      
      // Add to history
      db.prepare('INSERT INTO point_history (user_id, type, amount, description) VALUES (?, "spend", ?, ?)')
        .run(req.userId, -reward.points_cost, `Redeemed: ${reward.name}`);
      
      // Create redemption record
      const redemptionCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      db.prepare('INSERT INTO redemptions (user_id, reward_id, points_spent, redemption_code, status) VALUES (?, ?, ?, ?, "pending")')
        .run(req.userId, rewardId, reward.points_cost, redemptionCode);
      
      return redemptionCode;
    });
    
    const redemptionCode = transaction();
    
    res.json({
      success: true,
      message: 'Reward redeemed successfully!',
      redemptionCode,
      confetti: true,
      remainingPoints: user.points - reward.points_cost
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;