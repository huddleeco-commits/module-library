const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class LoyaltyDatabase {
    constructor(dbPath = './loyalty.db') {
        this.db = new Database(dbPath);
        this.init();
    }

    init() {
        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        this.db.exec(schema);
        
        // Prepare statements for better performance
        this.statements = {
            createUser: this.db.prepare(`
                INSERT INTO users (email, name, points) 
                VALUES (?, ?, ?)
            `),
            getUserById: this.db.prepare('SELECT * FROM users WHERE id = ?'),
            getUserByEmail: this.db.prepare('SELECT * FROM users WHERE email = ?'),
            updateUserPoints: this.db.prepare(`
                UPDATE users SET points = points + ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `),
            addTransaction: this.db.prepare(`
                INSERT INTO transactions (user_id, points, transaction_type, description) 
                VALUES (?, ?, ?, ?)
            `),
            getAvailableRewards: this.db.prepare(`
                SELECT * FROM rewards 
                WHERE is_active = 1 AND points_required <= ? 
                ORDER BY points_required ASC
            `),
            getAllRewards: this.db.prepare('SELECT * FROM rewards WHERE is_active = 1 ORDER BY points_required ASC'),
            getRewardById: this.db.prepare('SELECT * FROM rewards WHERE id = ?'),
            redeemReward: this.db.prepare(`
                INSERT INTO redemptions (user_id, reward_id, points_spent, expires_at) 
                VALUES (?, ?, ?, datetime('now', '+30 days'))
            `),
            getUserTransactions: this.db.prepare(`
                SELECT * FROM transactions WHERE user_id = ? 
                ORDER BY created_at DESC LIMIT ?
            `),
            getUserRedemptions: this.db.prepare(`
                SELECT r.*, rw.name as reward_name, rw.value as reward_value
                FROM redemptions r
                JOIN rewards rw ON r.reward_id = rw.id
                WHERE r.user_id = ? AND r.status = 'pending'
                ORDER BY r.redeemed_at DESC
            `),
            markRedemptionUsed: this.db.prepare(`
                UPDATE redemptions SET status = 'used', used_at = CURRENT_TIMESTAMP 
                WHERE id = ? AND user_id = ?
            `),
            getUsersByTier: this.db.prepare('SELECT * FROM users WHERE tier = ? ORDER BY points DESC')
        };
    }

    // User operations
    createUser(email, name, initialPoints = 0) {
        try {
            const result = this.statements.createUser.run(email, name, initialPoints);
            return this.getUserById(result.lastInsertRowid);
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                throw new Error('User with this email already exists');
            }
            throw error;
        }
    }

    getUserById(id) {
        return this.statements.getUserById.get(id);
    }

    getUserByEmail(email) {
        return this.statements.getUserByEmail.get(email);
    }

    // Points operations
    addPoints(userId, points, description = 'Points earned') {
        const transaction = this.db.transaction(() => {
            this.statements.updateUserPoints.run(points, userId);
            this.statements.addTransaction.run(userId, points, 'earned', description);
            return this.getUserById(userId);
        });
        return transaction();
    }

    deductPoints(userId, points, description = 'Points spent') {
        const user = this.getUserById(userId);
        if (!user || user.points < points) {
            throw new Error('Insufficient points');
        }

        const transaction = this.db.transaction(() => {
            this.statements.updateUserPoints.run(-points, userId);
            this.statements.addTransaction.run(userId, -points, 'spent', description);
            return this.getUserById(userId);
        });
        return transaction();
    }

    // Tier operations
    getTierRequirements() {
        return {
            Bronze: 0,
            Silver: 500,
            Gold: 2000,
            Platinum: 5000
        };
    }

    getUsersByTier(tier) {
        return this.statements.getUsersByTier.all(tier);
    }

    getPointsToNextTier(currentPoints) {
        const tiers = this.getTierRequirements();
        if (currentPoints >= tiers.Platinum) return 0;
        if (currentPoints >= tiers.Gold) return tiers.Platinum - currentPoints;
        if (currentPoints >= tiers.Silver) return tiers.Gold - currentPoints;
        return tiers.Silver - currentPoints;
    }

    // Reward operations
    getAllRewards() {
        return this.statements.getAllRewards.all();
    }

    getAvailableRewards(userPoints) {
        return this.statements.getAvailableRewards.all(userPoints);
    }

    redeemReward(userId, rewardId) {
        const user = this.getUserById(userId);
        const reward = this.statements.getRewardById.get(rewardId);

        if (!user) throw new Error('User not found');
        if (!reward) throw new Error('Reward not found');
        if (user.points < reward.points_required) throw new Error('Insufficient points');
        if (!reward.is_active) throw new Error('Reward not available');

        const transaction = this.db.transaction(() => {
            // Deduct points
            this.statements.updateUserPoints.run(-reward.points_required, userId);
            this.statements.addTransaction.run(userId, -reward.points_required, 'spent', `Redeemed: ${reward.name}`);
            
            // Create redemption record
            const redemption = this.statements.redeemReward.run(userId, rewardId, reward.points_required);
            
            return {
                user: this.getUserById(userId),
                redemption: redemption,
                reward: reward
            };
        });

        return transaction();
    }

    // Transaction and redemption history
    getUserTransactions(userId, limit = 50) {
        return this.statements.getUserTransactions.all(userId, limit);
    }

    getUserRedemptions(userId) {
        return this.statements.getUserRedemptions.all(userId);
    }

    markRedemptionUsed(redemptionId, userId) {
        const result = this.statements.markRedemptionUsed.run(redemptionId, userId);
        return result.changes > 0;
    }

    // Analytics
    getUserStats(userId) {
        const user = this.getUserById(userId);
        if (!user) return null;

        const transactions = this.getUserTransactions(userId);
        const redemptions = this.getUserRedemptions(userId);
        const totalEarned = transactions
            .filter(t => t.transaction_type === 'earned')
            .reduce((sum, t) => sum + t.points, 0);
        const totalSpent = transactions
            .filter(t => t.transaction_type === 'spent')
            .reduce((sum, t) => sum + Math.abs(t.points), 0);

        return {
            user,
            totalEarned,
            totalSpent,
            pointsToNextTier: this.getPointsToNextTier(user.points),
            recentTransactions: transactions.slice(0, 10),
            activeRedemptions: redemptions
        };
    }

    close() {
        this.db.close();
    }
}

module.exports = LoyaltyDatabase;