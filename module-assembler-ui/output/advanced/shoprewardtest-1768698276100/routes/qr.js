const express = require('express');
const QRCode = require('qrcode');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const db = require('../database/db');

const router = express.Router();

router.get('/member/:id', verifyToken, async (req, res) => {
  try {
    const memberId = req.params.id;
    const customer = db.prepare('SELECT member_id, name FROM customers WHERE member_id = ?').get(memberId);
    
    if (!customer) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    const qrData = JSON.stringify({
      memberId: customer.member_id,
      name: customer.name,
      business: 'ShopRewardTest'
    });
    
    const qrCode = await QRCode.toDataURL(qrData, {
      type: 'image/png',
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    res.json({ qrCode, memberId: customer.member_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/scan', requireAdmin, (req, res) => {
  try {
    const { qrData } = req.body;
    const data = JSON.parse(qrData);
    
    if (data.business !== 'ShopRewardTest') {
      return res.status(400).json({ error: 'Invalid QR code' });
    }
    
    const customer = db.prepare('SELECT id, member_id, name, email, points FROM customers WHERE member_id = ?').get(data.memberId);
    
    if (!customer) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({ customer });
  } catch (error) {
    res.status(400).json({ error: 'Invalid QR code format' });
  }
});

module.exports = router;