const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Tier configuration
const TIERS = [
  { name: 'Bronze', minPoints: 0, multiplier: 1, color: '#CD7F32' },
  { name: 'Silver', minPoints: 500, multiplier: 1.25, color: '#C0C0C0' },
  { name: 'Gold', minPoints: 2000, multiplier: 1.5, color: '#FFD700' },
  { name: 'Platinum', minPoints: 5000, multiplier: 2, color: '#E5E4E2' }
];

// Initialize database
const db = new Database('loyalty_program.db');
db.pragma('journal_mode = WAL');

// Initialize schema
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}

// Helper function to calculate tier based on lifetime points
function calculateTier(lifetimePoints) {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (lifetimePoints >= t.minPoints) {
      tier = t;
    } else {
      break;
    }
  }
  return tier;
}

// Prepared statements
const statements = {
  getUser: db.prepare('SELECT * FROM users WHERE id = ?'),
  getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  createUser: db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'),
  updateUserPoints: db.prepare('UPDATE users SET points = ?, lifetime_points = ?, tier = ? WHERE id = ?'),
  createTransaction: db.prepare('INSERT INTO transactions (user_id, type, points, description) VALUES (?, ?, ?, ?)'),
  getUserTransactions: db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC'),
  getActiveRewards: db.prepare('SELECT * FROM rewards WHERE active = 1 ORDER BY cost ASC'),
  getReward: db.prepare('SELECT * FROM rewards WHERE id = ?'),
  createRedemption: db.prepare('INSERT INTO redemptions (user_id, reward_id, points_spent) VALUES (?, ?, ?)'),
  getUserRedemptions: db.prepare('SELECT r.*, rw.name as reward_name FROM redemptions r JOIN rewards rw ON r.reward_id = rw.id WHERE r.user_id = ? ORDER BY r.created_at DESC'),
  getAllUsers: db.prepare('SELECT id, email, name, points, lifetime_points, tier, created_at FROM users WHERE is_admin = 0 ORDER BY lifetime_points DESC')
};

// Helper functions
const helpers = {
  // Get user by ID
  getUser: (id) => {
    return statements.getUser.get(id);
  },

  // Get user by email
  getUserByEmail: (email) => {
    return statements.getUserByEmail.get(email);
  },

  // Create new user
  createUser: (email, passwordHash, name) => {
    const result = statements.createUser.run(email, passwordHash, name);
    return result.lastInsertRowid;
  },

  // Add points to user
  addPoints: (userId, points, description = 'Points earned') => {
    const user = statements.getUser.get(userId);
    if (!user) throw new Error('User not found');

    const newPoints = user.points + points;
    const newLifetimePoints = user.lifetime_points + points;
    const tier = calculateTier(newLifetimePoints);

    const transaction = db.transaction(() => {
      statements.updateUserPoints.run(newPoints, newLifetimePoints, tier.name, userId);
      statements.createTransaction.run(userId, 'earn', points, description);
    });

    transaction();
    return { points: newPoints, tier: tier.name };
  },

  // Spend points
  spendPoints: (userId, points, description = 'Points redeemed') => {
    const user = statements.getUser.get(userId);
    if (!user) throw new Error('User not found');
    if (user.points < points) throw new Error('Insufficient points');

    const newPoints = user.points - points;
    const tier = calculateTier(user.lifetime_points);

    const transaction = db.transaction(() => {
      statements.updateUserPoints.run(newPoints, user.lifetime_points, tier.name, userId);
      statements.createTransaction.run(userId, 'spend', points, description);
    });

    transaction();
    return { points: newPoints, tier: tier.name };
  },

  // Get user transactions
  getUserTransactions: (userId) => {
    return statements.getUserTransactions.all(userId);
  },

  // Get active rewards
  getActiveRewards: () => {
    return statements.getActiveRewards.all();
  },

  // Redeem reward
  redeemReward: (userId, rewardId) => {
    const user = statements.getUser.get(userId);
    const reward = statements.getReward.get(rewardId);
    
    if (!user) throw new Error('User not found');
    if (!reward) throw new Error('Reward not found');
    if (!reward.active) throw new Error('Reward is not active');
    if (user.points < reward.cost) throw new Error('Insufficient points');

    const transaction = db.transaction(() => {
      helpers.spendPoints(userId, reward.cost, `Redeemed: ${reward.name}`);
      statements.createRedemption.run(userId, rewardId, reward.cost);
    });

    transaction();
    return reward;
  },

  // Get user redemptions
  getUserRedemptions: (userId) => {
    return statements.getUserRedemptions.all(userId);
  },

  // Get all users (for admin)
  getAllUsers: () => {
    return statements.getAllUsers.all();
  },

  // Get tier info
  getTierInfo: (lifetimePoints) => {
    return calculateTier(lifetimePoints);
  },

  // Get all tier configurations
  getAllTiers: () => {
    return TIERS;
  },

  // Calculate points with tier multiplier
  calculatePointsWithMultiplier: (basePoints, lifetimePoints) => {
    const tier = calculateTier(lifetimePoints);
    return Math.floor(basePoints * tier.multiplier);
  }
};

module.exports = {
  db,
  ...helpers
};