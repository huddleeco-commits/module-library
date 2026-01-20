const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Initialize database
const dbPath = path.join(__dirname, 'loyalty.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database with schema if it doesn't exist
function initializeDatabase() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema);
    }
}

// Check if database is empty and initialize if needed
const tableCount = db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get();
if (tableCount.count === 0) {
    initializeDatabase();
}

// Tier configuration
const TIERS = {
    Bronze: { threshold: 0, multiplier: 1 },
    Silver: { threshold: 500, multiplier: 1.25 },
    Gold: { threshold: 2000, multiplier: 1.5 },
    Platinum: { threshold: 5000, multiplier: 2 }
};

// Prepared statements
const statements = {
    getUser: db.prepare('SELECT * FROM users WHERE id = ?'),
    getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
    getUserByMemberId: db.prepare('SELECT * FROM users WHERE member_id = ?'),
    insertUser: db.prepare(`
        INSERT INTO users (member_id, email, phone, password_hash, name, referral_code, referred_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `),
    updateUserBalance: db.prepare('UPDATE users SET points = ?, lifetime_points = ?, tier = ? WHERE id = ?'),
    insertTransaction: db.prepare(`
        INSERT INTO transactions (user_id, type, amount, description, admin_id)
        VALUES (?, ?, ?, ?, ?)
    `),
    getActiveRewards: db.prepare('SELECT * FROM rewards WHERE active = 1 ORDER BY points_cost ASC'),
    getReward: db.prepare('SELECT * FROM rewards WHERE id = ? AND active = 1'),
    insertRedemption: db.prepare(`
        INSERT INTO redemptions (user_id, reward_id, points_spent)
        VALUES (?, ?, ?)
    `),
    searchUsers: db.prepare(`
        SELECT id, member_id, email, name, points, lifetime_points, tier, created_at
        FROM users 
        WHERE (name LIKE ? OR email LIKE ? OR member_id LIKE ?) AND is_admin = 0
        ORDER BY created_at DESC
        LIMIT ?
    `),
    getTotalUsers: db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 0'),
    getTotalPoints: db.prepare('SELECT SUM(points) as total FROM users WHERE is_admin = 0'),
    getTotalRedemptions: db.prepare('SELECT COUNT(*) as count FROM redemptions'),
    getUserTransactions: db.prepare(`
        SELECT * FROM transactions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    `)
};

// Generate unique member ID
function generateMemberId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Generate unique referral code
function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Calculate tier based on lifetime points
function calculateTier(lifetimePoints) {
    if (lifetimePoints >= TIERS.Platinum.threshold) return 'Platinum';
    if (lifetimePoints >= TIERS.Gold.threshold) return 'Gold';
    if (lifetimePoints >= TIERS.Silver.threshold) return 'Silver';
    return 'Bronze';
}

// Database functions
const db_functions = {
    // Get user by ID
    getUser(id) {
        return statements.getUser.get(id);
    },

    // Get user by email
    getUserByEmail(email) {
        return statements.getUserByEmail.get(email);
    },

    // Get user by member ID
    getUserByMemberId(memberId) {
        return statements.getUserByMemberId.get(memberId);
    },

    // Create new user
    createUser(userData) {
        const { email, phone, password_hash, name, referred_by } = userData;
        
        // Generate unique member ID
        let memberId;
        do {
            memberId = generateMemberId();
        } while (this.getUserByMemberId(memberId));

        // Generate unique referral code
        let referralCode;
        do {
            referralCode = generateReferralCode();
        } while (statements.getUserByEmail.get(`ref_${referralCode}`));

        const result = statements.insertUser.run(
            memberId, email, phone, password_hash, name, referralCode, referred_by
        );

        return this.getUser(result.lastInsertRowid);
    },

    // Update user balance and tier
    updateBalance(userId, pointsChange, transactionType, description, adminId = null) {
        const user = this.getUser(userId);
        if (!user) throw new Error('User not found');

        const newPoints = Math.max(0, user.points + pointsChange);
        const newLifetimePoints = transactionType === 'earn' || transactionType === 'bonus' || transactionType === 'referral'
            ? user.lifetime_points + Math.abs(pointsChange)
            : user.lifetime_points;
        
        const newTier = calculateTier(newLifetimePoints);

        // Use transaction to ensure data consistency
        const updateUser = db.transaction(() => {
            statements.updateUserBalance.run(newPoints, newLifetimePoints, newTier, userId);
            statements.insertTransaction.run(userId, transactionType, pointsChange, description, adminId);
        });

        updateUser();
        return this.getUser(userId);
    },

    // Add transaction record
    addTransaction(userId, type, amount, description, adminId = null) {
        return statements.insertTransaction.run(userId, type, amount, description, adminId);
    },

    // Get tier information
    calculateTier(lifetimePoints) {
        const tierName = calculateTier(lifetimePoints);
        return {
            name: tierName,
            ...TIERS[tierName]
        };
    },

    // Get all active rewards
    getRewards() {
        return statements.getActiveRewards.all();
    },

    // Redeem reward
    redeemReward(userId, rewardId) {
        const user = this.getUser(userId);
        const reward = statements.getReward.get(rewardId);

        if (!user) throw new Error('User not found');
        if (!reward) throw new Error('Reward not found or inactive');
        if (user.points < reward.points_cost) throw new Error('Insufficient points');

        // Use transaction to ensure data consistency
        const redemption = db.transaction(() => {
            // Deduct points
            this.updateBalance(userId, -reward.points_cost, 'spend', `Redeemed: ${reward.name}`);
            
            // Record redemption
            const result = statements.insertRedemption.run(userId, rewardId, reward.points_cost);
            return result.lastInsertRowid;
        });

        return redemption();
    },

    // Get system statistics
    getStats() {
        const totalUsers = statements.getTotalUsers.get().count;
        const totalPointsInCirculation = statements.getTotalPoints.get().total || 0;
        const totalRedemptions = statements.getTotalRedemptions.get().count;

        return {
            totalUsers,
            totalPointsInCirculation,
            totalRedemptions
        };
    },

    // Search customers
    searchCustomers(searchTerm = '', limit = 50) {
        const searchPattern = `%${searchTerm}%`;
        return statements.searchUsers.all(searchPattern, searchPattern, searchPattern, limit);
    },

    // Get user transaction history
    getUserTransactions(userId, limit = 20) {
        return statements.getUserTransactions.all(userId, limit);
    },

    // Get tier multipliers
    getTierMultipliers() {
        return TIERS;
    },

    // Close database connection
    close() {
        db.close();
    }
};

module.exports = db_functions;