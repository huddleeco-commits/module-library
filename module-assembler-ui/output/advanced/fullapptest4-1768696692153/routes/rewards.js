const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const TIERS = [
  { name: 'Bronze', minPoints: 0, multiplier: 1, color: '#CD7F32' },
  { name: 'Silver', minPoints: 500, multiplier: 1.25, color: '#C0C0C0' },
  { name: 'Gold', minPoints: 2000, multiplier: 1.5, color: '#FFD700' },
  { name: 'Platinum', minPoints: 5000, multiplier: 2, color: '#E5E4E2' }
];

// Helper function to calculate tier
function calculateTier(points) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].minPoints) {
      return TIERS[i];
    }
  }
  return TIERS[0];
}

// Get list of available rewards
router.get('/list', authenticateToken, (req, res) => {
  try {
    const rewards = db.prepare(`
      SELECT * FROM rewards 
      WHERE isActive = 1
      ORDER BY cost ASC
    `).all();

    // Get user's current points to check affordability
    const user = db.prepare('SELECT points FROM users WHERE id = ?').get(req.user.userId);
    
    const rewardsWithAffordability = rewards.map(reward => ({
      ...reward,
      canAfford: user ? user.points >= reward.cost : false
    }));

    res.json({ rewards: rewardsWithAffordability });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ error: 'Failed to get rewards' });
  }
});

// Redeem a reward
router.post('/redeem/:id', authenticateToken, (req, res) => {
  try {
    const rewardId = parseInt(req.params.id);
    
    if (!rewardId) {
      return res.status(400).json({ error: 'Invalid reward ID' });
    }

    // Get reward details
    const reward = db.prepare(`
      SELECT * FROM rewards WHERE id = ? AND isActive = 1
    `).get(rewardId);

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found or not available' });
    }

    // Get current user points
    const user = db.prepare('SELECT points FROM users WHERE id = ?').get(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.points < reward.cost) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    const newPoints = user.points - reward.cost;
    const newTier = calculateTier(newPoints);

    // Start transaction
    const transaction = db.transaction(() => {
      // Update user points and tier
      db.prepare(`
        UPDATE users SET points = ?, tier = ?
        WHERE id = ?
      `).run(newPoints, newTier.name, req.user.userId);

      // Record transaction
      db.prepare(`
        INSERT INTO transactions (userId, type, amount, description, createdAt)
        VALUES (?, 'redeem', ?, ?, datetime('now'))
      `).run(req.user.userId, reward.cost, `Redeemed: ${reward.name}`);

      // Record redemption
      db.prepare(`
        INSERT INTO redemptions (userId, rewardId, pointsCost, createdAt)
        VALUES (?, ?, ?, datetime('now'))
      `).run(req.user.userId, rewardId, reward.cost);
    });

    transaction();

    res.json({
      message: 'Reward redeemed successfully',
      reward: {
        name: reward.name,
        type: reward.type,
        cost: reward.cost
      },
      newBalance: newPoints,
      tier: newTier
    });
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({ error: 'Failed to redeem reward' });
  }
});

// Get user's redemption history
router.get('/history', authenticateToken, (req, res) => {
  try {
    const redemptions = db.prepare(`
      SELECT r.*, rw.name as rewardName, rw.type as rewardType
      FROM redemptions r
      JOIN rewards rw ON r.rewardId = rw.id
      WHERE r.userId = ?
      ORDER BY r.createdAt DESC
      LIMIT 20
    `).all(req.user.userId);

    res.json({ redemptions });
  } catch (error) {
    console.error('Get redemption history error:', error);
    res.status(500).json({ error: 'Failed to get redemption history' });
  }
});

module.exports = router;