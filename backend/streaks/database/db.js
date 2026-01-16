/**
 * Streaks Database Service
 * Handles all database operations for user daily streaks
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create connection pool
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('[streaks] Unexpected pool error:', err);
    });
  }
  return pool;
}

// Initialize the schema
async function initializeSchema() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await getPool().query(schema);
    console.log('[streaks] Schema initialized');
    return true;
  } catch (err) {
    console.error('[streaks] Schema init failed:', err.message);
    return false;
  }
}

// ============================================
// STREAK OPERATIONS
// ============================================

/**
 * Get or create user streak record
 */
async function getStreak(userId) {
  const db = getPool();

  let result = await db.query(
    'SELECT * FROM user_streaks WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    result = await db.query(
      `INSERT INTO user_streaks (user_id, current_streak, longest_streak, total_checkins)
       VALUES ($1, 0, 0, 0)
       RETURNING *`,
      [userId]
    );
  }

  return result.rows[0];
}

/**
 * Get full streak info with next milestone
 */
async function getStreakInfo(userId) {
  const db = getPool();

  const streak = await getStreak(userId);
  const today = new Date().toISOString().split('T')[0];

  // Check if already checked in today
  const todayCheckin = await db.query(
    'SELECT * FROM streak_checkins WHERE user_id = $1 AND checkin_date = $2',
    [userId, today]
  );

  // Get next milestone
  const nextMilestone = await db.query(
    `SELECT * FROM streak_milestones
     WHERE days_required > $1 AND active = true
     ORDER BY days_required ASC LIMIT 1`,
    [streak.current_streak]
  );

  const milestone = nextMilestone.rows[0];

  return {
    userId: parseInt(userId),
    currentStreak: streak.current_streak,
    longestStreak: streak.longest_streak,
    lastActiveDate: streak.last_active_date,
    totalCheckins: streak.total_checkins,
    todayCompleted: todayCheckin.rows.length > 0,
    nextMilestone: milestone ? milestone.days_required : null,
    nextMilestoneReward: milestone ? parseFloat(milestone.bonus_amount) : null,
    nextMilestoneName: milestone ? milestone.badge_name : null,
    daysUntilMilestone: milestone ? milestone.days_required - streak.current_streak : null,
    updatedAt: streak.updated_at
  };
}

/**
 * Record daily check-in and calculate streak
 */
async function recordCheckin(userId) {
  const db = getPool();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if already checked in today
    const existingCheckin = await client.query(
      'SELECT * FROM streak_checkins WHERE user_id = $1 AND checkin_date = $2',
      [userId, today]
    );

    if (existingCheckin.rows.length > 0) {
      await client.query('ROLLBACK');
      return {
        success: true,
        alreadyCheckedIn: true,
        currentStreak: existingCheckin.rows[0].streak_count,
        message: 'Already checked in today'
      };
    }

    // Get current streak info
    let streakResult = await client.query(
      'SELECT * FROM user_streaks WHERE user_id = $1 FOR UPDATE',
      [userId]
    );

    // Create if doesn't exist
    if (streakResult.rows.length === 0) {
      streakResult = await client.query(
        `INSERT INTO user_streaks (user_id, current_streak, longest_streak, total_checkins)
         VALUES ($1, 0, 0, 0)
         RETURNING *`,
        [userId]
      );
    }

    const streak = streakResult.rows[0];
    let newStreak;

    // Calculate new streak
    if (streak.last_active_date === null) {
      // First ever check-in
      newStreak = 1;
    } else {
      const lastDate = new Date(streak.last_active_date).toISOString().split('T')[0];

      if (lastDate === yesterday) {
        // Consecutive day - increment streak
        newStreak = streak.current_streak + 1;
      } else if (lastDate === today) {
        // Same day - shouldn't happen but handle it
        newStreak = streak.current_streak;
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
      }
    }

    // Update longest streak if needed
    const newLongest = Math.max(streak.longest_streak, newStreak);

    // Check for milestone
    const milestoneResult = await client.query(
      'SELECT * FROM streak_milestones WHERE days_required = $1 AND active = true',
      [newStreak]
    );

    const milestone = milestoneResult.rows[0];
    let bonusAwarded = 0;

    if (milestone) {
      bonusAwarded = parseFloat(milestone.bonus_amount);
    }

    // Update streak record
    await client.query(
      `UPDATE user_streaks
       SET current_streak = $2, longest_streak = $3, last_active_date = $4,
           total_checkins = total_checkins + 1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId, newStreak, newLongest, today]
    );

    // Record check-in
    await client.query(
      `INSERT INTO streak_checkins (user_id, checkin_date, streak_count, bonus_awarded, milestone_reached)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, today, newStreak, bonusAwarded, milestone ? newStreak : null]
    );

    await client.query('COMMIT');

    // Build response
    const result = {
      success: true,
      alreadyCheckedIn: false,
      currentStreak: newStreak,
      longestStreak: newLongest,
      totalCheckins: streak.total_checkins + 1,
      bonusAwarded: bonusAwarded,
      milestoneReached: milestone ? newStreak : null,
      milestoneName: milestone ? milestone.badge_name : null,
      milestoneIcon: milestone ? milestone.badge_icon : null,
      message: milestone
        ? `${milestone.badge_icon} ${newStreak}-day streak! ${milestone.badge_name} unlocked! +$${bonusAwarded.toFixed(2)} bonus!`
        : newStreak === 1
          ? 'Streak started! Come back tomorrow to keep it going.'
          : `🔥 ${newStreak}-day streak! Keep it up!`
    };

    // Get next milestone
    const nextMilestone = await db.query(
      `SELECT * FROM streak_milestones
       WHERE days_required > $1 AND active = true
       ORDER BY days_required ASC LIMIT 1`,
      [newStreak]
    );

    if (nextMilestone.rows[0]) {
      result.nextMilestone = nextMilestone.rows[0].days_required;
      result.nextMilestoneReward = parseFloat(nextMilestone.rows[0].bonus_amount);
      result.daysUntilMilestone = nextMilestone.rows[0].days_required - newStreak;
    }

    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[streaks] Check-in failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get streak leaderboard
 */
async function getLeaderboard(limit = 10, type = 'current') {
  const db = getPool();

  const orderBy = type === 'longest' ? 'longest_streak' : 'current_streak';

  const result = await db.query(`
    SELECT
      user_id,
      current_streak,
      longest_streak,
      total_checkins,
      last_active_date
    FROM user_streaks
    WHERE ${orderBy} > 0
    ORDER BY ${orderBy} DESC, total_checkins DESC
    LIMIT $1
  `, [limit]);

  return result.rows.map((row, index) => ({
    rank: index + 1,
    userId: row.user_id,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    totalCheckins: row.total_checkins,
    lastActiveDate: row.last_active_date
  }));
}

/**
 * Get user's rank on leaderboard
 */
async function getUserRank(userId, type = 'current') {
  const db = getPool();

  const orderBy = type === 'longest' ? 'longest_streak' : 'current_streak';

  const result = await db.query(`
    SELECT COUNT(*) + 1 as rank
    FROM user_streaks
    WHERE ${orderBy} > (
      SELECT COALESCE(${orderBy}, 0) FROM user_streaks WHERE user_id = $1
    )
  `, [userId]);

  return parseInt(result.rows[0]?.rank) || null;
}

/**
 * Get check-in history for user
 */
async function getCheckinHistory(userId, limit = 30) {
  const db = getPool();

  const result = await db.query(`
    SELECT
      checkin_date,
      streak_count,
      bonus_awarded,
      milestone_reached,
      created_at
    FROM streak_checkins
    WHERE user_id = $1
    ORDER BY checkin_date DESC
    LIMIT $2
  `, [userId, limit]);

  return result.rows.map(row => ({
    date: row.checkin_date,
    streakCount: row.streak_count,
    bonusAwarded: parseFloat(row.bonus_awarded) || 0,
    milestoneReached: row.milestone_reached,
    createdAt: row.created_at
  }));
}

/**
 * Get all milestones with user progress
 */
async function getMilestones(userId) {
  const db = getPool();

  const streak = await getStreak(userId);

  const result = await db.query(`
    SELECT * FROM streak_milestones
    WHERE active = true
    ORDER BY days_required ASC
  `);

  return result.rows.map(row => ({
    days: row.days_required,
    reward: parseFloat(row.bonus_amount),
    name: row.badge_name,
    icon: row.badge_icon,
    description: row.description,
    achieved: streak.current_streak >= row.days_required || streak.longest_streak >= row.days_required,
    current: streak.current_streak,
    progress: Math.min(100, (streak.current_streak / row.days_required) * 100)
  }));
}

/**
 * Reset user streak (admin function)
 */
async function resetStreak(userId) {
  const db = getPool();

  await db.query(`
    UPDATE user_streaks
    SET current_streak = 0, last_active_date = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
  `, [userId]);

  return { success: true, message: 'Streak reset' };
}

module.exports = {
  initializeSchema,
  getStreak,
  getStreakInfo,
  recordCheckin,
  getLeaderboard,
  getUserRank,
  getCheckinHistory,
  getMilestones,
  resetStreak
};
