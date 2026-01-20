const express = require('express');

const router = express.Router();

// Get list of active services
router.get('/list', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const services = db.prepare(`
      SELECT id, name, duration, price, description
      FROM services 
      WHERE active = 1
      ORDER BY price ASC
    `).all();

    res.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to get services' });
  }
});

// Get single service details
router.get('/:id', (req, res) => {
  try {
    const serviceId = req.params.id;
    const db = req.app.locals.db;

    const service = db.prepare(`
      SELECT id, name, duration, price, description
      FROM services 
      WHERE id = ? AND active = 1
    `).get(serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Get available staff for this service
    const staff = db.prepare(`
      SELECT s.id, s.name
      FROM staff s
      JOIN staff_services ss ON s.id = ss.staff_id
      WHERE ss.service_id = ? AND s.active = 1
    `).all(serviceId);

    res.json({ 
      service: {
        ...service,
        availableStaff: staff
      }
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to get service details' });
  }
});

module.exports = router;