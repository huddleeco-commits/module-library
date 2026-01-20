const express = require('express');

const router = express.Router();

// Get all services
router.get('/list', (req, res) => {
  try {
    const db = req.app.locals.db;
    const services = db.prepare('SELECT * FROM services ORDER BY price').all();
    
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get services' });
  }
});

// Get service by ID
router.get('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const serviceId = req.params.id;
    
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json({ service });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get service' });
  }
});

module.exports = router;