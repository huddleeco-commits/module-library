const express = require('express');
const { Pool } = require('pg');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/customers', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, points, tier, created_at FROM users WHERE is_admin = false ORDER BY points DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({error: 'Failed to get customers'});
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users WHERE is_admin = false');
    const totalPoints = await pool.query('SELECT SUM(points) FROM users WHERE is_admin = false');
    const totalRedemptions = await pool.query('SELECT COUNT(*) FROM redemptions');
    
    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalPoints: parseInt(totalPoints.rows[0].sum) || 0,
      totalRedemptions: parseInt(totalRedemptions.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({error: 'Failed to get stats'});
  }
});

router.post('/:id/points', async (req, res) => {
  try {
    const userId = req.params.id;
    const { amount, description } = req.body;
    
    await pool.query('BEGIN');
    
    const userResult = await pool.query('SELECT points FROM users WHERE id = $1', [userId]);
    if (!userResult.rows[0]) {
      await pool.query('ROLLBACK');
      return res.status(404).json({error: 'User not found'});
    }
    
    const newPoints = userResult.rows[0].points + amount;
    
    let newTier = 'Bronze';
    if (newPoints >= 1000) newTier = 'Gold';
    else if (newPoints >= 500) newTier = 'Silver';
    
    await pool.query('UPDATE users SET points = $1, tier = $2 WHERE id = $3', [newPoints, newTier, userId]);
    
    await pool.query(
      'INSERT INTO point_transactions (user_id, amount, type, description) VALUES ($1, $2, \'admin\', $3)',
      [userId, amount, description || 'Admin adjustment']
    );
    
    await pool.query('COMMIT');
    res.json({ message: 'Points updated successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({error: 'Failed to update points'});
  }
});

module.exports = router;