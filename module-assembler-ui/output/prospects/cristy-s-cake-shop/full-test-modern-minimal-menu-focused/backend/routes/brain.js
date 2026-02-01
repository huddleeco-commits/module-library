/**
 * Brain API Routes
 * Single source of truth for business configuration
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const BRAIN_PATH = path.join(__dirname, '..', '..', 'brain.json');

// Helper to read brain
function readBrain() {
  try {
    if (fs.existsSync(BRAIN_PATH)) {
      return JSON.parse(fs.readFileSync(BRAIN_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading brain.json:', e.message);
  }
  return null;
}

// Helper to write brain
function writeBrain(data) {
  try {
    fs.writeFileSync(BRAIN_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('Error writing brain.json:', e.message);
    return false;
  }
}

// GET /api/brain - Get full brain config
router.get('/', (req, res) => {
  const brain = readBrain();
  if (!brain) {
    return res.status(500).json({ success: false, error: 'Could not read brain.json' });
  }
  res.json({ success: true, brain });
});

// GET /api/brain/:section - Get specific section
router.get('/:section', (req, res) => {
  const brain = readBrain();
  if (!brain) {
    return res.status(500).json({ success: false, error: 'Could not read brain.json' });
  }
  const section = brain[req.params.section];
  if (!section) {
    return res.status(404).json({ success: false, error: 'Section not found' });
  }
  res.json({ success: true, [req.params.section]: section });
});

// PUT /api/brain/:section - Update specific section
router.put('/:section', (req, res) => {
  const brain = readBrain();
  if (!brain) {
    return res.status(500).json({ success: false, error: 'Could not read brain.json' });
  }
  
  brain[req.params.section] = { ...brain[req.params.section], ...req.body };
  brain.lastUpdated = new Date().toISOString();
  
  if (writeBrain(brain)) {
    res.json({ success: true, message: 'Updated', [req.params.section]: brain[req.params.section] });
  } else {
    res.status(500).json({ success: false, error: 'Could not save changes' });
  }
});

// PATCH /api/brain - Partial update any field
router.patch('/', (req, res) => {
  const brain = readBrain();
  if (!brain) {
    return res.status(500).json({ success: false, error: 'Could not read brain.json' });
  }
  
  // Deep merge
  const deepMerge = (target, source) => {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  };
  
  deepMerge(brain, req.body);
  brain.lastUpdated = new Date().toISOString();
  
  if (writeBrain(brain)) {
    res.json({ success: true, message: 'Updated', brain });
  } else {
    res.status(500).json({ success: false, error: 'Could not save changes' });
  }
});

module.exports = router;
