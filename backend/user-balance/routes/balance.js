/**
 * User Balance Routes
 * API endpoints for wallet management and transaction history
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Initialize schema on first load
let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized && process.env.DATABASE_URL) {
    await db.initializeSchema();
    schemaInitialized = true;
  }
}

// ============================================
// BALANCE ENDPOINTS
// ============================================

/**
 * GET /:userId - Get user balance and summary
 */
router.get('/:userId', async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    const balance = await db.getBalanceSummary(parseInt(userId));
    res.json(balance);
  } catch (error) {
    console.error('[user-balance] Balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

/**
 * POST /:userId/credit - Add to balance
 * Used by: surveys, spins, streak bonuses, achievements, referrals
 */
router.post('/:userId/credit', async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;
    const { amount, type, description, referenceId, metadata } = req.body;

    // Validation
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    if (!type) {
      return res.status(400).json({ error: 'Transaction type is required' });
    }

    const validTypes = ['survey', 'spin', 'streak_bonus', 'achievement', 'referral', 'bonus', 'adjustment'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    const result = await db.creditBalance(
      parseInt(userId),
      parseFloat(amount),
      type,
      description || `${type} credit`,
      referenceId || null,
      metadata || {}
    );

    res.json(result);
  } catch (error) {
    console.error('[user-balance] Credit error:', error);
    res.status(500).json({ error: 'Failed to credit balance', details: error.message });
  }
});

/**
 * POST /:userId/debit - Deduct from balance
 * Used by: cashouts, purchases
 */
router.post('/:userId/debit', async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;
    const { amount, type, description, referenceId, metadata } = req.body;

    // Validation
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const result = await db.debitBalance(
      parseInt(userId),
      parseFloat(amount),
      type || 'debit',
      description || 'Balance debit',
      referenceId || null,
      metadata || {}
    );

    res.json(result);
  } catch (error) {
    console.error('[user-balance] Debit error:', error);

    if (error.message === 'Insufficient balance') {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    res.status(500).json({ error: 'Failed to debit balance', details: error.message });
  }
});

/**
 * POST /:userId/hold - Hold balance for pending cashout
 */
router.post('/:userId/hold', async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;
    const { amount, referenceId } = req.body;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    if (!referenceId) {
      return res.status(400).json({ error: 'Reference ID required for holds' });
    }

    const result = await db.holdBalance(parseInt(userId), parseFloat(amount), referenceId);
    res.json(result);
  } catch (error) {
    console.error('[user-balance] Hold error:', error);

    if (error.message === 'Insufficient available balance') {
      return res.status(400).json({ error: 'Insufficient available balance' });
    }

    res.status(500).json({ error: 'Failed to hold balance' });
  }
});

/**
 * POST /:userId/release - Release held balance
 */
router.post('/:userId/release', async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;
    const { amount, referenceId, completed } = req.body;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    if (!amount || !referenceId) {
      return res.status(400).json({ error: 'Amount and reference ID required' });
    }

    const result = await db.releaseHold(
      parseInt(userId),
      parseFloat(amount),
      referenceId,
      completed !== false // Default to true (cashout completed)
    );

    res.json(result);
  } catch (error) {
    console.error('[user-balance] Release error:', error);
    res.status(500).json({ error: 'Failed to release hold' });
  }
});

// ============================================
// TRANSACTION ENDPOINTS
// ============================================

/**
 * GET /:userId/transactions - Get transaction history
 */
router.get('/:userId/transactions', async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;
    const { type, status, limit = 50, offset = 0 } = req.query;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    const result = await db.getTransactions(parseInt(userId), {
      type: type || null,
      status: status || null,
      limit: Math.min(parseInt(limit) || 50, 100), // Max 100
      offset: parseInt(offset) || 0
    });

    res.json(result);
  } catch (error) {
    console.error('[user-balance] Transaction history error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /:userId/earnings - Get earnings breakdown by source
 */
router.get('/:userId/earnings', async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;
    const { period = 'month' } = req.query;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    const validPeriods = ['today', 'week', 'month', 'year', 'all'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ error: `Invalid period. Must be one of: ${validPeriods.join(', ')}` });
    }

    const earnings = await db.getEarningsBreakdown(parseInt(userId), period);
    res.json(earnings);
  } catch (error) {
    console.error('[user-balance] Earnings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

// ============================================
// ADMIN/INTERNAL ENDPOINTS
// ============================================

/**
 * POST /:userId/adjust - Admin adjustment (bonus or correction)
 */
router.post('/:userId/adjust', async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;
    const { amount, reason, adminId } = req.body;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Amount is required' });
    }

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required for adjustments' });
    }

    let result;
    if (amount > 0) {
      result = await db.creditBalance(
        parseInt(userId),
        amount,
        'adjustment',
        reason,
        null,
        { adminId, adjustmentType: 'credit' }
      );
    } else {
      result = await db.debitBalance(
        parseInt(userId),
        Math.abs(amount),
        'adjustment',
        reason,
        null,
        { adminId, adjustmentType: 'debit' }
      );
    }

    res.json(result);
  } catch (error) {
    console.error('[user-balance] Adjustment error:', error);
    res.status(500).json({ error: 'Failed to adjust balance' });
  }
});

module.exports = router;
