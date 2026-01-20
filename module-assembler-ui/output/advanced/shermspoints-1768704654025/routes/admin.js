const express = require('express');
const { Pool } = require('pg');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

router.use(verifyToken);
router.use(requireAdmin);

router.get('/customers', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, points_balance, tier, created_at FROM users WHERE is_admin = false ORDER BY created_at DESC'
    );
    
    res.json({ customers: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get customers' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalCustomers = await pool.query(
      'SELECT COUNT(*) FROM users WHERE is_admin = false'
    );
    
    const totalPoints = await pool.query(
      'SELECT SUM(points_balance) FROM users WHERE is_admin = false'
    );
    
    const tierStats = await pool.query(
      'SELECT tier, COUNT(*) FROM users WHERE is_admin = false GROUP BY tier'
    );
    
    const recentTransactions = await pool.query(
      'SELECT COUNT(*) FROM point_transactions WHERE created_at >= NOW() - INTERVAL \'7 days\''
    );
    
    res.json({
      totalCustomers: parseInt(totalCustomers.rows[0].count),
      totalPoints: parseInt(totalPoints.rows[0].sum) || 0,
      tierDistribution: tierStats.rows,
      weeklyTransactions: parseInt(recentTransactions.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.post('/:id/points', async (req, res) => {
  try {
    const userId = req.params.id;
    const { points, description } = req.body;
    
    if (!points || typeof points !== 'number') {
      return res.status(400).json({ error: 'Invalid points amount' });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const userResult = await client.query(
        'SELECT points_balance FROM users WHERE id = $1 AND is_admin = false',
        [userId]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      const currentBalance = userResult.rows[0].points_balance;
      const newBalance = currentBalance + points;
      
      if (newBalance < 0) {
        return res.status(400).json({ error: 'Cannot set negative balance' });
      }
      
      await client.query(
        'UPDATE users SET points_balance = $1 WHERE id = $2',
        [newBalance, userId]
      );
      
      const transactionType = points > 0 ? 'admin_add' : 'admin_remove';
      const transactionDesc = description || `Admin ${points > 0 ? 'added' : 'removed'} points`;
      
      await client.query(
        'INSERT INTO point_transactions (user_id, points, type, description) VALUES ($1, $2, $3, $4)',
        [userId, points, transactionType, transactionDesc]
      );
      
      await client.query('COMMIT');
      
      res.json({ 
        message: 'Points updated successfully',
        newBalance,
        pointsChanged: points
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update points' });
  }
});

module.exports = router;