// backend/routes/family.js
const express = require('express');
const router = express.Router();

// Cline family test endpoint
router.get('/cline', (req, res) => {
    res.json({
        success: true,
        family: {
            id: 'cline-family-2025',
            name: 'Cline',
            members: [
                { id: 'adam-cline', name: 'Adam', role: 'Dad', age: 42, status: 'online', location: 'Work', avatar: 'A', color: '#6366f1' },
                { id: 'sheila-cline', name: 'Sheila', role: 'Mom', age: 39, status: 'online', location: 'Home', avatar: 'S', color: '#10b981' },
                { id: 'liam-cline', name: 'Liam', role: 'Son', age: 8, status: 'away', location: 'School', avatar: 'L', color: '#f59e0b' },
                { id: 'soraya-cline', name: 'Soraya', role: 'Daughter', age: 6, status: 'away', location: 'School', avatar: 'So', color: '#ec4899' }
            ]
        }
    });
});

// Get family by ID
router.get('/:familyId', (req, res) => {
    res.json({
        success: true,
        family: {
            id: req.params.familyId,
            name: 'Test Family',
            members: []
        }
    });
});

module.exports = router;