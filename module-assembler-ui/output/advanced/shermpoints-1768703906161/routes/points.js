const express = require('express');
const { Pool } = require('pg');
const { verifyToken } = require('../middleware/auth');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const router = express.Router();

router.use(verifyToken);

router.get('/balance', async (req, res) => {
  try {
    const result = await pool.query('SELECT points, tier FROM users WHERE id = $1', [req.userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({error: 'Failed to get balance'});
  }
});

router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM point_transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({error: 'Failed to get history'});
  }
});

router.post('/earn', async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    await pool.query('BEGIN');
    
    const userResult = await pool.query('SELECT points, tier FROM users WHERE id = $1', [req.userId]);
    const newPoints = userResult.rows[0].points + amount;
    
    let newTier = 'Bronze';
    if (newPoints >= 1000) newTier = 'Gold';
    else if (newPoints >= 500) newTier = 'Silver';
    
    await pool.query(
      'UPDATE users SET points = $1, tier = $2 WHERE id = $3',
      [newPoints, newTier, req.userId]
    );
    
    await pool.query(
      'INSERT INTO point_transactions (user_id, amount, type, description) VALUES ($1, $2, \'earn\', $3)',
      [req.userId, amount, description]
    );
    
    await pool.query('COMMIT');
    res.json({ points: newPoints, tier: newTier });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({error: 'Failed to earn points'});
  }
});

router.post('/spend', async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    await pool.query('BEGIN');
    
    const userResult = await pool.query('SELECT points FROM users WHERE id = $1', [req.userId]);
    const currentPoints = userResult.rows[0].points;
    
    if (currentPoints < amount) {
      await pool.query('ROLLBACK');
      return res.status(400).json({error: 'Insufficient points'});
    }
    
    const newPoints = currentPoints - amount;
    
    await pool.query('UPDATE users SET points = $1 WHERE id = $2', [newPoints, req.userId]);
    
    await pool.query(
      'INSERT INTO point_transactions (user_id, amount, type, description) VALUES ($1, $2, \'spend\', $3)',
      [req.userId, -amount, description]
    );
    
    await pool.query('COMMIT');
    res.json({ points: newPoints });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({error: 'Failed to spend points'});
  }
});

module.exports = router;