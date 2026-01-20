const express = require('express');
const QRCode = require('qrcode');
const db = require('../database/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Generate QR code for member card
router.get('/member/:id', verifyToken, async (req, res) => {
  try {
    const memberId = req.params.id;
    
    // Verify user owns this member ID or is admin
    const user = db.prepare('SELECT id, member_id FROM users WHERE id = ?').get(req.userId);
    if (user.member_id !== memberId && !req.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const qrData = {
      type: 'member_card',
      memberId,
      business: 'ShopReward4'
    };
    
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData), {
      type: 'image/png',
      width: 256,
      margin: 2
    });
    
    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scan member QR code (admin only)
router.post('/scan', verifyToken, requireAdmin, (req, res) => {
  try {
    const { qrData } = req.body;
    
    let data;
    try {
      data = JSON.parse(qrData);
    } catch {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }
    
    if (data.type !== 'member_card' || !data.memberId) {
      return res.status(400).json({ error: 'Invalid member card QR code' });
    }
    
    const user = db.prepare(`
      SELECT id, name, email, member_id, points, tier
      FROM users
      WHERE member_id = ?
    `).get(data.memberId);
    
    if (!user) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Get recent point history
    const recentHistory = db.prepare(`
      SELECT type, amount, description, created_at
      FROM point_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).all(user.id);
    
    res.json({
      member: user,
      recentHistory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;