const express = require('express');
const { Pool } = require('pg');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

router.get('/list', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM rewards WHERE active = true ORDER BY points_cost ASC'
    );
    
    res.json({ rewards: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get rewards' });
  }
});

router.post('/redeem/:id', verifyToken, async (req, res) => {
  try {
    const rewardId = req.params.id;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const rewardResult = await client.query(
        'SELECT * FROM rewards WHERE id = $1 AND active = true',
        [rewardId]
      );
      
      if (rewardResult.rows.length === 0) {
        return res.status(404).json({ error: 'Reward not found' });
      }
      
      const reward = rewardResult.rows[0];
      
      const userResult = await client.query(
        'SELECT points_balance FROM users WHERE id = $1',
        [req.userId]
      );
      
      const currentBalance = userResult.rows[0].points_balance;
      
      if (currentBalance < reward.points_cost) {
        return res.status(400).json({ error: 'Insufficient ShermCoin balance' });
      }
      
      const newBalance = currentBalance - reward.points_cost;
      
      await client.query(
        'UPDATE users SET points_balance = $1 WHERE id = $2',
        [newBalance, req.userId]
      );
      
      await client.query(
        'INSERT INTO point_transactions (user_id, points, type, description) VALUES ($1, $2, $3, $4)',
        [req.userId, -reward.points_cost, 'redeem', `Redeemed: ${reward.name}`]
      );
      
      await client.query(
        'INSERT INTO reward_redemptions (user_id, reward_id, points_spent) VALUES ($1, $2, $3)',
        [req.userId, rewardId, reward.points_cost]
      );
      
      await client.query('COMMIT');
      
      res.json({ 
        message: 'Reward redeemed successfully',
        reward: reward.name,
        pointsSpent: reward.points_cost,
        newBalance
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to redeem reward' });
  }
});

module.exports = router;