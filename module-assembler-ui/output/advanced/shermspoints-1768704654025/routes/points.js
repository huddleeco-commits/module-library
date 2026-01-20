const express = require('express');
const { Pool } = require('pg');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const tiers = {
  Bronze: { threshold: 0, multiplier: 1 },
  Silver: { threshold: 500, multiplier: 1.25 },
  Gold: { threshold: 2000, multiplier: 1.5 },
  Platinum: { threshold: 5000, multiplier: 2 }
};

const calculateTier = (points) => {
  if (points >= 5000) return 'Platinum';
  if (points >= 2000) return 'Gold';
  if (points >= 500) return 'Silver';
  return 'Bronze';
};

router.use(verifyToken);

router.get('/balance', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT points_balance, tier FROM users WHERE id = $1',
      [req.userId]
    );
    
    res.json({ balance: result.rows[0].points_balance, tier: result.rows[0].tier });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM point_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.userId]
    );
    
    res.json({ transactions: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get history' });
  }
});

router.post('/earn', async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const userResult = await client.query(
        'SELECT points_balance, tier FROM users WHERE id = $1',
        [req.userId]
      );
      
      const user = userResult.rows[0];
      const earnedPoints = Math.floor(amount * tiers[user.tier].multiplier);
      const newBalance = user.points_balance + earnedPoints;
      const newTier = calculateTier(newBalance);
      
      await client.query(
        'UPDATE users SET points_balance = $1, tier = $2 WHERE id = $3',
        [newBalance, newTier, req.userId]
      );
      
      await client.query(
        'INSERT INTO point_transactions (user_id, points, type, description) VALUES ($1, $2, $3, $4)',
        [req.userId, earnedPoints, 'earn', description || 'Points earned']
      );
      
      await client.query('COMMIT');
      
      res.json({ earnedPoints, newBalance, tier: newTier });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to earn points' });
  }
});

router.post('/spend', async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const userResult = await client.query(
        'SELECT points_balance FROM users WHERE id = $1',
        [req.userId]
      );
      
      const currentBalance = userResult.rows[0].points_balance;
      
      if (currentBalance < amount) {
        return res.status(400).json({ error: 'Insufficient points' });
      }
      
      const newBalance = currentBalance - amount;
      const newTier = calculateTier(newBalance);
      
      await client.query(
        'UPDATE users SET points_balance = $1, tier = $2 WHERE id = $3',
        [newBalance, newTier, req.userId]
      );
      
      await client.query(
        'INSERT INTO point_transactions (user_id, points, type, description) VALUES ($1, $2, $3, $4)',
        [req.userId, -amount, 'spend', description || 'Points spent']
      );
      
      await client.query('COMMIT');
      
      res.json({ spentPoints: amount, newBalance, tier: newTier });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to spend points' });
  }
});

module.exports = router;