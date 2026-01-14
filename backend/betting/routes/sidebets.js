// routes/sidebets.routes.js
// API routes for side bets functionality

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

// This will be initialized with the controller instance
let sideBetsController;

// Initialize router with controller
const initializeSideBetsRoutes = (controller) => {
    sideBetsController = controller;
    return router;
};

// ==========================================
// PUBLIC ROUTES (No auth required)
// ==========================================

// Get live lines for current week
router.get('/lines', async (req, res) => {
    await sideBetsController.getLiveLines(req, res);
});

// ==========================================
// AUTHENTICATED ROUTES
// ==========================================

// Create a new side bet challenge
router.post('/challenge', authenticateToken, async (req, res) => {
    await sideBetsController.createChallenge(req, res);
});

// Accept or reject a challenge
router.post('/challenge/respond', authenticateToken, async (req, res) => {
    await sideBetsController.respondToChallenge(req, res);
});

// Get user's bets (active, pending, completed)
router.get('/my-bets', authenticateToken, async (req, res) => {
    await sideBetsController.getUserBets(req, res);
});

// Get open challenges available to join
router.get('/open-challenges', authenticateToken, async (req, res) => {
    await sideBetsController.getOpenChallenges(req, res);
});

// Cancel a pending challenge
router.post('/challenge/cancel', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { betId } = req.body;
        
        const SideBet = require('../models/SideBet');
        const User = require('../models/User');
        
        const bet = await SideBet.findById(betId);
        
        if (!bet) {
            return res.status(404).json({
                success: false,
                error: 'Bet not found'
            });
        }
        
        if (bet.challenger.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to cancel this bet'
            });
        }
        
        if (bet.status !== 'pending' && bet.status !== 'open') {
            return res.status(400).json({
                success: false,
                error: 'Can only cancel pending or open bets'
            });
        }
        
        // Refund the wager
        const user = await User.findById(userId);
        user.wallet.balances.cash += bet.totalWager;
        user.wallet.inEscrow -= bet.totalWager;
        await user.save();
        
        // Update bet status
        bet.status = 'cancelled';
        await bet.save();
        
        res.json({
            success: true,
            message: 'Bet cancelled and refunded'
        });
        
    } catch (error) {
        console.error('Error cancelling bet:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel bet'
        });
    }
});

// Get leaderboard for side bets
router.get('/leaderboard', async (req, res) => {
    try {
        const User = require('../models/User');
        const SideBet = require('../models/SideBet');
        
        // Aggregate side bet stats
        const stats = await SideBet.aggregate([
            {
                $match: {
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$winner',
                    wins: { $sum: 1 },
                    totalWon: { $sum: '$totalWager' }
                }
            },
            {
                $sort: { wins: -1 }
            },
            {
                $limit: 20
            }
        ]);
        
        // Populate user details
        const leaderboard = await Promise.all(stats.map(async stat => {
            const user = await User.findById(stat._id).select('username displayName');
            return {
                user: user ? {
                    username: user.username,
                    displayName: user.displayName
                } : null,
                wins: stat.wins,
                totalWon: stat.totalWon
            };
        }));
        
        res.json({
            success: true,
            leaderboard: leaderboard.filter(entry => entry.user !== null)
        });
        
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch leaderboard'
        });
    }
});

// Get available opponents (friends/recent opponents)
router.get('/opponents', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const User = require('../models/User');
        const SideBet = require('../models/SideBet');
        
        // Get recent opponents
        const recentBets = await SideBet.find({
            $or: [
                { challenger: userId },
                { opponent: userId }
            ],
            status: { $in: ['completed', 'active'] }
        })
        .populate('challenger opponent', 'username displayName degenLevel')
        .limit(20);
        
        const opponents = new Map();
        
        recentBets.forEach(bet => {
            const opponent = bet.challenger._id.toString() === userId ? 
                bet.opponent : bet.challenger;
            
            if (opponent && !opponents.has(opponent._id.toString())) {
                opponents.set(opponent._id.toString(), {
                    id: opponent._id,
                    username: opponent.username,
                    displayName: opponent.displayName,
                    degenLevel: opponent.degenLevel || 'ROOKIE'
                });
            }
        });
        
        // Also get some top players
        const topPlayers = await User.find({
            _id: { $ne: userId },
            'stats.totalBets': { $gt: 0 }
        })
        .select('username displayName degenLevel stats.winRate')
        .sort({ 'stats.winRate': -1 })
        .limit(10);
        
        topPlayers.forEach(player => {
            if (!opponents.has(player._id.toString())) {
                opponents.set(player._id.toString(), {
                    id: player._id,
                    username: player.username,
                    displayName: player.displayName,
                    degenLevel: player.degenLevel || 'ROOKIE',
                    winRate: player.stats?.winRate
                });
            }
        });
        
        res.json({
            success: true,
            opponents: Array.from(opponents.values())
        });
        
    } catch (error) {
        console.error('Error fetching opponents:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch opponents'
        });
    }
});

module.exports = { initializeSideBetsRoutes, router };