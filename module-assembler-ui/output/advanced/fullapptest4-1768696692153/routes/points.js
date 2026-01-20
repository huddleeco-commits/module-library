const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

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

// Get user points balance
router.get('/balance', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT points, tier FROM users WHERE id = ?
    `).get(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentTier = calculateTier(user.points);
    const nextTier = TIERS.find(t => t.minPoints > user.points);

    res.json({
      points: user.points,
      tier: currentTier,
      nextTier: nextTier || null,
      pointsToNext: nextTier ? nextTier.minPoints - user.points : 0
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

// Get points transaction history
router.get('/history', authenticateToken, (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE userId = ? 
      ORDER BY createdAt DESC
      LIMIT 50
    `).all(req.user.userId);

    res.json({ transactions });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get transaction history' });
  }
});

// Earn points (admin only)
router.post('/earn', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid user ID or amount' });
    }

    // Get current user points
    const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newPoints = user.points + amount;
    const newTier = calculateTier(newPoints);

    // Start transaction
    const transaction = db.transaction(() => {
      // Update user points and tier
      db.prepare(`
        UPDATE users SET points = ?, tier = ?
        WHERE id = ?
      `).run(newPoints, newTier.name, userId);

      // Record transaction
      db.prepare(`
        INSERT INTO transactions (userId, type, amount, description, createdAt)
        VALUES (?, 'earn', ?, ?, datetime('now'))
      `).run(userId, amount, description || 'Points earned');
    });

    transaction();

    res.json({
      message: 'Points earned successfully',
      newBalance: newPoints,
      tier: newTier
    });
  } catch (error) {
    console.error('Earn points error:', error);
    res.status(500).json({ error: 'Failed to earn points' });
  }
});

// Spend points
router.post('/spend', authenticateToken, (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Get current user points
    const user = db.prepare('SELECT points FROM users WHERE id = ?').get(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.points < amount) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    const newPoints = user.points - amount;
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
        VALUES (?, 'spend', ?, ?, datetime('now'))
      `).run(req.user.userId, amount, description || 'Points spent');
    });

    transaction();

    res.json({
      message: 'Points spent successfully',
      newBalance: newPoints,
      tier: newTier
    });
  } catch (error) {
    console.error('Spend points error:', error);
    res.status(500).json({ error: 'Failed to spend points' });
  }
});

module.exports = router;