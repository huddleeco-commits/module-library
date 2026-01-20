const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDB() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database initialized');
    return true;
  } catch (err) {
    console.error('DB init error:', err.message);
    return false;
  }
}

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

// User functions
async function getUser(id) {
  const res = await query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0];
}

async function getUserByEmail(email) {
  const res = await query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0];
}

async function createUser(data) {
  const res = await query(
    'INSERT INTO users (email, password_hash, name, points, tier) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [data.email, data.passwordHash, data.name, 0, 'Bronze']
  );
  return res.rows[0];
}

async function updateUserPoints(userId, points) {
  const res = await query(
    'UPDATE users SET points = points + $2 WHERE id = $1 RETURNING *',
    [userId, points]
  );
  return res.rows[0];
}

// Points functions
async function addPoints(userId, amount, reason) {
  // Add transaction
  await query(
    'INSERT INTO transactions (user_id, amount, type, reason) VALUES ($1, $2, $3, $4)',
    [userId, amount, 'earn', reason]
  );
  // Update user balance
  const user = await updateUserPoints(userId, amount);
  // Check tier upgrade
  await updateTier(userId, user.points);
  return user;
}

async function spendPoints(userId, amount, reason) {
  // Check balance
  const user = await getUser(userId);
  if (user.points < amount) throw new Error('Insufficient points');
  // Add transaction
  await query(
    'INSERT INTO transactions (user_id, amount, type, reason) VALUES ($1, $2, $3, $4)',
    [userId, -amount, 'spend', reason]
  );
  return await updateUserPoints(userId, -amount);
}

async function getPointsHistory(userId, limit = 50) {
  const res = await query(
    'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [userId, limit]
  );
  return res.rows;
}

// Tier functions
async function updateTier(userId, points) {
  let tier = 'Bronze';
  if (points >= 5000) tier = 'Gold';
  else if (points >= 1000) tier = 'Silver';
  await query('UPDATE users SET tier = $2 WHERE id = $1', [userId, tier]);
}

// Rewards functions
async function getRewards() {
  const res = await query('SELECT * FROM rewards WHERE active = true ORDER BY cost');
  return res.rows;
}

async function redeemReward(userId, rewardId) {
  const reward = await query('SELECT * FROM rewards WHERE id = $1', [rewardId]);
  if (!reward.rows[0]) throw new Error('Reward not found');

  const cost = reward.rows[0].cost;
  await spendPoints(userId, cost, `Redeemed: ${reward.rows[0].name}`);

  await query(
    'INSERT INTO redemptions (user_id, reward_id, cost) VALUES ($1, $2, $3)',
    [userId, rewardId, cost]
  );

  return reward.rows[0];
}

// Stats functions (admin)
async function getStats() {
  const users = await query('SELECT COUNT(*) as count, SUM(points) as total_points FROM users');
  const transactions = await query('SELECT COUNT(*) as count FROM transactions WHERE created_at > NOW() - INTERVAL \'30 days\'');
  const redemptions = await query('SELECT COUNT(*) as count FROM redemptions WHERE created_at > NOW() - INTERVAL \'30 days\'');
  return {
    totalUsers: parseInt(users.rows[0].count),
    totalPoints: parseInt(users.rows[0].total_points) || 0,
    transactionsThisMonth: parseInt(transactions.rows[0].count),
    redemptionsThisMonth: parseInt(redemptions.rows[0].count)
  };
}

async function getAllUsers(limit = 50, offset = 0) {
  const res = await query('SELECT id, email, name, points, tier, created_at FROM users ORDER BY points DESC LIMIT $1 OFFSET $2', [limit, offset]);
  return res.rows;
}

module.exports = { pool, query, initDB, getUser, getUserByEmail, createUser, addPoints, spendPoints, getPointsHistory, getRewards, redeemReward, getStats, getAllUsers };
