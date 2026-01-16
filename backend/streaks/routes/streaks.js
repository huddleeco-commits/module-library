/**
 * Streaks Routes
 * API endpoints for daily login streaks and milestones
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
// STREAK ENDPOINTS
// ============================================

/**
 * GET /:userId - Get user streak info
 */
router.get('/:userId', async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    const streakInfo = await db.getStreakInfo(parseInt(userId));
    res.json(streakInfo);
  } catch (error) {
    console.error('[streaks] Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch streak' });
  }
});

/**
 * POST /:userId/checkin - Record daily check-in
 */
router.post('/:userId/checkin', async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    const result = await db.recordCheckin(parseInt(userId));

    // If bonus was awarded, you may want to credit the user's balance
    // This should be handled by the caller or via an event system
    if (result.bonusAwarded > 0) {
      result.balanceCreditNeeded = true;
      result.creditDetails = {
        amount: result.bonusAwarded,
        type: 'streak_bonus',
        description: `${result.milestoneName} - ${result.currentStreak}-day streak bonus`,
        referenceId: `streak_${userId}_${result.currentStreak}`
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[streaks] Check-in error:', error);
    res.status(500).json({ error: 'Failed to record check-in' });
  }
});

/**
 * GET /:userId/history - Get check-in history
 */
router.get('/:userId/history', async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;
    const { limit = 30 } = req.query;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    const history = await db.getCheckinHistory(
      parseInt(userId),
      Math.min(parseInt(limit) || 30, 100)
    );

    res.json({ history, count: history.length });
  } catch (error) {
    console.error('[streaks] History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * GET /:userId/milestones - Get milestones with progress
 */
router.get('/:userId/milestones', async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    const milestones = await db.getMilestones(parseInt(userId));
    res.json({ milestones });
  } catch (error) {
    console.error('[streaks] Milestones error:', error);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

/**
 * GET /:userId/rank - Get user's leaderboard rank
 */
router.get('/:userId/rank', async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;
    const { type = 'current' } = req.query;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    const rank = await db.getUserRank(parseInt(userId), type);
    const streakInfo = await db.getStreakInfo(parseInt(userId));

    res.json({
      userId: parseInt(userId),
      rank,
      type,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak
    });
  } catch (error) {
    console.error('[streaks] Rank error:', error);
    res.status(500).json({ error: 'Failed to fetch rank' });
  }
});

// ============================================
// LEADERBOARD ENDPOINTS
// ============================================

/**
 * GET /leaderboard/top - Get streak leaderboard
 */
router.get('/leaderboard/top', async (req, res) => {
  try {
    await ensureSchema();
    const { limit = 10, type = 'current' } = req.query;

    const validTypes = ['current', 'longest'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Type must be "current" or "longest"' });
    }

    const leaderboard = await db.getLeaderboard(
      Math.min(parseInt(limit) || 10, 100),
      type
    );

    res.json({
      leaderboard,
      type,
      count: leaderboard.length
    });
  } catch (error) {
    console.error('[streaks] Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * POST /:userId/reset - Reset user streak (admin only)
 */
router.post('/:userId/reset', async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;
    const { adminId, reason } = req.body;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }

    // Note: Add admin authentication middleware in production
    const result = await db.resetStreak(parseInt(userId));

    // Log admin action
    console.log(`[streaks] Admin ${adminId} reset streak for user ${userId}. Reason: ${reason}`);

    res.json(result);
  } catch (error) {
    console.error('[streaks] Reset error:', error);
    res.status(500).json({ error: 'Failed to reset streak' });
  }
});

module.exports = router;
