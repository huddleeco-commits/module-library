const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const db = require('../database/db');

const router = express.Router();

router.get('/customers', requireAdmin, (req, res) => {
  const { search, tier, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT id, member_id, name, email, phone, points, tier, created_at FROM customers WHERE 1=1';
  let params = [];
  
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
});

router.post('/customers/:id/points', requireAdmin, (req, res) => {
  const { points, description } = req.body;
  const customerId = req.params.id;
  
  db.prepare('INSERT INTO points_transactions (customer_id, points, description, type) VALUES (?, ?, ?, ?)').run(customerId, points, description, 'earned');
  db.prepare('UPDATE customers SET points = points + ? WHERE id = ?').run(points, customerId);
  
  res.json({ message: 'Points added successfully' });
});

router.get('/stats', requireAdmin, (req, res) => {
  const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
  const totalPoints = db.prepare('SELECT SUM(points) as total FROM points_transactions WHERE type = "earned"').get().total || 0;
  
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const redemptionsToday = db.prepare('SELECT COUNT(*) as count FROM redemptions WHERE DATE(created_at) = ?').get(today).count;
  const redemptionsWeek = db.prepare('SELECT COUNT(*) as count FROM redemptions WHERE created_at >= ?').get(weekAgo).count;
  const redemptionsMonth = db.prepare('SELECT COUNT(*) as count FROM redemptions WHERE created_at >= ?').get(monthAgo).count;
  
  res.json({
    totalCustomers,
    totalPointsIssued: totalPoints,
    redemptions: {
      today: redemptionsToday,
      week: redemptionsWeek,
      month: redemptionsMonth
    }
  });
});

router.get('/analytics', requireAdmin, (req, res) => {
  const tierDistribution = [
    { tier: 'Bronze', count: db.prepare('SELECT COUNT(*) as count FROM customers WHERE points < 1000').get().count },
    { tier: 'Silver', count: db.prepare('SELECT COUNT(*) as count FROM customers WHERE points >= 1000 AND points < 5000').get().count },
    { tier: 'Gold', count: db.prepare('SELECT COUNT(*) as count FROM customers WHERE points >= 5000 AND points < 10000').get().count },
    { tier: 'Platinum', count: db.prepare('SELECT COUNT(*) as count FROM customers WHERE points >= 10000').get().count }
  ];
  
  const topCustomers = db.prepare('SELECT name, email, points FROM customers ORDER BY points DESC LIMIT 10').all();
  
  res.json({ tierDistribution, topCustomers });
});

module.exports = router;