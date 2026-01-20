const express = require('express');
const router = express.Router();

// ===========================================
// LOYALTY & REWARDS MODULE
// ===========================================
// Provides loyalty program data for companion apps

// Default rewards (in-memory fallback)
const DEFAULT_REWARDS = [
  { id: 1, name: 'Free Appetizer', points: 500, description: 'Any starter from our menu' },
  { id: 2, name: 'Free Dessert', points: 750, description: "Chef's selection dessert" },
  { id: 3, name: '$25 Off', points: 1500, description: 'On orders $75+' },
  { id: 4, name: 'Free Entrée', points: 3000, description: 'Up to $50 value' },
  { id: 5, name: 'VIP Experience', points: 5000, description: 'Private chef table for two' },
];

const DEFAULT_TIERS = [
  { name: 'Bronze', minPoints: 0, perks: ['Earn 1pt per $1', 'Birthday reward'] },
  { name: 'Silver', minPoints: 1000, perks: ['Earn 1.25pt per $1', 'Priority seating', 'Early access to specials'] },
  { name: 'Gold', minPoints: 2500, perks: ['Earn 1.5pt per $1', 'Complimentary valet', 'Exclusive events'] },
  { name: 'Platinum', minPoints: 5000, perks: ['Earn 2pt per $1', 'Personal concierge', 'VIP lounge access'] },
];

// In-memory redemptions for demo
const redemptions = [];

// GET /api/loyalty - Get loyalty program data
router.get('/', async (req, res) => {
  try {
    // Try database first
    let rewards = DEFAULT_REWARDS;
    let tiers = DEFAULT_TIERS;

    if (req.db) {
      try {
        const rewardsResult = await req.db.query('SELECT * FROM loyalty_rewards WHERE active = true ORDER BY points ASC');
        if (rewardsResult.rows.length > 0) {
          rewards = rewardsResult.rows;
        }

        const tiersResult = await req.db.query('SELECT * FROM loyalty_tiers ORDER BY min_points ASC');
        if (tiersResult.rows.length > 0) {
          tiers = tiersResult.rows.map(t => ({
            name: t.name,
            minPoints: t.min_points,
            perks: t.perks || []
          }));
        }
      } catch (dbError) {
        // Database not available, use defaults
        console.log('Using default loyalty data (no database)');
      }
    }

    res.json({
      success: true,
      rewards,
      tiers,
      settings: {
        pointsPerDollar: 1,
        currencySymbol: '$'
      }
    });
  } catch (error) {
    console.error('Loyalty error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch loyalty data' });
  }
});

// GET /api/loyalty/rewards - Get available rewards
router.get('/rewards', async (req, res) => {
  try {
    let rewards = DEFAULT_REWARDS;

    if (req.db) {
      try {
        const result = await req.db.query('SELECT * FROM loyalty_rewards WHERE active = true ORDER BY points ASC');
        if (result.rows.length > 0) {
          rewards = result.rows;
        }
      } catch (dbError) {
        console.log('Using default rewards (no database)');
      }
    }

    res.json({ success: true, rewards });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch rewards' });
  }
});

// POST /api/loyalty/redeem - Redeem a reward
router.post('/redeem', async (req, res) => {
  try {
    const { rewardId } = req.body;
    const userId = req.user?.id || req.user?.userId;

    if (!rewardId) {
      return res.status(400).json({ success: false, error: 'Reward ID required' });
    }

    // Find the reward
    let reward = DEFAULT_REWARDS.find(r => r.id === rewardId);

    if (req.db) {
      try {
        const result = await req.db.query('SELECT * FROM loyalty_rewards WHERE id = $1', [rewardId]);
        if (result.rows.length > 0) {
          reward = result.rows[0];
        }
      } catch (dbError) {
        console.log('Using default reward (no database)');
      }
    }

    if (!reward) {
      return res.status(404).json({ success: false, error: 'Reward not found' });
    }

    // Create redemption record
    const redemption = {
      id: Date.now(),
      rewardId,
      rewardName: reward.name,
      points: reward.points,
      userId,
      redeemedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Try to save to database
    if (req.db && userId) {
      try {
        await req.db.query(
          'INSERT INTO loyalty_redemptions (user_id, reward_id, points_used, status) VALUES ($1, $2, $3, $4)',
          [userId, rewardId, reward.points, 'pending']
        );

        // Deduct points from user
        await req.db.query(
          'UPDATE users SET points = GREATEST(0, points - $1) WHERE id = $2',
          [reward.points, userId]
        );
      } catch (dbError) {
        console.log('Redemption saved in memory (no database)');
      }
    }

    // Save to memory
    redemptions.push(redemption);

    res.json({
      success: true,
      message: `Successfully redeemed: ${reward.name}`,
      redemption,
      pointsUsed: reward.points
    });
  } catch (error) {
    console.error('Redemption error:', error);
    res.status(500).json({ success: false, error: 'Redemption failed' });
  }
});

// GET /api/loyalty/history - Get user's redemption history
router.get('/history', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    let history = redemptions.filter(r => r.userId === userId);

    if (req.db && userId) {
      try {
        const result = await req.db.query(
          `SELECT r.*, lr.name as reward_name
           FROM loyalty_redemptions r
           JOIN loyalty_rewards lr ON r.reward_id = lr.id
           WHERE r.user_id = $1
           ORDER BY r.created_at DESC`,
          [userId]
        );
        if (result.rows.length > 0) {
          history = result.rows;
        }
      } catch (dbError) {
        console.log('Using in-memory redemption history');
      }
    }

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

module.exports = router;
