const express = require('express');
const QRCode = require('qrcode');
const { Pool } = require('pg');
const { verifyToken } = require('../middleware/auth');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const router = express.Router();

router.get('/member/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const qrData = JSON.stringify({ type: 'shermpoints_member', userId, timestamp: Date.now() });
    
    const qrCode = await QRCode.toBuffer(qrData, { width: 300 });
    
    res.setHeader('Content-Type', 'image/png');
    res.send(qrCode);
  } catch (error) {
    res.status(500).json({error: 'Failed to generate QR code'});
  }
});

router.post('/scan', verifyToken, async (req, res) => {
  try {
    const { qrData } = req.body;
    
    const data = JSON.parse(qrData);
    
    if (data.type !== 'shermpoints_member') {
      return res.status(400).json({error: 'Invalid QR code'});
    }
    
    const result = await pool.query(
      'SELECT id, email, name, points, tier FROM users WHERE id = $1',
      [data.userId]
    );
    
    if (!result.rows[0]) {
      return res.status(404).json({error: 'Member not found'});
    }
    
    res.json({ member: result.rows[0] });
  } catch (error) {
    res.status(400).json({error: 'Invalid QR code format'});
  }
});

module.exports = router;