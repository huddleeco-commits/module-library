const express = require('express');
const db = require('../database/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

const getTierMultiplier = (tier) => {
  const multipliers = { Bronze: 1, Silver: 1.2, Gold: 1.5, Platinum: 2 };
  return multipliers[tier] || 1;
};

const updateTier = (userId) => {
  const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId);
  let tier = 'Bronze';
  if (user.points >= 10000) tier = 'Platinum';
  else if (user.points >= 5000) tier = 'Gold';
  else if (user.points >= 1000) tier = 'Silver';
  
  db.prepare('UPDATE users SET tier = ? WHERE id = ?').run(tier, userId);
  return tier;
};

// Get balance and tier info
router.get('/balance', verifyToken, (req, res) => {
  try {
    const user = db.prepare('SELECT points, tier FROM users WHERE id = ?').get(req.userId);
    const multiplier = getTierMultiplier(user.tier);
    
    res.json({
      points: user.points,
      tier: user.tier,
      multiplier,
      nextTier: user.tier === 'Bronze' ? 'Silver' : user.tier === 'Silver' ? 'Gold' : user.tier === 'Gold' ? 'Platinum' : null,
      pointsToNext: user.tier === 'Bronze' ? 1000 - user.points : user.tier === 'Silver' ? 5000 - user.points : user.tier === 'Gold' ? 10000 - user.points : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get points history
router.get('/history', verifyToken, (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM point_history WHERE user_id = ?';
    const params = [req.userId];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const history = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM point_history WHERE user_id = ?').get(req.userId);
    
    res.json({
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Add points
router.post('/earn', verifyToken, requireAdmin, (req, res) => {
  try {
    const { userId, amount, description = 'Points earned' } = req.body;
    
    const user = db.prepare('SELECT tier FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const multiplier = getTierMultiplier(user.tier);
    const finalAmount = Math.floor(amount * multiplier);
    
    db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(finalAmount, userId);
    db.prepare('INSERT INTO point_history (user_id, type, amount, description) VALUES (?, "earn", ?, ?)')
      .run(userId, finalAmount, description);
    
    const newTier = updateTier(userId);
    
    res.json({ success: true, pointsAdded: finalAmount, multiplier, newTier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Spend points
router.post('/spend', verifyToken, (req, res) => {
  try {
    const { amount, description = 'Points spent' } = req.body;
    
    const user = db.prepare('SELECT points FROM users WHERE id = ?').get(req.userId);
    if (user.points < amount) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    
    db.prepare('UPDATE users SET points = points - ? WHERE id = ?').run(amount, req.userId);
    db.prepare('INSERT INTO point_history (user_id, type, amount, description) VALUES (?, "spend", ?, ?)')
      .run(req.userId, -amount, description);
    
    res.json({ success: true, pointsSpent: amount, remainingPoints: user.points - amount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;