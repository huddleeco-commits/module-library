/**
 * Achievements & Challenges Database Service
 * Handles all database operations for gamification features
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
      console.error('[achievements] Unexpected pool error:', err);
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
    console.log('[achievements] Schema initialized');
    return true;
  } catch (err) {
    console.error('[achievements] Schema init failed:', err.message);
    return false;
  }
}

// ============================================
// ACHIEVEMENT OPERATIONS
// ============================================

/**
 * Get all achievements with user's unlock status
 */
async function getAllAchievements(userId) {
  const db = getPool();

  const result = await db.query(`
    SELECT
      a.*,
      ua.unlocked_at,
      ua.reward_claimed,
      COALESCE(ap.current_value, 0) as progress_value
    FROM achievements a
    LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = $1
    LEFT JOIN achievement_progress ap ON ap.achievement_key = a.achievement_key AND ap.user_id = $1
    WHERE a.active = true
    ORDER BY a.sort_order ASC
  `, [userId]);

  return result.rows.map(row => ({
    id: row.id,
    key: row.achievement_key,
    name: row.name,
    description: row.description,
    icon: row.icon,
    points: row.points,
    category: row.category,
    requirementType: row.requirement_type,
    requirementValue: row.requirement_value,
    rewardAmount: parseFloat(row.reward_amount) || 0,
    unlocked: !!row.unlocked_at,
    unlockedAt: row.unlocked_at,
    rewardClaimed: row.reward_claimed || false,
    progress: row.progress_value,
    progressPercent: row.requirement_value
      ? Math.min(100, (row.progress_value / row.requirement_value) * 100)
      : 0
  }));
}

/**
 * Get user's unlocked achievements only
 */
async function getUserAchievements(userId) {
  const db = getPool();

  const result = await db.query(`
    SELECT
      a.*,
      ua.unlocked_at,
      ua.reward_claimed
    FROM user_achievements ua
    JOIN achievements a ON a.id = ua.achievement_id
    WHERE ua.user_id = $1
    ORDER BY ua.unlocked_at DESC
  `, [userId]);

  return result.rows.map(row => ({
    id: row.id,
    key: row.achievement_key,
    name: row.name,
    description: row.description,
    icon: row.icon,
    points: row.points,
    category: row.category,
    rewardAmount: parseFloat(row.reward_amount) || 0,
    unlockedAt: row.unlocked_at,
    rewardClaimed: row.reward_claimed
  }));
}

/**
 * Get achievement progress summary
 */
async function getAchievementProgress(userId) {
  const db = getPool();

  // Get all progress
  const progressResult = await db.query(`
    SELECT achievement_key, current_value, last_updated
    FROM achievement_progress
    WHERE user_id = $1
  `, [userId]);

  // Get summary stats
  const summaryResult = await db.query(`
    SELECT
      COUNT(ua.id) as unlocked_count,
      COALESCE(SUM(a.points), 0) as total_points,
      (SELECT COUNT(*) FROM achievements WHERE active = true) as total_achievements
    FROM user_achievements ua
    JOIN achievements a ON a.id = ua.achievement_id
    WHERE ua.user_id = $1
  `, [userId]);

  const summary = summaryResult.rows[0];
  const progressMap = {};

  progressResult.rows.forEach(row => {
    progressMap[row.achievement_key] = {
      value: row.current_value,
      lastUpdated: row.last_updated
    };
  });

  return {
    progress: progressMap,
    summary: {
      unlockedCount: parseInt(summary.unlocked_count) || 0,
      totalPoints: parseInt(summary.total_points) || 0,
      totalAchievements: parseInt(summary.total_achievements) || 0,
      completionPercent: summary.total_achievements > 0
        ? Math.round((summary.unlocked_count / summary.total_achievements) * 100)
        : 0
    }
  };
}

/**
 * Update progress for an achievement
 */
async function updateProgress(userId, achievementKey, incrementBy = 1) {
  const db = getPool();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Upsert progress
    const progressResult = await client.query(`
      INSERT INTO achievement_progress (user_id, achievement_key, current_value, last_updated)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, achievement_key)
      DO UPDATE SET
        current_value = achievement_progress.current_value + $3,
        last_updated = CURRENT_TIMESTAMP
      RETURNING current_value
    `, [userId, achievementKey, incrementBy]);

    const newValue = progressResult.rows[0].current_value;

    // Check if achievement should be unlocked
    const achievementResult = await client.query(`
      SELECT * FROM achievements
      WHERE achievement_key = $1 AND active = true
    `, [achievementKey]);

    let unlocked = null;

    if (achievementResult.rows.length > 0) {
      const achievement = achievementResult.rows[0];

      // Check if already unlocked
      const existingUnlock = await client.query(`
        SELECT id FROM user_achievements
        WHERE user_id = $1 AND achievement_id = $2
      `, [userId, achievement.id]);

      if (existingUnlock.rows.length === 0) {
        // Check if requirement met
        const requirementMet =
          (achievement.requirement_type === 'count' && newValue >= achievement.requirement_value) ||
          (achievement.requirement_type === 'threshold' && newValue >= achievement.requirement_value) ||
          (achievement.requirement_type === 'streak' && newValue >= achievement.requirement_value);

        if (requirementMet) {
          await client.query(`
            INSERT INTO user_achievements (user_id, achievement_id, progress_value)
            VALUES ($1, $2, $3)
          `, [userId, achievement.id, newValue]);

          unlocked = {
            id: achievement.id,
            key: achievement.achievement_key,
            name: achievement.name,
            icon: achievement.icon,
            points: achievement.points,
            rewardAmount: parseFloat(achievement.reward_amount) || 0
          };
        }
      }
    }

    await client.query('COMMIT');

    return {
      achievementKey,
      newValue,
      unlocked
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[achievements] Progress update failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Manually unlock an achievement
 */
async function unlockAchievement(userId, achievementKey) {
  const db = getPool();

  // Get achievement
  const achievementResult = await db.query(`
    SELECT * FROM achievements WHERE achievement_key = $1 AND active = true
  `, [achievementKey]);

  if (achievementResult.rows.length === 0) {
    return { success: false, error: 'Achievement not found' };
  }

  const achievement = achievementResult.rows[0];

  // Try to unlock
  try {
    await db.query(`
      INSERT INTO user_achievements (user_id, achievement_id, progress_value)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, achievement_id) DO NOTHING
    `, [userId, achievement.id, achievement.requirement_value || 0]);

    return {
      success: true,
      achievement: {
        id: achievement.id,
        key: achievement.achievement_key,
        name: achievement.name,
        icon: achievement.icon,
        points: achievement.points,
        rewardAmount: parseFloat(achievement.reward_amount) || 0
      }
    };
  } catch (err) {
    console.error('[achievements] Unlock failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Update user's showcase badges
 */
async function updateShowcase(userId, badgeIds) {
  const db = getPool();

  await db.query(`
    INSERT INTO user_showcase (user_id, badge_ids, updated_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id)
    DO UPDATE SET badge_ids = $2, updated_at = CURRENT_TIMESTAMP
  `, [userId, badgeIds]);

  return { success: true, badgeIds };
}

/**
 * Get user's showcase badges
 */
async function getShowcase(userId) {
  const db = getPool();

  const result = await db.query(`
    SELECT badge_ids FROM user_showcase WHERE user_id = $1
  `, [userId]);

  return result.rows[0]?.badge_ids || [];
}

// ============================================
// CHALLENGE OPERATIONS
// ============================================

/**
 * Get challenges by status
 */
async function getChallenges(status = 'active', limit = 20) {
  const db = getPool();

  let query = `
    SELECT
      c.*,
      COUNT(cp.id) as participant_count
    FROM challenges c
    LEFT JOIN challenge_participants cp ON cp.challenge_id = c.id
  `;

  const params = [];

  if (status !== 'all') {
    query += ` WHERE c.status = $1`;
    params.push(status);
  }

  query += `
    GROUP BY c.id
    ORDER BY c.start_date DESC
    LIMIT $${params.length + 1}
  `;
  params.push(limit);

  const result = await db.query(query, params);

  return result.rows.map(row => ({
    id: row.id,
    creatorId: row.creator_id,
    title: row.title,
    description: row.description,
    challengeType: row.challenge_type,
    metric: row.metric,
    targetValue: parseFloat(row.target_value) || null,
    entryFee: parseFloat(row.entry_fee) || 0,
    prizePool: parseFloat(row.prize_pool) || 0,
    maxParticipants: row.max_participants,
    participantCount: parseInt(row.participant_count) || 0,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    winnerId: row.winner_id,
    settings: row.settings || {},
    createdAt: row.created_at
  }));
}

/**
 * Get a single challenge by ID
 */
async function getChallenge(challengeId) {
  const db = getPool();

  const result = await db.query(`
    SELECT
      c.*,
      COUNT(cp.id) as participant_count
    FROM challenges c
    LEFT JOIN challenge_participants cp ON cp.challenge_id = c.id
    WHERE c.id = $1
    GROUP BY c.id
  `, [challengeId]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    creatorId: row.creator_id,
    title: row.title,
    description: row.description,
    challengeType: row.challenge_type,
    metric: row.metric,
    targetValue: parseFloat(row.target_value) || null,
    entryFee: parseFloat(row.entry_fee) || 0,
    prizePool: parseFloat(row.prize_pool) || 0,
    maxParticipants: row.max_participants,
    participantCount: parseInt(row.participant_count) || 0,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    winnerId: row.winner_id,
    settings: row.settings || {},
    createdAt: row.created_at
  };
}

/**
 * Create a new challenge
 */
async function createChallenge(creatorId, challengeData) {
  const db = getPool();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const {
      title,
      description,
      challengeType,
      metric,
      targetValue,
      entryFee = 0,
      prizePool = 0,
      maxParticipants,
      startDate,
      endDate,
      settings = {}
    } = challengeData;

    const result = await client.query(`
      INSERT INTO challenges (
        creator_id, title, description, challenge_type, metric, target_value,
        entry_fee, prize_pool, max_participants, start_date, end_date, settings, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
      RETURNING *
    `, [
      creatorId, title, description, challengeType, metric, targetValue,
      entryFee, prizePool, maxParticipants, startDate, endDate, JSON.stringify(settings)
    ]);

    const challenge = result.rows[0];

    // Log activity
    await client.query(`
      INSERT INTO challenge_activity (challenge_id, user_id, activity_type, details)
      VALUES ($1, $2, 'created', $3)
    `, [challenge.id, creatorId, JSON.stringify({ title })]);

    await client.query('COMMIT');

    return {
      success: true,
      challengeId: challenge.id,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        status: challenge.status,
        startDate: challenge.start_date,
        endDate: challenge.end_date
      }
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[achievements] Challenge creation failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Join a challenge
 */
async function joinChallenge(challengeId, userId, startingValue = null) {
  const db = getPool();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Get challenge
    const challengeResult = await client.query(`
      SELECT * FROM challenges WHERE id = $1 FOR UPDATE
    `, [challengeId]);

    if (challengeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Challenge not found' };
    }

    const challenge = challengeResult.rows[0];

    // Check if can join
    if (challenge.status !== 'pending' && challenge.status !== 'active') {
      await client.query('ROLLBACK');
      return { success: false, error: 'Challenge is not accepting participants' };
    }

    // Check max participants
    if (challenge.max_participants) {
      const countResult = await client.query(`
        SELECT COUNT(*) as count FROM challenge_participants WHERE challenge_id = $1
      `, [challengeId]);

      if (parseInt(countResult.rows[0].count) >= challenge.max_participants) {
        await client.query('ROLLBACK');
        return { success: false, error: 'Challenge is full' };
      }
    }

    // Add participant
    await client.query(`
      INSERT INTO challenge_participants (challenge_id, user_id, starting_value)
      VALUES ($1, $2, $3)
      ON CONFLICT (challenge_id, user_id) DO NOTHING
    `, [challengeId, userId, startingValue]);

    // Log activity
    await client.query(`
      INSERT INTO challenge_activity (challenge_id, user_id, activity_type, details)
      VALUES ($1, $2, 'joined', '{}')
    `, [challengeId, userId]);

    // Update prize pool if entry fee
    if (parseFloat(challenge.entry_fee) > 0) {
      await client.query(`
        UPDATE challenges
        SET prize_pool = prize_pool + $2
        WHERE id = $1
      `, [challengeId, challenge.entry_fee]);
    }

    await client.query('COMMIT');

    return { success: true, challengeId };
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') { // Unique violation
      return { success: false, error: 'Already joined this challenge' };
    }
    console.error('[achievements] Join challenge failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get challenge leaderboard
 */
async function getChallengeLeaderboard(challengeId, limit = 50) {
  const db = getPool();

  const result = await db.query(`
    SELECT
      cp.*,
      ROW_NUMBER() OVER (ORDER BY cp.current_score DESC) as rank
    FROM challenge_participants cp
    WHERE cp.challenge_id = $1 AND cp.status = 'active'
    ORDER BY cp.current_score DESC
    LIMIT $2
  `, [challengeId, limit]);

  return result.rows.map(row => ({
    userId: row.user_id,
    rank: parseInt(row.rank),
    currentScore: parseFloat(row.current_score) || 0,
    startingValue: parseFloat(row.starting_value) || null,
    joinedAt: row.joined_at
  }));
}

/**
 * Update participant score
 */
async function updateParticipantScore(challengeId, userId, newScore) {
  const db = getPool();

  await db.query(`
    UPDATE challenge_participants
    SET current_score = $3
    WHERE challenge_id = $1 AND user_id = $2
  `, [challengeId, userId, newScore]);

  return { success: true };
}

/**
 * Get user's challenges
 */
async function getUserChallenges(userId, status = null) {
  const db = getPool();

  let query = `
    SELECT
      c.*,
      cp.current_score,
      cp.joined_at,
      cp.status as participant_status,
      (SELECT COUNT(*) FROM challenge_participants WHERE challenge_id = c.id) as participant_count
    FROM challenge_participants cp
    JOIN challenges c ON c.id = cp.challenge_id
    WHERE cp.user_id = $1
  `;

  const params = [userId];

  if (status) {
    query += ` AND c.status = $2`;
    params.push(status);
  }

  query += ` ORDER BY c.start_date DESC`;

  const result = await db.query(query, params);

  return result.rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    challengeType: row.challenge_type,
    entryFee: parseFloat(row.entry_fee) || 0,
    prizePool: parseFloat(row.prize_pool) || 0,
    participantCount: parseInt(row.participant_count) || 0,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    myScore: parseFloat(row.current_score) || 0,
    joinedAt: row.joined_at,
    participantStatus: row.participant_status
  }));
}

/**
 * Complete a challenge and determine winner
 */
async function completeChallenge(challengeId) {
  const db = getPool();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Get top participant
    const winnerResult = await client.query(`
      SELECT user_id, current_score
      FROM challenge_participants
      WHERE challenge_id = $1 AND status = 'active'
      ORDER BY current_score DESC
      LIMIT 1
    `, [challengeId]);

    const winner = winnerResult.rows[0];

    // Update challenge
    await client.query(`
      UPDATE challenges
      SET status = 'completed', winner_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [challengeId, winner?.user_id || null]);

    // Update all participant rankings
    await client.query(`
      UPDATE challenge_participants cp
      SET
        rank = subq.rank,
        final_score = cp.current_score,
        status = 'completed'
      FROM (
        SELECT user_id, ROW_NUMBER() OVER (ORDER BY current_score DESC) as rank
        FROM challenge_participants
        WHERE challenge_id = $1
      ) subq
      WHERE cp.challenge_id = $1 AND cp.user_id = subq.user_id
    `, [challengeId]);

    // Log completion
    await client.query(`
      INSERT INTO challenge_activity (challenge_id, user_id, activity_type, details)
      VALUES ($1, $2, 'completed', $3)
    `, [challengeId, winner?.user_id, JSON.stringify({ winnerId: winner?.user_id })]);

    await client.query('COMMIT');

    return {
      success: true,
      winnerId: winner?.user_id || null,
      winnerScore: winner ? parseFloat(winner.current_score) : null
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[achievements] Challenge completion failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  initializeSchema,
  // Achievements
  getAllAchievements,
  getUserAchievements,
  getAchievementProgress,
  updateProgress,
  unlockAchievement,
  updateShowcase,
  getShowcase,
  // Challenges
  getChallenges,
  getChallenge,
  createChallenge,
  joinChallenge,
  getChallengeLeaderboard,
  updateParticipantScore,
  getUserChallenges,
  completeChallenge
};
