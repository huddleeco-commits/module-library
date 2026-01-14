const router = require('express').Router();
const Card = require('../models/Card.model');
const Collection = require('../models/Collection.model');
const { authenticate } = require('../middleware/auth.middleware');

// @route   GET /api/collection
// @desc    Get user's collection
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const mongoose = require('mongoose');
        
        // Handle both string and ObjectId formats
        let userId = req.user.id || req.user._id || req.user.userId;
        
        console.log('User ID from token:', userId, 'Type:', typeof userId);
        
        // Convert to ObjectId if it's a string
        if (typeof userId === 'string') {
            userId = new mongoose.Types.ObjectId(userId);
        }
        
        console.log('Looking for cards with seller:', userId);
        
        // Get cards marked as in collection for this user
        const cards = await Card.find({ 
            seller: userId,
            inCollection: true
        })
        .populate('seller', 'username email')
        .sort('-addedDate')
        .lean();
        
        console.log(`Found ${cards.length} cards for user`);
        
        // Format cards for frontend collection manager
const formattedCards = cards.map(card => ({
    ...card,
    // Ensure required fields exist at root level
    _id: card._id,
    title: card.title || card.name || card.cardDetails?.name,
    estimatedValue: card.estimatedValue || card.pricing?.price || 0,
    // Extract both front and back image URLs
    imageUrl: card.images?.[0]?.url || card.images?.[0] || card.imageUrl || '/api/placeholder/250/350',
    backImageUrl: card.images?.[1]?.url || card.images?.[1] || null,
    condition: card.condition || card.condition?.overall || 'near-mint',
    name: card.name || card.cardDetails?.name || 'Unknown Card',
    set: card.set || card.cardDetails?.set || 'Unknown Set',
    category: card.cardDetails?.category || 'sports',
    listed: card.listed || false,
    inCollection: true,
    images: card.images || [],
    grading: card.grading || {}
}));
        
        // Calculate stats
        const stats = {
            totalCards: formattedCards.length,
            totalValue: formattedCards.reduce((sum, card) => 
                sum + (card.estimatedValue || 0), 0),
            uniqueCards: new Set(formattedCards.map(c => c.name)).size,
            gradedCards: formattedCards.filter(c => c.grading?.isGraded).length
        };
        
        res.json({ 
            success: true, 
            collection: formattedCards,
            stats
        });
    } catch (error) {
        console.error('Collection fetch error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// @route   POST /api/collection/add
// @desc    Add card to collection
// @access  Private
router.post('/add', authenticate, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        
        const cardData = {
            ...req.body,
            seller: userId,
            owner: userId,
            inCollection: true,
            listed: req.body.listed || false,
            addedDate: new Date(),
            estimatedValue: req.body.estimatedValue || req.body.pricing?.price || 0,
            inventoryLocation: req.body.inventoryLocation || 'Main Store'
        };
        
        // Ensure listing status is set
        if (!cardData.listing) {
            cardData.listing = {};
        }
        cardData.listing.status = cardData.listed ? 'active' : 'private';
        
        const card = new Card(cardData);
        await card.save();
        
        res.status(201).json({ 
            success: true, 
            card 
        });
    } catch (error) {
        console.error('Add card error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// @route   PUT /api/collection/:id
// @desc    Update card in collection
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
    try {
        const card = await Card.findOne({
            _id: req.params.id,
            seller: req.user.id,
            inCollection: true
        });
        
        if (!card) {
            return res.status(404).json({ 
                success: false, 
                error: 'Card not found in your collection' 
            });
        }
        
        // Update allowed fields
        const allowedUpdates = ['title', 'description', 'condition', 'estimatedValue', 'quantity', 'notes'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                card[field] = req.body[field];
            }
        });
        
        await card.save();
        
        res.json({ 
            success: true, 
            card 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// @route   DELETE /api/collection/:id
// @desc    Remove card from collection
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const card = await Card.findOneAndDelete({
            _id: req.params.id,
            seller: req.user.id,
            inCollection: true
        });
        
        if (!card) {
            return res.status(404).json({ 
                success: false, 
                error: 'Card not found in your collection' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Card removed from collection' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// @route   POST /api/collection/bulk
// @desc    Bulk import cards to collection
// @access  Private
router.post('/bulk', authenticate, async (req, res) => {
    try {
        const { cards } = req.body;
        if (!Array.isArray(cards)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cards array required' 
            });
        }
        
        const created = [];
        const errors = [];
        
        for (let i = 0; i < cards.length; i++) {
            try {
                const cardData = {
                    ...cards[i],
                    seller: req.user.id,
                    owner: req.user.id,
                    inCollection: true,
                    listed: false,
                    addedDate: new Date()
                };
                
                const card = new Card(cardData);
                await card.save();
                created.push(card);
            } catch (err) {
                errors.push({ index: i, error: err.message });
            }
        }
        
        res.json({ 
            success: true, 
            imported: created.length,
            failed: errors.length,
            cards: created,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// @route   GET /api/collection/export
// @desc    Export collection as CSV
// @access  Private
router.get('/export', authenticate, async (req, res) => {
    try {
        const collection = await Card.find({ 
            seller: req.user.id,
            inCollection: true 
        });
        
        const csv = [
            ['Name', 'Set', 'Condition', 'Quantity', 'Value', 'Grade', 'Grading Company'],
            ...collection.map(card => [
                card.cardDetails?.name || card.name || '',
                card.cardDetails?.set || card.set || '',
                card.condition?.overall || card.condition || '',
                card.quantity || 1,
                card.estimatedValue || card.pricing?.price || 0,
                card.grading?.grade || 'Raw',
                card.grading?.company || 'N/A'
            ])
        ].map(row => row.join(',')).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=collection.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// @route   POST /api/collection/move-to-marketplace
// @desc    Move card from collection to marketplace
// @access  Private
router.post('/:id/list', authenticate, async (req, res) => {
    try {
        const { price, acceptOffers, endDate } = req.body;
        
        const card = await Card.findOne({
            _id: req.params.id,
            seller: req.user.id,
            inCollection: true
        });
        
        if (!card) {
            return res.status(404).json({ 
                success: false, 
                error: 'Card not found in your collection' 
            });
        }
        
        // Move to marketplace
        card.inCollection = false;
        card.listed = true;
        card.listing.status = 'active';
        card.listing.startDate = new Date();
        if (endDate) card.listing.endDate = endDate;
        
        if (price) {
            card.pricing.price = price;
        }
        if (acceptOffers !== undefined) {
            card.pricing.acceptOffers = acceptOffers;
        }
        
        await card.save();
        
        res.json({ 
            success: true, 
            message: 'Card listed on marketplace',
            card 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// @route   GET /api/collection/stats
// @desc    Get collection statistics
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
    try {
        const stats = await Card.aggregate([
            {
                $match: {
                    seller: req.user.id,
                    inCollection: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalCards: { $sum: 1 },
                    totalValue: { $sum: { $ifNull: ['$estimatedValue', '$pricing.price'] } },
                    categories: { $addToSet: '$cardDetails.category' },
                    gradedCount: {
                        $sum: { $cond: ['$grading.isGraded', 1, 0] }
                    }
                }
            }
        ]);
        
        const categoryBreakdown = await Card.aggregate([
            {
                $match: {
                    seller: req.user.id,
                    inCollection: true
                }
            },
            {
                $group: {
                    _id: '$cardDetails.category',
                    count: { $sum: 1 },
                    value: { $sum: { $ifNull: ['$estimatedValue', '$pricing.price'] } }
                }
            }
        ]);
        
        res.json({
            success: true,
            stats: stats[0] || { totalCards: 0, totalValue: 0, categories: [], gradedCount: 0 },
            breakdown: categoryBreakdown
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;