const express = require('express');
const { Pool } = require('pg');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.use(verifyToken, requireAdmin);

router.get('/customers', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, phone, points, tier, created_at FROM customers ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: 'Failed to get customers' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [customers, totalPoints, redemptions, transactions] = await Promise.all([
      pool.query('SELECT COUNT(*) as count, tier FROM customers GROUP BY tier'),
      pool.query('SELECT SUM(points) as total FROM customers'),
      pool.query('SELECT COUNT(*) as count FROM redemptions WHERE created_at > NOW() - INTERVAL \'30 days\''),
      pool.query('SELECT COUNT(*) as count FROM point_transactions WHERE created_at > NOW() - INTERVAL \'30 days\'')
    ]);
    
    res.json({
      customersByTier: customers.rows,
      totalPointsIssued: totalPoints.rows[0].total || 0,
      redemptionsThisMonth: redemptions.rows[0].count,
      transactionsThisMonth: transactions.rows[0].count
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to get stats' });
  }
});

router.post('/:id/points', async (req, res) => {
  try {
    const customerId = req.params.id;
    const { amount, description = 'Admin adjustment' } = req.body;
    
    const customerResult = await pool.query('SELECT points FROM customers WHERE id = $1', [customerId]);
    if (!customerResult.rows[0]) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const newPoints = Math.max(0, customerResult.rows[0].points + amount);
    await pool.query('UPDATE customers SET points = $1 WHERE id = $2', [newPoints, customerId]);
    
    await pool.query(
      'INSERT INTO point_transactions (customer_id, type, amount, description, balance_after) VALUES ($1, $2, $3, $4, $5)',
      [customerId, amount > 0 ? 'earn' : 'spend', amount, description, newPoints]
    );
    
    res.json({ message: 'Points updated successfully', newPoints });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update points' });
  }
});

module.exports = router;