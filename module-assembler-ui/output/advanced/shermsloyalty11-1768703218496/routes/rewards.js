const express = require('express');
const { Pool } = require('pg');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.get('/list', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rewards WHERE active = true ORDER BY points_required ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: 'Failed to get rewards' });
  }
});

router.post('/redeem/:id', verifyToken, async (req, res) => {
  try {
    const rewardId = req.params.id;
    
    const rewardResult = await pool.query('SELECT * FROM rewards WHERE id = $1 AND active = true', [rewardId]);
    if (!rewardResult.rows[0]) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    
    const reward = rewardResult.rows[0];
    
    const customerResult = await pool.query('SELECT points FROM customers WHERE id = $1', [req.user.id]);
    const customer = customerResult.rows[0];
    
    if (customer.points < reward.points_required) {
      return res.status(400).json({ error: 'Insufficient ShermCoin balance' });
    }
    
    const newPoints = customer.points - reward.points_required;
    await pool.query('UPDATE customers SET points = $1 WHERE id = $2', [newPoints, req.user.id]);
    
    await pool.query(
      'INSERT INTO point_transactions (customer_id, type, amount, description, balance_after) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'spend', -reward.points_required, `Redeemed: ${reward.name}`, newPoints]
    );
    
    await pool.query(
      'INSERT INTO redemptions (customer_id, reward_id, points_spent) VALUES ($1, $2, $3)',
      [req.user.id, rewardId, reward.points_required]
    );
    
    res.json({ message: 'Reward redeemed successfully', newPoints, reward });
  } catch (error) {
    res.status(400).json({ error: 'Failed to redeem reward' });
  }
});

module.exports = router;