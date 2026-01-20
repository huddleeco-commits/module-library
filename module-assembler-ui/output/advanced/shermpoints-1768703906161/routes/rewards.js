const express = require('express');
const { Pool } = require('pg');
const { verifyToken } = require('../middleware/auth');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const router = express.Router();

router.get('/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rewards WHERE active = true ORDER BY cost');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({error: 'Failed to get rewards'});
  }
});

router.post('/redeem/:id', verifyToken, async (req, res) => {
  try {
    const rewardId = req.params.id;
    
    await pool.query('BEGIN');
    
    const rewardResult = await pool.query('SELECT * FROM rewards WHERE id = $1 AND active = true', [rewardId]);
    const reward = rewardResult.rows[0];
    
    if (!reward) {
      await pool.query('ROLLBACK');
      return res.status(404).json({error: 'Reward not found'});
    }
    
    const userResult = await pool.query('SELECT points FROM users WHERE id = $1', [req.userId]);
    const userPoints = userResult.rows[0].points;
    
    if (userPoints < reward.cost) {
      await pool.query('ROLLBACK');
      return res.status(400).json({error: 'Insufficient ShermCoin'});
    }
    
    const newPoints = userPoints - reward.cost;
    
    await pool.query('UPDATE users SET points = $1 WHERE id = $2', [newPoints, req.userId]);
    
    await pool.query(
      'INSERT INTO point_transactions (user_id, amount, type, description) VALUES ($1, $2, \'redeem\', $3)',
      [req.userId, -reward.cost, `Redeemed: ${reward.name}`]
    );
    
    await pool.query(
      'INSERT INTO redemptions (user_id, reward_id, cost) VALUES ($1, $2, $3)',
      [req.userId, rewardId, reward.cost]
    );
    
    await pool.query('COMMIT');
    res.json({ message: 'Reward redeemed successfully', remainingPoints: newPoints });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({error: 'Failed to redeem reward'});
  }
});

module.exports = router;