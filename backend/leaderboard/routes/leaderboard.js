const express = require('express');
const mongoose = require('mongoose');

// Reputation System Routes
module.exports = (platform) => {
    const app = platform.app;
    const UserReputation = require('../models/Reputation');
    const BetAgreement = require('../models/BetAgreement');
    
    // Get user reputation
app.get('/api/reputation/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log('Looking for reputation with userId:', userId);
        
        // First try to find by string userId
        let reputation = await UserReputation.findOne({ userId: userId });
        
        // If not found and userId is a valid ObjectId, try searching by ObjectId
        if (!reputation && mongoose.Types.ObjectId.isValid(userId)) {
            reputation = await UserReputation.findOne({ 
                userId: new mongoose.Types.ObjectId(userId) 
            });
        }
        
        if (!reputation) {
            console.log('No reputation found, creating new one for:', userId);
            // When creating, store as ObjectId if valid, otherwise as string
            const userIdToStore = mongoose.Types.ObjectId.isValid(userId) 
                ? new mongoose.Types.ObjectId(userId) 
                : userId;
                
            reputation = await UserReputation.create({ 
                userId: userIdToStore,
                memberSince: new Date()
            });
        }
        
        const trustLevel = reputation.getTrustLevel();
        
        res.json({
            success: true,
            reputation: {
                ...reputation.toObject(),
                trustLevel
            }
        });
    } catch (error) {
        console.error('Reputation fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
    
    // Create bet challenge
    app.post('/api/bets/create', async (req, res) => {
        try {
            console.log('📝 Bet creation request:', req.body);
            const { challengerId, gameId, amount, terms, betType, challengerPick, gameDetails, paymentMethod } = req.body;
            
            console.log('💾 Creating bet with data:', {
                challengerId,
                gameId,
                amount,
                terms,
                betType,
                challengerPick,
                gameDetails,
                paymentMethods: { challenger: paymentMethod }
            });
            
            // Create bet agreement
            const bet = await BetAgreement.create({
                challengerId,
                gameId,
                amount,
                terms,
                betType,
                challengerPick,
                gameDetails,
                paymentMethods: {
                    challenger: paymentMethod
                },
                expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
            });
            
            // Update user's total bets
            await UserReputation.findOneAndUpdate(
                { userId: challengerId },
                { 
                    $inc: { totalBets: 1 },
                    $set: { lastActive: new Date() }
                },
                { upsert: true }
            );
            
            res.json({
                success: true,
                bet: bet,
                message: 'Bet challenge created! Expires in 2 hours.'
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // Accept bet challenge
    app.post('/api/bets/:betId/accept', async (req, res) => {
        try {
            const { acceptorId, acceptorPick, paymentMethod } = req.body;
            
            const bet = await BetAgreement.findById(req.params.betId);
            
            if (!bet) {
                return res.status(404).json({ success: false, error: 'Bet not found' });
            }
            
            if (bet.status !== 'pending') {
                return res.status(400).json({ success: false, error: 'Bet already accepted or expired' });
            }
            
            // Update bet
            bet.acceptorId = acceptorId;
            bet.acceptorPick = acceptorPick;
            bet.status = 'accepted';
            bet.paymentMethods.acceptor = paymentMethod;
            await bet.save();
            
            // Update acceptor's reputation
            await UserReputation.findOneAndUpdate(
                { userId: acceptorId },
                { 
                    $inc: { totalBets: 1 },
                    $set: { lastActive: new Date() }
                },
                { upsert: true }
            );
            
            res.json({
                success: true,
                bet: bet,
                message: 'Bet accepted! Good luck!'
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // Report bet outcome
    app.post('/api/bets/:betId/complete', async (req, res) => {
        try {
            const { winnerId, loserId, gameResult } = req.body;
            
            const bet = await BetAgreement.findById(req.params.betId);
            
            if (!bet) {
                return res.status(404).json({ success: false, error: 'Bet not found' });
            }
            
            // Update bet outcome
            bet.status = 'completed';
            bet.outcome = {
                winner: winnerId,
                loser: loserId,
                gameResult,
                determinedAt: new Date(),
                paymentRequestedAt: new Date()
            };
            await bet.save();
            
            // Update winner reputation
            await UserReputation.findOneAndUpdate(
                { userId: winnerId },
                { 
                    $inc: { 
                        completedBets: 1,
                        wonBets: 1,
                        totalAmountWon: bet.amount,
                        currentStreak: 1
                    }
                }
            );
            
            // Update loser reputation
            await UserReputation.findOneAndUpdate(
                { userId: loserId },
                { 
                    $inc: { 
                        completedBets: 1,
                        lostBets: 1,
                        totalAmountLost: bet.amount
                    },
                    $set: { currentStreak: -1 }
                }
            );
            
            res.json({
                success: true,
                bet: bet,
                message: 'Game complete! Winner should request payment.'
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // Confirm payment sent
    app.post('/api/bets/:betId/payment-sent', async (req, res) => {
        try {
            const { userId } = req.body;
            
            const bet = await BetAgreement.findById(req.params.betId);
            
            if (!bet || bet.outcome.loser.toString() !== userId) {
                return res.status(403).json({ success: false, error: 'Unauthorized' });
            }
            
            bet.outcome.paymentConfirmedAt = new Date();
            await bet.save();
            
            res.json({
                success: true,
                message: 'Payment marked as sent. Waiting for winner confirmation.'
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // Confirm payment received
    app.post('/api/bets/:betId/payment-received', async (req, res) => {
        try {
            const { userId } = req.body;
            
            const bet = await BetAgreement.findById(req.params.betId);
            
            if (!bet || bet.outcome.winner.toString() !== userId) {
                return res.status(403).json({ success: false, error: 'Unauthorized' });
            }
            
            bet.outcome.paymentReceivedAt = new Date();
            bet.status = 'paid';
            await bet.save();
            
            // Calculate payment time in hours
            const paymentTime = (bet.outcome.paymentReceivedAt - bet.outcome.determinedAt) / (1000 * 60 * 60);
            
            // Update loser's payment reputation
            await UserReputation.findOneAndUpdate(
                { userId: bet.outcome.loser },
                { 
                    $inc: { 
                        paymentScore: paymentTime < 2 ? 5 : paymentTime < 24 ? 0 : -5,
                        reliabilityScore: 2
                    },
                    $set: {
                        avgPaymentTime: paymentTime // This should be averaged properly in production
                    }
                }
            );
            
            // Add fast payer badge if applicable
            if (paymentTime < 1) {
                await UserReputation.findOneAndUpdate(
                    { userId: bet.outcome.loser },
                    { $addToSet: { badges: 'fast-payer' } }
                );
            }
            
            res.json({
                success: true,
                message: 'Payment confirmed! Reputation updated.',
                paymentTime: `${paymentTime.toFixed(1)} hours`
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // Get user's active bets
    app.get('/api/bets/user/:userId', async (req, res) => {
        try {
            const { status } = req.query;
            
            const query = {
                $or: [
                    { challengerId: req.params.userId },
                    { acceptorId: req.params.userId }
                ]
            };
            
            if (status) {
                query.status = status;
            }
            
            const bets = await BetAgreement.find(query)
                .populate('challengerId acceptorId', 'username displayName')
                .sort({ createdAt: -1 })
                .limit(50);
            
            res.json({
                success: true,
                bets
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
};