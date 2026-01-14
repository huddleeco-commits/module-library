const express = require('express');
const router = express.Router();
const FamCoin = require('../models/FamCoin');

// Get or create wallet
router.get('/wallet/:userId/:familyId', async (req, res) => {
    try {
        const { userId, familyId } = req.params;
        
        let wallet = await FamCoin.findOne({ userId, familyId });
        
        if (!wallet) {
            wallet = await FamCoin.create({
                userId,
                familyId,
                balance: {
                    usd: 0,
                    famCoins: 0,
                    pendingCoins: 0
                }
            });
        }
        
        res.json({ success: true, wallet });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Convert USD to FamCoins
router.post('/convert', async (req, res) => {
    try {
        const { userId, familyId, amount } = req.body;
        
        const wallet = await FamCoin.findOne({ userId, familyId });
        if (!wallet) {
            return res.status(404).json({ success: false, error: 'Wallet not found' });
        }
        
        if (wallet.balance.usd < amount) {
            return res.status(400).json({ success: false, error: 'Insufficient balance' });
        }
        
        const transaction = wallet.convertToFamCoins(amount);
        await wallet.save();
        
        // Generate receipt
        const receipt = {
            receiptId: transaction.receiptId,
            transaction,
            timestamp: new Date(),
            hash: Buffer.from(JSON.stringify(transaction)).toString('base64').substr(0, 32)
        };
        
        res.json({ success: true, transaction, receipt, newBalance: wallet.balance });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Transfer FamCoins between users
router.post('/transfer', async (req, res) => {
    try {
        const { fromUserId, toUserId, familyId, amount } = req.body;
        
        // Get both wallets
        const fromWallet = await FamCoin.findOne({ userId: fromUserId, familyId });
        const toWallet = await FamCoin.findOne({ userId: toUserId, familyId });
        
        if (!fromWallet || !toWallet) {
            return res.status(404).json({ success: false, error: 'Wallet not found' });
        }
        
        if (fromWallet.balance.famCoins < amount) {
            return res.status(400).json({ success: false, error: 'Insufficient FamCoins' });
        }
        
        // Execute transfer
        fromWallet.balance.famCoins -= amount;
        toWallet.balance.famCoins += amount;
        
        const transaction = {
            type: 'transfer',
            amount,
            from: fromUserId,
            to: toUserId,
            status: 'completed',
            receiptId: `RCP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        fromWallet.transactions.push(transaction);
        toWallet.transactions.push(transaction);
        
        await fromWallet.save();
        await toWallet.save();
        
        res.json({ success: true, transaction });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Request redemption
router.post('/redeem', async (req, res) => {
    try {
        const { userId, familyId, amount, method } = req.body;
        
        const wallet = await FamCoin.findOne({ userId, familyId });
        if (!wallet) {
            return res.status(404).json({ success: false, error: 'Wallet not found' });
        }
        
        if (wallet.balance.famCoins < amount) {
            return res.status(400).json({ success: false, error: 'Insufficient FamCoins' });
        }
        
        // Move coins to pending
        wallet.balance.famCoins -= amount;
        wallet.balance.pendingCoins += amount;
        
        const redemption = {
            amount,
            method,
            status: 'pending',
            requestedAt: new Date(),
            receiptId: `RDM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        wallet.redemptions.push(redemption);
        await wallet.save();
        
        // Emit to parents for approval
        const io = req.app.get('io');
        if (io) {
            io.to(`family_${familyId}`).emit('redemption_request', {
                userId,
                redemption,
                childName: req.body.childName || userId
            });
        }
        
        res.json({ success: true, redemption });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Approve redemption (parent only)
router.post('/approve-redemption', async (req, res) => {
    try {
        const { userId, familyId, redemptionId, approved } = req.body;
        
        const wallet = await FamCoin.findOne({ userId, familyId });
        if (!wallet) {
            return res.status(404).json({ success: false, error: 'Wallet not found' });
        }
        
        const redemption = wallet.redemptions.find(r => r.receiptId === redemptionId);
        if (!redemption) {
            return res.status(404).json({ success: false, error: 'Redemption not found' });
        }
        
        if (approved) {
            redemption.status = 'completed';
            redemption.completedAt = new Date();
            wallet.balance.pendingCoins -= redemption.amount;
        } else {
            redemption.status = 'rejected';
            wallet.balance.pendingCoins -= redemption.amount;
            wallet.balance.famCoins += redemption.amount; // Return coins
        }
        
        await wallet.save();
        
        res.json({ success: true, redemption });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get transaction history
router.get('/history/:userId/:familyId', async (req, res) => {
    try {
        const { userId, familyId } = req.params;
        
        const wallet = await FamCoin.findOne({ userId, familyId });
        if (!wallet) {
            return res.status(404).json({ success: false, error: 'Wallet not found' });
        }
        
        res.json({ 
            success: true, 
            transactions: wallet.transactions,
            redemptions: wallet.redemptions 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add FamCoins (for rewards/earnings)
router.post('/add', async (req, res) => {
    try {
        const { userId, familyId, amount, reason } = req.body;
        
        const wallet = await FamCoin.findOne({ userId, familyId });
        if (!wallet) {
            return res.status(404).json({ success: false, error: 'Wallet not found' });
        }
        
        wallet.balance.famCoins += amount;
        
        const transaction = {
            type: 'earned',
            amount,
            status: 'completed',
            metadata: { reason },
            receiptId: `RCP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        wallet.transactions.push(transaction);
        await wallet.save();
        
        res.json({ success: true, transaction, newBalance: wallet.balance });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;