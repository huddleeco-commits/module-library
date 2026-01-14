const express = require('express');
const router = express.Router();
const Pool = require('../models/Pool');
const User = require('../models/User');

// ====================================
// GET ALL ACTIVE POOLS
// ====================================
router.get('/active', async (req, res) => {
    try {
        const pools = await Pool.find({ status: 'open' })
            .sort({ totalAmount: -1 })
            .select('-entries'); // Don't send all entries, just stats
        
        res.json({ success: true, pools });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// GET GROUP POOLS FOR A SPECIFIC SCHOOL
// ====================================
router.get('/:schoolId/groups', async (req, res) => {
    const { schoolId } = req.params;
    
    console.log(`📊 Fetching group pools for: ${schoolId}`);
    
    try {
        // Check if school pool exists (but don't fail if it doesn't)
        const schoolPool = await Pool.findOne({ schoolId });
        if (!schoolPool) {
            console.log('⚠️ Pool not in DB, returning demo groups for:', schoolId);
        }
        
        // Generate demo group data (replace with real data when groups feature is built)
        const groups = [
            {
                id: 'alpha-tau-omega',
                type: 'fraternity',
                name: 'Alpha Tau Omega',
                description: `${schoolId} Greek Chapter`,
                members: 127,
                amount: 12700,
                progress: 75,
                achievements: ['🔥', '⭐', '🎯']
            },
            {
                id: 'sigma-chi',
                type: 'fraternity',
                name: 'Sigma Chi',
                description: `${schoolId} Greek Chapter`,
                members: 89,
                amount: 8900,
                progress: 60,
                achievements: ['🔥', '⭐']
            },
            {
                id: 'jester-hall',
                type: 'dorm',
                name: 'Jester Hall',
                description: 'Residence Hall Group',
                members: 234,
                amount: 23400,
                progress: 85,
                achievements: ['🔥', '⭐', '🎯', '🏆']
            },
            {
                id: 'moore-hill',
                type: 'dorm',
                name: 'Moore-Hill Hall',
                description: 'Residence Hall Group',
                members: 156,
                amount: 15600,
                progress: 70,
                achievements: ['🔥', '⭐', '🎯']
            },
            {
                id: 'class-2020',
                type: 'alumni',
                name: 'Class of 2020',
                description: 'Alumni Association',
                members: 67,
                amount: 13400,
                progress: 90,
                achievements: ['🔥', '⭐', '🎯']
            },
            {
                id: 'engineering-alumni',
                type: 'alumni',
                name: 'Engineering Alumni',
                description: 'Engineering Department Alumni',
                members: 45,
                amount: 22500,
                progress: 95,
                achievements: ['🔥', '⭐', '🎯', '🏆', '💎']
            },
            {
                id: 'business-school',
                type: 'other',
                name: 'Business School',
                description: 'Business Students Association',
                members: 78,
                amount: 7800,
                progress: 55,
                achievements: ['🔥']
            },
            {
                id: 'athletics-boosters',
                type: 'other',
                name: 'Athletics Boosters',
                description: 'Athletics Support Group',
                members: 34,
                amount: 17000,
                progress: 80,
                achievements: ['🔥', '⭐', '🎯']
            }
        ];
        
        res.json({
            success: true,
            schoolId,
            groups,
            totalGroups: groups.length,
            totalMembers: groups.reduce((sum, g) => sum + g.members, 0),
            totalAmount: groups.reduce((sum, g) => sum + g.amount, 0)
        });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// JOIN A GROUP
// ====================================
router.post('/:schoolId/groups/join', async (req, res) => {
    const { schoolId } = req.params;
    const { groupName, timestamp } = req.body;
    
    console.log(`👥 User joining group: ${groupName} in ${schoolId}`);
    
    try {
        // Validate
        if (!groupName || !timestamp) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        // Check if school exists
        const school = await Pool.findOne({ schoolId });
        if (!school) {
            return res.status(404).json({
                success: false,
                error: 'School not found'
            });
        }
        
        // TODO: Add actual group membership logic when Group model is created
        
        res.json({
            success: true,
            message: 'Successfully joined group',
            groupName,
            schoolId
        });
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// GET SPECIFIC POOL BY SCHOOL ID
// ====================================
router.get('/:schoolId', async (req, res) => {
    try {
        let pool = await Pool.findOne({ schoolId: req.params.schoolId });
        
        // If pool doesn't exist in database, create demo data
        if (!pool) {
            console.log('⚠️ Pool not found in DB, returning demo data for:', req.params.schoolId);
            
            // Return demo pool data
            const demoPool = {
                schoolId: req.params.schoolId,
                schoolName: req.params.schoolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                conference: 'Demo Conference',
                basePrice: 100,
                currentPrice: 100 + Math.floor(Math.random() * 50),
                openingOdds: '+1200',
                currentOdds: '+' + (Math.floor(Math.random() * 2000) + 500),
                totalAmount: Math.floor(Math.random() * 400000) + 100000,
                totalEntries: Math.floor(Math.random() * 2000) + 500,
                maxEntries: 5000,
                fillPercentage: Math.floor(Math.random() * 80) + 20,
                rewardTiers: {
                    bronze: { min: 50, max: 99, reward: 'Pool Share' },
                    silver: { min: 100, max: 199, reward: 'Pool Share + Merch' },
                    gold: { min: 200, max: 499, reward: 'Pool Share + Travel Package' },
                    platinum: { min: 500, max: 999999, reward: 'Pool Share + VIP Package' }
                },
                status: 'open',
                championship: {
                    qualified: false,
                    won: false
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            return res.json({ success: true, pool: demoPool });
        }
        
        // Pool exists in database, return it
        const poolData = {
            schoolId: pool.schoolId,
            schoolName: pool.schoolName,
            conference: pool.conference,
            basePrice: pool.basePrice,
            currentPrice: pool.currentPrice,
            openingOdds: pool.openingOdds,
            currentOdds: pool.currentOdds,
            totalAmount: pool.totalAmount,
            totalEntries: pool.totalEntries,
            maxEntries: pool.maxEntries,
            fillPercentage: pool.fillPercentage,
            rewardTiers: pool.rewardTiers,
            status: pool.status,
            championship: pool.championship,
            createdAt: pool.createdAt,
            updatedAt: pool.updatedAt
        };
        
        res.json({ success: true, pool: poolData });
    } catch (error) {
        console.error('❌ Error fetching pool:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// CREATE NEW POOL
// ====================================
router.post('/create', async (req, res) => {
    try {
        const { schoolId, schoolName, conference, basePrice, openingOdds } = req.body;
        
        // Check if pool already exists for this school
        const existingPool = await Pool.findOne({ schoolId });
        if (existingPool) {
            return res.status(400).json({ 
                success: false, 
                error: 'Pool already exists for this school' 
            });
        }
        
        // Create new pool
        const pool = await Pool.create({
            schoolId,
            schoolName,
            conference,
            basePrice: basePrice || 100,
            currentPrice: basePrice || 100,
            openingOdds: openingOdds || '+1200',
            currentOdds: openingOdds || '+1200',
            status: 'open'
        });
        
        res.json({ success: true, pool });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// JOIN POOL (BUY-IN)
// ====================================
router.post('/:schoolId/enter', async (req, res) => {
    try {
        const { userId, amount, username } = req.body;
        
        // Find pool
        const pool = await Pool.findOne({ schoolId: req.params.schoolId });
        if (!pool) {
            return res.status(404).json({ 
                success: false, 
                error: 'Pool not found' 
            });
        }
        
        // Check if pool is open
        if (pool.status !== 'open') {
            return res.status(400).json({ 
                success: false, 
                error: 'Pool is not open for entries' 
            });
        }
        
        // Check if pool is full
        if (pool.totalEntries >= pool.maxEntries) {
            return res.status(400).json({ 
                success: false, 
                error: 'Pool is full' 
            });
        }
        
        // Validate entry amount
        if (!amount || amount < 50) {
            return res.status(400).json({ 
                success: false, 
                error: 'Minimum entry amount is $50' 
            });
        }
        
        // Determine tier based on amount
        const tier = determineTier(amount, pool.rewardTiers);
        
        // Create entry object
        const entry = {
            userId,
            username: username || 'Anonymous',
            amount,
            entryPrice: pool.currentPrice,
            oddsAtEntry: pool.currentOdds,
            tier,
            enteredAt: new Date(),
            paymentId: `PAY_${Date.now()}_${userId}`, // Mock payment ID
            status: 'active'
        };
        
        // Add entry to pool using the model method
        await pool.addEntry(entry);
        
        res.json({ 
            success: true, 
            entry: {
                tier,
                amount,
                entryPrice: pool.currentPrice,
                oddsAtEntry: pool.currentOdds,
                reward: pool.rewardTiers[tier].reward
            },
            pool: {
                totalAmount: pool.totalAmount,
                totalEntries: pool.totalEntries,
                fillPercentage: pool.fillPercentage
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// GET POOL ENTRIES (LEADERBOARD)
// ====================================
router.get('/:schoolId/entries', async (req, res) => {
    try {
        const pool = await Pool.findOne({ schoolId: req.params.schoolId })
            .select('entries schoolName');
        
        if (!pool) {
            console.log('⚠️ Pool not found in DB, returning demo entries for:', req.params.schoolId);
            
            // Return demo entries
            const demoEntries = [
                { rank: 1, username: 'AlumniGroup2020', amount: 15000, tier: 'platinum', enteredAt: new Date(), oddsAtEntry: '+1200' },
                { rank: 2, username: 'GreekLifeAlliance', amount: 12500, tier: 'gold', enteredAt: new Date(), oddsAtEntry: '+1250' },
                { rank: 3, username: 'EngineeringStudents', amount: 8200, tier: 'gold', enteredAt: new Date(), oddsAtEntry: '+1300' },
                { rank: 4, username: 'BusinessSchool', amount: 7500, tier: 'silver', enteredAt: new Date(), oddsAtEntry: '+1350' },
                { rank: 5, username: 'AthleticsBoosters', amount: 6800, tier: 'silver', enteredAt: new Date(), oddsAtEntry: '+1400' }
            ];
            
            return res.json({ 
                success: true, 
                schoolName: req.params.schoolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                entries: demoEntries,
                totalEntries: demoEntries.length
            });
        }
        
        // Sort entries by amount (highest first)
        const sortedEntries = pool.entries
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 100) // Limit to top 100
            .map((entry, index) => ({
                rank: index + 1,
                username: entry.username,
                amount: entry.amount,
                tier: entry.tier,
                enteredAt: entry.enteredAt,
                oddsAtEntry: entry.oddsAtEntry
            }));
        
        res.json({ 
            success: true, 
            schoolName: pool.schoolName,
            entries: sortedEntries,
            totalEntries: pool.entries.length
        });
    } catch (error) {
        console.error('❌ Error fetching entries:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// GET USER'S ENTRIES ACROSS ALL POOLS
// ====================================
router.get('/my-entries/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Find all pools where user has entries
        const pools = await Pool.find({ 'entries.userId': userId })
            .select('schoolId schoolName conference entries totalAmount status championship');
        
        // Extract user's entries from each pool
        const userEntries = pools.map(pool => {
            const userEntry = pool.entries.find(e => e.userId.toString() === userId);
            
            return {
                schoolId: pool.schoolId,
                schoolName: pool.schoolName,
                conference: pool.conference,
                amount: userEntry.amount,
                tier: userEntry.tier,
                entryPrice: userEntry.entryPrice,
                oddsAtEntry: userEntry.oddsAtEntry,
                enteredAt: userEntry.enteredAt,
                status: userEntry.status,
                poolStatus: pool.status,
                poolTotalAmount: pool.totalAmount,
                championshipQualified: pool.championship.qualified,
                championshipWon: pool.championship.won
            };
        });
        
        res.json({ 
            success: true, 
            entries: userEntries,
            totalInvested: userEntries.reduce((sum, e) => sum + e.amount, 0)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// UPDATE ODDS (ADMIN/AUTOMATED)
// ====================================
router.post('/:schoolId/update-odds', async (req, res) => {
    try {
        const { newOdds } = req.body;
        
        if (!newOdds || !newOdds.startsWith('+')) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid odds format. Must be like "+1200"' 
            });
        }
        
        const pool = await Pool.findOne({ schoolId: req.params.schoolId });
        if (!pool) {
            return res.status(404).json({ 
                success: false, 
                error: 'Pool not found' 
            });
        }
        
        // Update price using the model method
        await pool.updatePrice(newOdds);
        
        res.json({ 
            success: true, 
            pool: {
                schoolId: pool.schoolId,
                schoolName: pool.schoolName,
                currentOdds: pool.currentOdds,
                currentPrice: pool.currentPrice,
                priceHistory: pool.priceHistory.slice(-10) // Last 10 price changes
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// GET TRENDING POOLS
// ====================================
router.get('/stats/trending', async (req, res) => {
    try {
        // Get pools with most recent activity
        const pools = await Pool.find({ status: 'open' })
            .sort({ updatedAt: -1 })
            .limit(10)
            .select('schoolId schoolName conference totalAmount totalEntries currentOdds currentPrice fillPercentage');
        
        res.json({ success: true, pools });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// HELPER FUNCTION: DETERMINE TIER
// ====================================
function determineTier(amount, tiers) {
    if (amount >= tiers.platinum.min) return 'platinum';
    if (amount >= tiers.gold.min) return 'gold';
    if (amount >= tiers.silver.min) return 'silver';
    return 'bronze';
}

module.exports = router;