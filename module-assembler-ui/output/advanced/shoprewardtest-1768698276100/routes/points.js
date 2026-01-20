const express = require('express');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const db = require('../database/db');

const router = express.Router();

const getTier = (points) => {
  if (points >= 10000) return { name: 'Platinum', multiplier: 1.5 };
  if (points >= 5000) return { name: 'Gold', multiplier: 1.3 };
  if (points >= 1000) return { name: 'Silver', multiplier: 1.2 };
  return { name: 'Bronze', multiplier: 1.0 };
};

router.get('/balance', verifyToken, (req, res) => {
  const customer = db.prepare('SELECT points FROM customers WHERE id = ?').get(req.userId);
  const tier = getTier(customer.points);
  
  res.json({ 
    points: customer.points, 
    tier: tier.name,
    multiplier: tier.multiplier
  });
});

router.get('/history', verifyToken, (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM points_transactions WHERE customer_id = ?';
  let params = [req.userId];
  
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);
  
  const transactions = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM points_transactions WHERE customer_id = ?').get(req.userId).count;
  
  res.json({ transactions, total, page: parseInt(page), limit: parseInt(limit) });
});

router.post('/earn', requireAdmin, (req, res) => {
  const { customerId, points, description } = req.body;
  const customer = db.prepare('SELECT points FROM customers WHERE id = ?').get(customerId);
  
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  const tier = getTier(customer.points);
  const finalPoints = Math.floor(points * tier.multiplier);
  
  db.prepare('INSERT INTO points_transactions (customer_id, points, description, type) VALUES (?, ?, ?, ?)').run(customerId, finalPoints, description, 'earned');
  db.prepare('UPDATE customers SET points = points + ? WHERE id = ?').run(finalPoints, customerId);
  
  res.json({ message: 'Points added successfully', pointsAdded: finalPoints });
});

router.post('/spend', verifyToken, (req, res) => {
  const { points, description } = req.body;
  const customer = db.prepare('SELECT points FROM customers WHERE id = ?').get(req.userId);
  
  if (customer.points < points) {
    return res.status(400).json({ error: 'Insufficient points' });
  }
  
  db.prepare('INSERT INTO points_transactions (customer_id, points, description, type) VALUES (?, ?, ?, ?)').run(req.userId, -points, description, 'spent');
  db.prepare('UPDATE customers SET points = points - ? WHERE id = ?').run(points, req.userId);
  
  res.json({ message: 'Points spent successfully', remainingPoints: customer.points - points });
});

module.exports = router;