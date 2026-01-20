const express = require('express');
const { Pool } = require('pg');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const updateTier = async (customerId, points) => {
  let tier = 'Bronze';
  if (points >= 5000) tier = 'Platinum';
  else if (points >= 2000) tier = 'Gold';
  else if (points >= 500) tier = 'Silver';
  
  await pool.query('UPDATE customers SET tier = $1 WHERE id = $2', [tier, customerId]);
  return tier;
};

router.get('/balance', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT points, tier FROM customers WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Failed to get balance' });
  }
});

router.get('/history', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM point_transactions WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: 'Failed to get history' });
  }
});

router.post('/earn', verifyToken, async (req, res) => {
  try {
    const { amount, description = 'Points earned' } = req.body;
    
    const customerResult = await pool.query('SELECT points, tier FROM customers WHERE id = $1', [req.user.id]);
    const customer = customerResult.rows[0];
    
    const multipliers = { Bronze: 1, Silver: 1.25, Gold: 1.5, Platinum: 2 };
    const earnedPoints = Math.floor(amount * multipliers[customer.tier]);
    const newPoints = customer.points + earnedPoints;
    
    await pool.query('UPDATE customers SET points = $1 WHERE id = $2', [newPoints, req.user.id]);
    const newTier = await updateTier(req.user.id, newPoints);
    
    await pool.query(
      'INSERT INTO point_transactions (customer_id, type, amount, description, balance_after) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'earn', earnedPoints, description, newPoints]
    );
    
    res.json({ earnedPoints, newPoints, tier: newTier });
  } catch (error) {
    res.status(400).json({ error: 'Failed to earn points' });
  }
});

router.post('/spend', verifyToken, async (req, res) => {
  try {
    const { amount, description = 'Points spent' } = req.body;
    
    const customerResult = await pool.query('SELECT points FROM customers WHERE id = $1', [req.user.id]);
    const customer = customerResult.rows[0];
    
    if (customer.points < amount) {
      return res.status(400).json({ error: 'Insufficient ShermCoin balance' });
    }
    
    const newPoints = customer.points - amount;
    await pool.query('UPDATE customers SET points = $1 WHERE id = $2', [newPoints, req.user.id]);
    const newTier = await updateTier(req.user.id, newPoints);
    
    await pool.query(
      'INSERT INTO point_transactions (customer_id, type, amount, description, balance_after) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'spend', -amount, description, newPoints]
    );
    
    res.json({ spentPoints: amount, newPoints, tier: newTier });
  } catch (error) {
    res.status(400).json({ error: 'Failed to spend points' });
  }
});

module.exports = router;