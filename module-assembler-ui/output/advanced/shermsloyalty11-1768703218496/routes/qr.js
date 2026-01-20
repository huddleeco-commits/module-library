const express = require('express');
const QRCode = require('qrcode');
const { Pool } = require('pg');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.get('/member/:id', verifyToken, async (req, res) => {
  try {
    const customerId = req.params.id;
    
    if (req.user.id != customerId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const qrData = JSON.stringify({
      type: 'sherms_loyalty',
      customerId: customerId,
      timestamp: Date.now()
    });
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData);
    res.json({ qrCode: qrCodeDataURL });
  } catch (error) {
    res.status(400).json({ error: 'Failed to generate QR code' });
  }
});

router.post('/scan', verifyToken, async (req, res) => {
  try {
    const { qrData } = req.body;
    
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }
    
    if (parsedData.type !== 'sherms_loyalty') {
      return res.status(400).json({ error: 'Invalid QR code type' });
    }
    
    const customerResult = await pool.query(
      'SELECT id, email, name, points, tier FROM customers WHERE id = $1',
      [parsedData.customerId]
    );
    
    if (!customerResult.rows[0]) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({ customer: customerResult.rows[0] });
  } catch (error) {
    res.status(400).json({ error: 'Failed to process QR scan' });
  }
});

module.exports = router;