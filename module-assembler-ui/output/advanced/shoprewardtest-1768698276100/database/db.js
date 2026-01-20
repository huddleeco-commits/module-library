const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Initialize database
const dbPath = path.join(__dirname, 'loyalty.db');
const db = new Database(dbPath);

// Initialize schema if database is new
if (!fs.existsSync(dbPath) || db.prepare('SELECT name FROM sqlite_master WHERE type="table"').all().length === 0) {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    db.exec(schema);
}

// Tier configuration
const TIERS = {
    Bronze: { threshold: 0, multiplier: 1.0 },
    Silver: { threshold: 500, multiplier: 1.25 },
    Gold: { threshold: 2000, multiplier: 1.5 },
    Platinum: { threshold: 5000, multiplier: 2.0 }
};

// Helper function to generate member ID
function generateMemberId() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Helper function to generate referral code
function generateReferralCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Calculate tier based on lifetime points
function calculateTier(lifetimePoints) {
    if (lifetimePoints >= 5000) return 'Platinum';
    if (lifetimePoints >= 2000) return 'Gold';
    if (lifetimePoints >= 500) return 'Silver';
    return 'Bronze';
}

// Get user by ID
function getUser(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
}

// Get user by email
function getUserByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
}

// Get user by member ID
function getUserByMemberId(memberId) {
    const stmt = db.prepare('SELECT * FROM users WHERE member_id = ?');
    return stmt.get(memberId);
}

// Create new user
function createUser(userData) {
    const { email, phone, passwordHash, name, referredBy } = userData;
    
    let memberId;
    do {
        memberId = generateMemberId();
    } while (getUserByMemberId(memberId));
    
    let referralCode;
    do {
        referralCode = generateReferralCode();
    } while (db.prepare('SELECT id FROM users WHERE referral_code = ?').get(referralCode));
    
    const stmt = db.prepare(`
        INSERT INTO users (member_id, email, phone, password_hash, name, referral_code, referred_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(memberId, email, phone, passwordHash, name, referralCode, referredBy);
    
    // Add referral bonus if applicable
    if (referredBy) {
        const referrer = db.prepare('SELECT id FROM users WHERE referral_code = ?').get(referredBy);
        if (referrer) {
            addTransaction(referrer.id, 'referral', 100, 'Referral bonus');
            updateBalance(referrer.id, 100);
        }
    }
    
    return getUser(result.lastInsertRowid);
}

// Update user balance
function updateBalance(userId, pointsChange) {
    const user = getUser(userId);
    if (!user) throw new Error('User not found');
    
    const newBalance = user.points + pointsChange;
    const newLifetimePoints = pointsChange > 0 ? user.lifetime_points + pointsChange : user.lifetime_points;
    const newTier = calculateTier(newLifetimePoints);
    
    const stmt = db.prepare(`
        UPDATE users 
        SET points = ?, lifetime_points = ?, tier = ?
        WHERE id = ?
    `);
    
    stmt.run(newBalance, newLifetimePoints, newTier, userId);
    return getUser(userId);
}

// Add transaction
function addTransaction(userId, type, amount, description, adminId = null) {
    const stmt = db.prepare(`
        INSERT INTO transactions (user_id, type, amount, description, admin_id)
        VALUES (?, ?, ?, ?, ?)
    `);
    
    return stmt.run(userId, type, amount, description, adminId);
}

// Get all active rewards
function getRewards() {
    const stmt = db.prepare('SELECT * FROM rewards WHERE active = 1 ORDER BY points_cost ASC');
    return stmt.all();
}

// Redeem reward
function redeemReward(userId, rewardId) {
    const user = getUser(userId);
    const reward = db.prepare('SELECT * FROM rewards WHERE id = ? AND active = 1').get(rewardId);
    
    if (!user) throw new Error('User not found');
    if (!reward) throw new Error('Reward not found or inactive');
    if (user.points < reward.points_cost) throw new Error('Insufficient points');
    
    const transaction = db.transaction(() => {
        // Deduct points
        updateBalance(userId, -reward.points_cost);
        
        // Add transaction record
        addTransaction(userId, 'spend', reward.points_cost, `Redeemed: ${reward.name}`);
        
        // Create redemption record
        const stmt = db.prepare(`
            INSERT INTO redemptions (user_id, reward_id, points_spent)
            VALUES (?, ?, ?)
        `);
        
        return stmt.run(userId, rewardId, reward.points_cost);
    });
    
    return transaction();
}

// Get system statistics
function getStats() {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 0').get().count;
    const totalPoints = db.prepare('SELECT SUM(points) as total FROM users WHERE is_admin = 0').get().total || 0;
    const totalRedemptions = db.prepare('SELECT COUNT(*) as count FROM redemptions').get().count;
    const tierDistribution = db.prepare(`
        SELECT tier, COUNT(*) as count 
        FROM users 
        WHERE is_admin = 0 
        GROUP BY tier
    `).all();
    
    return {
        totalUsers,
        totalPoints,
        totalRedemptions,
        tierDistribution
    };
}

// Search customers
function searchCustomers(query, limit = 50) {
    const stmt = db.prepare(`
        SELECT id, member_id, email, name, points, lifetime_points, tier, created_at
        FROM users 
        WHERE is_admin = 0 
        AND (name LIKE ? OR email LIKE ? OR member_id LIKE ?)
        ORDER BY created_at DESC
        LIMIT ?
    `);
    
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm, limit);
}

// Get user transactions
function getUserTransactions(userId, limit = 100) {
    const stmt = db.prepare(`
        SELECT * FROM transactions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    `);
    
    return stmt.all(userId, limit);
}

// Get user redemptions
function getUserRedemptions(userId) {
    const stmt = db.prepare(`
        SELECT r.*, rw.name as reward_name, rw.description as reward_description
        FROM redemptions r
        JOIN rewards rw ON r.reward_id = rw.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
    `);
    
    return stmt.all(userId);
}

module.exports = {
    db,
    TIERS,
    getUser,
    getUserByEmail,
    getUserByMemberId,
    createUser,
    updateBalance,
    addTransaction,
    calculateTier,
    getRewards,
    redeemReward,
    getStats,
    searchCustomers,
    getUserTransactions,
    getUserRedemptions
};