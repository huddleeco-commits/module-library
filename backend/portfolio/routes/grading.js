const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');

// Mock grading data structure
let gradingSubmissions = [];
let gradingHistory = [];

// Get grading services and pricing
router.get('/services', async (req, res) => {
    try {
        const services = [
            {
                id: 'psa',
                name: 'PSA',
                logo: '/assets/psa-logo.png',
                basePrice: 20,
                turnaround: '60 days',
                tiers: [
                    { name: 'Regular', price: 20, days: 60 },
                    { name: 'Express', price: 50, days: 30 },
                    { name: 'Super Express', price: 100, days: 10 }
                ]
            },
            {
                id: 'bgs',
                name: 'BGS',
                logo: '/assets/bgs-logo.png',
                basePrice: 15,
                turnaround: '45 days',
                tiers: [
                    { name: 'Standard', price: 15, days: 45 },
                    { name: 'Express', price: 35, days: 20 },
                    { name: 'Premium', price: 75, days: 5 }
                ]
            },
            {
                id: 'sgc',
                name: 'SGC',
                logo: '/assets/sgc-logo.png',
                basePrice: 12,
                turnaround: '30 days',
                tiers: [
                    { name: 'Bulk', price: 12, days: 30 },
                    { name: 'Standard', price: 25, days: 15 },
                    { name: 'Priority', price: 50, days: 7 }
                ]
            }
        ];
        
        res.json({ success: true, services });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user's grading submissions
router.get('/submissions', authenticate, async (req, res) => {
    try {
        const userSubmissions = gradingSubmissions.filter(
            sub => sub.userId === req.user.id
        );
        
        res.json({ 
            success: true, 
            submissions: userSubmissions,
            total: userSubmissions.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new grading submission
router.post('/submit', authenticate, async (req, res) => {
    try {
        const { cards, service, tier, shippingInfo } = req.body;
        
        if (!cards || !cards.length) {
            return res.status(400).json({ 
                success: false, 
                error: 'At least one card is required' 
            });
        }
        
        const submission = {
            id: Date.now().toString(),
            userId: req.user.id,
            cards: cards.map(card => ({
                ...card,
                submissionId: `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                status: 'pending'
            })),
            service,
            tier,
            shippingInfo,
            status: 'pending',
            trackingNumber: null,
            totalCost: cards.length * (tier?.price || 20),
            submittedAt: new Date(),
            estimatedCompletion: new Date(Date.now() + (tier?.days || 30) * 24 * 60 * 60 * 1000)
        };
        
        gradingSubmissions.push(submission);
        
        res.status(201).json({ success: true, submission });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get submission details
router.get('/submission/:id', authenticate, async (req, res) => {
    try {
        const submission = gradingSubmissions.find(
            sub => sub.id === req.params.id && sub.userId === req.user.id
        );
        
        if (!submission) {
            return res.status(404).json({ 
                success: false, 
                error: 'Submission not found' 
            });
        }
        
        res.json({ success: true, submission });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update submission status (admin only - for now just mock)
router.put('/submission/:id/status', authenticate, async (req, res) => {
    try {
        const { status, trackingNumber } = req.body;
        
        const submission = gradingSubmissions.find(
            sub => sub.id === req.params.id
        );
        
        if (!submission) {
            return res.status(404).json({ 
                success: false, 
                error: 'Submission not found' 
            });
        }
        
        submission.status = status;
        if (trackingNumber) submission.trackingNumber = trackingNumber;
        if (status === 'shipped') submission.shippedAt = new Date();
        if (status === 'completed') submission.completedAt = new Date();
        
        res.json({ success: true, submission });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Calculate grading cost estimate
router.post('/estimate', async (req, res) => {
    try {
        const { cardCount, service, tier } = req.body;
        
        const basePrice = tier?.price || 20;
        const bulkDiscount = cardCount >= 50 ? 0.9 : 
                           cardCount >= 20 ? 0.95 : 1;
        
        const subtotal = cardCount * basePrice * bulkDiscount;
        const shipping = 15; // Flat shipping rate
        const insurance = subtotal * 0.02; // 2% insurance
        const total = subtotal + shipping + insurance;
        
        res.json({
            success: true,
            estimate: {
                cardCount,
                pricePerCard: basePrice,
                subtotal: subtotal.toFixed(2),
                shipping: shipping.toFixed(2),
                insurance: insurance.toFixed(2),
                bulkDiscount: ((1 - bulkDiscount) * 100).toFixed(0) + '%',
                total: total.toFixed(2),
                turnaround: tier?.days || 30
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get grading history for a card
router.get('/history/:cardId', async (req, res) => {
    try {
        const history = gradingHistory.filter(
            entry => entry.cardId === req.params.cardId
        );
        
        res.json({ 
            success: true, 
            history,
            hasHistory: history.length > 0
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Track grading shipment
router.get('/track/:trackingNumber', async (req, res) => {
    try {
        const submission = gradingSubmissions.find(
            sub => sub.trackingNumber === req.params.trackingNumber
        );
        
        if (!submission) {
            return res.status(404).json({ 
                success: false, 
                error: 'Tracking number not found' 
            });
        }
        
        // Mock tracking updates
        const trackingUpdates = [
            { date: submission.submittedAt, status: 'Submission created', location: 'Online' },
            { date: submission.shippedAt || null, status: 'Package shipped', location: 'Local Post Office' },
            { date: null, status: 'In transit', location: 'Distribution Center' },
            { date: null, status: 'Arrived at grading facility', location: submission.service.toUpperCase() + ' Facility' },
            { date: submission.completedAt || null, status: 'Grading complete', location: submission.service.toUpperCase() + ' Facility' }
        ].filter(update => update.date !== null);
        
        res.json({ 
            success: true,
            tracking: {
                number: req.params.trackingNumber,
                status: submission.status,
                updates: trackingUpdates,
                estimatedCompletion: submission.estimatedCompletion
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get grading statistics
router.get('/stats', authenticate, async (req, res) => {
    try {
        const userSubmissions = gradingSubmissions.filter(
            sub => sub.userId === req.user.id
        );
        
        const stats = {
            totalSubmissions: userSubmissions.length,
            totalCards: userSubmissions.reduce((sum, sub) => sum + sub.cards.length, 0),
            pending: userSubmissions.filter(sub => sub.status === 'pending').length,
            inProgress: userSubmissions.filter(sub => sub.status === 'shipped').length,
            completed: userSubmissions.filter(sub => sub.status === 'completed').length,
            totalSpent: userSubmissions.reduce((sum, sub) => sum + sub.totalCost, 0),
            averageTurnaround: 30, // Mock average
            preferredService: 'PSA' // Mock preference
        };
        
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;