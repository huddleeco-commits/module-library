const express = require('express');
const QRCode = require('qrcode');
const { Pool } = require('pg');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

router.get('/member/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const result = await pool.query(
      'SELECT id, name FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    const qrData = JSON.stringify({
      type: 'sherms_member',
      userId: userId,
      timestamp: Date.now()
    });
    
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      type: 'png',
      width: 256,
      margin: 2
    });
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="member-${userId}.png"`);
    res.send(qrCodeBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

router.post('/scan', verifyToken, async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({ error: 'QR data required' });
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }
    
    if (parsedData.type !== 'sherms_member' || !parsedData.userId) {
      return res.status(400).json({ error: 'Invalid ShermsPoints QR code' });
    }
    
    const result = await pool.query(
      'SELECT id, name, email, points_balance, tier FROM users WHERE id = $1 AND is_admin = false',
      [parsedData.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    const member = result.rows[0];
    
    res.json({
      valid: true,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        balance: member.points_balance,
        tier: member.tier
      },
      scannedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify QR code' });
  }
});

module.exports = router;