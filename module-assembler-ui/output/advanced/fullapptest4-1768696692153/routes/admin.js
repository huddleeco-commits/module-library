const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticateToken, requireAdmin);

// Get all users
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, email, firstName, lastName, points, tier, createdAt, isAdmin
      FROM users
      ORDER BY createdAt DESC
    `).all();

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Add points to a user
router.post('/users/:id/points', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { amount, description } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: 'Invalid user ID or amount' });
    }

    // Get current user points
    const user = db.prepare('SELECT points, firstName, lastName FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newPoints = user.points + amount;
    
    // Calculate new tier
    const TIERS = [
      { name: 'Bronze', minPoints: 0, multiplier: 1 },
      { name: 'Silver', minPoints: 500, multiplier: 1.25 },
      { name: 'Gold', minPoints: 2000, multiplier: 1.5 },
      { name: 'Platinum', minPoints: 5000, multiplier: 2 }
    ];
    
    let newTier = 'Bronze';
    for (let i = TIERS.length - 1; i >= 0; i--) {
      if (newPoints >= TIERS[i].minPoints) {
        newTier = TIERS[i].name;
        break;
      }
    }

    // Start transaction
    const transaction = db.transaction(() => {
      // Update user points and tier
      db.prepare(`
        UPDATE users SET points = ?, tier = ?
        WHERE id = ?
      `).run(newPoints, newTier, userId);

      // Record transaction
      const transactionType = amount > 0 ? 'earn' : 'spend';
      db.prepare(`
        INSERT INTO transactions (userId, type, amount, description, createdAt)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).run(userId, transactionType, Math.abs(amount), description || 'Admin adjustment');
    });

    transaction();

    res.json({
      message: 'Points updated successfully',
      user: {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        newPoints,
        newTier
      }
    });
  } catch (error) {
    console.error('Update user points error:', error);
    res.status(500).json({ error: 'Failed to update user points' });
  }
});

// Get system statistics
router.get('/stats', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalPoints = db.prepare('SELECT SUM(points) as total FROM users').get().total || 0;
    const totalRedemptions = db.prepare('SELECT COUNT(*) as count FROM redemptions').get().count;
    const totalPointsRedeemed = db.prepare('SELECT SUM(pointsCost) as total FROM redemptions').get().total || 0;
    
    // Tier distribution
    const tierStats = db.prepare(`
      SELECT tier, COUNT(*) as count 
      FROM users 
      GROUP BY tier
    `).all();

    // Recent activity
    const recentTransactions = db.prepare(`
      SELECT t.*, u.firstName, u.lastName, u.email
      FROM transactions t
      JOIN users u ON t.userId = u.id
      ORDER BY t.createdAt DESC
      LIMIT 10
    `).all();

    res.json({
      stats: {
        totalUsers,
        totalPoints,
        totalRedemptions,
        totalPointsRedeemed,
        averagePointsPerUser: totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0
      },
      tierDistribution: tierStats,
      recentActivity: recentTransactions
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get all rewards (including inactive)
router.get('/rewards', (req, res) => {
  try {
    const rewards = db.prepare(`
      SELECT * FROM rewards
      ORDER BY cost ASC
    `).all();

    res.json({ rewards });
  } catch (error) {
    console.error('Get all rewards error:', error);
    res.status(500).json({ error: 'Failed to get rewards' });
  }
});

// Create new reward
router.post('/rewards', (req, res) => {
  try {
    const { name, cost, type, description } = req.body;

    if (!name || !cost || !type) {
      return res.status(400).json({ error: 'Name, cost, and type are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO rewards (name, cost, type, description, isActive, createdAt)
      VALUES (?, ?, ?, ?, 1, datetime('now'))
    `);
    
    const result = stmt.run(name, cost, type, description || '');
    const rewardId = result.lastInsertRowid;

    res.status(201).json({
      message: 'Reward created successfully',
      reward: {
        id: rewardId,
        name,
        cost,
        type,
        description: description || '',
        isActive: 1
      }
    });
  } catch (error) {
    console.error('Create reward error:', error);
    res.status(500).json({ error: 'Failed to create reward' });
  }
});

// Update reward
router.put('/rewards/:id', (req, res) => {
  try {
    const rewardId = parseInt(req.params.id);
    const { name, cost, type, description, isActive } = req.body;

    if (!rewardId) {
      return res.status(400).json({ error: 'Invalid reward ID' });
    }

    const stmt = db.prepare(`
      UPDATE rewards 
      SET name = ?, cost = ?, type = ?, description = ?, isActive = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(name, cost, type, description || '', isActive ? 1 : 0, rewardId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json({ message: 'Reward updated successfully' });
  } catch (error) {
    console.error('Update reward error:', error);
    res.status(500).json({ error: 'Failed to update reward' });
  }
});

// Delete reward
router.delete('/rewards/:id', (req, res) => {
  try {
    const rewardId = parseInt(req.params.id);

    if (!rewardId) {
      return res.status(400).json({ error: 'Invalid reward ID' });
    }

    const stmt = db.prepare('DELETE FROM rewards WHERE id = ?');
    const result = stmt.run(rewardId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json({ message: 'Reward deleted successfully' });
  } catch (error) {
    console.error('Delete reward error:', error);
    res.status(500).json({ error: 'Failed to delete reward' });
  }
});

module.exports = router;