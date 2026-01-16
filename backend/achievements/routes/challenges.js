/**
 * Challenges Routes
 * API endpoints for user challenges and competitions
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
// CHALLENGE ENDPOINTS
// ============================================

/**
 * GET / - Get challenges by status
 */
router.get('/', async (req, res) => {
  try {
    await ensureSchema();
    const { status = 'active', limit = 20 } = req.query;

    const validStatuses = ['pending', 'active', 'completed', 'cancelled', 'all'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const challenges = await db.getChallenges(status, Math.min(parseInt(limit) || 20, 50));

    res.json({
      challenges,
      count: challenges.length,
      status
    });
  } catch (error) {
    console.error('[challenges] Fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /my-challenges - Get user's challenges
 */
router.get('/my-challenges', async (req, res) => {
  try {
    await ensureSchema();
    const userId = req.user?.id || req.query.userId;
    const { status } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const challenges = await db.getUserChallenges(parseInt(userId), status || null);

    res.json({
      challenges,
      count: challenges.length
    });
  } catch (error) {
    console.error('[challenges] Fetch user challenges error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /:id - Get challenge by ID
 */
router.get('/:id', async (req, res) => {
  try {
    await ensureSchema();
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid challenge ID required' });
    }

    const challenge = await db.getChallenge(parseInt(id));

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    res.json({ challenge });
  } catch (error) {
    console.error('[challenges] Fetch challenge error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /create - Create a new challenge
 */
router.post('/create', async (req, res) => {
  try {
    await ensureSchema();
    const creatorId = req.user?.id || req.body.creatorId;

    if (!creatorId) {
      return res.status(400).json({ error: 'Creator ID required' });
    }

    const {
      title,
      description,
      challengeType,
      metric,
      targetValue,
      entryFee,
      prizePool,
      maxParticipants,
      startDate,
      endDate,
      settings
    } = req.body;

    // Validation
    if (!title || title.trim().length < 3) {
      return res.status(400).json({ error: 'Title must be at least 3 characters' });
    }

    if (!challengeType) {
      return res.status(400).json({ error: 'Challenge type is required' });
    }

    const validTypes = ['portfolio_returns', 'trade_count', 'accuracy', 'profit', 'custom'];
    if (!validTypes.includes(challengeType)) {
      return res.status(400).json({ error: `Invalid challenge type. Must be one of: ${validTypes.join(', ')}` });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const result = await db.createChallenge(parseInt(creatorId), {
      title: title.trim(),
      description: description?.trim() || null,
      challengeType,
      metric: metric || challengeType,
      targetValue: targetValue ? parseFloat(targetValue) : null,
      entryFee: entryFee ? parseFloat(entryFee) : 0,
      prizePool: prizePool ? parseFloat(prizePool) : 0,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      startDate: start,
      endDate: end,
      settings: settings || {}
    });

    res.json(result);
  } catch (error) {
    console.error('[challenges] Create error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /:id/join - Join a challenge
 */
router.post('/:id/join', async (req, res) => {
  try {
    await ensureSchema();
    const { id } = req.params;
    const userId = req.user?.id || req.body.userId;
    const { startingValue } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid challenge ID required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const result = await db.joinChallenge(
      parseInt(id),
      parseInt(userId),
      startingValue ? parseFloat(startingValue) : null
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Successfully joined challenge',
      challengeId: result.challengeId
    });
  } catch (error) {
    console.error('[challenges] Join error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /:id/leaderboard - Get challenge leaderboard
 */
router.get('/:id/leaderboard', async (req, res) => {
  try {
    await ensureSchema();
    const { id } = req.params;
    const { limit = 50 } = req.query;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid challenge ID required' });
    }

    const leaderboard = await db.getChallengeLeaderboard(
      parseInt(id),
      Math.min(parseInt(limit) || 50, 100)
    );

    res.json({
      leaderboard,
      count: leaderboard.length
    });
  } catch (error) {
    console.error('[challenges] Leaderboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /:id/score - Update participant score (internal/webhook)
 */
router.post('/:id/score', async (req, res) => {
  try {
    await ensureSchema();
    const { id } = req.params;
    const { userId, score } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid challenge ID required' });
    }

    if (!userId || score === undefined) {
      return res.status(400).json({ error: 'User ID and score are required' });
    }

    const result = await db.updateParticipantScore(
      parseInt(id),
      parseInt(userId),
      parseFloat(score)
    );

    res.json(result);
  } catch (error) {
    console.error('[challenges] Score update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /:id/complete - Complete a challenge (admin)
 */
router.post('/:id/complete', async (req, res) => {
  try {
    await ensureSchema();
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid challenge ID required' });
    }

    const result = await db.completeChallenge(parseInt(id));

    res.json({
      success: true,
      message: result.winnerId
        ? `Challenge completed! Winner: User ${result.winnerId}`
        : 'Challenge completed (no winner)',
      ...result
    });
  } catch (error) {
    console.error('[challenges] Complete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
