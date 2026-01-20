const express = require('express');
const db = require('../database/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.use(verifyToken, requireAdmin);

// Get customers
router.get('/customers', (req, res) => {
  try {
    const { search, tier, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT id, name, email, phone, member_id, points, tier, created_at FROM users WHERE role != "admin"';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR member_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (tier) {
      query += ' AND tier = ?';
      params.push(tier);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const customers = db.prepare(query).all(...params);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add points to customer
router.post('/customers/:id/points', (req, res) => {
  try {
    const { amount, description = 'Admin adjustment' } = req.body;
    const customerId = req.params.id;
    
    const customer = db.prepare('SELECT * FROM users WHERE id = ?').get(customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    
    db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(amount, customerId);
    db.prepare('INSERT INTO point_history (user_id, type, amount, description) VALUES (?, ?, ?, ?)')
      .run(customerId, amount > 0 ? 'earn' : 'spend', amount, description);
    
    res.json({ success: true, message: 'Points updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
router.get('/stats', (req, res) => {
  try {
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role != "admin"').get();
    const totalPointsIssued = db.prepare('SELECT SUM(amount) as total FROM point_history WHERE type = "earn"').get();
    
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const redemptionsToday = db.prepare('SELECT COUNT(*) as count FROM redemptions WHERE DATE(created_at) = ?').get(today);
    const redemptionsWeek = db.prepare('SELECT COUNT(*) as count FROM redemptions WHERE created_at >= ?').get(weekAgo);
    const redemptionsMonth = db.prepare('SELECT COUNT(*) as count FROM redemptions WHERE created_at >= ?').get(monthAgo);
    
    res.json({
      totalCustomers: totalCustomers.count,
      totalPointsIssued: totalPointsIssued.total || 0,
      redemptions: {
        today: redemptionsToday.count,
        week: redemptionsWeek.count,
        month: redemptionsMonth.count
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analytics
router.get('/analytics', (req, res) => {
  try {
    const tierDistribution = db.prepare(`
      SELECT tier, COUNT(*) as count
      FROM users
      WHERE role != 'admin'
      GROUP BY tier
    `).all();
    
    const topCustomers = db.prepare(`
      SELECT name, email, points, tier
      FROM users
      WHERE role != 'admin'
      ORDER BY points DESC
      LIMIT 10
    `).all();
    
    const pointsEarnedByMonth = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as total
      FROM point_history
      WHERE type = 'earn'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `).all();
    
    res.json({
      tierDistribution,
      topCustomers,
      pointsEarnedByMonth
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;