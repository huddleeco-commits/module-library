const express = require('express');
const router = express.Router();
const School = require('../models/School');
const Pool = require('../models/Pool');

// ====================================
// GET ALL SCHOOLS
// ====================================
router.get('/', async (req, res) => {
    try {
        const schools = await School.find({ isActive: true })
            .sort({ name: 1 });
        
        res.json({ 
            success: true, 
            count: schools.length,
            schools 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// GET SCHOOLS BY CONFERENCE
// ====================================
router.get('/conference/:conference', async (req, res) => {
    try {
        const schools = await School.getByConference(req.params.conference);
        
        res.json({ 
            success: true, 
            conference: req.params.conference,
            count: schools.length,
            schools 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// GET ALL CONFERENCES
// ====================================
router.get('/conferences/list', async (req, res) => {
    try {
        const conferences = [
            'SEC', 'Big Ten', 'Big 12', 'ACC', 
            'Pac-12', 'AAC', 'Mountain West', 'Conference USA',
            'MAC', 'Sun Belt', 'Independent'
        ];
        
        // Get school count per conference
        const conferenceData = await Promise.all(
            conferences.map(async (conf) => {
                const count = await School.countDocuments({ 
                    conference: conf, 
                    isActive: true 
                });
                return { name: conf, schoolCount: count };
            })
        );
        
        res.json({ 
            success: true, 
            conferences: conferenceData.filter(c => c.schoolCount > 0)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// GET SINGLE SCHOOL BY ID
// ====================================
router.get('/:schoolId', async (req, res) => {
    try {
        const school = await School.findOne({ schoolId: req.params.schoolId })
            .populate('poolId');
        
        if (!school) {
            return res.status(404).json({ 
                success: false, 
                error: 'School not found' 
            });
        }
        
        res.json({ success: true, school });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// GET SCHOOLS WITH ACTIVE POOLS
// ====================================
router.get('/pools/active', async (req, res) => {
    try {
        const schools = await School.getWithActivePools();
        
        res.json({ 
            success: true, 
            count: schools.length,
            schools 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// UPDATE SCHOOL ODDS (ADMIN)
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
        
        const school = await School.findOne({ schoolId: req.params.schoolId });
        if (!school) {
            return res.status(404).json({ 
                success: false, 
                error: 'School not found' 
            });
        }
        
        // Update school odds
        school.currentOdds = newOdds;
        await school.save();
        
        // If school has active pool, update pool odds too
        if (school.hasActivePool && school.poolId) {
            const pool = await Pool.findById(school.poolId);
            if (pool) {
                await pool.updatePrice(newOdds);
            }
        }
        
        res.json({ 
            success: true, 
            school: {
                schoolId: school.schoolId,
                name: school.name,
                currentOdds: school.currentOdds,
                poolUpdated: school.hasActivePool
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// BULK UPDATE ODDS (ADMIN)
// ====================================
router.post('/bulk/update-odds', async (req, res) => {
    try {
        const { updates } = req.body;
        // updates format: [{ schoolId: 'alabama', odds: '+800' }, ...]
        
        if (!Array.isArray(updates)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Updates must be an array' 
            });
        }
        
        const results = [];
        
        for (const update of updates) {
            try {
                const school = await School.findOne({ schoolId: update.schoolId });
                if (school) {
                    school.currentOdds = update.odds;
                    await school.save();
                    
                    // Update pool if exists
                    if (school.hasActivePool && school.poolId) {
                        const pool = await Pool.findById(school.poolId);
                        if (pool) {
                            await pool.updatePrice(update.odds);
                        }
                    }
                    
                    results.push({ 
                        schoolId: update.schoolId, 
                        success: true 
                    });
                } else {
                    results.push({ 
                        schoolId: update.schoolId, 
                        success: false, 
                        error: 'School not found' 
                    });
                }
            } catch (err) {
                results.push({ 
                    schoolId: update.schoolId, 
                    success: false, 
                    error: err.message 
                });
            }
        }
        
        res.json({ 
            success: true, 
            updated: results.filter(r => r.success).length,
            total: updates.length,
            results 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// SEED SCHOOLS DATABASE (ONE-TIME SETUP)
// ====================================
router.post('/seed', async (req, res) => {
    try {
        // Check if schools already exist
        const existingCount = await School.countDocuments();
        if (existingCount > 0) {
            return res.status(400).json({ 
                success: false, 
                error: `Database already has ${existingCount} schools. Clear first if re-seeding.` 
            });
        }
        
        // Sample FBS schools (you'll add all 133)
        const schools = [
            // SEC
            { schoolId: 'alabama', name: 'Alabama', mascot: 'Crimson Tide', conference: 'SEC', state: 'AL', colors: { primary: '#9E1B32', secondary: '#FFFFFF' } },
            { schoolId: 'georgia', name: 'Georgia', mascot: 'Bulldogs', conference: 'SEC', state: 'GA', colors: { primary: '#BA0C2F', secondary: '#000000' } },
            { schoolId: 'lsu', name: 'LSU', mascot: 'Tigers', conference: 'SEC', state: 'LA', colors: { primary: '#461D7C', secondary: '#FDD023' } },
            { schoolId: 'texas', name: 'Texas', mascot: 'Longhorns', conference: 'SEC', state: 'TX', colors: { primary: '#BF5700', secondary: '#FFFFFF' } },
            { schoolId: 'florida', name: 'Florida', mascot: 'Gators', conference: 'SEC', state: 'FL', colors: { primary: '#0021A5', secondary: '#FA4616' } },
            
            // Big Ten
            { schoolId: 'ohio-state', name: 'Ohio State', mascot: 'Buckeyes', conference: 'Big Ten', state: 'OH', colors: { primary: '#BB0000', secondary: '#666666' } },
            { schoolId: 'michigan', name: 'Michigan', mascot: 'Wolverines', conference: 'Big Ten', state: 'MI', colors: { primary: '#00274C', secondary: '#FFCB05' } },
            { schoolId: 'penn-state', name: 'Penn State', mascot: 'Nittany Lions', conference: 'Big Ten', state: 'PA', colors: { primary: '#041E42', secondary: '#FFFFFF' } },
            
            // Big 12
            { schoolId: 'oklahoma', name: 'Oklahoma', mascot: 'Sooners', conference: 'Big 12', state: 'OK', colors: { primary: '#841617', secondary: '#FDF9D8' } },
            { schoolId: 'texas-tech', name: 'Texas Tech', mascot: 'Red Raiders', conference: 'Big 12', state: 'TX', colors: { primary: '#CC0000', secondary: '#000000' } },
            
            // ACC
            { schoolId: 'clemson', name: 'Clemson', mascot: 'Tigers', conference: 'ACC', state: 'SC', colors: { primary: '#F56600', secondary: '#522D80' } },
            { schoolId: 'miami', name: 'Miami', mascot: 'Hurricanes', conference: 'ACC', state: 'FL', colors: { primary: '#F47321', secondary: '#005030' } },
            
            // Add more schools as needed...
        ];
        
        const inserted = await School.insertMany(schools);
        
        res.json({ 
            success: true, 
            message: `Seeded ${inserted.length} schools`,
            count: inserted.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ====================================
// CLEAR ALL SCHOOLS (ADMIN - USE WITH CAUTION)
// ====================================
router.delete('/clear-all', async (req, res) => {
    try {
        const result = await School.deleteMany({});
        
        res.json({ 
            success: true, 
            message: `Deleted ${result.deletedCount} schools`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;