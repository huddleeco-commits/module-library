/**
 * Health Check Routes
 * System diagnostics and status
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// GET /api/health - Full health check
router.get('/', async (req, res) => {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {}
  };

  // Check brain.json exists
  const brainPath = path.join(__dirname, '..', '..', 'brain.json');
  checks.services.brain = {
    status: fs.existsSync(brainPath) ? 'healthy' : 'missing',
    path: brainPath
  };

  // Check database connection
  try {
    const db = require('../database/db');
    await db.query('SELECT 1');
    checks.services.database = { status: 'healthy' };
  } catch (e) {
    checks.services.database = { status: 'unhealthy', error: e.message };
  }

  // Check env vars
  const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
  const missingEnv = requiredEnvVars.filter(v => !process.env[v]);
  checks.services.environment = {
    status: missingEnv.length === 0 ? 'healthy' : 'warning',
    missing: missingEnv
  };

  // Check optional services
  checks.services.stripe = {
    status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured'
  };
  checks.services.ai = {
    status: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not_configured'
  };

  // Overall status
  const hasUnhealthy = Object.values(checks.services).some(s => s.status === 'unhealthy');
  checks.status = hasUnhealthy ? 'unhealthy' : 'healthy';

  res.json(checks);
});

// GET /api/health/quick - Quick ping
router.get('/quick', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
