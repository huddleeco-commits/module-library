// C:\Users\huddl\OneDrive\Desktop\Trading-Card-Platform\backend\routes\feed.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Models
const Card = require('../models/Card.model');
const User = require('../models/User.model');
const Platform = require('../models/Platform.model');
const Transaction = require('../models/Transaction.model');

// Middleware
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');
const { validateInput } = require('../middleware/validation.middleware');
const { cardValidator } = require('../validators/card.validator');

// Utils
const { sanitizeInput } = require('../utils/sanitizer');

// Services
const NotificationService = require('../services/notification');
const PriceGuideService = require('../services/price-guide');
const MarketTrendsService = require('../services/market-trends');

// Initialize services
const notificationService = new NotificationService();
const priceGuideService = new PriceGuideService();
const marketTrendsService = new MarketTrendsService();

// ============================================
// PUBLIC FEED ROUTES (No auth required)
// ============================================

/**
 * @route   GET /api/feed
 * @desc    Get main Huddle feed (public view)
 * @access  Public
 */
router.get('/', optionalAuthenticate, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            sort = '-createdAt',
            search,
            minPrice,
            maxPrice,
            graded,
            gradingCompany,
            featured
        } = req.query;
        
        // Build query
        const query = {
            isHuddleListing: true,
            'listing.status': 'active',
            'listing.visibility': 'public'
        };
        
        // Category filter
        if (category && category !== 'all') {
            query['cardDetails.category'] = category;
        }
        
        // Search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'cardDetails.name': { $regex: search, $options: 'i' } },
                { 'cardDetails.set': { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        // Price range
        if (minPrice || maxPrice) {
            query['pricing.price'] = {};
            if (minPrice) query['pricing.price'].$gte = parseFloat(minPrice);
            if (maxPrice) query['pricing.price'].$lte = parseFloat(maxPrice);
        }
        
        // Grading filters
        if (graded !== undefined) {
            query['grading.isGraded'] = graded === 'true';
        }
        
        if (gradingCompany) {
            query['grading.company'] = gradingCompany;
        }
        
        // Featured only
        if (featured === 'true') {
            query['listing.featured.isFeatured'] = true;
            query['listing.featured.featuredUntil'] = { $gt: new Date() };
        }
        
        // Calculate skip
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get cards
        const cards = await Card.find(query)
            .populate('seller', 'username profile.avatar reputation.score reputation.level')
            .sort(sort)
            .limit(parseInt(limit))
            .skip(skip)
            .lean();
        
        // Get total count for pagination
        const total = await Card.countDocuments(query);
        
        // Get trending categories
        const trendingCategories = await Card.aggregate([
            {
                $match: {
                    isHuddleListing: true,
                    'listing.status': 'active',
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: '$cardDetails.category',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$pricing.price' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        
        // Get feed stats
        const feedStats = await Card.aggregate([
            {
                $match: {
                    isHuddleListing: true,
                    'listing.status': 'active'
                }
            },
            {
                $group: {
                    _id: null,
                    totalListings: { $sum: 1 },
                    avgPrice: { $avg: '$pricing.price' },
                    totalValue: { $sum: '$pricing.price' }
                }
            }
        ]);
        
        // Track feed view for analytics
        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, {
                lastActivity: new Date()
            });
        }
        
        res.json({
            success: true,
            feed: {
                cards,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                },
                stats: feedStats[0] || {
                    totalListings: 0,
                    avgPrice: 0,
                    totalValue: 0
                },
                trending: trendingCategories,
                filters: {
                    category,
                    minPrice,
                    maxPrice,
                    graded,
                    gradingCompany
                }
            }
        });
        
    } catch (error) {
        console.error('Feed error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching feed'
        });
    }
});

/**
 * @route   GET /api/feed/featured
 * @desc    Get featured cards for homepage
 * @access  Public
 */
router.get('/featured', async (req, res) => {
    try {
        const featured = await Card.find({
            isHuddleListing: true,
            'listing.status': 'active',
            'listing.featured.isFeatured': true,
            'listing.featured.featuredUntil': { $gt: new Date() }
        })
        .populate('seller', 'username profile.avatar reputation.level')
        .sort('-listing.featured.featuredTier -createdAt')
        .limit(12)
        .lean();
        
        res.json({
            success: true,
            featured
        });
        
    } catch (error) {
        console.error('Featured error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured cards'
        });
    }
});

/**
 * @route   GET /api/feed/trending
 * @desc    Get trending cards based on views and engagement
 * @access  Public
 */
router.get('/trending', async (req, res) => {
    try {
        const { timeframe = '24h' } = req.query;
        
        let dateFilter;
        switch (timeframe) {
            case '1h':
                dateFilter = new Date(Date.now() - 60 * 60 * 1000);
                break;
            case '24h':
                dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;
            default:
                dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
        }
        
        const trending = await Card.aggregate([
            {
                $match: {
                    isHuddleListing: true,
                    'listing.status': 'active',
                    updatedAt: { $gte: dateFilter }
                }
            },
            {
                $addFields: {
                    trendingScore: {
                        $add: [
                            { $multiply: ['$analytics.views', 1] },
                            { $multiply: ['$analytics.favorites', 5] },
                            { $multiply: ['$analytics.watchers', 3] },
                            { $multiply: ['$auction.numberOfBids', 10] }
                        ]
                    }
                }
            },
            { $sort: { trendingScore: -1 } },
            { $limit: 20 }
        ]);
        
        // Populate seller info
        await Card.populate(trending, {
            path: 'seller',
            select: 'username profile.avatar reputation.score'
        });
        
        res.json({
            success: true,
            trending,
            timeframe
        });
        
    } catch (error) {
        console.error('Trending error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trending cards'
        });
    }
});

/**
 * @route   GET /api/feed/ending-soon
 * @desc    Get auctions ending soon
 * @access  Public
 */
router.get('/ending-soon', async (req, res) => {
    try {
        const now = new Date();
        const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        const endingSoon = await Card.find({
            isHuddleListing: true,
            'listing.status': 'active',
            'listing.type': { $in: ['auction', 'both'] },
            'listing.endDate': {
                $gte: now,
                $lte: twentyFourHoursLater
            }
        })
        .populate('seller', 'username profile.avatar')
        .sort('listing.endDate')
        .limit(20)
        .lean();
        
        res.json({
            success: true,
            endingSoon
        });
        
    } catch (error) {
        console.error('Ending soon error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ending soon auctions'
        });
    }
});

// ============================================
// AUTHENTICATED FEED ROUTES
// ============================================

/**
 * @route   POST /api/feed/list
 * @desc    List a card on Huddle feed (20 card limit)
 * @access  Private
 */
router.post('/list',
    authenticate,
    validateInput(cardValidator.create),
    async (req, res) => {
        try {
            // Check if user has their own platform
            const userPlatform = await Platform.findOne({ 
                owner: req.user._id,
                'status.isActive': true
            });
            
            if (userPlatform) {
                return res.status(400).json({
                    success: false,
                    message: 'You have your own platform. Please list cards there instead.',
                    platformUrl: userPlatform.url
                });
            }
            
            // Check Huddle feed limits
            const activeListings = await Card.countDocuments({
                seller: req.user._id,
                isHuddleListing: true,
                'listing.status': 'active'
            });
            
            if (activeListings >= 20) {
                return res.status(403).json({
                    success: false,
                    message: 'You have reached the 20 card limit on the Huddle feed.',
                    suggestion: 'Create your own platform for unlimited listings!',
                    currentListings: activeListings,
                    limit: 20
                });
            }
            
            // Check monthly volume cap ($500)
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            
            const monthlyVolume = await Transaction.aggregate([
                {
                    $match: {
                        seller: req.user._id,
                        platform: null, // Huddle feed transactions
                        createdAt: { $gte: startOfMonth },
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalVolume: { $sum: '$amount' }
                    }
                }
            ]);
            
            const currentVolume = monthlyVolume[0]?.totalVolume || 0;
            
            if (currentVolume >= 500) {
                return res.status(403).json({
                    success: false,
                    message: 'You have reached the $500 monthly sales cap on the Huddle feed.',
                    suggestion: 'Create your own platform for unlimited sales with 0% commission!',
                    currentVolume,
                    limit: 500
                });
            }
            
            // Check if approaching volume cap and warn
            if (currentVolume + req.body.pricing.price > 500) {
                return res.status(403).json({
                    success: false,
                    message: 'This listing would exceed your $500 monthly sales cap.',
                    currentVolume,
                    listingPrice: req.body.pricing.price,
                    remaining: 500 - currentVolume
                });
            }
            
            // Sanitize input
            const sanitizedData = sanitizeInput(req.body);
            
            // Get market price for reference
            let marketPrice = null;
            try {
                marketPrice = await priceGuideService.getMarketPrice({
                    name: sanitizedData.cardDetails.name,
                    set: sanitizedData.cardDetails.set,
                    graded: sanitizedData.grading?.isGraded,
                    grade: sanitizedData.grading?.grade
                });
            } catch (err) {
                console.log('Could not fetch market price:', err.message);
            }
            
            // Create card listing
            const card = new Card({
                ...sanitizedData,
                seller: req.user._id,
                isHuddleListing: true,
                platform: null, // No platform for Huddle feed
                
                // Set market price if available
                'pricing.marketPrice': marketPrice,
                
                // Apply 10% commission for Huddle feed
                'fees.platformCommission': {
                    rate: 0.10,
                    amount: sanitizedData.pricing.price * 0.10
                }
            });
            
            await card.save();
            
            // Update user's Huddle limits
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { 'huddleLimits.listingCount': 1 },
                $set: { 'stats.totalListings': activeListings + 1 }
            });
            
            // Send warning if approaching limit
            if (activeListings >= 15 && !req.user.huddleLimits.warningsSent.limitWarning) {
                await notificationService.sendLimitWarning(req.user.email, {
                    type: 'listing',
                    current: activeListings + 1,
                    limit: 20
                });
                
                await User.findByIdAndUpdate(req.user._id, {
                    'huddleLimits.warningsSent.limitWarning': true
                });
            }
            
            // Send volume warning if approaching cap
            if (currentVolume >= 400 && !req.user.huddleLimits.warningsSent.volumeWarning) {
                await notificationService.sendLimitWarning(req.user.email, {
                    type: 'volume',
                    current: currentVolume,
                    limit: 500
                });
                
                await User.findByIdAndUpdate(req.user._id, {
                    'huddleLimits.warningsSent.volumeWarning': true
                });
            }
            
            res.status(201).json({
                success: true,
                message: 'Card listed successfully on Huddle feed',
                card: {
                    id: card._id,
                    title: card.title,
                    price: card.pricing.price,
                    commission: card.fees.platformCommission.amount
                },
                limits: {
                    listingsUsed: activeListings + 1,
                    listingsRemaining: 19 - activeListings,
                    volumeUsed: currentVolume,
                    volumeRemaining: 500 - currentVolume
                }
            });
            
        } catch (error) {
            console.error('List card error:', error);
            res.status(500).json({
                success: false,
                message: 'Error listing card',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
});

/**
 * @route   GET /api/feed/my-listings
 * @desc    Get user's Huddle feed listings
 * @access  Private
 */
router.get('/my-listings', authenticate, async (req, res) => {
    try {
        const { status = 'active' } = req.query;
        
        const listings = await Card.find({
            seller: req.user._id,
            isHuddleListing: true,
            'listing.status': status
        })
        .sort('-createdAt')
        .lean();
        
        // Get monthly volume
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const volumeData = await Transaction.aggregate([
            {
                $match: {
                    seller: req.user._id,
                    platform: null,
                    createdAt: { $gte: startOfMonth },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalVolume: { $sum: '$amount' },
                    totalSales: { $sum: 1 },
                    totalCommission: { $sum: '$fees.platformCommission' }
                }
            }
        ]);
        
        const volume = volumeData[0] || {
            totalVolume: 0,
            totalSales: 0,
            totalCommission: 0
        };
        
        res.json({
            success: true,
            listings,
            limits: {
                listingsUsed: listings.length,
                listingsLimit: 20,
                listingsRemaining: 20 - listings.length,
                volumeUsed: volume.totalVolume,
                volumeLimit: 500,
                volumeRemaining: Math.max(0, 500 - volume.totalVolume),
                totalCommissionPaid: volume.totalCommission
            },
            stats: {
                totalSales: volume.totalSales,
                averagePrice: volume.totalSales > 0 ? 
                    (volume.totalVolume / volume.totalSales).toFixed(2) : 0
            }
        });
        
    } catch (error) {
        console.error('My listings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your listings'
        });
    }
});

/**
 * @route   PUT /api/feed/card/:cardId
 * @desc    Update a Huddle feed listing
 * @access  Private (Owner)
 */
router.put('/card/:cardId',
    authenticate,
    validateInput(cardValidator.update),
    async (req, res) => {
        try {
            const card = await Card.findOne({
                _id: req.params.cardId,
                isHuddleListing: true,
                seller: req.user._id
            });
            
            if (!card) {
                return res.status(404).json({
                    success: false,
                    message: 'Card not found or you do not have permission to edit'
                });
            }
            
            // Don't allow status change to bypass limits
            if (req.body.listing?.status === 'active' && card.listing.status !== 'active') {
                const activeListings = await Card.countDocuments({
                    seller: req.user._id,
                    isHuddleListing: true,
                    'listing.status': 'active',
                    _id: { $ne: card._id }
                });
                
                if (activeListings >= 20) {
                    return res.status(403).json({
                        success: false,
                        message: 'Cannot reactivate - you have reached the 20 card limit'
                    });
                }
            }
            
            // Update allowed fields
            const allowedUpdates = [
                'title', 'description', 'pricing', 'images', 
                'condition', 'listing.status', 'listing.endDate'
            ];
            
            allowedUpdates.forEach(field => {
                if (req.body[field] !== undefined) {
                    if (field.includes('.')) {
                        const [parent, child] = field.split('.');
                        card[parent][child] = req.body[field];
                    } else {
                        card[field] = req.body[field];
                    }
                }
            });
            
            // Recalculate fees if price changed
            if (req.body.pricing?.price) {
                card.fees.platformCommission = {
                    rate: 0.10,
                    amount: req.body.pricing.price * 0.10
                };
            }
            
            await card.save();
            
            res.json({
                success: true,
                message: 'Card updated successfully',
                card
            });
            
        } catch (error) {
            console.error('Update card error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating card'
            });
        }
});

/**
 * @route   DELETE /api/feed/card/:cardId
 * @desc    Remove card from Huddle feed
 * @access  Private (Owner)
 */
router.delete('/card/:cardId', authenticate, async (req, res) => {
    try {
        const card = await Card.findOneAndUpdate(
            {
                _id: req.params.cardId,
                seller: req.user._id,
                isHuddleListing: true
            },
            {
                'listing.status': 'cancelled',
                'listing.endDate': new Date()
            },
            { new: true }
        );
        
        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Card not found or you do not have permission to delete'
            });
        }
        
        // Update user's listing count
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { 'huddleLimits.listingCount': -1 }
        });
        
        res.json({
            success: true,
            message: 'Card removed from Huddle feed'
        });
        
    } catch (error) {
        console.error('Delete card error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing card'
        });
    }
});

/**
 * @route   POST /api/feed/promote-to-platform
 * @desc    Promote user to create their own platform
 * @access  Private
 */
router.post('/promote-to-platform', authenticate, async (req, res) => {
    try {
        // Check if user is hitting limits
        const activeListings = await Card.countDocuments({
            seller: req.user._id,
            isHuddleListing: true,
            'listing.status': 'active'
        });
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const volumeData = await Transaction.aggregate([
            {
                $match: {
                    seller: req.user._id,
                    platform: null,
                    createdAt: { $gte: startOfMonth },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalVolume: { $sum: '$amount' }
                }
            }
        ]);
        
        const currentVolume = volumeData[0]?.totalVolume || 0;
        
        // Calculate potential savings
        const monthlyCommission = currentVolume * 0.10;
        const potentialSavings = {
            essential: monthlyCommission, // Save all commission with free tier
            premium: monthlyCommission - 9.99 - (currentVolume * 0.05), // $9.99/mo + 5% commission
            luxury: monthlyCommission - 49.99 // $49.99/mo + 0% commission
        };
        
        res.json({
            success: true,
            promotion: {
                currentLimits: {
                    listings: `${activeListings}/20`,
                    volume: `$${currentVolume}/$500`,
                    limitReached: activeListings >= 20 || currentVolume >= 500
                },
                currentCosts: {
                    monthlyCommission: monthlyCommission.toFixed(2),
                    commissionRate: '10%'
                },
                platformBenefits: {
                    essential: {
                        price: 'Free',
                        listings: 100,
                        commission: '10%',
                        monthlySavings: potentialSavings.essential.toFixed(2)
                    },
                    premium: {
                        price: '$9.99/month',
                        listings: 1000,
                        commission: '5%',
                        monthlySavings: potentialSavings.premium.toFixed(2),
                        additionalFeatures: ['Analytics', 'Auction House', 'Bulk Upload']
                    },
                    luxury: {
                        price: '$49.99/month',
                        listings: 'Unlimited',
                        commission: '0%',
                        monthlySavings: potentialSavings.luxury.toFixed(2),
                        additionalFeatures: ['AI Pricing', 'Concierge Service', 'Custom Domain', 'API Access']
                    }
                },
                recommendation: currentVolume > 100 ? 
                    (currentVolume > 500 ? 'luxury' : 'premium') : 
                    'essential',
                createPlatformUrl: '/create-platform'
            }
        });
        
    } catch (error) {
        console.error('Promotion error:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating platform benefits'
        });
    }
});

/**
 * @route   GET /api/feed/categories
 * @desc    Get available categories with counts
 * @access  Public
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = await Card.aggregate([
            {
                $match: {
                    isHuddleListing: true,
                    'listing.status': 'active'
                }
            },
            {
                $group: {
                    _id: '$cardDetails.category',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$pricing.price' },
                    minPrice: { $min: '$pricing.price' },
                    maxPrice: { $max: '$pricing.price' }
                }
            },
            {
                $project: {
                    category: '$_id',
                    count: 1,
                    avgPrice: { $round: ['$avgPrice', 2] },
                    minPrice: 1,
                    maxPrice: 1,
                    _id: 0
                }
            },
            { $sort: { count: -1 } }
        ]);
        
        res.json({
            success: true,
            categories
        });
        
    } catch (error) {
        console.error('Categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories'
        });
    }
});

/**
 * @route   GET /api/feed/stats
 * @desc    Get Huddle feed statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
    try {
        const [
            totalStats,
            dailyStats,
            topSellers,
            recentSales
        ] = await Promise.all([
            // Overall stats
            Card.aggregate([
                {
                    $match: {
                        isHuddleListing: true,
                        'listing.status': 'active'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalListings: { $sum: 1 },
                        totalValue: { $sum: '$pricing.price' },
                        avgPrice: { $avg: '$pricing.price' },
                        uniqueSellers: { $addToSet: '$seller' }
                    }
                }
            ]),
            
            // Daily activity
            Card.aggregate([
                {
                    $match: {
                        isHuddleListing: true,
                        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: null,
                        newListings: { $sum: 1 },
                        totalValue: { $sum: '$pricing.price' }
                    }
                }
            ]),
            
            // Top sellers
            Card.aggregate([
                {
                    $match: {
                        isHuddleListing: true,
                        'listing.status': 'active'
                    }
                },
                {
                    $group: {
                        _id: '$seller',
                        listingCount: { $sum: 1 },
                        totalValue: { $sum: '$pricing.price' }
                    }
                },
                { $sort: { listingCount: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'sellerInfo'
                    }
                },
                {
                    $project: {
                        seller: { $arrayElemAt: ['$sellerInfo', 0] },
                        listingCount: 1,
                        totalValue: 1
                    }
                }
            ]),
            
            // Recent sales
            Transaction.find({
                platform: null,
                status: 'completed'
            })
            .sort('-createdAt')
            .limit(5)
            .populate('buyer', 'username')
            .populate('seller', 'username')
            .populate('card', 'title pricing.price')
        ]);
        
        res.json({
            success: true,
            stats: {
                overall: totalStats[0] || {
                    totalListings: 0,
                    totalValue: 0,
                    avgPrice: 0,
                    uniqueSellers: []
                },
                daily: dailyStats[0] || {
                    newListings: 0,
                    totalValue: 0
                },
                topSellers: topSellers.map(s => ({
                    username: s.seller?.username,
                    listingCount: s.listingCount,
                    totalValue: s.totalValue
                })),
                recentSales: recentSales.map(sale => ({
                    card: sale.card?.title,
                    price: sale.amount,
                    buyer: sale.buyer?.username,
                    seller: sale.seller?.username,
                    date: sale.createdAt
                }))
            }
        });
        
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats'
        });
    }
});

module.exports = router;