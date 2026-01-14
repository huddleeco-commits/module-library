const express = require('express');
const router = express.Router();
const FormationAnalyzer = require('../services/FormationAnalyzer');
const PlayerPropsAnalyzer = require('../services/PlayerPropsAnalyzer');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const formationAnalyzer = new FormationAnalyzer();
const propsAnalyzer = new PlayerPropsAnalyzer();

// Middleware to check coins
const checkCoins = (requiredCoins) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'huddle-secret-key');
            const user = await User.findById(decoded.userId);
            
            if (user.degenCoins < requiredCoins) {
                return res.json({
                    success: false,
                    error: 'Insufficient coins',
                    required: requiredCoins,
                    current: user.degenCoins
                });
            }
            
            req.user = user;
            req.requiredCoins = requiredCoins;
            next();
        } catch (error) {
            res.json({ success: false, error: 'Authentication failed' });
        }
    };
};

// Deduct coins helper
async function deductCoins(user, amount) {
    user.degenCoins -= amount;
    await user.save();
}

// Formation matchup analysis (6 coins)
router.post('/formations/matchup', checkCoins(6), async (req, res) => {
    try {
        const { offense, defense } = req.body;
        const analysis = await formationAnalyzer.analyzeFormationMatchup(offense, defense);
        
        await deductCoins(req.user, req.requiredCoins);
        
        res.json({
            success: true,
            analysis,
            coinsRemaining: req.user.degenCoins
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Individual player analysis (3 coins)
router.post('/formations/player', checkCoins(3), async (req, res) => {
    try {
        const { playerData, formation } = req.body;
        const analysis = await formationAnalyzer.analyzePlayerMatchup(playerData, formation);
        
        await deductCoins(req.user, req.requiredCoins);
        
        res.json({
            success: true,
            analysis,
            coinsRemaining: req.user.degenCoins
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Full field analysis (15 coins)
router.post('/formations/full-field', checkCoins(15), async (req, res) => {
    try {
        const { offense, defense, gameData } = req.body;
        const analysis = await formationAnalyzer.analyzeFullField(offense, defense, gameData);
        
        await deductCoins(req.user, req.requiredCoins);
        
        res.json({
            success: true,
            analysis,
            coinsRemaining: req.user.degenCoins
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Quick prop analysis (3 coins)
router.post('/props/quick', checkCoins(3), async (req, res) => {
    try {
        const { playerName, position, propType } = req.body;
        const analysis = await propsAnalyzer.quickPropAnalysis(playerName, position, propType);
        
        await deductCoins(req.user, req.requiredCoins);
        
        res.json({
            success: true,
            analysis,
            coinsRemaining: req.user.degenCoins
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// All props for player (5 coins)
router.post('/props/player', checkCoins(5), async (req, res) => {
    try {
        const { playerName, position, team, opponent, formation } = req.body;
        const props = await propsAnalyzer.getPlayerProps(playerName, position, team, opponent, formation);
        
        await deductCoins(req.user, req.requiredCoins);
        
        res.json({
            success: true,
            props,
            coinsRemaining: req.user.degenCoins
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Parlay builder (8 coins)
router.post('/props/parlay', checkCoins(8), async (req, res) => {
    try {
        const { players, formation } = req.body;
        const parlay = await propsAnalyzer.buildPlayerPropsParlay(players, formation);
        
        await deductCoins(req.user, req.requiredCoins);
        
        res.json({
            success: true,
            parlay,
            coinsRemaining: req.user.degenCoins
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

module.exports = router;