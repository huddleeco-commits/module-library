/**
 * Achievements Routes
 * API endpoints for user achievements and badges
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
// ACHIEVEMENT ENDPOINTS
// ============================================

/**
 * GET /all - Get all achievements with user's status
 */
router.get('/all', async (req, res) => {
  try {
    await ensureSchema();
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const achievements = await db.getAllAchievements(parseInt(userId));
    const progress = await db.getAchievementProgress(parseInt(userId));

    res.json({
      achievements,
      summary: progress.summary
    });
  } catch (error) {
    console.error('[achievements] Fetch all error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /my-achievements - Get user's unlocked achievements
 */
router.get('/my-achievements', async (req, res) => {
  try {
    await ensureSchema();
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const achievements = await db.getUserAchievements(parseInt(userId));

    res.json({
      achievements,
      count: achievements.length,
      totalPoints: achievements.reduce((sum, a) => sum + a.points, 0)
    });
  } catch (error) {
    console.error('[achievements] Fetch user achievements error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /progress - Get achievement progress
 */
router.get('/progress', async (req, res) => {
  try {
    await ensureSchema();
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const progressData = await db.getAchievementProgress(parseInt(userId));

    res.json(progressData);
  } catch (error) {
    console.error('[achievements] Fetch progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /progress/:key - Update progress for an achievement
 */
router.post('/progress/:key', async (req, res) => {
  try {
    await ensureSchema();
    const userId = req.user?.id || req.body.userId;
    const { key } = req.params;
    const { increment = 1 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const result = await db.updateProgress(parseInt(userId), key, increment);

    res.json({
      success: true,
      ...result,
      message: result.unlocked
        ? `${result.unlocked.icon} Achievement unlocked: ${result.unlocked.name}!`
        : 'Progress updated'
    });
  } catch (error) {
    console.error('[achievements] Update progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /unlock/:key - Manually unlock an achievement
 */
router.post('/unlock/:key', async (req, res) => {
  try {
    await ensureSchema();
    const userId = req.user?.id || req.body.userId;
    const { key } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const result = await db.unlockAchievement(parseInt(userId), key);

    if (result.success) {
      res.json({
        success: true,
        achievement: result.achievement,
        message: `${result.achievement.icon} Achievement unlocked: ${result.achievement.name}!`
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('[achievements] Unlock error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /showcase - Get user's showcase badges
 */
router.get('/showcase', async (req, res) => {
  try {
    await ensureSchema();
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const badgeIds = await db.getShowcase(parseInt(userId));

    res.json({ badgeIds });
  } catch (error) {
    console.error('[achievements] Get showcase error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /showcase - Update user's showcase badges
 */
router.put('/showcase', async (req, res) => {
  try {
    await ensureSchema();
    const userId = req.user?.id || req.body.userId;
    const { badges } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (!Array.isArray(badges)) {
      return res.status(400).json({ error: 'Badges must be an array' });
    }

    // Limit to max 5 showcase badges
    const limitedBadges = badges.slice(0, 5).map(id => parseInt(id));

    const result = await db.updateShowcase(parseInt(userId), limitedBadges);

    res.json({
      success: true,
      badgeIds: result.badgeIds
    });
  } catch (error) {
    console.error('[achievements] Update showcase error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
